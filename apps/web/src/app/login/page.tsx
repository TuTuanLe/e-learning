"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { AuthDivider, GoogleAuthButton } from "@/components/google-auth-button";
import { Logo } from "@/components/logo";
import { createSupabaseBrowserClient } from "@/lib/supabase";

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    const next = new URLSearchParams(window.location.search).get("next");
    router.push(safeNext(next));
    router.refresh();
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[0.8fr_1.2fr]">
      <section className="flex flex-col px-6 py-7 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          <Link href="/"><Logo /></Link>
          <Link className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink" href="/">
            <ArrowLeft className="size-4" /> Trang chủ
          </Link>
        </div>
        <div className="mx-auto my-auto w-full max-w-md py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Welcome back</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-1.2px]">Đăng nhập để tiếp tục.</h1>
          <p className="mt-3 leading-7 text-ink-muted">
            Tiến trình, EXP và những câu cần ôn sẽ được lưu trong tài khoản của bạn.
          </p>
          <GoogleAuthButton
            disabled={loading}
            label="Tiếp tục với Google"
            onError={setError}
          />
          <AuthDivider />
          <form className="space-y-5" onSubmit={submit}>
            <label className="block">
              <span className="text-sm font-medium">Email</span>
              <input
                required
                className="focus-ring mt-2 h-12 w-full rounded-lg border border-hairline px-3.5 outline-none transition hover:border-ink-faint"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium">Mật khẩu</span>
              <input
                required
                className="focus-ring mt-2 h-12 w-full rounded-lg border border-hairline px-3.5 outline-none transition hover:border-ink-faint"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              className="focus-ring inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-white transition hover:bg-primary-active disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-muted">
            Chưa có tài khoản?{" "}
            <Link className="font-medium text-primary hover:underline" href="/register">
              Đăng ký
            </Link>
          </p>
        </div>
      </section>
      <section className="notion-grid relative hidden overflow-hidden bg-secondary p-12 text-white lg:flex lg:items-end">
        <div className="absolute left-[12%] top-[16%] size-28 rotate-12 rounded-[28px] bg-[var(--accent-purple)]" />
        <div className="absolute right-[18%] top-[27%] size-20 -rotate-6 rounded-2xl bg-[var(--accent-pink)]" />
        <div className="absolute left-[38%] top-[42%] size-16 rotate-6 rounded-xl bg-[var(--accent-orange)]" />
        <div className="relative max-w-xl">
          <p className="text-5xl font-bold leading-[1.02] tracking-[-1.8px]">
            Một workspace yên tĩnh để luyện phản xạ mỗi ngày.
          </p>
        </div>
      </section>
    </main>
  );
}
