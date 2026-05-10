import React from 'react';

const PublicAccess = () => {
  return (
    <>
      {/* Header Section */}
      <header className="header">
        <div className="logo" id="header-logo">
          <a 
            href="/public/overview" 
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit' }}
          >
            <img src="../assets/bright-logo-v3" alt="BRIGHT" />
          </a>
          <div className="staff-portal">Public Access</div>
        </div>
        <div className="user-section">
          <a  
            href="/" 
            className="logout-btn" 
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="18" 
              height="18" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Exit
          </a>
        </div>
      </header>

      {/* Page Title */}
      <div className="page-header">
        <h2>Public Dashboard</h2>
        <p>Transparent view of budget allocations and expenses</p>
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <a href="/Public/PublicOverview">Overview</a>
        <a href="/Public/TL">Transaction Ledger</a>
        <a href="/Public/Docu">Documents</a>
      </nav>

      {/* About BRIGHT Modal */}
      <div id="aboutBrightModal" className="modal">
        <div className="modal-content">
          <span className="close" data-modal-close="aboutBrightModal">&times;</span>
          <h2>About BRIGHT</h2>
          <p>
            BRIGHT (Budget Record Integrity using Generalized Hash-based Transparency) is a 
            web-based financial management system designed to promote transparency, accountability, 
            and data integrity in organizational budgeting. It addresses the long-standing problems 
            of manual and error-prone record-keeping by using cryptographic hashing to secure financial 
            documents and ensure that every transaction is verifiable and tamper-proof.
          </p>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      <div id="termsModal" className="modal">
        <div className="modal-content">
          <span className="close" data-modal-close="termsModal">&times;</span>
          <h2>Terms & Conditions</h2>
          <ul style={{ marginLeft: '1rem', lineHeight: '1.6' }}>
            <li>By using BRIGHT, users agree to follow all system rules on financial recording, verification, and data handling.</li>
            <li>BRIGHT developers promote transparency and integrity, but they are not responsible for improper, unethical, or negligent system use.</li>
            <li>Administrators must approve only legitimate organization members. Approving unauthorized individuals violates system policy.</li>
            <li>Administrators are strictly prohibited from sharing their login credentials or granting system access to anyone outside the organization.</li>
            <li>Users must ensure that all uploaded documents and records are truthful, accurate, and compliant with organizational policies.</li>
            <li>Any attempt to manipulate data, bypass verification, or falsify records may result in account removal or reporting to the appropriate authority.</li>
          </ul>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <div id="privacyModal" className="modal">
        <div className="modal-content">
          <span className="close" data-modal-close="privacyModal">&times;</span>
          <h2>Privacy Policy</h2>
          <p>
            BRIGHT stores only essential information required for financial record integrity. All 
            data is protected using cryptographic hashing and is never disclosed to external entities.
          </p>
        </div>
      </div>

      {/* Team Modal */}
      <div id="aboutModal" className="modal">
        <div className="modal-content">
          <span className="close" data-modal-close="aboutModal">&times;</span>
          <h2>Team</h2>
          <p>
            BRIGHT Development Team – BSCS 3A (2026)<br />
            <span><br /> Developers: <br /></span>
            Aira Camille Banusing<br />
            Jhon Nicholson Manalang<br />
            Ianna Erin Marquez<br />
            Cyrel Yvette Morales <br />

            <br />For support: <a href="mailto:bright.system.dev@gmail.com">bright.system.dev@gmail.com</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default PublicAccess;