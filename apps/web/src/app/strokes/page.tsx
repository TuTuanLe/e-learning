import Link from "next/link";
import {
  BookOpenText,
  Brush,
  CheckCircle2,
  ExternalLink,
  PenLine,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { HanziSingleStrokePlayer } from "@/components/hanzi-single-stroke-player";

type StrokeDefinition = {
  id: string;
  name: string;
  chineseName: string;
  pinyin: string;
  glyph: string;
  direction: string;
  note: string;
  renderCharacter: string;
  renderStrokeIndex: number;
  examples: Array<{ hanzi: string; pinyin: string; meaning: string }>;
};

const BASIC_STROKES: StrokeDefinition[] = [
  {
    id: "heng",
    name: "Nét ngang",
    chineseName: "横",
    pinyin: "héng",
    glyph: "一",
    direction: "Trái sang phải",
    note: "Giữ nét chắc và hơi dừng nhẹ ở cuối nét.",
    renderCharacter: "一",
    renderStrokeIndex: 0,
    examples: [
      { hanzi: "二", pinyin: "èr", meaning: "số hai" },
      { hanzi: "王", pinyin: "wáng", meaning: "vua" },
      { hanzi: "工", pinyin: "gōng", meaning: "công việc" },
    ],
  },
  {
    id: "shu",
    name: "Nét sổ",
    chineseName: "竖",
    pinyin: "shù",
    glyph: "丨",
    direction: "Trên xuống dưới",
    note: "Kéo thẳng xuống, thân nét đứng và đều.",
    renderCharacter: "十",
    renderStrokeIndex: 1,
    examples: [
      { hanzi: "十", pinyin: "shí", meaning: "số mười" },
      { hanzi: "中", pinyin: "zhōng", meaning: "giữa" },
      { hanzi: "丰", pinyin: "fēng", meaning: "phong phú" },
    ],
  },
  {
    id: "dian",
    name: "Nét chấm",
    chineseName: "点",
    pinyin: "diǎn",
    glyph: "丶",
    direction: "Chấm xuống",
    note: "Đặt bút ngắn, dứt khoát, không kéo quá dài.",
    renderCharacter: "六",
    renderStrokeIndex: 0,
    examples: [
      { hanzi: "六", pinyin: "liù", meaning: "số sáu" },
      { hanzi: "文", pinyin: "wén", meaning: "văn" },
      { hanzi: "主", pinyin: "zhǔ", meaning: "chủ" },
    ],
  },
  {
    id: "ti",
    name: "Nét hất",
    chineseName: "提",
    pinyin: "tí",
    glyph: "㇀",
    direction: "Dưới trái lên phải",
    note: "Cuối nét hất lên gọn, không cong quá nhiều.",
    renderCharacter: "冰",
    renderStrokeIndex: 1,
    examples: [
      { hanzi: "冰", pinyin: "bīng", meaning: "băng" },
      { hanzi: "湖", pinyin: "hú", meaning: "hồ" },
      { hanzi: "冷", pinyin: "lěng", meaning: "lạnh" },
    ],
  },
  {
    id: "pie",
    name: "Nét phẩy",
    chineseName: "撇",
    pinyin: "piě",
    glyph: "丿",
    direction: "Phải trên xuống trái",
    note: "Bắt đầu nặng hơn, thả nhẹ về cuối nét.",
    renderCharacter: "八",
    renderStrokeIndex: 0,
    examples: [
      { hanzi: "八", pinyin: "bā", meaning: "số tám" },
      { hanzi: "人", pinyin: "rén", meaning: "người" },
      { hanzi: "行", pinyin: "xíng", meaning: "đi, được" },
    ],
  },
  {
    id: "na",
    name: "Nét mác",
    chineseName: "捺",
    pinyin: "nà",
    glyph: "㇏",
    direction: "Trái trên xuống phải",
    note: "Đi xuống chếch phải và mở rộng nhẹ ở cuối nét.",
    renderCharacter: "大",
    renderStrokeIndex: 2,
    examples: [
      { hanzi: "入", pinyin: "rù", meaning: "vào" },
      { hanzi: "大", pinyin: "dà", meaning: "lớn" },
      { hanzi: "夫", pinyin: "fū", meaning: "chồng" },
    ],
  },
  {
    id: "zhe",
    name: "Nét sổ gập",
    chineseName: "折",
    pinyin: "zhé",
    glyph: "𠃍",
    direction: "Ngang rồi gập xuống",
    note: "Đến góc thì đổi hướng rõ ràng, không bo tròn quá mềm.",
    renderCharacter: "口",
    renderStrokeIndex: 1,
    examples: [
      { hanzi: "口", pinyin: "kǒu", meaning: "miệng" },
      { hanzi: "国", pinyin: "guó", meaning: "quốc gia" },
      { hanzi: "见", pinyin: "jiàn", meaning: "gặp" },
    ],
  },
  {
    id: "gou",
    name: "Nét sổ móc",
    chineseName: "钩",
    pinyin: "gōu",
    glyph: "亅",
    direction: "Sổ xuống rồi móc",
    note: "Móc ở cuối nét cần ngắn, sắc và có điểm dừng.",
    renderCharacter: "小",
    renderStrokeIndex: 0,
    examples: [
      { hanzi: "小", pinyin: "xiǎo", meaning: "nhỏ" },
      { hanzi: "水", pinyin: "shuǐ", meaning: "nước" },
      { hanzi: "寸", pinyin: "cùn", meaning: "tấc" },
    ],
  },
];

const WRITING_RULES = [
  "Ngang trước, sổ sau.",
  "Phẩy trước, mác sau.",
  "Viết từ trên xuống dưới.",
  "Viết từ trái sang phải.",
  "Ngoài trước, trong sau.",
  "Vào trước, đóng sau.",
  "Giữa trước, hai bên sau.",
  "Nét bao quanh ở đáy viết sau cùng.",
  "Các nét chấm nhỏ thường viết sau cùng.",
];

const DERIVED_STROKES = [
  "Ngang gập",
  "Ngang phẩy",
  "Phẩy chấm",
  "Nghiêng móc",
  "Sổ cong móc",
  "Nằm móc",
];

export default function StrokesPage() {
  return (
    <main className="min-h-screen bg-canvas-soft">
      <AppHeader />

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-5 border-b border-hairline pb-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-primary">
              <Brush className="size-4" />
              Luyện viết chữ Hán
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-[-1.2px] text-ink sm:text-5xl">
              Các nét cơ bản trong tiếng Trung
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-ink-muted">
              Học 8 nét nền tảng trước khi viết chữ Hán: xem tên nét, hướng
              đi bút và ví dụ thường gặp trong cùng một màn hình.
            </p>
          </div>

          <div className="notion-shadow rounded-2xl border border-hairline bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-primary">
                <BookOpenText className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-ink">Gợi ý luyện tập</p>
                <p className="mt-1 text-sm leading-6 text-ink-muted">
                  Đọc tên nét, nhìn hướng mũi tên, rồi tập viết trong ô vuông
                  theo đúng thứ tự.
                </p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {BASIC_STROKES.map((stroke) => (
            <StrokeCard key={stroke.id} stroke={stroke} />
          ))}
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_420px]">
          <div className="notion-shadow rounded-2xl border border-hairline bg-white p-5">
            <div className="flex items-center gap-2">
              <PenLine className="size-5 text-primary" />
              <h2 className="text-xl font-bold tracking-[-0.4px] text-ink">
                Quy tắc viết nhanh cần nhớ
              </h2>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {WRITING_RULES.map((rule, index) => (
                <div
                  key={rule}
                  className="flex items-start gap-3 rounded-xl bg-canvas-soft p-3"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-primary">
                    {index + 1}
                  </span>
                  <p className="text-sm font-medium leading-6 text-ink-secondary">
                    {rule}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="notion-shadow rounded-2xl border border-hairline bg-white p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary" />
              <h2 className="text-xl font-bold tracking-[-0.4px] text-ink">
                Nét phát sinh thường gặp
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-ink-muted">
              Sau khi nắm 8 nét chính, bạn sẽ gặp nhiều biến thể được ghép từ
              các nét này.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {DERIVED_STROKES.map((stroke) => (
                <span
                  key={stroke}
                  className="rounded-full border border-hairline bg-canvas-soft px-3 py-1.5 text-sm font-semibold text-ink-secondary"
                >
                  {stroke}
                </span>
              ))}
            </div>
            <Link
              className="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-primary hover:underline"
              href="https://gcecenter.com/cac-net-co-ban-trong-tieng-trung-va-9-quy-tac-viet/"
              target="_blank"
              rel="noreferrer"
            >
              Nguồn tham khảo
              <ExternalLink className="size-4" />
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}

function StrokeCard({ stroke }: { stroke: StrokeDefinition }) {
  return (
    <article className="notion-shadow group overflow-hidden rounded-2xl border border-hairline bg-white">
      <div className="border-b border-hairline bg-canvas-soft p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black tracking-[-0.5px] text-ink">
              {stroke.name}
            </h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-ink-secondary">
            {stroke.chineseName}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="rounded-2xl border border-hairline bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-3 px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Nét mẫu
            </p>
            <span className="text-sm font-bold text-primary">
              {stroke.glyph} · {stroke.pinyin}
            </span>
          </div>
          <HanziSingleStrokePlayer
            character={stroke.renderCharacter}
            strokeIndex={stroke.renderStrokeIndex}
            label={stroke.name}
          />
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-3">
          <span className="text-5xl font-black text-ink">{stroke.glyph}</span>
          <span className="text-right text-sm font-bold text-primary">
            {stroke.pinyin}
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold text-ink-secondary">
          {stroke.direction}
        </p>
        <p className="mt-1 min-h-12 text-sm leading-6 text-ink-muted">
          {stroke.note}
        </p>

        <div className="mt-4 grid gap-2">
          {stroke.examples.map((example) => (
            <div
              key={`${stroke.id}-${example.hanzi}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-canvas-soft px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-ink">
                  {example.hanzi}
                </span>
                <div>
                  <p className="text-xs font-bold text-primary">
                    {example.pinyin}
                  </p>
                  <p className="text-xs font-medium text-ink-muted">
                    {example.meaning}
                  </p>
                </div>
              </div>
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
