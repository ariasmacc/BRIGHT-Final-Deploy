import React, { useEffect, useState } from 'react';

const Ledger = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);

  useEffect(() => {
    // In a real setup, you'd fetch from your Node.js backend
    // fetch('/api/public/transactions').then(res => res.json()).then(data => {
    //   setAllTransactions(data);
    //   setFilteredTransactions(data);
    // });
  }, []);

  return (
    <div className="transaction-ledger-page">
      <div className="ledger-info">
        <div className="ledger-title-container">
          <h2>Transaction Ledger</h2>
          <p className="subtitle">Blockchain-inspired record of all financial transactions</p>
        </div>
      </div>

      <section className="summary-cards">
        <div className="over-card"><h3>Total Transactions</h3><div className="value">{allTransactions.length}</div></div>
        {/* ... other summary cards ... */}
      </section>

      <div className="budgetvalidation-table-section card">
        <div className="tablescroll">
          <table className="transaction-table">
            <thead>
              <tr><th>Block</th><th>Transaction ID</th><th>Type</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filteredTransactions.map(tx => (
                <tr key={tx.transaction_id}>
                  <td>#{tx.block_number}</td>
                  <td>{tx.transaction_id}</td>
                  <td><span className={`type ${tx.type?.toLowerCase()}`}>{tx.type}</span></td>
                  <td>₱{tx.amount?.toLocaleString()}</td>
                  <td><span className={`status ${tx.status?.toLowerCase()}`}>{tx.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Ledger;