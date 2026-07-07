import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { getProfilesByRole } from "@/lib/mock-data";

export default function PartnerSearchPage() {
  const drivers = getProfilesByRole("driver");
  const storekeepers = getProfilesByRole("storekeeper");

  return (
    <AppShell>
      <section className="page-stack">
        <div className="hero-panel">
          <span className="eyebrow">Seller lookup</span>
          <h1>Search drivers and storekeepers</h1>
          <p>Sellers can find delivery partners or failed-delivery storage partners using email IDs.</p>
        </div>

        <form className="panel form-grid">
          <label className="field">
            <span>Partner email ID</span>
            <input placeholder="partner@example.com" type="email" />
          </label>
          <label className="field">
            <span>Partner type</span>
            <select defaultValue="driver">
              <option value="driver">Driver</option>
              <option value="storekeeper">Storekeeper</option>
            </select>
          </label>
          <button className="button field full" type="button">
            Search partner placeholder
          </button>
        </form>

        <div className="content-grid">
          <section className="panel">
            <div className="section-heading">
              <h2>Drivers</h2>
              <StatusPill label="available" tone="green" />
            </div>
            <div className="list">
              {drivers.map((driver) => (
                <div className="list-row" key={driver.id}>
                  <div>
                    <strong>{driver.name}</strong>
                    <small>Email ID: {driver.email}</small>
                    <small>Phone: {driver.phone}</small>
                  </div>
                  <button className="button button-secondary" type="button">
                    Attach
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-heading">
              <h2>Storekeepers</h2>
              <StatusPill label="available" tone="green" />
            </div>
            <div className="list">
              {storekeepers.map((storekeeper) => (
                <div className="list-row" key={storekeeper.id}>
                  <div>
                    <strong>{storekeeper.name}</strong>
                    <small>Email ID: {storekeeper.email}</small>
                    <small>Phone: {storekeeper.phone}</small>
                  </div>
                  <button className="button button-secondary" type="button">
                    Attach
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </AppShell>
  );
}
