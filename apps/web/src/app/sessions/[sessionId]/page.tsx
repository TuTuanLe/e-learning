"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import type {
  DictationAnswerResponse,
  DictationSessionResponse,
  StudyPlanLesson,
} from "@dictation/contracts";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Flame,
  Headphones,
  Lightbulb,
  LoaderCircle,
  PencilLine,
  RotateCcw,
  Sparkles,
  Target,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { dictationApi, studyPlanApi } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function SessionPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [token, setToken] = useState("");
  const [session, setSession] = useState<DictationSessionResponse | null>(null);
  const [answer, setAnswer] = useState("");
  const [parts, setParts] = useState<number[]>([]);
  const [review, setReview] = useState<DictationAnswerResponse | null>(null);
  const [hint, setHint] = useState(false);
  const [rate, setRate] = useState(0.9);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceUri, setVoiceUri] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [nextRoadmapLesson, setNextRoadmapLesson] =
    useState<StudyPlanLesson | null>(null);
  const [openingRoadmapLesson, setOpeningRoadmapLesson] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;

      if (!accessToken) {
        router.replace(`/login?next=/sessions/${params.sessionId}`);
        return;
      }

      try {
        const nextSession = await dictationApi.session(
          params.sessionId,
          accessToken,
        );
        if (mounted) {
          setToken(accessToken);
          setSession(nextSession);
          setStartedAt(Date.now());
        }
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Không thể tải session.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
      window.speechSynthesis?.cancel();
    };
  }, [params.sessionId, router, supabase]);

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    function loadVoices() {
      const chineseVoices = window.speechSynthesis
        .getVoices()
        .filter((voice) => voice.lang.toLowerCase().startsWith("zh"))
        .sort((left, right) => voiceScore(right) - voiceScore(left));

      setVoices(chineseVoices);
      setVoiceUri((current) => current || chineseVoices[0]?.voiceURI || "");
    }

    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
  }, []);

  useEffect(() => {
    if (session?.status !== "COMPLETED" || !session.studyPlan || !token) {
      return;
    }

    let mounted = true;
    void studyPlanApi
      .list(token)
      .then(({ studyPlans }) => {
        if (!mounted) return;
        const plan = studyPlans.find(
          (candidate) => candidate.hskLevel === session.studyPlan?.hskLevel,
        );
        setNextRoadmapLesson(plan?.nextLesson ?? null);
      })
      .catch(() => {
        if (mounted) setNextRoadmapLesson(null);
      });

    return () => {
      mounted = false;
    };
  }, [session?.status, session?.studyPlan, token]);

  useEffect(() => {
    if (!session?.currentQuestion || review || session.status === "COMPLETED")
      return;

    const timer = window.setInterval(
      () => setElapsed(Date.now() - startedAt),
      250,
    );
    return () => window.clearInterval(timer);
  }, [review, session?.currentQuestion, session?.status, startedAt]);

  const speak = useCallback(
    (text: string) => {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      setSpeaking(false);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = rate;
      const selectedVoice = voices.find((voice) => voice.voiceURI === voiceUri);
      if (selectedVoice) utterance.voice = selectedVoice;
      utterance.pitch = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [rate, voiceUri, voices],
  );

  function currentAnswer() {
    if (!session?.currentQuestion) return "";
    return session.mode === "WORD_BANK"
      ? parts.map((index) => session.currentQuestion?.wordBank[index]).join("")
      : answer;
  }

  async function submit() {
    if (!session?.currentQuestion || !token || review) return;
    const value = currentAnswer().trim();

    if (!value) {
      setError("Hãy nhập hoặc ghép câu trả lời trước.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await dictationApi.answer(
        session.id,
        {
          questionId: session.currentQuestion.id,
          answer: value,
          elapsedMs: elapsed,
        },
        token,
      );
      setReview(result);
      speak(result.answer.hanzi);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Không thể chấm câu.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function next() {
    if (!review) return;
    if (!review.correct) {
      setSession(review.session);
      setReview(null);
      setError("");
      setElapsed(0);
      setStartedAt(Date.now());
      return;
    }

    setSession(review.session);
    setReview(null);
    setAnswer("");
    setParts([]);
    setHint(false);
    setElapsed(0);
    setStartedAt(Date.now());
  }

  function handleKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (review) next();
    else void submit();
  }

  async function openRoadmapLesson(lesson: Pick<StudyPlanLesson, "id">) {
    const studyPlan = session?.studyPlan;
    if (!studyPlan || !token) return;
    setOpeningRoadmapLesson(true);
    setError("");

    try {
      const nextSession = await studyPlanApi.startLesson(
        studyPlan.hskLevel,
        lesson.id,
        token,
      );
      router.push(`/sessions/${nextSession.id}`);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Không thể mở bài học.",
      );
      setOpeningRoadmapLesson(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas-soft">
        <LoaderCircle className="size-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-canvas-soft">
        <AppHeader />
        <div className="mx-auto max-w-xl px-5 py-16">
          <div className="notion-shadow rounded-2xl border border-hairline bg-white p-8">
            <h1 className="text-3xl font-bold">Không thể mở bài học</h1>
            <p className="mt-3 text-ink-muted">{error}</p>
            <Link
              className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-white"
              href="/"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (session.status === "COMPLETED") {
    const total = session.correctCount + session.mistakeCount;
    const accuracy = total
      ? Math.round((session.correctCount / total) * 100)
      : 100;

    return (
      <main className="min-h-screen bg-canvas-soft">
        <AppHeader />
        <section className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
          <div className="notion-shadow overflow-hidden rounded-2xl border border-hairline bg-white">
            <div className="notion-grid bg-secondary px-7 py-12 text-center text-white sm:px-12">
              <span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-[var(--accent-purple)] text-[var(--secondary)]">
                <Trophy className="size-10" />
              </span>
              <p className="mt-6 text-sm text-white/70">
                {session.collection.title} · {session.unit.title}
              </p>
              <h1 className="mt-2 text-5xl font-bold tracking-[-1.6px]">
                Hoàn thành!
              </h1>
              <p className="mx-auto mt-4 max-w-lg leading-7 text-white/75">
                Bạn đã sửa từng câu chưa đúng và hoàn thành toàn bộ bài học.
              </p>
            </div>
            <div className="grid gap-px bg-hairline sm:grid-cols-4">
              {[
                ["EXP", session.exp],
                ["Chính xác", `${accuracy}%`],
                ["Max combo", session.maxCombo],
                ["Lỗi", session.mistakeCount],
              ].map(([label, value]) => (
                <div key={label} className="bg-white p-6 text-center">
                  <p className="text-3xl font-bold tracking-[-0.7px]">
                    {value}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-ink-muted">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap justify-center gap-3 p-7">
              {nextRoadmapLesson && session.studyPlan ? (
                <button
                  className="focus-ring inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-white transition hover:-translate-y-0.5 hover:bg-primary-active disabled:opacity-60"
                  disabled={openingRoadmapLesson}
                  type="button"
                  onClick={() => void openRoadmapLesson(nextRoadmapLesson)}
                >
                  {openingRoadmapLesson ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ArrowRight className="size-4" />
                  )}
                  Bài tiếp theo: {nextRoadmapLesson.title}
                </button>
              ) : (
                <Link
                  className="rounded-full bg-primary px-6 py-3 font-medium text-white"
                  href="/"
                >
                  Chọn bài mới
                </Link>
              )}
              {session.studyPlan ? (
                <button
                  className="focus-ring inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-6 py-3 font-medium transition hover:bg-canvas-soft disabled:opacity-60"
                  disabled={openingRoadmapLesson}
                  type="button"
                  onClick={() =>
                    void openRoadmapLesson({ id: session.studyPlan!.lessonId })
                  }
                >
                  <RotateCcw className="size-4" />
                  Học lại bài này
                </button>
              ) : null}
            </div>
            {error ? (
              <p className="pb-7 text-center text-sm text-red-600">{error}</p>
            ) : null}
          </div>
        </section>
      </main>
    );
  }

  const question = session.currentQuestion;
  if (!question) return null;

  const stats = review?.session ?? session;
  const progress = (stats.completedQuestionCount / stats.questionCount) * 100;
  const timer = Math.min(
    100,
    (elapsed / (question.targetSeconds * 1000)) * 100,
  );

  return (
    <main className="min-h-screen bg-canvas-soft">
      <AppHeader />
      <section className="mx-auto max-w-5xl px-5 py-6 sm:px-8 sm:py-9">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink"
            href="/"
          >
            <ArrowLeft className="size-4" /> Danh sách bài
          </Link>
          <p className="text-sm font-medium">
            {session.collection.title} · {session.unit.title}
          </p>
        </div>

        <div className="notion-shadow overflow-hidden rounded-3xl border border-hairline bg-white">
          <div className="border-b border-hairline bg-[linear-gradient(135deg,#ffffff_0%,#ffffff_70%,#fbfaff_100%)] px-4 py-4 sm:px-6 sm:py-5">
            <div className="grid grid-cols-3 gap-2">
              <StudyStat
                accent="blue"
                icon={Target}
                label="Còn lại"
                value={stats.questionCount - stats.completedQuestionCount}
              />
              <StudyStat
                accent="purple"
                icon={Sparkles}
                label="Kinh nghiệm"
                value={stats.exp}
              />
              <StudyStat
                accent="orange"
                icon={Flame}
                label="Combo"
                value={`${stats.combo}x`}
              />
            </div>
            <div className="mt-4 px-1">
              <div className="mb-2 flex items-end justify-between gap-4">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-ink-muted sm:text-[11px]">
                  Tiến độ bài học
                </p>
                <span className="text-xs font-black tabular-nums text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[#e8e9ee]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#4d2bd9,var(--primary))] transition-[width] duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-canvas-soft p-3">
              <button
                aria-label={speaking ? "Đang phát câu" : "Nghe câu"}
                className={`focus-ring inline-flex size-11 items-center justify-center rounded-xl border text-sm font-medium transition hover:shadow-sm ${
                  speaking
                    ? "border-primary bg-primary text-white shadow-sm"
                    : "border-hairline bg-white text-primary"
                }`}
                type="button"
                onClick={() => speak(question.audioText)}
              >
                <span className={speaking ? "animate-audio-pulse" : ""}>
                  <Volume2 className="size-5" />
                </span>
              </button>
              <label className="flex min-w-48 flex-1 items-center gap-3 text-sm text-ink-muted">
                Tốc độ {rate.toFixed(1)}x
                <input
                  className="flex-1 accent-primary"
                  type="range"
                  min="0.6"
                  max="1.3"
                  step="0.1"
                  value={rate}
                  onChange={(event) => setRate(Number(event.target.value))}
                />
              </label>
              {voices.length > 0 ? (
                <VoiceSelect
                  voices={voices}
                  value={voiceUri}
                  onValueChange={setVoiceUri}
                />
              ) : null}
            </div>

            <div
              key={question.id}
              className="animate-question-enter mx-auto max-w-3xl py-9 text-center"
            >
              <Headphones className="mx-auto size-7 text-primary" />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                Nghe và viết lại
              </p>
              <h1 className="mt-3 text-3xl font-bold leading-tight tracking-[-0.8px] sm:text-5xl">
                {question.promptVi}
              </h1>
            </div>

            <div className="h-1 overflow-hidden rounded-full bg-canvas-soft">
              <div
                className="h-full bg-[var(--accent-orange)] transition-all"
                style={{ width: `${timer}%` }}
              />
            </div>
            <p className="mt-2 text-right text-xs text-ink-muted">
              {Math.floor(elapsed / 1000)}s · mục tiêu {question.targetSeconds}s
            </p>

            {session.mode === "TYPING" ? (
              <input
                autoFocus
                disabled={Boolean(review)}
                className="focus-ring mt-5 h-14 w-full rounded-xl border border-hairline px-4 text-center text-xl outline-none transition duration-200 hover:border-ink-faint focus:-translate-y-0.5 focus:border-primary focus:shadow-[0_10px_30px_rgb(0_117_222/0.1)] disabled:bg-canvas-soft"
                placeholder="Nhập Hán tự hoặc Pinyin…"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                onKeyDown={handleKey}
              />
            ) : (
              <div className="mt-5 space-y-4">
                <div className="min-h-20 rounded-xl border border-dashed border-primary/40 bg-blue-50/40 p-3">
                  <div className="flex flex-wrap justify-center gap-2">
                    {parts.map((index) => (
                      <button
                        key={index}
                        disabled={Boolean(review)}
                        className="animate-chip-in rounded-lg border border-hairline bg-white px-3 py-2 text-lg transition hover:-translate-y-0.5"
                        type="button"
                        onClick={() =>
                          setParts((current) =>
                            current.filter((item) => item !== index),
                          )
                        }
                      >
                        {question.wordBank[index]}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {question.wordBank.map((part, index) => (
                    <button
                      key={`${part}-${index}`}
                      disabled={parts.includes(index) || Boolean(review)}
                      className="focus-ring rounded-lg border border-hairline bg-canvas-soft px-3 py-2 text-lg transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-sm active:scale-95 disabled:opacity-25"
                      type="button"
                      onClick={() => setParts((current) => [...current, index])}
                    >
                      {part}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hint && !review ? (
              <p className="mt-4 rounded-xl bg-amber-50 p-4 text-center text-sm text-amber-900">
                {question.hint}
              </p>
            ) : null}

            {review ? (
              <div
                className={`animate-feedback-in mt-5 rounded-2xl border p-5 ${review.correct ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
              >
                <div className="flex gap-3">
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full ${review.correct ? "bg-green-600" : "bg-red-600"} text-white`}
                  >
                    {review.correct ? (
                      <Check className="size-4" />
                    ) : (
                      <X className="size-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-xl font-semibold">
                      {review.correct
                        ? "Chính xác"
                        : "Chưa đúng · sửa rồi thử lại"}
                    </p>
                    <p className="mt-3 text-3xl font-bold">
                      {review.answer.hanzi}
                    </p>
                    <p className="mt-1 text-primary">{review.answer.pinyin}</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {review.answer.meaningVi}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {error ? (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-[0.7fr_1.3fr]">
              <button
                className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full border border-hairline bg-white font-medium transition hover:-translate-y-0.5 hover:bg-canvas-soft active:translate-y-0"
                type="button"
                onClick={() =>
                  review
                    ? speak(review.answer.hanzi)
                    : setHint((value) => !value)
                }
              >
                {review ? (
                  <RotateCcw className="size-4" />
                ) : (
                  <Lightbulb className="size-4" />
                )}
                {review ? "Nghe đáp án" : hint ? "Ẩn gợi ý" : "Gợi ý"}
              </button>
              <button
                className="focus-ring inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary font-medium text-white transition hover:-translate-y-0.5 hover:bg-primary-active hover:shadow-lg active:translate-y-0 disabled:opacity-60"
                disabled={submitting}
                type="button"
                onClick={() => (review ? next() : void submit())}
              >
                {submitting ? (
                  <LoaderCircle className="size-4 animate-spin" />
                ) : null}
                {review ? (
                  review.correct ? (
                    <>
                      {review.session.status === "COMPLETED" ? (
                        <Trophy className="size-4" />
                      ) : (
                        <ArrowRight className="size-4" />
                      )}
                      {review.session.status === "COMPLETED"
                        ? "Xem tổng kết"
                        : "Câu tiếp theo"}
                    </>
                  ) : (
                    <>
                      <PencilLine className="size-4" />
                      Sửa và thử lại
                    </>
                  )
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Kiểm tra
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function voiceScore(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  let score = voice.lang.toLowerCase() === "zh-cn" ? 20 : 0;
  if (/xiaoxiao|tingting|ting-ting|mei-jia|female|普通话|mandarin/.test(name))
    score += 30;
  if (/google|microsoft|apple/.test(name)) score += 10;
  if (voice.default) score += 5;
  return score;
}

function voiceLabel(voice: SpeechSynthesisVoice): string {
  return (
    voice.name
      .replace(/microsoft|google|apple/gi, "")
      .replace(/\s+/g, " ")
      .trim() || voice.lang
  );
}

function StudyStat({
  accent,
  icon: Icon,
  label,
  value,
}: {
  accent: "blue" | "purple" | "orange";
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  const theme = {
    blue: {
      icon: "bg-[#eeedff] text-[#342bd7] ring-[#f5f3ff]",
    },
    purple: {
      icon: "bg-[#f0eaff] text-[#6d43df] ring-[#f7f2ff]",
    },
    orange: {
      icon: "bg-[#f5eee8] text-[#b45309] ring-[#faf4ef]",
    },
  }[accent];

  return (
    <div className="group flex min-w-0 items-center justify-center gap-2 rounded-2xl bg-white/70 px-2.5 py-2.5 transition duration-200 hover:bg-white hover:shadow-sm sm:gap-3 sm:px-4 sm:py-3">
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ring-2 transition duration-300 group-hover:-translate-y-0.5 sm:size-9 ${theme.icon}`}
      >
        <Icon className="size-4 sm:size-[18px]" />
      </span>
      <div className="min-w-0 text-left">
        <p className="text-2xl font-black leading-none tracking-[-0.6px] text-ink sm:text-3xl">
          {value}
        </p>
        <p className="mt-1 text-[9px] font-black uppercase tracking-[0.16em] text-ink-muted sm:text-[10px]">
          {label}
        </p>
      </div>
    </div>
  );
}

function VoiceSelect({
  voices,
  value,
  onValueChange,
}: {
  voices: SpeechSynthesisVoice[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-ink-muted">
      <span id="voice-label">Giọng</span>
      <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
        <SelectPrimitive.Trigger
          aria-labelledby="voice-label"
          className="focus-ring flex h-10 max-w-60 items-center gap-2 rounded-xl border border-hairline bg-white px-3 text-sm text-ink shadow-sm transition hover:border-ink-faint data-[state=open]:border-primary data-[state=open]:shadow-[0_8px_24px_rgb(0_117_222/0.12)]"
        >
          <SelectPrimitive.Value />
          <SelectPrimitive.Icon className="ml-auto text-ink-muted">
            <ChevronDown className="size-4" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={6}
            className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-hairline bg-white p-1 shadow-xl data-[state=open]:animate-question-enter"
          >
            <SelectPrimitive.Viewport>
              <SelectPrimitive.Group>
                {voices.map((voice) => (
                  <SelectPrimitive.Item
                    key={voice.voiceURI}
                    value={voice.voiceURI}
                    className="relative flex cursor-default select-none items-center rounded-lg py-2 pl-8 pr-3 text-sm text-ink outline-none transition data-[highlighted]:bg-blue-50 data-[highlighted]:text-primary"
                  >
                    <SelectPrimitive.ItemIndicator className="absolute left-2">
                      <Check className="size-4" />
                    </SelectPrimitive.ItemIndicator>
                    <SelectPrimitive.ItemText>
                      {voiceLabel(voice)}
                    </SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Group>
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </div>
  );
}
