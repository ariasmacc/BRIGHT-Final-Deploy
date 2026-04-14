import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2'; // Requires 'chart.js' and 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Overview = () => {
  const [summary, setSummary] = useState({ totalBudget: 0, totalSpent: 0 });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Replace these with your actual fetch calls to your Node.js API
    // fetch('/api/public/overview/summary').then(res => res.json()).then(setSummary);
    // fetch('/api/public/transactions').then(res => res.json()).then(setTransactions);
  }, []); 

  const remaining = summary.totalBudget - summary.totalSpent;

  return (
    <div className="public-budget">
      <h1>Public Budget Dashboard</h1>
      <p className="subtitle">Real-time view of budget allocations and spending</p>

      <section className="summary-cards">
        <div className="over-card">
          <h3>Total Budget</h3>
          <p className="amount">₱{summary.totalBudget.toLocaleString()}</p>
        </div>
        <div className="over-card">
          <h3>Total Spent</h3>
          <p className="amount highlight">₱{summary.totalSpent.toLocaleString()}</p>
        </div>
        <div className="over-card">
          <h3>Remaining</h3>
          <p className="amount green">₱{remaining.toLocaleString()}</p>
        </div>
      </section>

      {/* Add your Charts and Transaction lists here following a similar pattern */}
    </div>
  );
};

export default Overview;