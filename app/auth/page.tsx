"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { roleLabels } from "@/lib/mock-data";
import {
  createTranspoUser,
  loginTranspoUser,
  resolveUserRole,
} from "@/lib/supabase";
import { UserRole } from "@/lib/types";

type AuthMode = "signup" | "login";

const roles: UserRole[] = ["buyer", "seller", "driver", "storekeeper"];

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [role, setRole] = useState<UserRole>("buyer");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMode(params.get("mode") === "login" ? "login" : "signup");
  }, []);

  const modeCopy = useMemo(
    () =>
      mode === "signup"
        ? "Create your account, choose your role, and continue to your matching dashboard."
        : "Login with your email. We'll route you to your account's dashboard.",
    [mode]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsError(false);

    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "Transpo User");
    const email = String(form.get("email") || "");
    const phone = String(form.get("phone") || "");
    const password = String(form.get("password") || "");

    if (!email) {
      setIsError(true);
      setMessage("Email is required because it is the main identity ID on Transpo.");
      return;
    }

    setIsSubmitting(true);

    if (mode === "signup") {
      const result = await createTranspoUser({ name, email, phone, password, role });
      setIsSubmitting(false);

      if (!result.ok) {
        setIsError(true);
        setMessage(result.message ?? "Something went wrong. Please try again.");
        return;
      }

      if (result.needsEmailConfirmation) {
        setIsError(false);
        setMessage("Check your email to confirm your account, then log in.");
        setMode("login");
        return;
      }

      router.push("/dashboard");
      return;
    }

    // login
    const result = await loginTranspoUser({ email, password });
    setIsSubmitting(false);

    if (!result.ok) {
      setIsError(true);
      setMessage(result.message ?? "Login failed. Check your details and try again.");
      return;
    }

    const actualRole = resolveUserRole(result.data?.user ?? null, role);
    router.push("/dashboard");
    void actualRole; // swap in role-based routing here once per-role dashboards exist
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
          <button
            className={mode === "signup" ? "active" : ""}
            onClick={() => {
              setMode("signup");
              setMessage("");
            }}
            type="button"
          >
            Signup
          </button>
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
            type="button"
          >
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
            <input name="password" placeholder="Minimum 8 characters" type="password" required minLength={8} />
          </label>

          <div className="field">
            <span>Verification</span>
            <input value="KYC/Keys verification pending" readOnly />
          </div>

          {message && (
            <p className={`helper field full ${isError ? "error" : "success"}`}>{message}</p>
          )}

          <button className="button field full" type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Please wait..."
              : `Continue to ${roleLabels[role]} dashboard`}
          </button>
        </form>
      </section>
    </main>
  );
}