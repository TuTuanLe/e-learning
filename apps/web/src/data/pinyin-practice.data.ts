// Rich dataset for Pinyin practice, Tone Trainer, Minimal Pairs, and 10 Structured Lessons
// Inspired by Dong Chinese phonetics curriculum and tailored for Vietnamese learners

export interface ToneInfo {
  tone: number;
  nameVi: string;
  pinyinMark: string;
  contour: string; // e.g. "55", "35", "214", "51"
  contourDesc: string;
  descriptionVi: string;
  vietnameseEquivalent: string;
  color: string;
  bgLight: string;
}

export const TONE_METADATA: Record<number, ToneInfo> = {
  1: {
    tone: 1,
    nameVi: "Thanh 1 (Âm bình)",
    pinyinMark: "¯",
    contour: "55",
    contourDesc: "Cao - Bằng",
    descriptionVi: "Giữ âm vực cao và phẳng từ đầu đến cuối, không lên không xuống, ngân dài vừa phải.",
    vietnameseEquivalent: "Tương tự thanh không dấu của tiếng Việt nhưng tông giọng cao và ngân phẳng hơn.",
    color: "#0284c7", // Sky blue
    bgLight: "bg-sky-50 text-sky-700 border-sky-200",
  },
  2: {
    tone: 2,
    nameVi: "Thanh 2 (Dương bình)",
    pinyinMark: "ˊ",
    contour: "35",
    contourDesc: "Lên dốc",
    descriptionVi: "Bắt đầu ở mức trung bình (3) và vút nhanh lên mức cao nhất (5).",
    vietnameseEquivalent: "Gần giống dấu sắc (´) tiếng Việt, nhưng kéo mượt mà từ giữa lên cao.",
    color: "#16a34a", // Green
    bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  3: {
    tone: 3,
    nameVi: "Thanh 3 (Thượng thanh)",
    pinyinMark: "ˇ",
    contour: "214",
    contourDesc: "Hạ thấp rồi lên",
    descriptionVi: "Hạ sâu giọng xuống đáy cổ họng (2 -> 1) rồi hơi nâng nhẹ lên (4). Khi nói nhanh thường chỉ đọc nửa đầu (21 - thanh 3 nửa).",
    vietnameseEquivalent: "Gần giống dấu hỏi hoặc dấu nặng kết hợp hỏi, điểm mấu chốt là phải xuống thật trầm.",
    color: "#d97706", // Amber
    bgLight: "bg-amber-50 text-amber-700 border-amber-200",
  },
  4: {
    tone: 4,
    nameVi: "Thanh 4 (Khứ thanh)",
    pinyinMark: "ˋ",
    contour: "51",
    contourDesc: "Rơi dứt khoát",
    descriptionVi: "Bắt đầu từ đỉnh cao nhất (5) rơi thẳng dứt khoát xuống đáy (1). Phát âm mạnh, ngắn và dứt khoát như ra lệnh.",
    vietnameseEquivalent: "Rơi mạnh hơn dấu huyền, ngắn và dứt khoát như tiếng giậm chân hay ra lệnh.",
    color: "#dc2626", // Red
    bgLight: "bg-rose-50 text-rose-700 border-rose-200",
  },
  5: {
    tone: 5,
    nameVi: "Thanh nhẹ (Khinh thanh)",
    pinyinMark: "·",
    contour: "·",
    contourDesc: "Ngắn nhẹ",
    descriptionVi: "Đọc thật nhẹ và ngắn, phụ thuộc vào cao độ của âm tiết đi liền trước nó.",
    vietnameseEquivalent: "Rất nhẹ và lướt qua, không nhấn trọng âm.",
    color: "#64748b", // Slate
    bgLight: "bg-slate-50 text-slate-700 border-slate-200",
  },
};

// Syllables with rich audio coverage across tones 1-4
export const SINGLE_TONE_PRACTICE_SYLLABLES = [
  "ba", "pa", "ma", "fa",
  "da", "ta", "na", "la",
  "ga", "ka", "ha",
  "ji", "qi", "xi",
  "zhi", "chi", "shi", "ri",
  "zi", "ci", "si",
  "ge", "ke", "he",
  "gu", "ku", "hu",
  "dong", "tong", "nong", "long",
  "fan", "nan", "tan", "pan",
  "tian", "xian", "lian", "qian",
  "guo", "huo", "shuo", "zuo",
  "xue", "yue", "que", "jue",
  "fei", "mei", "bei", "pei",
  "kou", "hou", "dou", "tou",
  "hao", "gao", "dao", "bao",
  "mang", "pang", "tang", "zang",
  "sui", "dui", "cui", "gui",
];

// Tone Pairs Database: Covering all combinations of 2 tones
export interface TonePairWord {
  hanzi: string;
  s1: string;
  t1: number;
  s2: string;
  t2: number;
  pinyinFormatted: string;
  meaning: string;
  note?: string;
}

export interface TonePairGroup {
  pairKey: string; // e.g. "1-1", "1-4", "3-3"
  t1: number;
  t2: number;
  nameVi: string;
  contourVi: string; // e.g. "Cao bằng + Cao bằng"
  tipVi: string;
  words: TonePairWord[];
}

export const TONE_PAIRS_DATA: TonePairGroup[] = [
  {
    pairKey: "1-1",
    t1: 1,
    t2: 1,
    nameVi: "Thanh 1 + Thanh 1",
    contourVi: "55 + 55 (Bằng phẳng kéo dài)",
    tipVi: "Giữ cả hai âm đều ở cao độ cao, không hạ giọng ở âm thứ hai.",
    words: [
      { hanzi: "今天", s1: "jin", t1: 1, s2: "tian", t2: 1, pinyinFormatted: "jīntiān", meaning: "hôm nay" },
      { hanzi: "咖啡", s1: "ka", t1: 1, s2: "fei", t2: 1, pinyinFormatted: "kāfēi", meaning: "cà phê" },
      { hanzi: "飞机", s1: "fei", t1: 1, s2: "ji", t2: 1, pinyinFormatted: "fēijī", meaning: "máy bay" },
      { hanzi: "参加", s1: "can", t1: 1, s2: "jia", t2: 1, pinyinFormatted: "cānjiā", meaning: "tham gia" },
      { hanzi: "西瓜", s1: "xi", t1: 1, s2: "gua", t2: 1, pinyinFormatted: "xīguā", meaning: "dưa hấu" },
    ],
  },
  {
    pairKey: "1-2",
    t1: 1,
    t2: 2,
    nameVi: "Thanh 1 + Thanh 2",
    contourVi: "55 + 35 (Cao bằng vút lên sắc)",
    tipVi: "Âm đầu giữ cao, âm thứ hai hơi nhả xuống một chút rồi vút sắc lên cao.",
    words: [
      { hanzi: "中国", s1: "zhong", t1: 1, s2: "guo", t2: 2, pinyinFormatted: "zhōngguó", meaning: "Trung Quốc" },
      { hanzi: "新年", s1: "xin", t1: 1, s2: "nian", t2: 2, pinyinFormatted: "xīnnián", meaning: "năm mới" },
      { hanzi: "欢迎", s1: "huan", t1: 1, s2: "ying", t2: 2, pinyinFormatted: "huānyíng", meaning: "hoan nghênh" },
      { hanzi: "帮忙", s1: "bang", t1: 1, s2: "mang", t2: 2, pinyinFormatted: "bāngmáng", meaning: "giúp đỡ" },
    ],
  },
  {
    pairKey: "1-3",
    t1: 1,
    t2: 3,
    nameVi: "Thanh 1 + Thanh 3",
    contourVi: "55 + 214 (Cao bằng rồi hạ sâu)",
    tipVi: "Từ âm đầu cao vút, chuyển xuống âm sau hạ thật trầm xuống đáy cổ họng.",
    words: [
      { hanzi: "机场", s1: "ji", t1: 1, s2: "chang", t2: 3, pinyinFormatted: "jīchǎng", meaning: "sân bay" },
      { hanzi: "身体", s1: "shen", t1: 1, s2: "ti", t2: 3, pinyinFormatted: "shēntǐ", meaning: "sức khỏe, cơ thể" },
      { hanzi: "听懂", s1: "ting", t1: 1, s2: "dong", t2: 3, pinyinFormatted: "tīngdǒng", meaning: "nghe hiểu" },
      { hanzi: "黑板", s1: "hei", t1: 1, s2: "ban", t2: 3, pinyinFormatted: "hēibǎn", meaning: "bảng đen" },
    ],
  },
  {
    pairKey: "1-4",
    t1: 1,
    t2: 4,
    nameVi: "Thanh 1 + Thanh 4",
    contourVi: "55 + 51 (Cao bằng rồi rơi dứt khoát)",
    tipVi: "Âm 1 kéo dài trên cao, âm 2 từ đỉnh cao rơi mạnh xuống ngay lập tức.",
    words: [
      { hanzi: "音乐", s1: "yin", t1: 1, s2: "yue", t2: 4, pinyinFormatted: "yīnyuè", meaning: "âm nhạc" },
      { hanzi: "希望", s1: "xi", t1: 1, s2: "wang", t2: 4, pinyinFormatted: "xīwàng", meaning: "hy vọng" },
      { hanzi: "帮助", s1: "bang", t1: 1, s2: "zhu", t2: 4, pinyinFormatted: "bāngzhù", meaning: "giúp đỡ" },
      { hanzi: "生病", s1: "sheng", t1: 1, s2: "bing", t2: 4, pinyinFormatted: "shēngbìng", meaning: "bị ốm" },
    ],
  },
  {
    pairKey: "2-1",
    t1: 2,
    t2: 1,
    nameVi: "Thanh 2 + Thanh 1",
    contourVi: "35 + 55 (Lên sắc rồi giữ cao)",
    tipVi: "Vút từ giữa lên đỉnh, rồi giữ nguyên cao độ đỉnh đó cho âm thứ hai.",
    words: [
      { hanzi: "明天", s1: "ming", t1: 2, s2: "tian", t2: 1, pinyinFormatted: "míngtiān", meaning: "ngày mai" },
      { hanzi: "时间", s1: "shi", t1: 2, s2: "jian", t2: 1, pinyinFormatted: "shíjiān", meaning: "thời gian" },
      { hanzi: "银行", s1: "yin", t1: 2, s2: "hang", t2: 1, pinyinFormatted: "yínháng", meaning: "ngân hàng" },
      { hanzi: "食堂", s1: "shi", t1: 2, s2: "tang", t2: 1, pinyinFormatted: "shítáng", meaning: "nhà ăn" },
    ],
  },
  {
    pairKey: "2-2",
    t1: 2,
    t2: 2,
    nameVi: "Thanh 2 + Thanh 2",
    contourVi: "35 + 35 (Hai nhịp vút lên liên tiếp)",
    tipVi: "Lên dốc lần 1, hạ nhẹ rồi lại vút lên dốc lần 2 như hai con sóng.",
    words: [
      { hanzi: "人民", s1: "ren", t1: 2, s2: "min", t2: 2, pinyinFormatted: "rénmín", meaning: "nhân dân" },
      { hanzi: "学习", s1: "xue", t1: 2, s2: "xi", t2: 2, pinyinFormatted: "xuéxí", meaning: "học tập" },
      { hanzi: "常常", s1: "chang", t1: 2, s2: "chang", t2: 2, pinyinFormatted: "chángcháng", meaning: "thường xuyên" },
      { hanzi: "回答", s1: "hui", t1: 2, s2: "da", t2: 2, pinyinFormatted: "huídá", meaning: "trả lời" },
    ],
  },
  {
    pairKey: "2-3",
    t1: 2,
    t2: 3,
    nameVi: "Thanh 2 + Thanh 3",
    contourVi: "35 + 214 (Lên sắc rồi trũng sâu)",
    tipVi: "Cặp âm kinh điển: vút lên cao rồi đổ trũng xuống cổ họng.",
    words: [
      { hanzi: "苹果", s1: "ping", t1: 2, s2: "guo", t2: 3, pinyinFormatted: "píngguǒ", meaning: "quả táo" },
      { hanzi: "啤酒", s1: "pi", t1: 2, s2: "jiu", t2: 3, pinyinFormatted: "píjiǔ", meaning: "bia" },
      { hanzi: "游泳", s1: "you", t1: 2, s2: "yong", t2: 3, pinyinFormatted: "yóuyǒng", meaning: "bơi lội" },
      { hanzi: "蓝天", s1: "lan", t1: 2, s2: "se", t2: 3, pinyinFormatted: "lánsè", meaning: "màu xanh da trời" },
    ],
  },
  {
    pairKey: "2-4",
    t1: 2,
    t2: 4,
    nameVi: "Thanh 2 + Thanh 4",
    contourVi: "35 + 51 (Lên sắc rồi bổ nhào)",
    tipVi: "Vút lên sắc đến đỉnh, sau đó âm 2 rơi dập dứt khoát xuống đáy.",
    words: [
      { hanzi: "决定", s1: "jue", t1: 2, s2: "ding", t2: 4, pinyinFormatted: "juédìng", meaning: "quyết định" },
      { hanzi: "容易", s1: "rong", t1: 2, s2: "yi", t2: 4, pinyinFormatted: "róngyì", meaning: "dễ dàng" },
      { hanzi: "习惯", s1: "xi", t1: 2, s2: "guan", t2: 4, pinyinFormatted: "xíguàn", meaning: "thói quen" },
      { hanzi: "文化", s1: "wen", t1: 2, s2: "hua", t2: 4, pinyinFormatted: "wénhuà", meaning: "văn hóa" },
    ],
  },
  {
    pairKey: "3-1",
    t1: 3,
    t2: 1,
    nameVi: "Thanh 3 + Thanh 1",
    contourVi: "21 + 55 (Trầm nửa thanh 3 rồi phóng vút lên cao)",
    tipVi: "Âm 3 chỉ cần hạ trầm (nửa thanh 3), sau đó bật ngay lên âm 1 cao phẳng.",
    words: [
      { hanzi: "北京", s1: "bei", t1: 3, s2: "jing", t2: 1, pinyinFormatted: "běijīng", meaning: "Bắc Kinh" },
      { hanzi: "许多", s1: "xu", t1: 3, s2: "duo", t2: 1, pinyinFormatted: "xǔduō", meaning: "nhiều" },
      { hanzi: "简单", s1: "jian", t1: 3, s2: "dan", t2: 1, pinyinFormatted: "jiǎndān", meaning: "đơn giản" },
      { hanzi: "火车站", s1: "huo", t1: 3, s2: "che", t2: 1, pinyinFormatted: "huǒchē", meaning: "tàu hỏa" },
    ],
  },
  {
    pairKey: "3-2",
    t1: 3,
    t2: 2,
    nameVi: "Thanh 3 + Thanh 2",
    contourVi: "21 + 35 (Trầm rồi vút sắc)",
    tipVi: "Âm 3 hạ sâu, sau đó từ khoảng trung bình vút lên âm 2.",
    words: [
      { hanzi: "以前", s1: "yi", t1: 3, s2: "qian", t2: 2, pinyinFormatted: "yǐqián", meaning: "trước đây" },
      { hanzi: "旅行", s1: "lv", t1: 3, s2: "xing", t2: 2, pinyinFormatted: "lǚxíng", meaning: "du lịch" },
      { hanzi: "语言", s1: "yu", t1: 3, s2: "yan", t2: 2, pinyinFormatted: "yǔyán", meaning: "ngôn ngữ" },
      { hanzi: "起源", s1: "qi", t1: 3, s2: "yuan", t2: 2, pinyinFormatted: "qǐyuán", meaning: "nguồn gốc" },
    ],
  },
  {
    pairKey: "3-3",
    t1: 3,
    t2: 3,
    nameVi: "Thanh 3 + Thanh 3 (Biến điệu!)",
    contourVi: "35 + 214 (Âm đầu đọc thành Thanh 2)",
    tipVi: "QUY TẮC VÀNG: Hai thanh 3 đứng liền nhau, thanh 3 đầu tiên TỰ ĐỘNG đọc thành Thanh 2 (3+3 -> 2+3).",
    words: [
      { hanzi: "你好", s1: "ni", t1: 2, s2: "hao", t2: 3, pinyinFormatted: "nǐhǎo (đọc níhǎo)", meaning: "xin chào", note: "nǐ đổi thành ní" },
      { hanzi: "可以", s1: "ke", t1: 2, s2: "yi", t2: 3, pinyinFormatted: "kěyǐ (đọc kéyǐ)", meaning: "có thể", note: "kě đổi thành ké" },
      { hanzi: "手表", s1: "shou", t1: 2, s2: "biao", t2: 3, pinyinFormatted: "shǒubiǎo (đọc shóubiǎo)", meaning: "đồng hồ đeo tay", note: "shǒu đổi thành shóu" },
      { hanzi: "水果", s1: "shui", t1: 2, s2: "guo", t2: 3, pinyinFormatted: "shuǐguǒ (đọc shuíguǒ)", meaning: "hoa quả", note: "shuǐ đổi thành shuí" },
    ],
  },
  {
    pairKey: "3-4",
    t1: 3,
    t2: 4,
    nameVi: "Thanh 3 + Thanh 4",
    contourVi: "21 + 51 (Trầm nửa thanh 3 rồi dập mạnh thanh 4)",
    tipVi: "Hạ trầm nửa thanh 3, lấy đà bật lên đỉnh để quất mạnh thanh 4 xuống.",
    words: [
      { hanzi: "主要", s1: "zhu", t1: 3, s2: "yao", t2: 4, pinyinFormatted: "zhǔyào", meaning: "chủ yếu" },
      { hanzi: "感谢", s1: "gan", t1: 3, s2: "xie", t2: 4, pinyinFormatted: "gǎnxiè", meaning: "cảm ơn" },
      { hanzi: "努力", s1: "nu", t1: 3, s2: "li", t2: 4, pinyinFormatted: "nǔlì", meaning: "nỗ lực, cố gắng" },
      { hanzi: "比赛", s1: "bi", t1: 3, s2: "sai", t2: 4, pinyinFormatted: "bǐsài", meaning: "thi đấu, trận đấu" },
    ],
  },
  {
    pairKey: "4-1",
    t1: 4,
    t2: 1,
    nameVi: "Thanh 4 + Thanh 1",
    contourVi: "51 + 55 (Rơi dứt khoát rồi nhảy lên cao bằng)",
    tipVi: "Chặt dứt khoát âm đầu, sau đó vươn ngay lên nốt cao giữ phẳng cho âm 1.",
    words: [
      { hanzi: "认真", s1: "ren", t1: 4, s2: "zhen", t2: 1, pinyinFormatted: "rènzhēn", meaning: "chăm chỉ, nghiêm túc" },
      { hanzi: "毕业", s1: "bi", t1: 4, s2: "ye", t2: 4, pinyinFormatted: "bìyè", meaning: "tốt nghiệp" },
      { hanzi: "面包", s1: "mian", t1: 4, s2: "bao", t2: 1, pinyinFormatted: "miànbāo", meaning: "bánh mì" },
      { hanzi: "大家", s1: "da", t1: 4, s2: "jia", t2: 1, pinyinFormatted: "dàjiā", meaning: "mọi người" },
    ],
  },
  {
    pairKey: "4-2",
    t1: 4,
    t2: 2,
    nameVi: "Thanh 4 + Thanh 2",
    contourVi: "51 + 35 (Rơi dứt khoát rồi vút sắc lên)",
    tipVi: "Rơi thẳng xuống đáy rồi từ lưng chừng vuốt mạnh lên cao.",
    words: [
      { hanzi: "去年", s1: "qu", t1: 4, s2: "nian", t2: 2, pinyinFormatted: "qùnián", meaning: "năm ngoái" },
      { hanzi: "练习", s1: "lian", t1: 4, s2: "xi", t2: 2, pinyinFormatted: "liànxí", meaning: "luyện tập" },
      { hanzi: "特别", s1: "te", t1: 4, s2: "bie", t2: 2, pinyinFormatted: "tèbié", meaning: "đặc biệt" },
      { hanzi: "复习", s1: "fu", t1: 4, s2: "xi", t2: 2, pinyinFormatted: "fùxí", meaning: "ôn tập" },
    ],
  },
  {
    pairKey: "4-3",
    t1: 4,
    t2: 3,
    nameVi: "Thanh 4 + Thanh 3",
    contourVi: "51 + 214 (Dập thanh 4 rồi uốn trũng thanh 3)",
    tipVi: "Âm đầu rơi mạnh, âm 2 từ tốn hạ sâu rồi ngóc nhẹ lên.",
    words: [
      { hanzi: "汉语", s1: "han", t1: 4, s2: "yu", t2: 3, pinyinFormatted: "hànyǔ", meaning: "tiếng Hán" },
      { hanzi: "电影", s1: "dian", t1: 4, s2: "ying", t2: 3, pinyinFormatted: "diànyǐng", meaning: "phim điện ảnh" },
      { hanzi: "电脑", s1: "dian", t1: 4, s2: "nao", t2: 3, pinyinFormatted: "diànnǎo", meaning: "máy tính" },
      { hanzi: "变化", s1: "bian", t1: 4, s2: "hua", t2: 4, pinyinFormatted: "biànhuà", meaning: "biến hóa, thay đổi" },
    ],
  },
  {
    pairKey: "4-4",
    t1: 4,
    t2: 4,
    nameVi: "Thanh 4 + Thanh 4",
    contourVi: "51 + 51 (Hai nhịp chặt dứt khoát liên tiếp)",
    tipVi: "Phải nhấc giọng lên đỉnh lại trước khi bổ nhát thứ hai, không đọc dính liền.",
    words: [
      { hanzi: "现在", s1: "xian", t1: 4, s2: "zai", t2: 4, pinyinFormatted: "xiànzài", meaning: "bây giờ, hiện tại" },
      { hanzi: "再见", s1: "zai", t1: 4, s2: "jian", t2: 4, pinyinFormatted: "zàijiàn", meaning: "tạm biệt" },
      { hanzi: "睡觉", s1: "shui", t1: 4, s2: "jiao", t2: 4, pinyinFormatted: "shuìjiào", meaning: "đi ngủ" },
      { hanzi: "介绍", s1: "jie", t1: 4, s2: "shao", t2: 4, pinyinFormatted: "jièshào", meaning: "giới thiệu" },
    ],
  },
  {
    pairKey: "any-5",
    t1: 1,
    t2: 5,
    nameVi: "Thanh nhẹ (Khinh thanh)",
    contourVi: "Âm sau cực ngắn và nhẹ",
    tipVi: "Âm thứ 2 không mang trọng âm, phát âm thoáng qua nhẹ như hơi thở.",
    words: [
      { hanzi: "妈妈", s1: "ma", t1: 1, s2: "ma", t2: 5, pinyinFormatted: "māma", meaning: "mẹ" },
      { hanzi: "爸爸", s1: "ba", t1: 4, s2: "ba", t2: 5, pinyinFormatted: "bàba", meaning: "bố" },
      { hanzi: "朋友", s1: "peng", t1: 2, s2: "you", t2: 5, pinyinFormatted: "péngyou", meaning: "bạn bè" },
      { hanzi: "喜欢", s1: "xi", t1: 3, s2: "huan", t2: 5, pinyinFormatted: "xǐhuan", meaning: "thích" },
      { hanzi: "谢谢", s1: "xie", t1: 4, s2: "xie", t2: 5, pinyinFormatted: "xièxie", meaning: "cảm ơn" },
    ],
  },
];

// Minimal Pairs Sound Discrimination Quiz
export type SoundPairCategory =
  | "aspirated"   // b/p, d/t, g/k, z/c, zh/ch, j/q
  | "retroflex"   // z/zh, c/ch, s/sh
  | "palatals"    // j, q, x
  | "nasals"      // an/ang, en/eng, in/ing
  | "rounding";   // u vs ü

export interface SoundPairQuizItem {
  id: string;
  category: SoundPairCategory;
  categoryNameVi: string;
  prompt: {
    syllable: string;
    tone: number;
    hanzi?: string;
    meaning?: string;
  };
  options: {
    syllable: string;
    tone: number;
    pinyin: string;
    hanzi?: string;
    meaning?: string;
    isCorrect: boolean;
  }[];
  contrastTitle: string; // e.g. "b (không bật hơi) vs p (bật hơi mạnh)"
  mouthGuideVi: string;  // Articulation tip
}

export const SOUND_PAIRS_DATA: SoundPairQuizItem[] = [
  // ASPIRATED vs UNASPIRATED
  {
    id: "asp-b-p-1",
    category: "aspirated",
    categoryNameVi: "Bật hơi vs Không bật hơi",
    contrastTitle: "b (không bật hơi) vs p (bật hơi mạnh)",
    mouthGuideVi: "Âm 'b' mím môi nhẹ mở ra, không luồng khí thoát. Âm 'p' mím chặt môi dồn khí rồi bật mạnh luồng hơi ra (đặt tờ giấy trước miệng sẽ bay mạnh).",
    prompt: { syllable: "ba", tone: 4, hanzi: "爸", meaning: "bố" },
    options: [
      { syllable: "ba", tone: 4, pinyin: "bà", hanzi: "爸", meaning: "bố", isCorrect: true },
      { syllable: "pa", tone: 4, pinyin: "pà", hanzi: "怕", meaning: "sợ", isCorrect: false },
    ],
  },
  {
    id: "asp-b-p-2",
    category: "aspirated",
    categoryNameVi: "Bật hơi vs Không bật hơi",
    contrastTitle: "b vs p",
    mouthGuideVi: "Chú ý luồng hơi: 'p' bắn luồng gió mạnh, 'b' nghe chắc êm như chữ 'p' tiếng Việt.",
    prompt: { syllable: "po", tone: 1, hanzi: "坡", meaning: "dốc núi" },
    options: [
      { syllable: "bo", tone: 1, pinyin: "bō", hanzi: "波", meaning: "sóng", isCorrect: false },
      { syllable: "po", tone: 1, pinyin: "pō", hanzi: "坡", meaning: "dốc núi", isCorrect: true },
    ],
  },
  {
    id: "asp-d-t-1",
    category: "aspirated",
    categoryNameVi: "Bật hơi vs Không bật hơi",
    contrastTitle: "d (không bật hơi) vs t (bật hơi mạnh)",
    mouthGuideVi: "'d' đầu lưỡi chạm chân răng trên mở ra êm (đọc như 't' tiếng Việt). 't' đầu lưỡi chặn khí rồi bật mạnh luồng gió ra (như 'th' tiếng Việt bật hơi).",
    prompt: { syllable: "da", tone: 4, hanzi: "大", meaning: "to, lớn" },
    options: [
      { syllable: "da", tone: 4, pinyin: "dà", hanzi: "大", meaning: "to, lớn", isCorrect: true },
      { syllable: "ta", tone: 4, pinyin: "tà", hanzi: "踏", meaning: "dẫm đạp", isCorrect: false },
    ],
  },
  {
    id: "asp-d-t-2",
    category: "aspirated",
    categoryNameVi: "Bật hơi vs Không bật hơi",
    contrastTitle: "d vs t",
    mouthGuideVi: "'t' có luồng hơi phóng ra rất mạnh mẽ, 'd' phát âm gọn gàng không hơi gió.",
    prompt: { syllable: "ting", tone: 1, hanzi: "听", meaning: "nghe" },
    options: [
      { syllable: "ding", tone: 1, pinyin: "dīng", hanzi: "丁", meaning: "đinh", isCorrect: false },
      { syllable: "ting", tone: 1, pinyin: "tīng", hanzi: "听", meaning: "nghe", isCorrect: true },
    ],
  },
  {
    id: "asp-g-k-1",
    category: "aspirated",
    categoryNameVi: "Bật hơi vs Không bật hơi",
    contrastTitle: "g (không bật hơi) vs k (bật hơi cuống họng)",
    mouthGuideVi: "'g' cuống lưỡi chạm ngạc mềm nâng lên mở ra (đọc như 'c/k' tiếng Việt). 'k' cuống họng bật luồng hơi xì mạnh ra ngoài (như khạc nhẹ hơi).",
    prompt: { syllable: "kan", tone: 4, hanzi: "看", meaning: "nhìn, xem" },
    options: [
      { syllable: "gan", tone: 4, pinyin: "gàn", hanzi: "干", meaning: "làm", isCorrect: false },
      { syllable: "kan", tone: 4, pinyin: "kàn", hanzi: "看", meaning: "nhìn, xem", isCorrect: true },
    ],
  },
  {
    id: "asp-g-k-2",
    category: "aspirated",
    categoryNameVi: "Bật hơi vs Không bật hơi",
    contrastTitle: "g vs k",
    mouthGuideVi: "Hãy nghe kỹ âm k có độ ma sát cuống họng và tiếng gió bật mạnh.",
    prompt: { syllable: "ge", tone: 1, hanzi: "哥", meaning: "anh trai" },
    options: [
      { syllable: "ge", tone: 1, pinyin: "gē", hanzi: "哥", meaning: "anh trai", isCorrect: true },
      { syllable: "ke", tone: 1, pinyin: "kē", hanzi: "棵", meaning: "cây (lượng từ)", isCorrect: false },
    ],
  },

  // RETROFLEX vs FLAT TONGUE (z/zh, c/ch, s/sh)
  {
    id: "ret-z-zh-1",
    category: "retroflex",
    categoryNameVi: "Đầu lưỡi phẳng vs Uốn lưỡi",
    contrastTitle: "z (đầu lưỡi phẳng) vs zh (uốn lưỡi chạm ngạc cứng)",
    mouthGuideVi: "z: Đầu lưỡi thẳng áp vào mặt sau răng trên, miệng hơi cười dẹt. zh: Uốn đầu lưỡi cong lên chạm vào vòm họng ngạc cứng, miệng hơi tròn.",
    prompt: { syllable: "zhi", tone: 1, hanzi: "知", meaning: "biết" },
    options: [
      { syllable: "zi", tone: 1, pinyin: "zī", hanzi: "资", meaning: "tư bản", isCorrect: false },
      { syllable: "zhi", tone: 1, pinyin: "zhī", hanzi: "知", meaning: "biết", isCorrect: true },
    ],
  },
  {
    id: "ret-z-zh-2",
    category: "retroflex",
    categoryNameVi: "Đầu lưỡi phẳng vs Uốn lưỡi",
    contrastTitle: "z vs zh",
    mouthGuideVi: "Nghe độ trầm và độ cong lưỡi: zh nghe ấm, dày và đầm; z nghe thanh mảnh sắc nhọn ở đầu răng.",
    prompt: { syllable: "zai", tone: 4, hanzi: "在", meaning: "ở, đang" },
    options: [
      { syllable: "zai", tone: 4, pinyin: "zài", hanzi: "在", meaning: "ở, đang", isCorrect: true },
      { syllable: "zhai", tone: 4, pinyin: "zhài", hanzi: "寨", meaning: "trại, bản", isCorrect: false },
    ],
  },
  {
    id: "ret-c-ch-1",
    category: "retroflex",
    categoryNameVi: "Đầu lưỡi phẳng vs Uốn lưỡi",
    contrastTitle: "c (thẳng lưỡi bật hơi) vs ch (uốn lưỡi bật hơi)",
    mouthGuideVi: "Cả hai đều bật hơi cực mạnh! Nhưng 'c' bật xì qua kẽ răng thẳng (như xì hơi lốp xe). 'ch' uốn cong lưỡi lên vòm họng rồi bật luồng hơi cuốn vòm.",
    prompt: { syllable: "chi", tone: 1, hanzi: "吃", meaning: "ăn" },
    options: [
      { syllable: "ci", tone: 1, pinyin: "cī", hanzi: "呲", meaning: "la rầy", isCorrect: false },
      { syllable: "chi", tone: 1, pinyin: "chī", hanzi: "吃", meaning: "ăn", isCorrect: true },
    ],
  },
  {
    id: "ret-s-sh-1",
    category: "retroflex",
    categoryNameVi: "Đầu lưỡi phẳng vs Uốn lưỡi",
    contrastTitle: "s (thẳng lưỡi xát) vs sh (uốn lưỡi xát)",
    mouthGuideVi: "'s' đọc như 'x' nhẹ tiếng Việt (xì hơi mỏng qua khe răng). 'sh' cong đầu lưỡi lên vòm cứng, phát âm như 's' nặng miền Nam rất đầm.",
    prompt: { syllable: "shi", tone: 4, hanzi: "是", meaning: "là, đúng" },
    options: [
      { syllable: "si", tone: 4, pinyin: "sì", hanzi: "四", meaning: "số 4", isCorrect: false },
      { syllable: "shi", tone: 4, pinyin: "shì", hanzi: "是", meaning: "là, đúng", isCorrect: true },
    ],
  },
  {
    id: "ret-s-sh-2",
    category: "retroflex",
    categoryNameVi: "Đầu lưỡi phẳng vs Uốn lưỡi",
    contrastTitle: "s vs sh",
    mouthGuideVi: "'si' là số bốn, 'shi' là số mười (thanh 2) hoặc 'thị/thị phi' (thanh 4).",
    prompt: { syllable: "san", tone: 1, hanzi: "三", meaning: "số 3" },
    options: [
      { syllable: "san", tone: 1, pinyin: "sān", hanzi: "三", meaning: "số 3", isCorrect: true },
      { syllable: "shan", tone: 1, pinyin: "shān", hanzi: "山", meaning: "núi", isCorrect: false },
    ],
  },

  // PALATALS (j, q, x)
  {
    id: "pal-j-q-1",
    category: "palatals",
    categoryNameVi: "Âm mặt lưỡi (j, q, x)",
    contrastTitle: "j (không bật hơi) vs q (bật hơi cực mạnh)",
    mouthGuideVi: "Mặt trước lưỡi áp sát ngạc cứng, khóe miệng kéo sang hai bên. 'j' phát ra êm tai (như 'ch' tiếng Việt). 'q' bật luồng hơi xì sắc bén xuyên qua khe răng.",
    prompt: { syllable: "qi", tone: 1, hanzi: "七", meaning: "số 7" },
    options: [
      { syllable: "ji", tone: 1, pinyin: "jī", hanzi: "鸡", meaning: "con gà", isCorrect: false },
      { syllable: "qi", tone: 1, pinyin: "qī", hanzi: "七", meaning: "số 7", isCorrect: true },
    ],
  },
  {
    id: "pal-q-x-1",
    category: "palatals",
    categoryNameVi: "Âm mặt lưỡi (j, q, x)",
    contrastTitle: "q (tắc xát bật hơi) vs x (âm xát êm dịu)",
    mouthGuideVi: "'q' có tiếng nổ bật hơi dứt khoát trước khi xì. 'x' là luồng hơi xát trôi chảy liên tục không ngắt quãng (như 'x' tiếng Việt nhưng nâng mặt lưỡi cao hơn).",
    prompt: { syllable: "xin", tone: 1, hanzi: "心", meaning: "trái tim" },
    options: [
      { syllable: "qin", tone: 1, pinyin: "qīn", hanzi: "亲", meaning: "thân thiết", isCorrect: false },
      { syllable: "xin", tone: 1, pinyin: "xīn", hanzi: "心", meaning: "trái tim", isCorrect: true },
    ],
  },

  // NASALS (an/ang, en/eng, in/ing)
  {
    id: "nas-an-ang-1",
    category: "nasals",
    categoryNameVi: "Vần mũi trước (n) vs Mũi sau (ng)",
    contrastTitle: "an (mũi trước) vs ang (mũi sau)",
    mouthGuideVi: "an: Kết thúc bằng đầu lưỡi chạm chân răng trên chặn hơi, âm thoát ra mũi nhẹ phía trước. ang: Kết thúc bằng cuống lưỡi nâng lên ngạc mềm, họng mở rộng, vang sâu.",
    prompt: { syllable: "bang", tone: 1, hanzi: "帮", meaning: "giúp đỡ" },
    options: [
      { syllable: "ban", tone: 1, pinyin: "bān", hanzi: "班", meaning: "lớp", isCorrect: false },
      { syllable: "bang", tone: 1, pinyin: "bāng", hanzi: "帮", meaning: "giúp đỡ", isCorrect: true },
    ],
  },
  {
    id: "nas-en-eng-1",
    category: "nasals",
    categoryNameVi: "Vần mũi trước (n) vs Mũi sau (ng)",
    contrastTitle: "en vs eng",
    mouthGuideVi: "en kết thúc bằng đầu lưỡi chạm răng trên (như 'ơn'). eng kết thúc bằng cuống họng đóng sau (như 'âng' vang vọng).",
    prompt: { syllable: "feng", tone: 1, hanzi: "风", meaning: "gió" },
    options: [
      { syllable: "fen", tone: 1, pinyin: "fēn", hanzi: "分", meaning: "phút, chia", isCorrect: false },
      { syllable: "feng", tone: 1, pinyin: "fēng", hanzi: "风", meaning: "gió", isCorrect: true },
    ],
  },
  {
    id: "nas-in-ing-1",
    category: "nasals",
    categoryNameVi: "Vần mũi trước (n) vs Mũi sau (ng)",
    contrastTitle: "in vs ing",
    mouthGuideVi: "in miệng dẹt ngang, đầu lưỡi chạm răng trên. ing cuống lưỡi kéo về sau vòm mềm, tiếng chuông vang họng.",
    prompt: { syllable: "jin", tone: 1, hanzi: "今", meaning: "nay" },
    options: [
      { syllable: "jin", tone: 1, pinyin: "jīn", hanzi: "今", meaning: "nay", isCorrect: true },
      { syllable: "jing", tone: 1, pinyin: "jīng", hanzi: "经", meaning: "kinh, đã từng", isCorrect: false },
    ],
  },

  // ROUNDING (u vs ü)
  {
    id: "rnd-u-uu-1",
    category: "rounding",
    categoryNameVi: "Nguyên âm u vs ü",
    contrastTitle: "u (môi tròn sau) vs ü (môi tròn trước khép chặt)",
    mouthGuideVi: "u: Lưỡi rụt về phía sau, môi tròn tự nhiên. ü: Giữ khẩu hình nói 'i' nhưng chu tròn môi thật nhỏ và nhọn về phía trước (không cử động lưỡi).",
    prompt: { syllable: "lv", tone: 4, hanzi: "绿", meaning: "xanh lá cây" },
    options: [
      { syllable: "lu", tone: 4, pinyin: "lù", hanzi: "路", meaning: "con đường", isCorrect: false },
      { syllable: "lv", tone: 4, pinyin: "lǜ", hanzi: "绿", meaning: "xanh lá cây", isCorrect: true },
    ],
  },
  {
    id: "rnd-u-uu-2",
    category: "rounding",
    categoryNameVi: "Nguyên âm u vs ü",
    contrastTitle: "nu vs nü",
    mouthGuideVi: "nu trong 'nỗ lực' (nǔlì), nü trong 'phụ nữ' (nǚrén).",
    prompt: { syllable: "nv", tone: 3, hanzi: "女", meaning: "nữ, con gái" },
    options: [
      { syllable: "nu", tone: 3, pinyin: "nǔ", hanzi: "弩", meaning: "cái nỏ", isCorrect: false },
      { syllable: "nv", tone: 3, pinyin: "nǚ", hanzi: "女", meaning: "nữ, con gái", isCorrect: true },
    ],
  },
];

// 10 Structured Lessons (Matching Dong Chinese Pinyin Path)
export interface LessonVocabularyItem {
  hanzi: string;
  pinyin: string;
  syllable: string;
  tone: number;
  meaning: string;
}

export interface PinyinLesson {
  id: number;
  title: string;
  titleVi: string;
  summaryVi: string;
  initials: string[];
  finals: string[];
  tonesCovered: number[];
  mouthGuide: {
    title: string;
    points: string[];
    commonMistakesVi: string;
  };
  keyVocabulary: LessonVocabularyItem[];
  drillPairs: string[]; // IDs from SOUND_PAIRS_DATA
}

export const PINYIN_LESSONS_DATA: PinyinLesson[] = [
  {
    id: 1,
    title: "Lesson 1: Lips & Basic Vowels",
    titleVi: "Bài 1: Nhóm âm Môi & Nguyên âm cơ bản",
    summaryVi: "Làm quen với các âm môi b, p, m, f, nguyên âm đơn a, o, e và quy tắc thanh điệu 1 & 4.",
    initials: ["b", "p", "m", "f"],
    finals: ["a", "o", "e"],
    tonesCovered: [1, 4],
    mouthGuide: {
      title: "Cách đặt khẩu hình môi & phân biệt bật hơi",
      points: [
        "b (pơ): Mím hai môi nhẹ, mở tự nhiên, luồng hơi không thoát ra ngoài (không bật hơi).",
        "p (pơ): Mím chặt hai môi, dồn khí trong khoang miệng rồi bật bung ra mạnh mẽ (bật hơi).",
        "m (mơ): Hai môi khép nhẹ, luồng hơi thoát ra từ khoang mũi, dây thanh rung.",
        "f (phơ): Răng cửa hàm trên tiếp xúc nhẹ với môi dưới, luồng hơi ma sát thoát ra.",
      ],
      commonMistakesVi: "Người Việt hay nhầm 'b' thành 'b' tiếng Việt; thực chất 'b' tiếng Trung nghe đanh và vô thanh giống chữ 'p' tiếng Việt!",
    },
    keyVocabulary: [
      { hanzi: "爸爸", pinyin: "bàba", syllable: "ba", tone: 4, meaning: "bố" },
      { hanzi: "怕", pinyin: "pà", syllable: "pa", tone: 4, meaning: "sợ hãi" },
      { hanzi: "妈", pinyin: "mā", syllable: "ma", tone: 1, meaning: "mẹ" },
      { hanzi: "发", pinyin: "fā", syllable: "fa", tone: 1, meaning: "phát ra, gửi" },
      { hanzi: "八", pinyin: "bā", syllable: "ba", tone: 1, meaning: "số tám" },
    ],
    drillPairs: ["asp-b-p-1", "asp-b-p-2"],
  },
  {
    id: 2,
    title: "Lesson 2: Tip of Tongue & Tones 2 & 3",
    titleVi: "Bài 2: Âm Đầu Lưỡi & Chinh phục Thanh 2, 3",
    summaryVi: "Luyện các âm d, t, n, l, nguyên âm i, u và kỹ thuật chuyển điệu thanh 2 (sắc lên) & thanh 3 (trũng sâu).",
    initials: ["d", "t", "n", "l"],
    finals: ["i", "u"],
    tonesCovered: [2, 3],
    mouthGuide: {
      title: "Vị trí đặt đầu lưỡi chân răng trên",
      points: [
        "d (tơ): Đầu lưỡi chạm chân răng trên, buông xuống dứt khoát không có luồng hơi (như chữ 't' Việt).",
        "t (thơ): Đầu lưỡi chặn khí ở chân răng trên rồi bật mạnh luồng gió thoát ra (như 'th' Việt).",
        "n (nơ): Đầu lưỡi áp chân răng trên, luồng hơi thoát qua đường mũi.",
        "l (lơ): Đầu lưỡi chạm nướu trên rồi lướt xuống, luồng hơi thoát hai bên cạnh lưỡi.",
      ],
      commonMistakesVi: "Phát âm thanh 3 quá nông. Hãy nhớ: hạ giọng xuống tận đáy cổ họng rồi mới thả nhẹ.",
    },
    keyVocabulary: [
      { hanzi: "大", pinyin: "dà", syllable: "da", tone: 4, meaning: "to lớn" },
      { hanzi: "他", pinyin: "tā", syllable: "ta", tone: 1, meaning: "anh ấy" },
      { hanzi: "你", pinyin: "nǐ", syllable: "ni", tone: 3, meaning: "bạn" },
      { hanzi: "梨", pinyin: "lí", syllable: "li", tone: 2, meaning: "quả lê" },
    ],
    drillPairs: ["asp-d-t-1", "asp-d-t-2"],
  },
  {
    id: 3,
    title: "Lesson 3: Root of Tongue & Compound Finals",
    titleVi: "Bài 3: Âm Gốc Lưỡi g, k, h & Vận Mẫu Ghép ai, ei, ao, ou",
    summaryVi: "Cách điều khiển cơ cuống họng phát âm g, k, h và nguyên tắc trượt mượt mà giữa các vận mẫu ghép.",
    initials: ["g", "k", "h"],
    finals: ["ai", "ei", "ao", "ou"],
    tonesCovered: [1, 2, 3, 4],
    mouthGuide: {
      title: "Kỹ thuật cuống họng và ngạc mềm",
      points: [
        "g (cơ): Nâng cuống lưỡi chạm ngạc mềm chặn khí rồi buông ra nhẹ (đọc như 'c/k' tiếng Việt).",
        "k (khơ): Cuống lưỡi chạm ngạc mềm dồn khí rồi bật mạnh luồng hơi xì cuống họng ra ngoài.",
        "h (hơ): Cuống lưỡi nâng gần ngạc mềm tạo khe hẹp để luồng hơi ma sát nhẹ thoát ra (nhẹ hơn 'kh').",
        "Vận mẫu ghép ai, ei, ao, ou: Âm trước đọc to và dài hơn, lướt mượt chuyển sang âm sau ngắn hơn.",
      ],
      commonMistakesVi: "Đừng đọc 'h' thành chữ 'h' nhẹ hẫng của tiếng Việt; hãy tạo một chút độ cọ xát nhẹ ở cuống họng.",
    },
    keyVocabulary: [
      { hanzi: "高", pinyin: "gāo", syllable: "gao", tone: 1, meaning: "cao" },
      { hanzi: "开", pinyin: "kāi", syllable: "kai", tone: 1, meaning: "mở" },
      { hanzi: "好", pinyin: "hǎo", syllable: "hao", tone: 3, meaning: "tốt" },
      { hanzi: "黑", pinyin: "hēi", syllable: "hei", tone: 1, meaning: "đen" },
    ],
    drillPairs: ["asp-g-k-1", "asp-g-k-2"],
  },
  {
    id: 4,
    title: "Lesson 4: Palatals & The Magic Umlaut ü",
    titleVi: "Bài 4: Âm Mặt Lưỡi j, q, x & Nguyên Âm Tròn Môi ü",
    summaryVi: "Bộ ba âm mặt lưỡi khó tính j, q, x cùng nguyên âm ü và quy tắc bỏ 2 dấu chấm.",
    initials: ["j", "q", "x"],
    finals: ["ü", "ia", "ie", "iu", "ian", "in"],
    tonesCovered: [1, 2, 3, 4],
    mouthGuide: {
      title: "Mặt lưỡi phẳng áp ngạc cứng và miệng dẹt ngang",
      points: [
        "j (chờ): Mặt trước lưỡi nâng áp ngạc cứng, mở nhẹ không bật hơi, khóe miệng kéo dẹt sang hai bên.",
        "q (chờ bật hơi): Cùng vị trí với j nhưng dồn khí rồi bắn luồng hơi xì rất sắc qua kẽ răng.",
        "x (xờ): Mặt lưỡi nâng sát ngạc cứng, hơi xát đều trôi êm.",
        "Quy tắc vàng với ü: Khi đi sau j, q, x (và y), ü bỏ dấu hai chấm viết thành u (ju, qu, xu, yu) nhưng vẫn đọc là ü!",
      ],
      commonMistakesVi: "Đọc 'ju, qu, xu' thành âm u tiếng Việt. Thực chất phải chu môi tròn nhỏ đọc là 'jü, qü, xü'.",
    },
    keyVocabulary: [
      { hanzi: "七", pinyin: "qī", syllable: "qi", tone: 1, meaning: "số 7" },
      { hanzi: "去", pinyin: "qù", syllable: "qu", tone: 4, meaning: "đi" },
      { hanzi: "家", pinyin: "jiā", syllable: "jia", tone: 1, meaning: "nhà" },
      { hanzi: "小", pinyin: "xiǎo", syllable: "xiao", tone: 3, meaning: "nhỏ" },
      { hanzi: "月", pinyin: "yuè", syllable: "yue", tone: 4, meaning: "tháng, mặt trăng" },
    ],
    drillPairs: ["pal-j-q-1", "pal-q-x-1", "rnd-u-uu-1"],
  },
  {
    id: 5,
    title: "Lesson 5: Flat Tongue Initials z, c, s",
    titleVi: "Bài 5: Âm Đầu Lưỡi Trước z, c, s & Vần i Đặc Biệt",
    summaryVi: "Học cách giữ đầu lưỡi thẳng sát kẽ răng, kiểm soát bật hơi cho c và cách đọc vần -i ngắn.",
    initials: ["z", "c", "s"],
    finals: ["-i (đầu lưỡi)"],
    tonesCovered: [1, 2, 3, 4],
    mouthGuide: {
      title: "Đầu lưỡi thẳng tiếp xúc mặt sau răng cửa trên",
      points: [
        "z (trư/tư): Đầu lưỡi áp sau răng trên, miệng dẹt cười, không bật hơi.",
        "c (thư/xư): Đầu lưỡi áp sau răng trên, bật hơi xì mạnh như tiếng xịt hơi lốp xe.",
        "s (xư): Khe hở giữa đầu lưỡi và răng trên xát nhẹ êm dịu.",
        "Đặc biệt: Khi đi với z, c, s, chữ 'i' không đọc là 'i' thông thường mà đọc là âm 'ư' ngắn.",
      ],
      commonMistakesVi: "Phát âm c không đủ luồng hơi khiến nghe giống hệt z.",
    },
    keyVocabulary: [
      { hanzi: "在", pinyin: "zài", syllable: "zai", tone: 4, meaning: "ở, đang" },
      { hanzi: "菜", pinyin: "cài", syllable: "cai", tone: 4, meaning: "món ăn, rau" },
      { hanzi: "四", pinyin: "sì", syllable: "si", tone: 4, meaning: "số 4" },
      { hanzi: "字", pinyin: "zì", syllable: "zi", tone: 4, meaning: "chữ" },
    ],
    drillPairs: ["ret-z-zh-2", "ret-s-sh-2"],
  },
  {
    id: 6,
    title: "Lesson 6: Retroflex Initials zh, ch, sh, r",
    titleVi: "Bài 6: Âm Uốn Lưỡi zh, ch, sh, r (Đặc sản Bắc Kinh)",
    summaryVi: "Kỹ thuật cong đầu lưỡi chạm vòm họng ngạc cứng và phân biệt rạch ròi với nhóm z, c, s.",
    initials: ["zh", "ch", "sh", "r"],
    finals: ["-i (uốn lưỡi)"],
    tonesCovered: [1, 2, 3, 4],
    mouthGuide: {
      title: "Cong đầu lưỡi lên vòm họng trên",
      points: [
        "zh (trư cong lưỡi): Cong đầu lưỡi chạm ngạc cứng chặn khí rồi buông nhẹ, không bật hơi.",
        "ch (trư cong lưỡi bật hơi): Cùng vị trí zh nhưng dồn khí rồi bật mạnh luồng hơi cuộn tròn.",
        "sh (sơ cong lưỡi): Cong đầu lưỡi lên gần ngạc cứng, đẩy luồng hơi ma sát ra (như 's' miền Nam).",
        "r (rơ): Cùng vị trí sh nhưng rung dây thanh, âm thanh trầm ấm như chữ 'r'.",
      ],
      commonMistakesVi: "Người miền Bắc Việt Nam hay có thói quen duỗi thẳng lưỡi biến zh thành z, sh thành s.",
    },
    keyVocabulary: [
      { hanzi: "中", pinyin: "zhōng", syllable: "zhong", tone: 1, meaning: "ở giữa, Trung Quốc" },
      { hanzi: "吃", pinyin: "chī", syllable: "chi", tone: 1, meaning: "ăn" },
      { hanzi: "是", pinyin: "shì", syllable: "shi", tone: 4, meaning: "là" },
      { hanzi: "人", pinyin: "rén", syllable: "ren", tone: 2, meaning: "người" },
      { hanzi: "热", pinyin: "rè", syllable: "re", tone: 4, meaning: "nóng" },
    ],
    drillPairs: ["ret-z-zh-1", "ret-c-ch-1", "ret-s-sh-1"],
  },
  {
    id: 7,
    title: "Lesson 7: Front Nasal Finals (-n)",
    titleVi: "Bài 7: Vận Mẫu Mũi Trước (-n): an, en, in, un, ün",
    summaryVi: "Kỹ thuật khép âm bằng đầu lưỡi chạm răng trên và đẩy hơi qua đường mũi.",
    initials: [],
    finals: ["an", "en", "in", "un", "ün", "uan", "üan"],
    tonesCovered: [1, 2, 3, 4],
    mouthGuide: {
      title: "Kết thúc âm bằng cách đưa đầu lưỡi lên nướu răng trên",
      points: [
        "an: Mở miệng phát âm 'a', sau đó nhanh chóng nâng đầu lưỡi chạm chân răng trên kết thúc ở 'n'.",
        "en: Miệng nửa mở 'e' nhẹ, rồi áp đầu lưỡi đóng âm.",
        "in: Môi kéo dẹt 'i', đầu lưỡi khép lại nướu trên.",
        "un (uen) / ün: Bắt đầu tròn môi rồi trượt đầu lưỡi chặn lại.",
      ],
      commonMistakesVi: "Mở miệng quá to ở cuối âm khiến vần bị biến thành âm ng!",
    },
    keyVocabulary: [
      { hanzi: "安", pinyin: "ān", syllable: "an", tone: 1, meaning: "bình an" },
      { hanzi: "看", pinyin: "kàn", syllable: "kan", tone: 4, meaning: "nhìn, xem" },
      { hanzi: "门", pinyin: "mén", syllable: "men", tone: 2, meaning: "cửa" },
      { hanzi: "心", pinyin: "xīn", syllable: "xin", tone: 1, meaning: "trái tim" },
      { hanzi: "云", pinyin: "yún", syllable: "yun", tone: 2, meaning: "mây" },
    ],
    drillPairs: ["nas-an-ang-1", "nas-en-eng-1"],
  },
  {
    id: 8,
    title: "Lesson 8: Back Nasal Finals (-ng)",
    titleVi: "Bài 8: Vận Mẫu Mũi Sau (-ng): ang, eng, ing, ong",
    summaryVi: "Kỹ thuật mở rộng cuống họng, nâng cuống lưỡi lên ngạc mềm để tạo độ vang sâu.",
    initials: [],
    finals: ["ang", "eng", "ing", "ong", "iang", "uang", "iong"],
    tonesCovered: [1, 2, 3, 4],
    mouthGuide: {
      title: "Mở rộng họng và đóng âm bằng cuống lưỡi",
      points: [
        "ang: Miệng mở to hơn so với 'an', cuống lưỡi nâng lên chạm ngạc mềm, âm vang trong vòm họng.",
        "eng: Cuống lưỡi nâng lên ngạc mềm, âm phát ra từ sâu trong họng.",
        "ing: Lưỡi nâng cao, âm ngân vang như tiếng chuông đồng.",
        "ong: Môi tròn tự nhiên, ngạc mềm hạ nhẹ cho âm vang qua mũi sau.",
      ],
      commonMistakesVi: "Phát âm không đủ độ sâu của họng, nghe bị cạn như âm mũi trước.",
    },
    keyVocabulary: [
      { hanzi: "帮", pinyin: "bāng", syllable: "bang", tone: 1, meaning: "giúp đỡ" },
      { hanzi: "风", pinyin: "fēng", syllable: "feng", tone: 1, meaning: "gió" },
      { hanzi: "听", pinyin: "tīng", syllable: "ting", tone: 1, meaning: "nghe" },
      { hanzi: "红", pinyin: "hóng", syllable: "hong", tone: 2, meaning: "màu đỏ" },
    ],
    drillPairs: ["nas-in-ing-1", "nas-an-ang-1"],
  },
  {
    id: 9,
    title: "Lesson 9: Tone Sandhi Rules",
    titleVi: "Bài 9: Quy Tắc Biến Điệu Thanh Điệu Bắt Buộc",
    summaryVi: "Bí kíp biến điệu hai thanh 3 (3+3 -> 2+3), quy tắc biến đổi của chữ '一' (yī) và '不' (bù).",
    initials: [],
    finals: [],
    tonesCovered: [1, 2, 3, 4, 5],
    mouthGuide: {
      title: "3 Quy tắc biến điệu quan trọng nhất trong tiếng Trung",
      points: [
        "Quy tắc 1: 3 + 3 -> 2 + 3. Khi 2 thanh 3 đi liền nhau, từ đầu tự động đọc thành thanh 2 (nǐ hǎo -> ní hǎo).",
        "Quy tắc 2: Biến điệu của 不 (bù). Bình thường đọc thanh 4 (bù). Nhưng khi đứng trước một từ mang thanh 4, nó đổi thành thanh 2 (bú shì, bú duì).",
        "Quy tắc 3: Biến điệu của 一 (yī). Đứng riêng là thanh 1 (yī). Đứng trước thanh 1, 2, 3 đổi thành thanh 4 (yì tiān, yì nián). Đứng trước thanh 4 đổi thành thanh 2 (yí dìng).",
      ],
      commonMistakesVi: "Quên biến điệu khiến phát âm bị khựng, nghe nặng nề và mất tự nhiên!",
    },
    keyVocabulary: [
      { hanzi: "你好", pinyin: "nǐhǎo -> níhǎo", syllable: "ni", tone: 2, meaning: "xin chào" },
      { hanzi: "不是", pinyin: "búshì", syllable: "bu", tone: 2, meaning: "không phải" },
      { hanzi: "一天", pinyin: "yìtiān", syllable: "yi", tone: 4, meaning: "một ngày" },
      { hanzi: "一定", pinyin: "yídìng", syllable: "yi", tone: 2, meaning: "nhất định" },
    ],
    drillPairs: ["ret-s-sh-1", "asp-b-p-1"],
  },
  {
    id: 10,
    title: "Lesson 10: Mastering Minimal Pairs",
    titleVi: "Bài 10: Đại Chiến Các Cặp Âm Dễ Nhầm Nhất",
    summaryVi: "Tổng kết toàn diện toàn bộ các cặp âm kinh điển nhất: b/p, d/t, z/zh, c/ch, s/sh, j/q, an/ang.",
    initials: ["b", "p", "d", "t", "z", "zh", "c", "ch", "s", "sh", "j", "q", "x"],
    finals: ["an", "ang", "en", "eng", "in", "ing", "u", "ü"],
    tonesCovered: [1, 2, 3, 4],
    mouthGuide: {
      title: "Chiến thuật kiểm tra phản xạ đôi tai và miệng",
      points: [
        "Thử nghiệm tờ giấy: Đặt một mảnh giấy nhỏ trước môi. Khi phát âm p, t, k, c, ch, q thì giấy phải bay phần phật!",
        "Thử nghiệm gương: Soi gương kiểm tra độ chu môi khi phát âm ü so với u.",
        "Thử nghiệm âm vòm họng: Cảm nhận độ rung và độ sâu của vần mũi sau -ng so với -n.",
      ],
      commonMistakesVi: "Học thuộc lòng chữ viết pinyin nhưng không chú ý cảm giác luồng hơi của vòm miệng.",
    },
    keyVocabulary: [
      { hanzi: "四十四", pinyin: "sì shí sì", syllable: "si", tone: 4, meaning: "44 (bài ca luyện s/sh kinh điển)" },
      { hanzi: "知道", pinyin: "zhīdào", syllable: "zhi", tone: 1, meaning: "biết" },
      { hanzi: "迟到", pinyin: "chídào", syllable: "chi", tone: 2, meaning: "đến muộn" },
      { hanzi: "天气", pinyin: "tiānqì", syllable: "tian", tone: 1, meaning: "thời tiết" },
    ],
    drillPairs: [
      "asp-b-p-1", "asp-d-t-1", "ret-z-zh-1",
      "ret-c-ch-1", "ret-s-sh-1", "pal-j-q-1",
      "nas-an-ang-1", "rnd-u-uu-1"
    ],
  },
];
