import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';

export default function Header({ view, user, onNav, onSuggest, onAccount }) {
  const headerRef  = useRef(null);
  const drawerRef  = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { y: -70, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }
    );
  }, []);

  // Animate drawer open
  useEffect(() => {
    if (menuOpen && drawerRef.current) {
      gsap.fromTo(drawerRef.current,
        { scaleY: 0, opacity: 0, transformOrigin: 'top center' },
        { scaleY: 1, opacity: 1, duration: 0.3, ease: 'power3.out' }
      );
    }
  }, [menuOpen]);

  const closeMenu = () => {
    if (drawerRef.current) {
      gsap.to(drawerRef.current, {
        scaleY: 0, opacity: 0, transformOrigin: 'top center',
        duration: 0.22, ease: 'power2.in',
        onComplete: () => setMenuOpen(false),
      });
    } else {
      setMenuOpen(false);
    }
  };

  const navItems = [
    { id: 'decks',   icon: 'bx-collection', label: 'Decks' },
    { id: 'paste',   icon: 'bx-plus-circle', label: 'New Deck' },
    { id: 'archive', icon: 'bx-archive',     label: 'Archive' },
  ];

  const handleNav = (id) => {
    onNav(id);
    if (menuOpen) closeMenu();
  };

  const handleSuggestClick = () => {
    onSuggest();
    if (menuOpen) closeMenu();
  };

  return (
    <header ref={headerRef} className="app-header">
      {/* Logo */}
      <button id="nav-logo" className="header-logo" onClick={() => handleNav('landing')}>
        <img src="/logo.png" alt="Recallify" className="logo-img" />
        <span className="logo-text">Recallify</span>
      </button>

      {/* Desktop nav */}
      <nav className="header-nav desktop-nav">
        {navItems.map(n => (
          <button
            key={n.id}
            id={`nav-${n.id}`}
            className={`nav-btn ${view === n.id ? 'active' : ''}`}
            onClick={() => handleNav(n.id)}
          >
            <i className={`bx ${n.icon}`} />
            <span>{n.label}</span>
          </button>
        ))}
        <button id="nav-suggest" className="nav-btn nav-suggest" onClick={handleSuggestClick}>
          <i className="bx bx-message-add" />
          <span>Suggest</span>
        </button>
        <button id="nav-account" className={`nav-btn account-btn ${view === 'profile' ? 'active' : ''}`} onClick={() => user ? handleNav('profile') : onAccount()}>
          <i className={`bx ${user ? 'bxs-user-circle' : 'bx-user-circle'}`} />
          <span>{user ? 'Profile' : 'Sign In'}</span>
        </button>
      </nav>

      {/* Hamburger (mobile only) */}
      <button
        id="nav-hamburger"
        className="hamburger-btn"
        onClick={() => menuOpen ? closeMenu() : setMenuOpen(true)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
      >
        <span className={`hb-line ${menuOpen ? 'open' : ''}`} />
        <span className={`hb-line ${menuOpen ? 'open' : ''}`} />
        <span className={`hb-line ${menuOpen ? 'open' : ''}`} />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav ref={drawerRef} className="mobile-drawer">
          {navItems.map(n => (
            <button
              key={n.id}
              className={`mobile-nav-item ${view === n.id ? 'active' : ''}`}
              onClick={() => handleNav(n.id)}
            >
              <i className={`bx ${n.icon}`} />
              <span>{n.label}</span>
              {view === n.id && <i className="bx bxs-circle mobile-active-dot" />}
            </button>
          ))}
          <button className="mobile-nav-item mobile-suggest" onClick={handleSuggestClick}>
            <i className="bx bx-message-add" />
            <span>Leave a Suggestion</span>
          </button>
          <button className={`mobile-nav-item ${view === 'profile' ? 'active' : ''}`} onClick={() => { user ? handleNav('profile') : onAccount(); if (!user) closeMenu(); }}>
            <i className={`bx ${user ? 'bxs-user-circle' : 'bx-user-circle'}`} />
            <span>{user ? 'Profile & Sync' : 'Sign In & Sync'}</span>
          </button>
        </nav>
      )}

      <style>{`
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 28px;
          background: rgba(255,255,255,0.98);
          backdrop-filter: blur(8px);
          border-bottom: 2.5px solid var(--ink);
          box-shadow: 0 3px 0 var(--ink);
          position: sticky;
          top: 0;
          z-index: 300;
          gap: 12px;
          min-height: 64px;
        }

        /* Logo */
        .header-logo {
          background: none; border: none; cursor: pointer;
          padding: 0; display: flex; align-items: center; gap: 10px;
          text-decoration: none;
        }
        .logo-img {
          width: 38px; height: 38px;
          object-fit: contain; display: block; flex-shrink: 0;
        }
        .logo-text {
          font-family: var(--font-display);
          font-size: 1.6rem; font-weight: 700;
          color: var(--ink); line-height: 1;
        }

        /* Desktop nav */
        .desktop-nav { display: flex; gap: 4px; align-items: center; }
        .nav-btn {
          display: flex; align-items: center; gap: 6px;
          font-family: var(--font-display);
          font-size: 0.95rem; font-weight: 500;
          padding: 7px 16px;
          border: 2px solid transparent; border-radius: 99px;
          background: transparent; cursor: pointer;
          color: var(--ink-light);
          transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s;
        }
        .nav-btn:hover, .nav-btn.active {
          background: var(--yellow-bg); border-color: var(--ink);
          color: var(--ink); box-shadow: 2px 2px 0 var(--ink);
        }
        .nav-suggest { border-style: dashed; border-color: var(--border); }
        .nav-suggest:hover {
          background: var(--purple-bg); border-color: var(--purple);
          color: var(--purple); box-shadow: 2px 2px 0 var(--purple);
          border-style: solid;
        }
        .nav-btn i { font-size: 1rem; }

        /* Hamburger */
        .hamburger-btn {
          display: none;
          flex-direction: column;
          gap: 5px;
          background: none; border: none;
          cursor: pointer; padding: 6px;
          border-radius: 8px;
          transition: background 0.15s;
        }
        .hamburger-btn:hover { background: var(--paper-dark); }
        .hb-line {
          display: block;
          width: 24px; height: 2.5px;
          background: var(--ink); border-radius: 2px;
          transition: transform 0.25s, opacity 0.25s;
          transform-origin: center;
        }
        .hb-line.open:nth-child(1) { transform: translateY(7.5px) rotate(45deg); }
        .hb-line.open:nth-child(2) { opacity: 0; transform: scaleX(0); }
        .hb-line.open:nth-child(3) { transform: translateY(-7.5px) rotate(-45deg); }

        /* Mobile drawer */
        .mobile-drawer {
          position: absolute;
          top: 100%; left: 0; right: 0;
          background: #fff;
          border-bottom: 2.5px solid var(--ink);
          box-shadow: 0 8px 24px rgba(30,26,20,0.14);
          display: flex; flex-direction: column;
          padding: 12px 16px 16px;
          gap: 6px;
          z-index: 290;
          transform-origin: top center;
        }
        .mobile-nav-item {
          display: flex; align-items: center; gap: 12px;
          font-family: var(--font-display);
          font-size: 1.1rem; font-weight: 500;
          padding: 13px 16px;
          border: 2px solid var(--border); border-radius: 12px;
          background: transparent; color: var(--ink);
          cursor: pointer; text-align: left;
          transition: background 0.15s, border-color 0.15s;
        }
        .mobile-nav-item:hover { background: var(--paper-dark); }
        .mobile-nav-item.active {
          background: var(--yellow-bg);
          border-color: var(--ink);
          font-weight: 700;
        }
        .mobile-suggest {
          border-color: var(--purple);
          color: var(--purple);
          border-style: dashed;
          margin-top: 4px;
        }
        .mobile-suggest:hover { background: var(--purple-bg); border-style: solid; }
        .mobile-active-dot {
          margin-left: auto;
          font-size: 0.5rem;
          color: var(--purple);
        }
        .mobile-nav-item i:first-child { font-size: 1.2rem; flex-shrink: 0; }

        /* Show hamburger on mobile, hide desktop nav */
        @media (max-width: 680px) {
          .desktop-nav { display: none; }
          .hamburger-btn { display: flex; }
          .app-header { padding: 10px 16px; }
          .logo-text { font-size: 1.35rem; }
          .logo-img { width: 32px; height: 32px; }
        }
      `}</style>
    </header>
  );
}
