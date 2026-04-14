import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Modal from '../components/Modal';

const PublicLayout = () => {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (id) => setActiveModal(id);
  const closeModal = () => setActiveModal(null);

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header">
        <div className="logo">
          <Link to="/public/overview" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
            <img src="/asset/gdg.png" alt="GDG Logo" />
          </Link>
          <div className="staff-portal">Public Access</div>
        </div>
        <div className="user-section">
          <Link to="/" className="logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Exit
          </Link>
        </div>
      </header>

      <div className="page-header">
        <h2>Public Dashboard</h2>
        <p>Transparent view of budget allocations and expenses</p>
      </div>

      {/* TABS NAVIGATION */}
      <nav className="nav-tabs">
        <NavLink to="/public/overview" className={({ isActive }) => isActive ? "active" : ""}>Overview</NavLink>
        <NavLink to="/public/ledger" className={({ isActive }) => isActive ? "active" : ""}>Transaction Ledger</NavLink>
        <NavLink to="/public/documents" className={({ isActive }) => isActive ? "active" : ""}>Documents</NavLink>
      </nav>

      {/* DYNAMIC CONTENT AREA */}
      <main className="dashboard">
        <Outlet context={{ openModal }} /> 
      </main>

      {/* FOOTER */}
      <Footer openModal={openModal} />

      {/* MODALS (Rendered conditionally) */}
      {activeModal && <Modal type={activeModal} close={closeModal} />}
    </div>
  );
};

export default PublicLayout;