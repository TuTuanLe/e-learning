"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Volume2,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
  ChevronRight,
  HelpCircle,
  ArrowRightLeft,
  BookOpen,
} from "lucide-react";
import {
  SOUND_PAIRS_DATA,
  type SoundPairQuizItem,
  type SoundPairCategory,
} from "@/data/pinyin-practice.data";
import {
  playSyllableAudio,
  stopCurrentAudio,
  markTone,
} from "@/lib/pinyin-audio";

const CATEGORIES: { id: "all" | SoundPairCategory; label: string }[] = [
  { id: "all", label: "Tất cả các cặp" },
  { id: "aspirated", label: "Bật hơi (b/p, d/t, g/k)" },
  { id: "retroflex", label: "Uốn lưỡi (z/zh, c/ch, s/sh)" },
  { id: "palatals", label: "Mặt lưỡi (j, q, x)" },
  { id: "nasals", label: "Vần mũi (an/ang, in/ing)" },
  { id: "rounding", label: "Tròn môi (u vs ü)" },
];

export function SoundPairsQuiz() {
  const [selectedCategory, setSelectedCategory] = useState<"all" | SoundPairCategory>("all");
  const [currentItem, setCurrentItem] = useState<SoundPairQuizItem | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingOptionIndex, setPlayingOptionIndex] = useState<number | null>(null);

  // Score stats
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [stats, setStats] = useState({ correct: 0, total: 0 });

  // Filter items based on category
  const filteredItems = useCallback(() => {
    if (selectedCategory === "all") return SOUND_PAIRS_DATA;
    return SOUND_PAIRS_DATA.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  // Next question
  const nextQuestion = useCallback(() => {
    stopCurrentAudio();
    setSelectedOptionIndex(null);
    setPlayingOptionIndex(null);

    const pool = filteredItems();
    if (pool.length === 0) return;

    // Pick random item (prefer different from current if > 1)
    let nextItem = pool[Math.floor(Math.random() * pool.length)];
    if (pool.length > 1 && currentItem && nextItem.id === currentItem.id) {
      const remaining = pool.filter((i) => i.id !== currentItem.id);
      nextItem = remaining[Math.floor(Math.random() * remaining.length)];
    }

    setCurrentItem(nextItem);
    setIsPlaying(true);
    playSyllableAudio(
      nextItem.prompt.syllable,
      nextItem.prompt.tone,
      nextItem.prompt.hanzi,
      () => setIsPlaying(false),
    );
  }, [filteredItems, currentItem]);

  // Initial load or category change
  useEffect(() => {
    nextQuestion();
  }, [selectedCategory]);

  const replayPromptAudio = () => {
    if (!currentItem) return;
    setIsPlaying(true);
    playSyllableAudio(
      currentItem.prompt.syllable,
      currentItem.prompt.tone,
      currentItem.prompt.hanzi,
      () => setIsPlaying(false),
    );
  };

  const playOptionAudio = (index: number) => {
    if (!currentItem) return;
    const opt = currentItem.options[index];
    setPlayingOptionIndex(index);
    playSyllableAudio(
      opt.syllable,
      opt.tone,
      opt.hanzi || opt.pinyin,
      () => setPlayingOptionIndex(null),
    );
  };

  const handleSelectOption = (index: number) => {
    if (selectedOptionIndex !== null || !currentItem) return;
    setSelectedOptionIndex(index);

    const isCorrect = currentItem.options[index].isCorrect;
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

  const isAnswered = selectedOptionIndex !== null;
  const isCorrectAnswer =
    isAnswered && currentItem && currentItem.options[selectedOptionIndex].isCorrect;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Header Card */}
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Luyện Đôi Tai Phản Xạ
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">
              Phân Biệt Cặp Âm Dễ Nhầm (Minimal Pairs)
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Luyện phân biệt các âm tương tự nhau: bật hơi vs không bật hơi (b/p, d/t, g/k), uốn lưỡi (z/zh, s/sh), vần mũi (an/ang).
            </p>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-4 rounded-xl border border-hairline bg-canvas-soft/60 px-4 py-2 text-xs font-semibold text-ink">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-500" />
              <span>Chuỗi:</span>
              <strong className="text-amber-600">{streak}</strong>
            </div>
            <div className="h-4 w-px bg-hairline" />
            <div>
              Đúng:{" "}
              <strong>
                {stats.total > 0
                  ? Math.round((stats.correct / stats.total) * 100)
                  : 0}
                %
              </strong>{" "}
              ({stats.correct}/{stats.total})
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-hairline pt-4">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-ink text-white shadow-sm"
                    : "border border-hairline bg-white text-ink-muted hover:border-ink/20 hover:text-ink"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Quiz Card */}
      {currentItem && (
        <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm sm:p-8 text-center">
          {/* Contrast title pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-hairline bg-canvas-soft px-3 py-1 text-xs font-semibold text-ink">
            <ArrowRightLeft className="h-3.5 w-3.5 text-blue-600" />
            <span>Phân biệt: {currentItem.contrastTitle}</span>
          </div>

          {/* Big Audio Playback Button */}
          <div className="mt-6 flex flex-col items-center">
            <button
              type="button"
              onClick={replayPromptAudio}
              className={`flex h-28 w-28 items-center justify-center rounded-full border-4 shadow-md transition-all active:scale-95 ${
                isPlaying
                  ? "border-emerald-500 bg-emerald-50 text-emerald-600 scale-105 ring-4 ring-emerald-100"
                  : "border-hairline bg-canvas-soft text-ink hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600"
              }`}
              title="Bấm để nghe âm câu hỏi (Space hoặc R)"
            >
              <Volume2
                className={`h-12 w-12 ${isPlaying ? "animate-pulse" : ""}`}
              />
            </button>
            <p className="mt-3 text-xs text-ink-muted">
              Bạn nghe thấy âm thanh nào dưới đây?
            </p>
          </div>

          {/* Options Grid */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {currentItem.options.map((opt, idx) => {
              const isSelected = selectedOptionIndex === idx;
              const isTarget = opt.isCorrect;

              let style = "border-hairline bg-white text-ink hover:border-blue-400 hover:bg-blue-50/30";
              if (isAnswered) {
                if (isTarget) {
                  style = "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-300 font-bold";
                } else if (isSelected) {
                  style = "border-rose-400 bg-rose-50 text-rose-800 ring-2 ring-rose-200";
                } else {
                  style = "border-hairline bg-canvas-soft text-ink-muted opacity-40";
                }
              }

              return (
                <button
                  key={`${opt.syllable}-${opt.tone}`}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`group flex items-center justify-between rounded-xl border p-5 transition-all active:scale-[0.99] ${style}`}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black tracking-tight">
                        {opt.pinyin}
                      </span>
                      {opt.hanzi && (
                        <span className="rounded bg-canvas-soft px-2 py-0.5 text-base font-semibold text-ink-muted">
                          {opt.hanzi}
                        </span>
                      )}
                    </div>
                    {opt.meaning && (
                      <p className="mt-1 text-xs text-ink-muted">
                        Nghĩa: {opt.meaning}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isAnswered && isTarget && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                        <CheckCircle2 className="h-4 w-4" /> Chính xác
                      </span>
                    )}
                    {isAnswered && isSelected && !isTarget && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800">
                        <XCircle className="h-4 w-4" /> Chưa đúng
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* DUAL AUDIO COMPARISON & MOUTH GUIDE (Shown on submission) */}
          {isAnswered && (
            <div className="mt-6 space-y-4 text-left animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Dual Sound Comparison Console */}
              <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                    <Volume2 className="h-4 w-4" />
                    So Sánh Trực Tiếp 2 Âm Đối Lập
                  </p>
                  <span className="text-[11px] text-blue-600">
                    Bấm để nghe sự khác biệt luồng hơi
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {currentItem.options.map((opt, idx) => (
                    <button
                      key={`comp-${opt.syllable}-${opt.tone}`}
                      type="button"
                      onClick={() => playOptionAudio(idx)}
                      className={`flex items-center justify-center gap-2 rounded-lg border bg-white px-3 py-2.5 text-xs font-bold shadow-2xs transition hover:bg-blue-50 active:scale-95 ${
                        playingOptionIndex === idx
                          ? "border-blue-500 text-blue-600 ring-2 ring-blue-200"
                          : "border-hairline text-ink"
                      }`}
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>
                        Nghe âm: <strong>{opt.pinyin}</strong> {opt.hanzi ? `(${opt.hanzi})` : ""}
                      </span>
                      {opt.isCorrect && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800">
                          Đúng
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mouth & Articulation Tip */}
              <div
                className={`rounded-xl border p-4 ${
                  isCorrectAnswer
                    ? "border-emerald-200 bg-emerald-50/70"
                    : "border-amber-200 bg-amber-50/70"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4 text-ink-muted" />
                      Bí Quyết Phân Biệt Khẩu Hình
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink">
                      {currentItem.mouthGuideVi}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={nextQuestion}
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
      )}
    </div>
  );
}
