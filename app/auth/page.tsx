"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { roleLabels } from "@/lib/mock-data";
import type { UserRole } from "@/lib/types";

type AuthMode = "signup" | "login";

const roles: UserRole[] = ["buyer", "seller", "driver", "storekeeper"];

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [role, setRole] = useState<UserRole>("buyer");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMode(params.get("mode") === "login" ? "login" : "signup");
  }, []);

  const modeCopy = useMemo(
    () =>
      mode === "signup"
        ? "Create your account, choose your role, and continue to your matching dashboard."
        : "Login with your email. Demo mode will route you using the selected role.",
    [mode]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "Transpo User");
    const email = String(form.get("email") || "");
    const phone = String(form.get("phone") || "");

    if (!email) {
      setMessage("Email is required because it is the main identity ID on Transpo.");
      return;
    }

    window.localStorage.setItem(
      "transpo-session",
      JSON.stringify({
        name,
        email,
        phone,
        role
      })
    );
    router.push("/dashboard");
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link href="/" className="eyebrow">
          Transpo
        </Link>
        <h1>Central auth</h1>
        <p className="helper">{modeCopy}</p>

        <div className="auth-tabs" role="tablist" aria-label="Auth mode">
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>
            Signup
          </button>
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Login
          </button>
        </div>

        <div className="role-grid" aria-label="Choose role">
          {roles.map((item) => (
            <button
              className={role === item ? "active" : ""}
              key={item}
              onClick={() => setRole(item)}
              type="button"
            >
              {roleLabels[item]}
            </button>
          ))}
        </div>

        <form className="form-grid" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label className="field">
              <span>Name</span>
              <input name="name" placeholder="Victor Adetunbi" />
            </label>
          )}

          <label className="field">
            <span>Email ID</span>
            <input name="email" placeholder="user@example.com" type="email" required />
          </label>

          {mode === "signup" && (
            <label className="field">
              <span>Phone number</span>
              <input name="phone" placeholder="08100000000" type="tel" />
            </label>
          )}

          <label className="field">
            <span>Password</span>
            <input name="password" placeholder="Minimum 8 characters" type="password" required />
          </label>

          <div className="field">
            <span>Verification</span>
            <input value="KYC/Keys verification pending" readOnly />
          </div>

          {message && <p className="helper field full">{message}</p>}

          <button className="button field full" type="submit">
            Continue to {roleLabels[role]} dashboard
          </button>
        </form>
      </section>
    </main>
  );
}
