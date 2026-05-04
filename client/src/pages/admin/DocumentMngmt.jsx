import React, { useState, useEffect } from 'react';

const DocumentMngmt = () => {
  const API_BASE_URL = '/api';
  const [allDocuments, setAllDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);

  //  Initial Load & Auth Check
useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      setUser(JSON.parse(userString));
    } else {
      setUser({ name: 'Admin', role: 'Admin' }); 
    }

    loadDocuments();
  }, []);

  // Data Fetching
const loadDocuments = async () => {
    try {
      const res = await fetch(`http://localhost:3000${API_BASE_URL}/documents`);
      if (!res.ok) throw new Error('Failed to fetch documents');
      const data = await res.json();
      setAllDocuments(data);
      setFilteredDocuments(data);
    } catch (err) {
      console.error('Error loading documents:', err);
      setAllDocuments([]);
      setFilteredDocuments([]);
    }
  };

  // 3. Filtering Logic
  useEffect(() => {
    const filtered = allDocuments.filter((doc) => {
      const docText = (
        (doc.file_name || '') +
        (doc.description || '') +
        (doc.related_transaction || '')
      ).toLowerCase();

      const matchesSearch = docText.includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === 'all' || doc.type === activeFilter;

      return matchesSearch && matchesFilter;
    });
    setFilteredDocuments(filtered);
  }, [searchTerm, activeFilter, allDocuments]);

  // Action Handlers
  const handleAction = (action, doc) => {
    const urlPath = doc.file_path.replace('uploads', '');
    if (action === 'view') {
      window.open(urlPath, '_blank');
    } else if (action === 'download') {
      const a = document.createElement('a');
      a.href = urlPath;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Summary Calculations
  const summary = {
    total: allDocuments.length,
    verified: allDocuments.filter(d => d.status === 'Approved' || d.status === 'Verified').length,
    pending: allDocuments.filter(d => d.status === 'Pending Review').length,
    storage: (allDocuments.reduce((acc, d) => acc + (d.size || 0), 0) / 1024).toFixed(2)
  };

  const filterOptions = ['All', 'Receipt', 'Invoice', 'Liquidation Report', 'Budget Proposal'];

  return (
    <main className="document-management">
      <div className="document-managemant-box">
        <div className="header-row">
          <div>
            <h2>Document Management</h2>
            <p className="subtitle">Secure storage and verification of financial documents</p>
          </div>
        </div>

        <div className="docs-grid">
          <div className="docs-card">
            <h4>Total Documents</h4>
            <p className="docs-number" id="doc-total">{summary.total}</p>
          </div>
          <div className="docs-card">
            <h4>Verified</h4>
            <p className="docs-number verified" id="doc-verified">{summary.verified}</p>
          </div>
          <div className="docs-card">
            <h4>Pending Review</h4>
            <p className="docs-number pending" id="doc-pending">{summary.pending}</p>
          </div>
          <div className="docs-card">
            <h4>Storage Used</h4>
            <p className="docs-number" id="doc-storage">{summary.storage} MB</p>
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

        <div className="search-bar">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#7f8c8d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className="search-icon">
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

        <div className="filter-tabs" id="doc-filter-tabs">
          {filterOptions.map(option => {
            const key = option === 'All' ? 'all' : option;
            const count = option === 'All' 
                ? allDocuments.length 
                : allDocuments.filter(d => d.type === option).length;
            
            return (
              <button 
                key={option}
                className={activeFilter === key ? 'active' : ''}
                onClick={() => setActiveFilter(key)}
              >
                {option} ({count})
              </button>
            );
          })}
        </div>

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
            <tbody id="document-table-body">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((doc, index) => (
                  <tr key={index}>
                    <td className="document-cell" title={doc.description || ''}>
                      <strong>{doc.file_name}</strong><br />
                      <small className="document-description">{doc.description || 'No description'}</small>
                    </td>
                    <td><span className="tag">{doc.type}</span></td>
                    <td>{doc.size.toFixed(2)} KB</td>
                    <td>{doc.related_transaction}</td>
                    <td>{doc.category || 'N/A'}</td>
                    <td>{doc.uploaded_by}</td>
                    <td>{new Date(doc.date).toLocaleDateString()}</td>
                    <td>
                      <span className={`status ${doc.status?.toLowerCase().replace(' ', '-')}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="hash" title={doc.hash}>
                      {doc.hash ? `${doc.hash.substring(0, 15)}...` : 'N/A'}
                    </td>
                    <td>
                      <button className="btn" onClick={() => handleAction('view', doc)}>View</button>
                      <button className="btn" onClick={() => handleAction('download', doc)}>Download</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="10">No documents found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default DocumentMngmt;