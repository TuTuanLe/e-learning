import type {
  DictationAnswerResponse,
  DictationCatalogResponse,
  DictationCurrentQuestion,
  DictationMode,
  DictationSessionResponse,
} from "@dictation/contracts";
import { Prisma, type DictationSession } from "@prisma/client";
import { ApiError } from "@/server/http-error";
import { prisma } from "@/server/prisma";
import {
  assertAiPlannerAccess,
  assertUnitAccess,
} from "@/server/billing/subscription-service";
import {
  dictationCollections,
  findDictationCollection,
  findDictationQuestion,
  findDictationUnit,
  type DictationQuestion,
} from "./dictation.data";

type StudyPlanContext = {
  hskLevel: number;
  lessonId: string;
  lessonTitle: string;
};

type ParsedCreateSession = {
  collectionId: string;
  unitId: string;
  mode: DictationMode;
};

type ParsedSubmitAnswer = {
  questionId: string;
  answer: string;
  elapsedMs?: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseBoundedString(
  body: Record<string, unknown>,
  key: string,
  maximumLength: number,
  allowEmpty = false,
): string {
  const value = body[key];

  if (typeof value !== "string") {
    throw new ApiError(400, `${key} must be a string.`);
  }

  const trimmed = value.trim();

  if ((!allowEmpty && trimmed.length === 0) || trimmed.length > maximumLength) {
    throw new ApiError(400, `${key} is invalid.`);
  }

  return trimmed;
}

function parseCreateSession(body: unknown): ParsedCreateSession {
  if (!isRecord(body)) {
    throw new ApiError(400, "Invalid request body.");
  }

  const mode = body.mode;

  if (mode !== "TYPING" && mode !== "WORD_BANK") {
    throw new ApiError(400, "mode must be TYPING or WORD_BANK.");
  }

  return {
    collectionId: parseBoundedString(body, "collectionId", 80),
    unitId: parseBoundedString(body, "unitId", 80),
    mode,
  };
}

function parseSubmitAnswer(body: unknown): ParsedSubmitAnswer {
  if (!isRecord(body)) {
    throw new ApiError(400, "Invalid request body.");
  }

  const elapsedMs = body.elapsedMs;

  if (
    elapsedMs !== undefined &&
    (typeof elapsedMs !== "number" ||
      !Number.isInteger(elapsedMs) ||
      elapsedMs < 0 ||
      elapsedMs > 3_600_000)
  ) {
    throw new ApiError(
      400,
      "elapsedMs must be an integer between 0 and 3600000.",
    );
  }

  return {
    questionId: parseBoundedString(body, "questionId", 120),
    answer: parseBoundedString(body, "answer", 500, true),
    ...(elapsedMs === undefined ? {} : { elapsedMs }),
  };
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
}

function hashText(value: string): number {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.codePointAt(0)!) | 0;
  }

  return hash;
}

function buildWordBank(question: DictationQuestion, seed: string): string[] {
  return question.segments
    .map((segment, index) => ({
      segment,
      rank: hashText(`${seed}:${question.id}:${index}:${segment}`),
    }))
    .sort((left, right) => left.rank - right.rank)
    .map(({ segment }) => segment);
}

function normalizeHanzi(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s，。！？、,.!?;:：；'"“”‘’()（）[\]{}-]/gu, "");
}

function normalizePinyin(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Mark}/gu, "")
    .toLowerCase()
    .replace(/[1-5]/g, "")
    .replace(/[^a-z]/g, "");
}

async function findOwnedSession(
  userId: string,
  id: string,
): Promise<DictationSession> {
  const session = await prisma.dictationSession.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!session) {
    throw new ApiError(404, "Không tìm thấy session dictation.");
  }

  return session;
}

function toSessionResponse(
  session: DictationSession,
  studyPlan: StudyPlanContext | null = null,
): DictationSessionResponse {
  const collection = findDictationCollection(session.collectionId);
  const unit = findDictationUnit(session.collectionId, session.unitId);

  if (!collection || !unit) {
    throw new ApiError(404, "Nội dung của session này không còn tồn tại.");
  }

  const questionOrder = asStringArray(session.questionOrder);
  const completedQuestionIds = asStringArray(session.completedQuestionIds);
  const questionId =
    session.status === "ACTIVE"
      ? questionOrder[session.currentIndex]
      : undefined;
  const question = questionId ? findDictationQuestion(questionId) : undefined;
  const currentQuestion: DictationCurrentQuestion | null = question
    ? {
        id: question.id,
        promptVi: question.promptVi,
        audioText: question.hanzi,
        wordBank: buildWordBank(question, session.id),
        targetSeconds: question.targetSeconds,
        hint: `Câu có ${Array.from(question.hanzi).filter((char) => /[\u3400-\u9fff]/u.test(char)).length} chữ Hán, bắt đầu bằng “${question.hanzi[0] ?? ""}”.`,
      }
    : null;

  return {
    id: session.id,
    collection: {
      id: collection.id,
      title: collection.title,
      hskLevel: collection.hskLevel,
    },
    unit: {
      id: unit.id,
      title: unit.title,
    },
    mode: session.mode,
    status: session.status,
    currentQuestion,
    currentIndex: session.currentIndex,
    queueLength: questionOrder.length,
    questionCount: unit.questions.length,
    completedQuestionCount: completedQuestionIds.length,
    exp: session.exp,
    combo: session.combo,
    maxCombo: session.maxCombo,
    correctCount: session.correctCount,
    mistakeCount: session.mistakeCount,
    studyPlan,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    completedAt: session.completedAt,
  };
}

export const dictationService = {
  getCatalog(): DictationCatalogResponse {
    return {
      collections: dictationCollections.map((collection) => ({
        id: collection.id,
        title: collection.title,
        description: collection.description,
        hskLevel: collection.hskLevel,
        coverImage: collection.coverImage,
        units: collection.units.map((unit) => ({
          id: unit.id,
          title: unit.title,
          description: unit.description,
          topic: unit.topic ?? getDefaultTopic(unit.id),
          questionCount: unit.questions.length,
          estimatedMinutes: unit.estimatedMinutes,
        })),
      })),
    };
  },

  async listSessions(
    userId: string,
  ): Promise<{ sessions: DictationSessionResponse[] }> {
    const sessions = await prisma.dictationSession.findMany({
      where: { userId },
      include: {
        studyPlanLesson: {
          select: {
            id: true,
            title: true,
            week: {
              select: {
                studyPlan: { select: { hskLevel: true } },
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });

    return {
      sessions: sessions.map((session) =>
        toSessionResponse(session, toStudyPlanContext(session.studyPlanLesson)),
      ),
    };
  },

  async createSession(
    userId: string,
    body: unknown,
  ): Promise<DictationSessionResponse> {
    const parsed = parseCreateSession(body);

    const collection = findDictationCollection(parsed.collectionId);
    const unit = findDictationUnit(parsed.collectionId, parsed.unitId);

    if (!collection || !unit) {
      throw new ApiError(404, "Không tìm thấy bài dictation đã chọn.");
    }

    await assertUnitAccess(userId, unit.id);

    const session = await prisma.dictationSession.create({
      data: {
        userId,
        collectionId: collection.id,
        unitId: unit.id,
        mode: parsed.mode,
        questionOrder: shuffle(unit.questions.map((question) => question.id)),
        completedQuestionIds: [],
      },
    });

    return toSessionResponse(session);
  },

  async createStudyPlanSession(
    userId: string,
    hskLevel: number,
    lessonId: string,
  ): Promise<DictationSessionResponse> {
    await assertAiPlannerAccess(userId);
    const lesson = await prisma.hskStudyPlanLesson.findFirst({
      where: {
        id: lessonId,
        week: { studyPlan: { userId, hskLevel } },
      },
      include: {
        week: {
          select: {
            studyPlan: { select: { hskLevel: true } },
          },
        },
        sessions: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!lesson)
      throw new ApiError(404, "Không tìm thấy bài học trong lộ trình.");
    if (lesson.status === "LOCKED") {
      throw new ApiError(
        409,
        "Hãy hoàn thành bài học trước đó để mở khóa bài này.",
      );
    }

    const activeSession = lesson.sessions[0];
    const studyPlan = {
      hskLevel: lesson.week.studyPlan.hskLevel,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
    };
    if (activeSession) return toSessionResponse(activeSession, studyPlan);

    const unit = findDictationUnit(lesson.collectionId, lesson.unitId);
    if (!unit)
      throw new ApiError(
        404,
        "Nội dung dictation của bài học không còn tồn tại.",
      );

    let session: DictationSession;

    try {
      session = await prisma.$transaction(async (transaction) => {
        const created = await transaction.dictationSession.create({
          data: {
            userId,
            collectionId: lesson.collectionId,
            unitId: lesson.unitId,
            mode: lesson.mode,
            questionOrder: shuffle(
              unit.questions.map((question) => question.id),
            ),
            completedQuestionIds: [],
            studyPlanLessonId: lesson.id,
          },
        });

        if (lesson.status !== "COMPLETED") {
          await transaction.hskStudyPlanLesson.update({
            where: { id: lesson.id },
            data: { status: "IN_PROGRESS" },
          });
        }

        return created;
      });
    } catch (error) {
      if (
        !(error instanceof Prisma.PrismaClientKnownRequestError) ||
        error.code !== "P2002"
      ) {
        throw error;
      }

      const concurrentSession = await prisma.dictationSession.findFirst({
        where: {
          userId,
          studyPlanLessonId: lesson.id,
          status: "ACTIVE",
        },
        orderBy: { createdAt: "desc" },
      });

      if (!concurrentSession) throw error;
      session = concurrentSession;
    }

    return toSessionResponse(session, studyPlan);
  },

  async getSession(
    userId: string,
    id: string,
  ): Promise<DictationSessionResponse> {
    const session = await findOwnedSession(userId, id);

    return toSessionResponse(
      session,
      await getStudyPlanContext(session.studyPlanLessonId),
    );
  },

  async submitAnswer(
    userId: string,
    id: string,
    body: unknown,
  ): Promise<DictationAnswerResponse> {
    const parsed = parseSubmitAnswer(body);
    const session = await findOwnedSession(userId, id);

    if (session.status === "COMPLETED") {
      throw new ApiError(400, "Session này đã hoàn thành.");
    }

    const unit = findDictationUnit(session.collectionId, session.unitId);
    const questionOrder = asStringArray(session.questionOrder);
    const currentQuestionId = questionOrder[session.currentIndex];
    const question = currentQuestionId
      ? findDictationQuestion(currentQuestionId)
      : undefined;

    if (!unit || !question || question.id !== parsed.questionId) {
      throw new ApiError(400, "Câu hỏi không còn khớp với session hiện tại.");
    }

    const submittedAnswer = parsed.answer;
    const correct =
      normalizeHanzi(submittedAnswer) === normalizeHanzi(question.hanzi) ||
      normalizePinyin(submittedAnswer) === normalizePinyin(question.pinyin);
    const elapsedMs = parsed.elapsedMs ?? question.targetSeconds * 1000;
    const rawExpDelta = correct
      ? 10 + (elapsedMs < question.targetSeconds * 500 ? 5 : 0)
      : -2;
    const nextExp = Math.max(0, session.exp + rawExpDelta);
    const expDelta = nextExp - session.exp;
    const nextCombo = correct ? session.combo + 1 : 0;
    const completedQuestionIds = asStringArray(session.completedQuestionIds);

    if (correct && !completedQuestionIds.includes(question.id)) {
      completedQuestionIds.push(question.id);
    }

    const completed = completedQuestionIds.length >= unit.questions.length;
    const nextSession = await prisma.$transaction(async (transaction) => {
      await transaction.dictationAttempt.create({
        data: {
          sessionId: session.id,
          questionId: question.id,
          answer: submittedAnswer,
          isCorrect: correct,
          elapsedMs,
          expDelta,
        },
      });

      const updatedSession = await transaction.dictationSession.update({
        where: { id: session.id },
        data: {
          questionOrder,
          completedQuestionIds,
          currentIndex: session.currentIndex + (correct ? 1 : 0),
          exp: nextExp,
          combo: nextCombo,
          maxCombo: Math.max(session.maxCombo, nextCombo),
          correctCount: session.correctCount + (correct ? 1 : 0),
          mistakeCount: session.mistakeCount + (correct ? 0 : 1),
          status: completed ? "COMPLETED" : "ACTIVE",
          completedAt: completed ? new Date() : null,
        },
      });

      if (completed && session.studyPlanLessonId) {
        await completeStudyPlanLesson(transaction, session.studyPlanLessonId);
      }

      return updatedSession;
    });

    return {
      correct,
      expDelta,
      answer: {
        hanzi: question.hanzi,
        pinyin: question.pinyin,
        meaningVi: question.promptVi,
      },
      session: toSessionResponse(
        nextSession,
        await getStudyPlanContext(nextSession.studyPlanLessonId),
      ),
    };
  },
};

function toStudyPlanContext(
  lesson: {
    id: string;
    title: string;
    week: { studyPlan: { hskLevel: number } };
  } | null,
): StudyPlanContext | null {
  return lesson
    ? {
        hskLevel: lesson.week.studyPlan.hskLevel,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
      }
    : null;
}

async function getStudyPlanContext(
  lessonId: string | null,
): Promise<StudyPlanContext | null> {
  if (!lessonId) return null;

  const lesson = await prisma.hskStudyPlanLesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      week: {
        select: {
          studyPlan: { select: { hskLevel: true } },
        },
      },
    },
  });

  return toStudyPlanContext(lesson);
}

async function completeStudyPlanLesson(
  transaction: Prisma.TransactionClient,
  lessonId: string,
): Promise<void> {
  const lesson = await transaction.hskStudyPlanLesson.findUnique({
    where: { id: lessonId },
    include: { week: true },
  });

  if (!lesson || lesson.status === "COMPLETED") return;

  await transaction.hskStudyPlanLesson.update({
    where: { id: lesson.id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });

  const remaining = await transaction.hskStudyPlanLesson.findMany({
    where: {
      week: { studyPlanId: lesson.week.studyPlanId },
      id: { not: lesson.id },
      status: { not: "COMPLETED" },
    },
    include: { week: { select: { weekNumber: true } } },
  });
  const nextLesson = remaining.sort(
    (left, right) =>
      left.week.weekNumber - right.week.weekNumber ||
      left.position - right.position,
  )[0];

  if (nextLesson) {
    await transaction.hskStudyPlanLesson.update({
      where: { id: nextLesson.id },
      data: { status: "AVAILABLE" },
    });
  }
}

function getDefaultTopic(unitId: string): string {
  if (unitId.includes("greetings") || unitId.includes("communication"))
    return "Giao tiếp";
  if (
    unitId.includes("daily") ||
    unitId.includes("life") ||
    unitId.includes("growth")
  )
    return "Đời sống";
  if (unitId.includes("family")) return "Gia đình";
  if (unitId.includes("time")) return "Lịch trình";
  if (unitId.includes("study") || unitId.includes("thinking")) return "Học tập";
  if (unitId.includes("travel")) return "Du lịch";
  if (unitId.includes("work")) return "Công việc";
  if (unitId.includes("society")) return "Xã hội";
  return "Tổng hợp";
}
