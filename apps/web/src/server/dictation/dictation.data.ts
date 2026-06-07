import type { DictationCollectionSummary } from '@dictation/contracts';

export type DictationQuestion = {
  id: string;
  promptVi: string;
  hanzi: string;
  pinyin: string;
  segments: string[];
  targetSeconds: number;
};

export type DictationUnit = Omit<DictationCollectionSummary['units'][number], 'topic'> & {
  topic?: string;
  questions: DictationQuestion[];
};

export type DictationCollection = Omit<DictationCollectionSummary, 'units'> & {
  units: DictationUnit[];
};

export const dictationCollections: DictationCollection[] = [
  {
    id: 'hsk-1',
    title: 'HSK 1',
    description: 'Từ và câu ngắn cho người mới bắt đầu.',
    hskLevel: 1,
    coverImage: '/images/hsk1.webp',
    units: [
      {
        id: 'hsk-1-greetings',
        title: 'Chào hỏi',
        description: 'Tên, lời chào và những câu giao tiếp đầu tiên.',
        questionCount: 4,
        estimatedMinutes: 4,
        questions: [
          {
            id: 'hsk-1-greetings-1',
            promptVi: 'Xin chào',
            hanzi: '你好',
            pinyin: 'nǐ hǎo',
            segments: ['你', '好'],
            targetSeconds: 8,
          },
          {
            id: 'hsk-1-greetings-2',
            promptVi: 'Tôi tên là An Na.',
            hanzi: '我叫安娜。',
            pinyin: 'wǒ jiào ān nà',
            segments: ['我', '叫', '安娜', '。'],
            targetSeconds: 12,
          },
          {
            id: 'hsk-1-greetings-3',
            promptVi: 'Bạn là giáo viên phải không?',
            hanzi: '你是老师吗？',
            pinyin: 'nǐ shì lǎo shī ma',
            segments: ['你', '是', '老师', '吗', '？'],
            targetSeconds: 14,
          },
          {
            id: 'hsk-1-greetings-4',
            promptVi: 'Rất vui được gặp bạn.',
            hanzi: '很高兴认识你。',
            pinyin: 'hěn gāo xìng rèn shi nǐ',
            segments: ['很高兴', '认识', '你', '。'],
            targetSeconds: 16,
          },
        ],
      },
      {
        id: 'hsk-1-daily',
        title: 'Sinh hoạt hằng ngày',
        description: 'Ăn uống, trường học và thời tiết.',
        questionCount: 4,
        estimatedMinutes: 5,
        questions: [
          {
            id: 'hsk-1-daily-1',
            promptVi: 'Tôi uống nước.',
            hanzi: '我喝水。',
            pinyin: 'wǒ hē shuǐ',
            segments: ['我', '喝', '水', '。'],
            targetSeconds: 10,
          },
          {
            id: 'hsk-1-daily-2',
            promptVi: 'Anh ấy ăn cơm.',
            hanzi: '他吃米饭。',
            pinyin: 'tā chī mǐ fàn',
            segments: ['他', '吃', '米饭', '。'],
            targetSeconds: 12,
          },
          {
            id: 'hsk-1-daily-3',
            promptVi: 'Chúng tôi đi đến trường.',
            hanzi: '我们去学校。',
            pinyin: 'wǒ men qù xué xiào',
            segments: ['我们', '去', '学校', '。'],
            targetSeconds: 14,
          },
          {
            id: 'hsk-1-daily-4',
            promptVi: 'Hôm nay thời tiết rất đẹp.',
            hanzi: '今天天气很好。',
            pinyin: 'jīn tiān tiān qì hěn hǎo',
            segments: ['今天', '天气', '很', '好', '。'],
            targetSeconds: 16,
          },
        ],
      },
    ],
  },
  {
    id: 'hsk-2',
    title: 'HSK 2',
    description: 'Mở rộng phản xạ với lịch trình và gia đình.',
    hskLevel: 2,
    coverImage: '/images/hsk2.webp',
    units: [
      {
        id: 'hsk-2-time',
        title: 'Thời gian và lịch trình',
        description: 'Hỏi giờ, hẹn gặp và kế hoạch trong ngày.',
        questionCount: 4,
        estimatedMinutes: 5,
        questions: [
          {
            id: 'hsk-2-time-1',
            promptVi: 'Bây giờ là mấy giờ?',
            hanzi: '现在几点？',
            pinyin: 'xiàn zài jǐ diǎn',
            segments: ['现在', '几', '点', '？'],
            targetSeconds: 12,
          },
          {
            id: 'hsk-2-time-2',
            promptVi: 'Tôi tám giờ đi làm.',
            hanzi: '我八点去上班。',
            pinyin: 'wǒ bā diǎn qù shàng bān',
            segments: ['我', '八点', '去', '上班', '。'],
            targetSeconds: 16,
          },
          {
            id: 'hsk-2-time-3',
            promptVi: 'Ngày mai chúng ta gặp nhau nhé.',
            hanzi: '明天我们见面吧。',
            pinyin: 'míng tiān wǒ men jiàn miàn ba',
            segments: ['明天', '我们', '见面', '吧', '。'],
            targetSeconds: 17,
          },
          {
            id: 'hsk-2-time-4',
            promptVi: 'Buổi chiều tôi có thời gian.',
            hanzi: '下午我有时间。',
            pinyin: 'xià wǔ wǒ yǒu shí jiān',
            segments: ['下午', '我', '有', '时间', '。'],
            targetSeconds: 17,
          },
        ],
      },
      {
        id: 'hsk-2-family',
        title: 'Gia đình và nhà cửa',
        description: 'Miêu tả người thân và hoạt động ở nhà.',
        questionCount: 4,
        estimatedMinutes: 5,
        questions: [
          {
            id: 'hsk-2-family-1',
            promptVi: 'Nhà tôi có bốn người.',
            hanzi: '我家有四个人。',
            pinyin: 'wǒ jiā yǒu sì ge rén',
            segments: ['我家', '有', '四个', '人', '。'],
            targetSeconds: 16,
          },
          {
            id: 'hsk-2-family-2',
            promptVi: 'Chị gái tôi đang đọc sách.',
            hanzi: '我姐姐在看书。',
            pinyin: 'wǒ jiě jie zài kàn shū',
            segments: ['我姐姐', '在', '看书', '。'],
            targetSeconds: 16,
          },
          {
            id: 'hsk-2-family-3',
            promptVi: 'Bố tôi biết nấu món Trung Quốc.',
            hanzi: '我爸爸会做中国菜。',
            pinyin: 'wǒ bà ba huì zuò zhōng guó cài',
            segments: ['我爸爸', '会', '做', '中国菜', '。'],
            targetSeconds: 18,
          },
          {
            id: 'hsk-2-family-4',
            promptVi: 'Con mèo ở dưới bàn.',
            hanzi: '猫在桌子下面。',
            pinyin: 'māo zài zhuō zi xià mian',
            segments: ['猫', '在', '桌子', '下面', '。'],
            targetSeconds: 17,
          },
        ],
      },
    ],
  },
  {
    id: 'hsk-3',
    title: 'HSK 3',
    description: 'Câu dài hơn về học tập, công việc và trải nghiệm.',
    hskLevel: 3,
    coverImage: '/images/hsk3.webp',
    units: [
      {
        id: 'hsk-3-study',
        title: 'Học tập',
        description: 'Thói quen học, bài tập và mục tiêu tiếng Trung.',
        questionCount: 4,
        estimatedMinutes: 6,
        questions: [
          {
            id: 'hsk-3-study-1',
            promptVi: 'Tôi học tiếng Trung được hai năm rồi.',
            hanzi: '我学汉语两年了。',
            pinyin: 'wǒ xué hàn yǔ liǎng nián le',
            segments: ['我', '学汉语', '两年', '了', '。'],
            targetSeconds: 18,
          },
          {
            id: 'hsk-3-study-2',
            promptVi: 'Bài tập hôm nay không khó.',
            hanzi: '今天的作业不难。',
            pinyin: 'jīn tiān de zuò yè bù nán',
            segments: ['今天的', '作业', '不', '难', '。'],
            targetSeconds: 17,
          },
          {
            id: 'hsk-3-study-3',
            promptVi: 'Cô giáo bảo chúng tôi luyện tập nhiều hơn.',
            hanzi: '老师让我们多练习。',
            pinyin: 'lǎo shī ràng wǒ men duō liàn xí',
            segments: ['老师', '让', '我们', '多练习', '。'],
            targetSeconds: 20,
          },
          {
            id: 'hsk-3-study-4',
            promptVi: 'Tôi hy vọng có thể nghe hiểu tin tức.',
            hanzi: '我希望能听懂新闻。',
            pinyin: 'wǒ xī wàng néng tīng dǒng xīn wén',
            segments: ['我', '希望', '能', '听懂', '新闻', '。'],
            targetSeconds: 22,
          },
        ],
      },
      {
        id: 'hsk-3-travel',
        title: 'Đi lại và du lịch',
        description: 'Hỏi đường, phương tiện và trải nghiệm chuyến đi.',
        questionCount: 4,
        estimatedMinutes: 6,
        questions: [
          {
            id: 'hsk-3-travel-1',
            promptVi: 'Từ đây đến ga tàu điện ngầm rất gần.',
            hanzi: '从这里到地铁站很近。',
            pinyin: 'cóng zhè lǐ dào dì tiě zhàn hěn jìn',
            segments: ['从这里', '到', '地铁站', '很近', '。'],
            targetSeconds: 22,
          },
          {
            id: 'hsk-3-travel-2',
            promptVi: 'Chúng tôi quyết định đi bằng tàu hỏa.',
            hanzi: '我们决定坐火车去。',
            pinyin: 'wǒ men jué dìng zuò huǒ chē qù',
            segments: ['我们', '决定', '坐火车', '去', '。'],
            targetSeconds: 21,
          },
          {
            id: 'hsk-3-travel-3',
            promptVi: 'Trên đường có hơi kẹt xe.',
            hanzi: '路上有一点儿堵车。',
            pinyin: 'lù shang yǒu yì diǎnr dǔ chē',
            segments: ['路上', '有一点儿', '堵车', '。'],
            targetSeconds: 19,
          },
          {
            id: 'hsk-3-travel-4',
            promptVi: 'Khách sạn này vừa sạch vừa yên tĩnh.',
            hanzi: '这家酒店又干净又安静。',
            pinyin: 'zhè jiā jiǔ diàn yòu gān jìng yòu ān jìng',
            segments: ['这家酒店', '又', '干净', '又', '安静', '。'],
            targetSeconds: 24,
          },
        ],
      },
    ],
  },
  {
    id: 'hsk-4',
    title: 'HSK 4',
    description: 'Rèn phản xạ với tình huống và quan điểm rõ ràng.',
    hskLevel: 4,
    coverImage: '/images/HSK-4-Thuong.webp',
    units: [
      {
        id: 'hsk-4-work',
        title: 'Công việc',
        description: 'Kinh nghiệm, đồng nghiệp và cách giải quyết vấn đề.',
        questionCount: 4,
        estimatedMinutes: 7,
        questions: [
          {
            id: 'hsk-4-work-1',
            promptVi: 'Tôi đã quen với môi trường làm việc mới.',
            hanzi: '我已经习惯了新的工作环境。',
            pinyin: 'wǒ yǐ jīng xí guàn le xīn de gōng zuò huán jìng',
            segments: ['我', '已经', '习惯了', '新的', '工作环境', '。'],
            targetSeconds: 27,
          },
          {
            id: 'hsk-4-work-2',
            promptVi: 'Đồng nghiệp đã cho tôi rất nhiều lời khuyên.',
            hanzi: '同事给了我很多建议。',
            pinyin: 'tóng shì gěi le wǒ hěn duō jiàn yì',
            segments: ['同事', '给了', '我', '很多', '建议', '。'],
            targetSeconds: 24,
          },
          {
            id: 'hsk-4-work-3',
            promptVi: 'Chúng ta cần tìm một cách hiệu quả hơn.',
            hanzi: '我们需要找一个更有效的办法。',
            pinyin: 'wǒ men xū yào zhǎo yí ge gèng yǒu xiào de bàn fǎ',
            segments: ['我们', '需要', '找', '一个', '更有效的', '办法', '。'],
            targetSeconds: 28,
          },
          {
            id: 'hsk-4-work-4',
            promptVi: 'Chỉ cần chuẩn bị đầy đủ thì không cần lo lắng.',
            hanzi: '只要准备充分，就不用担心。',
            pinyin: 'zhǐ yào zhǔn bèi chōng fèn jiù bú yòng dān xīn',
            segments: ['只要', '准备充分', '，', '就', '不用担心', '。'],
            targetSeconds: 28,
          },
        ],
      },
      {
        id: 'hsk-4-life',
        title: 'Quan điểm sống',
        description: 'Thói quen tốt, thay đổi và cân bằng.',
        questionCount: 4,
        estimatedMinutes: 7,
        questions: [
          {
            id: 'hsk-4-life-1',
            promptVi: 'Kiên trì vận động có lợi cho sức khỏe.',
            hanzi: '坚持运动对健康有好处。',
            pinyin: 'jiān chí yùn dòng duì jiàn kāng yǒu hǎo chu',
            segments: ['坚持运动', '对', '健康', '有好处', '。'],
            targetSeconds: 25,
          },
          {
            id: 'hsk-4-life-2',
            promptVi: 'Tâm trạng của cô ấy dần dần tốt lên.',
            hanzi: '她的心情渐渐好起来了。',
            pinyin: 'tā de xīn qíng jiàn jiàn hǎo qǐ lái le',
            segments: ['她的', '心情', '渐渐', '好起来了', '。'],
            targetSeconds: 25,
          },
          {
            id: 'hsk-4-life-3',
            promptVi: 'Dù bận đến đâu tôi cũng sẽ gọi điện cho gia đình.',
            hanzi: '无论多忙，我都会给家人打电话。',
            pinyin: 'wú lùn duō máng wǒ dōu huì gěi jiā rén dǎ diàn huà',
            segments: [
              '无论',
              '多忙',
              '，',
              '我',
              '都会',
              '给家人',
              '打电话',
              '。',
            ],
            targetSeconds: 31,
          },
          {
            id: 'hsk-4-life-4',
            promptVi:
              'Một kế hoạch hợp lý có thể giúp chúng ta tiết kiệm thời gian.',
            hanzi: '合理的计划能帮我们节省时间。',
            pinyin: 'hé lǐ de jì huà néng bāng wǒ men jié shěng shí jiān',
            segments: ['合理的', '计划', '能', '帮我们', '节省', '时间', '。'],
            targetSeconds: 30,
          },
        ],
      },
    ],
  },
  {
    id: 'hsk-5',
    title: 'HSK 5',
    description: 'Luyện nghe chép các câu có lập luận và sắc thái.',
    hskLevel: 5,
    coverImage: '/images/HSK-5-Thuong.webp',
    units: [
      {
        id: 'hsk-5-communication',
        title: 'Giao tiếp hiệu quả',
        description: 'Cách biểu đạt, lắng nghe và tránh hiểu lầm.',
        questionCount: 4,
        estimatedMinutes: 8,
        questions: [
          {
            id: 'hsk-5-communication-1',
            promptVi:
              'Biểu đạt rõ ràng có thể giảm bớt những hiểu lầm không cần thiết.',
            hanzi: '清楚地表达可以减少不必要的误会。',
            pinyin: 'qīng chu de biǎo dá kě yǐ jiǎn shǎo bú bì yào de wù huì',
            segments: [
              '清楚地',
              '表达',
              '可以',
              '减少',
              '不必要的',
              '误会',
              '。',
            ],
            targetSeconds: 34,
          },
          {
            id: 'hsk-5-communication-2',
            promptVi:
              'Trước khi đưa ra kết luận, tốt nhất hãy nghe ý kiến của đối phương.',
            hanzi: '下结论之前，最好先听听对方的意见。',
            pinyin:
              'xià jié lùn zhī qián zuì hǎo xiān tīng ting duì fāng de yì jiàn',
            segments: [
              '下结论之前',
              '，',
              '最好',
              '先',
              '听听',
              '对方的',
              '意见',
              '。',
            ],
            targetSeconds: 36,
          },
          {
            id: 'hsk-5-communication-3',
            promptVi: 'Giọng điệu đôi khi quan trọng hơn bản thân nội dung.',
            hanzi: '说话的语气有时候比内容本身更重要。',
            pinyin:
              'shuō huà de yǔ qì yǒu shí hou bǐ nèi róng běn shēn gèng zhòng yào',
            segments: [
              '说话的',
              '语气',
              '有时候',
              '比',
              '内容本身',
              '更重要',
              '。',
            ],
            targetSeconds: 36,
          },
          {
            id: 'hsk-5-communication-4',
            promptVi: 'Biết lắng nghe là nền tảng để xây dựng lòng tin.',
            hanzi: '懂得倾听是建立信任的基础。',
            pinyin: 'dǒng de qīng tīng shì jiàn lì xìn rèn de jī chǔ',
            segments: ['懂得', '倾听', '是', '建立', '信任的', '基础', '。'],
            targetSeconds: 32,
          },
        ],
      },
      {
        id: 'hsk-5-growth',
        title: 'Trưởng thành',
        description: 'Lựa chọn, thất bại và quá trình phát triển bản thân.',
        questionCount: 4,
        estimatedMinutes: 8,
        questions: [
          {
            id: 'hsk-5-growth-1',
            promptVi:
              'Thất bại không đáng sợ, điều đáng sợ là mất đi dũng khí thử lại.',
            hanzi: '失败并不可怕，可怕的是失去再试一次的勇气。',
            pinyin:
              'shī bài bìng bù kě pà kě pà de shì shī qù zài shì yí cì de yǒng qì',
            segments: [
              '失败',
              '并不可怕',
              '，',
              '可怕的是',
              '失去',
              '再试一次的',
              '勇气',
              '。',
            ],
            targetSeconds: 40,
          },
          {
            id: 'hsk-5-growth-2',
            promptVi:
              'Kinh nghiệm thật sự thường đến từ quá trình giải quyết vấn đề.',
            hanzi: '真正的经验往往来自解决问题的过程。',
            pinyin:
              'zhēn zhèng de jīng yàn wǎng wǎng lái zì jiě jué wèn tí de guò chéng',
            segments: [
              '真正的',
              '经验',
              '往往',
              '来自',
              '解决问题的',
              '过程',
              '。',
            ],
            targetSeconds: 37,
          },
          {
            id: 'hsk-5-growth-3',
            promptVi: 'Mỗi lựa chọn đều có thể mang đến một khả năng mới.',
            hanzi: '每一个选择都可能带来新的可能。',
            pinyin: 'měi yí ge xuǎn zé dōu kě néng dài lái xīn de kě néng',
            segments: [
              '每一个',
              '选择',
              '都',
              '可能',
              '带来',
              '新的',
              '可能',
              '。',
            ],
            targetSeconds: 34,
          },
          {
            id: 'hsk-5-growth-4',
            promptVi: 'Chỉ khi hiểu điểm yếu của mình, ta mới có thể tiến bộ.',
            hanzi: '只有了解自己的不足，才能不断进步。',
            pinyin: 'zhǐ yǒu liǎo jiě zì jǐ de bù zú cái néng bú duàn jìn bù',
            segments: [
              '只有',
              '了解',
              '自己的',
              '不足',
              '，',
              '才能',
              '不断进步',
              '。',
            ],
            targetSeconds: 36,
          },
        ],
      },
    ],
  },
  {
    id: 'hsk-6',
    title: 'HSK 6',
    description: 'Câu phức để luyện độ chính xác và tốc độ phản xạ.',
    hskLevel: 6,
    coverImage: '/images/HSK-6-Thuong.webp',
    units: [
      {
        id: 'hsk-6-society',
        title: 'Xã hội và công nghệ',
        description: 'Tác động của công nghệ và cách nhìn đa chiều.',
        questionCount: 4,
        estimatedMinutes: 9,
        questions: [
          {
            id: 'hsk-6-society-1',
            promptVi:
              'Sự phát triển của công nghệ đã thay đổi sâu sắc cách con người giao tiếp.',
            hanzi: '科技的发展深刻地改变了人们的交流方式。',
            pinyin:
              'kē jì de fā zhǎn shēn kè de gǎi biàn le rén men de jiāo liú fāng shì',
            segments: [
              '科技的',
              '发展',
              '深刻地',
              '改变了',
              '人们的',
              '交流方式',
              '。',
            ],
            targetSeconds: 40,
          },
          {
            id: 'hsk-6-society-2',
            promptVi:
              'Khi đối mặt với lượng thông tin khổng lồ, khả năng phán đoán đặc biệt quan trọng.',
            hanzi: '面对海量信息，独立判断的能力显得格外重要。',
            pinyin:
              'miàn duì hǎi liàng xìn xī dú lì pàn duàn de néng lì xiǎn de gé wài zhòng yào',
            segments: [
              '面对',
              '海量信息',
              '，',
              '独立判断的',
              '能力',
              '显得',
              '格外重要',
              '。',
            ],
            targetSeconds: 43,
          },
          {
            id: 'hsk-6-society-3',
            promptVi:
              'Bất kỳ chính sách nào cũng cần cân nhắc lợi ích lâu dài.',
            hanzi: '任何政策都需要兼顾长远利益。',
            pinyin: 'rèn hé zhèng cè dōu xū yào jiān gù cháng yuǎn lì yì',
            segments: ['任何', '政策', '都', '需要', '兼顾', '长远利益', '。'],
            targetSeconds: 35,
          },
          {
            id: 'hsk-6-society-4',
            promptVi:
              'Sự khác biệt về quan điểm không nhất thiết dẫn đến xung đột.',
            hanzi: '观点上的差异未必会导致冲突。',
            pinyin: 'guān diǎn shàng de chā yì wèi bì huì dǎo zhì chōng tū',
            segments: ['观点上的', '差异', '未必', '会', '导致', '冲突', '。'],
            targetSeconds: 36,
          },
        ],
      },
      {
        id: 'hsk-6-thinking',
        title: 'Tư duy và lựa chọn',
        description: 'Phân tích nguyên nhân, cân bằng và ra quyết định.',
        questionCount: 4,
        estimatedMinutes: 9,
        questions: [
          {
            id: 'hsk-6-thinking-1',
            promptVi:
              'Hiện tượng tưởng như ngẫu nhiên này thực ra có nguyên nhân sâu xa.',
            hanzi: '这个看似偶然的现象，其实有着深层原因。',
            pinyin:
              'zhè ge kàn sì ǒu rán de xiàn xiàng qí shí yǒu zhe shēn céng yuán yīn',
            segments: [
              '这个',
              '看似偶然的',
              '现象',
              '，',
              '其实',
              '有着',
              '深层原因',
              '。',
            ],
            targetSeconds: 40,
          },
          {
            id: 'hsk-6-thinking-2',
            promptVi:
              'Năng lực thật sự không chỉ thể hiện ở kết quả mà còn ở cách xử lý quá trình.',
            hanzi: '真正的能力不仅体现在结果上，也体现在处理过程的方式上。',
            pinyin:
              'zhēn zhèng de néng lì bù jǐn tǐ xiàn zài jié guǒ shàng yě tǐ xiàn zài chǔ lǐ guò chéng de fāng shì shàng',
            segments: [
              '真正的',
              '能力',
              '不仅',
              '体现在',
              '结果上',
              '，',
              '也',
              '体现在',
              '处理过程的',
              '方式上',
              '。',
            ],
            targetSeconds: 48,
          },
          {
            id: 'hsk-6-thinking-3',
            promptVi:
              'Một quyết định lý trí cần đồng thời xem xét thực tế và hậu quả.',
            hanzi: '理性的决定需要同时考虑现实条件和可能的后果。',
            pinyin:
              'lǐ xìng de jué dìng xū yào tóng shí kǎo lǜ xiàn shí tiáo jiàn hé kě néng de hòu guǒ',
            segments: [
              '理性的',
              '决定',
              '需要',
              '同时考虑',
              '现实条件',
              '和',
              '可能的',
              '后果',
              '。',
            ],
            targetSeconds: 44,
          },
          {
            id: 'hsk-6-thinking-4',
            promptVi:
              'Càng hiểu tính phức tạp của vấn đề, chúng ta càng thận trọng khi đưa ra kết luận.',
            hanzi: '越了解问题的复杂性，我们下结论时就越谨慎。',
            pinyin:
              'yuè liǎo jiě wèn tí de fù zá xìng wǒ men xià jié lùn shí jiù yuè jǐn shèn',
            segments: [
              '越',
              '了解',
              '问题的',
              '复杂性',
              '，',
              '我们',
              '下结论时',
              '就',
              '越谨慎',
              '。',
            ],
            targetSeconds: 43,
          },
        ],
      },
    ],
  },
];

type QuestionSeed = [
  promptVi: string,
  hanzi: string,
  pinyin: string,
  segments: string[],
  targetSeconds: number,
];

function createSupplementalUnit(
  collectionId: string,
  slug: string,
  title: string,
  description: string,
  topic: string,
  estimatedMinutes: number,
  seeds: QuestionSeed[],
): DictationUnit {
  return {
    id: `${collectionId}-${slug}`,
    title,
    description,
    topic,
    estimatedMinutes,
    questionCount: seeds.length,
    questions: seeds.map(
      ([promptVi, hanzi, pinyin, segments, targetSeconds], index) => ({
        id: `${collectionId}-${slug}-${index + 1}`,
        promptVi,
        hanzi,
        pinyin,
        segments,
        targetSeconds,
      }),
    ),
  };
}

const supplementalUnits: Record<string, DictationUnit[]> = {
  'hsk-1': [
    createSupplementalUnit(
      'hsk-1',
      'food',
      'Ăn uống cơ bản',
      'Gọi món, nói sở thích và những đồ ăn quen thuộc.',
      'Ăn uống',
      5,
      [
        ['Tôi muốn uống trà.', '我想喝茶。', 'wǒ xiǎng hē chá', ['我', '想', '喝茶', '。'], 12],
        ['Bạn có thích ăn mì không?', '你喜欢吃面条吗？', 'nǐ xǐ huan chī miàn tiáo ma', ['你', '喜欢', '吃', '面条', '吗', '？'], 15],
        ['Một cốc cà phê bao nhiêu tiền?', '一杯咖啡多少钱？', 'yì bēi kā fēi duō shao qián', ['一杯', '咖啡', '多少', '钱', '？'], 16],
        ['Món này rất ngon.', '这个菜很好吃。', 'zhè ge cài hěn hǎo chī', ['这个菜', '很', '好吃', '。'], 14],
      ],
    ),
    createSupplementalUnit(
      'hsk-1',
      'shopping',
      'Mua sắm',
      'Màu sắc, số lượng và những câu hỏi khi mua đồ.',
      'Mua sắm',
      5,
      [
        ['Tôi muốn mua một quyển sách.', '我想买一本书。', 'wǒ xiǎng mǎi yì běn shū', ['我', '想买', '一本', '书', '。'], 15],
        ['Cái áo này màu đỏ.', '这件衣服是红色的。', 'zhè jiàn yī fu shì hóng sè de', ['这件', '衣服', '是', '红色的', '。'], 17],
        ['Tôi không có nhiều tiền.', '我没有很多钱。', 'wǒ méi yǒu hěn duō qián', ['我', '没有', '很多', '钱', '。'], 15],
        ['Cái kia quá lớn.', '那个太大了。', 'nà ge tài dà le', ['那个', '太', '大', '了', '。'], 13],
      ],
    ),
  ],
  'hsk-2': [
    createSupplementalUnit(
      'hsk-2',
      'health',
      'Sức khỏe',
      'Mô tả cơ thể, cảm giác và lời khuyên đơn giản.',
      'Sức khỏe',
      6,
      [
        ['Hôm nay tôi hơi mệt.', '我今天有点儿累。', 'wǒ jīn tiān yǒu diǎnr lèi', ['我', '今天', '有点儿', '累', '。'], 17],
        ['Bạn nên uống nhiều nước.', '你应该多喝水。', 'nǐ yīng gāi duō hē shuǐ', ['你', '应该', '多', '喝水', '。'], 17],
        ['Đầu của anh ấy rất đau.', '他的头很疼。', 'tā de tóu hěn téng', ['他的', '头', '很', '疼', '。'], 15],
        ['Sau khi nghỉ ngơi tôi khỏe hơn rồi.', '休息以后我好多了。', 'xiū xi yǐ hòu wǒ hǎo duō le', ['休息以后', '我', '好多了', '。'], 19],
      ],
    ),
    createSupplementalUnit(
      'hsk-2',
      'city',
      'Trong thành phố',
      'Địa điểm, phương hướng và các việc thường làm ngoài phố.',
      'Đi lại',
      6,
      [
        ['Ngân hàng ở bên trái siêu thị.', '银行在超市左边。', 'yín háng zài chāo shì zuǒ bian', ['银行', '在', '超市', '左边', '。'], 18],
        ['Chúng ta đi xe buýt nhé.', '我们坐公共汽车吧。', 'wǒ men zuò gōng gòng qì chē ba', ['我们', '坐', '公共汽车', '吧', '。'], 19],
        ['Phía trước có một bệnh viện.', '前面有一家医院。', 'qián mian yǒu yì jiā yī yuàn', ['前面', '有', '一家', '医院', '。'], 18],
        ['Từ đây đi bộ mất mười phút.', '从这里走路要十分钟。', 'cóng zhè lǐ zǒu lù yào shí fēn zhōng', ['从这里', '走路', '要', '十分钟', '。'], 21],
      ],
    ),
  ],
  'hsk-3': [
    createSupplementalUnit(
      'hsk-3',
      'restaurant',
      'Nhà hàng và dịch vụ',
      'Đặt bàn, gọi món và xử lý những tình huống thường gặp.',
      'Ăn uống',
      7,
      [
        ['Tôi đã đặt một bàn cạnh cửa sổ.', '我订了一个靠窗的位子。', 'wǒ dìng le yí ge kào chuāng de wèi zi', ['我', '订了', '一个', '靠窗的', '位子', '。'], 23],
        ['Xin đừng cho quá nhiều ớt.', '请不要放太多辣椒。', 'qǐng bú yào fàng tài duō là jiāo', ['请', '不要', '放', '太多', '辣椒', '。'], 21],
        ['Phục vụ ở đây rất nhiệt tình.', '这里的服务很热情。', 'zhè lǐ de fú wù hěn rè qíng', ['这里的', '服务', '很', '热情', '。'], 21],
        ['Chúng tôi muốn thanh toán riêng.', '我们想分开结账。', 'wǒ men xiǎng fēn kāi jié zhàng', ['我们', '想', '分开', '结账', '。'], 20],
      ],
    ),
    createSupplementalUnit(
      'hsk-3',
      'hobbies',
      'Sở thích và cuối tuần',
      'Kể về hoạt động giải trí, thể thao và kế hoạch cá nhân.',
      'Đời sống',
      7,
      [
        ['Cuối tuần tôi thường đi leo núi.', '周末我常常去爬山。', 'zhōu mò wǒ cháng cháng qù pá shān', ['周末', '我', '常常', '去', '爬山', '。'], 21],
        ['Ngoài âm nhạc, cô ấy còn thích chụp ảnh.', '除了音乐，她还喜欢摄影。', 'chú le yīn yuè tā hái xǐ huan shè yǐng', ['除了', '音乐', '，', '她', '还', '喜欢', '摄影', '。'], 24],
        ['Chơi thể thao giúp tôi thư giãn.', '运动能让我放松。', 'yùn dòng néng ràng wǒ fàng sōng', ['运动', '能', '让', '我', '放松', '。'], 20],
        ['Bộ phim tối qua thú vị hơn tôi tưởng.', '昨晚的电影比我想的有意思。', 'zuó wǎn de diàn yǐng bǐ wǒ xiǎng de yǒu yì si', ['昨晚的', '电影', '比', '我想的', '有意思', '。'], 25],
      ],
    ),
  ],
  'hsk-4': [
    createSupplementalUnit(
      'hsk-4',
      'business',
      'Giao tiếp công sở',
      'Cuộc họp, tiến độ và trao đổi chuyên nghiệp.',
      'Công việc',
      8,
      [
        ['Cuộc họp được dời sang ba giờ chiều.', '会议改到下午三点举行。', 'huì yì gǎi dào xià wǔ sān diǎn jǔ xíng', ['会议', '改到', '下午三点', '举行', '。'], 27],
        ['Xin hãy gửi tài liệu cho tôi trước thứ Sáu.', '请在星期五以前把资料发给我。', 'qǐng zài xīng qī wǔ yǐ qián bǎ zī liào fā gěi wǒ', ['请', '在星期五以前', '把', '资料', '发给我', '。'], 30],
        ['Dự án hiện đang tiến triển thuận lợi.', '项目目前进展得很顺利。', 'xiàng mù mù qián jìn zhǎn de hěn shùn lì', ['项目', '目前', '进展得', '很顺利', '。'], 27],
        ['Chúng ta cần xác nhận nhu cầu của khách hàng.', '我们需要确认客户的需求。', 'wǒ men xū yào què rèn kè hù de xū qiú', ['我们', '需要', '确认', '客户的', '需求', '。'], 27],
      ],
    ),
    createSupplementalUnit(
      'hsk-4',
      'culture',
      'Văn hóa và phong tục',
      'So sánh tập quán, lễ hội và cách ứng xử.',
      'Văn hóa',
      8,
      [
        ['Mỗi nơi đều có phong tục riêng.', '每个地方都有自己的风俗。', 'měi ge dì fang dōu yǒu zì jǐ de fēng sú', ['每个地方', '都', '有', '自己的', '风俗', '。'], 27],
        ['Tết Xuân là lễ hội quan trọng nhất ở Trung Quốc.', '春节是中国最重要的节日。', 'chūn jié shì zhōng guó zuì zhòng yào de jié rì', ['春节', '是', '中国', '最重要的', '节日', '。'], 28],
        ['Hiểu văn hóa giúp giảm những hiểu lầm.', '了解文化有助于减少误会。', 'liǎo jiě wén huà yǒu zhù yú jiǎn shǎo wù huì', ['了解文化', '有助于', '减少', '误会', '。'], 27],
        ['Khi làm khách, phép lịch sự rất quan trọng.', '做客时，礼貌非常重要。', 'zuò kè shí lǐ mào fēi cháng zhòng yào', ['做客时', '，', '礼貌', '非常', '重要', '。'], 26],
      ],
    ),
  ],
  'hsk-5': [
    createSupplementalUnit(
      'hsk-5',
      'technology',
      'Công nghệ và truyền thông',
      'Thảo luận tác động của công nghệ và thói quen số.',
      'Công nghệ',
      9,
      [
        ['Công nghệ đã thay đổi cách mọi người tiếp nhận thông tin.', '科技改变了人们获取信息的方式。', 'kē jì gǎi biàn le rén men huò qǔ xìn xī de fāng shì', ['科技', '改变了', '人们', '获取信息的', '方式', '。'], 34],
        ['Chúng ta cần học cách phân biệt thông tin đáng tin cậy.', '我们需要学会判断信息是否可靠。', 'wǒ men xū yào xué huì pàn duàn xìn xī shì fǒu kě kào', ['我们', '需要', '学会', '判断', '信息', '是否可靠', '。'], 35],
        ['Dùng điện thoại quá lâu có thể ảnh hưởng đến sự tập trung.', '长时间使用手机可能会影响注意力。', 'cháng shí jiān shǐ yòng shǒu jī kě néng huì yǐng xiǎng zhù yì lì', ['长时间', '使用手机', '可能会', '影响', '注意力', '。'], 36],
        ['Dịch vụ trực tuyến làm nhiều việc trở nên thuận tiện hơn.', '在线服务让很多事情变得更加方便。', 'zài xiàn fú wù ràng hěn duō shì qing biàn de gèng jiā fāng biàn', ['在线服务', '让', '很多事情', '变得', '更加方便', '。'], 35],
      ],
    ),
    createSupplementalUnit(
      'hsk-5',
      'environment',
      'Môi trường và đô thị',
      'Phân tích lối sống xanh và những thay đổi của thành phố.',
      'Xã hội',
      9,
      [
        ['Giao thông công cộng tốt có thể giảm ùn tắc.', '完善的公共交通可以减少拥堵。', 'wán shàn de gōng gòng jiāo tōng kě yǐ jiǎn shǎo yōng dǔ', ['完善的', '公共交通', '可以', '减少', '拥堵', '。'], 34],
        ['Bảo vệ môi trường cần bắt đầu từ thói quen hằng ngày.', '保护环境需要从日常习惯做起。', 'bǎo hù huán jìng xū yào cóng rì cháng xí guàn zuò qǐ', ['保护环境', '需要', '从', '日常习惯', '做起', '。'], 35],
        ['Ngày càng nhiều người lựa chọn giảm đồ dùng một lần.', '越来越多的人选择减少使用一次性用品。', 'yuè lái yuè duō de rén xuǎn zé jiǎn shǎo shǐ yòng yí cì xìng yòng pǐn', ['越来越多的人', '选择', '减少使用', '一次性用品', '。'], 38],
        ['Phát triển đô thị cũng cần giữ lại không gian xanh.', '城市发展也应该保留足够的绿色空间。', 'chéng shì fā zhǎn yě yīng gāi bǎo liú zú gòu de lǜ sè kōng jiān', ['城市发展', '也应该', '保留', '足够的', '绿色空间', '。'], 37],
      ],
    ),
  ],
  'hsk-6': [
    createSupplementalUnit(
      'hsk-6',
      'economy',
      'Kinh tế và thị trường',
      'Lập luận về lựa chọn tiêu dùng, doanh nghiệp và biến động.',
      'Kinh tế',
      10,
      [
        ['Biến động thị trường thường phản ánh kỳ vọng của nhiều bên.', '市场波动往往反映了各方的预期。', 'shì chǎng bō dòng wǎng wǎng fǎn yìng le gè fāng de yù qī', ['市场波动', '往往', '反映了', '各方的', '预期', '。'], 39],
        ['Doanh nghiệp muốn phát triển lâu dài thì không thể chỉ theo đuổi lợi nhuận ngắn hạn.', '企业要长期发展，就不能只追求短期利润。', 'qǐ yè yào cháng qī fā zhǎn jiù bù néng zhǐ zhuī qiú duǎn qī lì rùn', ['企业', '要长期发展', '，', '就不能', '只追求', '短期利润', '。'], 43],
        ['Hành vi tiêu dùng chịu ảnh hưởng đồng thời của thu nhập và quan niệm.', '消费行为同时受到收入和观念的影响。', 'xiāo fèi xíng wéi tóng shí shòu dào shōu rù hé guān niàn de yǐng xiǎng', ['消费行为', '同时', '受到', '收入', '和', '观念的', '影响', '。'], 42],
        ['Đổi mới chỉ tạo ra giá trị khi giải quyết được nhu cầu thực tế.', '创新只有解决实际需求，才能创造价值。', 'chuàng xīn zhǐ yǒu jiě jué shí jì xū qiú cái néng chuàng zào jià zhí', ['创新', '只有', '解决', '实际需求', '，', '才能', '创造价值', '。'], 42],
      ],
    ),
    createSupplementalUnit(
      'hsk-6',
      'academic',
      'Lập luận học thuật',
      'Tóm tắt quan điểm, đánh giá bằng chứng và trình bày kết luận.',
      'Học thuật',
      10,
      [
        ['Một kết luận thuyết phục phải được xây dựng trên bằng chứng đầy đủ.', '有说服力的结论必须建立在充分的证据之上。', 'yǒu shuō fú lì de jié lùn bì xū jiàn lì zài chōng fèn de zhèng jù zhī shàng', ['有说服力的', '结论', '必须', '建立在', '充分的', '证据之上', '。'], 45],
        ['Mối tương quan không có nghĩa là giữa hai yếu tố chắc chắn có quan hệ nhân quả.', '相关性并不意味着两个因素之间必然存在因果关系。', 'xiāng guān xìng bìng bù yì wèi zhe liǎng ge yīn sù zhī jiān bì rán cún zài yīn guǒ guān xì', ['相关性', '并不意味着', '两个因素之间', '必然存在', '因果关系', '。'], 49],
        ['Khi đánh giá một lý thuyết, cần đồng thời xem xét phạm vi áp dụng của nó.', '评价一种理论时，还需要考虑它的适用范围。', 'píng jià yì zhǒng lǐ lùn shí hái xū yào kǎo lǜ tā de shì yòng fàn wéi', ['评价', '一种理论时', '，', '还需要', '考虑', '它的', '适用范围', '。'], 45],
        ['Quan điểm khác nhau có thể giúp chúng ta nhìn thấy những giả định vốn bị bỏ qua.', '不同的观点能帮助我们发现原本被忽视的假设。', 'bù tóng de guān diǎn néng bāng zhù wǒ men fā xiàn yuán běn bèi hū shì de jiǎ shè', ['不同的', '观点', '能帮助', '我们', '发现', '原本被忽视的', '假设', '。'], 46],
      ],
    ),
  ],
};

for (const collection of dictationCollections) {
  collection.units.push(...(supplementalUnits[collection.id] ?? []));
}

export function findDictationCollection(collectionId: string) {
  return dictationCollections.find(
    (collection) => collection.id === collectionId,
  );
}

export function findDictationUnit(collectionId: string, unitId: string) {
  return findDictationCollection(collectionId)?.units.find(
    (unit) => unit.id === unitId,
  );
}

export function findDictationQuestion(questionId: string) {
  for (const collection of dictationCollections) {
    for (const unit of collection.units) {
      const question = unit.questions.find(
        (candidate) => candidate.id === questionId,
      );

      if (question) {
        return question;
      }
    }
  }

  return undefined;
}
