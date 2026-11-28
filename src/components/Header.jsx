import React, { useState } from 'react';
import { 
  ShoppingBag, 
  User, 
  Search, 
  Globe, 
  Moon, 
  Sun, 
  Palette, 
  ShieldCheck, 
  Feather, 
  Sparkles, 
  Menu, 
  X,
  Volume2,
  VolumeX,
  Compass,
  LogOut,
  KeyRound
} from 'lucide-react';
import { getTranslation, getLanguageInfo } from '../data/translations';

export const Header = ({
  lang,
  setLang,
  themeMode,
  setThemeMode,
  palette,
  setPalette,
  reducedMotion,
  setReducedMotion,
  cartCount,
  onOpenCart,
  currentUser,
  onOpenAuth,
  onOpenArtisanDash,
  onOpenCustomerOrders,
  onOpenRecognition,
  onOpenLanguageModal,
  onOpenSecurity,
  onOpenAdmin,
  onSignOut,
  activeSection,
  setActiveSection
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false);

  const t = (k) => getTranslation(lang, k);
  const currentLangInfo = getLanguageInfo(lang);

  const palettes = [
    { id: 'ivory-indigo', name: 'Ivory & Indigo', desc: 'Signature Heritage (Swallows & Rose)', color: '#1A3459' },
    { id: 'terracotta', name: 'Terracotta', desc: 'Burnt Sienna & Earthen Clay', color: '#C25634' },
    { id: 'botanical', name: 'Botanical', desc: 'Forest Moss & Sage Parchment', color: '#2D4C3A' }
  ];

  return (
    <header className="site-header">
      {/* Top Heritage Notice Bar */}
      <div className="top-notice-bar" style={{
        backgroundColor: 'var(--bg-surface-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        fontSize: '0.8rem',
        padding: '5px 0'
      }}>
        <div className="container" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-ochre)' }}>
            <Sparkles size={14} />
            <span style={{ fontWeight: 600 }}>{t('hero_badge')}</span>
            <span className="hide-on-mobile" style={{ opacity: 0.5 }}>•</span>
            <span className="hide-on-mobile" style={{ color: 'var(--text-secondary)' }}>{t('hero_cover_sub')}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button 
              onClick={onOpenRecognition}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: 'var(--accent-indigo)',
                fontSize: '0.78rem',
                fontWeight: 600,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                minHeight: '32px'
              }}
              title="Painting Visual Recognition & Archival Heritage Records"
            >
              <Compass size={13} />
              <span>{t('footer_archives')}</span>
            </button>

            <button 
              onClick={() => {
                if (currentUser && onOpenSecurity) {
                  onOpenSecurity();
                } else if (onOpenAuth) {
                  onOpenAuth();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--accent-olive)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                minHeight: '32px'
              }}
              title="Account Security & Authentication Status"
            >
              <ShieldCheck size={13} />
              <span>{currentUser ? "Security Sanctuary" : t('footer_ethics')}</span>
            </button>

            {onOpenAdmin && (
              <button 
                onClick={onOpenAdmin}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--accent-terracotta)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  minHeight: '32px'
                }}
                title="System Administration & Artisan Registry"
              >
                <KeyRound size={13} />
                <span>Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container">
        <div className="header-inner">
          {/* Logo & Emblem */}
          <a 
            href="#cover-section" 
            className="brand-link"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('cover-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="brand-emblem">
              <span className="animate-float" style={{ fontSize: '22px', display: 'inline-block' }}>🪷</span>
            </div>
            <div className="brand-text-wrap">
              <span className="brand-title">{t('brand_name')}</span>
              <span className="brand-subtitle">{currentLangInfo.nativeName} • {t('nav_journal')}</span>
            </div>
          </a>

          {/* Desktop Navigation matching 3-stage scroll flow */}
          <nav aria-label="Main Navigation" className="desktop-nav">
            <ul className="nav-links">
              <li>
                <button 
                  className={`nav-link-item ${activeSection === 'cover' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection?.('cover');
                    document.getElementById('cover-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {t('nav_cover')}
                </button>
              </li>
              <li>
                <button 
                  className={`nav-link-item ${activeSection === 'vision' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection?.('vision');
                    document.getElementById('vision-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {t('nav_vision')}
                </button>
              </li>
              <li>
                <button 
                  className={`nav-link-item ${activeSection === 'explore' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection?.('explore');
                    document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {t('nav_explore')}
                </button>
              </li>
              <li>
                <button 
                  className={`nav-link-item ${activeSection === 'commissions' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection?.('commissions');
                    document.getElementById('commissions-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {t('nav_commissions')}
                </button>
              </li>
            </ul>
          </nav>

          {/* Controls & Actions */}
          <div className="header-actions">
            {/* Searchable 22 Indian Languages Modal Trigger */}
            <button 
              className="btn-icon header-lang-btn" 
              onClick={onOpenLanguageModal}
              title={`Active Language: ${currentLangInfo.nativeName} (${currentLangInfo.name}) - Click to switch`}
              aria-label="Language selection"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', width: 'auto', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1.5px solid var(--accent-indigo)' }}
            >
              <Globe size={16} color="var(--accent-indigo)" />
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                {currentLangInfo.nativeName}
              </span>
            </button>

            {/* Palette Switcher (Desktop) */}
            <div className="desktop-only-action" style={{ position: 'relative' }}>
              <button 
                className="btn-icon"
                onClick={() => setPaletteMenuOpen(!paletteMenuOpen)}
                title="Select Cultural Color Theme (Ivory & Indigo / Terracotta / Botanical)"
                aria-label="Color Palette selection"
              >
                <Palette size={18} />
              </button>

              {paletteMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  width: '240px',
                  zIndex: 1050,
                  padding: '8px'
                }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '6px 8px' }}>
                    Cultural Themes
                  </div>
                  {palettes.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setPalette(p.id);
                        setPaletteMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: palette === p.id ? 'var(--bg-surface-subtle)' : 'transparent',
                        border: palette === p.id ? '1px solid var(--border-strong)' : '1px solid transparent',
                        marginBottom: '4px'
                      }}
                    >
                      <span style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: p.color,
                        display: 'inline-block',
                        flexShrink: 0
                      }} />
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Light / Dark Mode Toggle (Desktop) */}
            <button
              className="btn-icon desktop-only-action"
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              title={themeMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme light or dark mode"
            >
              {themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Reduced Motion Toggle (Desktop) */}
            <button
              className="btn-icon desktop-only-action"
              onClick={() => setReducedMotion(!reducedMotion)}
              style={{
                color: reducedMotion ? 'var(--accent-rose)' : 'var(--text-secondary)',
                borderColor: reducedMotion ? 'var(--accent-rose)' : 'var(--border-subtle)'
              }}
              title={reducedMotion ? "Calm Motion Mode Active (Reduced Animations)" : "Standard Motion Active (Click for Calm Mode)"}
              aria-label="Toggle reduced motion mode"
            >
              <Feather size={18} />
            </button>

            {/* Shopping Cart Drawer Toggle */}
            <button
              className="btn-icon header-cart-btn"
              onClick={onOpenCart}
              title="Open Craft Cart"
              aria-label={`Open shopping cart with ${cartCount} items`}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span 
                  key={cartCount}
                  className="animate-cart-bump"
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    backgroundColor: 'var(--accent-rose)',
                    color: '#FFF',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Account / Sign In (Desktop) */}
            <div className="header-auth-wrap">
              {currentUser ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {currentUser.role === 'artisan' ? (
                    <button 
                      className="btn-primary" 
                      onClick={onOpenArtisanDash}
                      style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                    >
                      <span>{t('btn_artisan_dashboard')}</span>
                    </button>
                  ) : (
                    <button 
                      className="btn-secondary" 
                      onClick={onOpenCustomerOrders}
                      style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                    >
                      <User size={15} />
                      <span>{(currentUser.name || currentUser.displayName || 'Patron').split(' ')[0]}</span>
                    </button>
                  )}

                  <button
                    className="btn-icon desktop-only-action"
                    onClick={onOpenSecurity}
                    title="Account Security & Password Settings"
                    aria-label="Security Settings"
                    style={{ color: 'var(--accent-olive)', borderColor: 'var(--border-subtle)' }}
                  >
                    <ShieldCheck size={18} />
                  </button>

                  {onSignOut && (
                    <button
                      className="btn-icon desktop-only-action"
                      onClick={onSignOut}
                      title="Sign Out of Session"
                      aria-label="Sign Out"
                      style={{ padding: '6px', color: 'var(--text-muted)' }}
                    >
                      <LogOut size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <button 
                  className="btn-primary btn-sheen" 
                  onClick={onOpenAuth}
                  style={{ padding: '9px 20px', fontSize: '0.9rem' }}
                >
                  <User size={16} />
                  <span>{t('btn_signin')}</span>
                </button>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              className="btn-icon mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Toggle Navigation Menu"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div 
          className="mobile-nav-overlay"
          onClick={() => setMobileMenuOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
        >
          <div className="mobile-nav-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-nav-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px' }}>🪷</span>
                <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {t('brand_name')}
                </span>
              </div>
              <button 
                className="modal-close-btn" 
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Primary Journey Links */}
            <nav className="mobile-nav-links">
              <button 
                className={`mobile-nav-item ${activeSection === 'cover' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection?.('cover');
                  document.getElementById('cover-section')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
              >
                <span>🪷</span>
                <span>{t('nav_cover')}</span>
              </button>

              <button 
                className={`mobile-nav-item ${activeSection === 'vision' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection?.('vision');
                  document.getElementById('vision-section')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
              >
                <span>📜</span>
                <span>{t('nav_vision')}</span>
              </button>

              <button 
                className={`mobile-nav-item ${activeSection === 'explore' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection?.('explore');
                  document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
              >
                <span>🏺</span>
                <span>{t('nav_explore')}</span>
              </button>

              <button 
                className={`mobile-nav-item ${activeSection === 'commissions' ? 'active' : ''}`}
                onClick={() => {
                  setActiveSection?.('commissions');
                  document.getElementById('commissions-section')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
              >
                <span>✨</span>
                <span>{t('nav_commissions')}</span>
              </button>
            </nav>

            {/* Quick Access Portals */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '16px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Cultural Portals & Tools
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button 
                  className="mobile-nav-portal-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenRecognition?.();
                  }}
                >
                  <Compass size={16} color="var(--accent-indigo)" />
                  <span>Visual Craft Recognition</span>
                </button>

                <button 
                  className="mobile-nav-portal-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (currentUser && onOpenSecurity) onOpenSecurity();
                    else if (onOpenAuth) onOpenAuth();
                  }}
                >
                  <ShieldCheck size={16} color="var(--accent-olive)" />
                  <span>Security & Verification Sanctuary</span>
                </button>

                {onOpenAdmin && (
                  <button 
                    className="mobile-nav-portal-btn"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenAdmin();
                    }}
                  >
                    <KeyRound size={16} color="var(--accent-terracotta)" />
                    <span>System Admin Portal</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Preferences (Theme, Language, Motion) */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', marginTop: '16px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Display & Language Preferences
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                <button
                  className="mobile-pref-btn"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLanguageModal?.();
                  }}
                >
                  <Globe size={16} />
                  <span>{currentLangInfo.nativeName}</span>
                </button>

                <button
                  className="mobile-pref-btn"
                  onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
                >
                  {themeMode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>

              {/* Calm Motion Toggle */}
              <button
                className="mobile-pref-btn"
                style={{ width: '100%', marginBottom: '14px', justifyContent: 'center' }}
                onClick={() => setReducedMotion(!reducedMotion)}
              >
                <Feather size={16} color={reducedMotion ? 'var(--accent-rose)' : 'inherit'} />
                <span>{reducedMotion ? "Calm Motion Active" : "Enable Calm Motion"}</span>
              </button>

              {/* Palettes in Mobile Drawer */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {palettes.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPalette(p.id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: 'var(--radius-sm)',
                      border: palette === p.id ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                      backgroundColor: palette === p.id ? 'var(--bg-surface-subtle)' : 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: p.color }} />
                    <span style={{ fontSize: '0.72rem', fontWeight: 600 }}>{p.name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* User Actions */}
            <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)' }}>
              {currentUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <User size={18} color="var(--accent-indigo)" />
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                        {currentUser.name || currentUser.displayName || 'Member'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {currentUser.role === 'artisan' ? 'Master Artisan' : 'Patron'}
                      </div>
                    </div>
                  </div>

                  {currentUser.role === 'artisan' ? (
                    <button 
                      className="btn-primary" 
                      onClick={() => { setMobileMenuOpen(false); onOpenArtisanDash?.(); }}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <span>{t('btn_artisan_dashboard')}</span>
                    </button>
                  ) : (
                    <button 
                      className="btn-secondary" 
                      onClick={() => { setMobileMenuOpen(false); onOpenCustomerOrders?.(); }}
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <span>{t('nav_customer_dashboard') || "My Collection & Orders"}</span>
                    </button>
                  )}

                  {onSignOut && (
                    <button
                      className="btn-secondary"
                      onClick={() => { setMobileMenuOpen(false); onSignOut(); }}
                      style={{ width: '100%', justifyContent: 'center', color: 'var(--accent-rose)', borderColor: 'rgba(198, 99, 118, 0.3)' }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              ) : (
                <button 
                  className="btn-primary" 
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth?.(); }}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <User size={16} />
                  <span>{t('btn_signin')}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
