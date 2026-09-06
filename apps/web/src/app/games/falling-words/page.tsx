"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type KeyboardEvent,
} from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  Volume2,
  VolumeX,
  Flame,
  RotateCcw,
  Trophy,
  Zap,
  Swords,
  Sparkles,
  Eye,
  EyeOff,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Play,
} from "lucide-react";
import {
  getWordsForGame,
  normalizePinyinForGame,
  type GameWord,
} from "@/data/falling-words.data";
import {
  playDaggerWhoosh,
  playWordBurst,
  playComboSound,
  playLifeLostSound,
  speakWord,
  setGameAudioMuted,
  isGameAudioMuted,
} from "@/lib/game-audio";

interface ActiveFallingWord {
  instanceId: string;
  word: GameWord;
  x: number; // percentage 5..85%
  y: number; // percentage 0..100%
  speed: number; // percentage per second
  state: "falling" | "burst" | "missed";
  burstAt?: number;
}

interface FlyingDagger {
  id: string;
  startX: number; // 50%
  startY: number; // 95%
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  createdAt: number;
}

interface BurstEffect {
  id: string;
  x: number;
  y: number;
  meaning: string;
  points: number;
  hanzi: string;
}

export default function FallingWordsGamePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const collectionId = searchParams.get("collectionId") || "hsk-1";
  const unitId = searchParams.get("unitId") || "";

  // Game configuration & settings
  const [showPinyinHint, setShowPinyinHint] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0); // 0.8: slow, 1.0: normal, 1.3: fast
  const [muted, setMuted] = useState(false);

  // Game state
  const [gameState, setGameState] = useState<
    "READY" | "PLAYING" | "PAUSED" | "GAME_OVER" | "VICTORY"
  >("READY");
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [wordsBurstCount, setWordsBurstCount] = useState(0);
  const [totalCharactersTyped, setTotalCharactersTyped] = useState(0);
  const [totalMisses, setTotalMisses] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Active falling words & animations
  const [activeWords, setActiveWords] = useState<ActiveFallingWord[]>([]);
  const [daggers, setDaggers] = useState<FlyingDagger[]>([]);
  const [burstEffects, setBurstEffects] = useState<BurstEffect[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [screenShake, setScreenShake] = useState(false);

  // Words pool for this session
  const wordQueueRef = useRef<GameWord[]>([]);
  const answeredWordsRef = useRef<GameWord[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSpawnTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize word pool
  const initGame = useCallback(() => {
    const words = getWordsForGame(collectionId, unitId);
    wordQueueRef.current = [...words];
    answeredWordsRef.current = [];
    setActiveWords([]);
    setDaggers([]);
    setBurstEffects([]);
    setLives(3);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setWordsBurstCount(0);
    setTotalCharactersTyped(0);
    setTotalMisses(0);
    setInputVal("");
    setStartTime(Date.now());
    lastSpawnTimeRef.current = Date.now();
    setGameState("PLAYING");

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [collectionId, unitId]);

  // Spawn a word
  const spawnWord = useCallback(() => {
    if (wordQueueRef.current.length === 0) return;
    const nextWord = wordQueueRef.current.shift();
    if (!nextWord) return;

    // Pick a lane/x position that isn't too close to existing falling words
    const safeMargin = 12; // 12%
    let randomX = 10 + Math.random() * 75;

    const newFallingWord: ActiveFallingWord = {
      instanceId: `word-${Date.now()}-${Math.random()}`,
      word: nextWord,
      x: randomX,
      y: 0,
      speed: 4.5 * speedMultiplier, // speed in % per second
      state: "falling",
    };

    setActiveWords((prev) => [...prev, newFallingWord]);
  }, [speedMultiplier]);

  // Main game tick loop using requestAnimationFrame
  useEffect(() => {
    if (gameState !== "PLAYING") {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let lastTick = performance.now();

    const loop = (now: number) => {
      const dt = (now - lastTick) / 1000;
      lastTick = now;

      // Check spawning interval (every 2.5 - 3.5 seconds depending on active count)
      const currentTime = Date.now();
      const spawnInterval = Math.max(1800, 3200 - wordsBurstCount * 40);
      if (
        currentTime - lastSpawnTimeRef.current > spawnInterval &&
        wordQueueRef.current.length > 0
      ) {
        lastSpawnTimeRef.current = currentTime;
        spawnWord();
      }

      // Update positions of active falling words
      setActiveWords((prevWords) => {
        const nextWords: ActiveFallingWord[] = [];
        let hitBottom = false;

        for (const item of prevWords) {
          if (item.state === "burst") {
            // Keep bursting for 0.4s then remove
            if (currentTime - (item.burstAt || 0) < 400) {
              nextWords.push(item);
            }
            continue;
          }

          const nextY = item.y + item.speed * dt;

          // Check if touched danger zone (y >= 88%)
          if (nextY >= 88 && item.state === "falling") {
            hitBottom = true;
            nextWords.push({ ...item, y: 88, state: "missed" });
            playLifeLostSound();
            answeredWordsRef.current.push(item.word);
            setTotalMisses((m) => m + 1);
            setCombo(0);
          } else if (item.state === "missed") {
            // Remove after short delay
            if (nextY < 95) {
              nextWords.push({ ...item, y: nextY + item.speed * dt });
            }
          } else {
            nextWords.push({ ...item, y: nextY });
          }
        }

        if (hitBottom) {
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setGameState("GAME_OVER");
            }
            return Math.max(0, nextL);
          });
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 300);
        }

        // Check victory condition
        if (
          nextWords.length === 0 &&
          wordQueueRef.current.length === 0 &&
          lives > 0
        ) {
          setGameState("VICTORY");
        }

        return nextWords;
      });

      // Update daggers animation
      setDaggers((prevDaggers) => {
        const remaining: FlyingDagger[] = [];
        for (const dagger of prevDaggers) {
          const progress = (now - dagger.createdAt) / 180; // 180ms flight time
          if (progress < 1) {
            remaining.push({
              ...dagger,
              currentX:
                dagger.startX + (dagger.targetX - dagger.startX) * progress,
              currentY:
                dagger.startY + (dagger.targetY - dagger.startY) * progress,
            });
          }
        }
        return remaining;
      });

      // Update burst text effects
      setBurstEffects((prev) =>
        prev.filter((effect) => Date.now() - parseInt(effect.id.split("-")[1] || "0") < 1200),
      );

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, spawnWord, wordsBurstCount, lives]);

  // Handle typing & shooting dagger
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setInputVal(rawVal);

    const normalizedTyped = normalizePinyinForGame(rawVal);
    if (!normalizedTyped) return;

    // Find if any currently falling word matches
    const targetItem = activeWords.find(
      (item) =>
        item.state === "falling" &&
        (item.word.pinyinRaw.toLowerCase() === normalizedTyped ||
          normalizePinyinForGame(item.word.pinyin) === normalizedTyped),
    );

    if (targetItem) {
      shootDaggerAtWord(targetItem);
      setInputVal("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const normalizedTyped = normalizePinyinForGame(inputVal);
      if (!normalizedTyped) return;

      const targetItem = activeWords.find(
        (item) =>
          item.state === "falling" &&
          (item.word.pinyinRaw.toLowerCase() === normalizedTyped ||
            normalizePinyinForGame(item.word.pinyin) === normalizedTyped),
      );

      if (targetItem) {
        shootDaggerAtWord(targetItem);
        setInputVal("");
      } else {
        // Mismatch shake
        setInputVal("");
      }
    }
  };

  // Launch dagger at target word
  const shootDaggerAtWord = (targetItem: ActiveFallingWord) => {
    // 1. Play sounds
    playDaggerWhoosh();
    setTimeout(() => {
      playWordBurst();
      speakWord(targetItem.word.hanzi);
    }, 120);

    // 2. Spawn dagger projectile
    const newDagger: FlyingDagger = {
      id: `dagger-${Date.now()}`,
      startX: 50,
      startY: 92,
      targetX: targetItem.x,
      targetY: targetItem.y,
      currentX: 50,
      currentY: 92,
      createdAt: performance.now(),
    };
    setDaggers((prev) => [...prev, newDagger]);

    // 3. Mark word as burst
    const now = Date.now();
    setActiveWords((prev) =>
      prev.map((w) =>
        w.instanceId === targetItem.instanceId
          ? { ...w, state: "burst", burstAt: now }
          : w,
      ),
    );

    // 4. Calculate score with combo multiplier
    const nextCombo = combo + 1;
    setCombo(nextCombo);
    setMaxCombo((prev) => Math.max(prev, nextCombo));
    if (nextCombo >= 3) {
      playComboSound(nextCombo);
    }

    const pointsEarned = 100 + nextCombo * 20;
    setScore((prev) => prev + pointsEarned);
    setWordsBurstCount((prev) => prev + 1);
    setTotalCharactersTyped((prev) => prev + targetItem.word.pinyinRaw.length);
    answeredWordsRef.current.push(targetItem.word);

    // 5. Spawn floating burst text effect
    setBurstEffects((prev) => [
      ...prev,
      {
        id: `burst-${now}`,
        x: targetItem.x,
        y: targetItem.y,
        meaning: targetItem.word.meaning,
        points: pointsEarned,
        hanzi: targetItem.word.hanzi,
      },
    ]);
  };

  // Toggle audio
  const toggleMute = () => {
    const nextMute = !muted;
    setMuted(nextMute);
    setGameAudioMuted(nextMute);
  };

  // Stats calculation
  const totalPlaySeconds = startTime
    ? Math.max(1, Math.round((Date.now() - startTime) / 1000))
    : 1;
  const cpm = Math.round((totalCharactersTyped / totalPlaySeconds) * 60);
  const accuracy =
    wordsBurstCount + totalMisses > 0
      ? Math.round((wordsBurstCount / (wordsBurstCount + totalMisses)) * 100)
      : 100;

  return (
    <div
      className={`relative min-h-screen select-none overflow-hidden bg-zinc-950 font-sans text-white transition-transform duration-100 ${
        screenShake ? "scale-[0.99] translate-y-1" : ""
      }`}
    >
      {/* Top Header Controls Bar */}
      <header className="relative z-20 flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-800/80 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
            title="Về trang chủ"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-rose-500" />
              <h1 className="text-sm font-bold tracking-tight text-white">
                Phi Đao Luyện Chữ
              </h1>
            </div>
            <p className="text-[11px] text-zinc-400">
              {collectionId.toUpperCase()} · Gõ Pinyin để phóng phi đao
            </p>
          </div>
        </div>

        {/* Status Center (Score, Combo, Lives) */}
        <div className="flex items-center gap-4 sm:gap-8">
          {/* Hearts / Lives */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heartIdx) => (
              <Heart
                key={heartIdx}
                className={`h-5 w-5 transition-all duration-300 ${
                  heartIdx <= lives
                    ? "fill-rose-500 text-rose-500 scale-110"
                    : "fill-zinc-800 text-zinc-700 opacity-40 scale-95"
                }`}
              />
            ))}
          </div>

          {/* Score */}
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
              Điểm
            </span>
            <p className="text-xl font-black text-amber-400 tracking-tight">
              {score.toLocaleString()}
            </p>
          </div>

          {/* Combo */}
          <div className="flex items-center gap-1 rounded-lg bg-zinc-800/80 px-2.5 py-1">
            <Flame
              className={`h-4 w-4 transition-transform ${
                combo > 0 ? "text-amber-500 animate-bounce" : "text-zinc-600"
              }`}
            />
            <span className="text-xs font-bold text-amber-400">
              x{combo}
            </span>
          </div>
        </div>

        {/* Right Settings (Hint toggle, sound) */}
        <div className="flex items-center gap-2">
          {/* Hint Toggle */}
          <button
            type="button"
            onClick={() => setShowPinyinHint(!showPinyinHint)}
            className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${
              showPinyinHint
                ? "border-sky-500/40 bg-sky-500/10 text-sky-400"
                : "border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:text-white"
            }`}
            title={showPinyinHint ? "Đang hiện gợi ý Pinyin" : "Chỉ hiện chữ Hán"}
          >
            {showPinyinHint ? (
              <Eye className="h-3.5 w-3.5" />
            ) : (
              <EyeOff className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {showPinyinHint ? "Gợi ý Pinyin" : "Ẩn Pinyin"}
            </span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-800/80 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
            title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
          >
            {muted ? (
              <VolumeX className="h-4 w-4 text-rose-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-400" />
            )}
          </button>
        </div>
      </header>

      {/* Main Falling Words Arena Canvas */}
      <main className="relative h-[calc(100vh-140px)] w-full overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-zinc-950 to-black">
        {/* Subtle grid background effect */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Ready / Start Overlay */}
        {gameState === "READY" && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm p-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-500/30 bg-rose-500/10 text-rose-500 shadow-xl shadow-rose-500/10 animate-pulse">
              <Swords className="h-10 w-10" />
            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl text-white">
              Phi Đao Luyện Chữ
            </h2>
            <p className="mt-2 max-w-md text-sm text-zinc-400 leading-relaxed">
              Các chữ Hán sẽ rơi tự do từ trên xuống. Hãy gõ nhanh phiên âm{" "}
              <strong className="text-white">Pinyin</strong> để phóng phi đao làm
              nổ tung từ trước khi chạm vạch nguy hiểm!
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300">
                ❤️ 3 Mạng
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300">
                🔥 Chuỗi Combo điểm
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300">
                🔊 Phát âm giọng bản xứ
              </div>
            </div>

            <button
              type="button"
              onClick={initGame}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-rose-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-500 active:scale-95"
            >
              <Play className="h-5 w-5 fill-white" />
              Bắt Đầu Phóng Phi Đao
            </button>
          </div>
        )}

        {/* Active Falling Words */}
        {activeWords.map((item) => {
          const isBurst = item.state === "burst";
          const isMissed = item.state === "missed";

          return (
            <div
              key={item.instanceId}
              className={`absolute -translate-x-1/2 transition-transform ${
                isBurst
                  ? "scale-150 opacity-0 duration-300 pointer-events-none"
                  : isMissed
                  ? "scale-105"
                  : "duration-75"
              }`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
              }}
            >
              <div
                className={`relative flex flex-col items-center rounded-2xl border px-5 py-2.5 shadow-lg backdrop-blur-md transition-all ${
                  isBurst
                    ? "border-emerald-400 bg-emerald-500/30 text-white shadow-emerald-500/50"
                    : isMissed
                    ? "border-rose-500 bg-rose-950/80 text-rose-300 shadow-rose-500/40 animate-bounce"
                    : "border-zinc-700/80 bg-zinc-900/90 text-white hover:border-zinc-500 shadow-black/60"
                }`}
              >
                {/* Big Hanzi characters */}
                <span className="text-2xl sm:text-3xl font-black tracking-wider drop-shadow-md">
                  {item.word.hanzi}
                </span>

                {/* Pinyin hint */}
                {(showPinyinHint || isMissed) && (
                  <span
                    className={`mt-0.5 text-xs font-semibold tracking-wide ${
                      isMissed ? "text-rose-400 font-bold" : "text-sky-300"
                    }`}
                  >
                    {item.word.pinyin}
                  </span>
                )}

                {/* Level badge */}
                <span className="absolute -top-2 -right-2 rounded-full border border-zinc-700 bg-zinc-800 px-1.5 py-0.2 text-[9px] font-bold text-zinc-300">
                  H{item.word.hskLevel}
                </span>

                {/* Missed meaning reveal */}
                {isMissed && (
                  <span className="mt-1 text-[10px] font-bold text-rose-200">
                    {item.word.meaning}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* Flying Dagger Projectiles */}
        {daggers.map((dagger) => (
          <div
            key={dagger.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-20 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]"
            style={{
              left: `${dagger.currentX}%`,
              top: `${dagger.currentY}%`,
            }}
          >
            <div className="-rotate-45 scale-125">
              <Swords className="h-6 w-6 text-rose-400" />
            </div>
          </div>
        ))}

        {/* Floating Burst Effects (Word Meaning + Points) */}
        {burstEffects.map((burst) => (
          <div
            key={burst.id}
            className="pointer-events-none absolute -translate-x-1/2 z-20 flex flex-col items-center animate-in fade-in zoom-in-50 duration-300"
            style={{
              left: `${burst.x}%`,
              top: `${burst.y}%`,
            }}
          >
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-bounce">
              +{burst.points} · {burst.meaning}
            </span>
          </div>
        ))}

        {/* Bottom Danger Zone Line */}
        <div className="absolute bottom-0 left-0 right-0 h-10 border-t-2 border-dashed border-rose-500/40 bg-gradient-to-t from-rose-950/40 to-transparent flex items-center justify-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-rose-500/60">
            ⚠ Vạch Nguy Hiểm ⚠
          </span>
        </div>
      </main>

      {/* Bottom Launcher & Typing Bar */}
      <footer className="relative z-20 flex h-20 items-center justify-center border-t border-zinc-800 bg-zinc-900/95 px-4">
        <div className="relative flex w-full max-w-xl items-center">
          {/* Launcher Dagger Icon Indicator */}
          <div className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/30 shadow-inner">
            <Swords className="h-5 w-5" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={gameState !== "PLAYING"}
            placeholder={
              gameState === "PLAYING"
                ? "Gõ Pinyin (vd: nihao, laoshi...) để bắn phi đao..."
                : "Bấm Bắt Đầu để chơi..."
            }
            className="h-14 w-full rounded-2xl border border-zinc-700 bg-zinc-950 pl-16 pr-24 text-base font-bold text-white shadow-lg outline-none placeholder:text-zinc-600 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 transition-all"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          {/* Quick Enter Hint */}
          <div className="absolute right-3 hidden sm:flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] font-semibold text-zinc-400">
            <span>Enter</span>
          </div>
        </div>
      </footer>

      {/* Game Over / Victory Modal */}
      {(gameState === "GAME_OVER" || gameState === "VICTORY") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 sm:p-8 text-center shadow-2xl shadow-black/90">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border shadow-xl">
              {gameState === "VICTORY" ? (
                <div className="border-amber-500/30 bg-amber-500/10 text-amber-400">
                  <Trophy className="h-10 w-10" />
                </div>
              ) : (
                <div className="border-rose-500/30 bg-rose-500/10 text-rose-500">
                  <AlertCircle className="h-10 w-10" />
                </div>
              )}
            </div>

            <h3 className="mt-4 text-2xl font-black text-white sm:text-3xl">
              {gameState === "VICTORY" ? "Chiến Thắng!" : "Hết Lượt Chơi!"}
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              {gameState === "VICTORY"
                ? "Bạn đã phá vỡ toàn bộ từ vựng trong vòng này!"
                : "Đừng nản lòng, phản xạ chữ Hán sẽ nhanh dần theo từng trận!"}
            </p>

            {/* Stats Overview */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                <span className="text-[10px] uppercase font-bold text-zinc-500">
                  Tổng Điểm
                </span>
                <p className="text-2xl font-black text-amber-400">
                  {score.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                <span className="text-[10px] uppercase font-bold text-zinc-500">
                  Max Combo
                </span>
                <p className="text-2xl font-black text-rose-400">
                  🔥 x{maxCombo}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                <span className="text-[10px] uppercase font-bold text-zinc-500">
                  Tốc Độ Gõ (CPM)
                </span>
                <p className="text-xl font-bold text-sky-400">
                  {cpm} ký tự/phút
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
                <span className="text-[10px] uppercase font-bold text-zinc-500">
                  Độ Chính Xác
                </span>
                <p className="text-xl font-bold text-emerald-400">
                  {accuracy}%
                </p>
              </div>
            </div>

            {/* Words Burst Count */}
            <div className="mt-3 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/60 px-4 py-2.5 text-xs text-zinc-300">
              <span>Số từ đã tiêu diệt:</span>
              <strong className="text-white font-bold">
                {wordsBurstCount} từ
              </strong>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <Link
                href="/"
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-xs font-bold text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
              >
                Về Trang Chủ
              </Link>

              <button
                type="button"
                onClick={initGame}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-rose-600/30 transition hover:bg-rose-500 active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                Chơi Lại Trận Mới
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
