"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Suspense,
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
  Swords,
  Eye,
  EyeOff,
  AlertCircle,
  Play,
  Sparkles,
} from "lucide-react";
import {
  getWordsForGame,
  normalizePinyinForGame,
  type GameWord,
} from "@/data/falling-words.data";
import {
  playBowShoot,
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
  x: number; // percentage 10..85%
  y: number; // percentage 0..100%
  speed: number; // percentage per second
  state: "falling" | "burst" | "missed";
  burstAt?: number;
}

interface FlyingArrow {
  id: string;
  startX: number; // percentage (approx 50%)
  startY: number; // percentage (approx 85%)
  targetX: number;
  targetY: number;
  currentX: number;
  currentY: number;
  angle: number; // degrees
  createdAt: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
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

interface SakuraPetal {
  id: number;
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  rotationSpeed: number;
  opacity: number;
}

interface Star {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  twinkleSpeed: number;
}

export default function FallingWordsGamePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0d1322] text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
            <p className="text-xs font-semibold tracking-wider text-slate-400">
              Đang chuẩn bị đấu trường đêm trăng...
            </p>
          </div>
        </div>
      }
    >
      <FallingWordsGameContent />
    </Suspense>
  );
}

function FallingWordsGameContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const collectionId = searchParams.get("collectionId") || "hsk-1";
  const unitId = searchParams.get("unitId") || "";

  // Settings
  const [showPinyinHint, setShowPinyinHint] = useState(true);
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

  // Active game entities
  const [activeWords, setActiveWords] = useState<ActiveFallingWord[]>([]);
  const [arrows, setArrows] = useState<FlyingArrow[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [burstEffects, setBurstEffects] = useState<BurstEffect[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [screenShake, setScreenShake] = useState(false);

  // Hero archer state
  const [heroAimAngle, setHeroAimAngle] = useState(0);
  const [heroRecoil, setHeroRecoil] = useState(false);

  // Word queues & refs
  const wordQueueRef = useRef<GameWord[]>([]);
  const answeredWordsRef = useRef<GameWord[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSpawnTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pre-generate stars
  const starsRef = useRef<Star[]>(
    Array.from({ length: 65 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 85,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.008,
    })),
  );

  // Sakura petals state in canvas
  const petalsRef = useRef<SakuraPetal[]>(
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 5,
      speedY: Math.random() * 0.08 + 0.04,
      speedX: Math.random() * 0.04 - 0.02,
      angle: Math.random() * 360,
      rotationSpeed: Math.random() * 1.5 - 0.75,
      opacity: Math.random() * 0.5 + 0.35,
    })),
  );

  // Background Canvas animation (Twinkling stars & floating sakura petals)
  useEffect(() => {
    const canvas = bgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const renderBg = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Twinkling Stars
      starsRef.current.forEach((star) => {
        star.alpha += star.twinkleSpeed;
        if (star.alpha > 1 || star.alpha < 0.2) {
          star.twinkleSpeed = -star.twinkleSpeed;
        }
        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, Math.min(1, star.alpha))})`;
        ctx.beginPath();
        ctx.arc(
          (star.x / 100) * canvas.width,
          (star.y / 100) * canvas.height,
          star.radius,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.restore();
      });

      // Draw Drifting Sakura Petals
      petalsRef.current.forEach((petal) => {
        petal.y += petal.speedY;
        petal.x += petal.speedX + Math.sin(petal.y * 0.05) * 0.03;
        petal.angle += petal.rotationSpeed;

        if (petal.y > 100) {
          petal.y = -5;
          petal.x = Math.random() * 100;
        }
        if (petal.x > 100) petal.x = 0;
        if (petal.x < 0) petal.x = 100;

        const px = (petal.x / 100) * canvas.width;
        const py = (petal.y / 100) * canvas.height;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate((petal.angle * Math.PI) / 180);
        ctx.fillStyle = `rgba(251, 182, 206, ${petal.opacity})`;

        // Petal shape
        ctx.beginPath();
        ctx.ellipse(0, 0, petal.size, petal.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(renderBg);
    };

    animId = requestAnimationFrame(renderBg);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Initialize word pool
  const initGame = useCallback(() => {
    const words = getWordsForGame(collectionId, unitId);
    wordQueueRef.current = [...words];
    answeredWordsRef.current = [];
    setActiveWords([]);
    setArrows([]);
    setParticles([]);
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
    }, 120);
  }, [collectionId, unitId]);

  // Spawn word
  const spawnWord = useCallback(() => {
    if (wordQueueRef.current.length === 0) return;
    const nextWord = wordQueueRef.current.shift();
    if (!nextWord) return;

    // Distribute randomly across screen width (12% to 84%)
    const randomX = 12 + Math.random() * 72;

    const newWord: ActiveFallingWord = {
      instanceId: `word-${Date.now()}-${Math.random()}`,
      word: nextWord,
      x: randomX,
      y: 4,
      speed: 3.8, // gentle and readable fall speed
      state: "falling",
    };

    setActiveWords((prev) => [...prev, newWord]);
  }, []);

  // Main game physics & animation tick
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

      // Spawn check: every 2.8 - 3.4 seconds
      const currentTime = Date.now();
      const spawnInterval = Math.max(2200, 3400 - wordsBurstCount * 35);
      if (
        currentTime - lastSpawnTimeRef.current > spawnInterval &&
        wordQueueRef.current.length > 0
      ) {
        lastSpawnTimeRef.current = currentTime;
        spawnWord();
      }

      // Update falling words
      setActiveWords((prevWords) => {
        const nextWords: ActiveFallingWord[] = [];
        let hitBottom = false;

        for (const item of prevWords) {
          if (item.state === "burst") {
            if (currentTime - (item.burstAt || 0) < 400) {
              nextWords.push(item);
            }
            continue;
          }

          const nextY = item.y + item.speed * dt;

          // Danger limit reached (82% height near bottom ground)
          if (nextY >= 82 && item.state === "falling") {
            hitBottom = true;
            nextWords.push({ ...item, y: 82, state: "missed" });
            playLifeLostSound();
            answeredWordsRef.current.push(item.word);
            setTotalMisses((m) => m + 1);
            setCombo(0);
          } else if (item.state === "missed") {
            if (nextY < 90) {
              nextWords.push({ ...item, y: nextY + item.speed * dt * 0.5 });
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

        if (
          nextWords.length === 0 &&
          wordQueueRef.current.length === 0 &&
          lives > 0
        ) {
          setGameState("VICTORY");
        }

        return nextWords;
      });

      // Update flying arrows
      setArrows((prevArrows) => {
        const remaining: FlyingArrow[] = [];
        for (const arrow of prevArrows) {
          const progress = (now - arrow.createdAt) / 190; // 190ms lightning flight
          if (progress < 1) {
            remaining.push({
              ...arrow,
              currentX:
                arrow.startX + (arrow.targetX - arrow.startX) * progress,
              currentY:
                arrow.startY + (arrow.targetY - arrow.startY) * progress,
            });
          }
        }
        return remaining;
      });

      // Update explosion particles
      setParticles((prevParticles) => {
        return prevParticles
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt * 60,
            y: p.y + p.vy * dt * 60,
            alpha: Math.max(0, p.alpha - dt * 2.2),
          }))
          .filter((p) => p.alpha > 0.05);
      });

      // Clear old burst notifications
      setBurstEffects((prev) =>
        prev.filter((effect) => Date.now() - parseInt(effect.id.split("-")[1] || "0") < 1100),
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

  // Handle typing matching
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setInputVal(rawVal);

    const normalizedTyped = normalizePinyinForGame(rawVal);
    if (!normalizedTyped) return;

    // Find closest or matching falling word
    const targetItem = activeWords.find(
      (item) =>
        item.state === "falling" &&
        (item.word.pinyinRaw.toLowerCase() === normalizedTyped ||
          normalizePinyinForGame(item.word.pinyin) === normalizedTyped),
    );

    if (targetItem) {
      shootBowAtWord(targetItem);
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
        shootBowAtWord(targetItem);
        setInputVal("");
      } else {
        setInputVal("");
      }
    }
  };

  // Launch archery arrow at target word
  const shootBowAtWord = (targetItem: ActiveFallingWord) => {
    const startX = 50;
    const startY = 86;

    // Calculate aiming angle
    const deltaX = targetItem.x - startX;
    const deltaY = targetItem.y - startY;
    const angleDeg = (Math.atan2(deltaY, deltaX) * 180) / Math.PI + 90;

    setHeroAimAngle(angleDeg);
    setHeroRecoil(true);
    setTimeout(() => setHeroRecoil(false), 220);

    // Play bow shoot sound
    playBowShoot();

    // Spawn arrow
    const newArrow: FlyingArrow = {
      id: `arrow-${Date.now()}`,
      startX,
      startY,
      targetX: targetItem.x,
      targetY: targetItem.y,
      currentX: startX,
      currentY: startY,
      angle: angleDeg - 90,
      createdAt: performance.now(),
    };
    setArrows((prev) => [...prev, newArrow]);

    // Burst word on impact (160ms)
    setTimeout(() => {
      playWordBurst();
      speakWord(targetItem.word.hanzi);

      // Create burst particles
      const colors = ["#f43f5e", "#fb7185", "#38bdf8", "#fde047", "#ffffff", "#f472b6"];
      const newSparks: Particle[] = Array.from({ length: 14 }, (_, i) => {
        const rad = (Math.PI * 2 * i) / 14 + (Math.random() - 0.5);
        const speed = Math.random() * 3.5 + 2.0;
        return {
          id: `p-${Date.now()}-${i}`,
          x: targetItem.x,
          y: targetItem.y,
          vx: Math.cos(rad) * speed * 0.25,
          vy: Math.sin(rad) * speed * 0.25,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 2,
          alpha: 1,
          createdAt: Date.now(),
        };
      });
      setParticles((prev) => [...prev, ...newSparks]);
    }, 160);

    // Mark word as burst
    const now = Date.now();
    setActiveWords((prev) =>
      prev.map((w) =>
        w.instanceId === targetItem.instanceId
          ? { ...w, state: "burst", burstAt: now }
          : w,
      ),
    );

    // Points & Combo
    const nextCombo = combo + 1;
    setCombo(nextCombo);
    setMaxCombo((prev) => Math.max(prev, nextCombo));
    if (nextCombo >= 3) {
      playComboSound(nextCombo);
    }

    const pointsEarned = 100 + nextCombo * 25;
    setScore((prev) => prev + pointsEarned);
    setWordsBurstCount((prev) => prev + 1);
    setTotalCharactersTyped((prev) => prev + targetItem.word.pinyinRaw.length);
    answeredWordsRef.current.push(targetItem.word);

    // Floating text notification
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

  const toggleMute = () => {
    const nextMute = !muted;
    setMuted(nextMute);
    setGameAudioMuted(nextMute);
  };

  // Performance calculations
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
      className={`relative min-h-screen select-none overflow-hidden bg-[#0d1322] font-sans text-white transition-transform duration-100 ${
        screenShake ? "scale-[0.99] translate-y-1" : ""
      }`}
    >
      {/* Background Canvas for Twinkling Stars & Sakura Petals */}
      <canvas
        ref={bgCanvasRef}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full"
      />

      {/* Radiant Full Moon in Upper Right Corner (with subtle lunar craters) */}
      <div className="pointer-events-none absolute top-7 right-8 sm:top-10 sm:right-20 z-0 flex items-center justify-center">
        {/* Soft lunar aura */}
        <div className="absolute h-36 w-36 rounded-full bg-slate-300/10 blur-2xl" />
        {/* The Moon */}
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-gradient-to-tr from-[#c8d6e5] via-[#dce4ec] to-[#edf2f7] shadow-[0_0_35px_12px_rgba(200,214,229,0.22)]">
          {/* Subtle lunar craters */}
          <div className="absolute top-4 left-4 h-3 w-3 rounded-full bg-[#a8b8c8]/30" />
          <div className="absolute top-8 left-9 h-4 w-4 rounded-full bg-[#a8b8c8]/25" />
          <div className="absolute bottom-5 left-6 h-5 w-5 rounded-full bg-[#a8b8c8]/20" />
        </div>
      </div>

      {/* Top Header Controls Bar (Frosted glass floating bar) */}
      <header className="relative z-20 flex h-16 items-center justify-between border-b border-white/10 bg-[#0d1322]/80 px-4 sm:px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/15 hover:text-white active:scale-95"
            title="Về trang chủ"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <Swords className="h-4 w-4 text-rose-400" />
              <h1 className="text-sm font-bold tracking-tight text-white">
                Phi Đao Luyện Chữ
              </h1>
            </div>
            <p className="text-[11px] text-slate-400">
              {collectionId.toUpperCase()} · Đấu trường đêm trăng
            </p>
          </div>
        </div>

        {/* Status Center (Hearts, Score, Combo) */}
        <div className="flex items-center gap-4 sm:gap-7">
          {/* Hearts / Lives */}
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((heartIdx) => (
              <Heart
                key={heartIdx}
                className={`h-5 w-5 transition-all duration-300 ${
                  heartIdx <= lives
                    ? "fill-rose-500 text-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)] scale-110"
                    : "fill-slate-800 text-slate-700 opacity-40 scale-95"
                }`}
              />
            ))}
          </div>

          {/* Score */}
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Điểm
            </span>
            <p className="text-xl font-black text-amber-300 tracking-tight drop-shadow-[0_0_8px_rgba(252,211,77,0.3)]">
              {score.toLocaleString()}
            </p>
          </div>

          {/* Combo */}
          <div className="flex items-center gap-1 rounded-xl bg-white/5 border border-white/10 px-2.5 py-1">
            <Flame
              className={`h-4 w-4 transition-transform ${
                combo > 0 ? "text-amber-400 animate-bounce" : "text-slate-600"
              }`}
            />
            <span className="text-xs font-bold text-amber-300">
              x{combo}
            </span>
          </div>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          {/* Hint Toggle */}
          <button
            type="button"
            onClick={() => setShowPinyinHint(!showPinyinHint)}
            className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition ${
              showPinyinHint
                ? "border-sky-400/40 bg-sky-400/10 text-sky-300"
                : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
            }`}
            title={showPinyinHint ? "Đang hiện Pinyin" : "Chỉ hiện chữ Hán"}
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
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/15 hover:text-white"
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

      {/* Main Game Stage Arena */}
      <main className="relative h-[calc(100vh-140px)] w-full overflow-hidden">
        {/* Start / Ready Modal Overlay */}
        {gameState === "READY" && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0d1322]/85 backdrop-blur-md p-6 text-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-rose-400/30 bg-rose-500/10 text-rose-400 shadow-2xl shadow-rose-500/20">
              <Swords className="h-12 w-12 animate-pulse" />
            </div>

            <h2 className="mt-6 text-3xl font-black tracking-tight sm:text-4xl text-white drop-shadow-md">
              Phi Đao Luyện Chữ
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-300 leading-relaxed">
              Các chữ Hán sẽ rơi tự do từ bầu trời đêm. Hãy gõ nhanh phiên âm{" "}
              <strong className="text-white">Pinyin</strong> để hiệp khách giương
              cung bắn hạ từng chữ trước khi chạm đất!
            </p>

            <button
              type="button"
              onClick={initGame}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-rose-600/30 transition hover:scale-105 active:scale-95"
            >
              <Play className="h-5 w-5 fill-white" />
              Bắt Đầu Trận Đấu
            </button>
          </div>
        )}

        {/* ACTIVE FALLING WORDS (Floating Glowing Neon Typography) */}
        {activeWords.map((item) => {
          const isBurst = item.state === "burst";
          const isMissed = item.state === "missed";
          const isNearBottom = item.y >= 58;

          return (
            <div
              key={item.instanceId}
              className={`absolute -translate-x-1/2 flex flex-col items-center transition-all ${
                isBurst
                  ? "scale-150 opacity-0 duration-300 pointer-events-none"
                  : isMissed
                  ? "scale-110 animate-bounce duration-150"
                  : "duration-75"
              }`}
              style={{
                left: `${item.x}%`,
                top: `${item.y}%`,
              }}
            >
              {/* Pinyin hint above */}
              {(showPinyinHint || isMissed) && (
                <span
                  className={`text-xs font-mono font-bold tracking-widest transition-colors ${
                    isMissed
                      ? "text-rose-400"
                      : isNearBottom
                      ? "text-rose-300"
                      : "text-sky-200/90"
                  }`}
                  style={{
                    textShadow: isNearBottom
                      ? "0 0 8px rgba(244,63,94,0.6)"
                      : "0 0 6px rgba(56,189,248,0.5)",
                  }}
                >
                  {item.word.pinyin}
                </span>
              )}

              {/* Chinese Characters with Neon Aura */}
              <span
                className={`text-3xl sm:text-4xl font-black tracking-wider transition-colors select-none ${
                  isMissed
                    ? "text-rose-400"
                    : isNearBottom
                    ? "text-rose-400"
                    : "text-white"
                }`}
                style={{
                  textShadow: isMissed || isNearBottom
                    ? "0 0 16px rgba(244,63,94,0.9), 0 0 30px rgba(244,63,94,0.5)"
                    : "0 0 14px rgba(255,255,255,0.8), 0 0 28px rgba(56,189,248,0.4)",
                }}
              >
                {item.word.hanzi}
              </span>

              {/* Missed meaning reveal in red */}
              {isMissed && (
                <span className="mt-1 rounded-md bg-rose-950/90 border border-rose-500/50 px-2 py-0.5 text-[10px] font-bold text-rose-200">
                  {item.word.meaning}
                </span>
              )}
            </div>
          );
        })}

        {/* FLYING ARROWS / PROJECTILES WITH LIGHT BEAM */}
        {arrows.map((arrow) => (
          <div
            key={arrow.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 z-20"
            style={{
              left: `${arrow.currentX}%`,
              top: `${arrow.currentY}%`,
              transform: `translate(-50%, -50%) rotate(${arrow.angle}deg)`,
            }}
          >
            {/* Luminous Arrow Head & Energy Trail */}
            <div className="relative flex items-center justify-center">
              {/* Glowing tail trail */}
              <div className="h-10 w-1 bg-gradient-to-t from-transparent via-amber-400 to-white drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" />
              {/* Arrow tip spark */}
              <div className="absolute -top-1 h-3 w-3 rounded-full bg-white shadow-[0_0_12px_4px_rgba(255,255,255,1)]" />
            </div>
          </div>
        ))}

        {/* PARTICLE BURST SPARKS */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full z-20"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: p.color,
              opacity: p.alpha,
              boxShadow: `0 0 10px ${p.color}`,
            }}
          />
        ))}

        {/* FLOATING BURST MEANING & BONUS POINTS */}
        {burstEffects.map((burst) => (
          <div
            key={burst.id}
            className="pointer-events-none absolute -translate-x-1/2 z-20 flex flex-col items-center animate-in fade-in zoom-in-75 duration-200"
            style={{
              left: `${burst.x}%`,
              top: `${burst.y}%`,
            }}
          >
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/50 px-3 py-1 text-xs font-black text-emerald-300 shadow-[0_0_14px_rgba(52,211,153,0.4)] animate-bounce">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span>+{burst.points} · {burst.meaning}</span>
            </div>
          </div>
        ))}

        {/* SCENERY: BOTTOM GROUND LANDSCAPE & SAKURA BRANCH SILHOUETTES */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10">
          {/* Ground slope silhouette */}
          <svg
            viewBox="0 0 1440 90"
            fill="none"
            className="w-full h-16 sm:h-20 text-[#090e18]"
            preserveAspectRatio="none"
          >
            <path
              d="M0,45 C320,80 600,30 900,55 C1200,80 1350,35 1440,45 L1440,90 L0,90 Z"
              fill="currentColor"
            />
          </svg>

          {/* Stylized Cherry Blossom Tree Silhouettes on Sides */}
          <div className="absolute -bottom-1 left-4 sm:left-14 flex items-end gap-3 opacity-80">
            <svg width="45" height="60" viewBox="0 0 45 60" fill="none">
              <path d="M22 60 Q20 30 10 15 M20 35 Q32 20 40 10" stroke="#1a2538" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="10" cy="15" r="3.5" fill="#f472b6" opacity="0.85" />
              <circle cx="40" cy="10" r="3.5" fill="#f472b6" opacity="0.85" />
              <circle cx="28" cy="22" r="2.8" fill="#fb7185" opacity="0.9" />
            </svg>
          </div>

          <div className="absolute -bottom-1 right-4 sm:right-14 flex items-end gap-3 opacity-80">
            <svg width="45" height="60" viewBox="0 0 45 60" fill="none">
              <path d="M22 60 Q25 30 35 15 M24 35 Q12 20 5 10" stroke="#1a2538" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="35" cy="15" r="3.5" fill="#f472b6" opacity="0.85" />
              <circle cx="5" cy="10" r="3.5" fill="#f472b6" opacity="0.85" />
              <circle cx="18" cy="24" r="2.8" fill="#fb7185" opacity="0.9" />
            </svg>
          </div>
        </div>

        {/* KUNG FU PANDA / ARCHER HERO CHARACTER AT BOTTOM CENTER */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
          <div
            className={`transition-transform duration-100 ${
              heroRecoil ? "scale-95 -translate-y-1" : "scale-100"
            }`}
          >
            {/* Custom SVG Kung Fu Archer Hero */}
            <svg
              width="90"
              height="85"
              viewBox="0 0 90 85"
              fill="none"
              className="drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
            >
              {/* Traditional Conical Bamboo Hat (Nón Trúc / Nón Lá) */}
              <polygon
                points="45,10 5,36 85,36"
                fill="#c29b68"
                stroke="#8d6e40"
                strokeWidth="1.5"
              />
              {/* Hat Texture & Rim */}
              <line x1="45" y1="10" x2="45" y2="36" stroke="#8d6e40" strokeWidth="1" />
              <line x1="45" y1="10" x2="25" y2="36" stroke="#8d6e40" strokeWidth="1" />
              <line x1="45" y1="10" x2="65" y2="36" stroke="#8d6e40" strokeWidth="1" />
              <polygon points="3,36 87,36 84,39 6,39" fill="#a07a46" />

              {/* Panda Head */}
              <circle cx="45" cy="46" r="18" fill="#ffffff" />
              {/* Black Ears */}
              <circle cx="30" cy="34" r="6" fill="#18181b" />
              <circle cx="60" cy="34" r="6" fill="#18181b" />

              {/* Panda Eye Patches */}
              <ellipse cx="38" cy="46" rx="5" ry="4" fill="#18181b" />
              <ellipse cx="52" cy="46" rx="5" ry="4" fill="#18181b" />
              {/* White Pupils */}
              <circle cx="39" cy="45" r="1.6" fill="#ffffff" />
              <circle cx="51" cy="45" r="1.6" fill="#ffffff" />

              {/* Nose & Smile */}
              <polygon points="45,51 43,49 47,49" fill="#18181b" />
              <path d="M42 54 Q45 57 48 54" stroke="#18181b" strokeWidth="1.2" fill="none" />

              {/* Martial Arts Robe / Body */}
              <path d="M30 64 L45 61 L60 64 L65 85 L25 85 Z" fill="#ffffff" />
              {/* Blue Vest */}
              <polygon points="33,63 45,74 57,63 53,85 37,85" fill="#38bdf8" opacity="0.9" />
              {/* Red Sash */}
              <rect x="34" y="73" width="22" height="4" fill="#e11d48" rx="1" />

              {/* Glowing Weapon / Bow in hand */}
              <g
                style={{
                  transformOrigin: "45px 65px",
                  transform: `rotate(${heroAimAngle * 0.4}deg)`,
                  transition: "transform 0.1s ease-out",
                }}
              >
                {/* Arc Bow */}
                <path
                  d="M20 50 Q28 65 24 80"
                  stroke="#fbbf24"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Bow String */}
                <line x1="20" y1="50" x2="24" y2="80" stroke="#ffffff" strokeWidth="0.8" opacity="0.8" />
              </g>
            </svg>
          </div>
        </div>
      </main>

      {/* BOTTOM TYPING BAR (Frosted glass floating pedestal) */}
      <footer className="relative z-20 flex h-20 items-center justify-center border-t border-white/10 bg-[#0d1322]/90 px-4 backdrop-blur-md">
        <div className="relative flex w-full max-w-lg items-center">
          {/* Kung fu icon */}
          <div className="absolute left-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
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
                ? "Gõ Pinyin (vd: nali, yixie...) để bắn cung..."
                : "Bấm Bắt Đầu Trận Đấu để chơi..."
            }
            className="h-14 w-full rounded-2xl border border-white/15 bg-white/5 pl-16 pr-24 text-base font-bold text-white shadow-xl outline-none placeholder:text-slate-500 focus:border-rose-400 focus:bg-white/10 focus:ring-4 focus:ring-rose-500/20 transition-all"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />

          <div className="absolute right-3 hidden sm:flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-semibold text-slate-400">
            <span>Enter</span>
          </div>
        </div>
      </footer>

      {/* GAME OVER & VICTORY MODAL */}
      {(gameState === "GAME_OVER" || gameState === "VICTORY") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#121929] p-6 sm:p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border shadow-xl">
              {gameState === "VICTORY" ? (
                <div className="border-amber-400/30 bg-amber-400/10 text-amber-300">
                  <Trophy className="h-10 w-10" />
                </div>
              ) : (
                <div className="border-rose-500/30 bg-rose-500/10 text-rose-400">
                  <AlertCircle className="h-10 w-10" />
                </div>
              )}
            </div>

            <h3 className="mt-4 text-2xl font-black text-white sm:text-3xl">
              {gameState === "VICTORY" ? "Đại Thắng!" : "Hết Lượt Chơi!"}
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              {gameState === "VICTORY"
                ? "Bạn đã hoàn thành xuất sắc toàn bộ từ vựng trong vòng này!"
                : "Phản xạ nhận diện chữ Hán sẽ sắc bén hơn sau mỗi trận đấu!"}
            </p>

            {/* Results Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Tổng Điểm
                </span>
                <p className="text-2xl font-black text-amber-300">
                  {score.toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Max Combo
                </span>
                <p className="text-2xl font-black text-rose-400">
                  🔥 x{maxCombo}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Tốc Độ Gõ (CPM)
                </span>
                <p className="text-xl font-bold text-sky-300">
                  {cpm} ký tự/phút
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Độ Chính Xác
                </span>
                <p className="text-xl font-bold text-emerald-300">
                  {accuracy}%
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-slate-300">
              <span>Số chữ đã bắn hạ:</span>
              <strong className="text-white font-bold">{wordsBurstCount} từ</strong>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <Link
                href="/"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
              >
                Về Trang Chủ
              </Link>

              <button
                type="button"
                onClick={initGame}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-rose-600/30 transition hover:scale-105 active:scale-95"
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
