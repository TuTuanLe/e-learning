// Audio and phonetics utilities for Pinyin learning and drills

export const PINYIN_AUDIO_BASE_URL =
  "https://raw.githubusercontent.com/davinfifield/mp3-chinese-pinyin-sound/master/mp3";

export const TONE_MARKS: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

export function toAudioSlug(syllable: string): string {
  return syllable.normalize("NFC").replaceAll("ü", "uu");
}

export function getPinyinAudioUrl(syllable: string, tone: number): string {
  return `${PINYIN_AUDIO_BASE_URL}/${toAudioSlug(syllable)}${tone}.mp3`;
}

export function markTone(syllable: string, tone: number): string {
  if (tone === 5 || tone === 0) return syllable;

  const lower = syllable.toLowerCase();
  let markIndex = ["a", "e", "o"].findIndex((vowel) => lower.includes(vowel));

  if (markIndex >= 0) {
    const vowel = ["a", "e", "o"][markIndex];
    markIndex = lower.indexOf(vowel);
  } else if (lower.includes("iu")) {
    markIndex = lower.indexOf("iu") + 1;
  } else if (lower.includes("ui")) {
    markIndex = lower.indexOf("ui") + 1;
  } else {
    markIndex = ["i", "u", "ü"]
      .map((vowel) => lower.indexOf(vowel))
      .filter((index) => index >= 0)
      .sort((left, right) => left - right)[0];
  }

  const vowel = syllable[markIndex]?.toLowerCase();
  const replacement = TONE_MARKS[vowel]?.[tone - 1];

  if (!replacement) return syllable;

  return `${syllable.slice(0, markIndex)}${replacement}${syllable.slice(
    markIndex + 1,
  )}`;
}

export function speakWithBrowser(
  text: string,
  tone: number = 5,
  rateModifier: number = 1,
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  const toneSettings: Record<number, { pitch: number; rate: number }> = {
    1: { pitch: 1.28, rate: 0.72 },
    2: { pitch: 1.12, rate: 0.7 },
    3: { pitch: 0.82, rate: 0.66 },
    4: { pitch: 1.38, rate: 0.7 },
    5: { pitch: 1.0, rate: 0.82 },
    0: { pitch: 1.0, rate: 0.82 },
  };

  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const chineseVoice = voices.find((voice) =>
    voice.lang.toLowerCase().startsWith("zh"),
  );
  const settings = toneSettings[tone] ?? toneSettings[5];

  utterance.lang = chineseVoice?.lang ?? "zh-CN";
  utterance.rate = settings.rate * rateModifier;
  utterance.pitch = settings.pitch;
  if (chineseVoice) utterance.voice = chineseVoice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

// Global active audio reference to prevent overlapping sounds
let activeAudio: HTMLAudioElement | null = null;
let currentPlayId = 0;

export function stopCurrentAudio(): void {
  currentPlayId += 1;
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function playSyllableAudio(
  syllable: string,
  tone: number,
  fallbackText?: string,
  onEnd?: () => void,
): void {
  stopCurrentAudio();
  const thisPlayId = currentPlayId;

  if (typeof window !== "undefined" && tone >= 1 && tone <= 4) {
    const audioUrl = getPinyinAudioUrl(syllable, tone);
    const audio = new Audio(audioUrl);
    audio.preload = "auto";
    activeAudio = audio;

    audio.onended = () => {
      if (currentPlayId === thisPlayId) {
        activeAudio = null;
        onEnd?.();
      }
    };

    audio.onerror = () => {
      if (currentPlayId !== thisPlayId) return;
      activeAudio = null;
      speakWithBrowser(fallbackText || markTone(syllable, tone), tone);
      onEnd?.();
    };

    void audio.play().catch(() => {
      if (currentPlayId !== thisPlayId) return;
      activeAudio = null;
      speakWithBrowser(fallbackText || markTone(syllable, tone), tone);
      onEnd?.();
    });
    return;
  }

  // Tone 5 (neutral tone) or browser fallback
  speakWithBrowser(fallbackText || markTone(syllable, tone), tone);
  // Neutral tone is short; trigger onEnd after brief delay
  setTimeout(() => {
    if (currentPlayId === thisPlayId) onEnd?.();
  }, 400);
}

export function playTonePairAudio(
  s1: string,
  t1: number,
  s2: string,
  t2: number,
  hanziFallback?: string,
  onEnd?: () => void,
): void {
  stopCurrentAudio();
  const thisPlayId = currentPlayId;

  // If hanzi fallback is provided, browser speech synthesis often provides natural Chinese word prosody
  // But native syllable pair gives authentic tone contrasts. Let's play s1 then s2:
  playSyllableAudio(s1, t1, undefined, () => {
    if (currentPlayId !== thisPlayId) return;
    setTimeout(() => {
      if (currentPlayId !== thisPlayId) return;
      playSyllableAudio(s2, t2, undefined, onEnd);
    }, 90);
  });
}
