import React, { useState, useEffect } from 'react';
import { ChevronDown, Globe, Moon, Sun, User } from 'lucide-react';
import { getTranslation, getLanguageInfo } from '../data/translations';
import { CulturalParticles } from './CulturalParticles';

const MARQUEE_CRAFTS = [
  { name: 'Mithila Madhubani', state: 'Bihar', icon: '🪷' },
  { name: 'Rogan Textile Art', state: 'Gujarat', icon: '🎨' },
  { name: 'Dhokra Bronze Casting', state: 'Bastar', icon: '🏺' },
  { name: 'Blue Pottery', state: 'Jaipur', icon: '🌿' },
  { name: 'Pattachitra Scrolls', state: 'Odisha', icon: '📜' },
  { name: 'Toda Tribal Embroidery', state: 'Nilgiris', icon: '🧵' },
  { name: 'Bidriware Silver Inlay', state: 'Karnataka', icon: '✨' },
  { name: 'Kalamkari Handblock', state: 'Andhra Pradesh', icon: '🕊️' },
];

export const OpeningCoverSection = ({
  lang,
  onOpenLanguageModal,
  themeMode,
  setThemeMode,
  reducedMotion,
  setReducedMotion,
  currentUser,
  onOpenAuth,
  onOpenArtisanDash,
  onOpenCustomerOrders,
  onScrollToVision
}) => {
  const t = (k) => getTranslation(lang, k);
  const currentLangInfo = getLanguageInfo(lang);
  const [scrollY, setScrollY] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (reducedMotion) return;
    const { clientX, clientY, currentTarget } = e;
    const { width, height, left, top } = currentTarget.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) / (width / 2);
    const y = (clientY - (top + height / 2)) / (height / 2);
    setTilt({ x: x * 4.5, y: -y * 4.5 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (reducedMotion) return;
    const handleScroll = () => {
      // Only track while near top for performance
      if (window.scrollY < window.innerHeight * 1.5) {
        setScrollY(window.scrollY);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion]);

  // Subtle parallax calculations
  const emblemOpacity = reducedMotion ? 1 : Math.max(0, 1 - scrollY / (window.innerHeight * 0.75));
  const emblemTranslate = reducedMotion ? 0 : scrollY * 0.22;
  const bgShift = reducedMotion ? 0 : scrollY * 0.12;

  return (
    <section 
      id="cover-section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundImage: `radial-gradient(circle at center, rgba(250, 245, 235, 0.72) 0%, rgba(250, 245, 235, 0.90) 80%, rgba(250, 245, 235, 0.98) 100%), url('/assets/images/aaroh-cover-pattern.jpg')`,
        backgroundSize: 'cover, 460px',
        backgroundRepeat: 'no-repeat, repeat',
        backgroundPosition: `center, center ${bgShift}px`,
        padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 40px)',
        overflow: 'hidden',
        transition: 'background-position 0.1s ease-out'
      }}
    >
      {/* Cultural Heritage Motifs Animated Particles Layer */}
      <CulturalParticles reducedMotion={reducedMotion} />

      {/* Top Floating Utility Bar */}
      <div 
        className="scroll-reveal is-revealed"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1280px',
          margin: '0 auto',
          zIndex: 10
        }}
      >
        {/* Subtle Brand Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          backgroundColor: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(8px)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem',
          fontWeight: 600,
          color: 'var(--accent-indigo)',
          transition: 'transform 0.25s ease'
        }}>
          <span className="animate-float">🪷</span>
          <span>{t('brand_name')} • {t('nav_journal')}</span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Language Selector Pill */}
          <button
            onClick={onOpenLanguageModal}
            className="btn-sheen"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(8px)',
              border: '1.5px solid var(--accent-indigo)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.88rem',
              fontWeight: 700,
              color: 'var(--accent-indigo)',
              boxShadow: 'var(--shadow-sm)',
              cursor: 'pointer'
            }}
            title={`Active Language: ${currentLangInfo.nativeName} (${currentLangInfo.name}) - Click to switch`}
          >
            <Globe size={16} color="var(--accent-indigo)" />
            <span>{currentLangInfo.nativeName} ({currentLangInfo.name})</span>
          </button>

          {/* Theme Mode Toggle */}
          <button
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease'
            }}
            title="Toggle theme light/dark"
          >
            {themeMode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Auth Button */}
          {currentUser ? (
            <button
              onClick={currentUser.role === 'artisan' ? onOpenArtisanDash : onOpenCustomerOrders}
              className="btn-primary"
              style={{ padding: '8px 18px', fontSize: '0.88rem' }}
            >
              <User size={15} />
              <span>{currentUser.role === 'artisan' ? "Artisan Studio" : "My Orders"}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-primary"
              style={{ padding: '8px 20px', fontSize: '0.88rem' }}
            >
              <span>{t('btn_signin')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Atmospheric Centerpiece: The Official Aaroh Logo & Tagline */}
      <div 
        style={{
          margin: 'auto 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 10,
          padding: '20px',
          position: 'relative',
          opacity: emblemOpacity,
          transform: `translateY(${emblemTranslate}px)`,
          transition: 'transform 0.1s ease-out, opacity 0.15s ease-out',
          animation: reducedMotion ? 'none' : 'emblemUnveil 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}
      >
        {/* Breathing Radiant Golden Halo Glow */}
        {!reducedMotion && <div className="radiant-halo" aria-hidden="true" />}

        {/* Continuous Line-Art Emblem Card with 3D Tilt and Continuous Levitation */}
        <div 
          className="animate-emblem-float"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(16px)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(28px, 5vw, 48px) clamp(24px, 6vw, 64px)',
            boxShadow: '0 24px 70px rgba(26, 52, 89, 0.15), 0 4px 18px rgba(191, 135, 46, 0.12)',
            border: '1px solid rgba(213, 197, 178, 0.75)',
            maxWidth: '680px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            transform: reducedMotion ? 'none' : `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
            willChange: 'transform'
          }}
        >
          {/* Subtle gold shimmer top line */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: 'linear-gradient(90deg, transparent, var(--accent-ochre), var(--accent-rose), transparent)'
            }} 
            aria-hidden="true"
          />

          {/* Continuous Line-Art Drawing Image */}
          <div style={{ maxWidth: '240px', marginBottom: '16px', position: 'relative' }}>
            <img 
              src="/assets/images/aaroh-logo-tagline.png" 
              alt="Aaroh line art symbol"
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
            />
          </div>

          <p style={{
            fontSize: '1.08rem',
            lineHeight: 1.65,
            color: 'var(--text-secondary)',
            maxWidth: '520px',
            margin: '0 auto',
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic'
          }}>
            {t('hero_quote')}
          </p>
        </div>
      </div>

      {/* Bottom Cue: Scroll to Explore */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        zIndex: 10,
        paddingBottom: '24px'
      }}>
        <button
          onClick={onScrollToVision}
          style={{
            display: 'inline-flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '0.88rem',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase'
          }}
        >
          <span style={{ opacity: 0.85, transition: 'opacity 0.2s ease' }}>{t('scroll_explore')}</span>
          <div 
            className="ripple-container"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-strong)',
              animation: reducedMotion ? 'none' : 'chevronPulse 2.4s infinite ease-in-out',
              position: 'relative'
            }}
          >
            {!reducedMotion && <div className="ripple-ring ripple-ring-ochre" aria-hidden="true" />}
            <ChevronDown size={22} color="var(--accent-indigo)" />
          </div>
        </button>
      </div>

      {/* Infinite Cultural Heritage Marquee Ticker */}
      <div className="craft-marquee-container" aria-hidden="true" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', margin: '20px 0 10px' }}>
        <div className="craft-marquee-track">
          {[...MARQUEE_CRAFTS, ...MARQUEE_CRAFTS].map((c, i) => (
            <span key={i} className="marquee-pill">
              <span className="animate-float" style={{ animationDelay: `${(i % 5) * 0.4}s` }}>{c.icon}</span>
              <span>{c.name}</span>
              <span style={{ opacity: 0.65, fontSize: '0.74rem' }}>({c.state})</span>
              <span style={{ color: 'var(--accent-ochre)', opacity: 0.8 }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* Transition Bridge into Aaroh's Vision */}
      <div className="section-bridge-cover-to-vision" aria-hidden="true">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,50 L1200,120 L0,120 Z" className="shape-fill"></path>
        </svg>
      </div>
    </section>
  );
};

