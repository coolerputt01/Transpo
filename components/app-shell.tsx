"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useMemo } from "react";
import { navItems } from "@/lib/routes";
import { roleLabels } from "@/lib/mock-data";
import { useSession } from "@/components/session-provider";
import { signOutTranspoUser } from "@/lib/supabase";

const verificationLabels: Record<string, string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected"
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, loading } = useSession();

  const visibleNav = useMemo(
    () => (profile ? navItems.filter((item) => item.roles.includes(profile.role)) : []),
    [profile]
  );

  async function handleSwitchAccount() {
    await signOutTranspoUser();
    router.push("/auth");
  }

  if (loading) {
    return (
      <div className="shell shell-loading">
        <p>Loading your workspace...</p>
      </div>
    );
  }

  // SessionProvider is already redirecting to /auth in this case
  if (!profile) return null;

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
          <span>{profile.name}</span>
          <small>{profile.email}</small>
          <small>{profile.phone}</small>
          <strong>{roleLabels[profile.role]}</strong>
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
            <strong>{verificationLabels[profile.verification_status]}</strong>
          </div>
          <button className="button button-ghost" onClick={handleSwitchAccount} type="button">
            Switch account
          </button>
        </header>
        {children}
      </main>
    </div>
  );
}