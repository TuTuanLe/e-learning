"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";

type GoogleAuthButtonProps = {
  disabled?: boolean;
  label: string;
  onError: (message: string) => void;
};

function safeNext(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export function GoogleAuthButton({
  disabled = false,
  label,
  onError
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  async function signInWithGoogle() {
    setLoading(true);
    onError("");

    try {
      const next = safeNext(new URLSearchParams(window.location.search).get("next"));
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      callbackUrl.searchParams.set("next", next);

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl.toString()
        }
      });

      if (error) {
        throw error;
      }
    } catch (caught) {
      onError(caught instanceof Error ? caught.message : "Không thể đăng nhập với Google.");
      setLoading(false);
    }
  }

  return (
    <button
      className="focus-ring mt-8 inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-hairline bg-white font-medium text-ink transition hover:bg-canvas-soft disabled:opacity-60"
      disabled={disabled || loading}
      type="button"
      onClick={signInWithGoogle}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" /> : <GoogleIcon />}
      {loading ? "Đang chuyển hướng..." : label}
    </button>
  );
}

export function AuthDivider() {
  return (
    <div className="my-6 flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-hairline" />
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
        hoặc
      </span>
      <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="size-[18px]" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.205c0-.638-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.797 2.715v2.258h2.909c1.702-1.567 2.684-3.875 2.684-6.613Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.468-.806 5.956-2.182l-2.91-2.258c-.805.54-1.835.859-3.046.859-2.344 0-4.328-1.585-5.037-3.714H.956v2.332A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.963 10.705A5.42 5.42 0 0 1 3.682 9c0-.592.102-1.168.281-1.705V4.963H.956A9 9 0 0 0 0 9c0 1.452.347 2.827.956 4.037l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.507.454 3.441 1.345l2.581-2.58C13.464.891 11.426 0 9 0A9 9 0 0 0 .956 4.963l3.007 2.332C4.672 5.166 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}
