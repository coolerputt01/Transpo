import { AppShell } from "@/components/app-shell";
import { StatusPill } from "@/components/status-pill";
import { formatCurrency, transactions } from "@/lib/mock-data";

export default function TransactionsPage() {
  return (
    <AppShell>
      <section className="page-stack">
        <div className="hero-panel">
          <span className="eyebrow">Payment records</span>
          <h1>Transactions</h1>
          <p>
            Buyer-to-seller payments, seller-to-driver delivery fees, seller-to-storekeeper
            holding fees, wallet funding, withdrawals, receipts, and disputes belong here.
          </p>
        </div>

        <section className="panel">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Payer</th>
                  <th>Recipient</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.id}</td>
                    <td>{transaction.payer}</td>
                    <td>{transaction.recipient}</td>
                    <td>{transaction.type.split("_").join(" ")}</td>
                    <td>{formatCurrency(transaction.amount)}</td>
                    <td>
                      <StatusPill label={transaction.status} tone={transaction.status === "released" ? "green" : "amber"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
    </AppShell>
  );
}
