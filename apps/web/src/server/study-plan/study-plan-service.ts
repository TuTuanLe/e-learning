import type {
  DictationMode,
  StudyPlanContent,
  StudyPlanIntake,
  StudyPlanLesson,
  StudyPlanListResponse,
  StudyPlanResponse,
  StudyPlanWeek
} from "@dictation/contracts";
import { Prisma } from "@prisma/client";
import { assertAiPlannerAccess } from "@/server/billing/subscription-service";
import { dictationCollections, type DictationUnit } from "@/server/dictation/dictation.data";
import { ApiError } from "@/server/http-error";
import { prisma } from "@/server/prisma";

const DEFAULT_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const UPDATE_COOLDOWN_MS = 60_000;

type GeneratedLesson = {
  title: string;
  description: string;
  topic: string;
  activities: string[];
  mode: DictationMode;
};

type GeneratedWeek = {
  week: number;
  title: string;
  objective: string;
  milestone: string;
  lessons: GeneratedLesson[];
};

type GeneratedPlan = {
  title: string;
  summary: string;
  durationWeeks: number;
  weeklyMinutes: number;
  strategy: string[];
  weeks: GeneratedWeek[];
};

type LoadedPlan = Prisma.HskStudyPlanGetPayload<{
  include: {
    weeks: {
      include: {
        lessons: true;
      };
    };
  };
}>;

const planInclude = {
  weeks: {
    orderBy: { weekNumber: "asc" as const },
    include: {
      lessons: {
        orderBy: { position: "asc" as const }
      }
    }
  }
} satisfies Prisma.HskStudyPlanInclude;

export const studyPlanService = {
  async list(userId: string): Promise<StudyPlanListResponse> {
    const studyPlans = await prisma.hskStudyPlan.findMany({
      where: { userId },
      orderBy: { hskLevel: "asc" },
      include: planInclude
    });

    return { studyPlans: studyPlans.map(toResponse) };
  },

  async generateOrUpdate(userId: string, body: unknown): Promise<StudyPlanResponse> {
    await assertAiPlannerAccess(userId);
    const intake = parseIntake(body);
    const collection = getHskCollection(intake.hskLevel);
    const existing = await prisma.hskStudyPlan.findUnique({
      where: { userId_hskLevel: { userId, hskLevel: intake.hskLevel } },
      include: planInclude
    });

    if (existing && Date.now() - existing.updatedAt.getTime() < UPDATE_COOLDOWN_MS) {
      throw new ApiError(429, "Hãy đợi một phút trước khi cập nhật lại lộ trình HSK này.");
    }

    validateUpdateCapacity(existing, intake);

    const model = process.env.GROQ_MODEL ?? DEFAULT_MODEL;
    const generated = await generateWithGroq(intake, collection.units, model);
    const saved = existing
      ? await updatePlan(existing, intake, generated, collection.units, model)
      : await createPlan(userId, intake, generated, collection.units, model);

    return toResponse(saved);
  }
};

async function createPlan(
  userId: string,
  intake: StudyPlanIntake,
  generated: GeneratedPlan,
  units: DictationUnit[],
  model: string
): Promise<LoadedPlan> {
  return prisma.hskStudyPlan.create({
    data: {
      userId,
      hskLevel: intake.hskLevel,
      intake,
      title: generated.title,
      summary: generated.summary,
      durationWeeks: generated.durationWeeks,
      weeklyMinutes: generated.weeklyMinutes,
      strategy: generated.strategy,
      model,
      weeks: {
        create: generated.weeks.map((week, weekIndex) => ({
          weekNumber: week.week,
          title: week.title,
          objective: week.objective,
          milestone: week.milestone,
          lessons: {
            create: week.lessons.map((lesson, lessonIndex) => {
              const unit = assignUnit(units, weekIndex, lessonIndex);
              return {
                position: lessonIndex + 1,
                title: lesson.title,
                description: lesson.description,
                topic: lesson.topic,
                activities: lesson.activities,
                collectionId: `hsk-${intake.hskLevel}`,
                unitId: unit.id,
                mode: lesson.mode,
                estimatedMinutes: unit.estimatedMinutes,
                status:
                  weekIndex === 0 && lessonIndex === 0 ? "AVAILABLE" : "LOCKED"
              };
            })
          }
        }))
      }
    },
    include: planInclude
  });
}

async function updatePlan(
  existing: LoadedPlan,
  intake: StudyPlanIntake,
  generated: GeneratedPlan,
  units: DictationUnit[],
  model: string
): Promise<LoadedPlan> {
  await prisma.$transaction(async (transaction) => {
    await transaction.hskStudyPlan.update({
      where: { id: existing.id },
      data: {
        intake,
        title: generated.title,
        summary: generated.summary,
        durationWeeks: generated.durationWeeks,
        weeklyMinutes: generated.weeklyMinutes,
        strategy: generated.strategy,
        model,
        version: { increment: 1 }
      }
    });

    for (const generatedWeek of generated.weeks) {
      const oldWeek = existing.weeks.find(
        (candidate) => candidate.weekNumber === generatedWeek.week
      );
      const week = await transaction.hskStudyPlanWeek.upsert({
        where: {
          studyPlanId_weekNumber: {
            studyPlanId: existing.id,
            weekNumber: generatedWeek.week
          }
        },
        create: {
          studyPlanId: existing.id,
          weekNumber: generatedWeek.week,
          title: generatedWeek.title,
          objective: generatedWeek.objective,
          milestone: generatedWeek.milestone
        },
        update: {
          title: generatedWeek.title,
          objective: generatedWeek.objective,
          milestone: generatedWeek.milestone
        }
      });
      const completedPositions = new Set(
        oldWeek?.lessons
          .filter((lesson) => lesson.status === "COMPLETED")
          .map((lesson) => lesson.position) ?? []
      );

      await transaction.hskStudyPlanLesson.deleteMany({
        where: { weekId: week.id, status: { not: "COMPLETED" } }
      });

      const lessonsToCreate = generatedWeek.lessons.flatMap((lesson, lessonIndex) => {
        const position = lessonIndex + 1;
        if (completedPositions.has(position)) return [];

        const unit = assignUnit(units, generatedWeek.week - 1, lessonIndex);
        return [{
          weekId: week.id,
          position,
          title: lesson.title,
          description: lesson.description,
          topic: lesson.topic,
          activities: lesson.activities,
          collectionId: `hsk-${intake.hskLevel}`,
          unitId: unit.id,
          mode: lesson.mode,
          estimatedMinutes: unit.estimatedMinutes,
          status: "LOCKED" as const
        }];
      });

      if (lessonsToCreate.length > 0) {
        await transaction.hskStudyPlanLesson.createMany({ data: lessonsToCreate });
      }
    }

    await transaction.hskStudyPlanWeek.deleteMany({
      where: {
        studyPlanId: existing.id,
        weekNumber: { gt: generated.durationWeeks },
        lessons: { none: { status: "COMPLETED" } }
      }
    });

    await transaction.hskStudyPlanLesson.updateMany({
      where: {
        week: { studyPlanId: existing.id },
        status: { not: "COMPLETED" }
      },
      data: { status: "LOCKED" }
    });

    const firstIncomplete = await transaction.hskStudyPlanLesson.findFirst({
      where: {
        week: { studyPlanId: existing.id },
        status: { not: "COMPLETED" }
      },
      orderBy: [{ week: { weekNumber: "asc" } }, { position: "asc" }]
    });

    if (firstIncomplete) {
      await transaction.hskStudyPlanLesson.update({
        where: { id: firstIncomplete.id },
        data: { status: "AVAILABLE" }
      });
    }
  });

  const saved = await prisma.hskStudyPlan.findUnique({
    where: { id: existing.id },
    include: planInclude
  });

  if (!saved) throw new ApiError(404, "Không tìm thấy lộ trình vừa cập nhật.");
  return saved;
}

function validateUpdateCapacity(
  existing: LoadedPlan | null,
  intake: StudyPlanIntake
): void {
  if (!existing) return;

  const completed = existing.weeks.flatMap((week) =>
    week.lessons
      .filter((lesson) => lesson.status === "COMPLETED")
      .map((lesson) => ({ week: week.weekNumber, position: lesson.position }))
  );
  const furthestWeek = Math.max(0, ...completed.map((lesson) => lesson.week));
  const furthestPosition = Math.max(
    0,
    ...completed
      .filter((lesson) => lesson.week === furthestWeek)
      .map((lesson) => lesson.position)
  );

  if (intake.durationWeeks < furthestWeek) {
    throw new ApiError(
      409,
      `Bạn đã hoàn thành bài ở tuần ${furthestWeek}. Thời lượng mới không thể ngắn hơn tuần này.`
    );
  }

  if (furthestPosition > intake.lessonsPerWeek) {
    throw new ApiError(
      409,
      `Tuần ${furthestWeek} đã có ${furthestPosition} bài được giữ lại. Hãy chọn ít nhất ${furthestPosition} bài mỗi tuần.`
    );
  }
}

async function generateWithGroq(
  intake: StudyPlanIntake,
  units: DictationUnit[],
  model: string
): Promise<GeneratedPlan> {
  const apiKey = process.env.GROQ_API_KEY;
  const baseUrl = (process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1").replace(/\/$/, "");

  if (!apiKey) throw new ApiError(503, "Groq chưa được cấu hình trên server.");

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia thiết kế giáo trình HSK cho người Việt. Chỉ trả JSON hợp lệ, không markdown. " +
            "Mỗi lesson phải cụ thể, tăng dần độ khó, phù hợp đúng cấp HSK và ưu tiên nghe chép."
        },
        { role: "user", content: buildPrompt(intake, units) }
      ]
    }),
    signal: AbortSignal.timeout(60_000)
  });
  const payload = (await response.json().catch(() => null)) as {
    choices?: Array<{ message?: { content?: string } }>;
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    throw new ApiError(502, payload?.error?.message ?? "Groq không thể tạo lộ trình.");
  }

  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new ApiError(502, "Groq trả về nội dung trống.");

  try {
    return validateGeneratedPlan(JSON.parse(content), intake);
  } catch {
    throw new ApiError(502, "Lộ trình AI trả về không đúng định dạng.");
  }
}

function buildPrompt(intake: StudyPlanIntake, units: DictationUnit[]): string {
  return `Tạo lộ trình riêng cho HSK ${intake.hskLevel}.
- Mục tiêu: ${intake.primaryGoal}
- Lịch học: ${intake.minutesPerDay} phút/ngày, ${intake.daysPerWeek} ngày/tuần
- Thời lượng bắt buộc: ${intake.durationWeeks} tuần
- Số lesson bắt buộc mỗi tuần: ${intake.lessonsPerWeek}
- Ngày mục tiêu: ${intake.targetDate}
- Chủ đề quan tâm: ${intake.interests.join(", ")}
- Điểm yếu: ${intake.weaknesses.join(", ")}
- Nhu cầu thực tế: ${intake.useCase}
- Nội dung dictation hiện có để định hướng: ${units.map((unit) => `${unit.title}: ${unit.description}`).join(" | ")}

Trả đúng JSON:
{
  "title": "string",
  "summary": "string",
  "durationWeeks": ${intake.durationWeeks},
  "weeklyMinutes": number,
  "strategy": ["3-6 chiến lược"],
  "weeks": [{
    "week": number,
    "title": "string",
    "objective": "string",
    "milestone": "string",
    "lessons": [{
      "title": "string",
      "description": "string",
      "topic": "string",
      "activities": ["2-4 hoạt động"],
      "mode": "TYPING hoặc WORD_BANK"
    }]
  }]
}
Phải có đúng ${intake.durationWeeks} weeks và mỗi week đúng ${intake.lessonsPerWeek} lessons.`;
}

function validateGeneratedPlan(value: unknown, intake: StudyPlanIntake): GeneratedPlan {
  if (!isRecord(value)) throw new Error("Invalid plan");
  if (value.durationWeeks !== intake.durationWeeks) throw new Error("Wrong duration");
  if (!Array.isArray(value.weeks) || value.weeks.length !== intake.durationWeeks) {
    throw new Error("Wrong weeks");
  }

  return {
    title: readString(value.title, 160, "title"),
    summary: readString(value.summary, 700, "summary"),
    durationWeeks: intake.durationWeeks,
    weeklyMinutes: readInteger(value.weeklyMinutes, 10, 5000, "weeklyMinutes"),
    strategy: readStringArray(value.strategy, 8, 300, "strategy"),
    weeks: value.weeks.map((rawWeek, weekIndex) => {
      if (!isRecord(rawWeek)) throw new Error("Invalid week");
      if (!Array.isArray(rawWeek.lessons) || rawWeek.lessons.length !== intake.lessonsPerWeek) {
        throw new Error("Wrong lessons");
      }

      return {
        week: weekIndex + 1,
        title: readString(rawWeek.title, 120, "title"),
        objective: readString(rawWeek.objective, 500, "objective"),
        milestone: readString(rawWeek.milestone, 300, "milestone"),
        lessons: rawWeek.lessons.map((rawLesson) => {
          if (!isRecord(rawLesson)) throw new Error("Invalid lesson");
          const mode = rawLesson.mode;
          if (mode !== "TYPING" && mode !== "WORD_BANK") throw new Error("Invalid mode");

          return {
            title: readString(rawLesson.title, 120, "lesson title"),
            description: readString(rawLesson.description, 400, "lesson description"),
            topic: readString(rawLesson.topic, 80, "lesson topic"),
            activities: readStringArray(rawLesson.activities, 6, 180, "activities"),
            mode
          };
        })
      };
    })
  };
}

function parseIntake(body: unknown): StudyPlanIntake {
  if (!isRecord(body)) throw new ApiError(400, "Dữ liệu form không hợp lệ.");
  const targetDate = readString(body.targetDate, 20, "Ngày mục tiêu");
  const targetTime = Date.parse(targetDate);

  if (Number.isNaN(targetTime) || targetTime <= Date.now()) {
    throw new ApiError(400, "Ngày mục tiêu không hợp lệ.");
  }

  return {
    hskLevel: readInteger(body.hskLevel, 1, 6, "Cấp HSK"),
    primaryGoal: readString(body.primaryGoal, 80, "Mục tiêu"),
    minutesPerDay: readInteger(body.minutesPerDay, 10, 180, "Thời gian mỗi ngày"),
    daysPerWeek: readInteger(body.daysPerWeek, 1, 7, "Số ngày mỗi tuần"),
    durationWeeks: readInteger(body.durationWeeks, 2, 16, "Số tuần"),
    lessonsPerWeek: readInteger(body.lessonsPerWeek, 2, 10, "Số bài mỗi tuần"),
    targetDate,
    interests: readStringArray(body.interests, 8, 50, "Chủ đề quan tâm"),
    weaknesses: readStringArray(body.weaknesses, 8, 50, "Điểm yếu"),
    useCase: readString(body.useCase, 800, "Nhu cầu sử dụng")
  };
}

function toResponse(studyPlan: LoadedPlan): StudyPlanResponse {
  const lessons = studyPlan.weeks.flatMap((week) => week.lessons);
  const completedLessons = lessons.filter((lesson) => lesson.status === "COMPLETED").length;
  const nextLessonRecord = lessons.find((lesson) =>
    lesson.status === "AVAILABLE" || lesson.status === "IN_PROGRESS"
  );
  const weeks: StudyPlanWeek[] = studyPlan.weeks.map((week) => {
    const allCompleted =
      week.lessons.length > 0 &&
      week.lessons.every((lesson) => lesson.status === "COMPLETED");
    const active = week.lessons.some((lesson) =>
      lesson.status === "AVAILABLE" || lesson.status === "IN_PROGRESS"
    );

    return {
      id: week.id,
      week: week.weekNumber,
      title: week.title,
      objective: week.objective,
      milestone: week.milestone,
      status: allCompleted ? "COMPLETED" : active ? "ACTIVE" : "LOCKED",
      lessons: week.lessons.map(toLessonResponse)
    };
  });
  const plan: StudyPlanContent = {
    title: studyPlan.title,
    summary: studyPlan.summary,
    durationWeeks: studyPlan.durationWeeks,
    weeklyMinutes: studyPlan.weeklyMinutes,
    strategy: asStringArray(studyPlan.strategy),
    weeks
  };

  return {
    id: studyPlan.id,
    hskLevel: studyPlan.hskLevel,
    intake: studyPlan.intake as unknown as StudyPlanIntake,
    plan,
    model: studyPlan.model,
    version: studyPlan.version,
    completedLessons,
    totalLessons: lessons.length,
    currentWeek:
      studyPlan.weeks.find((week) =>
        week.lessons.some((lesson) =>
          lesson.status === "AVAILABLE" || lesson.status === "IN_PROGRESS"
        )
      )?.weekNumber ?? studyPlan.durationWeeks,
    nextLesson: nextLessonRecord ? toLessonResponse(nextLessonRecord) : null,
    createdAt: studyPlan.createdAt,
    updatedAt: studyPlan.updatedAt
  };
}

function toLessonResponse(
  lesson: LoadedPlan["weeks"][number]["lessons"][number]
): StudyPlanLesson {
  return {
    id: lesson.id,
    position: lesson.position,
    title: lesson.title,
    description: lesson.description,
    topic: lesson.topic,
    activities: asStringArray(lesson.activities),
    collectionId: lesson.collectionId,
    unitId: lesson.unitId,
    mode: lesson.mode,
    estimatedMinutes: lesson.estimatedMinutes,
    status: lesson.status,
    completedAt: lesson.completedAt,
    sessionId: null
  };
}

function assignUnit(units: DictationUnit[], weekIndex: number, lessonIndex: number): DictationUnit {
  const unit = units[(weekIndex + lessonIndex) % units.length];
  if (!unit) throw new ApiError(500, "HSK này chưa có nội dung dictation.");
  return unit;
}

function getHskCollection(level: number) {
  const collection = dictationCollections.find((item) => item.hskLevel === level);
  if (!collection) throw new ApiError(404, `Không tìm thấy nội dung HSK ${level}.`);
  return collection;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readString(value: unknown, max: number, label: string): string {
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new ApiError(400, `${label} không hợp lệ.`);
  }
  return value.trim();
}

function readInteger(value: unknown, min: number, max: number, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new ApiError(400, `${label} không hợp lệ.`);
  }
  return value;
}

function readStringArray(
  value: unknown,
  maxItems: number,
  maxLength: number,
  label: string
): string[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > maxItems) {
    throw new ApiError(400, `${label} không hợp lệ.`);
  }
  return value.map((item) => readString(item, maxLength, label));
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
