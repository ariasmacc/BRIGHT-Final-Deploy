import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import '../../index.css'; 

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(''); 
    
    // Simulate login logic with DUMMY AUTHENTICATION
    setTimeout(() => {
        setIsLoading(false);
        
        if (role === 'Admin') {
            if (username === 'SEadmin' && password === 'password123') {
                navigate('/admin/overview'); 
            } else {
                setErrorMsg('Invalid Admin username or password!');
            }
        } else if (role === 'Validator') {
            if (username === 'validator' && password === 'password123') {
                navigate('/admin/validation'); 
            } else {
                setErrorMsg('Invalid Validator username or password!');
            }
        }
    }, 1000); 
  };

  return (
    <div className="signup-body" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="signup-page-container">

        <div className="signup-info-panel">
          <div className="signup-logo">
            {/* FIX: Use Link to go back to welcome screen */}
            <Link to="/welcome" style={{ display: 'block', lineHeight: 0 }}>   
              <img src="/src/assets/bright-logo-v3.png" alt="BRIGHT Logo" style={{ height: '80px', width: 'auto', display: 'block' }} /> 
            </Link> 
            <h1 style={{ marginTop: 0, marginBottom: 0, lineHeight: 1, fontSize: '1.5em', color: 'white' }}>BRIGHT</h1>
          </div>
          <div className="login-info">
            <h2>Staff Access Portal</h2>
            <p className="signup-subtitle">Log in to manage budget allocations and validate transactions</p>
          </div>
        </div>

        <div className="signup-form-panel">
          {/* FIX: Use Link for the exit button to avoid white screens */}
          <Link to="/welcome" className="exit-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Link>
          
          <h3>Login</h3>
          <p className="card-desc">Choose your role and enter your credentials</p>

          {errorMsg && (
            <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '14px', textAlign: 'center', border: '1px solid #f87171' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <label>Role</label>
            <div className="signup-custom-dropdown">
              <button type="button" className="signup-dropdown-toggle" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {role === 'Admin' ? 'Administrator' : 'Validator'} <span className="signup-arrow">▼</span>
              </button>
              {isDropdownOpen && (
                <ul className="signup-dropdown-menu" style={{ display: 'block' }}>
                  <li onClick={() => { setRole('Admin'); setIsDropdownOpen(false); }}>Administrator</li>
                  <li onClick={() => { setRole('Validator'); setIsDropdownOpen(false); }}>Validator</li>
                </ul>
              )}
            </div>

            <label>Username</label>
            <input 
              type="text" 
              placeholder="Enter your username" 
              required 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
            />

            <label>Password</label>
            <div className="signup-password-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Enter your password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
              />
              <svg onClick={() => setShowPassword(!showPassword)} width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ cursor: 'pointer', opacity: showPassword ? 1 : 0.6 }}>
                <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="1.2"/>
              </svg>
            </div>

            <div className="login-actions">
              <button 
                type="button"
                className="muted" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, fontSize: 'inherit', color: 'inherit' }}
                onClick={() => setIsModalOpen(true)}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="signup-btn-primary" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="signup-footer" style={{ textAlign: 'center', marginTop: '20px' }}>
            No account? <Link to="/auth/signup">Sign up here</Link>
          </p>
        </div> 
      </div>

      {isModalOpen && (
        <div className="fp-modal" style={{ display: 'block' }}>
          <div className="fp-modal-content">
            <span className="fp-close" onClick={() => setIsModalOpen(false)}>&times;</span>
            <h2>Forgot Password</h2>
            <form onSubmit={(e) => { e.preventDefault(); setModalSuccess('Link sent!'); }}>
              <label>Email Address</label>
              <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
              {modalSuccess && <div className="alert success" style={{ color: 'green', marginBottom: '10px' }}>{modalSuccess}</div>}
              <button type="submit" className="signup-btn-primary">Send Reset Link</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;