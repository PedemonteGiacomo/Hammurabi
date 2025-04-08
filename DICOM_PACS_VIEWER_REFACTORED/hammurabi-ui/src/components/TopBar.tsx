// src/components/TopBar.tsx
import React from 'react';

const TopBar: React.FC = () => {
  return (
    <nav className="topbar-container">
      <div className="topbar-content">
        {/* For Esaote logo: `esaote.svg` */}
        <img className="topbar-logo" src="/assets/esaote_vector.svg" alt="Esaote Logo" />
        <div className="topbar-spacer" />
        {/* If you have a user icon: e.g. user-circle-svgrepo-com.svg */}
        <img
          className="topbar-user-icon"
          src="/assets/user-circle-svgrepo-com.svg"
          alt="User Logo"
        />
      </div>
    </nav>
  );
};

export default TopBar;
