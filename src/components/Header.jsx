import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  KeyRound,
  Shield,
  Check,
  ChevronDown
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { TRANSLATIONS } from '../data/translations';

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
  onOpenAdmin,
  onOpenArtisanDash,
  onOpenCustomerOrders,
  onOpenRecognition,
  onOpenLanguageModal,
  onOpenSecurity,
  onSignOut,
  activeSection,
  setActiveSection
}) => {
  const { t: i18nTranslate, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [paletteMenuOpen, setPaletteMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);
  const paletteMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
      if (paletteMenuRef.current && !paletteMenuRef.current.contains(e.target)) {
        setPaletteMenuOpen(false);
      }
    };
    if (langMenuOpen || paletteMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [langMenuOpen, paletteMenuOpen]);

  const fallbackT = TRANSLATIONS[lang] || TRANSLATIONS.en || {};

  const t = new Proxy(i18nTranslate, {
    get(target, prop) {
      if (typeof prop === 'string') {
        const val = target(prop);
        if (val && val !== prop) return val;
        if (fallbackT && fallbackT[prop]) return fallbackT[prop];
      }
      return target[prop];
    },
    apply(target, thisArg, args) {
      const res = Reflect.apply(target, thisArg, args);
      if (res === args[0] && fallbackT && fallbackT[args[0]]) {
        return fallbackT[args[0]];
      }
      return res;
    }
  });

  const palettes = [

    { id: 'ivory-indigo', name: 'Ivory & Indigo', desc: 'Signature Heritage (Swallows & Rose)', color: '#1A3459' },
    { id: 'terracotta', name: 'Terracotta', desc: 'Burnt Sienna & Earthen Clay', color: '#C25634' },
    { id: 'botanical', name: 'Botanical', desc: 'Forest Moss & Sage Parchment', color: '#2D4C3A' }
  ];

  return (
    <header className="site-header">
      {/* Top Heritage Notice Bar */}
      <div style={{
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
            <span style={{ fontWeight: 600 }}>{t.hero_badge}</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span style={{ color: 'var(--text-secondary)' }}>All crafts directly empower indigenous artisans & guilds</span>
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
                cursor: 'pointer'
              }}
              title="Painting Visual Recognition & Archival Heritage Records"
            >
              <Compass size={13} />
              <span>Cultural Archive & Recognition</span>
            </button>

            {onOpenAdmin && (
              <button 
                onClick={onOpenAdmin}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: 'var(--accent-ochre)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                title="Aaroh Administrator Dashboard (/admin)"
              >
                <Shield size={13} />
                <span>Admin Portal</span>
              </button>
            )}

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
                fontWeight: 600
              }}
              title="Account Security & Authentication Status"
            >
              <ShieldCheck size={13} />
              <span>{currentUser ? "Security Sanctuary (Verified)" : t.security_certificate}</span>
            </button>
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
              <span className="brand-title">Aaroh</span>
              <span className="brand-subtitle">आरोह • Cultural Journal</span>
            </div>
          </a>

          {/* Desktop Navigation matching 3-stage scroll flow */}
          <nav aria-label="Main Navigation">
            <ul className="nav-links">
              <li>
                <button 
                  className={`nav-link-item ${activeSection === 'cover' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSection?.('cover');
                    document.getElementById('cover-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Cover
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
                  Aaroh’s Vision
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
                  {t.nav_marketplace || "Explore Crafts"}
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
                  {t.nav_commissions || "Commissions"}
                </button>
              </li>
            </ul>
          </nav>

          {/* Controls & Actions */}
          <div className="header-actions">
            {/* Prominent Multilingual Language Selector */}
            <div ref={langMenuRef} style={{ position: 'relative' }}>
              <button 
                className="btn-icon" 
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                title="Select language / भाषा चुनें"
                aria-label="Language selection"
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  width: 'auto', 
                  padding: '6px 12px',
                  backgroundColor: langMenuOpen ? 'var(--bg-surface-subtle)' : 'transparent',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                <Globe size={16} style={{ color: 'var(--accent-indigo)' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                  {SUPPORTED_LANGUAGES.find(l => l.code === lang)?.nativeName || lang.toUpperCase()}
                </span>
                <ChevronDown size={14} style={{ opacity: 0.7 }} />
              </button>

              {langMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  width: '260px',
                  maxHeight: '380px',
                  overflowY: 'auto',
                  zIndex: 1100,
                  padding: '8px'
                }}>
                  <div style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    textTransform: 'uppercase', 
                    color: 'var(--text-muted)', 
                    padding: '6px 10px',
                    letterSpacing: '0.05em',
                    borderBottom: '1px solid var(--border-subtle)',
                    marginBottom: '4px'
                  }}>
                    Select Language / भाषा चुनें
                  </div>

                  {SUPPORTED_LANGUAGES.map((sl) => {
                    const active = lang === sl.code;
                    return (
                      <button
                        key={sl.code}
                        onClick={() => {
                          i18n.changeLanguage(sl.code);
                          setLang(sl.code);
                          setLangMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: active ? 'var(--bg-surface-subtle)' : 'transparent',
                          border: active ? '1px solid var(--accent-indigo)' : '1px solid transparent',
                          color: active ? 'var(--accent-indigo)' : 'var(--text-primary)',
                          fontWeight: active ? 700 : 500,
                          fontSize: '0.88rem',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '1rem' }}>{sl.flag}</span>
                          <div>
                            <span style={{ display: 'block', lineHeight: 1.2 }}>{sl.nativeName}</span>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sl.name}</span>
                          </div>
                        </div>
                        {active && <Check size={16} style={{ color: 'var(--accent-indigo)' }} />}
                      </button>
                    );
                  })}

                  <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '6px', paddingTop: '6px' }}>
                    <button
                      onClick={() => {
                        setLangMenuOpen(false);
                        if (typeof onOpenLanguageModal === 'function') onOpenLanguageModal();
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        padding: '8px',
                        fontSize: '0.78rem',
                        color: 'var(--accent-ochre)',
                        fontWeight: 600,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      More Languages (22 Indian Languages)...
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Palette Switcher */}
            <div ref={paletteMenuRef} style={{ position: 'relative' }}>
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

            {/* Light / Dark Mode Toggle */}
            <button
              className="btn-icon"
              onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
              title={themeMode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme light or dark mode"
            >
              {themeMode === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Reduced Motion Toggle */}
            <button
              className="btn-icon"
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
              className="btn-icon"
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

            {/* User Account / Sign In */}
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentUser.role === 'admin' ? (
                  <button 
                    className="btn-primary" 
                    onClick={onOpenAdmin}
                    style={{ padding: '8px 18px', fontSize: '0.88rem', backgroundColor: '#D97706', borderColor: '#B45309' }}
                  >
                    <Shield size={15} />
                    <span>Admin Console</span>
                  </button>
                ) : currentUser.role === 'artisan' ? (
                  <button 
                    className="btn-primary" 
                    onClick={onOpenArtisanDash}
                    style={{ padding: '8px 18px', fontSize: '0.88rem' }}
                  >
                    <span>{t.btn_artisan_dashboard}</span>
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

                {/* Direct Security Page Trigger */}
                <button
                  className="btn-icon"
                  onClick={onOpenSecurity}
                  title="Account Security & Password Settings"
                  aria-label="Security Settings"
                  style={{ color: 'var(--accent-olive)', borderColor: 'var(--border-subtle)' }}
                >
                  <ShieldCheck size={18} />
                </button>

                {onSignOut && (
                  <button
                    className="btn-icon"
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
                <span>{t.btn_signin}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
