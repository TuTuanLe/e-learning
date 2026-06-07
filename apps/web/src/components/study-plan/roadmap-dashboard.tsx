"use client";

import type {
  StudyPlanLesson,
  StudyPlanResponse,
  StudyPlanWeek
} from "@dictation/contracts";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  Keyboard,
  LockKeyhole,
  Play,
  Puzzle,
  RefreshCw,
  Target
} from "lucide-react";

type RoadmapDashboardProps = {
  studyPlan: StudyPlanResponse;
  startingLessonId: string | null;
  onStartLesson: (lesson: StudyPlanLesson) => Promise<void>;
  onUpdate: () => void;
};

export function RoadmapDashboard({
  studyPlan,
  startingLessonId,
  onStartLesson,
  onUpdate
}: RoadmapDashboardProps) {
  const progress = studyPlan.totalLessons
    ? Math.round((studyPlan.completedLessons / studyPlan.totalLessons) * 100)
    : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <section className="rounded-2xl border border-hairline bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-primary">
                HSK {studyPlan.hskLevel} · Tuần {studyPlan.currentWeek}/{studyPlan.plan.durationWeeks}
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-[-0.8px]">
                {studyPlan.plan.title}
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
                {studyPlan.plan.summary}
              </p>
            </div>
            <span className="rounded-lg bg-canvas-soft px-3 py-2 text-sm font-medium">
              {studyPlan.completedLessons}/{studyPlan.totalLessons} bài
            </span>
          </div>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-canvas-soft">
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </section>

        {studyPlan.nextLesson ? (
          <NextLesson
            lesson={studyPlan.nextLesson}
            loading={startingLessonId === studyPlan.nextLesson.id}
            onStart={onStartLesson}
          />
        ) : (
          <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-7">
            <CheckCircle2 className="size-7 text-emerald-700" />
            <h2 className="mt-4 text-2xl font-bold">Bạn đã hoàn thành lộ trình này.</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-900/75">
              Có thể cập nhật lộ trình để thêm mục tiêu mới mà vẫn giữ toàn bộ bài đã hoàn thành.
            </p>
          </section>
        )}

        <section className="rounded-2xl border border-hairline bg-white p-5 sm:p-7">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.5px]">Các tuần học</h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Hoàn thành lần lượt từng bài để mở khóa tuần tiếp theo.
            </p>
          </div>
          <div className="mt-7">
            {studyPlan.plan.weeks.map((week, index) => (
              <WeekTimeline
                key={week.id}
                week={week}
                last={index === studyPlan.plan.weeks.length - 1}
                startingLessonId={startingLessonId}
                onStartLesson={onStartLesson}
              />
            ))}
          </div>
        </section>
      </div>

      <aside className="space-y-5">
        <section className="rounded-2xl border border-hairline bg-white p-5">
          <h2 className="font-bold">Tổng quan lộ trình</h2>
          <div className="mt-5 space-y-4">
            <OverviewRow
              icon={CalendarDays}
              label="Ngày mục tiêu"
              value={new Date(studyPlan.intake.targetDate).toLocaleDateString("vi-VN")}
            />
            <OverviewRow
              icon={Clock3}
              label="Nhịp học"
              value={`${studyPlan.intake.minutesPerDay} phút · ${studyPlan.intake.daysPerWeek} ngày/tuần`}
            />
            <OverviewRow
              icon={Target}
              label="Mục tiêu"
              value={studyPlan.intake.primaryGoal}
            />
          </div>
          <div className="my-5 border-t border-hairline" />
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
            Trọng tâm
          </p>
          <p className="mt-2 text-sm leading-6">{studyPlan.intake.interests.join(" · ")}</p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
            Cần cải thiện
          </p>
          <p className="mt-2 text-sm leading-6">{studyPlan.intake.weaknesses.join(" · ")}</p>
        </section>

        <section className="rounded-2xl border border-hairline bg-white p-5">
          <button
            className="focus-ring inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-hairline font-medium hover:bg-canvas-soft"
            type="button"
            onClick={onUpdate}
          >
            <RefreshCw className="size-4" />
            Cập nhật lộ trình
          </button>
          <p className="mt-3 text-center text-xs leading-5 text-ink-muted">
            Bài đã hoàn thành sẽ không bị thay đổi.
          </p>
        </section>
      </aside>
    </div>
  );
}

function NextLesson({
  lesson,
  loading,
  onStart
}: {
  lesson: StudyPlanLesson;
  loading: boolean;
  onStart: (lesson: StudyPlanLesson) => Promise<void>;
}) {
  const ModeIcon = lesson.mode === "TYPING" ? Keyboard : Puzzle;

  return (
    <section className="notion-grid overflow-hidden rounded-2xl bg-secondary p-6 text-white sm:p-8">
      <p className="text-sm font-semibold text-white/65">Bài tiếp theo</p>
      <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-[-0.8px]">{lesson.title}</h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/72">{lesson.description}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-white/70">
            <span className="inline-flex items-center gap-2">
              <ModeIcon className="size-4" />
              {lesson.mode === "TYPING" ? "Typing" : "Word bank"}
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="size-4" />
              {lesson.estimatedMinutes} phút
            </span>
          </div>
        </div>
        <button
          className="focus-ring inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-secondary hover:bg-white/90 disabled:opacity-60"
          disabled={loading}
          onClick={() => void onStart(lesson)}
        >
          <Play className="size-4 fill-current" />
          {loading ? "Đang mở..." : lesson.status === "IN_PROGRESS" ? "Tiếp tục bài học" : "Bắt đầu bài học"}
        </button>
      </div>
    </section>
  );
}

function WeekTimeline({
  week,
  last,
  startingLessonId,
  onStartLesson
}: {
  week: StudyPlanWeek;
  last: boolean;
  startingLessonId: string | null;
  onStartLesson: (lesson: StudyPlanLesson) => Promise<void>;
}) {
  const completedCount = week.lessons.filter((lesson) => lesson.status === "COMPLETED").length;
  const WeekIcon =
    week.status === "COMPLETED" ? Check : week.status === "LOCKED" ? LockKeyhole : Circle;

  return (
    <div className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-3">
      {!last ? (
        <span className="absolute bottom-0 left-[19px] top-10 w-px bg-hairline" />
      ) : null}
      <span
        className={`relative z-10 flex size-10 items-center justify-center rounded-full border ${
          week.status === "COMPLETED"
            ? "border-emerald-600 bg-emerald-600 text-white"
            : week.status === "ACTIVE"
              ? "border-primary bg-blue-50 text-primary"
              : "border-hairline bg-canvas-soft text-ink-faint"
        }`}
      >
        <WeekIcon className="size-4" />
      </span>
      <div className={last ? "pb-0" : "pb-7"}>
        <div className="flex flex-wrap items-start justify-between gap-3 pt-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
              Tuần {week.week}
            </p>
            <h3 className="mt-1 font-bold">{week.title}</h3>
            <p className="mt-1 text-sm leading-6 text-ink-muted">{week.objective}</p>
          </div>
          <span className="text-xs text-ink-muted">
            {completedCount}/{week.lessons.length} bài
          </span>
        </div>

        {week.status !== "LOCKED" ? (
          <div className="mt-4 divide-y divide-hairline overflow-hidden rounded-xl border border-hairline">
            {week.lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                loading={startingLessonId === lesson.id}
                onStart={onStartLesson}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-canvas-soft px-4 py-3 text-sm text-ink-muted">
            <LockKeyhole className="size-4" />
            Hoàn thành tuần {week.week - 1} để mở khóa.
          </div>
        )}
      </div>
    </div>
  );
}

function LessonRow({
  lesson,
  loading,
  onStart
}: {
  lesson: StudyPlanLesson;
  loading: boolean;
  onStart: (lesson: StudyPlanLesson) => Promise<void>;
}) {
  const interactive = lesson.status !== "LOCKED";
  const StatusIcon =
    lesson.status === "COMPLETED"
      ? CheckCircle2
      : lesson.status === "LOCKED"
        ? LockKeyhole
        : Play;

  return (
    <button
      className={`focus-ring flex w-full items-center gap-3 bg-white px-4 py-3 text-left transition ${
        interactive ? "hover:bg-blue-50/60" : ""
      }`}
      type="button"
      disabled={!interactive || loading}
      onClick={() => void onStart(lesson)}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
          lesson.status === "COMPLETED"
            ? "bg-emerald-50 text-emerald-700"
            : interactive
              ? "bg-blue-50 text-primary"
              : "bg-canvas-soft text-ink-faint"
        }`}
      >
        {lesson.position}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block truncate text-sm">{lesson.title}</strong>
        <span className="mt-1 block text-xs text-ink-muted">
          {lesson.topic} · {lesson.estimatedMinutes} phút · {lesson.mode === "TYPING" ? "Typing" : "Word bank"}
        </span>
      </span>
      <StatusIcon
        className={`size-4 shrink-0 ${
          lesson.status === "COMPLETED"
            ? "text-emerald-600"
            : interactive
              ? "text-primary"
              : "text-ink-faint"
        }`}
      />
      {lesson.status === "COMPLETED" ? (
        <span className="hidden text-xs font-semibold text-emerald-700 sm:inline">
          Học lại
        </span>
      ) : null}
      {interactive ? <ChevronRight className="size-4 shrink-0 text-ink-faint" /> : null}
    </button>
  );
}

function OverviewRow({
  icon: Icon,
  label,
  value
}: {
  icon: typeof Clock3;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
        <Icon className="size-4" />
      </span>
      <span>
        <span className="block text-xs text-ink-muted">{label}</span>
        <strong className="mt-1 block text-sm">{value}</strong>
      </span>
    </div>
  );
}
