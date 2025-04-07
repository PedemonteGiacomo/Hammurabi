// src/components/TopBar.tsx
import React from 'react';

const TopBar: React.FC = () => {
  return (
    <nav id="topbar" className="navbar navbar-expand-lg">
      <div className="container-fluid">
        {/* Esaote logo */}
        <img
          id="esaote_logo_topbar"
          src="/assets/esaote_vector.svg"
          alt="Esaote Logo"
        />

        {/* Potential brand or collapsible nav could go here */}
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          {/* HAMMURABI LOGO??? (placeholder) */}
        </div>

        {/* User icon aligned right */}
        <img
          id="user_logo_topbar"
          src="/assets/user-circle-svgrepo-com.svg"
          alt="User Logo"
          className="ms-auto"
        />
      </div>
    </nav>
  );
};

export default TopBar;
