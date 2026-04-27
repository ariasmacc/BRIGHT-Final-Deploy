import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();
  
  // State for UI Toggles
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); 
  const [user, setUser] = useState({ name: 'User', role: 'Staff' });

  // Password Visibility States
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Sync with LocalStorage for User Info
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

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('user');
    navigate('/login');
  };

  const closeModal = () => setActiveModal(null);

  return (
    <div className="admin-layout-wrapper">
      {/* --- HEADER --- */}
      <header className="header">
        <div className="logo" id="header-logo">
          <NavLink to="/admin/AdminOverview" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', color: 'inherit' }}>
            <img src="../assets/bright-logo-v3" alt="BRIGHT" />
          </NavLink>
          <div className="staff-portal">Staff Portal</div>
        </div>

        <div className="user-section">
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
              <div className="dropdown-header">My Account</div>
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
        <NavLink to="/admin/AdminOverview">Overview</NavLink>
        <NavLink to="/admin/BudgetAllocation">Budget Allocation</NavLink>
        <NavLink to="/admin/RecordExpense">Record Expenses</NavLink>
        <NavLink to="/admin/ValidationCenter">Validation Center</NavLink>
        <NavLink to="/admin/UserMngmt">User Management</NavLink>
        <NavLink to="/admin/TransactionLedger">Transaction Ledger</NavLink>
        <NavLink to="/admin/Docu">Documents</NavLink>
      </nav>

      {/* --- PAGE CONTENT --- */}
      <main className="admin-main-content">
        <Outlet />
      </main>

      {/* --- FOOTER TRIGGERS --- */}
      <footer style={{ textAlign: 'center', padding: '20px', fontSize: '0.8rem', color: '#7f8c8d' }}>
          <span onClick={() => setActiveModal('aboutBrightModal')} style={{cursor: 'pointer'}}>About BRIGHT</span> | 
          <span onClick={() => setActiveModal('termsModal')} style={{cursor: 'pointer', margin: '0 10px'}}>Terms</span> | 
          <span onClick={() => setActiveModal('privacyModal')} style={{cursor: 'pointer', marginRight: '10px'}}>Privacy</span> |
          <span onClick={() => setActiveModal('aboutModal')} style={{cursor: 'pointer'}}>Team</span>
      </footer>

      {/* --- MODALS --- */}

      {/* Account Settings Modal */}
      {activeModal === 'accountSettingsModal' && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-container">
            <div className="modal-header">
              <div>
                <h3>Account Settings</h3>
                <p className="sub-text">Update your account information</p>
              </div>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <form id="account-settings-form">
              <div className="modal-body">
                <label className="input-label">Full Name</label>
                <input type="text" className="modal-input" defaultValue={user.name} />
                <label className="input-label">Username</label>
                <input type="text" className="modal-input" />
                <label className="input-label">Email Address</label>
                <input type="email" className="modal-input" />
                <label className="input-label">Position</label>
                <input type="text" className="modal-input" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-save">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {activeModal === 'changePasswordModal' && (
        <div className="modal-overlay" style={{ display: 'flex' }}>
          <div className="modal-container">
            <div className="modal-header">
              <h3>Change Password</h3>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>
            <form className="modal-body">
              <label className="input-label">Current Password</label>
              <input type={showCurrentPass ? "text" : "password"} className="modal-input" />
              <label className="input-label">New Password</label>
              <input type={showNewPass ? "text" : "password"} className="modal-input" />
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-save">Update Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* About / Terms / Privacy / Team Modals */}
      {['aboutBrightModal', 'termsModal', 'privacyModal', 'aboutModal'].includes(activeModal) && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: '#fff', margin: '10% auto', padding: '30px', width: '50%', borderRadius: '8px', position: 'relative' }}>
            <span className="close" onClick={closeModal} style={{ position: 'absolute', right: '20px', top: '10px', fontSize: '28px', cursor: 'pointer' }}>&times;</span>
            
            {activeModal === 'aboutBrightModal' && (
              <><h2>About BRIGHT</h2><p>BRIGHT (Budget Record Integrity using Generalized Hash-based Transparency) is a web-based financial management system designed to promote transparency...</p></>
            )}
            {activeModal === 'termsModal' && (
              <><h2>Terms & Conditions</h2><ul style={{textAlign: 'left', marginLeft: '20px'}}><li>By using BRIGHT, users agree to follow all system rules on financial recording...</li><li>Administrators must approve only legitimate organization members.</li></ul></>
            )}
            {activeModal === 'privacyModal' && (
              <><h2>Privacy Policy</h2><p>BRIGHT stores only essential information required for financial record integrity. All data is protected using cryptographic hashing...</p></>
            )}
            {activeModal === 'aboutModal' && (
              <><h2>Team</h2><p>BRIGHT Development Team – BSCS 3A (2025)<br/><br/><strong>Project Manager:</strong> Erik James Medallada<br/><strong>Frontend:</strong> Ianna Erin Marquez, Cyrel Yvette Morales<br/><strong>Backend:</strong> Carla Mae Cardano, Jackielyn Lariestan</p></>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;