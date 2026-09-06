// Web Audio API Synthesizer and Voice Audio for Flying Dagger game
// 100% client-side, zero latency, no external assets needed

let audioCtx: AudioContext | null = null;
let isMuted = false;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function setGameAudioMuted(muted: boolean): void {
  isMuted = muted;
}

export function isGameAudioMuted(): boolean {
  return isMuted;
}

// 1. Dagger Launch Whoosh Sound (High-speed projectile swoosh)
export function playDaggerWhoosh(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // White-noise-like frequency sweep
  osc.type = "triangle";
  osc.frequency.setValueAtTime(420, now);
  osc.frequency.exponentialRampToValueAtTime(1450, now + 0.08);
  osc.frequency.exponentialRampToValueAtTime(180, now + 0.16);

  gain.gain.setValueAtTime(0.01, now);
  gain.gain.linearRampToValueAtTime(0.35, now + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.16);
}

// 2. Word Hit & Burst Pop Sound (Crisp explosion chime)
export function playWordBurst(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Impact pop
  const popOsc = ctx.createOscillator();
  const popGain = ctx.createGain();
  popOsc.type = "sine";
  popOsc.frequency.setValueAtTime(320, now);
  popOsc.frequency.exponentialRampToValueAtTime(80, now + 0.09);

  popGain.gain.setValueAtTime(0.4, now);
  popGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

  popOsc.connect(popGain);
  popGain.connect(ctx.destination);
  popOsc.start(now);
  popOsc.stop(now + 0.09);

  // Sparkle chime
  const bellOsc = ctx.createOscillator();
  const bellGain = ctx.createGain();
  bellOsc.type = "triangle";
  bellOsc.frequency.setValueAtTime(880, now + 0.02); // A5
  bellOsc.frequency.exponentialRampToValueAtTime(1760, now + 0.14); // A6

  bellGain.gain.setValueAtTime(0.2, now + 0.02);
  bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  bellOsc.connect(bellGain);
  bellGain.connect(ctx.destination);
  bellOsc.start(now + 0.02);
  bellOsc.stop(now + 0.22);
}

// 3. Combo Escalation Chime (Plays on high streaks)
export function playComboSound(multiplier: number = 2): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const baseFreq = Math.min(1200, 523.25 + multiplier * 75); // Ascending notes

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(baseFreq, now);
  osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.15);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.25);
}

// 4. Life Lost / Miss Sound (Dull low impact)
export function playLifeLostSound(): void {
  if (isMuted) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(140, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.28);
}

// 5. Native Chinese voice pronunciation of word on hit
export function speakWord(hanzi: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const utterance = new SpeechSynthesisUtterance(hanzi);
  const voices = window.speechSynthesis.getVoices();
  const chineseVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith("zh"),
  );

  utterance.lang = chineseVoice?.lang ?? "zh-CN";
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  if (chineseVoice) utterance.voice = chineseVoice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
