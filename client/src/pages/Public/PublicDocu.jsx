import React, { useState, useEffect } from 'react';
import '../../index.css';

const PublicDocu = () => {
  const API_BASE_URL = '/api/public';

  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const [documents, setDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // ==========================================
  // 2. EFFECT HOOK (Initial Data Load)
  // ==========================================
  useEffect(() => {
    loadDocuments();
  }, []);

  // ==========================================
  // 3. FUNCTIONS / API CALLS
  // ==========================================
  const loadDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/documents`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setDocuments(data);


      setDocuments([
      ]);
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const handleDocumentAction = (action, filePath, fileName) => {
    if (action === 'view') {
      // In a real app, adjust the path as needed
      window.open(filePath, '_blank');
    } else if (action === 'download') {
      const a = document.createElement('a');
      a.href = filePath;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // ==========================================
  // 4. COMPUTED DATA (Auto-updates when state changes)
  // ==========================================
  
  // Filter documents based on Search Term AND Active Tab
  const filteredDocuments = documents.filter(doc => {
    const docText = `${doc.file_name} ${doc.description} ${doc.related_transaction}`.toLowerCase();
    const matchesSearch = docText.includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'all' || doc.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate Summary based on ALL documents
  const summary = {
    total: documents.length,
    verified: documents.filter(d => d.status === 'Approved' || d.status === 'Verified').length,
    pending: documents.filter(d => d.status === 'Pending Review').length,
    storage: (documents.reduce((acc, d) => acc + (d.size || 0), 0) / 1024).toFixed(2)
  };

  // ==========================================
  // 5. JSX / UI RENDER
  // ==========================================
  return (
    <main className="document-management">
      <div className="document-managemant-box">
        <div className="header-row">
          <div>
            <h2>Document Management</h2>
            <p className="subtitle">Secure storage and verification of financial documents</p>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="docs-grid">
          <div className="docs-card">
            <h4>Total Documents</h4>
            <p className="docs-number">{summary.total}</p>
          </div>
          <div className="docs-card">
            <h4>Verified</h4>
            <p className="docs-number verified">{summary.verified}</p>
          </div>
          <div className="docs-card">
            <h4>Pending Review</h4>
            <p className="docs-number pending">{summary.pending}</p>
          </div>
          <div className="docs-card">
            <h4>Storage Used</h4>
            <p className="docs-number">{summary.storage} MB</p>
          </div>
          <div className="docs-card">
            <h4>Security</h4>
            <p className="docs-status">Cryptographically Secured</p>
          </div>
        </div>
      </div>

      <div className="document-repo card">
        <h3>Document Repository</h3>
        <p className="subtitle">Secure document storage with cryptographic verification</p>

        {/* SEARCH BAR */}
        <div className="search-bar">
          <svg 
            xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#7f8c8d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="search-icon"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Search documents by name, description, or transaction ID..." 
            className="search" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* FILTER TABS */}
        <div className="filter-tabs">
          <button className={activeFilter === 'all' ? 'active' : ''} onClick={() => setActiveFilter('all')}>
            All Documents ({documents.length})
          </button>
          <button className={activeFilter === 'Receipt' ? 'active' : ''} onClick={() => setActiveFilter('Receipt')}>
            Receipts ({documents.filter(d => d.type === 'Receipt').length})
          </button>
          <button className={activeFilter === 'Invoice' ? 'active' : ''} onClick={() => setActiveFilter('Invoice')}>
            Invoices ({documents.filter(d => d.type === 'Invoice').length})
          </button>
          <button className={activeFilter === 'Liquidation Report' ? 'active' : ''} onClick={() => setActiveFilter('Liquidation Report')}>
            Liquidation Reports ({documents.filter(d => d.type === 'Liquidation Report').length})
          </button>
          <button className={activeFilter === 'Budget Proposal' ? 'active' : ''} onClick={() => setActiveFilter('Budget Proposal')}>
            Budget Proposals ({documents.filter(d => d.type === 'Budget Proposal').length})
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="tablescroll">
          <table>
            <thead>
              <tr>
                <th>Document</th>
                <th>Type</th>
                <th>Size</th>
                <th>Related Transaction</th>
                <th>Category</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Hash</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.length === 0 ? (
                <tr><td colSpan="10" style={{ textAlign: 'center' }}>No documents found.</td></tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="document-cell" title={doc.description || ''}> 
                        <strong>{doc.file_name}</strong><br />
                        <small className="document-description">{doc.description || 'No description'}</small>
                    </td>
                    <td><span className="tag">{doc.type}</span></td>
                    <td>{(doc.size).toFixed(2)} KB</td>
                    <td>{doc.related_transaction}</td>
                    <td>{doc.category || 'N/A'}</td>
                    <td>{doc.uploaded_by}</td>
                    <td>{new Date(doc.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status ${doc.status?.toLowerCase().replace(' ', '-')}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="hash" title={doc.hash}>{doc.hash?.substring(0, 15)}...</td>
                    <td>
                      <button className="btn" onClick={() => handleDocumentAction('view', doc.file_path, doc.file_name)} style={{ marginRight: '5px' }}>View</button>
                      <button className="btn" onClick={() => handleDocumentAction('download', doc.file_path, doc.file_name)}>Download</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default PublicDocu;