"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Volume2,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  Settings2,
  ChevronRight,
  Info,
} from "lucide-react";
import {
  TONE_METADATA,
  SINGLE_TONE_PRACTICE_SYLLABLES,
  TONE_PAIRS_DATA,
  type TonePairWord,
  type TonePairGroup,
} from "@/data/pinyin-practice.data";
import {
  playSyllableAudio,
  playTonePairAudio,
  markTone,
  stopCurrentAudio,
} from "@/lib/pinyin-audio";

// Mini SVG Pitch Contour Visualization component
export function TonePitchContour({
  tone,
  size = 40,
  strokeWidth = 3,
  className = "",
}: {
  tone: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  // Coordinate system 0..100 x 0..100. (y=0 is high pitch 5, y=100 is low pitch 1)
  // Tone 1 (55): y=15 horizontal
  // Tone 2 (35): (15, 60) -> (85, 15)
  // Tone 3 (214): (15, 55) -> (50, 90) -> (85, 30)
  // Tone 4 (51): (15, 15) -> (85, 90)
  let d = "";
  if (tone === 1) {
    d = "M 15 20 L 85 20";
  } else if (tone === 2) {
    d = "M 15 70 Q 50 45 85 20";
  } else if (tone === 3) {
    d = "M 15 50 Q 50 95 85 30";
  } else if (tone === 4) {
    d = "M 15 20 L 85 85";
  } else {
    // Neutral tone (dot)
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className={`inline-block ${className}`}
      >
        <circle cx="50" cy="50" r="10" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`inline-block ${className}`}
    >
      {/* Background pitch guide lines (levels 5, 4, 3, 2, 1) */}
      <line x1="10" y1="20" x2="90" y2="20" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="3,3" />
      <line x1="10" y1="52" x2="90" y2="52" stroke="currentColor" strokeOpacity="0.1" strokeDasharray="3,3" />
      <line x1="10" y1="85" x2="90" y2="85" stroke="currentColor" strokeOpacity="0.15" strokeDasharray="3,3" />
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth * 3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ToneTrainer() {
  const [trainerMode, setTrainerMode] = useState<"single" | "pairs">("single");

  // Single syllable states
  const [activeTones, setActiveTones] = useState<number[]>([1, 2, 3, 4]);
  const [currentSyllable, setCurrentSyllable] = useState("ma");
  const [targetTone, setTargetTone] = useState<number>(1);
  const [selectedTone, setSelectedTone] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Score & Streak
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  // Tone Pairs states
  const [selectedPairFilter, setSelectedPairFilter] = useState<string>("all");
  const [currentPairWord, setCurrentPairWord] = useState<TonePairWord | null>(null);
  const [currentPairGroup, setCurrentPairGroup] = useState<TonePairGroup | null>(null);
  const [selectedPairAnswer, setSelectedPairAnswer] = useState<{
    t1: number | null;
    t2: number | null;
  }>({ t1: null, t2: null });

  // Generate next single question
  const nextSingleQuestion = useCallback(() => {
    stopCurrentAudio();
    setSelectedTone(null);
    const availableTones = activeTones.length > 0 ? activeTones : [1, 2, 3, 4];
    const randTone = availableTones[Math.floor(Math.random() * availableTones.length)];
    const randSyllable =
      SINGLE_TONE_PRACTICE_SYLLABLES[
        Math.floor(Math.random() * SINGLE_TONE_PRACTICE_SYLLABLES.length)
      ];

    setCurrentSyllable(randSyllable);
    setTargetTone(randTone);

    setIsPlaying(true);
    playSyllableAudio(randSyllable, randTone, undefined, () => setIsPlaying(false));
  }, [activeTones]);

  // Generate next pair question
  const nextPairQuestion = useCallback(() => {
    stopCurrentAudio();
    setSelectedPairAnswer({ t1: null, t2: null });

    let pool: { word: TonePairWord; group: TonePairGroup }[] = [];
    if (selectedPairFilter === "all") {
      TONE_PAIRS_DATA.forEach((grp) => {
        grp.words.forEach((w) => pool.push({ word: w, group: grp }));
      });
    } else {
      const found = TONE_PAIRS_DATA.find((g) => g.pairKey === selectedPairFilter);
      if (found) {
        found.words.forEach((w) => pool.push({ word: w, group: found }));
      }
    }

    if (pool.length === 0) {
      pool = TONE_PAIRS_DATA[0].words.map((w) => ({
        word: w,
        group: TONE_PAIRS_DATA[0],
      }));
    }

    const item = pool[Math.floor(Math.random() * pool.length)];
    setCurrentPairWord(item.word);
    setCurrentPairGroup(item.group);

    setIsPlaying(true);
    playTonePairAudio(
      item.word.s1,
      item.word.t1,
      item.word.s2,
      item.word.t2,
      item.word.hanzi,
      () => setIsPlaying(false),
    );
  }, [selectedPairFilter]);

  // Initial load
  useEffect(() => {
    if (trainerMode === "single") {
      nextSingleQuestion();
    } else {
      nextPairQuestion();
    }
  }, [trainerMode, nextSingleQuestion, nextPairQuestion]);

  // Play again function
  const replayAudio = () => {
    if (trainerMode === "single") {
      setIsPlaying(true);
      playSyllableAudio(currentSyllable, targetTone, undefined, () =>
        setIsPlaying(false),
      );
    } else if (currentPairWord) {
      setIsPlaying(true);
      playTonePairAudio(
        currentPairWord.s1,
        currentPairWord.t1,
        currentPairWord.s2,
        currentPairWord.t2,
        currentPairWord.hanzi,
        () => setIsPlaying(false),
      );
    }
  };

  // Keyboard shortcut: Space or 'r' to replay, 1/2/3/4 to pick tone
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space" || e.key.toLowerCase() === "r") {
        e.preventDefault();
        replayAudio();
      } else if (trainerMode === "single" && selectedTone === null) {
        if (["1", "2", "3", "4"].includes(e.key)) {
          const toneNum = parseInt(e.key, 10);
          handleSingleToneSelect(toneNum);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [trainerMode, selectedTone, replayAudio]);

  const handleSingleToneSelect = (tone: number) => {
    if (selectedTone !== null) return;
    setSelectedTone(tone);

    const isCorrect = tone === targetTone;
    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    if (isCorrect) {
      setStreak((prev) => {
        const nextStreak = prev + 1;
        setBestStreak((b) => Math.max(b, nextStreak));
        return nextStreak;
      });
    } else {
      setStreak(0);
    }
  };

  const handlePairToneSelect = (pos: "t1" | "t2", tone: number) => {
    if (!currentPairWord) return;
    const nextAns = { ...selectedPairAnswer, [pos]: tone };
    setSelectedPairAnswer(nextAns);

    if (nextAns.t1 !== null && nextAns.t2 !== null) {
      // Completed answer check
      const isCorrect =
        nextAns.t1 === currentPairWord.t1 && nextAns.t2 === currentPairWord.t2;
      setStats((prev) => ({
        correct: prev.correct + (isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
      if (isCorrect) {
        setStreak((prev) => {
          const nextStreak = prev + 1;
          setBestStreak((b) => Math.max(b, nextStreak));
          return nextStreak;
        });
      } else {
        setStreak(0);
      }
    }
  };

  const toggleToneFilter = (tone: number) => {
    setActiveTones((prev) => {
      if (prev.includes(tone)) {
        if (prev.length <= 2) return prev; // Keep at least 2 tones active for contrast
        return prev.filter((t) => t !== tone);
      } else {
        return [...prev, tone].sort();
      }
    });
  };

  const isPairAnswerSubmitted =
    selectedPairAnswer.t1 !== null && selectedPairAnswer.t2 !== null;
  const isPairCorrect =
    isPairAnswerSubmitted &&
    currentPairWord &&
    selectedPairAnswer.t1 === currentPairWord.t1 &&
    selectedPairAnswer.t2 === currentPairWord.t2;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Luyện Phản Xạ Thanh Điệu
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">
              {trainerMode === "single"
                ? "Luyện Nghe 4 Thanh Điệu Đơn"
                : "Luyện Phối Hợp Cặp 2 Thanh Điệu"}
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              {trainerMode === "single"
                ? "Nghe âm thanh và xác định thanh điệu (1, 2, 3, hoặc 4). Bấm số 1-4 trên bàn phím hoặc nhấn nút."
                : "Phân biệt chuyển đổi cao độ của từ 2 âm tiết. Nền tảng cốt lõi để nói tiếng Trung tự nhiên."}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="inline-flex rounded-xl border border-hairline bg-canvas-soft p-1">
            <button
              onClick={() => setTrainerMode("single")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                trainerMode === "single"
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              1 Âm Tiết
            </button>
            <button
              onClick={() => setTrainerMode("pairs")}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                trainerMode === "pairs"
                  ? "bg-white text-ink shadow-sm"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Cặp 2 Thanh Điệu
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-4 text-xs font-medium text-ink-muted">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-500" />
              <span>Chuỗi đúng:</span>
              <strong className="text-sm font-bold text-amber-600">
                {streak}
              </strong>
              {streak > 0 && <span className="text-[10px] text-amber-500">🔥</span>}
            </div>
            <div className="h-4 w-px bg-hairline" />
            <div>
              Kỷ lục: <strong className="text-ink">{bestStreak}</strong>
            </div>
            <div className="h-4 w-px bg-hairline" />
            <div>
              Độ chính xác:{" "}
              <strong className="text-ink">
                {stats.total > 0
                  ? Math.round((stats.correct / stats.total) * 100)
                  : 0}
                %
              </strong>{" "}
              ({stats.correct}/{stats.total})
            </div>
          </div>

          {trainerMode === "single" ? (
            /* Tone selector checkboxes */
            <div className="flex items-center gap-1.5">
              <span className="text-ink-muted mr-1">Lọc thanh:</span>
              {[1, 2, 3, 4].map((t) => {
                const isChecked = activeTones.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleToneFilter(t)}
                    title={`Bật/Tắt thanh ${t}`}
                    className={`h-7 w-7 rounded-md border text-xs font-bold transition-all ${
                      isChecked
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-hairline bg-white text-ink-muted opacity-40 hover:opacity-80"
                    }`}
                  >
                    T{t}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Pair filter selector */
            <div className="flex items-center gap-2">
              <span className="text-ink-muted">Nhóm cặp:</span>
              <select
                value={selectedPairFilter}
                onChange={(e) => {
                  setSelectedPairFilter(e.target.value);
                  setTimeout(nextPairQuestion, 10);
                }}
                className="rounded-lg border border-hairline bg-white px-2.5 py-1 text-xs font-semibold text-ink shadow-sm"
              >
                <option value="all">Tất cả 16 nhóm cặp thanh</option>
                {TONE_PAIRS_DATA.map((grp) => (
                  <option key={grp.pairKey} value={grp.pairKey}>
                    {grp.nameVi} ({grp.pairKey})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Training Sandbox */}
      {trainerMode === "single" ? (
        /* SINGLE SYLLABLE PRACTICE */
        <div className="rounded-2xl border border-hairline bg-white p-8 shadow-sm text-center">
          <div className="mx-auto flex flex-col items-center">
            {/* Audio Playback Circle */}
            <div className="relative">
              <button
                type="button"
                onClick={replayAudio}
                className={`flex h-28 w-28 items-center justify-center rounded-full border-4 shadow-md transition-all active:scale-95 ${
                  isPlaying
                    ? "border-blue-500 bg-blue-50 text-blue-600 scale-105 ring-4 ring-blue-100"
                    : "border-hairline bg-canvas-soft text-ink hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                }`}
                title="Bấm để nghe (Phím tắt: Space hoặc R)"
              >
                <Volume2
                  className={`h-12 w-12 ${isPlaying ? "animate-pulse" : ""}`}
                />
              </button>
            </div>

            <p className="mt-3 text-xs text-ink-muted">
              Nhấn loa hoặc gõ <kbd className="rounded border border-hairline bg-canvas-soft px-1.5 py-0.5 text-[10px] font-semibold text-ink">Space</kbd> để nghe lại
            </p>

            {/* Answer Options Grid */}
            <div className="mt-8 grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
              {[1, 2, 3, 4].map((t) => {
                const meta = TONE_METADATA[t];
                const isSelected = selectedTone === t;
                const isTarget = targetTone === t;
                const showFeedback = selectedTone !== null;

                let buttonStyle = "border-hairline bg-white hover:border-blue-400 hover:bg-blue-50/40 text-ink";
                if (showFeedback) {
                  if (isTarget) {
                    buttonStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-300 shadow-sm";
                  } else if (isSelected) {
                    buttonStyle = "border-rose-400 bg-rose-50 text-rose-800 ring-2 ring-rose-200";
                  } else {
                    buttonStyle = "border-hairline bg-canvas-soft text-ink-muted opacity-40";
                  }
                }

                return (
                  <button
                    key={t}
                    type="button"
                    disabled={selectedTone !== null}
                    onClick={() => handleSingleToneSelect(t)}
                    className={`group relative flex flex-col items-center justify-between rounded-xl border p-4 transition-all duration-150 ${buttonStyle}`}
                  >
                    {/* Tone shortcut badge */}
                    <span className="absolute top-2 left-2.5 rounded bg-canvas-soft px-1.5 py-0.5 text-[10px] font-bold text-ink-muted group-hover:bg-blue-100 group-hover:text-blue-700">
                      {t}
                    </span>

                    {/* Tone pitch graph icon */}
                    <div className="my-2">
                      <TonePitchContour
                        tone={t}
                        size={48}
                        className={
                          showFeedback && isTarget
                            ? "text-emerald-600"
                            : showFeedback && isSelected
                            ? "text-rose-600"
                            : "text-ink-muted group-hover:text-blue-600"
                        }
                      />
                    </div>

                    <div className="text-center">
                      <p className="text-lg font-bold">
                        {markTone(currentSyllable, t)}
                      </p>
                      <p className="text-xs font-semibold text-ink-muted">
                        Thanh {t} ({meta.contour})
                      </p>
                    </div>

                    {showFeedback && isTarget && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Chính xác
                      </span>
                    )}
                    {showFeedback && isSelected && !isTarget && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-rose-700">
                        <XCircle className="h-3.5 w-3.5" /> Chưa đúng
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation & Next Action */}
            {selectedTone !== null && (
              <div className="mt-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div
                  className={`rounded-xl border p-4 text-left ${
                    selectedTone === targetTone
                      ? "border-emerald-200 bg-emerald-50/70"
                      : "border-amber-200 bg-amber-50/70"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-ink">
                        Đáp án đúng:{" "}
                        <span className="text-blue-600">
                          {markTone(currentSyllable, targetTone)}
                        </span>{" "}
                        — {TONE_METADATA[targetTone].nameVi} (
                        {TONE_METADATA[targetTone].contourDesc})
                      </p>
                      <p className="mt-1 text-xs leading-5 text-ink-muted">
                        {TONE_METADATA[targetTone].descriptionVi}
                      </p>
                      <p className="mt-1 text-xs font-medium text-ink-muted italic">
                        💡 Mẹo nhớ: {TONE_METADATA[targetTone].vietnameseEquivalent}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={nextSingleQuestion}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-ink px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-ink/90 active:scale-95"
                    >
                      Câu tiếp theo
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* TONE PAIRS PRACTICE */
        <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm sm:p-8">
          {currentPairWord && currentPairGroup && (
            <div className="flex flex-col items-center text-center">
              {/* Audio Playback Button */}
              <button
                type="button"
                onClick={replayAudio}
                className={`flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-md transition-all active:scale-95 ${
                  isPlaying
                    ? "border-blue-500 bg-blue-50 text-blue-600 scale-105 ring-4 ring-blue-100"
                    : "border-hairline bg-canvas-soft text-ink hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                }`}
                title="Bấm để nghe từ 2 âm tiết (Phím tắt: Space hoặc R)"
              >
                <Volume2
                  className={`h-10 w-10 ${isPlaying ? "animate-pulse" : ""}`}
                />
              </button>

              <p className="mt-2 text-xs text-ink-muted">
                Từ 2 âm tiết — Nghe và xác định thanh điệu của từng âm
              </p>

              {/* Word Reveal (Shown when answered) */}
              {isPairAnswerSubmitted && (
                <div className="mt-4 rounded-xl border border-hairline bg-canvas-soft px-6 py-3">
                  <span className="text-3xl font-black tracking-wider text-ink">
                    {currentPairWord.hanzi}
                  </span>
                  <p className="mt-1 text-sm font-bold text-blue-600">
                    {currentPairWord.pinyinFormatted}
                  </p>
                  <p className="text-xs text-ink-muted">
                    Nghĩa: {currentPairWord.meaning}
                  </p>
                  {currentPairWord.note && (
                    <span className="mt-1 inline-block rounded bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                      ⚡ {currentPairWord.note}
                    </span>
                  )}
                </div>
              )}

              {/* Two Column Selector: First Syllable & Second Syllable */}
              <div className="mt-6 grid w-full max-w-xl grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Position 1: Âm thứ nhất */}
                <div className="rounded-xl border border-hairline bg-canvas-soft/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    1. Âm Thứ Nhất ({currentPairWord.s1})
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((t) => {
                      const isSelected = selectedPairAnswer.t1 === t;
                      const isCorrect = currentPairWord.t1 === t;

                      let style = "border-hairline bg-white text-ink hover:border-blue-400";
                      if (isPairAnswerSubmitted) {
                        if (isCorrect) {
                          style = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-300";
                        } else if (isSelected) {
                          style = "border-rose-400 bg-rose-50 text-rose-800";
                        } else {
                          style = "border-hairline bg-white/50 opacity-40";
                        }
                      } else if (isSelected) {
                        style = "border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-300";
                      }

                      return (
                        <button
                          key={`s1-${t}`}
                          type="button"
                          disabled={isPairAnswerSubmitted}
                          onClick={() => handlePairToneSelect("t1", t)}
                          className={`flex items-center justify-between rounded-lg border p-2.5 text-xs transition ${style}`}
                        >
                          <span className="font-semibold">Thanh {t}</span>
                          <TonePitchContour tone={t} size={24} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Position 2: Âm thứ hai */}
                <div className="rounded-xl border border-hairline bg-canvas-soft/40 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    2. Âm Thứ Hai ({currentPairWord.s2})
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4, 5].map((t) => {
                      const isSelected = selectedPairAnswer.t2 === t;
                      const isCorrect = currentPairWord.t2 === t;

                      let style = "border-hairline bg-white text-ink hover:border-blue-400";
                      if (isPairAnswerSubmitted) {
                        if (isCorrect) {
                          style = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-300";
                        } else if (isSelected) {
                          style = "border-rose-400 bg-rose-50 text-rose-800";
                        } else {
                          style = "border-hairline bg-white/50 opacity-40";
                        }
                      } else if (isSelected) {
                        style = "border-blue-600 bg-blue-50 text-blue-700 font-bold ring-2 ring-blue-300";
                      }

                      return (
                        <button
                          key={`s2-${t}`}
                          type="button"
                          disabled={isPairAnswerSubmitted}
                          onClick={() => handlePairToneSelect("t2", t)}
                          className={`flex items-center justify-between rounded-lg border p-2.5 text-xs transition ${
                            t === 5 ? "col-span-2" : ""
                          } ${style}`}
                        >
                          <span className="font-semibold">
                            {t === 5 ? "Thanh nhẹ" : `Thanh ${t}`}
                          </span>
                          <TonePitchContour tone={t} size={24} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Explanation card on submission */}
              {isPairAnswerSubmitted && (
                <div className="mt-6 w-full max-w-xl text-left animate-in fade-in duration-200">
                  <div
                    className={`rounded-xl border p-4 ${
                      isPairCorrect
                        ? "border-emerald-200 bg-emerald-50/70"
                        : "border-amber-200 bg-amber-50/70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-ink">
                          {isPairCorrect ? "🎉 Xuất sắc!" : "Cặp thanh đúng:"}{" "}
                          <span className="text-blue-700 font-extrabold">
                            Thanh {currentPairWord.t1} + Thanh {currentPairWord.t2}
                          </span>{" "}
                          ({currentPairGroup.contourVi})
                        </p>
                        <p className="mt-1 text-xs text-ink-muted">
                          <strong>Mẹo phát âm:</strong> {currentPairGroup.tipVi}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={nextPairQuestion}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-ink/90 active:scale-95"
                      >
                        Tiếp theo
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tone Guide Cheat Sheet Reference */}
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          <h3 className="text-sm font-bold text-ink">
            Bảng Tra Cứu Cao Độ 4 Thanh Điệu
          </h3>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((t) => {
            const meta = TONE_METADATA[t];
            return (
              <div
                key={t}
                className="flex items-start gap-3 rounded-xl border border-hairline bg-canvas-soft/30 p-3.5"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white border border-hairline shadow-2xs">
                  <TonePitchContour tone={t} size={28} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-ink">
                    {meta.nameVi}
                  </p>
                  <p className="text-[11px] font-semibold text-blue-600">
                    Cao độ: {meta.contour} ({meta.contourDesc})
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-ink-muted">
                    {meta.descriptionVi}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
