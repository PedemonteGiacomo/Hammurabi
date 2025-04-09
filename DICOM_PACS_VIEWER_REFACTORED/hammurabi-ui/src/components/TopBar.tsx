// src/components/TopBar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

/**
 * This TopBar:
 * 1. Shows your logo, linking back to "/".
 * 2. Displays a user icon that, when clicked, shows a pink dropdown.
 * 3. The dropdown has placeholders for Name, Title, and Hospital,
 *    plus a Log out button.
 */
const TopBar: React.FC = () => {
  const auth = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  // Close the dropdown if user clicks outside it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // In this example, we simply clear the local session.
    // For a full Cognito logout, you can also redirect to
    // https://<YOUR_DOMAIN>/logout?client_id=<CLIENT_ID>&logout_uri=<REDIRECT_URL>
    auth.removeUser();
    
  };

  return (
    <nav className="topbar-container">
      <div className="topbar-content">
        {/* Logo linking to home */}
        <Link to="/">
          <img className="topbar-logo" src="/assets/esaote_vector.svg" alt="Esaote Logo" />
        </Link>

        {/* Spacer pushes the user icon to the right */}
        <div className="topbar-spacer" />

        {/* User icon + pink dropdown */}
        <div style={{ position: 'relative' }}>
          <img
            className="topbar-user-icon"
            src="/assets/user-circle-svgrepo-com.svg"
            alt="User Logo"
            onClick={toggleDropdown}
            style={{ cursor: 'pointer' }}
          />

          {dropdownVisible && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                backgroundColor: '#fbd9dc', // pink background
                borderRadius: '8px',
                padding: '1rem',
                zIndex: 1000,
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                minWidth: '200px',
              }}
            >
                <div style={{ marginBottom: '0.5rem', color: 'black' }}>
                <strong>
                  {auth.user?.profile.email}
                </strong>
                <strong>
                  {auth.user?.profile.given_name} {auth.user?.profile.family_name} 
                </strong>
                </div>



              <button
                style={{
                  backgroundColor: '#464646',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '0.4rem 0.8rem',
                  cursor: 'pointer',
                }}
                onClick={handleLogout}
              >
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
