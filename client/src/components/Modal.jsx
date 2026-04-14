import React from 'react';

const Modal = ({ type, close }) => {
  const content = {
    aboutBright: {
      title: "About BRIGHT",
      body: "BRIGHT (Budget Record Integrity using Generalized Hash-based Transparency) is a web-based financial management system designed to promote transparency, accountability, and data integrity in organizational budgeting."
    },
    terms: {
      title: "Terms & Conditions",
      body: (
        <ul style={{ paddingLeft: '20px' }}>
          <li>By using BRIGHT, users agree to follow all system rules.</li>
          <li>Developers are not responsible for improper system use.</li>
          <li>Administrators must approve only legitimate members.</li>
        </ul>
      )
    },
    privacy: {
      title: "Privacy Policy",
      body: "BRIGHT stores only essential information required for financial record integrity. All data is protected using cryptographic hashing."
    },
    team: {
      title: "Team",
      body: "BRIGHT Development Team – BSCS 3A (2025). Project Manager: Erik James Medallada. Frontend: Ianna Erin Marquez & Cyrel Yvette Morales."
    }
  };

  const active = content[type];

  return (
    <div className="modal" style={{ display: 'flex' }} onClick={close}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={close}>&times;</span>
        <h2>{active.title}</h2>
        <div style={{ marginTop: '15px' }}>{active.body}</div>
      </div>
    </div>
  );
};

export default Modal;