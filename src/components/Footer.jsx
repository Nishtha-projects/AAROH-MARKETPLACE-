import React from 'react';
import { ShieldCheck, Heart, Sparkles, Feather, Compass, Mail, Phone, ExternalLink } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export const Footer = ({ lang, onOpenRecognition }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <footer style={{
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: '64px',
      paddingBottom: '36px',
      color: 'var(--text-secondary)'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '54px'
        }}>
          {/* Brand Manifesto Column */}
          <div style={{ maxWidth: '360px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-indigo)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}>
                🪷
              </div>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Aaroh
              </span>
            </div>

            <p style={{ fontSize: '0.92rem', lineHeight: 1.65, marginBottom: '18px' }}>
              An animated cultural journal and marketplace celebrating traditional and lesser-known Indian arts. We empower artisans to present their creations in their own words, ensuring fair trade and living heritage preservation.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--accent-olive)', fontWeight: 600 }}>
              <ShieldCheck size={16} />
              <span>TLS 1.3 Certified Encrypted Infrastructure</span>
            </div>
          </div>

          {/* Living Crafts Lineages */}
          <div>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Living Traditions
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li><a href="#marketplace-section" style={{ transition: 'color 0.2s' }}>Madhubani / Mithila Painting (Bihar)</a></li>
              <li><a href="#marketplace-section" style={{ transition: 'color 0.2s' }}>Jaipur Blue Pottery (Rajasthan)</a></li>
              <li><a href="#marketplace-section" style={{ transition: 'color 0.2s' }}>Dokra Lost-Wax Bell Metal (Bastar)</a></li>
              <li><a href="#marketplace-section" style={{ transition: 'color 0.2s' }}>Kutch Rogan Castor Art (Gujarat)</a></li>
              <li><a href="#marketplace-section" style={{ transition: 'color 0.2s' }}>Raghurajpur Pattachitra (Odisha)</a></li>
              <li><a href="#marketplace-section" style={{ transition: 'color 0.2s' }}>Toda Tribal Pukhoor (Nilgiris)</a></li>
            </ul>
          </div>

          {/* Cultural Knowledge & Tools */}
          <div>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Cultural Archives
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li>
                <button 
                  onClick={onOpenRecognition}
                  style={{ textAlign: 'left', color: 'var(--accent-indigo)', fontWeight: 600, fontSize: '0.9rem' }}
                >
                  Painting Recognition & Heritage Records
                </button>
              </li>
              <li><a href="#journal-section">Peer-Reviewed Cultural Journal</a></li>
              <li><a href="#crafts-section">Geographical Indications (GI) Register</a></li>
              <li><a href="#commissions-section">Custom Commission Rights & Payout Policy</a></li>
              <li><a href="#top">Artisan Fair Wage Index</a></li>
            </ul>
          </div>

          {/* Governance, Security & Contact */}
          <div>
            <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Ethics & Trust
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem' }}>
              <li><a href="#top">Artisan Welfare Fund (2% Direct Contribution)</a></li>
              <li><a href="#top">OWASP Level 2 Identity Authentication</a></li>
              <li><a href="#top">Privacy Policy & Non-Tracking Guarantee</a></li>
              <li><a href="#top">Terms of Cultural Stewardship</a></li>
              <li style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                Helpline: support@aarohcrafts.org
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Motifs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          paddingTop: '28px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div>
            © {new Date().getFullYear()} Aaroh Cultural Foundation & Artisan Guilds. All rights reserved.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span>Warm Ivory, Indigo & Rose Living Palette</span>
            <span>•</span>
            <span>India’s Living Heritage</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
