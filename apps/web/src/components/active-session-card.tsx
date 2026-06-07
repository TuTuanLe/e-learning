import Link from "next/link";
import type { DictationSessionResponse } from "@dictation/contracts";
import { ArrowRight, Keyboard, Puzzle } from "lucide-react";

type ActiveSessionCardProps = {
  session: DictationSessionResponse;
  activeSessionCount: number;
};

export function ActiveSessionCard({
  session,
  activeSessionCount
}: ActiveSessionCardProps) {
  const progress = session.questionCount
    ? Math.round((session.completedQuestionCount / session.questionCount) * 100)
    : 0;
  const ModeIcon = session.mode === "TYPING" ? Keyboard : Puzzle;

  return (
    <section className="notion-grid overflow-hidden rounded-2xl bg-secondary p-6 text-white sm:p-7">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/70">
            <span className="font-semibold text-[var(--accent-purple)]">
              Đang học
            </span>
            <span>HSK {session.collection.hskLevel}</span>
            <span className="inline-flex items-center gap-1.5">
              <ModeIcon className="size-4" />
              {session.mode === "TYPING" ? "Typing" : "Word bank"}
            </span>
            {activeSessionCount > 1 ? (
              <span>{activeSessionCount} buổi học đang mở</span>
            ) : null}
          </div>
          <h2 className="mt-3 truncate text-2xl font-bold tracking-[-0.5px] sm:text-3xl">
            {session.collection.title} · {session.unit.title}
          </h2>
          <p className="mt-2 text-sm text-white/70">
            Đã hoàn thành {session.completedQuestionCount}/{session.questionCount} câu
          </p>
          <div className="mt-4 h-2 max-w-2xl overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-[var(--accent-purple)] transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Link
          className="focus-ring inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-secondary transition hover:bg-white/90"
          href={`/sessions/${session.id}`}
        >
          Tiếp tục học
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
