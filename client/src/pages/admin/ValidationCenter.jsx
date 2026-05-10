import React, { useState, useEffect } from 'react';
import '../../index.css';

const ValidationCenter = () => {
  const API_BASE_URL = '/api'; 

  const [queue, setQueue] = useState([]);
  const [summary, setSummary] = useState({
    pendingCount: 'Loading...',
    highPriorityCount: 'Loading...',
    validatedThisMonth: 'Loading...',
    readyForApproval: 'Loading...'
  });
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Popup States
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [comments, setComments] = useState('');

  useEffect(() => {
    loadQueue();
    loadSummary();
  }, []);

  const loadQueue = async () => {
    try {
      const res = await fetch(`http://localhost:3000${API_BASE_URL}/validation/queue`); 
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setQueue(data);
    } catch (err) {
      console.error('Error loading validation queue:', err);
    }
  };

  const loadSummary = async () => {
    try {
      const res = await fetch(`http://localhost:3000${API_BASE_URL}/validation/summary`);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error('Error loading validation summary:', err);
      setSummary({
        pendingCount: '0',
        highPriorityCount: '0',
        validatedThisMonth: '0',
        readyForApproval: '0'
      });
    }
  };

  const openValidationPopup = (item) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const closeValidationPopup = () => {
    setIsPopupOpen(false);
    setComments('');
    setSelectedItem(null);
  };

  const submitDecision = async (decision) => {
    if (!comments.trim()) {
      alert('Please provide validation comments.');
      return;
    }
    alert(`Item ${decision.toLowerCase()} successfully!`);
    closeValidationPopup();
  };

  return (
    <main className="expense-page">
      <div className="expense-recording-page">
        <h2>Validation Center</h2>
        <p className="subtitle">Review and validate budget allocations and expenses</p>
      </div>

      <section className="summary-cards" style={{ marginBottom: '30px' }}>
        <div className="over-card">
          <h3>Pending Validations</h3>
          <p className="amount" style={{ color: '#f39c12' }}><span>{summary.pendingCount}</span></p>
          <small>Awaiting review</small>
        </div>
        <div className="over-card">
          <h3>High Priority</h3>
          <p className="amount highlight"><span>{summary.highPriorityCount}</span></p>
          <small>Urgent attention needed</small>
        </div>
        <div className="over-card">
          <h3>Validated</h3>
          <p className="amount green"><span>{summary.validatedThisMonth}</span></p>
          <small>This month</small>
        </div>
        <div className="over-card">
          <h3>Ready for Approval</h3>
          <p className="amount" style={{ color: '#3498db' }}><span>{summary.readyForApproval}</span></p>
          <small>Pending final approval</small>
        </div>
      </section>

      <div className="budgetvalidation-table-section card">
        <div className="table-header">
          <div className="table-header-group">
            <h2>Validation Queue</h2>
            <p>Items awaiting validation and approval</p>
          </div>

          <div className="validation-tabs">
            <div className="tabs-container">
              <button className={`tab ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
                All Pending <span className="count-badge">0</span>
              </button>
              <button className={`tab ${activeFilter === 'Allocation' ? 'active' : ''}`} onClick={() => setActiveFilter('Allocation')}>
                Budget Allocations <span className="count-badge">0</span>
              </button>
              <button className={`tab ${activeFilter === 'Expense' ? 'active' : ''}`} onClick={() => setActiveFilter('Expense')}>
                Expenses <span className="count-badge">0</span>
              </button>
              <button className={`tab ${activeFilter === 'High' ? 'active' : ''}`} onClick={() => setActiveFilter('High')}>
                High Priority <span className="count-badge">0</span>
              </button>
            </div>
          </div>
        </div>
      
        <div className="tablescroll">
          <table className="budgetvalidation">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Submitted By</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Validations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {queue.length === 0 ? (
                <tr><td colSpan="10">Loading validation queue... (No data yet)</td></tr>
              ) : (
                queue.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    {/* ... other table data here ... */}
                    <td>
                      <button className="validate-btn" onClick={() => openValidationPopup(item)}>
                        Validate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POPUP MODAL */}
      {isPopupOpen && (
        <div className="popup" style={{ display: 'block' }}>
          <div className="popup-content">
            <span className="close" onClick={closeValidationPopup}>&times;</span>
            <h2>Validation Review: <span>{selectedItem?.id || 'N/A'}</span></h2>
            
            <div className="validation-form">
              <label htmlFor="validationComments">Validation Comments *</label>
              <textarea 
                id="validationComments" 
                placeholder="Provide validation comments and reasoning..." 
                rows="4" 
                required
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              ></textarea>
              
              <div className="validation-actions">
                <button type="button" className="btn-reject" onClick={() => submitDecision('Rejected')}>Reject</button>
                <button type="button" className="btn-approve" onClick={() => submitDecision('Approved')}>Approve</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ValidationCenter;