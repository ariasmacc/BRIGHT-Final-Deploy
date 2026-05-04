import React, { useState } from 'react';

const Footer = () => {
  // State lives here now, so the parent page doesn't have to worry about it
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalName) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0, 0); }} className="footer-logo">
          <img src="/src/assets/bright-logo-v3.png" alt="BRIGHT" />
          <span>BRIGHT</span>
        </a>
        
        {/* Navigation Buttons */}
        <button onClick={() => openModal('aboutBright')}>About</button>
        <button onClick={() => openModal('terms')}>Terms & Conditions</button>
        <button onClick={() => openModal('privacy')}>Privacy Policy</button>
        <button onClick={() => openModal('team')}>Team</button>
      </div>

      <hr className="footer-line" />
      <div className="footer-bottom">
        © 2025 BRIGHT System. All rights reserved.
      </div>

      {/* --- MODALS SECTION --- */}
      {activeModal && (
        <div className="modal" style={{ display: 'block', position: 'fixed', zIndex: 1000, left: 0, top: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content" style={{ backgroundColor: '#fff', margin: '10% auto', padding: '30px', width: '50%', borderRadius: '8px', position: 'relative' }}>
            <span className="close" onClick={closeModal} style={{ position: 'absolute', right: '20px', top: '10px', fontSize: '28px', cursor: 'pointer' }}>&times;</span>
            
            {activeModal === 'aboutBright' && (
              <>
                <h2>About BRIGHT</h2>
                <p>
                  BRIGHT (Budget Record Integrity using Generalized Hash-based Transparency) is a 
                  web-based financial management system designed to promote transparency, accountability, 
                  and data integrity in organizational budgeting. It addresses the long-standing problems 
                  of manual and error-prone record-keeping by using cryptographic hashing to secure financial 
                  documents and ensure that every transaction is verifiable and tamper-proof.
                </p>             
              </>
            )}

            {activeModal === 'terms' && (
              <>
                <h2>Terms & Conditions</h2>
                <ul style={{ marginLeft: '1rem', lineHeight: '1.6' }}>
                  <li>By using BRIGHT, users agree to follow all system rules on financial recording, verification, and data handling.</li>
                  <li>BRIGHT developers promote transparency and integrity, but they are not responsible for improper, unethical, or negligent system use.</li>
                  <li>Administrators must approve only legitimate organization members. Approving unauthorized individuals violates system policy.</li>
                  <li>Administrators are strictly prohibited from sharing their login credentials or granting system access to anyone outside the organization.</li>
                  <li>Users must ensure that all uploaded documents and records are truthful, accurate, and compliant with organizational policies.</li>
                  <li>Any attempt to manipulate data, bypass verification, or falsify records may result in account removal or reporting to the appropriate authority.</li>
                </ul>
              </>
            )}

            {activeModal === 'privacy' && (
              <>
                <h2>Privacy Policy</h2>
                <p>
                  BRIGHT stores only essential information required for financial record integrity. All 
                  data is protected using cryptographic hashing and is never disclosed to external entities.
                </p>              
              </>
            )}

            {activeModal === 'team' && (
              <>
                <h2>Team</h2>
                <p>BRIGHT Development Team – BSCS 3A (2026)</p>
              </>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;