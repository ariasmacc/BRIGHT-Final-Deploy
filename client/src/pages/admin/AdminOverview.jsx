import React, { useState, useEffect } from 'react';
import '../../index.css';

const AdminOverview = () => {
  const API_BASE_URL = '/api';

  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const [summary, setSummary] = useState({
    totalBudget: 0,
    totalSpent: 0,
    remaining: 0,
    percentage: 0,
    pendingCount: 0
  });

  const [transactions, setTransactions] = useState([]);
  const [utilization, setUtilization] = useState([]);

  // ==========================================
  // 2. EFFECT HOOK (Pamalit sa DOMContentLoaded)
  // ==========================================
  useEffect(() => {
    loadSummaryData();
    loadRecentTransactions();
    loadDashboardData();
  }, []);

  // ==========================================
  // 3. FUNCTIONS / API CALLS
  // ==========================================
  const loadSummaryData = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/overview/summary`);
      const data = await res.json();
      const totalBudget = data.totalBudget || 0;
      const totalSpent = data.totalSpent || 0;
      
      setSummary({
        totalBudget,
        totalSpent,
        remaining: totalBudget - totalSpent,
        percentage: totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(0) : 0,
        pendingCount: data.pendingCount || 0
      });
      
      setSummary({
      });
    } catch (err) {
      console.error('Error loading summary data:', err);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/transactions`);
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  const loadDashboardData = async () => {
    try {
      const utilizationRes = await fetch(`${API_BASE_URL}/overview/utilization`);
      const data = await utilizationRes.json();
      setUtilization(data);
      
      setUtilization([
      ]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  // ==========================================
  // 4. JSX / UI RENDER
  // ==========================================
  return (
    <main className="dashboard">
      <div className="public-budget">
        <h1>Public Budget Dashboard</h1>
        <p className="subtitle">Real-time view of budget allocations and spending</p>

        <section className="summary-cards">
          <div className="over-card">
            <h3>Total Budget</h3>
            <p className="amount">₱<span>{summary.totalBudget.toLocaleString()}</span></p>
            <small>Allocated across all categories</small>
          </div>

          <div className="over-card">
            <h3>Total Spent</h3>
            <p className="amount highlight">₱<span>{summary.totalSpent.toLocaleString()}</span></p>
            <small><span>{summary.percentage}%</span> of total budget</small>
          </div>

          <div className="over-card">
            <h3>Remaining</h3>
            <p className="amount green">₱<span>{summary.remaining.toLocaleString()}</span></p>
            <small>Available for future expenses</small>
          </div>

          <div className="over-card">
            <h3>Validation Status</h3>
            <p className="amount"><span>{summary.pendingCount}</span></p>
            <small><span>{summary.pendingCount}</span> pending validations</small>
          </div>
        </section>
      </div>

      <section className="charts">
        <div className="chart-card">
          <h3>Budget Allocation by Category</h3>
          <p className="subtitle">Current spending vs allocated amounts</p>
          {/* PLACEHOLDER FOR CHART.JS */}
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f4', border: '1px dashed #ccc' }}>
            <p>Chart.js Component Here</p>
          </div>
        </div>

        <div className="chart-card">
          <h3>Monthly Spending Trend</h3>
          <p className="subtitle">Spending patterns over the last 6 months</p>
          {/* PLACEHOLDER FOR CHART.JS */}
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f4', border: '1px dashed #ccc' }}>
             <p>Chart.js Component Here</p>
          </div>
        </div>
      </section>

      <section className="budget-transactions">
        <section className="budget-section card">
          <h3>Budget Utilization by Category</h3>
          <p className="subtitle">Progress towards budget limits</p>
          <div id="budgetContainer">
            {/* DYNAMIC PROGRESS BARS MAP */}
            {utilization.length === 0 ? (
              <p>Loading utilization data...</p>
            ) : (
              utilization.map((cat, index) => {
                const percentage = cat.totalAllocated > 0 ? ((cat.totalSpent / cat.totalAllocated) * 100).toFixed(0) : 0;
                return (
                  <div className="budget-item" key={index}>
                    <div className="budget-details">
                      <span>{cat.category}</span>
                      <span>₱{cat.totalSpent.toLocaleString()} / ₱{cat.totalAllocated.toLocaleString()}</span>
                    </div>
                    <div className="progress-bar-container">
                      <div className="progress-bar" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="transactions-section card">
          <h3>Recent Transactions</h3>
          <p className="subtitle">Latest budget activities</p>
          <div id="transactionsContainer">
            {/* DYNAMIC TRANSACTIONS MAP */}
            {transactions.length === 0 ? (
              <p>No recent transactions.</p>
            ) : (
              transactions.map((tx, index) => (
                <div className="transaction-item" key={index}>
                  <div className={`icon ${tx.type.toLowerCase()}`}></div>
                  <div className="details">
                    <strong>{tx.type}: {tx.name_or_vendor}</strong>
                    <small>{tx.category} • {new Date(tx.timestamp).toLocaleDateString()}</small>
                  </div>
                  <div className="amount">₱{tx.amount.toLocaleString()}</div>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
};

export default AdminOverview;