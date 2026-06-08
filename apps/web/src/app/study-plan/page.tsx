"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
  StudyPlanIntake,
  StudyPlanLesson,
  StudyPlanResponse,
  SubscriptionSummary
} from "@dictation/contracts";
import { CheckCircle2, LockKeyhole, Plus, Sparkles } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { RoadmapDashboard } from "@/components/study-plan/roadmap-dashboard";
import { RoadmapForm } from "@/components/study-plan/roadmap-form";
import { accountApi, studyPlanApi } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const HSK_LEVELS = [1, 2, 3, 4, 5, 6] as const;

export default function StudyPlanPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(null);
  const [studyPlans, setStudyPlans] = useState<StudyPlanResponse[]>([]);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [editing, setEditing] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [authResolved, setAuthResolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [startingLessonId, setStartingLessonId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    let loadedAccessToken: string | null | undefined;

    async function load(accessToken: string | null) {
      if (!mounted || accessToken === loadedAccessToken) return;
      loadedAccessToken = accessToken;
      setAuthResolved(true);
      setSignedIn(Boolean(accessToken));
      setLoading(Boolean(accessToken));
      setError("");

      if (!accessToken) {
        setSubscription(null);
        setStudyPlans([]);
        setLoading(false);
        return;
      }

      try {
        const learning = await accountApi.learning(accessToken);
        if (!mounted || accessToken !== loadedAccessToken) return;

        setSubscription(learning.subscription);
        setStudyPlans(learning.studyPlans);
        setSelectedLevel(learning.studyPlans[0]?.hskLevel ?? 1);
      } catch (caught) {
        if (!mounted || accessToken !== loadedAccessToken) return;
        setSubscription(null);
        setStudyPlans([]);
        setError(
          caught instanceof Error
            ? caught.message
            : "Không thể tải dữ liệu lộ trình."
        );
      } finally {
        if (mounted && accessToken === loadedAccessToken) setLoading(false);
      }
    }

    void supabase.auth.getSession().then(({ data }) => {
      void load(data.session?.access_token ?? null);
    });

    const {
      data: { subscription: authSubscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void load(session?.access_token ?? null);
    });

    return () => {
      mounted = false;
      authSubscription.unsubscribe();
    };
  }, [reloadKey, supabase]);

  const selectedPlan = studyPlans.find((plan) => plan.hskLevel === selectedLevel) ?? null;
  const locked = !subscription?.entitlements.aiStudyPlan;
  const showForm = !selectedPlan || editing;

  async function savePlan(intake: StudyPlanIntake) {
    setError("");
    setSubmitting(true);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.push("/login?next=/study-plan");
        return;
      }

      const saved = await studyPlanApi.generate(intake, token);
      setStudyPlans((plans) => [
        ...plans.filter((plan) => plan.hskLevel !== saved.hskLevel),
        saved
      ].sort((left, right) => left.hskLevel - right.hskLevel));
      setSelectedLevel(saved.hskLevel);
      setEditing(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể lưu lộ trình.");
    } finally {
      setSubmitting(false);
    }
  }

  async function startLesson(lesson: StudyPlanLesson) {
    setError("");
    setStartingLessonId(lesson.id);

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.push("/login?next=/study-plan");
        return;
      }

      const session = await studyPlanApi.startLesson(selectedLevel, lesson.id, token);
      router.push(`/sessions/${session.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể mở bài học.");
      setStartingLessonId(null);
    }
  }

  return (
    <main className="min-h-screen bg-canvas-soft">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col justify-between gap-5 border-b border-hairline pb-7 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-[-1.4px] sm:text-5xl">
              Lộ trình của tôi
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-ink-muted">
              Học đúng thứ tự, hoàn thành từng bài và mở khóa tuần tiếp theo.
            </p>
          </div>
          {selectedPlan && !editing ? (
            <button
              className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-full border border-hairline bg-white px-5 text-sm font-medium hover:bg-canvas-soft"
              onClick={() => setEditing(true)}
            >
              <Plus className="size-4" />
              Điều chỉnh HSK {selectedLevel}
            </button>
          ) : null}
        </div>

        <div className="mt-7 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {HSK_LEVELS.map((level) => {
            const plan = studyPlans.find((candidate) => candidate.hskLevel === level);
            const active = selectedLevel === level;
            return (
              <button
                key={level}
                className={`focus-ring rounded-xl border px-3 py-3 text-left transition ${
                  active
                    ? "border-primary bg-blue-50"
                    : "border-hairline bg-white hover:bg-canvas-soft"
                }`}
                onClick={() => {
                  setSelectedLevel(level);
                  setEditing(false);
                  setError("");
                }}
              >
                <strong className={active ? "text-primary" : ""}>HSK {level}</strong>
                <span className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                  {plan ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      {plan.completedLessons}/{plan.totalLessons} bài
                    </>
                  ) : (
                    "Chưa tạo"
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {!authResolved || loading ? (
          <div className="mt-8 h-[620px] animate-pulse rounded-2xl bg-white" />
        ) : !signedIn ? (
          <LockedPlanner signedIn={false} />
        ) : !subscription ? (
          <PlannerLoadError
            message={error}
            onRetry={() => setReloadKey((value) => value + 1)}
          />
        ) : locked ? (
          <LockedPlanner signedIn />
        ) : (
          <div className="mt-8">
            {error && !showForm ? (
              <p className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            ) : null}

            {showForm ? (
              <div className="mx-auto max-w-3xl">
                <RoadmapForm
                  key={`${selectedLevel}-${selectedPlan?.version ?? 0}`}
                  initialValue={selectedPlan?.intake ?? defaultIntake(selectedLevel)}
                  updating={Boolean(selectedPlan)}
                  submitting={submitting}
                  error={error}
                  onCancel={selectedPlan ? () => {
                    setEditing(false);
                    setError("");
                  } : undefined}
                  onSubmit={savePlan}
                />
              </div>
            ) : (
              <RoadmapDashboard
                studyPlan={selectedPlan}
                startingLessonId={startingLessonId}
                onStartLesson={startLesson}
                onUpdate={() => setEditing(true)}
              />
            )}
          </div>
        )}
      </section>
    </main>
  );
}

function PlannerLoadError({
  message,
  onRetry
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <section className="notion-shadow mt-8 rounded-2xl border border-red-200 bg-white p-7 sm:p-10">
      <h2 className="text-2xl font-bold">Không thể tải thông tin gói học.</h2>
      <p className="mt-3 text-ink-muted">
        Bạn vẫn đang đăng nhập. Hãy thử tải lại dữ liệu để tiếp tục.
      </p>
      {message ? <p className="mt-3 text-sm text-red-700">{message}</p> : null}
      <button
        className="focus-ring mt-6 rounded-full bg-primary px-6 py-3 font-medium text-white hover:bg-primary-active"
        type="button"
        onClick={onRetry}
      >
        Thử lại
      </button>
    </section>
  );
}

function LockedPlanner({ signedIn }: { signedIn: boolean }) {
  return (
    <section className="notion-shadow mt-8 overflow-hidden rounded-2xl border border-hairline bg-white">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
        <div className="p-7 sm:p-10">
          <span className="flex size-11 items-center justify-center rounded-xl bg-purple-50 text-secondary">
            <LockKeyhole className="size-5" />
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-[-0.8px]">
            Roadmap HSK dành cho hành trình dài hạn.
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-ink-muted">
            Gói 6 tháng và vĩnh viễn mở sáu lộ trình HSK riêng biệt, lesson tuần tự
            và khả năng cập nhật mà không mất tiến độ.
          </p>
          <Link
            className="focus-ring mt-7 inline-flex rounded-full bg-primary px-6 py-3 font-medium text-white hover:bg-primary-active"
            href={signedIn ? "/pricing" : "/login?next=/study-plan"}
          >
            {signedIn ? "Xem gói có AI" : "Đăng nhập để tiếp tục"}
          </Link>
        </div>
        <div className="notion-grid bg-secondary p-7 text-white sm:p-10">
          <Sparkles className="size-7 text-[var(--accent-purple)]" />
          <h3 className="mt-5 text-2xl font-bold">Mỗi HSK, một hành trình riêng.</h3>
          <ul className="mt-6 space-y-4 text-white/82">
            {[
              "Bài học cụ thể cho từng tuần",
              "Khóa tuần và bài theo đúng thứ tự",
              "Tiến độ gắn trực tiếp với dictation",
              "Cập nhật phần chưa học bất cứ lúc nào"
            ].map((item) => (
              <li key={item} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-[var(--accent-purple)]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function defaultIntake(hskLevel: number): StudyPlanIntake {
  const date = new Date();
  date.setMonth(date.getMonth() + 3);

  return {
    hskLevel,
    primaryGoal: "Giao tiếp",
    minutesPerDay: 30,
    daysPerWeek: 5,
    durationWeeks: 5,
    lessonsPerWeek: 5,
    targetDate: date.toISOString().slice(0, 10),
    interests: ["Đời sống"],
    weaknesses: ["Nghe", "Phản xạ"],
    useCase: ""
  };
}
