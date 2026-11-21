import React, { useRef, useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, Award } from 'lucide-react';
import { getTranslation } from '../data/translations';

export const AarohVisionSection = ({ lang, onScrollToExplore }) => {
  const t = (k) => getTranslation(lang, k);
  const sectionRef = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section 
      ref={sectionRef}
      id="vision-section"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 'clamp(64px, 10vw, 120px) 0 40px',
        position: 'relative'
      }}
    >
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(40px, 6vw, 80px)',
          alignItems: 'center'
        }}>
          {/* Left Column: Authentic Artisan Portrait */}
          <div className={`scroll-reveal-left ${isInView ? 'is-revealed' : ''}`} style={{ position: 'relative' }}>
            <div 
              style={{
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(26, 52, 89, 0.12)',
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--bg-surface)',
                transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.01)';
                e.currentTarget.style.boxShadow = '0 28px 60px rgba(26, 52, 89, 0.18)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(26, 52, 89, 0.12)';
              }}
            >
              <img 
                src="/assets/images/hero-artisan.jpg" 
                alt="Mithila master artisan painting with natural pigments" 
                style={{ 
                  width: '100%', 
                  height: 'auto', 
                  display: 'block', 
                  objectFit: 'cover',
                  transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)' 
                }}
              />
              <div style={{
                padding: '16px 20px',
                backgroundColor: 'var(--bg-surface)',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.84rem'
              }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Dulari Devi</strong>
                  <div style={{ color: 'var(--accent-ochre)', fontSize: '0.78rem' }}>Master Mithila Painter • Ranti Village, Bihar</div>
                </div>
                <span className="craft-seal-badge shimmer-badge" style={{ fontSize: '0.72rem', gap: '6px' }}>
                  <span style={{ 
                    width: '7px', 
                    height: '7px', 
                    borderRadius: '50%', 
                    backgroundColor: 'var(--accent-olive)', 
                    display: 'inline-block',
                    boxShadow: '0 0 8px var(--accent-olive)'
                  }} />
                  Living Heritage
                </span>
              </div>
            </div>

            {/* Floating Quote Stamp with Gentle Float Animation */}
            <div 
              className={`scroll-reveal-scale delay-3 animate-float ${isInView ? 'is-revealed' : ''}`}
              style={{
                position: 'absolute',
                bottom: '-24px',
                right: '-16px',
                backgroundColor: 'var(--accent-indigo)',
                color: '#FFF',
                padding: '14px 20px',
                borderRadius: 'var(--radius-md)',
                maxWidth: '280px',
                fontSize: '0.84rem',
                lineHeight: 1.45,
                boxShadow: '0 14px 34px rgba(26, 52, 89, 0.35)',
                fontStyle: 'italic',
                border: '1px solid rgba(255, 255, 255, 0.22)',
                zIndex: 3
              }}
            >
              “The ink is made from soot and acacia gum. Every line is a prayer for the soil.”
            </div>
          </div>

          {/* Right Column: Editorial Vision Story */}
          <div style={{ maxWidth: '640px' }}>
            <div className={`craft-seal-badge shimmer-badge scroll-reveal delay-1 ${isInView ? 'is-revealed' : ''}`} style={{ marginBottom: '16px' }}>
              <Sparkles size={13} />
              <span>{t('vision_title')}</span>
            </div>

            <h2 
              className={`scroll-reveal delay-2 ${isInView ? 'is-revealed' : ''}`}
              style={{
                fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                lineHeight: 1.18,
                marginBottom: '24px',
                color: 'var(--text-primary)'
              }}
            >
              {t('vision_headline')}
            </h2>

            <p 
              className={`scroll-reveal delay-3 ${isInView ? 'is-revealed' : ''}`}
              style={{
                fontSize: '1.1rem',
                lineHeight: 1.75,
                color: 'var(--text-secondary)',
                marginBottom: '20px'
              }}
            >
              {t('vision_p1')}
            </p>

            <p 
              className={`scroll-reveal delay-3 ${isInView ? 'is-revealed' : ''}`}
              style={{
                fontSize: '1.05rem',
                lineHeight: 1.75,
                color: 'var(--text-secondary)',
                marginBottom: '36px'
              }}
            >
              {t('vision_p2')}
            </p>

            {/* Three Core Living Pillars with interactive expandable hover bars */}
            <div 
              className={`scroll-reveal delay-4 ${isInView ? 'is-revealed' : ''}`}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '16px',
                marginBottom: '36px',
                paddingTop: '20px',
                borderTop: '1px solid var(--border-subtle)'
              }}
            >
              <div className="living-pillar-card">
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-indigo)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎙️</span>
                  <span>Oral Provenance</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Artisans catalog pieces using their own spoken words in their mother tongue.
                </div>
              </div>

              <div className="living-pillar-card">
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚖️</span>
                  <span>100% Fair Wage</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Direct guild accounts with zero intermediary margin cuts.
                </div>
              </div>

              <div className="living-pillar-card">
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-olive)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🛡️</span>
                  <span>Verified GI Tags</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>
                  Legal Geographic Indication origin certification on each artifact.
                </div>
              </div>
            </div>

            <button
              onClick={onScrollToExplore}
              className={`btn-primary scroll-reveal delay-5 ${isInView ? 'is-revealed' : ''}`}
              style={{ padding: '14px 30px', fontSize: '1rem' }}
            >
              <span>{t('explore_title')}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Transition Bridge into Explore Section */}
      <div className={`section-bridge-vision-to-explore scroll-reveal delay-6 ${isInView ? 'is-revealed' : ''}`} aria-hidden="true">
        <div className="bridge-floral-line">
          <div className="bridge-lotus-badge shimmer-badge">
            <span className="animate-float">🪷</span>
            <span>From Hereditary Hands to Your Home • कला यात्रा</span>
            <span className="animate-float" style={{ animationDelay: '1.5s' }}>🪷</span>
          </div>
        </div>
      </div>
    </section>
  );
};

