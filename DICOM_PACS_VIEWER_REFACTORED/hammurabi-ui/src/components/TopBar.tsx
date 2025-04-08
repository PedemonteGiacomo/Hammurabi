// src/components/TopBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const TopBar: React.FC = () => {
  return (
    <nav className="topbar-container">
      <div className="topbar-content">
        {/* Wrap the logo in a Link to return to the home route */}
        <Link to="/">
          <img className="topbar-logo" src="/assets/esaote_vector.svg" alt="Esaote Logo" />
        </Link>
        <div className="topbar-spacer" />
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
