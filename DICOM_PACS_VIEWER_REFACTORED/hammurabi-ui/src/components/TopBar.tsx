import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

/**
 * TopBar Component:
 * - Displays the logo (linked to home).
 * - Shows a user icon that, when clicked, displays a pink dropdown containing the user's email and name,
 *   plus a "Log out" button.
 * - On "Log out" the user is redirected to AWS Cognito’s full logout endpoint (using environment variables)
 *   with the federated parameter so that the Hosted UI clears any IdP sessions.
 */
const TopBar: React.FC = () => {
  const auth = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setDropdownVisible(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build the logout URL from environment variables.
  const signOutRedirect = () => {
    const clientId = process.env.REACT_APP_COGNITO_CLIENT_ID || "";
    const logoutUri = process.env.REACT_APP_LOGOUT_URI || "";
    const cognitoDomain = process.env.REACT_APP_COGNITO_DOMAIN || "";
    // Adding &federated forces a full sign-out from federated IdPs.
    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}&federated`;
    window.location.href = logoutUrl;
  };

  // Instead of calling auth.removeUser() locally (which might not clear all cookies),
  // we simply redirect to Cognito's logout endpoint.
  const handleLogout = () => {
    signOutRedirect();
  };

  return (
    <nav className="topbar-container">
      <div className="topbar-content">
        {/* Logo linking back to home */}
        <Link to="/">
          <img className="topbar-logo" src="/assets/esaote_vector.svg" alt="Esaote Logo" />
        </Link>
        <div className="topbar-spacer" />
        {/* User icon with dropdown */}
        <div style={{ position: 'relative' }}>
          <img
            className="topbar-user-icon"
            src="/assets/user-circle-svgrepo-com.svg"
            alt="User Logo"
            onClick={toggleDropdown}
            style={{ cursor: 'pointer' }}
          />
          {dropdownVisible && (
            <div ref={dropdownRef} className="topbar-dropdown">
              <div style={{ marginBottom: '0.5rem', color: 'black' }}>
                <strong>{auth.user?.profile.email}</strong>
                <br />
                <strong>
                  {auth.user?.profile.given_name} {auth.user?.profile.family_name}
                </strong>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
