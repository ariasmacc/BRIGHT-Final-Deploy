import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import brightLogo from '../../assets/bright-logo-v3.png';
import Footer from '../../components/layout/Footer';

const AdminLayout = () => {
  const navigate = useNavigate();
  
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  const [user, setUser] = useState({ name: 'User', role: 'Staff' });
  
  const dropdownRef = useRef(null);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsUserDropdownOpen(false); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Logout Handler
  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    setIsUserDropdownOpen(false);
    navigate('/auth/login'); 
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="admin-layout-wrapper">
      {/* --- HEADER --- */}
      <header className="header">
        <div className="logo" id="header-logo">
          {/* Inayos ang routing ng Logo papuntang overview */}
          <NavLink to="/admin/overview" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <img src={brightLogo} alt="BRIGHT" />
            <h1 style={{ margin: 0, fontSize: '1.5em', color: 'white' }}>BRIGHT</h1>
          </NavLink>
          <div className="staff-portal">Staff Portal</div>
        </div>

        <div className="user-section" ref={dropdownRef}>
          <div className="role">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shield-icon" style={{ width: '18px', marginRight: '5px' }}>
              <path d="M12 2l7 4v6c0 5-3.58 9.74-7 10-3.42-.26-7-5-7-10V6l7-4z" />
            </svg>
            <span id="layout-user-role">{user.role}</span>
          </div>

          <div className="user-profile-trigger" onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} style={{ cursor: 'pointer' }}>
            <div className="username">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="profile-icon" style={{ width: '20px' }}>
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span id="layout-user-name">{user.name}</span>
          </div>

          {/* User Profile Dropdown */}
          {isUserDropdownOpen && (
            <div className="dropdown-menu" id="userDropdown" style={{ display: 'block' }}>
              <div className="dropdown-header" onClick={() => setIsUserDropdownOpen(false)} style={{ cursor: 'pointer' }}>My Account</div>
              <button className="dropdown-item" onClick={() => {setActiveModal('accountSettingsModal'); setIsUserDropdownOpen(false);}}>
                Account Settings
              </button>
              <button className="dropdown-item" onClick={() => {setActiveModal('changePasswordModal'); setIsUserDropdownOpen(false);}}>
                Change Password
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* --- DASHBOARD HEADER --- */}
      <div className="page-header">
        <h2>Staff Dashboard</h2>
        <p>Manage budget allocations, record expenses, and validate transactions</p>
      </div>

      {/* --- NAV TABS --- */}
      <nav className="nav-tabs">
        <NavLink to="/admin/overview" className={({ isActive }) => isActive ? 'active' : ''}>Overview</NavLink>
        <NavLink to="/admin/budget-allocation" className={({ isActive }) => isActive ? 'active' : ''}>Budget Allocation</NavLink>
        <NavLink to="/admin/record-expense" className={({ isActive }) => isActive ? 'active' : ''}>Record Expenses</NavLink>
        <NavLink to="/admin/validation" className={({ isActive }) => isActive ? 'active' : ''}>Validation Center</NavLink>
        <NavLink to="/admin/user-management" className={({ isActive }) => isActive ? 'active' : ''}>User Management</NavLink>
        <NavLink to="/admin/transaction-ledger" className={({ isActive }) => isActive ? 'active' : ''}>Transaction Ledger</NavLink>
        <NavLink to="/admin/documents" className={({ isActive }) => isActive ? 'active' : ''}>Documents</NavLink>
      </nav>

      {/* --- PAGE CONTENT --- */}
      <main className="admin-main-content">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default AdminLayout;