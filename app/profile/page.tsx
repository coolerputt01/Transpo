"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { useSession } from "@/components/session-provider";
import { updateOwnProfile } from "@/lib/supabase";
import { roleLabels } from "@/lib/mock-data";

const verificationLabels: Record<string, string> = {
  pending: "KYC/Keys pending",
  verified: "Verified",
  rejected: "Rejected"
};

export default function ProfilePage() {
  const { profile, refresh } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPhone(profile.phone);
    }
  }, [profile]);

  if (!profile) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setStatus(null);

    const result = await updateOwnProfile(profile!.id, { name, phone });
    setSaving(false);

    if (!result.ok) {
      setStatus({ message: result.message ?? "Could not save profile.", isError: true });
      return;
    }

    setStatus({ message: "Profile updated.", isError: false });
    refresh();
  }

  return (
    <AppShell>
      <section className="page-stack">
        <div className="hero-panel">
          <span className="eyebrow">Account identity</span>
          <h1>Profile</h1>
          <p>Email is the main identity ID across lookups, escrow payments, transaction history, and relationships.</p>
        </div>

        <section className="panel">
          <div className="section-heading">
            <h2>User details</h2>
            <StatusPill
              label={verificationLabels[profile.verification_status]}
              tone={profile.verification_status === "verified" ? "green" : "amber"}
            />
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <label className="field">
              <span>Name</span>
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="field">
              <span>Email ID</span>
              <input value={profile.email} type="email" readOnly />
            </label>
            <label className="field">
              <span>Phone number</span>
              <input value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" />
            </label>
            <label className="field">
              <span>Role</span>
              <input value={roleLabels[profile.role]} readOnly />
            </label>

            {status && (
              <p className={`helper field full ${status.isError ? "error" : "success"}`}>{status.message}</p>
            )}

            <button className="button field full" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </section>
      </section>
    </AppShell>
  );
}