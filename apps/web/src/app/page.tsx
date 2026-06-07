"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
  DictationCatalogResponse,
  DictationCollectionSummary,
  DictationMode,
  DictationSessionResponse,
  StudyPlanResponse,
  SubscriptionSummary,
} from "@dictation/contracts";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Flame,
  Headphones,
  Keyboard,
  Layers3,
  LockKeyhole,
  Play,
  Puzzle,
  Sparkles,
  Target,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ActiveSessionCard } from "@/components/active-session-card";
import { AppHeader } from "@/components/app-header";
import { dictationApi, studyPlanApi, subscriptionApi } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const coverByCollection: Record<string, string> = {
  "hsk-1": "/hsk1.webp",
  "hsk-2": "/hsk2.webp",
  "hsk-3": "/hsk3.webp",
  "hsk-4": "/hsk4.webp",
  "hsk-5": "/hsk5.webp",
  "hsk-6": "/hsk6.webp",
};

const modeOptions: Array<{
  id: DictationMode;
  label: string;
  description: string;
  icon: typeof Keyboard;
}> = [
  {
    id: "TYPING",
    label: "Typing",
    description: "Nghe rồi gõ Hán tự hoặc Pinyin.",
    icon: Keyboard,
  },
  {
    id: "WORD_BANK",
    label: "Word bank",
    description: "Sắp xếp các mảnh thành câu hoàn chỉnh.",
    icon: Puzzle,
  },
];

export default function HomePage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [catalog, setCatalog] = useState<DictationCatalogResponse | null>(null);
  const [sessions, setSessions] = useState<DictationSessionResponse[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionSummary | null>(
    null,
  );
  const [activeRoadmap, setActiveRoadmap] = useState<StudyPlanResponse | null>(
    null,
  );
  const [collectionId, setCollectionId] = useState("");
  const [unitId, setUnitId] = useState("");
  const [topic, setTopic] = useState("Tất cả");
  const [mode, setMode] = useState<DictationMode>("TYPING");
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [startingRoadmap, setStartingRoadmap] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    let loadedAccessToken: string | null | undefined;

    async function loadUserData(accessToken: string | null) {
      if (!mounted || accessToken === loadedAccessToken) return;
      loadedAccessToken = accessToken;

      if (!accessToken) {
        setSessions([]);
        setSubscription(null);
        setActiveRoadmap(null);
        return;
      }

      const [recent, nextSubscription, roadmaps] = await Promise.all([
        dictationApi.sessions(accessToken).catch(() => ({ sessions: [] })),
        subscriptionApi.summary(accessToken).catch(() => null),
        studyPlanApi.list(accessToken).catch(() => ({ studyPlans: [] })),
      ]);

      if (!mounted || accessToken !== loadedAccessToken) return;

      setSessions(recent.sessions);
      setSubscription(nextSubscription);
      setActiveRoadmap(
        roadmaps.studyPlans.find((plan) => plan.nextLesson) ??
          roadmaps.studyPlans[0] ??
          null,
      );
    }

    async function loadCatalog() {
      try {
        const nextCatalog = await dictationApi.catalog();
        if (!mounted) return;

        setCatalog(nextCatalog);
        setCollectionId(nextCatalog.collections[0]?.id ?? "");
        setUnitId(nextCatalog.collections[0]?.units[0]?.id ?? "");
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Không thể tải nội dung.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadCatalog();
    void supabase.auth.getSession().then(({ data }) => {
      void loadUserData(data.session?.access_token ?? null);
    });

    const {
      data: { subscription: authSubscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void loadUserData(session?.access_token ?? null);
    });

    return () => {
      mounted = false;
      authSubscription.unsubscribe();
    };
  }, [supabase]);

  const isCanceledSubscription = subscription?.status !== "ACTIVE";
  const activeSessions = (isCanceledSubscription ? [] : sessions)
    .filter((session) => session.status === "ACTIVE")
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() -
        new Date(left.updatedAt).getTime(),
    );
  const activeSession = activeSessions[0] ?? null;
  const completedSessions = sessions.filter(
    (session) => session.status === "COMPLETED",
  ).length;
  const totalExp = sessions.reduce((sum, session) => sum + session.exp, 0);
  const completedQuestions = sessions.reduce(
    (sum, session) => sum + session.completedQuestionCount,
    0,
  );
  const totalQuestions = sessions.reduce(
    (sum, session) => sum + session.questionCount,
    0,
  );
  const totalCorrect = sessions.reduce(
    (sum, session) => sum + session.correctCount,
    0,
  );
  const totalMistakes = sessions.reduce(
    (sum, session) => sum + session.mistakeCount,
    0,
  );
  const accuracy =
    totalCorrect + totalMistakes
      ? Math.round((totalCorrect / (totalCorrect + totalMistakes)) * 100)
      : 0;
  const collection = catalog?.collections.find(
    (item) => item.id === collectionId,
  );
  const unit = collection?.units.find((item) => item.id === unitId);
  const topics = [
    "Tất cả",
    ...new Set(collection?.units.map((item) => item.topic) ?? []),
  ];
  const visibleUnits =
    topic === "Tất cả"
      ? (collection?.units ?? [])
      : (collection?.units.filter((item) => item.topic === topic) ?? []);
  const selectedUnitLocked =
    Boolean(unit) &&
    unitId !== "hsk-1-greetings" &&
    unitId !== "hsk-1-daily" &&
    !subscription?.entitlements.fullCatalog;

  function chooseCollection(item: DictationCollectionSummary) {
    setCollectionId(item.id);
    setUnitId(item.units[0]?.id ?? "");
    setTopic("Tất cả");
  }

  function chooseTopic(nextTopic: string) {
    setTopic(nextTopic);
    const nextUnit =
      nextTopic === "Tất cả"
        ? collection?.units[0]
        : collection?.units.find((item) => item.topic === nextTopic);
    setUnitId(nextUnit?.id ?? "");
  }

  async function start() {
    if (!collection || !unit) return;

    if (selectedUnitLocked) {
      router.push("/pricing");
      return;
    }

    setStarting(true);
    setError("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      if (!token) {
        router.push("/login?next=/");
        return;
      }

      const session = await dictationApi.createSession(
        { collectionId: collection.id, unitId: unit.id, mode },
        token,
      );
      router.push(`/sessions/${session.id}`);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Không thể bắt đầu bài học.",
      );
    } finally {
      setStarting(false);
    }
  }

  async function startRoadmapLesson() {
    const lesson = activeRoadmap?.nextLesson;
    if (!activeRoadmap || !lesson) {
      router.push("/study-plan");
      return;
    }

    setStartingRoadmap(true);
    setError("");

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        router.push("/login?next=/");
        return;
      }

      const session = await studyPlanApi.startLesson(
        activeRoadmap.hskLevel,
        lesson.id,
        token,
      );
      router.push(`/sessions/${session.id}`);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Không thể mở bài theo lộ trình.",
      );
      setStartingRoadmap(false);
    }
  }

  return (
    <main className="min-h-screen bg-canvas-soft">
      <AppHeader />

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col justify-between gap-7 border-b border-hairline pb-8 sm:flex-row sm:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-[-1.4px] sm:text-5xl">
              Hôm nay bạn muốn luyện gì?
            </h1>
            <p className="mt-4 max-w-2xl leading-7 text-ink-muted">
              Chọn cấp độ, chủ đề và cách trả lời. Câu sai sẽ quay lại cho đến
              khi bạn thật sự nhớ.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <span className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-white px-4 py-3 text-sm font-medium">
              <Headphones className="size-4 text-primary" />
              24 chủ đề HSK
            </span>
            <Link
              className="focus-ring inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-3 text-sm font-medium text-white"
              href="/study-plan"
            >
              <Sparkles className="size-4 text-[var(--accent-purple)]" />
              Lộ trình AI
            </Link>
          </div>
        </div>
      </section>

      {activeSession ? (
        <div className="mx-auto max-w-7xl px-5 pb-6 sm:px-8">
          <ActiveSessionCard
            session={activeSession}
            activeSessionCount={activeSessions.length}
          />
        </div>
      ) : null}

      <section
        id="workspace"
        className="mx-auto grid max-w-7xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[1fr_360px]"
      >
        <div className="space-y-6">
          <div className="notion-shadow rounded-2xl border border-hairline bg-white p-5 sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  01 · Giáo trình
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.9px]">
                  Chọn cấp độ HSK
                </h2>
              </div>
              <span className="text-sm text-ink-muted">
                6 cấp độ ·{" "}
                {catalog?.collections.reduce(
                  (sum, item) => sum + item.units.length,
                  0,
                ) ?? 0}{" "}
                chủ đề
              </span>
            </div>

            {loading ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-xl bg-canvas-soft"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {catalog?.collections.map((item) => {
                  const active = item.id === collectionId;

                  return (
                    <button
                      key={item.id}
                      className={`focus-ring flex items-center gap-4 rounded-xl border p-3 text-left transition ${
                        active
                          ? "border-primary bg-blue-50/70"
                          : "border-hairline bg-white hover:bg-canvas-soft"
                      }`}
                      type="button"
                      onClick={() => chooseCollection(item)}
                    >
                      <span className="relative h-24 w-[68px] shrink-0 overflow-hidden rounded-md border border-hairline bg-white">
                        <Image
                          fill
                          alt={`${item.title} cover`}
                          className="object-contain"
                          sizes="68px"
                          src={coverByCollection[item.id] ?? "/hsk1.webp"}
                        />
                      </span>
                      <span>
                        <span className="block text-xl font-semibold tracking-[-0.4px]">
                          {item.title}
                        </span>
                        <span className="mt-1 block text-sm leading-5 text-ink-muted">
                          {item.units.length} bài học
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="notion-shadow rounded-2xl border border-hairline bg-white p-5 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              02 · Bài học
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-[-0.9px]">
              Chọn chủ đề
            </h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {topics.map((item) => (
                <button
                  key={item}
                  className={`focus-ring rounded-full border px-3 py-2 text-sm transition ${
                    topic === item
                      ? "border-primary bg-blue-50 text-primary"
                      : "border-hairline hover:bg-canvas-soft"
                  }`}
                  type="button"
                  onClick={() => chooseTopic(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {visibleUnits.map((item) => {
                const active = item.id === unitId;
                const locked =
                  item.id !== "hsk-1-greetings" &&
                  item.id !== "hsk-1-daily" &&
                  !subscription?.entitlements.fullCatalog;

                return (
                  <button
                    key={item.id}
                    className={`focus-ring rounded-xl border p-5 text-left transition ${
                      active
                        ? "border-primary bg-blue-50/70"
                        : "border-hairline hover:bg-canvas-soft"
                    }`}
                    type="button"
                    onClick={() => setUnitId(item.id)}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-lg font-semibold tracking-[-0.2px]">
                        {item.title}
                      </span>
                      {locked ? (
                        <LockKeyhole className="size-4 text-ink-faint" />
                      ) : null}
                    </span>
                    <span className="mt-2 inline-flex rounded-md bg-canvas-soft px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                      {item.topic}
                    </span>
                    <span className="mt-1.5 block text-sm leading-6 text-ink-muted">
                      {item.description}
                    </span>
                    <span className="mt-4 flex items-center gap-4 text-xs font-medium text-ink-muted">
                      <span className="inline-flex items-center gap-1.5">
                        <Layers3 className="size-3.5" />
                        {item.questionCount} câu
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 className="size-3.5" />
                        {item.estimatedMinutes} phút
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="notion-shadow sticky top-5 rounded-2xl border border-hairline bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              03 · Cách học
            </p>
            <div className="mt-4 space-y-2">
              {modeOptions.map((item) => {
                const Icon = item.icon;
                const active = item.id === mode;

                return (
                  <button
                    key={item.id}
                    className={`focus-ring flex w-full items-start gap-3 rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-primary bg-blue-50/70"
                        : "border-hairline hover:bg-canvas-soft"
                    }`}
                    type="button"
                    onClick={() => setMode(item.id)}
                  >
                    <span
                      className={`rounded-lg p-2 ${active ? "bg-primary text-white" : "bg-canvas-soft"}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span>
                      <span className="block font-semibold">{item.label}</span>
                      <span className="mt-1 block text-sm leading-5 text-ink-muted">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="my-5 border-t border-hairline" />
            <div className="rounded-xl bg-canvas-soft p-4">
              <p className="text-sm font-medium">
                {collection?.title ?? "HSK"} · {unit?.title ?? "Bài học"}
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {mode === "TYPING" ? "Typing mode" : "Word bank"}
              </p>
            </div>
            {error ? (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            ) : null}
            <button
              className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 font-medium text-white transition hover:bg-primary-active disabled:opacity-55"
              disabled={!unit || starting}
              type="button"
              onClick={start}
            >
              {selectedUnitLocked ? (
                <LockKeyhole className="size-4" />
              ) : (
                <Play className="size-4 fill-current" />
              )}
              {selectedUnitLocked
                ? "Mở khóa bài học"
                : starting
                  ? "Đang tạo bài..."
                  : "Bắt đầu"}
            </button>
            <div className="my-5 border-t border-hairline" />
            {activeRoadmap?.nextLesson ? (
              <div className="rounded-xl bg-secondary p-4 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-[var(--accent-purple)]" />
                  <p className="text-sm font-semibold">
                    HSK {activeRoadmap.hskLevel} · Tuần{" "}
                    {activeRoadmap.currentWeek}
                  </p>
                </div>
                <p className="mt-3 font-semibold">
                  {activeRoadmap.nextLesson.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-white/70">
                  Bài tiếp theo trong lộ trình ·{" "}
                  {activeRoadmap.nextLesson.estimatedMinutes} phút
                </p>
                <button
                  className="focus-ring mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-secondary disabled:opacity-60"
                  disabled={startingRoadmap}
                  onClick={() => void startRoadmapLesson()}
                >
                  <Play className="size-3.5 fill-current" />
                  {startingRoadmap ? "Đang mở..." : "Học bài theo lộ trình"}
                </button>
                <Link
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-white/75 hover:text-white"
                  href="/study-plan"
                >
                  Xem toàn bộ lộ trình <ArrowRight className="size-3.5" />
                </Link>
              </div>
            ) : (
              <div className="rounded-xl bg-secondary p-4 text-white">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-[var(--accent-purple)]" />
                  <p className="text-sm font-semibold">Lộ trình cá nhân hóa</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  Tạo roadmap riêng cho từng HSK, với bài và tuần được mở khóa
                  tuần tự.
                </p>
                <Link
                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white"
                  href="/study-plan"
                >
                  Tạo lộ trình HSK <ArrowRight className="size-3.5" />
                </Link>
              </div>
            )}
          </div>
        </aside>
      </section>

      {sessions.length > 0 ? (
        <section className="border-t border-hairline bg-white">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Dashboard
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-[-0.9px]">
                  Thống kê học tập
                </h2>
              </div>
              <p className="text-sm text-ink-muted">
                Tổng quan từ các buổi luyện dictation của bạn.
              </p>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <DashboardStat
                icon={BarChart3}
                label="Buổi học"
                value={sessions.length}
                detail={`${completedSessions} đã hoàn thành`}
              />
              <DashboardStat
                icon={Flame}
                label="EXP"
                value={totalExp}
                detail="Tổng kinh nghiệm"
              />
              <DashboardStat
                icon={CheckCircle2}
                label="Câu đã xong"
                value={completedQuestions}
                detail={`${totalQuestions} câu trong lịch sử`}
              />
              <DashboardStat
                icon={Target}
                label="Độ chính xác"
                value={`${accuracy}%`}
                detail={`${totalCorrect}/${totalCorrect + totalMistakes || 0} lượt đúng`}
              />
              <DashboardStat
                icon={Play}
                label="Đang học"
                value={activeSessions.length}
                detail={
                  activeSession
                    ? activeSession.unit.title
                    : "Không có session mở"
                }
              />
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function DashboardStat({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-canvas-soft/40 p-5">
      <span className="flex size-10 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
        <Icon className="size-5" />
      </span>
      <p className="mt-5 text-3xl font-bold tracking-[-0.8px]">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </p>
      <p className="mt-3 truncate text-sm text-ink-muted">{detail}</p>
    </div>
  );
}
