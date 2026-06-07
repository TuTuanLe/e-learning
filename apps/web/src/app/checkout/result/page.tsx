"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { PaymentOrderResponse } from "@dictation/contracts";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { paymentApi } from "@/lib/api";

export default function CheckoutResultPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutResultContent />
    </Suspense>
  );
}

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const invoice = searchParams.get("order") ?? "";
  const payment = searchParams.get("payment") ?? "success";
  const [order, setOrder] = useState<PaymentOrderResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!invoice) return;
    void paymentApi.order(invoice).then(setOrder).catch((caught) => {
      setError(caught instanceof Error ? caught.message : "Không thể tải đơn thanh toán.");
    });
  }, [invoice]);

  const failed = payment === "error" || payment === "cancel";

  return (
    <main className="min-h-screen bg-canvas-soft">
      <AppHeader />
      <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
        <div className="rounded-3xl border border-hairline bg-white p-8 notion-shadow">
          <span
            className={`mx-auto flex size-16 items-center justify-center rounded-2xl ${
              failed ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
            }`}
          >
            {failed ? <XCircle className="size-9" /> : <CheckCircle2 className="size-9" />}
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-[-1px]">
            {failed ? "Thanh toán chưa hoàn tất" : "Đã nhận yêu cầu thanh toán"}
          </h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-ink-muted">
            {failed
              ? "Giao dịch SePay bị lỗi hoặc bị hủy. Bạn có thể quay lại chọn gói và thử lại."
              : "SePay đã chuyển bạn về Hanzi Flow. Admin sẽ đối soát đơn và kích hoạt gói cho tài khoản của bạn."}
          </p>

          {order ? (
            <div className="mx-auto mt-7 max-w-md rounded-2xl bg-canvas-soft p-5 text-left">
              <p className="text-sm text-ink-muted">Mã đơn</p>
              <p className="mt-1 font-semibold">{order.invoiceNumber}</p>
              <p className="mt-4 text-sm text-ink-muted">Số tiền</p>
              <p className="mt-1 font-semibold">
                {new Intl.NumberFormat("vi-VN").format(order.amount)}đ
              </p>
              <p className="mt-4 text-sm text-ink-muted">Trạng thái</p>
              <p className="mt-1 inline-flex items-center gap-2 font-semibold">
                <Clock3 className="size-4 text-primary" />
                {order.status === "ACTIVATED" ? "Đã kích hoạt" : "Chờ admin xác nhận"}
              </p>
            </div>
          ) : invoice ? (
            <p className="mt-5 rounded-2xl bg-canvas-soft p-4 text-sm text-ink-muted">
              Mã đơn: <strong className="text-ink">{invoice}</strong>
            </p>
          ) : null}

          {error ? <p className="mt-5 text-sm text-red-600">{error}</p> : null}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              className="focus-ring inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-semibold text-white"
              href={failed ? "/pricing" : "/"}
            >
              {failed ? "Quay lại thanh toán" : "Về trang học"}
            </Link>
            {!failed ? (
              <Link
                className="focus-ring inline-flex h-12 items-center justify-center rounded-full border border-hairline bg-white px-6 font-semibold"
                href="/pricing"
              >
                Xem gói học
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
