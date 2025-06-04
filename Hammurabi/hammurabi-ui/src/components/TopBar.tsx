/* ------------------------------------------------------------------ */
/*  TopBar.tsx – full-props version                                  */
/* ------------------------------------------------------------------ */
import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

export interface TopBarProps {
  /* ----------- element visibility ----------- */
  showLogo?: boolean;
  showVersion?: boolean;

  /** User menu style:
   *  • "full"        → icon + dropdown with email and name
   *  • "dropdown"    → icon + dropdown with email only
   *  • "icon-only"   → icon only, no dropdown
   */
  userMenuStyle?: 'full' | 'dropdown' | 'icon-only';

  /* --------------- asset overrides ------------- */
  logoSrc?: string;
  userIconSrc?: string;

  /* --------------- other overrides ------------- */
  logoLinkUrl?: string;
  buildVersionOverride?: string;
  className?: string;
  style?: React.CSSProperties;

  /** Custom logout callback (default = Cognito redirect) */
  onLogout?: () => void;

  /** Slot for extra elements (e.g. buttons) */
  rightSlot?: ReactNode;
}

const TopBar: React.FC<TopBarProps> = ({
  showLogo = true,
  showVersion = true,
  userMenuStyle = 'full',
  logoSrc = '/assets/esaote_vector.svg',
  userIconSrc = '/assets/user-circle-svgrepo-com.svg',
  logoLinkUrl = '/',
  buildVersionOverride,
  className,
  style,
  onLogout,
  rightSlot,
}) => {
  const auth = useAuth();

  /* -------------------------  UI state  ------------------------ */
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = () => {
    if (userMenuStyle !== 'icon-only') setDropdownVisible((prev) => !prev);
  };

  /* --------------------  build version  -------------------- */
  const buildVersion =
    buildVersionOverride ??
    (window as any)._env_?.BUILD_VERSION ??
    process.env.REACT_APP_VERSION ??
    'dev';

  /* -------------  close dropdown on outside click  --------------- */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ----------------------  Logout (Cognito)  ------------------- */
  const signOutRedirect = () => {
    const env = (window as any)._env_ ?? {};
    const clientId = env.REACT_APP_COGNITO_CLIENT_ID || '';
    const logoutUri = env.REACT_APP_LOGOUT_URI || '';
    const cognitoDomain = env.REACT_APP_COGNITO_DOMAIN || '';
    const redirectUri = env.REACT_APP_COGNITO_REDIRECT_URI || '';

    const logoutUrl =
      `${cognitoDomain}/logout?client_id=${clientId}` +
      `&logout_uri=${encodeURIComponent(logoutUri)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code&federated`;
    window.location.href = logoutUrl;
  };

  const handleLogout = () => (onLogout ? onLogout() : signOutRedirect());

  /* ---------------------------  JSX  --------------------------- */
  return (
    <nav className={`topbar-container ${className ?? ''}`} style={style}>
      <div className="topbar-content">
        {/* Logo */}
        {showLogo && (
          <Link to={logoLinkUrl}>
            <img className="topbar-logo" src={logoSrc} alt="Logo" />
          </Link>
        )}

        {/* spacer + version */}
        <div className="topbar-spacer" />
        {showVersion && <span className="build-badge">v{buildVersion}</span>}

        {/* slot opzionale (es. pulsanti extra) */}
        {rightSlot}

        {/* User icon + dropdown (se abilitato) */}
        <div style={{ position: 'relative' }}>
          <img
            className="topbar-user-icon"
            src={userIconSrc}
            alt="User Icon"
            onClick={toggleDropdown}
            style={{ cursor: userMenuStyle !== 'icon-only' ? 'pointer' : 'default' }}
          />

          {userMenuStyle !== 'icon-only' && dropdownVisible && (
            <div ref={dropdownRef} className="topbar-dropdown">
              {userMenuStyle === 'full' && (
                <div style={{ marginBottom: '0.5rem', color: 'black' }}>
                  <strong>{auth.user?.profile.email}</strong>
                  <br />
                  <strong>
                    {auth.user?.profile.given_name}{' '}
                    {auth.user?.profile.family_name}
                  </strong>
                </div>
              )}
              {userMenuStyle === 'dropdown' && (
                <div style={{ marginBottom: '0.5rem', color: 'black' }}>
                  <strong>{auth.user?.profile.email}</strong>
                </div>
              )}
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
