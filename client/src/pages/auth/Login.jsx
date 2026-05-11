import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import '../../index.css'; 
import OTPVerification from './OTPVerification'; 

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Extract userId from URL if it exists
  const query = new URLSearchParams(location.search);
  const userIdFromUrl = query.get('userId');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(''); 
    
    try {
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ 
                username: username,
                password: password,
                role: role
            })
        });

        const data = await response.json();

        if (response.ok) {
            if (data.requires2FA) {
                // Store temporary info for resend logic
                sessionStorage.setItem('tempUsername', username);
                sessionStorage.setItem('tempPassword', password);
                sessionStorage.setItem('tempRole', role);
                
                // Navigate to the same page but with the userId in the query string
                // This triggers a re-render and allows OTPVerification to pick up the ID
                navigate(`/auth/login?userId=${data.userId}`, { replace: true });
            } else {
                localStorage.setItem('user', JSON.stringify(data.user));
                if (role === 'Admin') {
                    navigate('/admin/overview'); 
                } else {
                    navigate('/validator/overview');
                }
            }
        } else {
            setErrorMsg(data.error || data.msg || 'Invalid credentials. Please try again.');
        }

    } catch (err) {
        console.error('Login error:', err);
        setErrorMsg('Cannot connect to the server. Is it running?');
    } finally {
        setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setModalSuccess('');
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:3000/api/users/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();

      if (response.ok) {
        // We use the message from your backend controller
        setModalSuccess(data.message); 
      } else {
        setErrorMsg(data.error || 'Failed to request reset link.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setErrorMsg('Cannot connect to the server. Is it running?');
    } finally {
      setIsLoading(false);
    }
  };


  // IF userId is present in the URL, show OTPVerification
  if (userIdFromUrl) {
    return <OTPVerification />;
  }


  return (
    <div className="signup-body" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="signup-page-container">

        <div className="signup-info-panel">
          <div className="signup-logo">
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
            
            {/* 1. Updated onSubmit to use the new function */}
            <form onSubmit={handleForgotPassword}>
              <label>Email Address</label>
              <input 
                type="email" 
                required 
                value={forgotEmail} 
                onChange={(e) => setForgotEmail(e.target.value)} 
                placeholder="example@gmail.com"
              />
              
              {/* 2. Success and Error Message Display */}
              {modalSuccess && <div className="alert success" style={{ color: 'green', marginBottom: '10px', fontSize: '14px' }}>{modalSuccess}</div>}
              {errorMsg && <div className="alert error" style={{ color: '#dc2626', marginBottom: '10px', fontSize: '14px' }}>{errorMsg}</div>}
              
              {/* 3. Disabled button while loading */}
              <button type="submit" className="signup-btn-primary" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;