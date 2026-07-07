"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { useSession } from "@/components/session-provider";
import { searchProfilesByEmail, createEscrowDelivery } from "@/lib/supabase";
import type { SearchableProfile } from "@/lib/types";

export default function SellerSearchPage() {
  const { profile } = useSession();
  const [emailQuery, setEmailQuery] = useState("");
  const [results, setResults] = useState<SearchableProfile[]>([]);
  const [searched, setSearched] = useState(false);
  const [activeSellerId, setActiveSellerId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", pickupAddress: "", deliveryAddress: "", amount: "" });
  const [status, setStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearched(true);
    const found = await searchProfilesByEmail(emailQuery, "seller");
    setResults(found);
  }

  async function handleStartEscrow(seller: SearchableProfile) {
    if (!profile) return;
    setSubmitting(true);
    setStatus(null);

    const amount = Number(form.amount);
    if (!form.title || !form.pickupAddress || !form.deliveryAddress || !amount || amount <= 0) {
      setStatus({ message: "Fill in title, both addresses, and a valid amount.", isError: true });
      setSubmitting(false);
      return;
    }

    const result = await createEscrowDelivery({
      buyerEmail: profile.email,
      sellerId: seller.id,
      sellerEmail: seller.email,
      title: form.title,
      pickupAddress: form.pickupAddress,
      deliveryAddress: form.deliveryAddress,
      amount
    });

    setSubmitting(false);

    if (!result.ok) {
      setStatus({ message: result.message ?? "Could not start escrow payment.", isError: true });
      return;
    }

    setStatus({ message: "Escrow payment started. Funds are held until you confirm delivery.", isError: false });
    setActiveSellerId(null);
    setForm({ title: "", pickupAddress: "", deliveryAddress: "", amount: "" });
  }

  return (
    <AppShell>
      <section className="page-stack">
        <div className="hero-panel">
          <span className="eyebrow">Buyer lookup</span>
          <h1>Search for a seller</h1>
          <p>Buyers search sellers by the main identity ID: email. Payment can start after verification.</p>
        </div>

        <form className="panel form-grid" onSubmit={handleSearch}>
          <label className="field full">
            <span>Seller email ID</span>
            <input
              placeholder="seller@business.com"
              type="email"
              value={emailQuery}
              onChange={(event) => setEmailQuery(event.target.value)}
            />
          </label>
          <button className="button field full" type="submit">
            Search seller
          </button>
        </form>

        <section className="panel">
          <div className="section-heading">
            <h2>Results</h2>
          </div>

          {searched && results.length === 0 && <p className="helper">No sellers found for that email.</p>}

          {results.map((seller) => (
            <div key={seller.id} className="list-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
              <div className="list-row">
                <div>
                  <strong>{seller.name}</strong>
                  <small>Email ID: {seller.email}</small>
                  <small>Phone: {seller.phone}</small>
                </div>
                <div className="right">
                  <StatusPill
                    label={seller.verification_status === "verified" ? "Verified" : "KYC/Keys pending"}
                    tone={seller.verification_status === "verified" ? "green" : "amber"}
                  />
                  <button
                    className="button"
                    type="button"
                    onClick={() => setActiveSellerId(activeSellerId === seller.id ? null : seller.id)}
                  >
                    Start escrow payment
                  </button>
                </div>
              </div>

              {activeSellerId === seller.id && (
                <div className="form-grid" style={{ marginTop: "0.75rem" }}>
                  <label className="field full">
                    <span>What are you buying</span>
                    <input
                      value={form.title}
                      onChange={(event) => setForm({ ...form, title: event.target.value })}
                      placeholder="e.g. 2 bags of cement"
                    />
                  </label>
                  <label className="field">
                    <span>Pickup address</span>
                    <input
                      value={form.pickupAddress}
                      onChange={(event) => setForm({ ...form, pickupAddress: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Delivery address</span>
                    <input
                      value={form.deliveryAddress}
                      onChange={(event) => setForm({ ...form, deliveryAddress: event.target.value })}
                    />
                  </label>
                  <label className="field">
                    <span>Amount (₦)</span>
                    <input
                      type="number"
                      min="1"
                      value={form.amount}
                      onChange={(event) => setForm({ ...form, amount: event.target.value })}
                    />
                  </label>
                  <button
                    className="button field full"
                    type="button"
                    disabled={submitting}
                    onClick={() => handleStartEscrow(seller)}
                  >
                    {submitting ? "Starting escrow..." : "Confirm and hold payment"}
                  </button>
                </div>
              )}
            </div>
          ))}

          {status && (
            <p className={`helper ${status.isError ? "error" : "success"}`} style={{ marginTop: "0.75rem" }}>
              {status.message}
            </p>
          )}
        </section>
      </section>
    </AppShell>
  );
}