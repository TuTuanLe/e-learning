"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type {
  SubscriptionPlan,
  SubscriptionSummary,
} from "@dictation/contracts";
import {
  Check,
  Clock3,
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { subscriptionApi } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const plans: Array<{
  id: SubscriptionPlan;
  name: string;
  price: string;
  cadence: string;
  description: string;
  popular?: boolean;
  ai: boolean;
  highlight?: string;
}> = [
  {
    id: "MONTHLY",
    name: "1 tháng",
    price: "49.000đ",
    cadence: "/ tháng",
    description:
      "Bắt đầu nhẹ nhàng, mở toàn bộ thư viện HSK và lưu tiến trình.",
    ai: false,
  },
  {
    id: "SIX_MONTH",
    name: "6 tháng",
    price: "249.000đ",
    cadence: "/ 6 tháng",
    description: "Có đủ thời gian xây nền tảng và điều chỉnh lộ trình.",
    popular: true,
    ai: true,
    highlight: "Tiết kiệm hơn",
  },
  {
    id: "LIFETIME",
    name: "Vĩnh viễn",
    price: "599.000đ",
    cadence: "một lần",
    description: "Học dài hạn, giữ quyền truy cập và lộ trình AI mãi mãi.",
    ai: true,
    highlight: "Best value",
  },
];

const sharedFeatures = [
  "Toàn bộ chủ đề HSK 1–6",
  "Typing và Word bank",
  "Lưu tiến trình, EXP và câu cần ôn",
];

export default function PricingPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      const token = data.session?.access_token;
      if (!token) return;
      setSummary(await subscriptionApi.summary(token).catch(() => null));
    });
  }, [supabase]);

  async function choosePlan(plan: SubscriptionPlan) {
    setError("");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      window.location.assign(`/login?next=${encodeURIComponent("/pricing")}`);
      return;
    }

    setLoadingPlan(plan);

    try {
      const checkout = await subscriptionApi.checkout(plan, token);
      submitCheckout(checkout);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Không thể mở trang thanh toán.",
      );
      setLoadingPlan(null);
    }
  }

  async function openPortal() {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;

    try {
      const { url } = await subscriptionApi.portal(token);
      window.location.assign(url);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Không thể mở cổng thanh toán.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-canvas-soft">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-blue-50 px-4 py-2 text-sm font-semibold text-primary">
            <Clock3 className="size-4" />
            Trial 2 tuần cho tài khoản mới
          </div>
          <h1 className="text-4xl font-bold tracking-[-1.4px] sm:text-5xl">
            Chọn nhịp học đủ dài để thấy mình tiến bộ.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-muted">
            Mọi gói đều mở toàn bộ thư viện HSK. Gói 6 tháng và vĩnh viễn có
            thêm lộ trình AI, chủ đề theo nhu cầu và điều chỉnh kế hoạch định
            kỳ.
          </p>
        </div>

        {summary?.plan &&
        (summary.status === "ACTIVE" || summary.status === "TRIALING") ? (
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/25 bg-blue-50 p-4">
            <p className="text-sm">
              Gói hiện tại: <strong>{planLabel(summary.plan)}</strong>
              {summary.currentPeriodEnd
                ? ` · đến ${new Date(summary.currentPeriodEnd).toLocaleDateString("vi-VN")}`
                : ""}
            </p>
            {summary.billingMode === "stripe" ? (
              <button
                className="text-sm font-semibold text-primary hover:underline"
                onClick={openPortal}
              >
                Quản lý thanh toán
              </button>
            ) : (
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                {summary?.status === "TRIALING"
                  ? "Trial 2 tuần"
                  : "SePay / local"}
              </span>
            )}
          </div>
        ) : null}

        {summary?.billingMode === "mock" ? (
          <p className="mx-auto mt-4 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
            Chế độ dev: chọn gói sẽ kích hoạt ngay, không phát sinh thanh toán
            thật.
          </p>
        ) : null}

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => {
            const active =
              summary?.plan === plan.id &&
              summary.status === "ACTIVE" &&
              (!summary.currentPeriodEnd ||
                new Date(summary.currentPeriodEnd) > new Date());

            return (
              <article
                key={plan.id}
                className={`relative flex flex-col rounded-3xl border bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl ${
                  plan.popular
                    ? "border-primary notion-shadow"
                    : "border-hairline"
                }`}
              >
                {plan.popular ? (
                  <span className="absolute right-5 top-5 text-xs font-semibold uppercase tracking-[0.1em] text-primary">
                    Phổ biến
                  </span>
                ) : null}
                {plan.highlight && !plan.popular ? (
                  <span className="absolute right-5 top-5 rounded-full bg-canvas-soft px-3 py-1 text-xs font-semibold text-ink-muted">
                    {plan.highlight}
                  </span>
                ) : null}
                <h2 className="text-2xl font-bold tracking-[-0.5px]">
                  {plan.name}
                </h2>
                <p className="mt-4">
                  <span className="text-4xl font-bold tracking-[-1px]">
                    {plan.price}
                  </span>
                  <span className="ml-1 text-sm text-ink-muted">
                    {plan.cadence}
                  </span>
                </p>
                <p className="mt-4 min-h-14 text-sm leading-6 text-ink-muted">
                  {plan.description}
                </p>
                {plan.id === "LIFETIME" ? (
                  <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                    <ShieldCheck className="size-3.5" />
                    Trả một lần, dùng lâu dài
                  </p>
                ) : null}
                <div className="my-6 border-t border-hairline" />
                <ul className="space-y-3 text-sm">
                  {sharedFeatures.map((feature) => (
                    <li key={feature} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                  <li className="flex gap-2.5">
                    {plan.ai ? (
                      <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                    ) : (
                      <LockKeyhole className="mt-0.5 size-4 shrink-0 text-ink-faint" />
                    )}
                    <span className={plan.ai ? "" : "text-ink-muted"}>
                      Lộ trình AI cá nhân hóa
                    </span>
                  </li>
                  <li className="flex gap-2.5">
                    {plan.ai ? (
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    ) : (
                      <LockKeyhole className="mt-0.5 size-4 shrink-0 text-ink-faint" />
                    )}
                    <span className={plan.ai ? "" : "text-ink-muted"}>
                      Chủ đề theo yêu cầu và review hằng tháng
                    </span>
                  </li>
                </ul>
                <button
                  className={`focus-ring mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full font-medium transition disabled:opacity-55 ${
                    plan.popular
                      ? "bg-primary text-white hover:bg-primary-active"
                      : "border border-hairline bg-white hover:bg-canvas-soft"
                  }`}
                  disabled={active || loadingPlan !== null}
                  onClick={() => choosePlan(plan.id)}
                >
                  {loadingPlan === plan.id ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : null}
                  {active
                    ? "Gói hiện tại"
                    : loadingPlan === plan.id
                      ? "Đang mở..."
                      : "Chọn gói"}
                </button>
              </article>
            );
          })}
        </div>

        {summary?.billingMode === "unconfigured" ? (
          <p className="mt-6 text-center text-sm text-amber-700">
            Checkout đang tạm khóa vì SePay chưa được cấu hình trên môi trường
            này.
          </p>
        ) : null}
        {error ? (
          <p className="mt-5 text-center text-sm text-red-600">{error}</p>
        ) : null}

        <p className="mt-10 text-center text-sm text-ink-muted">
          Muốn xem trước nội dung?{" "}
          <Link className="font-semibold text-primary hover:underline" href="/">
            Học thử miễn phí HSK 1
          </Link>
        </p>
      </section>
    </main>
  );
}

function planLabel(plan: SubscriptionPlan) {
  return plans.find((item) => item.id === plan)?.name ?? plan;
}

function submitCheckout(checkout: {
  url: string;
  method?: "GET" | "POST";
  fields?: Record<string, string>;
}) {
  if (checkout.method !== "POST" || !checkout.fields) {
    window.location.assign(checkout.url);
    return;
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = checkout.url;

  Object.entries(checkout.fields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}
