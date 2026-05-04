import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OTPVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [message, setMessage] = useState({ text: 'Verification code sent to email.', type: 'info' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();

    const API_BASE_URL = '/api'; 

    // Extract userId from URL on mount
    const query = new URLSearchParams(location.search);
    const userId = query.get('userId');

    useEffect(() => {
        if (!userId) {
            alert("Error: User ID missing. Please log in again.");
            navigate('/login');
        }
        // Focus first input on mount
        if (inputRefs.current[0]) inputRefs.current[0].focus();
    }, [userId, navigate]);

    // Handle digit input
    const handleChange = (e, index) => {
        const value = e.target.value;
        if (!/^\d*$/.test(value)) return; // Only allow numbers

        const newOtp = [...otp];
        // Take only the last character if user types over
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    // Handle Backspace
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    // Handle Paste
    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData('text').trim();
        if (!/^\d{6}$/.test(data)) return;

        const digits = data.split('');
        setOtp(digits);
        inputRefs.current[5].focus();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');

        if (otpCode.length < 6) {
            setMessage({ text: 'Please enter the complete 6-digit code.', type: 'error' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ text: '', type: 'info' });

        try {
            const response = await fetch(`${API_BASE_URL}/users/verify-2fa`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, twoFACode: otpCode }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Verification failed.');

            // Success logic
            sessionStorage.removeItem('tempUsername');
            sessionStorage.removeItem('tempPassword');
            sessionStorage.removeItem('tempRole');
            localStorage.setItem('user', JSON.stringify(data.user));
            navigate('/admin/overview');

        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0].focus();
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async (e) => {
        e.preventDefault();
        setIsResending(true);
        setMessage({ text: '', type: 'info' });

        const username = sessionStorage.getItem('tempUsername');
        const password = sessionStorage.getItem('tempPassword');
        const role = sessionStorage.getItem('tempRole');

        if (!username || !password) {
            setMessage({ text: 'Session expired. Please log in again.', type: 'error' });
            setIsResending(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, role }),
            });

            const data = await response.json();
            if (!response.ok || !data.requires2FA) throw new Error(data.error || 'Resend failed.');

            setMessage({ text: 'New verification code sent! Check your email.', type: 'success' });
        } catch (error) {
            setMessage({ text: error.message, type: 'error' });
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="signup-body-wrapper">
            <div className="signup-page-container">
                {/* Left Panel */}
                <div className="signup-info-panel">
                    <div className="signup-logo">
                        <img src="bright-logo-v3.png" alt="BRIGHT Logo" />
                        <h1 className="logo-text">BRIGHT</h1>
                    </div>
                    <div className="login-info">
                        <h2>Staff Access Portal</h2>
                        <p className="signup-subtitle">
                            Budget Record Integrity using Generalized Hash-based Transparency
                        </p>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="signup-form-panel">
                    <h3>Verify with OTP</h3>
                    <p className="card-desc">
                        To ensure your security, please enter the One-Time Password (OTP) sent to your registered email.
                    </p>

                    <form onSubmit={handleSubmit}>
                        {message.text && (
                            <div 
                                className="otp-message" 
                                style={{ color: message.type === 'error' ? '#e74c3c' : '#27ae60' }}
                            >
                                {message.text}
                            </div>
                        )}

                        <div className="otp-input-group" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength="1"
                                    inputMode="numeric"
                                    pattern="[0-9]"
                                    value={digit}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    required
                                />
                            ))}
                        </div>

                        <div className="resend-link">
                            Didn't receive the OTP?{' '}
                            <button 
                                type="button" 
                                onClick={handleResend} 
                                disabled={isResending}
                                className="resend-button"
                            >
                                {isResending ? 'Resending...' : 'Resend'}
                            </button>
                        </div>

                        <div className="btn-container">
                            <button type="submit" className="otp-btn-primary" disabled={isSubmitting}>
                                {isSubmitting ? 'Verifying...' : 'Submit'}
                            </button>
                            <button 
                                type="button" 
                                className="otp-btn-outline" 
                                onClick={() => navigate('/login')}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OTPVerification;