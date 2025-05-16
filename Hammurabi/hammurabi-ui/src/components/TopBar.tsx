import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

/**
 * TopBar Component
 * -------------------------------------------------
 * • Logo (link a “/”)
 * • Badge con la versione di build (ricavata da window._env_.BUILD_VERSION)
 * • Icona utente → dropdown con e‑mail/nome + Logout (Cognito)
 */
const TopBar: React.FC = () => {
  const auth = useAuth();

  /* -------------------------  UI state  ------------------------ */
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = () => setDropdownVisible(prev => !prev);

  /* --------------------  versione di build  -------------------- */
  // Se l’app gira in dev mode CRA inietta anche REACT_APP_VERSION
  const buildVersion =
    (window as any)._env_?.BUILD_VERSION ??
    process.env.REACT_APP_VERSION ??
    'dev';

  /* -------------  chiudi dropdown se clic fuori  --------------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ----------------------  Logout (Cognito)  ------------------- */
  const signOutRedirect = () => {
    const clientId = window._env_.REACT_APP_COGNITO_CLIENT_ID || '';
    const logoutUri = window._env_.REACT_APP_LOGOUT_URI || '';
    const cognitoDomain = window._env_.REACT_APP_COGNITO_DOMAIN || '';
    const redirectUri = window._env_.REACT_APP_COGNITO_REDIRECT_URI || '';

    const logoutUrl =
      `${cognitoDomain}/logout?client_id=${clientId}` +
      `&logout_uri=${encodeURIComponent(logoutUri)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code&federated`;
    window.location.href = logoutUrl;
  };

  const handleLogout = () => signOutRedirect();

  /* ---------------------------  JSX  --------------------------- */
  return (
    <nav className="topbar-container">
      <div className="topbar-content">
        {/* Logo */}
        <Link to="/">
          <img
            className="topbar-logo"
            src="/assets/esaote_vector.svg"
            alt="Esaote Logo"
          />
        </Link>

        {/* spacer + badge versione */}
        <div className="topbar-spacer" />
        <span className="build-badge">v{buildVersion}</span>

        {/* User icon + dropdown */}
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
