"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { XCircle } from "lucide-react";
import { AppHeader } from "@/components/app-header";

export default function PaymentErrorPage() {
  return (
    <Suspense fallback={null}>
      <PaymentErrorContent />
    </Suspense>
  );
}

function PaymentErrorContent() {
  const searchParams = useSearchParams();
  const invoice = searchParams.get("order");

  return (
    <main className="min-h-screen bg-canvas-soft">
      <AppHeader />
      <section className="mx-auto max-w-2xl px-5 py-16 text-center sm:px-8">
        <div className="rounded-3xl border border-hairline bg-white p-8 notion-shadow">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <XCircle className="size-9" />
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-[-1px]">Thanh toán chưa hoàn tất</h1>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-ink-muted">
            Giao dịch SePay bị lỗi hoặc bị hủy. Bạn có thể quay lại chọn gói và thử lại.
          </p>
          {invoice ? (
            <p className="mt-5 rounded-2xl bg-canvas-soft p-4 text-sm text-ink-muted">
              Mã đơn: <strong className="text-ink">{invoice}</strong>
            </p>
          ) : null}
          <Link
            className="focus-ring mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-semibold text-white"
            href="/pricing"
          >
            Quay lại thanh toán
          </Link>
        </div>
      </section>
    </main>
  );
}
