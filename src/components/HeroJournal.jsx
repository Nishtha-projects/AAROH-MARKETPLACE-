import React, { useState } from 'react';
import { ArrowRight, Volume2, Sparkles, Shield, Compass, Heart, Award } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export const HeroJournal = ({ lang, onExploreClick, onSellClick, onJournalClick, onOpenProduct }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  const heroShowcases = [
    {
      artisanName: "Dulari Devi",
      craft: "Madhubani (Mithila) Painting",
      region: "Ranti, Bihar",
      image: "/assets/images/hero-artisan.jpg",
      quote: "When I dip the bamboo nib into lamp soot ink, I am reciting the unwritten poems of my grandmother.",
      audioSnippet: "Maithili Dialect • Living Oral Archive",
      productId: "prod-1"
    },
    {
      artisanName: "Abdul Gafur Khatri",
      craft: "Kutch Rogan Art",
      region: "Nirona, Gujarat",
      image: "/assets/images/kutch-rogan-art.jpg",
      quote: "For eight generations, my family has boiled wild castor oil to paint in the air with an iron stylus.",
      audioSnippet: "Kutchi Oral Tradition • 8th Gen Master",
      productId: "prod-4"
    },
    {
      artisanName: "Sukhmati Baghel",
      craft: "Dokra Lost-Wax Bell Metal",
      region: "Kondagaon, Chhattisgarh",
      image: "/assets/images/dokra-ceremonial-elephant.jpg",
      quote: "The bees give us the wax, the river gives us clay, and the fire sets our ancestors' spirits in bronze.",
      audioSnippet: "Halbi Tribal Dialect • 4000-Yr Metallurgy",
      productId: "prod-3"
    },
    {
      artisanName: "Gopal Lal Kumhar",
      craft: "Jaipur Blue Pottery",
      region: "Kot Jewar, Rajasthan",
      image: "/assets/images/jaipur-blue-pottery-urn.jpg",
      quote: "Our vessels know no earth or clay—only quartz and glass fired with the blue of Rajasthan's skies.",
      audioSnippet: "Dhundhari Guild Tradition",
      productId: "prod-2"
    }
  ];

  const currentShowcase = heroShowcases[activeHeroSlide];

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  return (
    <section className="bg-motif-pattern section-spacing" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Decorative SVG Motif Accents inspired by attached pattern (Swallows, vines, gold stars) */}
      <svg
        className="swallow-accent"
        style={{ top: '30px', left: '2%', width: '90px', height: '90px' }}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        {/* Flying Indigo Swallow */}
        <path
          d="M10 60 C35 50, 60 20, 90 10 C70 35, 55 55, 60 85 C50 65, 35 60, 10 60 Z"
          fill="var(--accent-indigo)"
          opacity="0.85"
        />
        <path
          d="M60 85 C65 95, 75 90, 80 80 C70 78, 65 78, 60 85 Z"
          fill="var(--accent-rose)"
        />
        <circle cx="82" cy="18" r="3" fill="#FFF" />
      </svg>

      <svg
        className="swallow-accent"
        style={{ bottom: '40px', right: '3%', width: '110px', height: '110px' }}
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
      >
        {/* Second Swallow in flight */}
        <path
          d="M90 60 C65 50, 40 20, 10 10 C30 35, 45 55, 40 85 C50 65, 65 60, 90 60 Z"
          fill="var(--accent-indigo)"
          opacity="0.75"
        />
        <circle cx="18" cy="18" r="3" fill="#FFF" />
      </svg>

      {/* Golden 8-Point Stars from the pattern */}
      <div style={{
        position: 'absolute',
        top: '15%',
        right: '18%',
        color: 'var(--accent-ochre)',
        fontSize: '24px',
        opacity: 0.6,
        pointerEvents: 'none'
      }}>
        ✦
      </div>
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '12%',
        color: 'var(--accent-ochre)',
        fontSize: '20px',
        opacity: 0.5,
        pointerEvents: 'none'
      }}>
        ✦
      </div>

      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'clamp(32px, 6vw, 64px)',
          alignItems: 'center'
        }}>
          {/* Left Column: Editorial Headline & Manifesto */}
          <div className="animate-reveal" style={{ maxWidth: '640px' }}>
            {/* Cultural Crest Label */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              backgroundColor: 'var(--accent-ochre-soft)',
              color: 'var(--accent-ochre)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--accent-ochre)',
              fontSize: '0.82rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '20px'
            }}>
              <span>🪷</span>
              <span>{t.hero_badge}</span>
            </div>

            {/* Editorial Headline */}
            <h1 style={{
              marginBottom: '24px',
              color: 'var(--text-primary)',
              lineHeight: 1.15
            }}>
              {t.hero_title}
            </h1>

            {/* Narrative Paragraph */}
            <p style={{
              fontSize: '1.12rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              marginBottom: '32px'
            }}>
              {t.hero_description}
            </p>

            {/* Call to Actions */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              marginBottom: '40px'
            }}>
              <button 
                className="btn-primary"
                onClick={onExploreClick}
                style={{ padding: '14px 32px', fontSize: '1.02rem' }}
              >
                <span>{t.hero_cta_explore}</span>
                <ArrowRight size={18} />
              </button>

              <button 
                className="btn-secondary"
                onClick={onSellClick}
                style={{ padding: '14px 28px', fontSize: '1.02rem' }}
              >
                <Award size={18} color="var(--accent-ochre)" />
                <span>{t.hero_cta_sell}</span>
              </button>
            </div>

            {/* Ethical Guarantees Pills */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.86rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-olive)', fontWeight: 'bold' }}>✓</span>
                <span>Direct 100% Artisan Ownership</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-olive)', fontWeight: 'bold' }}>✓</span>
                <span>Verified GI Geographic Origins</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-olive)', fontWeight: 'bold' }}>✓</span>
                <span>Transparent Fair Wage Pricing</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Magazine Card */}
          <div className="animate-reveal" style={{ animationDelay: '0.15s' }}>
            <div className="hero-art-frame" style={{ backgroundColor: 'var(--bg-surface)' }}>
              {/* Image Frame */}
              <div style={{ position: 'relative', height: '420px', overflow: 'hidden' }}>
                <img 
                  src={currentShowcase.image} 
                  alt={currentShowcase.craft}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* Craft Pill Overlay */}
                <div style={{
                  position: 'absolute',
                  top: '18px',
                  left: '18px',
                  backgroundColor: 'rgba(26, 52, 89, 0.88)',
                  backdropFilter: 'blur(8px)',
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em'
                }}>
                  {currentShowcase.region}
                </div>

                {/* Audio snippet bar */}
                <div style={{
                  position: 'absolute',
                  bottom: '18px',
                  left: '18px',
                  right: '18px',
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  color: '#1C2638'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={toggleAudio}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: isPlayingAudio ? 'var(--accent-rose)' : 'var(--accent-indigo)',
                        color: '#FFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                      title={isPlayingAudio ? "Pause artisan's spoken memory" : "Listen to artisan's native voice"}
                    >
                      <Volume2 size={18} />
                    </button>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        {isPlayingAudio ? "Playing Spoken Memory..." : "Hear the Artisan’s Voice"}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#68793D', fontWeight: 600 }}>
                        {currentShowcase.audioSnippet}
                      </div>
                    </div>
                  </div>

                  {isPlayingAudio && (
                    <div className="waveform-bars">
                      <div className="wave-bar" style={{ animationDelay: '0.1s' }} />
                      <div className="wave-bar" style={{ animationDelay: '0.3s' }} />
                      <div className="wave-bar" style={{ animationDelay: '0.2s' }} />
                      <div className="wave-bar" style={{ animationDelay: '0.4s' }} />
                      <div className="wave-bar" style={{ animationDelay: '0.15s' }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Artisan Caption & Quote */}
              <div style={{ padding: '24px 28px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.35rem', marginBottom: '2px' }}>
                      {currentShowcase.artisanName}
                    </h3>
                    <p style={{ fontSize: '0.88rem', color: 'var(--accent-ochre)', fontWeight: 600 }}>
                      {currentShowcase.craft}
                    </p>
                  </div>

                  <button
                    className="btn-ghost"
                    onClick={() => onOpenProduct(currentShowcase.productId)}
                    style={{ fontSize: '0.85rem', color: 'var(--accent-indigo)' }}
                  >
                    <span>View Artwork</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <blockquote style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.08rem',
                  fontStyle: 'italic',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  borderLeft: '3px solid var(--accent-rose)',
                  paddingLeft: '14px',
                  margin: '12px 0 18px 0'
                }}>
                  "{currentShowcase.quote}"
                </blockquote>

                {/* Showcase Switcher Tabs */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
                    Featured Masters:
                  </span>
                  {heroShowcases.map((s, idx) => (
                    <button
                      key={s.artisanName}
                      onClick={() => {
                        setActiveHeroSlide(idx);
                        setIsPlayingAudio(false);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        backgroundColor: activeHeroSlide === idx ? 'var(--accent-indigo)' : 'var(--bg-surface-subtle)',
                        color: activeHeroSlide === idx ? '#FFF' : 'var(--text-secondary)'
                      }}
                    >
                      {s.artisanName.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
