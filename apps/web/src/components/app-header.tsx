"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { LogOut } from "lucide-react";
import { Logo } from "@/components/logo";
import { createSupabaseBrowserClient } from "@/lib/supabase";

const navigationItems = [
  { href: "/", label: "Luyện tập" },
  { href: "/pinyin", label: "Bảng Pinyin" },
  { href: "/study-plan", label: "Lộ trình AI" },
  { href: "/pricing", label: "Gói học" }
];

export function AppHeader() {
  const pathname = usePathname();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="border-b border-hairline bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <Link href="/" aria-label="Hanzi Flow home">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <div className="mr-2 hidden items-center gap-1 md:flex">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                className={`focus-ring rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname === item.href
                    ? "bg-canvas-soft text-ink"
                    : "text-ink-muted hover:bg-canvas-soft hover:text-ink"
                }`}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
          {user ? (
            <>
              <span className="hidden max-w-56 truncate text-sm text-ink-muted sm:block">
                {user.email}
              </span>
              <button
                className="focus-ring inline-flex size-10 items-center justify-center rounded-lg border border-hairline bg-white transition hover:bg-canvas-soft"
                type="button"
                aria-label="Đăng xuất"
                onClick={signOut}
              >
                <LogOut className="size-4" />
              </button>
            </>
          ) : (
            <Link
              className="focus-ring rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition hover:bg-primary-active"
              href="/login"
            >
              Đăng nhập
            </Link>
          )}
        </nav>
      </div>
      <nav className="no-scrollbar mx-auto flex max-w-7xl gap-1 overflow-x-auto border-t border-hairline px-5 py-2 sm:px-8 md:hidden">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            className={`focus-ring shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition ${
              pathname === item.href
                ? "bg-canvas-soft text-ink"
                : "text-ink-muted hover:bg-canvas-soft hover:text-ink"
            }`}
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
