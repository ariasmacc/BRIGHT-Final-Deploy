import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import brightLogo from '../../assets/bright-logo-v3.png';
import Footer from '../../components/layout/Footer';

const ValidatorLayout = () => {
  const navigate = useNavigate();
  
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  const [user, setUser] = useState({ name: 'User', role: 'Validator' });
  
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
          {/* Updated routing to validator overview */}
          <NavLink to="/validator/overview" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'inherit' }}>
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
            <div className={`dropdown-menu ${isUserDropdownOpen ? 'show' : ''}`} id="userDropdown">
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
        <h2>Validator Dashboard</h2>
        <p>Review budget allocations, verify expenses, and manage transaction validations</p>
      </div>

      {/* --- NAV TABS --- */}
      <nav className="nav-tabs">
        {/* Removed: Budget Allocation, Record Expenses, and User Management */}
        <NavLink to="/validator/overview" className={({ isActive }) => isActive ? 'active' : ''}>Overview</NavLink>
        <NavLink to="/validator/validation" className={({ isActive }) => isActive ? 'active' : ''}>Validation Center</NavLink>
        <NavLink to="/validator/transaction-ledger" className={({ isActive }) => isActive ? 'active' : ''}>Transaction Ledger</NavLink>
        <NavLink to="/validator/documents" className={({ isActive }) => isActive ? 'active' : ''}>Documents</NavLink>
      </nav>

      {/* --- PAGE CONTENT --- */}
      <main className="admin-main-content">
        <Outlet />
      </main>

      <Footer />

      {/* --- ACCOUNT SETTINGS MODAL --- */}
      <div className={`modal-overlay ${activeModal === 'accountSettingsModal' ? 'active' : ''}`} onClick={closeModal}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h3>Account Settings</h3>
              <p className="sub-text">Update your profile information</p>
            </div>
            <button className="close-btn" onClick={closeModal}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="input-label">Full Name</label>
              <input type="text" className="modal-input" value={user.name} readOnly />
              <p className="field-hint">Your name as it appears in the system</p>
            </div>
            <div className="form-group">
              <label className="input-label">Role</label>
              <input type="text" className="modal-input read-only" value={user.role} readOnly />
              <p className="field-hint">Your assigned administrative role</p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={closeModal} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
            <button className="btn-primary" style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Save Changes</button>
          </div>
        </div>
      </div>

      {/* --- CHANGE PASSWORD MODAL --- */}
      <div className={`modal-overlay ${activeModal === 'changePasswordModal' ? 'active' : ''}`} onClick={closeModal}>
        <div className="modal-container" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h3>Change Password</h3>
              <p className="sub-text">Secure your account with a new password</p>
            </div>
            <button className="close-btn" onClick={closeModal}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="form-group">
              <label className="input-label">Current Password</label>
              <div className="password-wrapper">
                <input 
                  type={showCurrentPass ? "text" : "password"} 
                  className="modal-input" 
                  placeholder="Enter current password" 
                />
                <span className="eye-icon" onClick={() => setShowCurrentPass(!showCurrentPass)}>
                  {showCurrentPass ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label className="input-label">New Password</label>
              <div className="password-wrapper">
                <input 
                  type={showNewPass ? "text" : "password"} 
                  className="modal-input" 
                  placeholder="Enter new password" 
                />
                <span className="eye-icon" onClick={() => setShowNewPass(!showNewPass)}>
                  {showNewPass ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label className="input-label">Confirm New Password</label>
              <div className="password-wrapper">
                <input 
                  type={showConfirmPass ? "text" : "password"} 
                  className="modal-input" 
                  placeholder="Confirm new password" 
                />
                <span className="eye-icon" onClick={() => setShowConfirmPass(!showConfirmPass)}>
                  {showConfirmPass ? '👁️' : '👁️‍🗨️'}
                </span>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={closeModal} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
            <button className="btn-primary" style={{ background: '#0f172a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Update Password</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidatorLayout;
