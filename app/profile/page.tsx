import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";

export default function ProfilePage() {
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
            <StatusPill label="KYC/Keys pending" tone="amber" />
          </div>
          <form className="form-grid">
            <label className="field">
              <span>Name</span>
              <input defaultValue="Victor Demo" />
            </label>
            <label className="field">
              <span>Email ID</span>
              <input defaultValue="victor@example.com" type="email" />
            </label>
            <label className="field">
              <span>Phone number</span>
              <input defaultValue="08109359665" type="tel" />
            </label>
            <label className="field">
              <span>Role</span>
              <select defaultValue="buyer">
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
                <option value="driver">Driver</option>
                <option value="storekeeper">Storekeeper</option>
              </select>
            </label>
            <button className="button field full" type="button">
              Save profile placeholder
            </button>
          </form>
        </section>
      </section>
    </AppShell>
  );
}
