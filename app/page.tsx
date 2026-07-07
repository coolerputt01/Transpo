import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="landing">
      <section className="landing-card">
        <span className="eyebrow">Escrow logistics platform</span>
        <h1>Transpo</h1>
        <p>
          Central auth, role-based dashboards, delivery tracking, escrow confirmation, wallets,
          withdrawals, and lookup flows for buyers, sellers, drivers, and storekeepers.
        </p>
        <div className="action-row">
          <Link className="button" href="/auth?mode=signup">
            Create account
          </Link>
          <Link className="button button-ghost" href="/auth?mode=login">
            Login
          </Link>
        </div>
      </section>
    </main>
  );
}
