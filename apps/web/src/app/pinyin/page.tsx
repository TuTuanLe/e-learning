"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  BookOpenText,
  ExternalLink,
  Play,
  Search,
  Video,
  Volume2,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";

const FINALS = [
  { id: "a", label: "a" },
  { id: "o", label: "o" },
  { id: "e", label: "e" },
  { id: "i", label: "i" },
  { id: "er", label: "er" },
  { id: "ai", label: "ai" },
  { id: "ei", label: "ei" },
  { id: "ao", label: "ao" },
  { id: "ou", label: "ou" },
  { id: "an", label: "an" },
  { id: "en", label: "en" },
  { id: "ang", label: "ang" },
  { id: "eng", label: "eng" },
  { id: "ong", label: "ong" },
  { id: "ia", label: "ia" },
  { id: "iao", label: "iao" },
  { id: "ie", label: "ie" },
  { id: "iu", label: "iu" },
  { id: "ian", label: "ian" },
  { id: "in", label: "in" },
  { id: "iang", label: "iang" },
  { id: "ing", label: "ing" },
  { id: "iong", label: "iong" },
  { id: "u", label: "u" },
  { id: "ua", label: "ua" },
  { id: "uo", label: "uo" },
  { id: "uai", label: "uai" },
  { id: "ui", label: "ui" },
  { id: "uan", label: "uan" },
  { id: "un", label: "un" },
  { id: "uang", label: "uang" },
  { id: "ueng", label: "ueng" },
  { id: "ü", label: "ü" },
  { id: "üe", label: "üe" },
  { id: "üan", label: "üan" },
  { id: "ün", label: "ün" },
] as const;

type FinalId = (typeof FINALS)[number]["id"];

type PinyinRow = {
  initial: string;
  group: string;
  cells: Partial<Record<FinalId, string>>;
};

type PinyinSyllable = {
  key: string;
  syllable: string;
  initial: string;
  initialLabel: string;
  final: FinalId;
  finalLabel: string;
  group: string;
};

const FINAL_LABEL_BY_ID = Object.fromEntries(
  FINALS.map((final) => [final.id, final.label]),
) as Record<FinalId, string>;

const PINYIN_ROWS: PinyinRow[] = [
  {
    initial: "",
    group: "Không thanh mẫu",
    cells: {
      a: "a",
      o: "o",
      e: "e",
      i: "yi",
      er: "er",
      ai: "ai",
      ei: "ei",
      ao: "ao",
      ou: "ou",
      an: "an",
      en: "en",
      ang: "ang",
      eng: "eng",
      ia: "ya",
      iao: "yao",
      ie: "ye",
      iu: "you",
      ian: "yan",
      in: "yin",
      iang: "yang",
      ing: "ying",
      iong: "yong",
      u: "wu",
      ua: "wa",
      uo: "wo",
      uai: "wai",
      ui: "wei",
      uan: "wan",
      un: "wen",
      uang: "wang",
      ueng: "weng",
      ü: "yu",
      üe: "yue",
      üan: "yuan",
      ün: "yun",
    },
  },
  {
    initial: "b",
    group: "Môi",
    cells: {
      a: "ba",
      o: "bo",
      ai: "bai",
      ei: "bei",
      ao: "bao",
      an: "ban",
      en: "ben",
      ang: "bang",
      eng: "beng",
      i: "bi",
      iao: "biao",
      ie: "bie",
      ian: "bian",
      in: "bin",
      ing: "bing",
      u: "bu",
    },
  },
  {
    initial: "p",
    group: "Môi",
    cells: {
      a: "pa",
      o: "po",
      ai: "pai",
      ei: "pei",
      ao: "pao",
      ou: "pou",
      an: "pan",
      en: "pen",
      ang: "pang",
      eng: "peng",
      i: "pi",
      iao: "piao",
      ie: "pie",
      ian: "pian",
      in: "pin",
      ing: "ping",
      u: "pu",
    },
  },
  {
    initial: "m",
    group: "Môi",
    cells: {
      a: "ma",
      o: "mo",
      e: "me",
      ai: "mai",
      ei: "mei",
      ao: "mao",
      ou: "mou",
      an: "man",
      en: "men",
      ang: "mang",
      eng: "meng",
      i: "mi",
      iao: "miao",
      ie: "mie",
      iu: "miu",
      ian: "mian",
      in: "min",
      ing: "ming",
      u: "mu",
    },
  },
  {
    initial: "f",
    group: "Môi",
    cells: {
      a: "fa",
      o: "fo",
      ei: "fei",
      ou: "fou",
      an: "fan",
      en: "fen",
      ang: "fang",
      eng: "feng",
      u: "fu",
    },
  },
  {
    initial: "d",
    group: "Đầu lưỡi",
    cells: {
      a: "da",
      e: "de",
      ai: "dai",
      ei: "dei",
      ao: "dao",
      ou: "dou",
      an: "dan",
      en: "den",
      ang: "dang",
      eng: "deng",
      ong: "dong",
      i: "di",
      iao: "diao",
      ie: "die",
      iu: "diu",
      ian: "dian",
      ing: "ding",
      u: "du",
      uo: "duo",
      ui: "dui",
      uan: "duan",
      un: "dun",
    },
  },
  {
    initial: "t",
    group: "Đầu lưỡi",
    cells: {
      a: "ta",
      e: "te",
      ai: "tai",
      ao: "tao",
      ou: "tou",
      an: "tan",
      ang: "tang",
      eng: "teng",
      ong: "tong",
      i: "ti",
      iao: "tiao",
      ie: "tie",
      ian: "tian",
      ing: "ting",
      u: "tu",
      uo: "tuo",
      ui: "tui",
      uan: "tuan",
      un: "tun",
    },
  },
  {
    initial: "n",
    group: "Đầu lưỡi",
    cells: {
      a: "na",
      e: "ne",
      ai: "nai",
      ei: "nei",
      ao: "nao",
      ou: "nou",
      an: "nan",
      en: "nen",
      ang: "nang",
      eng: "neng",
      ong: "nong",
      i: "ni",
      iao: "niao",
      ie: "nie",
      iu: "niu",
      ian: "nian",
      in: "nin",
      iang: "niang",
      ing: "ning",
      u: "nu",
      uo: "nuo",
      uan: "nuan",
      ü: "nü",
      üe: "nüe",
    },
  },
  {
    initial: "l",
    group: "Đầu lưỡi",
    cells: {
      a: "la",
      e: "le",
      ai: "lai",
      ei: "lei",
      ao: "lao",
      ou: "lou",
      an: "lan",
      ang: "lang",
      eng: "leng",
      ong: "long",
      i: "li",
      ia: "lia",
      iao: "liao",
      ie: "lie",
      iu: "liu",
      ian: "lian",
      in: "lin",
      iang: "liang",
      ing: "ling",
      u: "lu",
      uo: "luo",
      uan: "luan",
      un: "lun",
      ü: "lü",
      üe: "lüe",
    },
  },
  {
    initial: "g",
    group: "Cuống lưỡi",
    cells: {
      a: "ga",
      e: "ge",
      ai: "gai",
      ei: "gei",
      ao: "gao",
      ou: "gou",
      an: "gan",
      en: "gen",
      ang: "gang",
      eng: "geng",
      ong: "gong",
      u: "gu",
      ua: "gua",
      uo: "guo",
      uai: "guai",
      ui: "gui",
      uan: "guan",
      un: "gun",
      uang: "guang",
    },
  },
  {
    initial: "k",
    group: "Cuống lưỡi",
    cells: {
      a: "ka",
      e: "ke",
      ai: "kai",
      ei: "kei",
      ao: "kao",
      ou: "kou",
      an: "kan",
      en: "ken",
      ang: "kang",
      eng: "keng",
      ong: "kong",
      u: "ku",
      ua: "kua",
      uo: "kuo",
      uai: "kuai",
      ui: "kui",
      uan: "kuan",
      un: "kun",
      uang: "kuang",
    },
  },
  {
    initial: "h",
    group: "Cuống lưỡi",
    cells: {
      a: "ha",
      e: "he",
      ai: "hai",
      ei: "hei",
      ao: "hao",
      ou: "hou",
      an: "han",
      en: "hen",
      ang: "hang",
      eng: "heng",
      ong: "hong",
      u: "hu",
      ua: "hua",
      uo: "huo",
      uai: "huai",
      ui: "hui",
      uan: "huan",
      un: "hun",
      uang: "huang",
    },
  },
  {
    initial: "z",
    group: "Răng",
    cells: {
      a: "za",
      e: "ze",
      i: "zi",
      ai: "zai",
      ei: "zei",
      ao: "zao",
      ou: "zou",
      an: "zan",
      en: "zen",
      ang: "zang",
      eng: "zeng",
      ong: "zong",
      u: "zu",
      uo: "zuo",
      ui: "zui",
      uan: "zuan",
      un: "zun",
    },
  },
  {
    initial: "c",
    group: "Răng",
    cells: {
      a: "ca",
      e: "ce",
      i: "ci",
      ai: "cai",
      ao: "cao",
      ou: "cou",
      an: "can",
      en: "cen",
      ang: "cang",
      eng: "ceng",
      ong: "cong",
      u: "cu",
      uo: "cuo",
      ui: "cui",
      uan: "cuan",
      un: "cun",
    },
  },
  {
    initial: "s",
    group: "Răng",
    cells: {
      a: "sa",
      e: "se",
      i: "si",
      ai: "sai",
      ao: "sao",
      ou: "sou",
      an: "san",
      en: "sen",
      ang: "sang",
      eng: "seng",
      ong: "song",
      u: "su",
      uo: "suo",
      ui: "sui",
      uan: "suan",
      un: "sun",
    },
  },
  {
    initial: "zh",
    group: "Cong lưỡi",
    cells: {
      a: "zha",
      e: "zhe",
      i: "zhi",
      ai: "zhai",
      ei: "zhei",
      ao: "zhao",
      ou: "zhou",
      an: "zhan",
      en: "zhen",
      ang: "zhang",
      eng: "zheng",
      ong: "zhong",
      u: "zhu",
      ua: "zhua",
      uo: "zhuo",
      uai: "zhuai",
      ui: "zhui",
      uan: "zhuan",
      un: "zhun",
      uang: "zhuang",
    },
  },
  {
    initial: "ch",
    group: "Cong lưỡi",
    cells: {
      a: "cha",
      e: "che",
      i: "chi",
      ai: "chai",
      ao: "chao",
      ou: "chou",
      an: "chan",
      en: "chen",
      ang: "chang",
      eng: "cheng",
      ong: "chong",
      u: "chu",
      ua: "chua",
      uo: "chuo",
      uai: "chuai",
      ui: "chui",
      uan: "chuan",
      un: "chun",
      uang: "chuang",
    },
  },
  {
    initial: "sh",
    group: "Cong lưỡi",
    cells: {
      a: "sha",
      e: "she",
      i: "shi",
      ai: "shai",
      ei: "shei",
      ao: "shao",
      ou: "shou",
      an: "shan",
      en: "shen",
      ang: "shang",
      eng: "sheng",
      u: "shu",
      ua: "shua",
      uo: "shuo",
      uai: "shuai",
      ui: "shui",
      uan: "shuan",
      un: "shun",
      uang: "shuang",
    },
  },
  {
    initial: "r",
    group: "Cong lưỡi",
    cells: {
      e: "re",
      i: "ri",
      ao: "rao",
      ou: "rou",
      an: "ran",
      en: "ren",
      ang: "rang",
      eng: "reng",
      ong: "rong",
      u: "ru",
      ua: "rua",
      uo: "ruo",
      ui: "rui",
      uan: "ruan",
      un: "run",
    },
  },
  {
    initial: "j",
    group: "Mặt lưỡi",
    cells: {
      i: "ji",
      ia: "jia",
      iao: "jiao",
      ie: "jie",
      iu: "jiu",
      ian: "jian",
      in: "jin",
      iang: "jiang",
      ing: "jing",
      iong: "jiong",
      ü: "ju",
      üe: "jue",
      üan: "juan",
      ün: "jun",
    },
  },
  {
    initial: "q",
    group: "Mặt lưỡi",
    cells: {
      i: "qi",
      ia: "qia",
      iao: "qiao",
      ie: "qie",
      iu: "qiu",
      ian: "qian",
      in: "qin",
      iang: "qiang",
      ing: "qing",
      iong: "qiong",
      ü: "qu",
      üe: "que",
      üan: "quan",
      ün: "qun",
    },
  },
  {
    initial: "x",
    group: "Mặt lưỡi",
    cells: {
      i: "xi",
      ia: "xia",
      iao: "xiao",
      ie: "xie",
      iu: "xiu",
      ian: "xian",
      in: "xin",
      iang: "xiang",
      ing: "xing",
      iong: "xiong",
      ü: "xu",
      üe: "xue",
      üan: "xuan",
      ün: "xun",
    },
  },
];

const SYLLABLES: PinyinSyllable[] = PINYIN_ROWS.flatMap((row) =>
  FINALS.flatMap((final) => {
    const syllable = row.cells[final.id];

    if (!syllable) return [];

    return {
      key: `${row.initial || "zero"}-${final.id}`,
      syllable,
      initial: row.initial,
      initialLabel: row.initial || "không",
      final: final.id,
      finalLabel: FINAL_LABEL_BY_ID[final.id],
      group: row.group,
    };
  }),
);

const DEFAULT_SYLLABLE =
  SYLLABLES.find((item) => item.syllable === "dai") ?? SYLLABLES[0];

const TONES = [
  { tone: 1, label: "Thanh 1", contour: "cao ngang" },
  { tone: 2, label: "Thanh 2", contour: "đi lên" },
  { tone: 3, label: "Thanh 3", contour: "xuống rồi lên" },
  { tone: 4, label: "Thanh 4", contour: "rơi nhanh" },
  { tone: 5, label: "Thanh nhẹ", contour: "ngắn nhẹ" },
] as const;

const TONE_MARKS: Record<string, string[]> = {
  a: ["ā", "á", "ǎ", "à"],
  e: ["ē", "é", "ě", "è"],
  i: ["ī", "í", "ǐ", "ì"],
  o: ["ō", "ó", "ǒ", "ò"],
  u: ["ū", "ú", "ǔ", "ù"],
  ü: ["ǖ", "ǘ", "ǚ", "ǜ"],
};

const VIDEO_URL = "https://www.youtube-nocookie.com/embed/oTAMDkJxxdA";
const VIDEO_SOURCE_URL = "https://www.youtube.com/watch?v=oTAMDkJxxdA";
const PINYIN_AUDIO_BASE_URL =
  "https://raw.githubusercontent.com/davinfifield/mp3-chinese-pinyin-sound/master/mp3";

export default function PinyinPage() {
  const [selectedKey, setSelectedKey] = useState(DEFAULT_SYLLABLE.key);
  const [query, setQuery] = useState("");
  const [lastSpoken, setLastSpoken] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTokenRef = useRef(0);

  const selected =
    SYLLABLES.find((item) => item.key === selectedKey) ?? DEFAULT_SYLLABLE;
  const normalizedQuery = query.trim().toLowerCase();
  const matchedSyllables = useMemo(() => {
    if (!normalizedQuery) return SYLLABLES;

    return SYLLABLES.filter((item) =>
      [
        item.syllable,
        item.initial,
        item.finalLabel,
        item.group,
        `${item.initial}${item.finalLabel}`,
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery]);
  const matchedKeys = useMemo(
    () => new Set(matchedSyllables.map((item) => item.key)),
    [matchedSyllables],
  );

  function speakWithBrowser(text: string, tone: number) {
    const toneSettings: Record<number, { pitch: number; rate: number }> = {
      1: { pitch: 1.28, rate: 0.72 },
      2: { pitch: 1.12, rate: 0.7 },
      3: { pitch: 0.82, rate: 0.66 },
      4: { pitch: 1.38, rate: 0.7 },
      5: { pitch: 1, rate: 0.82 },
    };

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const chineseVoice = voices.find((voice) =>
      voice.lang.toLowerCase().startsWith("zh"),
    );
    const settings = toneSettings[tone] ?? toneSettings[5];

    utterance.lang = chineseVoice?.lang ?? "zh-CN";
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    if (chineseVoice) utterance.voice = chineseVoice;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function speak(text: string, tone: number, syllable: string) {
    const playToken = playTokenRef.current + 1;
    playTokenRef.current = playToken;
    setLastSpoken(text);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    if (typeof window !== "undefined" && tone >= 1 && tone <= 4) {
      const audio = new Audio(getPinyinAudioUrl(syllable, tone));
      audio.preload = "auto";
      audioRef.current = audio;

      audio.onended = () => {
        if (playTokenRef.current === playToken) audioRef.current = null;
      };
      audio.onerror = () => {
        if (playTokenRef.current !== playToken) return;
        audioRef.current = null;
        speakWithBrowser(text, tone);
      };

      void audio.play().catch(() => {
        if (playTokenRef.current !== playToken) return;
        audioRef.current = null;
        speakWithBrowser(text, tone);
      });
      return;
    }

    speakWithBrowser(text, tone);
  }

  return (
    <main className="min-h-screen bg-canvas-soft">
      <AppHeader />

      <section className="mx-auto max-w-[1560px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 border-b border-hairline pb-6 lg:grid-cols-[1fr_380px] lg:items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-[-1.2px] text-ink sm:text-5xl">
              Bảng Pinyin
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-ink-muted">
              Tra nhanh thanh mẫu, vận mẫu, nghe phát âm theo thanh và xem video
              ví dụ ngay trên một màn hình.
            </p>
          </div>

          <div className="rounded-2xl border border-hairline bg-white p-3 shadow-sm">
            <label className="flex h-12 items-center gap-3 rounded-xl bg-canvas-soft px-4">
              <Search className="size-4 text-ink-muted" />
              <input
                aria-label="Tìm âm Pinyin"
                className="w-full bg-transparent text-sm font-medium text-ink outline-none placeholder:text-ink-faint"
                placeholder="Tìm: dai, zh, üan..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              {matchedSyllables.slice(0, 8).map((item) => (
                <button
                  key={item.key}
                  className={`focus-ring rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                    item.key === selected.key
                      ? "bg-primary text-white"
                      : "bg-canvas-soft text-ink-secondary hover:bg-blue-50 hover:text-primary"
                  }`}
                  type="button"
                  onClick={() => setSelectedKey(item.key)}
                >
                  {item.syllable}
                </button>
              ))}
              {normalizedQuery && matchedSyllables.length === 0 ? (
                <span className="px-1 py-1.5 text-sm text-ink-muted">
                  Không có âm phù hợp
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-6 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="notion-shadow min-w-0 overflow-hidden rounded-2xl border border-hairline bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <BookOpenText className="size-4 text-primary" />
                <p className="text-sm font-semibold text-ink-secondary">
                  {SYLLABLES.length} âm tiết chuẩn
                </p>
              </div>
              <p className="text-sm text-ink-muted">
                Đang chọn{" "}
                <span className="font-semibold text-ink">
                  {selected.syllable}
                </span>
              </p>
            </div>

            <div className="max-h-[calc(100vh-220px)] overflow-auto">
              <table className="w-max min-w-full border-collapse text-left">
                <thead>
                  <tr>
                    <th className="sticky left-0 top-0 z-30 w-20 min-w-20 border-b border-r border-orange-500/40 bg-[#f0982c] px-3 py-3 text-sm font-bold text-ink shadow-sm">
                      âm đầu
                    </th>
                    {FINALS.map((final) => (
                      <th
                        key={final.id}
                        className="sticky top-0 z-20 min-w-[66px] border-b border-r border-orange-500/40 bg-[#f0982c] px-3 py-3 text-center text-sm font-bold text-ink shadow-sm"
                      >
                        {final.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PINYIN_ROWS.map((row) => (
                    <tr key={row.initial || "zero"} className="group">
                      <th className="sticky left-0 z-10 border-b border-r border-hairline bg-orange-50 px-3 py-2 align-middle">
                        <span className="block text-lg font-black text-[#c45200]">
                          {row.initial || "0"}
                        </span>
                        <span className="mt-1 block max-w-[4.5rem] text-[10px] font-semibold uppercase leading-3 tracking-[0.08em] text-[#9b4a08]">
                          {row.group}
                        </span>
                      </th>
                      {FINALS.map((final) => {
                        const syllable = row.cells[final.id];
                        const key = `${row.initial || "zero"}-${final.id}`;
                        const active = key === selected.key;
                        const dimmed = normalizedQuery && !matchedKeys.has(key);

                        return (
                          <td
                            key={final.id}
                            className={`h-12 min-w-[66px] border-b border-r border-hairline bg-white p-0 text-center transition ${
                              active ? "bg-amber-100" : ""
                            } ${dimmed ? "opacity-25" : ""}`}
                          >
                            {syllable ? (
                              <button
                                className={`focus-ring flex size-full min-h-12 items-center justify-center px-2 text-[15px] font-semibold transition hover:bg-blue-50 hover:text-primary ${
                                  active
                                    ? "bg-[#ffb020] text-ink"
                                    : "text-ink-secondary"
                                }`}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setSelectedKey(key)}
                              >
                                {syllable}
                              </button>
                            ) : (
                              <span className="block min-h-12" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <PinyinDetailPanel
            selected={selected}
            lastSpoken={lastSpoken}
            onSpeak={speak}
          />
        </div>
      </section>
    </main>
  );
}

function PinyinDetailPanel({
  selected,
  lastSpoken,
  onSpeak,
}: {
  selected: PinyinSyllable;
  lastSpoken: string;
  onSpeak: (text: string, tone: number, syllable: string) => void;
}) {
  const toneOptions = TONES.map((tone) => ({
    ...tone,
    value: markTone(selected.syllable, tone.tone),
  }));

  return (
    <aside className="notion-shadow h-fit rounded-2xl border border-hairline bg-white p-5 xl:sticky xl:top-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
            Chi tiết
          </p>
          <button
            className="focus-ring mt-2 inline-flex items-center gap-3 rounded-xl pr-2 text-left"
            type="button"
            onClick={() =>
              onSpeak(markTone(selected.syllable, 1), 1, selected.syllable)
            }
          >
            <span className="text-5xl font-black tracking-[-1.5px] text-ink">
              {selected.syllable}
            </span>
            <span className="flex size-10 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
              <Volume2 className="size-5" />
            </span>
          </button>
        </div>
        <span className="rounded-full bg-canvas-soft px-3 py-1.5 text-xs font-semibold text-ink-muted">
          {selected.group}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoBlock label="Thanh mẫu" value={selected.initialLabel} />
        <InfoBlock label="Vận mẫu" value={selected.finalLabel} />
      </div>

      <div className="mt-5 rounded-2xl bg-canvas-soft p-4">
        <p className="text-sm font-semibold text-ink-secondary">Phân tách</p>
        <p className="mt-2 text-2xl font-bold tracking-[-0.5px]">
          {selected.initial ? selected.initial : "không"}{" "}
          <span className="text-ink-faint">+</span> {selected.finalLabel}
        </p>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-ink-secondary">
          Nghe theo thanh
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {toneOptions.map((tone) => (
            <button
              key={tone.tone}
              className={`focus-ring rounded-xl border p-3 text-left transition hover:border-primary hover:bg-blue-50 ${
                lastSpoken === tone.value
                  ? "border-primary bg-blue-50"
                  : "border-hairline bg-white"
              }`}
              type="button"
              onClick={() => onSpeak(tone.value, tone.tone, selected.syllable)}
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-2xl font-black tracking-[-0.3px]">
                  {tone.value}
                </span>
                <Play className="size-4 fill-current text-cyan-500" />
              </span>
              <span className="mt-1 block text-xs font-medium text-ink-muted">
                {tone.label} · {tone.contour}
              </span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-ink-muted">
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tracking-[-0.4px] text-ink">
        {value}
      </p>
    </div>
  );
}

function getPinyinAudioUrl(syllable: string, tone: number) {
  return `${PINYIN_AUDIO_BASE_URL}/${toAudioSlug(syllable)}${tone}.mp3`;
}

function toAudioSlug(syllable: string) {
  return syllable.normalize("NFC").replaceAll("ü", "uu");
}

function markTone(syllable: string, tone: number) {
  if (tone === 5) return syllable;

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
