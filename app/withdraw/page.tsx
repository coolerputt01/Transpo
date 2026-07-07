import { AppShell } from "@/components/app-shell";

export default function WithdrawPage() {
  return (
    <AppShell>
      <section className="page-stack">
        <div className="hero-panel">
          <span className="eyebrow">All roles</span>
          <h1>Withdraw</h1>
          <p>
            Buyers, sellers, drivers, and storekeepers can request withdrawals. KYC/Keys status
            remains pending until your verification provider is connected.
          </p>
        </div>

        <form className="panel form-grid">
          <label className="field">
            <span>Email ID</span>
            <input placeholder="user@example.com" type="email" />
          </label>
          <label className="field">
            <span>Amount</span>
            <input placeholder="25000" type="number" />
          </label>
          <label className="field">
            <span>Bank name</span>
            <input placeholder="Bank name" />
          </label>
          <label className="field">
            <span>Account number</span>
            <input placeholder="0123456789" />
          </label>
          <button className="button field full" type="button">
            Request withdrawal placeholder
          </button>
        </form>
      </section>
    </AppShell>
  );
}
