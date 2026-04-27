import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import Footer from '../../components/layout/Footer';  // Ensure this path matches your file structure

const PublicLayout = () => {
  // State to manage which modal is open
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalId) => setActiveModal(modalId);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="layout-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Section */}
      <header className="header">
        <div className="logo" id="header-logo">
          <Link 
            to="/public/overview" 
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', color: 'inherit' }}
          >
            <img src="/src/assets/bright-logo-v3.png" alt="BRIGHT" />
            <h1 style={{ margin: 0, fontSize: '1.5em', color: 'white' }}>BRIGHT</h1>
          </Link>
          <div className="staff-portal">Public Access</div>
        </div>
        <div className="user-section">
          <Link  
            to="/welcome" 
            className="logout-btn" 
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Exit
          </Link>
        </div>
      </header>

      {/* Page Title */}
      <div className="page-header">
        <h2>Public Dashboard</h2>
        <p>Transparent view of budget allocations and expenses</p>
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-tabs">
        <NavLink to="/public/overview" className={({ isActive }) => isActive ? 'active' : ''}>Overview</NavLink>
        <NavLink to="/public/ledger" className={({ isActive }) => isActive ? 'active' : ''}>Transaction Ledger</NavLink>
        <NavLink to="/public/documents" className={({ isActive }) => isActive ? 'active' : ''}>Documents</NavLink>
      </nav>

      {/* --- CONTENT AREA --- */}
      <main className="content-container" style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* --- INTEGRATED FOOTER COMPONENT --- */}
      <Footer openModal={openModal} />

      {/* --- MODALS SECTION --- */}
      {/* About BRIGHT Modal */}
      {activeModal === 'aboutBright' && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>About BRIGHT</h2>
            <p>BRIGHT (Budget Record Integrity using Generalized Hash-based Transparency) is a web-based financial management system designed to promote transparency, accountability, and data integrity.</p>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {activeModal === 'terms' && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Terms & Conditions</h2>
            <ul style={{ marginLeft: '1rem', lineHeight: '1.6' }}>
              <li>By using BRIGHT, users agree to follow all system rules on financial recording, verification, and data handling.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {activeModal === 'privacy' && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Privacy Policy</h2>
            <p>BRIGHT stores only essential information required for financial record integrity.</p>
          </div>
        </div>
      )}

      {/* Team Modal */}
      {activeModal === 'team' && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <span className="close" onClick={closeModal}>&times;</span>
            <h2>Team</h2>
            <p>BRIGHT Development Team – BSCS 3A (2026)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicLayout;
