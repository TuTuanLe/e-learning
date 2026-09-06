// Dataset and utilities for "Phi đao luyện chữ" (Flying Dagger / Falling Words) game

export interface GameWord {
  id: string;
  hanzi: string;
  pinyin: string;
  pinyinRaw: string; // Stripped of tone marks and spaces for fast keyboard input (e.g. "nihao")
  meaning: string;
  hskLevel: number;
  collectionId?: string;
  unitId?: string;
}

// Remove tone diacritics and special characters to get clean pinyin for matching
export function normalizePinyinForGame(pinyin: string): string {
  return pinyin
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove tone marks
    .replace(/ü/g, "v") // Map ü to v or uu
    .toLowerCase()
    .replace(/[^a-z]/g, ""); // Keep only letters
}

// Curated pool of high-frequency words across HSK 1 to HSK 6
export const HSK_FALLING_WORDS: GameWord[] = [
  // HSK 1
  { id: "fw-hsk1-1", hanzi: "你好", pinyin: "nǐ hǎo", pinyinRaw: "nihao", meaning: "Xin chào", hskLevel: 1 },
  { id: "fw-hsk1-2", hanzi: "谢谢", pinyin: "xiè xie", pinyinRaw: "xiexie", meaning: "Cảm ơn", hskLevel: 1 },
  { id: "fw-hsk1-3", hanzi: "再见", pinyin: "zài jiàn", pinyinRaw: "zaijian", meaning: "Tạm biệt", hskLevel: 1 },
  { id: "fw-hsk1-4", hanzi: "老师", pinyin: "lǎo shī", pinyinRaw: "laoshi", meaning: "Thầy/Cô giáo", hskLevel: 1 },
  { id: "fw-hsk1-5", hanzi: "学生", pinyin: "xué sheng", pinyinRaw: "xuesheng", meaning: "Học sinh", hskLevel: 1 },
  { id: "fw-hsk1-6", hanzi: "中国", pinyin: "zhōng guó", pinyinRaw: "zhongguo", meaning: "Trung Quốc", hskLevel: 1 },
  { id: "fw-hsk1-7", hanzi: "北京", pinyin: "běi jīng", pinyinRaw: "beijing", meaning: "Bắc Kinh", hskLevel: 1 },
  { id: "fw-hsk1-8", hanzi: "朋友", pinyin: "péng you", pinyinRaw: "pengyou", meaning: "Bạn bè", hskLevel: 1 },
  { id: "fw-hsk1-9", hanzi: "爸爸", pinyin: "bà ba", pinyinRaw: "baba", meaning: "Bố", hskLevel: 1 },
  { id: "fw-hsk1-10", hanzi: "妈妈", pinyin: "mā ma", pinyinRaw: "mama", meaning: "Mẹ", hskLevel: 1 },
  { id: "fw-hsk1-11", hanzi: "高兴", pinyin: "gāo xìng", pinyinRaw: "gaoxing", meaning: "Vui vẻ", hskLevel: 1 },
  { id: "fw-hsk1-12", hanzi: "喝水", pinyin: "hē shuǐ", pinyinRaw: "heshui", meaning: "Uống nước", hskLevel: 1 },
  { id: "fw-hsk1-13", hanzi: "吃饭", pinyin: "chī fàn", pinyinRaw: "chifan", meaning: "Ăn cơm", hskLevel: 1 },
  { id: "fw-hsk1-14", hanzi: "苹果", pinyin: "píng guǒ", pinyinRaw: "pingguo", meaning: "Quả táo", hskLevel: 1 },
  { id: "fw-hsk1-15", hanzi: "电脑", pinyin: "diàn nǎo", pinyinRaw: "diannao", meaning: "Máy tính", hskLevel: 1 },
  { id: "fw-hsk1-16", hanzi: "电影", pinyin: "diàn yǐng", pinyinRaw: "dianying", meaning: "Phim điện ảnh", hskLevel: 1 },
  { id: "fw-hsk1-17", hanzi: "看书", pinyin: "kàn shū", pinyinRaw: "kanshu", meaning: "Đọc sách", hskLevel: 1 },
  { id: "fw-hsk1-18", hanzi: "学校", pinyin: "xué xiào", pinyinRaw: "xuexiao", meaning: "Trường học", hskLevel: 1 },
  { id: "fw-hsk1-19", hanzi: "商店", pinyin: "shāng diàn", pinyinRaw: "shangdian", meaning: "Cửa hàng", hskLevel: 1 },
  { id: "fw-hsk1-20", hanzi: "医院", pinyin: "yī yuàn", pinyinRaw: "yiyuan", meaning: "Bệnh viện", hskLevel: 1 },
  { id: "fw-hsk1-21", hanzi: "天气", pinyin: "tiān qì", pinyinRaw: "tianqi", meaning: "Thời tiết", hskLevel: 1 },
  { id: "fw-hsk1-22", hanzi: "明天", pinyin: "míng tiān", pinyinRaw: "mingtian", meaning: "Ngày mai", hskLevel: 1 },
  { id: "fw-hsk1-23", hanzi: "喜欢", pinyin: "xǐ huan", pinyinRaw: "xihuan", meaning: "Thích", hskLevel: 1 },
  { id: "fw-hsk1-24", hanzi: "认识", pinyin: "rèn shi", pinyinRaw: "renshi", meaning: "Quen biết", hskLevel: 1 },

  // HSK 2
  { id: "fw-hsk2-1", hanzi: "准备", pinyin: "zhǔn bèi", pinyinRaw: "zhunbei", meaning: "Chuẩn bị", hskLevel: 2 },
  { id: "fw-hsk2-2", hanzi: "运动", pinyin: "yùn dòng", pinyinRaw: "yundong", meaning: "Vận động, thể thao", hskLevel: 2 },
  { id: "fw-hsk2-3", hanzi: "跑步", pinyin: "pǎo bù", pinyinRaw: "paobu", meaning: "Chạy bộ", hskLevel: 2 },
  { id: "fw-hsk2-4", hanzi: "游泳", pinyin: "yóu yǒng", pinyinRaw: "youyong", meaning: "Bơi lội", hskLevel: 2 },
  { id: "fw-hsk2-5", hanzi: "时间", pinyin: "shí jiān", pinyinRaw: "shijian", meaning: "Thời gian", hskLevel: 2 },
  { id: "fw-hsk2-6", hanzi: "手表", pinyin: "shǒu biǎo", pinyinRaw: "shoubiao", meaning: "Đồng hồ đeo tay", hskLevel: 2 },
  { id: "fw-hsk2-7", hanzi: "眼睛", pinyin: "yǎn jing", pinyinRaw: "yanjing", meaning: "Mắt", hskLevel: 2 },
  { id: "fw-hsk2-8", hanzi: "颜色", pinyin: "yán sè", pinyinRaw: "yanse", meaning: "Màu sắc", hskLevel: 2 },
  { id: "fw-hsk2-9", hanzi: "便宜", pinyin: "pián yi", pinyinRaw: "pianyi", meaning: "Rẻ", hskLevel: 2 },
  { id: "fw-hsk2-10", hanzi: "说话", pinyin: "shuō huà", pinyinRaw: "shuohua", meaning: "Nói chuyện", hskLevel: 2 },
  { id: "fw-hsk2-11", hanzi: "帮助", pinyin: "bāng zhù", pinyinRaw: "bangzhu", meaning: "Giúp đỡ", hskLevel: 2 },
  { id: "fw-hsk2-12", hanzi: "介绍", pinyin: "jiè shào", pinyinRaw: "jieshao", meaning: "Giới thiệu", hskLevel: 2 },
  { id: "fw-hsk2-13", hanzi: "希望", pinyin: "xī wàng", pinyinRaw: "xiwang", meaning: "Hy vọng", hskLevel: 2 },
  { id: "fw-hsk2-14", hanzi: "旅游", pinyin: "lǚ yóu", pinyinRaw: "lvyou", meaning: "Du lịch", hskLevel: 2 },
  { id: "fw-hsk2-15", hanzi: "机场", pinyin: "jī chǎng", pinyinRaw: "jichang", meaning: "Sân bay", hskLevel: 2 },
  { id: "fw-hsk2-16", hanzi: "公共汽车", pinyin: "gōng gòng qì chē", pinyinRaw: "gonggongqiche", meaning: "Xe buýt", hskLevel: 2 },

  // HSK 3
  { id: "fw-hsk3-1", hanzi: "清楚", pinyin: "qīng chu", pinyinRaw: "qingchu", meaning: "Rõ ràng", hskLevel: 3 },
  { id: "fw-hsk3-2", hanzi: "解决", pinyin: "jiě jué", pinyinRaw: "jiejue", meaning: "Giải quyết", hskLevel: 3 },
  { id: "fw-hsk3-3", hanzi: "认真", pinyin: "rèn zhēn", pinyinRaw: "renzhen", meaning: "Nghiêm túc, chăm chỉ", hskLevel: 3 },
  { id: "fw-hsk3-4", hanzi: "练习", pinyin: "liàn xí", pinyinRaw: "lianxi", meaning: "Luyện tập", hskLevel: 3 },
  { id: "fw-hsk3-5", hanzi: "简单", pinyin: "jiǎn dān", pinyinRaw: "jiandan", meaning: "Đơn giản", hskLevel: 3 },
  { id: "fw-hsk3-6", hanzi: "热情", pinyin: "rè qíng", pinyinRaw: "reqing", meaning: "Nhiệt tình", hskLevel: 3 },
  { id: "fw-hsk3-7", hanzi: "环境", pinyin: "huán jìng", pinyinRaw: "huanjing", meaning: "Môi trường", hskLevel: 3 },
  { id: "fw-hsk3-8", hanzi: "会议", pinyin: "huì yì", pinyinRaw: "huiyi", meaning: "Cuộc họp", hskLevel: 3 },
  { id: "fw-hsk3-9", hanzi: "历史", pinyin: "lì shǐ", pinyinRaw: "lishi", meaning: "Lịch sử", hskLevel: 3 },
  { id: "fw-hsk3-10", hanzi: "检查", pinyin: "jiǎn chá", pinyinRaw: "jiancha", meaning: "Kiểm tra", hskLevel: 3 },

  // HSK 4
  { id: "fw-hsk4-1", hanzi: "坚持", pinyin: "jiān chí", pinyinRaw: "jianchi", meaning: "Kiên trì", hskLevel: 4 },
  { id: "fw-hsk4-2", hanzi: "成功", pinyin: "chéng gōng", pinyinRaw: "chenggong", meaning: "Thành công", hskLevel: 4 },
  { id: "fw-hsk4-3", hanzi: "礼貌", pinyin: "lǐ mào", pinyinRaw: "limao", meaning: "Lễ phép, lịch sự", hskLevel: 4 },
  { id: "fw-hsk4-4", hanzi: "流利", pinyin: "liú lì", pinyinRaw: "liuli", meaning: "Lưu loát", hskLevel: 4 },
  { id: "fw-hsk4-5", hanzi: "态度", pinyin: "tài du", pinyinRaw: "taidu", meaning: "Thái độ", hskLevel: 4 },
  { id: "fw-hsk4-6", hanzi: "经历", pinyin: "jīng lì", pinyinRaw: "jingli", meaning: "Trải nghiệm", hskLevel: 4 },
  { id: "fw-hsk4-7", hanzi: "精彩", pinyin: "jīng cǎi", pinyinRaw: "jingcai", meaning: "Đặc sắc, tuyệt vời", hskLevel: 4 },
  { id: "fw-hsk4-8", hanzi: "诚实", pinyin: "chéng shí", pinyinRaw: "chengshi", meaning: "Thành thật", hskLevel: 4 },
];

// Generate game words based on collection / unit or fallback to HSK level
export function getWordsForGame(
  collectionId?: string,
  unitId?: string,
): GameWord[] {
  let matchedLevel = 1;
  if (collectionId) {
    if (collectionId.includes("1")) matchedLevel = 1;
    else if (collectionId.includes("2")) matchedLevel = 2;
    else if (collectionId.includes("3")) matchedLevel = 3;
    else if (collectionId.includes("4")) matchedLevel = 4;
    else if (collectionId.includes("5")) matchedLevel = 5;
    else if (collectionId.includes("6")) matchedLevel = 6;
  }

  // Filter or prioritize the current level
  const primaryWords = HSK_FALLING_WORDS.filter(
    (w) => w.hskLevel === matchedLevel,
  );

  // If not enough words, blend in nearby levels
  if (primaryWords.length < 15) {
    return [...primaryWords, ...HSK_FALLING_WORDS.filter((w) => w.hskLevel !== matchedLevel)];
  }

  // Return shuffled copy
  return [...primaryWords].sort(() => Math.random() - 0.5);
}
