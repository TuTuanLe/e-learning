"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  BookOpenText,
  Maximize2,
  Minimize2,
  Play,
  Scan,
  Search,
  Volume2,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Activity,
  Headphones,
  GraduationCap,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { HanziStrokePanel } from "@/components/hanzi-stroke-player";
import { ToneTrainer } from "@/components/pinyin/tone-trainer";
import { SoundPairsQuiz } from "@/components/pinyin/sound-pairs-quiz";
import { PinyinLessons } from "@/components/pinyin/pinyin-lessons";

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

type PinyinExample = {
  hanzi: string;
  pinyin: string;
  meaning: string;
  source?: "word" | "practice";
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

const PINYIN_EXAMPLES: Record<string, PinyinExample[]> = {
  ai: [{ hanzi: "爱", pinyin: "ài", meaning: "yêu" }],
  an: [{ hanzi: "安", pinyin: "ān", meaning: "yên ổn" }],
  ba: [{ hanzi: "爸爸", pinyin: "bàba", meaning: "bố" }],
  bai: [{ hanzi: "白", pinyin: "bái", meaning: "màu trắng" }],
  ban: [{ hanzi: "班", pinyin: "bān", meaning: "lớp" }],
  bang: [{ hanzi: "帮", pinyin: "bāng", meaning: "giúp" }],
  bao: [{ hanzi: "包", pinyin: "bāo", meaning: "túi, gói" }],
  bei: [{ hanzi: "北", pinyin: "běi", meaning: "phía bắc" }],
  ben: [{ hanzi: "本", pinyin: "běn", meaning: "quyển, gốc" }],
  bi: [{ hanzi: "比", pinyin: "bǐ", meaning: "so sánh" }],
  bian: [{ hanzi: "边", pinyin: "biān", meaning: "bên cạnh" }],
  biao: [{ hanzi: "表", pinyin: "biǎo", meaning: "bảng, đồng hồ" }],
  bie: [{ hanzi: "别", pinyin: "bié", meaning: "đừng, khác" }],
  bing: [{ hanzi: "病", pinyin: "bìng", meaning: "bệnh" }],
  bu: [{ hanzi: "不", pinyin: "bù", meaning: "không" }],
  cai: [{ hanzi: "菜", pinyin: "cài", meaning: "món ăn, rau" }],
  cha: [{ hanzi: "茶", pinyin: "chá", meaning: "trà" }],
  chang: [{ hanzi: "长", pinyin: "cháng", meaning: "dài" }],
  che: [{ hanzi: "车", pinyin: "chē", meaning: "xe" }],
  chi: [{ hanzi: "吃", pinyin: "chī", meaning: "ăn" }],
  da: [{ hanzi: "大", pinyin: "dà", meaning: "lớn" }],
  dai: [
    { hanzi: "带", pinyin: "dài", meaning: "mang theo" },
    { hanzi: "等待", pinyin: "děngdài", meaning: "chờ đợi" },
  ],
  dan: [
    { hanzi: "单", pinyin: "dān", meaning: "đơn, lẻ" },
    { hanzi: "但是", pinyin: "dànshì", meaning: "nhưng" },
  ],
  dao: [{ hanzi: "到", pinyin: "dào", meaning: "đến" }],
  de: [{ hanzi: "的", pinyin: "de", meaning: "trợ từ sở hữu" }],
  deng: [{ hanzi: "等", pinyin: "děng", meaning: "đợi" }],
  dian: [{ hanzi: "点", pinyin: "diǎn", meaning: "điểm, giờ" }],
  dong: [{ hanzi: "东", pinyin: "dōng", meaning: "phía đông" }],
  dou: [{ hanzi: "都", pinyin: "dōu", meaning: "đều" }],
  du: [{ hanzi: "读", pinyin: "dú", meaning: "đọc" }],
  dui: [{ hanzi: "对", pinyin: "duì", meaning: "đúng, đối với" }],
  duo: [{ hanzi: "多", pinyin: "duō", meaning: "nhiều" }],
  e: [{ hanzi: "饿", pinyin: "è", meaning: "đói" }],
  er: [{ hanzi: "二", pinyin: "èr", meaning: "số hai" }],
  fa: [{ hanzi: "发", pinyin: "fā", meaning: "gửi, phát" }],
  fan: [{ hanzi: "饭", pinyin: "fàn", meaning: "cơm" }],
  fang: [{ hanzi: "房", pinyin: "fáng", meaning: "phòng, nhà" }],
  fei: [{ hanzi: "飞", pinyin: "fēi", meaning: "bay" }],
  fen: [{ hanzi: "分", pinyin: "fēn", meaning: "phút, chia" }],
  fu: [{ hanzi: "服", pinyin: "fú", meaning: "quần áo, phục" }],
  ge: [{ hanzi: "个", pinyin: "ge", meaning: "lượng từ" }],
  gei: [{ hanzi: "给", pinyin: "gěi", meaning: "cho" }],
  gong: [{ hanzi: "工作", pinyin: "gōngzuò", meaning: "công việc" }],
  guo: [{ hanzi: "国", pinyin: "guó", meaning: "nước, quốc gia" }],
  hao: [{ hanzi: "好", pinyin: "hǎo", meaning: "tốt" }],
  he: [{ hanzi: "和", pinyin: "hé", meaning: "và" }],
  hen: [{ hanzi: "很", pinyin: "hěn", meaning: "rất" }],
  hui: [{ hanzi: "会", pinyin: "huì", meaning: "biết, sẽ" }],
  jia: [{ hanzi: "家", pinyin: "jiā", meaning: "nhà" }],
  jian: [{ hanzi: "见", pinyin: "jiàn", meaning: "gặp" }],
  jiao: [{ hanzi: "叫", pinyin: "jiào", meaning: "gọi, tên là" }],
  jie: [{ hanzi: "姐姐", pinyin: "jiějie", meaning: "chị gái" }],
  jin: [{ hanzi: "今天", pinyin: "jīntiān", meaning: "hôm nay" }],
  jiu: [{ hanzi: "九", pinyin: "jiǔ", meaning: "số chín" }],
  ju: [{ hanzi: "句子", pinyin: "jùzi", meaning: "câu" }],
  jue: [{ hanzi: "觉得", pinyin: "juéde", meaning: "cảm thấy" }],
  kai: [{ hanzi: "开", pinyin: "kāi", meaning: "mở" }],
  kan: [{ hanzi: "看", pinyin: "kàn", meaning: "nhìn, xem" }],
  kao: [{ hanzi: "考试", pinyin: "kǎoshì", meaning: "thi" }],
  ke: [{ hanzi: "课", pinyin: "kè", meaning: "bài học" }],
  kou: [{ hanzi: "口", pinyin: "kǒu", meaning: "miệng" }],
  kuai: [{ hanzi: "快", pinyin: "kuài", meaning: "nhanh" }],
  lai: [{ hanzi: "来", pinyin: "lái", meaning: "đến" }],
  lao: [{ hanzi: "老师", pinyin: "lǎoshī", meaning: "giáo viên" }],
  le: [{ hanzi: "了", pinyin: "le", meaning: "trợ từ hoàn thành" }],
  li: [{ hanzi: "里", pinyin: "lǐ", meaning: "bên trong" }],
  lian: [{ hanzi: "脸", pinyin: "liǎn", meaning: "mặt" }],
  liang: [{ hanzi: "两", pinyin: "liǎng", meaning: "hai" }],
  ling: [{ hanzi: "零", pinyin: "líng", meaning: "số không" }],
  liu: [{ hanzi: "六", pinyin: "liù", meaning: "số sáu" }],
  lu: [{ hanzi: "路", pinyin: "lù", meaning: "đường" }],
  lü: [
    { hanzi: "绿", pinyin: "lǜ", meaning: "màu xanh lá" },
    { hanzi: "旅行", pinyin: "lǚxíng", meaning: "du lịch" },
  ],
  lüe: [{ hanzi: "略", pinyin: "lüè", meaning: "lược, hơi" }],
  ma: [{ hanzi: "妈妈", pinyin: "māma", meaning: "mẹ" }],
  mai: [{ hanzi: "买", pinyin: "mǎi", meaning: "mua" }],
  man: [{ hanzi: "慢", pinyin: "màn", meaning: "chậm" }],
  mang: [{ hanzi: "忙", pinyin: "máng", meaning: "bận" }],
  mao: [{ hanzi: "猫", pinyin: "māo", meaning: "mèo" }],
  mei: [{ hanzi: "没", pinyin: "méi", meaning: "không có" }],
  men: [{ hanzi: "门", pinyin: "mén", meaning: "cửa" }],
  ming: [{ hanzi: "名字", pinyin: "míngzi", meaning: "tên" }],
  na: [{ hanzi: "那", pinyin: "nà", meaning: "kia, đó" }],
  nai: [{ hanzi: "奶", pinyin: "nǎi", meaning: "sữa" }],
  nan: [{ hanzi: "男", pinyin: "nán", meaning: "nam" }],
  nao: [{ hanzi: "脑", pinyin: "nǎo", meaning: "não" }],
  ne: [{ hanzi: "呢", pinyin: "ne", meaning: "trợ từ hỏi" }],
  ni: [{ hanzi: "你", pinyin: "nǐ", meaning: "bạn" }],
  nian: [{ hanzi: "年", pinyin: "nián", meaning: "năm" }],
  nin: [{ hanzi: "您", pinyin: "nín", meaning: "ngài, bạn lịch sự" }],
  niu: [{ hanzi: "牛", pinyin: "niú", meaning: "con bò" }],
  nü: [
    { hanzi: "女", pinyin: "nǚ", meaning: "nữ, con gái" },
    { hanzi: "女人", pinyin: "nǚrén", meaning: "phụ nữ" },
  ],
  nüe: [{ hanzi: "虐", pinyin: "nüè", meaning: "ngược đãi" }],
  pao: [{ hanzi: "跑", pinyin: "pǎo", meaning: "chạy" }],
  peng: [{ hanzi: "朋友", pinyin: "péngyou", meaning: "bạn bè" }],
  qi: [{ hanzi: "七", pinyin: "qī", meaning: "số bảy" }],
  qian: [{ hanzi: "钱", pinyin: "qián", meaning: "tiền" }],
  qing: [{ hanzi: "请", pinyin: "qǐng", meaning: "mời" }],
  qu: [{ hanzi: "去", pinyin: "qù", meaning: "đi" }],
  quan: [{ hanzi: "全", pinyin: "quán", meaning: "toàn bộ" }],
  que: [{ hanzi: "确", pinyin: "què", meaning: "chính xác" }],
  ren: [{ hanzi: "人", pinyin: "rén", meaning: "người" }],
  ri: [{ hanzi: "日", pinyin: "rì", meaning: "ngày, mặt trời" }],
  rou: [{ hanzi: "肉", pinyin: "ròu", meaning: "thịt" }],
  shang: [{ hanzi: "上", pinyin: "shàng", meaning: "trên" }],
  sheng: [{ hanzi: "生", pinyin: "shēng", meaning: "sinh, sống" }],
  shi: [{ hanzi: "是", pinyin: "shì", meaning: "là" }],
  shou: [{ hanzi: "手", pinyin: "shǒu", meaning: "tay" }],
  shui: [{ hanzi: "水", pinyin: "shuǐ", meaning: "nước" }],
  shuo: [{ hanzi: "说", pinyin: "shuō", meaning: "nói" }],
  si: [{ hanzi: "四", pinyin: "sì", meaning: "số bốn" }],
  ta: [{ hanzi: "他", pinyin: "tā", meaning: "anh ấy" }],
  tai: [{ hanzi: "太", pinyin: "tài", meaning: "quá, rất" }],
  tian: [{ hanzi: "天", pinyin: "tiān", meaning: "trời, ngày" }],
  ting: [{ hanzi: "听", pinyin: "tīng", meaning: "nghe" }],
  tong: [{ hanzi: "同", pinyin: "tóng", meaning: "cùng" }],
  wan: [{ hanzi: "晚", pinyin: "wǎn", meaning: "muộn, tối" }],
  wei: [{ hanzi: "喂", pinyin: "wèi", meaning: "alo" }],
  wo: [{ hanzi: "我", pinyin: "wǒ", meaning: "tôi" }],
  wu: [{ hanzi: "五", pinyin: "wǔ", meaning: "số năm" }],
  xi: [{ hanzi: "西", pinyin: "xī", meaning: "phía tây" }],
  xia: [{ hanzi: "下", pinyin: "xià", meaning: "dưới" }],
  xian: [{ hanzi: "先", pinyin: "xiān", meaning: "trước" }],
  xiang: [{ hanzi: "想", pinyin: "xiǎng", meaning: "muốn, nghĩ" }],
  xiao: [{ hanzi: "小", pinyin: "xiǎo", meaning: "nhỏ" }],
  xie: [{ hanzi: "写", pinyin: "xiě", meaning: "viết" }],
  xin: [{ hanzi: "新", pinyin: "xīn", meaning: "mới" }],
  xing: [{ hanzi: "星", pinyin: "xīng", meaning: "ngôi sao" }],
  xiong: [{ hanzi: "熊", pinyin: "xióng", meaning: "gấu" }],
  xu: [{ hanzi: "许", pinyin: "xǔ", meaning: "cho phép, hứa" }],
  xue: [{ hanzi: "学", pinyin: "xué", meaning: "học" }],
  yao: [{ hanzi: "要", pinyin: "yào", meaning: "muốn, cần" }],
  ye: [{ hanzi: "也", pinyin: "yě", meaning: "cũng" }],
  yi: [{ hanzi: "一", pinyin: "yī", meaning: "số một" }],
  you: [{ hanzi: "有", pinyin: "yǒu", meaning: "có" }],
  yu: [{ hanzi: "雨", pinyin: "yǔ", meaning: "mưa" }],
  yue: [{ hanzi: "月", pinyin: "yuè", meaning: "tháng, mặt trăng" }],
  zai: [{ hanzi: "在", pinyin: "zài", meaning: "ở, đang" }],
  zhe: [{ hanzi: "这", pinyin: "zhè", meaning: "này" }],
  zhong: [{ hanzi: "中", pinyin: "zhōng", meaning: "giữa, Trung" }],
  zuo: [{ hanzi: "做", pinyin: "zuò", meaning: "làm" }],
};

const PINYIN_AUDIO_BASE_URL =
  "https://raw.githubusercontent.com/davinfifield/mp3-chinese-pinyin-sound/master/mp3";
const BASE_PINYIN_CELL_WIDTH = 66;
const BASE_PINYIN_HEAD_WIDTH = 80;
const BASE_PINYIN_ROW_HEIGHT = 48;
const EXPANDED_TABLE_HEADER_HEIGHT = 58;
const FIT_TABLE_PADDING = 18;
const TABLE_ZOOM_STEPS = [0.8, 0.9, 1, 1.15, 1.3, 1.5] as const;
const DEFAULT_TABLE_ZOOM_INDEX = 2;
const BASE_PINYIN_TABLE_WIDTH =
  BASE_PINYIN_HEAD_WIDTH + FINALS.length * BASE_PINYIN_CELL_WIDTH;
const BASE_PINYIN_TABLE_HEIGHT = Math.max(
  (PINYIN_ROWS.length + 1) * BASE_PINYIN_ROW_HEIGHT,
  1520,
);

export default function PinyinPage() {
  const [activeTab, setActiveTab] = useState<
    "table" | "tones" | "pairs" | "lessons"
  >("table");
  const [selectedKey, setSelectedKey] = useState(DEFAULT_SYLLABLE.key);
  const [query, setQuery] = useState("");
  const [lastSpoken, setLastSpoken] = useState("");
  const [tableExpanded, setTableExpanded] = useState(false);
  const [tableFit, setTableFit] = useState(false);
  const [tableZoomIndex, setTableZoomIndex] = useState(
    DEFAULT_TABLE_ZOOM_INDEX,
  );
  const [viewportSize, setViewportSize] = useState({ width: 1280, height: 900 });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playTokenRef = useRef(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (
        tab === "tones" ||
        tab === "pairs" ||
        tab === "lessons" ||
        tab === "table"
      ) {
        setActiveTab(tab);
      }
    }
  }, []);

  const handleTabChange = (tab: "table" | "tones" | "pairs" | "lessons") => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.pushState({}, "", url.toString());
    }
  };

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
  const tableZoom = TABLE_ZOOM_STEPS[tableZoomIndex];
  const fitZoom = useMemo(() => {
    const availableWidth = Math.max(320, viewportSize.width - FIT_TABLE_PADDING);
    const availableHeight = Math.max(
      240,
      viewportSize.height - EXPANDED_TABLE_HEADER_HEIGHT - FIT_TABLE_PADDING,
    );

    return Math.min(
      1,
      availableWidth / BASE_PINYIN_TABLE_WIDTH,
      availableHeight / BASE_PINYIN_TABLE_HEIGHT,
    );
  }, [viewportSize]);
  const sizingTableZoom = tableFit ? 1 : tableZoom;
  const displayTableZoom = tableFit ? fitZoom : tableZoom;
  const canZoomOut = tableZoomIndex > 0;
  const canZoomIn = tableZoomIndex < TABLE_ZOOM_STEPS.length - 1;
  const tableSizingStyle = useMemo(
    () =>
      ({
        "--pinyin-cell-width": `${Math.round(
          BASE_PINYIN_CELL_WIDTH * sizingTableZoom,
        )}px`,
        "--pinyin-head-width": `${Math.round(
          BASE_PINYIN_HEAD_WIDTH * sizingTableZoom,
        )}px`,
        "--pinyin-row-height": `${Math.round(
          BASE_PINYIN_ROW_HEIGHT * sizingTableZoom,
        )}px`,
        "--pinyin-cell-font": `${Math.max(
          8,
          Math.round(15 * sizingTableZoom),
        )}px`,
        "--pinyin-head-font": `${Math.max(
          8,
          Math.round(14 * sizingTableZoom),
        )}px`,
        "--pinyin-initial-font": `${Math.max(
          10,
          Math.round(18 * sizingTableZoom),
        )}px`,
        "--pinyin-group-font": `${Math.max(
          6,
          Math.round(10 * sizingTableZoom),
        )}px`,
      }) as CSSProperties,
    [sizingTableZoom],
  );

  useEffect(() => {
    function updateViewportSize() {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    updateViewportSize();
    window.addEventListener("resize", updateViewportSize);

    return () => window.removeEventListener("resize", updateViewportSize);
  }, []);

  useEffect(() => {
    if (!tableExpanded) return;

    const previousOverflow = document.body.style.overflow;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setTableExpanded(false);
        setTableFit(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [tableExpanded]);

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
        {/* Navigation Tabs */}
        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-hairline pb-4">
          <button
            type="button"
            onClick={() => handleTabChange("table")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "table"
                ? "bg-ink text-white shadow-sm"
                : "border border-hairline bg-white text-ink-muted hover:border-ink/20 hover:text-ink"
            }`}
          >
            <Grid3X3 className="size-4" />
            Bảng Pinyin Tra Cứu
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("tones")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "tones"
                ? "bg-ink text-white shadow-sm"
                : "border border-hairline bg-white text-ink-muted hover:border-ink/20 hover:text-ink"
            }`}
          >
            <Activity className="size-4 text-sky-500" />
            Luyện Thanh Điệu (Tone Trainer)
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("pairs")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "pairs"
                ? "bg-ink text-white shadow-sm"
                : "border border-hairline bg-white text-ink-muted hover:border-ink/20 hover:text-ink"
            }`}
          >
            <Headphones className="size-4 text-emerald-500" />
            Phân Biệt Cặp Âm (Minimal Pairs)
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("lessons")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
              activeTab === "lessons"
                ? "bg-ink text-white shadow-sm"
                : "border border-hairline bg-white text-ink-muted hover:border-ink/20 hover:text-ink"
            }`}
          >
            <GraduationCap className="size-4 text-violet-500" />
            10 Bài Học Phát Âm
          </button>
        </div>

        {activeTab === "table" && (
          <>
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
          <section
            className={
              tableExpanded
                ? "fixed inset-0 z-50 flex min-w-0 flex-col overflow-hidden border-0 bg-white shadow-2xl"
                : "notion-shadow min-w-0 overflow-hidden rounded-2xl border border-hairline bg-white"
            }
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <BookOpenText className="size-4 text-primary" />
                <p className="text-sm font-semibold text-ink-secondary">
                  {SYLLABLES.length} âm tiết chuẩn
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm text-ink-muted">
                  Đang chọn{" "}
                  <span className="font-semibold text-ink">
                    {selected.syllable}
                  </span>
                </p>
                <div className="flex items-center overflow-hidden rounded-lg border border-hairline bg-white">
                  <button
                    className="focus-ring inline-flex size-9 items-center justify-center text-ink-secondary transition hover:bg-canvas-soft hover:text-ink disabled:pointer-events-none disabled:opacity-35"
                    type="button"
                    aria-label="Thu nhỏ bảng Pinyin"
                    disabled={!canZoomOut}
                    title="Zoom out"
                    onClick={() => {
                      setTableFit(false);
                      setTableZoomIndex((value) => Math.max(0, value - 1));
                    }}
                  >
                    <ZoomOut className="size-4" />
                  </button>
                  <span className="min-w-12 border-x border-hairline px-2 text-center text-xs font-semibold text-ink-secondary">
                    {Math.round(displayTableZoom * 100)}%
                  </span>
                  <button
                    className="focus-ring inline-flex size-9 items-center justify-center text-ink-secondary transition hover:bg-canvas-soft hover:text-ink disabled:pointer-events-none disabled:opacity-35"
                    type="button"
                    aria-label="Phóng to bảng Pinyin"
                    disabled={!canZoomIn}
                    title="Zoom in"
                    onClick={() => {
                      setTableFit(false);
                      setTableZoomIndex((value) =>
                        Math.min(TABLE_ZOOM_STEPS.length - 1, value + 1),
                      );
                    }}
                  >
                    <ZoomIn className="size-4" />
                  </button>
                </div>
                <button
                  className={`focus-ring inline-flex size-9 items-center justify-center rounded-lg border transition ${
                    tableFit
                      ? "border-primary bg-blue-50 text-primary"
                      : "border-hairline bg-white text-ink-secondary hover:bg-canvas-soft hover:text-ink"
                  }`}
                  type="button"
                  aria-label="Fit toàn bộ bảng Pinyin"
                  aria-pressed={tableFit}
                  title="Fit toàn bảng"
                  onClick={() => {
                    setTableExpanded(true);
                    setTableFit((value) => !value);
                  }}
                >
                  <Scan className="size-4" />
                </button>
                <button
                  className="focus-ring inline-flex size-9 items-center justify-center rounded-lg border border-hairline bg-white text-ink-secondary transition hover:bg-canvas-soft hover:text-ink"
                  type="button"
                  aria-label={
                    tableExpanded ? "Thu nhỏ bảng Pinyin" : "Phóng to bảng Pinyin"
                  }
                  aria-pressed={tableExpanded}
                  title={tableExpanded ? "Thu nhỏ bảng" : "Xem bảng full size"}
                  onClick={() => {
                    setTableExpanded((value) => !value);
                    if (tableExpanded) setTableFit(false);
                  }}
                >
                  {tableExpanded ? (
                    <Minimize2 className="size-4" />
                  ) : (
                    <Maximize2 className="size-4" />
                  )}
                </button>
              </div>
            </div>

            <div
              className={
                tableExpanded
                  ? "min-h-0 flex-1 overflow-auto"
                  : "max-h-[calc(100vh-220px)] overflow-auto"
              }
              style={tableSizingStyle}
            >
              <table
                className="w-max min-w-full border-collapse text-left"
                style={
                  tableFit
                    ? ({ zoom: fitZoom } as CSSProperties)
                    : undefined
                }
              >
                <thead>
                  <tr>
                    <th className="sticky left-0 top-0 z-30 w-[var(--pinyin-head-width)] min-w-[var(--pinyin-head-width)] border-b border-r border-orange-500/40 bg-[#f0982c] px-3 py-3 text-[var(--pinyin-head-font)] font-bold text-ink shadow-sm">
                      âm đầu
                    </th>
                    {FINALS.map((final) => (
                      <th
                        key={final.id}
                        className="sticky top-0 z-20 min-w-[var(--pinyin-cell-width)] border-b border-r border-orange-500/40 bg-[#f0982c] px-3 py-3 text-center text-[var(--pinyin-head-font)] font-bold text-ink shadow-sm"
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
                        <span className="block text-[var(--pinyin-initial-font)] font-black text-[#c45200]">
                          {row.initial || "0"}
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
                            className={`h-[var(--pinyin-row-height)] min-w-[var(--pinyin-cell-width)] border-b border-r border-hairline bg-white p-0 text-center transition ${
                              active ? "bg-amber-100" : ""
                            } ${dimmed ? "opacity-25" : ""}`}
                          >
                            {syllable ? (
                              <button
                                className={`focus-ring flex size-full min-h-[var(--pinyin-row-height)] items-center justify-center px-2 text-[var(--pinyin-cell-font)] font-semibold transition hover:bg-blue-50 hover:text-primary ${
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
                              <span className="block min-h-[var(--pinyin-row-height)]" />
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
      </>
    )}

    {activeTab === "tones" && <ToneTrainer />}

    {activeTab === "pairs" && <SoundPairsQuiz />}

    {activeTab === "lessons" && (
      <PinyinLessons onSelectQuizDrill={() => handleTabChange("pairs")} />
    )}
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
  const examples = useMemo(
    () => getExamplesForSyllable(selected.syllable),
    [selected.syllable],
  );
  const pronunciationNote = getPronunciationNote(selected);

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

      {pronunciationNote ? (
        <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4 text-sm font-medium leading-6 text-cyan-900">
          {pronunciationNote}
        </div>
      ) : null}

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

      <PinyinExamples examples={examples} />
    </aside>
  );
}

function PinyinExamples({ examples }: { examples: PinyinExample[] }) {
  return (
    <div className="mt-5">
      <p className="text-sm font-semibold text-ink-secondary">Từ ví dụ</p>
      <div className="mt-3 grid gap-2">
        {examples.map((example) => {
          const exampleKey = `${example.hanzi}-${example.pinyin}-${example.source ?? "word"}`;
          const hanziCharacters = getHanziCharacters(example.hanzi);

          return (
            <div
              key={exampleKey}
              className={`rounded-xl border p-3 ${
                example.source === "practice"
                  ? "border-dashed border-cyan-200 bg-cyan-50/60"
                  : "border-hairline bg-white"
              }`}
            >
              <div className="grid min-w-0 gap-1">
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className={`font-black tracking-[-0.3px] text-ink ${
                      example.hanzi.length > 8 ? "text-xl" : "text-2xl"
                    }`}
                  >
                    {example.hanzi}
                  </span>
                  {example.source === "practice" ? (
                    <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[11px] font-semibold text-cyan-700">
                      Luyện âm
                    </span>
                  ) : null}
                </div>
                <span className="break-words text-sm font-bold leading-5 text-primary">
                  {example.pinyin}
                </span>
              </div>
              <p className="mt-1 text-sm font-medium leading-5 text-ink-muted">
                {example.meaning}
              </p>

              {hanziCharacters.length > 0 ? (
                <HanziStrokePanel
                  characters={hanziCharacters}
                  label={example.hanzi}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getHanziCharacters(value: string) {
  const seen = new Set<string>();

  return Array.from(value)
    .filter((character) => {
      if (!/[\u3400-\u9fff]/u.test(character) || seen.has(character)) {
        return false;
      }

      seen.add(character);
      return true;
    })
    .slice(0, 8);
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

function getExamplesForSyllable(syllable: string) {
  const directExamples = PINYIN_EXAMPLES[syllable] ?? [];
  const examples = dedupeExamples(directExamples).slice(0, 2);

  if (examples.length > 0) return examples;

  return [createPracticeExample(syllable)];
}

function dedupeExamples(examples: PinyinExample[]) {
  const seen = new Set<string>();

  return examples.filter((example) => {
    const key = `${example.hanzi}-${example.pinyin}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createPracticeExample(syllable: string): PinyinExample {
  return {
    hanzi: markTone(syllable, 1),
    pinyin: TONES.map((tone) => markTone(syllable, tone.tone)).join(" · "),
    meaning: "Luyện đủ 5 thanh của âm này bằng các nút nghe phía trên.",
    source: "practice",
  };
}

function getPronunciationNote(selected: PinyinSyllable) {
  if (selected.syllable === "nü") {
    return "Âm nü thường gặp trong 女 (nǚ). Giữ dấu hai chấm trên ü để phân biệt với nu.";
  }

  if (selected.syllable === "lü") {
    return "Âm lü giữ dấu hai chấm trên ü, ví dụ 绿 (lǜ) hoặc 旅行 (lǚxíng).";
  }

  if (selected.syllable.includes("ü")) {
    return "Nhóm âm này dùng ü: môi tròn như u, lưỡi gần vị trí i.";
  }

  if (["j", "q", "x"].includes(selected.initial) && selected.final.startsWith("ü")) {
    return "Sau j, q, x, ü được viết thành u: ju, qu, xu vẫn đọc theo âm ü.";
  }

  return "";
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
