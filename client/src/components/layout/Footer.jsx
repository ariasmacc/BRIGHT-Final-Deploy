import React from 'react';

const Footer = ({ openModal }) => {
  return (
    <footer className="footer">
      <div className="footer-links">
        <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo(0,0); }} className="footer-logo">
          <img src="src/assets/bright-logo-v3.png"  />
          <span>BRIGHT</span>
        </a>
        <button onClick={() => openModal('aboutBright')}>About</button>
        <button onClick={() => openModal('terms')}>Terms & Conditions</button>
        <button onClick={() => openModal('privacy')}>Privacy Policy</button>
        <button onClick={() => openModal('team')}>Team</button>
      </div>
      <hr className="footer-line" />
      <div className="footer-bottom">
        © 2025 BRIGHT System. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;