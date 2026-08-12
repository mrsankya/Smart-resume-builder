import './index.css';
import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import ThemeContext from '../../context/ThemeContext.jsx';
import {
  HiArrowRightOnRectangle,
  HiDocumentText,
  HiSun,
  HiMoon,
} from 'react-icons/hi2';

function Navbar({ title, showBack = false }) {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme, isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="flex-row items-center gap-sm">
        {showBack && (
          <Link to="/home" className="flex-row items-center gap-xs text-muted" style={{ textDecoration: 'none' }}>
            <HiDocumentText style={{ fontSize: '18px' }} />
            Dashboard
          </Link>
        )}
        {!showBack && (
          <>
            <Link to="/home" className="navbar-brand">
              <div className="navbar-logo">
                <HiDocumentText />
              </div>
              <span className="navbar-title">Smart Resume Builder</span>
            </Link>
            {user && (
              <div className="nav-links">
                <Link
                  to="/home"
                  className={`nav-link ${location.pathname === '/home' ? 'nav-link-active' : ''}`}
                >
                  Home
                </Link>
                <Link
                  to="/templates"
                  className={`nav-link ${location.pathname === '/templates' ? 'nav-link-active' : ''}`}
                >
                  Templates
                </Link>
                <Link
                  to="/dashboard"
                  className={`nav-link ${location.pathname === '/dashboard' ? 'nav-link-active' : ''}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className={`nav-link ${location.pathname === '/profile' ? 'nav-link-active' : ''}`}
                >
                  Profile
                </Link>
              </div>
            )}
          </>
        )}
        {title && (
          <>
            <span className="navbar-breadcrumb">/</span>
            <span className="navbar-page-title">{title}</span>
          </>
        )}
      </div>

      <div className="flex-row items-center gap-md">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="btn-icon btn-ghost"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          style={{ fontSize: '18px' }}
        >
          {isDark ? <HiSun style={{ color: '#fbbf24' }} /> : <HiMoon style={{ color: '#6366f1' }} />}
        </button>

        {user && (
          <>
            <Link
              to="/profile"
              className="flex-row items-center gap-sm"
              style={{ textDecoration: 'none', cursor: 'pointer' }}
              title="View & Edit Profile"
            >
              {user.picture ? (
                <img src={user.picture} alt={user.name} className="user-avatar" />
              ) : (
                <div className="user-avatar-placeholder">
                  {user.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <span className="text-muted hide-mobile">{user.name}</span>
            </Link>
            <button onClick={handleLogout} className="logout-btn" title="Logout">
              <HiArrowRightOnRectangle />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
