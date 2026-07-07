"use client";

import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/app-shell";

const PURPOSES = [
  { value: "escrow", label: "Buyer escrow payment" },
  { value: "delivery_fee", label: "Seller delivery fee" },
  { value: "storage_fee", label: "Seller storekeeper fee" }
];

export default function FundWalletPage() {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("escrow");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), purpose })
      });
      const json = await res.json();

      if (!json.ok) {
        setError(json.message ?? "Could not start payment.");
        return;
      }

      window.location.href = json.checkoutLink;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <section className="page-stack">
        <div className="hero-panel">
          <span className="eyebrow">Buyers and sellers</span>
          <h1>Fund wallet</h1>
          <p>
            Buyers can fund escrow payments, and sellers can fund delivery or storekeeper
            obligations. You&apos;ll be redirected to Nomba to complete payment.
          </p>
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
          <label className="field full">
            <span>Funding purpose</span>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              {PURPOSES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          {error && <p className="field full form-error">{error}</p>}
          <button className="button field full" type="submit" disabled={loading}>
            {loading ? "Redirecting to Nomba…" : "Fund wallet"}
          </button>
        </form>
      </section>
    </AppShell>
  );
}