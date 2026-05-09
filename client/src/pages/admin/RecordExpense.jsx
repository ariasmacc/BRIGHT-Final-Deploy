import React, { useState, useEffect } from 'react';

const RecordExpense = () => {

  // --- State Management ---
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    pendingReview: 0,
    approvedToday: 0,
    documentsUploaded: 0,
  });
  const [dropdowns, setDropdowns] = useState({ budgets: [], categories: [] });
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false);

  // --- Initial Data Fetching ---
  useEffect(() => {
    loadExpenses();
    loadExpenseSummary();
    loadDropdowns();
  }, []);
// --- Updated API Base URL ---
  const API_BASE_URL = 'http://localhost:3000/api'; 

  // --- Updated Data Fetching ---
  const loadExpenses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses`, {
        credentials: 'include' // <--- ADD THIS
      });
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data = await res.json();
      setExpenses(data);
    } catch (err) {
      console.error('Error loading expenses:', err);
    }
  };

  const loadExpenseSummary = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/summary`, {
        credentials: 'include' // <--- ADD THIS
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Error loading summary:', err);
    }
  };

  const loadDropdowns = async () => {
    try {
      const [budgetRes, catRes] = await Promise.all([
        fetch(`${API_BASE_URL}/budget/allocations`, { credentials: 'include' }),
        fetch(`${API_BASE_URL}/categories`, { credentials: 'include' })
      ]);

      if (budgetRes.ok && catRes.ok) {
        const budgets = await budgetRes.json();
        const categories = await catRes.json();

        // LOGIC CHECK: 
        // We only show 'Approved' budgets because you can't spend money 
        // that hasn't been validated yet.
        const approvedBudgets = budgets.filter(b => b.status === 'Approved');
        
        console.log("Found Approved Budgets:", approvedBudgets.length);

        setDropdowns({
          budgets: approvedBudgets,
          categories: categories.filter(c => c.name !== 'Budget' && c.name !== 'Reports')
        });
      }
    } catch (err) {
      console.error('Error loading dropdowns:', err);
    }
  };
  // --- Form & File Handlers ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData();

    formData.append('name', form.name.value);
    formData.append('budgetName', form.budgetName.value);
    formData.append('amount', parseFloat(form.amount.value));
    formData.append('budgetCategory', form.budgetCategory.value);
    formData.append('expenseDate', form['expense-date'].value);
    formData.append('vendor', form.vendor.value);
    formData.append('description', form.description.value);
    formData.append('receiptNumber', form['receipt-number'].value);
    formData.append('documentType', form['document-type'].value);

    selectedFiles.forEach(file => {
      formData.append('supportingDocuments', file);
    });

    try {
      const res = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      if (!res.ok) throw new Error('Failed to submit');
      
      alert('Expense recorded!');
      form.reset();
      setSelectedFiles([]);
      loadExpenses();
      loadExpenseSummary();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  // --- Modal Logic ---
  const openExpenseModal = async (id) => {
    setIsModalOpen(true);
    setLoadingModal(true);
    try {
      const res = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setModalData(data);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoadingModal(false);
    }
  };

  const closeExpenseModal = () => {
    setIsModalOpen(false);
    setModalData(null);
  };

  // SVGs
  const clipIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
      <path d="M14.5 5.5v9a4.5 4.5 0 1 1-9 0V5a3 3 0 0 1 6 0v8a1.5 1.5 0 1 1-3 0V6.5" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <main className="expense-page">
      <div className="expense-recording-page">
        <h2>Expense Recording</h2>
        <p className="subtitle">Record and submit expenses with supporting documentation</p>

        <section className="expense-recording card">
          <div className="form-card">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 24 24" style={{ verticalAlign: 'middle', marginRight: '2px' }}>
                <path d="M3 6h18v12H3V6zm2 2v8h14V8H5zm3 4a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
              </svg>
              Record New Expense
            </h3>
            <p className="form-sub">Submit an expense with receipts and documentation for validation</p>

            <form id="expense-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="budgetName">Budget Name *</label>
                  <select id="budgetName" name="budgetName" required defaultValue="">
                    <option value="" disabled hidden>Select budget name</option>
                    {dropdowns.budgets.map(b => (
                      <option key={b.id} value={b.id}>{b.name} (₱{b.amount.toLocaleString()})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="name">Expense Name *</label>
                  <input type="text" id="name" name="name" placeholder="E.g., Team Lunch, Plane Tickets" required />
                </div>
                <div className="form-group">
                  <label htmlFor="budgetCategory">Budget Category *</label>
                  <select id="budgetCategory" name="budgetCategory" required defaultValue="">
                    <option value="" disabled hidden>Select budget category</option>
                    {dropdowns.categories.map(c => (
                      <option key={c.category_id} value={c.category_id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="amount">Amount (PHP) *</label>
                  <input type="number" id="amount" name="amount" placeholder="0.00" step="0.01" required />
                </div>
                <div className="form-group">
                  <label htmlFor="vendor">Vendor *</label>
                  <input type="text" id="vendor" name="vendor" placeholder="Enter vendor name" required />
                </div>
                <div className="form-group">
                  <label htmlFor="expense-date">Expense Date *</label>
                  <input type="date" id="expense-date" name="expense-date" required />
                </div>
                <div className="form-group">
                  <label htmlFor="receipt-number">Receipt/Invoice Number *</label>
                  <input type="text" id="receipt-number" name="receipt-number" placeholder="Enter receipt or invoice number" />
                </div>
                <div className="form-group">
                  <label htmlFor="document-type">Document Type</label>
                  <select id="document-type" name="document-type" defaultValue="Receipt">
                    <option value="Receipt">Receipt</option>
                    <option value="Invoice">Invoice</option>
                    <option value="Quotation">Quotation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label htmlFor="description">Description *</label>
                  <textarea id="description" name="description" placeholder="Describe the expense..." required></textarea>
                </div>
                <div className="form-group full-width">
                  <label>Supporting Documents</label>
                  <div 
                    className="upload-box" 
                    id="upload-area" 
                    onClick={() => document.getElementById('file-input').click()}
                    onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = '#f0f0f0'; }}
                    onDragLeave={(e) => { e.currentTarget.style.backgroundColor = ''; }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.style.backgroundColor = '';
                      const files = Array.from(e.dataTransfer.files);
                      setSelectedFiles(prev => [...prev, ...files]);
                    }}
                  >
                    <p>
                      {clipIcon}
                      Click to upload or drag and drop<br /><small>PDF, JPG, PNG up to 10MB each</small>
                    </p>
                    <input 
                      type="file" 
                      id="file-input" 
                      name="supportingDocuments" 
                      multiple 
                      style={{ display: 'none' }} 
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div id="file-list">
                    {selectedFiles.map((file, index) => (
                      <div className="file-item" key={index}>
                        <span>{clipIcon} {file.name}</span>
                        <button type="button" className="remove-file" onClick={() => removeFile(index)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <button type="submit" className="btn-primary">Record Expense</button>
            </form>
          </div>
        </section>
      </div>

      <section className="expense-records card">
        <h2>Expense Records</h2>
        <p className="subtitle">All recorded expenses and their validation status</p>
        <div className="table-container">
          <div className="tablescroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Budget Name</th><th>Category</th><th>Amount</th>
                  <th>Vendor</th><th>Date</th><th>Documents</th><th>Validations</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody id="expense-table-body">
                {expenses.length > 0 ? (
                  expenses.map(exp => (
                    <tr key={exp.id}>
                      <td>{exp.id}</td>
                      <td>{exp.name}</td>
                      <td>{exp.budget_name}</td>
                      <td>{exp.category}</td>
                      <td>₱{exp.amount.toLocaleString()}</td>
                      <td>{exp.vendor}</td>
                      <td>{new Date(exp.date).toLocaleDateString()}</td>
                      <td>{clipIcon} {exp.documents_count}</td>
                      <td>{exp.validations} / 2</td>
                      <td><span className={`status ${exp.status?.toLowerCase()}`}>{exp.status}</span></td>
                      <td><button className="view-btn" onClick={() => openExpenseModal(exp.id)}>View</button></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="11">Loading expenses...</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal / Popup */}
      <div id="expenseDetailPopup" className="popup" style={{ display: isModalOpen ? 'block' : 'none' }}>
        <div className="popup-content">
          <span className="close" onClick={closeExpenseModal}>&times;</span>
          <h2>Expense Details: <span id="modalExpenseId">{modalData?.id || 'N/A'}</span></h2>
          {loadingModal ? (
            <p>Loading details...</p>
          ) : (
            <>
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item"><label>Name</label><p id="modalExpenseName">{modalData?.name || '-'}</p></div>
                  <div className="detail-item"><label>Status</label><p id="modalExpenseStatus">{modalData?.status || '-'}</p></div>
                  <div className="detail-item"><label>Budget</label><p id="modalExpenseBudget">{modalData?.budget_name || '-'}</p></div>
                  <div className="detail-item"><label>Category</label><p id="modalExpenseCategory">{modalData?.category || '-'}</p></div>
                  <div className="detail-item"><label>Amount</label><p id="modalExpenseAmount">₱{modalData?.amount?.toLocaleString() || 0}</p></div>
                  <div className="detail-item"><label>Vendor</label><p id="modalExpenseVendor">{modalData?.vendor || '-'}</p></div>
                  <div className="detail-item"><label>Expense Date</label><p id="modalExpenseDate">{modalData?.expense_date ? new Date(modalData.expense_date).toLocaleDateString() : '-'}</p></div>
                  <div className="detail-item"><label>Submitted By</label><p id="modalExpenseSubmitter">{modalData?.submitted_by || '-'}</p></div>
                </div>
                <div className="detail-item"><label>Description</label><p id="modalExpenseDescription">{modalData?.description || '-'}</p></div>
                <div className="detail-item"><label>Receipt/Invoice #</label><p id="modalExpenseReceiptNum">{modalData?.receipt_number || '-'}</p></div>
              </div>
              <div className="detail-section">
                <h4>Supporting Documents (<span id="modalDocCount">{modalData?.documents?.length || 0}</span>)</h4>
                <ul id="expenseDocsList">
                  {modalData?.documents?.length > 0 ? (
                    modalData.documents.map((doc, i) => (
                      <li key={i}>
                        📎 <a href={doc.file_path?.replace('uploads', '') || '#'} target="_blank" rel="noreferrer">{doc.file_name}</a> 
                        ({doc.file_type}, {(doc.file_size_kb || 0).toFixed(1)}KB)
                      </li>
                    ))
                  ) : (
                    <li>No documents attached.</li>
                  )}
                </ul>
              </div>
              <div className="detail-section">
                <h4>Validation History (<span id="modalValidationCount">{modalData?.validations_history?.length || 0}</span>)</h4>
                <ul id="expenseValidationsList">
                  {modalData?.validations_history?.length > 0 ? (
                    modalData.validations_history.map((val, i) => (
                      <li key={i} className={val.decision.toLowerCase()}>
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

      <div className="summary-cards">
        <div className="mini-card"><h3>Total Expenses</h3><p id="total-expenses">₱{summary.totalExpenses?.toLocaleString() || 0}</p></div>
        <div className="mini-card"><h3>Pending Review</h3><p id="pending-review">{summary.pendingReview || 0}</p></div>
        <div className="mini-card"><h3>Approved Today</h3><p id="approved-today">{summary.approvedToday || 0}</p></div>
        <div className="mini-card"><h3>Documents Uploaded</h3><p id="documents-uploaded">{summary.documentsUploaded || 0}</p></div>
      </div>
    </main>
  );
};

export default RecordExpense;