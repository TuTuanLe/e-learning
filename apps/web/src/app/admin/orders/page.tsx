"use client";

import { useEffect, useMemo, useState } from "react";
import type { PaymentOrderResponse } from "@dictation/contracts";
import { CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { adminApi } from "@/lib/api";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function AdminOrdersPage() {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [token, setToken] = useState("");
  const [orders, setOrders] = useState<PaymentOrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        window.location.assign(`/login?next=${encodeURIComponent("/admin/orders")}`);
        return;
      }

      setToken(accessToken);
      try {
        const response = await adminApi.orders(accessToken);
        if (mounted) setOrders(response.orders);
      } catch (caught) {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : "Không thể tải orders.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  async function activate(order: PaymentOrderResponse) {
    setActivatingId(order.id);
    setError("");
    try {
      const updated = await adminApi.activateOrder(order.id, token);
      setOrders((current) =>
        current.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Không thể kích hoạt order.");
    } finally {
      setActivatingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-canvas-soft">
      <AppHeader />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
              Admin
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-1px]">Orders SePay</h1>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-sm font-semibold">
            <ShieldCheck className="size-4 text-primary" />
            Kích hoạt gói thủ công
          </span>
        </div>

        {error ? <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-hairline bg-white notion-shadow">
          <div className="grid grid-cols-[1.1fr_1fr_0.7fr_0.7fr_0.8fr_0.7fr] gap-4 border-b border-hairline bg-canvas-soft px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
            <span>Order</span>
            <span>User</span>
            <span>Gói</span>
            <span>Số tiền</span>
            <span>Trạng thái</span>
            <span className="text-right">Action</span>
          </div>
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-sm text-ink-muted">
              <LoaderCircle className="size-4 animate-spin" />
              Đang tải orders...
            </div>
          ) : orders.length === 0 ? (
            <p className="p-10 text-center text-sm text-ink-muted">Chưa có order nào.</p>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-[1.1fr_1fr_0.7fr_0.7fr_0.8fr_0.7fr] items-center gap-4 border-b border-hairline px-5 py-4 text-sm last:border-b-0"
              >
                <div>
                  <p className="font-semibold">{order.invoiceNumber}</p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <p className="truncate">{order.userEmail}</p>
                <p>{planLabel(order.plan)}</p>
                <p className="font-semibold">
                  {new Intl.NumberFormat("vi-VN").format(order.amount)}đ
                </p>
                <StatusBadge status={order.status} />
                <div className="text-right">
                  <button
                    className="focus-ring inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-canvas-soft disabled:text-ink-muted"
                    disabled={order.status === "ACTIVATED" || activatingId !== null}
                    onClick={() => void activate(order)}
                  >
                    {activatingId === order.id ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : order.status === "ACTIVATED" ? (
                      <CheckCircle2 className="size-4" />
                    ) : null}
                    {order.status === "ACTIVATED" ? "Đã set" : "Set gói"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function StatusBadge({ status }: { status: PaymentOrderResponse["status"] }) {
  const active = status === "ACTIVATED";
  return (
    <span
      className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
        active ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
      }`}
    >
      {active ? "Đã kích hoạt" : status}
    </span>
  );
}

function planLabel(plan: PaymentOrderResponse["plan"]) {
  if (plan === "MONTHLY") return "1 tháng";
  if (plan === "SIX_MONTH") return "6 tháng";
  return "Vĩnh viễn";
}
