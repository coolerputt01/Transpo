"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { navItems } from "@/lib/routes";
import { roleLabels } from "@/lib/mock-data";
import type { UserRole } from "@/lib/types";

type StoredSession = {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
};

const fallbackSession: StoredSession = {
  name: "Victor Demo",
  email: "victor@example.com",
  phone: "08109359665",
  role: "buyer"
};

export function getStoredSession(): StoredSession {
  if (typeof window === "undefined") return fallbackSession;

  const raw = window.localStorage.getItem("transpo-session");
  if (!raw) return fallbackSession;

  try {
    return { ...fallbackSession, ...JSON.parse(raw) };
  } catch {
    return fallbackSession;
  }
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<StoredSession>(fallbackSession);

  useEffect(() => {
    setSession(getStoredSession());
  }, []);

  const visibleNav = useMemo(
    () => navItems.filter((item) => item.roles.includes(session.role)),
    [session.role]
  );

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link href="/" className="brand">
          <span className="brand-mark">T</span>
          <span>
            <strong>Transpo</strong>
            <small>Escrow logistics</small>
          </span>
        </Link>

        <div className="profile-mini">
          <span>{session.name}</span>
          <small>{session.email}</small>
          <small>{session.phone}</small>
          <strong>{roleLabels[session.role]}</strong>
        </div>

        <nav className="side-nav">
          {visibleNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "active" : ""}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div>
            <span className="eyebrow">KYC/Keys verification</span>
            <strong>Pending</strong>
          </div>
          <Link href="/auth" className="button button-ghost">
            Switch account
          </Link>
        </header>
        {children}
      </main>
    </div>
  );
}
