import React, { useState, useEffect } from 'react';

const BudgetAllocation = () => {
  // --- State Hooks ---
  const [allocations, setAllocations] = useState([]);
  const [summary, setSummary] = useState({ totalBudget: 0, pendingCount: 0, approvedToday: 0, totalAllocations: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- API Base URL ---
  const API_BASE_URL = '/api';

  // --- Data Fetching ---
  const loadAllocations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/budget/allocations`);
      const data = await res.json();
      setAllocations(data || []);
    } catch (err) {
      console.error('Error loading allocations:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/budget/summary`);
      const data = await res.json();
      setSummary({
        totalBudget: data.totalBudget || 0,
        pendingCount: data.pendingCount || 0,
        approvedToday: data.approvedToday || 0,
        totalAllocations: data.totalAllocations || 0,
      });
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  };

  useEffect(() => {
    loadAllocations();
    loadSummary();
  }, []);

  // --- Handlers ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('budgetname'),
      category: formData.get('category'),
      amount: parseFloat(formData.get('amount')),
      priority: formData.get('priority'),
      description: formData.get('description'),
      businessJustification: formData.get('businessjustification'),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/budget/allocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to submit');
      alert('Budget allocation submitted!');
      e.target.reset();
      loadAllocations();
      loadSummary();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleViewDetails = async (id) => {
    setIsModalOpen(true);
    setSelectedBudget(null); // Show loading state in modal
    try {
      const res = await fetch(`${API_BASE_URL}/budget/allocations/${id}`);
      const data = await res.json();
      setSelectedBudget(data);
    } catch (err) {
      console.error('Error fetching details:', err);
    }
  };

  return (
    <main className="budget-allocation-page" style={{ padding: '20px' }}>
      <div className="newBudget">
        <h2>Budget Allocation Management</h2>
        <p className="subtitle">Create and manage budget allocations for different categories</p>

        <section className="budget-creation card">
          <div className="form-card">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="none" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: '5px' }}>
                <path d="M12 5v14m7-7H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Create New Budget Allocation
            </h3>
            <p className="form-sub">Submit a new budget allocation request for validation.</p>

            <form id="budget-allocation-form" className="budget-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="budgetname">Budget Name</label>
                <input type="text" id="budgetname" name="budgetname" placeholder="Enter Budget Name" required />
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="category">Category</label>
                  <select id="category" name="category" defaultValue="" required>
                    <option value="" disabled>Select a category</option>
                    <option value="eventsandactivities">Events & Activities</option>
                    <option value="travelandconferences">Travel & Conferences</option>
                    <option value="suppliesandmaterials">Supplies & Materials</option>
                    <option value="marketingandoutreach">Marketing & Outreach</option>
                    <option value="equipmentandtechnology">Equipment & Technology</option>
                    <option value="emergencyfund">Emergency Fund</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="amount">Amount (₱)</label>
                  <input type="number" id="amount" name="amount" placeholder="Enter Amount" step="0.01" min="0" required />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <select id="priority" name="priority" defaultValue="Normal" required>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea id="description" name="description" placeholder="Enter Description" required></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="businessjustification">Business Justification</label>
                <textarea id="businessjustification" name="businessjustification" placeholder="Enter Business Justification" required></textarea>
              </div>

              <button type="submit" className="btn-primary">Create Budget Allocation</button>
            </form>
          </div>
        </section>
      </div>

      <div className="budgetvalidation-table-section card" style={{ marginTop: '30px' }}>
        <h2>Budget Allocation</h2>
        <p className="subtitle">All budget allocations and their validation status</p>

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
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="11">Loading allocations...</td></tr>
              ) : allocations.length === 0 ? (
                <tr><td colSpan="11">No allocations found.</td></tr>
              ) : (
                allocations.map((b) => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{b.name}</td>
                    <td>Allocation</td>
                    <td>{b.category}</td>
                    <td>₱{parseFloat(b.amount).toLocaleString()}</td>
                    <td>{b.created_by || '—'}</td>
                    <td>{new Date(b.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`priority ${b.priority?.toLowerCase()}`}>
                        {b.priority || 'Normal'}
                      </span>
                    </td>
                    <td><span className="validations">{b.validations} / 2</span></td>
                    <td>
                      <button className="view-btn" onClick={() => handleViewDetails(b.id)}>View</button>
                    </td>
                    <td><span className={`status ${b.status?.toLowerCase()}`}>{b.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '20px' }}>
        <div className="mini-card">
          <h3>Total Budget</h3>
          <div className="budgetvalue">₱{summary.totalBudget.toLocaleString()}</div>
        </div>
        <div className="mini-card">
          <h3>Pending Review</h3>
          <div className="budgetvalue">{summary.pendingCount}</div>
        </div>
        <div className="mini-card">
          <h3>Approved Today</h3>
          <div className="budgetvalue">{summary.approvedToday}</div>
        </div>
        <div className="mini-card">
          <h3>Total Allocations</h3>
          <div className="budgetvalue">{summary.totalAllocations}</div>
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && (
        <div className="popup" style={{ display: 'block' }}>
          <div className="popup-content">
            <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
            {!selectedBudget ? (
              <h2>Loading Details...</h2>
            ) : (
              <>
                <h2>Budget Allocation Details: {selectedBudget.id}</h2>
                <div className="detail-section">
                  <h4>Basic Information</h4>
                  <div className="detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="detail-item"><label>Name</label><p>{selectedBudget.name}</p></div>
                    <div className="detail-item"><label>Status</label><p>{selectedBudget.status}</p></div>
                    <div className="detail-item"><label>Category</label><p>{selectedBudget.category_name}</p></div>
                    <div className="detail-item"><label>Amount</label><p>₱{selectedBudget.amount?.toLocaleString()}</p></div>
                    <div className="detail-item"><label>Priority</label><p>{selectedBudget.priority}</p></div>
                    <div className="detail-item"><label>Submitted By</label><p>{selectedBudget.submitted_by}</p></div>
                  </div>
                  <div className="detail-item" style={{ marginTop: '10px' }}><label>Description</label><p>{selectedBudget.description}</p></div>
                </div>

                <div className="detail-section">
                  <h4>Supporting Documents ({selectedBudget.documents?.length || 0})</h4>
                  <ul id="budgetDocsList" style={{ border: '1px solid #eee', padding: '10px' }}>
                    {selectedBudget.documents?.length > 0 ? (
                      selectedBudget.documents.map((doc, index) => (
                        <li key={index}>
                          📎 <a href={doc.file_path?.replace('templates', '') || '#'} target="_blank" rel="noreferrer">
                            {doc.file_name}
                          </a> ({doc.file_type})
                        </li>
                      ))
                    ) : (
                      <li>No documents attached.</li>
                    )}
                  </ul>
                </div>

                <div className="detail-section">
                  <h4>Validation History ({selectedBudget.validations_history?.length || 0})</h4>
                  <ul id="budgetValidationsList" style={{ border: '1px solid #eee', padding: '10px' }}>
                    {selectedBudget.validations_history?.length > 0 ? (
                      selectedBudget.validations_history.map((val, index) => (
                        <li key={index} className={val.decision.toLowerCase()}>
                          <strong>{val.decision}</strong> by {val.validator_name} on {new Date(val.validated_at).toLocaleString()}
                          <br /><small><i>{val.comments || 'No comments'}</i></small>
                        </li>
                      ))
                    ) : (
                      <li>No validation history yet.</li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default BudgetAllocation;