"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";

type Bank = { code: string; name: string };

export default function WithdrawPage() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/wallet/banks")
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) setBanks(json.banks);
      })
      .finally(() => setBanksLoading(false));
  }, []);

  // Resolve the account name once a full 10-digit number + bank are set.
  useEffect(() => {
    setAccountName(null);
    if (accountNumber.length !== 10 || !bankCode) return;

    const timeout = setTimeout(async () => {
      setResolving(true);
      setError(null);
      try {
        const res = await fetch("/api/wallet/resolve-account", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountNumber, bankCode })
        });
        const json = await res.json();
        if (json.ok) setAccountName(json.accountName);
        else setError(json.message ?? "Could not verify that account.");
      } finally {
        setResolving(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [accountNumber, bankCode]);

  async function pollStatus(merchantTxRef: string, attempt = 0) {
    if (attempt > 20) return; // ~3 minutes at 9s intervals
    const res = await fetch(`/api/wallet/withdraw/status?ref=${encodeURIComponent(merchantTxRef)}`);
    const json = await res.json();

    if (json.status === "completed" || json.status === "failed") {
      setStatus(json.status);
      if (json.status === "failed") setError("Transfer failed. Your wallet has been refunded.");
      return;
    }

    setTimeout(() => pollStatus(merchantTxRef, attempt + 1), 9000);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!accountName) {
      setError("Enter a valid account number to resolve the recipient's name first.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), bankCode, accountNumber, accountName })
      });
      const json = await res.json();

      if (!json.ok) {
        setError(json.message ?? "Could not process withdrawal.");
        return;
      }

      setStatus(json.status);
      if (json.status === "processing") pollStatus(json.merchantTxRef);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (status === "completed") {
    return (
      <AppShell>
        <section className="page-stack">
          <div className="hero-panel">
            <span className="eyebrow">Withdraw</span>
            <h1>Withdrawal sent</h1>
            <p>Your funds are on the way to your bank account.</p>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="page-stack">
        <div className="hero-panel">
          <span className="eyebrow">Buyers and sellers</span>
          <h1>Withdraw</h1>
          <p>Move funds from your wallet to your bank account.</p>
        </div>

        <form className="panel form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Amount (NGN)</span>
            <input
              type="number"
              min="100"
              step="0.01"
              placeholder="50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Bank</span>
            <select value={bankCode} onChange={(e) => setBankCode(e.target.value)} required>
              <option value="" disabled>
                {banksLoading ? "Loading banks..." : "Select a bank"}
              </option>
              {banks.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field full">
            <span>Account number</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="0554772814"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
              required
            />
          </label>

          {resolving && <p className="field full form-hint">Verifying account…</p>}
          {accountName && !resolving && <p className="field full form-hint">Recipient: {accountName}</p>}
          {error && <p className="field full form-error">{error}</p>}

          {status === "processing" ? (
            <p className="field full form-hint">Your withdrawal is processing — this can take a few minutes.</p>
          ) : (
            <button className="button field full" type="submit" disabled={submitting || resolving || !accountName}>
              {submitting ? "Processing…" : "Withdraw"}
            </button>
          )}
        </form>
      </section>
    </AppShell>
  );
}