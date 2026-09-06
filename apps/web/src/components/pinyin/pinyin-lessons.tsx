"use client";

import { useState } from "react";
import {
  BookOpen,
  Volume2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle,
  Play,
  ArrowRight,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import {
  PINYIN_LESSONS_DATA,
  SOUND_PAIRS_DATA,
  type PinyinLesson,
  type SoundPairQuizItem,
} from "@/data/pinyin-practice.data";
import {
  playSyllableAudio,
  speakWithBrowser,
  stopCurrentAudio,
} from "@/lib/pinyin-audio";

export function PinyinLessons({
  onSelectQuizDrill,
}: {
  onSelectQuizDrill?: (category?: string) => void;
}) {
  const [selectedLessonId, setSelectedLessonId] = useState<number>(1);
  const [activeDrillItem, setActiveDrillItem] = useState<SoundPairQuizItem | null>(null);
  const [drillAnswered, setDrillAnswered] = useState(false);
  const [playingVocabIndex, setPlayingVocabIndex] = useState<number | null>(null);

  const currentLesson =
    PINYIN_LESSONS_DATA.find((l) => l.id === selectedLessonId) ??
    PINYIN_LESSONS_DATA[0];

  const playVocabAudio = (index: number) => {
    const vocab = currentLesson.keyVocabulary[index];
    if (!vocab) return;
    setPlayingVocabIndex(index);

    if (vocab.syllable && vocab.tone) {
      playSyllableAudio(vocab.syllable, vocab.tone, vocab.hanzi, () =>
        setPlayingVocabIndex(null),
      );
    } else {
      speakWithBrowser(vocab.hanzi, vocab.tone);
      setTimeout(() => setPlayingVocabIndex(null), 500);
    }
  };

  const startLessonDrill = () => {
    // Pick the first drill pair for this lesson
    const pairId = currentLesson.drillPairs[0];
    const found = SOUND_PAIRS_DATA.find((p) => p.id === pairId);
    if (found) {
      setActiveDrillItem(found);
      setDrillAnswered(false);
      playSyllableAudio(found.prompt.syllable, found.prompt.tone, found.prompt.hanzi);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Overview Cards Row */}
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              Lộ Trình 10 Bài Học Phát Âm
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">
              Khóa Học Phát Âm Pinyin Toàn Diện
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Chuẩn hóa ngữ âm từ cơ bản đến nâng cao theo giáo trình Dong Chinese. Tối ưu riêng cho cơ miệng người Việt.
            </p>
          </div>
        </div>

        {/* 10 Lessons Horizontal Selector Scroll / Grid */}
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10 border-t border-hairline pt-4">
          {PINYIN_LESSONS_DATA.map((lesson) => {
            const isSelected = lesson.id === selectedLessonId;
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => {
                  setSelectedLessonId(lesson.id);
                  setActiveDrillItem(null);
                  stopCurrentAudio();
                }}
                className={`flex flex-col items-center justify-center rounded-xl border p-2.5 transition-all text-center ${
                  isSelected
                    ? "border-violet-600 bg-violet-50 text-violet-900 font-bold shadow-xs scale-105"
                    : "border-hairline bg-white text-ink hover:border-violet-300 hover:bg-violet-50/30"
                }`}
              >
                <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted">
                  Bài {lesson.id}
                </span>
                <span className="mt-1 text-xs font-semibold line-clamp-1">
                  {lesson.initials.length > 0
                    ? lesson.initials.slice(0, 3).join(",")
                    : lesson.finals.slice(0, 2).join(",")}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Lesson Detail View */}
      <div className="rounded-2xl border border-hairline bg-white p-6 shadow-sm sm:p-8">
        {/* Lesson Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-hairline pb-6 sm:flex-row sm:items-center">
          <div>
            <span className="rounded-md bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-800">
              BÀI HỌC SỐ {currentLesson.id}/10
            </span>
            <h3 className="mt-2 text-2xl font-bold tracking-tight text-ink">
              {currentLesson.titleVi}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">
              {currentLesson.summaryVi}
            </p>
          </div>

          {/* Practice Drill Button */}
          <button
            type="button"
            onClick={startLessonDrill}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-violet-700 active:scale-95"
          >
            <Play className="h-4 w-4 fill-white" />
            Luyện Phản Xạ Bài Này
          </button>
        </div>

        {/* Phonetics Components Badges */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs">
          {currentLesson.initials.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink-muted">Thanh mẫu (Phụ âm):</span>
              <div className="flex gap-1.5">
                {currentLesson.initials.map((init) => (
                  <span
                    key={init}
                    className="rounded-md border border-hairline bg-canvas-soft px-2 py-0.5 font-bold text-ink"
                  >
                    {init}
                  </span>
                ))}
              </div>
            </div>
          )}

          {currentLesson.finals.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="font-bold text-ink-muted">Vận mẫu (Nguyên âm):</span>
              <div className="flex gap-1.5">
                {currentLesson.finals.map((fin) => (
                  <span
                    key={fin}
                    className="rounded-md border border-hairline bg-canvas-soft px-2 py-0.5 font-bold text-ink"
                  >
                    {fin}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="font-bold text-ink-muted">Thanh điệu trọng tâm:</span>
            <div className="flex gap-1.5">
              {currentLesson.tonesCovered.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-blue-50 px-2 py-0.5 font-bold text-blue-700"
                >
                  Thanh {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Articulation & Mouth Guide Section */}
        <div className="mt-6 rounded-xl border border-hairline bg-canvas-soft/40 p-5">
          <h4 className="flex items-center gap-2 text-sm font-bold text-ink">
            <BookOpen className="h-4 w-4 text-violet-600" />
            {currentLesson.mouthGuide.title}
          </h4>

          <ul className="mt-3 space-y-2 text-xs leading-relaxed text-ink">
            {currentLesson.mouthGuide.points.map((pt, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-600" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>

          {/* Common Mistakes Warning */}
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <strong className="font-bold">Lưu ý cho người Việt:</strong>{" "}
              {currentLesson.mouthGuide.commonMistakesVi}
            </div>
          </div>
        </div>

        {/* Key Vocabulary Audio Chips */}
        <div className="mt-6">
          <h4 className="flex items-center gap-2 text-sm font-bold text-ink">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Từ Vựng Minh Họa — Bấm Loa Để Luyện Đọc
          </h4>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {currentLesson.keyVocabulary.map((vocab, idx) => (
              <div
                key={vocab.hanzi}
                className="flex items-center justify-between rounded-xl border border-hairline bg-white p-3 shadow-2xs transition hover:border-violet-300 hover:bg-violet-50/20"
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-ink">
                      {vocab.hanzi}
                    </span>
                    <span className="text-xs font-semibold text-violet-700">
                      {vocab.pinyin}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {vocab.meaning}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => playVocabAudio(idx)}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition active:scale-95 ${
                    playingVocabIndex === idx
                      ? "border-violet-500 bg-violet-100 text-violet-700 ring-2 ring-violet-200"
                      : "border-hairline bg-canvas-soft text-ink hover:border-violet-300 hover:text-violet-700"
                  }`}
                  title="Nghe phát âm"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* In-Lesson Drill Modal / Section if active */}
        {activeDrillItem && (
          <div className="mt-8 rounded-xl border-2 border-violet-500 bg-violet-50/30 p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-violet-800">
                🎯 Bài Tập Thực Hành: {activeDrillItem.contrastTitle}
              </span>
              <button
                type="button"
                onClick={() => setActiveDrillItem(null)}
                className="text-xs font-semibold text-ink-muted hover:text-ink"
              >
                Đóng bài tập
              </button>
            </div>

            <div className="mt-4 flex flex-col items-center text-center">
              <button
                type="button"
                onClick={() =>
                  playSyllableAudio(
                    activeDrillItem.prompt.syllable,
                    activeDrillItem.prompt.tone,
                    activeDrillItem.prompt.hanzi,
                  )
                }
                className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-violet-600 bg-white text-violet-700 shadow-sm transition hover:scale-105 active:scale-95"
              >
                <Volume2 className="h-7 w-7" />
              </button>
              <p className="mt-2 text-xs text-ink-muted">
                Bấm loa để nghe âm thanh, sau đó chọn đáp án đúng:
              </p>

              <div className="mt-4 flex gap-4">
                {activeDrillItem.options.map((opt) => (
                  <button
                    key={opt.pinyin}
                    type="button"
                    onClick={() => {
                      setDrillAnswered(true);
                      playSyllableAudio(opt.syllable, opt.tone, opt.hanzi);
                    }}
                    className={`rounded-xl border px-6 py-3 text-lg font-bold transition shadow-xs ${
                      drillAnswered
                        ? opt.isCorrect
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-300"
                          : "border-hairline bg-white/50 text-ink-muted opacity-40"
                        : "border-hairline bg-white text-ink hover:border-violet-400 hover:bg-violet-50"
                    }`}
                  >
                    {opt.pinyin} {opt.hanzi ? `(${opt.hanzi})` : ""}
                  </button>
                ))}
              </div>

              {drillAnswered && (
                <p className="mt-3 text-xs font-semibold text-emerald-700">
                  {activeDrillItem.mouthGuideVi}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-between border-t border-hairline pt-6">
          <button
            type="button"
            disabled={selectedLessonId <= 1}
            onClick={() => {
              setSelectedLessonId((prev) => Math.max(1, prev - 1));
              setActiveDrillItem(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-hairline px-3.5 py-2 text-xs font-semibold text-ink transition hover:bg-canvas-soft disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
            Bài trước
          </button>

          <span className="text-xs font-semibold text-ink-muted">
            Bài {selectedLessonId} / {PINYIN_LESSONS_DATA.length}
          </span>

          <button
            type="button"
            disabled={selectedLessonId >= PINYIN_LESSONS_DATA.length}
            onClick={() => {
              setSelectedLessonId((prev) =>
                Math.min(PINYIN_LESSONS_DATA.length, prev + 1),
              );
              setActiveDrillItem(null);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-ink/90 disabled:opacity-30"
          >
            Bài tiếp theo
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
