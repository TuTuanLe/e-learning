"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { AuthDivider, GoogleAuthButton } from "@/components/google-auth-button";
import { Logo } from "@/components/logo";
import { createSupabaseBrowserClient } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createSupabaseBrowserClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });

    if (signUpError) {
      setError(signUpError.message);
    } else if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      setMessage("Đã tạo tài khoản. Hãy kiểm tra email để xác nhận.");
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-canvas-soft px-5 py-8 sm:py-14">
      <div className="mx-auto max-w-lg">
        <Link href="/"><Logo /></Link>
        <section className="notion-shadow mt-8 rounded-2xl border border-hairline bg-white p-6 sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Create account</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-1.2px]">Bắt đầu nhịp học mới.</h1>
          <GoogleAuthButton
            disabled={loading}
            label="Đăng ký với Google"
            onError={setError}
          />
          <AuthDivider />
          <form className="space-y-5" onSubmit={submit}>
            {[
              { label: "Họ tên", type: "text", value: name, set: setName, auto: "name" },
              { label: "Email", type: "email", value: email, set: setEmail, auto: "email" },
              { label: "Mật khẩu", type: "password", value: password, set: setPassword, auto: "new-password" }
            ].map((field) => (
              <label key={field.label} className="block">
                <span className="text-sm font-medium">{field.label}</span>
                <input
                  required
                  minLength={field.type === "password" ? 8 : undefined}
                  className="focus-ring mt-2 h-12 w-full rounded-lg border border-hairline px-3.5 outline-none transition hover:border-ink-faint"
                  type={field.type}
                  autoComplete={field.auto}
                  value={field.value}
                  onChange={(event) => field.set(event.target.value)}
                />
              </label>
            ))}
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {message ? <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</p> : null}
            <button
              className="focus-ring inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary font-medium text-white transition hover:bg-primary-active disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? <LoaderCircle className="size-4 animate-spin" /> : null}
              {loading ? "Đang tạo..." : "Tạo tài khoản"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-ink-muted">
            Đã có tài khoản?{" "}
            <Link className="font-medium text-primary hover:underline" href="/login">Đăng nhập</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
