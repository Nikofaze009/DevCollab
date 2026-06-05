import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PLAN_BADGE = {
  free:  { label: 'Free',     cls: 'rgba(0,197,71,0.1)',     color: '#00c547' },
  pro:   { label: '⭐ Pro',   cls: 'rgba(0,197,71,0.2)',     color: '#00c547' },
  team:  { label: '💎 Team',  cls: 'rgba(0,197,71,0.25)',    color: '#00c547' },
};

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const plan = user?.plan || 'free';
  const badge = PLAN_BADGE[plan];
  const isHome = location.pathname === '/';

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); navigate('/'); };

  /* Entire app is now light style */
  const isLightPage = true;

  const navBg = isLightPage
    ? scrolled
      ? 'rgba(245,247,250,0.92)'
      : 'transparent'
    : 'rgba(0,2,9,0.88)';

  const navBorder = isLightPage
    ? scrolled ? '1px solid rgba(0,0,0,0.08)' : 'none'
    : '1px solid rgba(155,184,225,0.08)';

  const linkColor = isLightPage ? '#111' : 'rgba(255,255,255,0.55)';
  const linkHoverColor = isLightPage ? '#00c547' : '#fff';
  const logoColor = isLightPage ? '#111' : '#eee';

  return (
    <>
      <style>{`
        .dc2-nav-link {
          text-decoration: none;
          font-size: 1.3rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: lowercase;
          padding: 0.8rem 0;
          border: none;
          background: none;
          cursor: pointer;
          font-family: inherit;
          transition: color 0.2s, opacity 0.2s;
          position: relative;
        }
        .dc2-nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: currentColor;
          transform: scaleX(0);
          transition: transform 0.25s ease;
          transform-origin: left;
        }
        .dc2-nav-link:hover::after {
          transform: scaleX(1);
        }
        .dc2-brand-icon {
          width: 28px;
          height: 28px;
          margin-right: 0.8rem;
          vertical-align: middle;
        }
      `}</style>

      <nav
        className="dc-navbar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.8rem 5.6rem',
          background: navBg,
          borderBottom: navBorder,
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          transition: 'background 0.3s, border-color 0.3s',
        }}
      >
        {/* LEFT — repos / dashboard */}
        <div style={{ display: 'flex', gap: '2.8rem', alignItems: 'center' }}>
          {user ? (
            <>
              <Link
                to="/repositories"
                id="nav-repos"
                className="dc2-nav-link"
                style={{ color: linkColor }}
                onMouseEnter={(e) => (e.currentTarget.style.color = linkHoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
              >
                repos
              </Link>
              <Link
                to="/dashboard"
                id="nav-dashboard"
                className="dc2-nav-link"
                style={{ color: linkColor }}
                onMouseEnter={(e) => (e.currentTarget.style.color = linkHoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
              >
                dashboard
              </Link>
            </>
          ) : (
            <Link
              to="/pricing"
              id="nav-pricing"
              className="dc2-nav-link"
              style={{ color: linkColor }}
              onMouseEnter={(e) => (e.currentTarget.style.color = linkHoverColor)}
              onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
            >
              pricing
            </Link>
          )}
        </div>

        {/* CENTER — brand */}
        <Link
          to="/"
          id="nav-brand"
          style={{
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            color: logoColor,
            transition: 'color 0.2s',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#00c547')}
          onMouseLeave={(e) => (e.currentTarget.style.color = logoColor)}
        >
          {/* Small DC logo icon */}
          <svg
            className="dc2-brand-icon"
            viewBox="0 0 42 41"
            fill="currentColor"
          >
            <path d="M23.898 0c1.274 0 2.45.68 3.086 1.783l3.721 6.457c.182.315.277.666.285 1.018l9.318-.001c.824 0 1.338.893.924 1.605L29.826 30.488a3.56 3.56 0 0 1-3.08 1.772h-7.463c-.374 0-.734-.098-1.048-.275l-4.604 7.978a1.07 1.07 0 0 1-1.851 0L.477 20.385a3.56 3.56 0 0 1-.009-3.546l3.71-6.501c.19-.333.461-.602.781-.788l12.472 21.64c.195.338.475.61.804.795l12.47-21.61c.199-.345.294-.732.285-1.117L6.033 9.26c-.384 0-.753.103-1.074.29L.379 1.602A1.068 1.068 0 0 1 1.303 0z" />
          </svg>
          <span
            style={{
              fontSize: '1.8rem',
              fontWeight: 800,
              letterSpacing: '0.02em',
              textTransform: 'lowercase',
            }}
          >
            devcollab
          </span>
          {user && (
            <span
              style={{
                marginLeft: '1rem',
                fontSize: '1.1rem',
                fontWeight: 800,
                letterSpacing: '0.1em',
                padding: '0.3rem 1rem',
                borderRadius: '10rem',
                background: badge.cls,
                color: badge.color,
                textTransform: 'lowercase',
              }}
            >
              {badge.label}
            </span>
          )}
        </Link>

        {/* RIGHT — contact / auth */}
        <div style={{ display: 'flex', gap: '2.8rem', alignItems: 'center' }}>
          {user ? (
            <>
              <Link
                to="/billing"
                id="nav-billing"
                className="dc2-nav-link"
                style={{ color: linkColor }}
                onMouseEnter={(e) => (e.currentTarget.style.color = linkHoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
              >
                billing
              </Link>
              <span
                className="dc2-nav-link"
                style={{ color: 'rgba(0,0,0,0.3)', cursor: 'default' }}
              >
                @{user.username}
              </span>
              <button
                id="nav-logout"
                onClick={handleLogout}
                className="dc2-nav-link"
                style={{ color: 'rgba(200,50,50,0.5)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(200,50,50,0.9)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(200,50,50,0.5)')}
              >
                logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                id="nav-login"
                className="dc2-nav-link"
                style={{ color: linkColor }}
                onMouseEnter={(e) => (e.currentTarget.style.color = linkHoverColor)}
                onMouseLeave={(e) => (e.currentTarget.style.color = linkColor)}
              >
                login
              </Link>
              <Link
                to="/register"
                id="nav-signup"
                style={{
                  textDecoration: 'none',
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  padding: '1rem 2.4rem',
                  border: isLightPage ? '2px solid #111' : '2px solid rgba(155,184,225,0.3)',
                  borderRadius: '0.4rem',
                  color: isLightPage ? '#111' : 'rgba(255,255,255,0.7)',
                  transition: 'all 0.2s',
                  background: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#111';
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = '#111';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = isLightPage ? '#111' : 'rgba(255,255,255,0.7)';
                  e.currentTarget.style.borderColor = isLightPage ? '#111' : 'rgba(155,184,225,0.3)';
                }}
              >
                sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
