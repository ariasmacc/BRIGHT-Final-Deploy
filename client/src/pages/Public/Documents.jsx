import React, { useState } from 'react';

const Documents = () => {
  const [filter, setFilter] = useState('all');

  return (
    <main className="document-management">
      <div className="document-managemant-box">
        <h2>Document Management</h2>
        <p className="subtitle">Secure storage and verification of financial documents</p>
      </div>

      <div className="filter-tabs">
        {['all', 'Receipt', 'Invoice', 'Budget Proposal'].map(type => (
          <button 
            key={type} 
            className={filter === type ? 'active' : ''} 
            onClick={() => setFilter(type)}
          >
            {type === 'all' ? 'All Documents' : type}
          </button>
        ))}
      </div>
      
      {/* Table implementation similar to Ledger.jsx */}
    </main>
  );
};

export default Documents;