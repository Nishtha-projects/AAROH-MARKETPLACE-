import React, { useState, useMemo } from 'react';
import { Search, Globe, Check, Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';
import { INDIAN_SCHEDULED_LANGUAGES } from '../data/translations';

// Combine primary supported with scheduled languages, avoiding duplicate codes
const ALL_LANGUAGES = [
  ...SUPPORTED_LANGUAGES.map(l => ({
    code: l.code,
    name: l.name,
    nativeName: l.nativeName,
    script: l.dir === 'rtl' ? 'Arabic (RTL)' : (l.code === 'hi' || l.code === 'mr' ? 'Devanagari' : l.name),
    status: 'full',
    flag: l.flag,
    dir: l.dir,
    region: l.code === 'ar' ? 'Middle East & Global' : (l.code === 'fr' ? 'France & Francophone' : (l.code === 'es' ? 'Spain & Latin America' : (l.code === 'en' ? 'Global & India' : 'India')))
  })),
  ...INDIAN_SCHEDULED_LANGUAGES
    .filter(isl => !SUPPORTED_LANGUAGES.some(sl => sl.code === isl.code))
    .map(isl => ({
      code: isl.code,
      name: isl.name,
      nativeName: isl.nativeName,
      script: isl.script,
      status: isl.status || 'preview',
      flag: '🇮🇳',
      dir: isl.direction || 'ltr',
      region: isl.region
    }))
];

export const LanguageSelectorModal = ({ isOpen, onClose, currentLang, onSelectLanguage }) => {
  const { i18n, t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return ALL_LANGUAGES;
    const q = searchQuery.toLowerCase().trim();
    return ALL_LANGUAGES.filter(
      l => l.name.toLowerCase().includes(q) || 
           l.nativeName.toLowerCase().includes(q) ||
           l.script.toLowerCase().includes(q) ||
           (l.region && l.region.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-card modal-card-large" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px', padding: 0 }}
      >
        {/* Header */}
        <div className="modal-header" style={{ padding: '20px 28px' }}>
          <div>
            <div className="craft-seal-badge" style={{ marginBottom: '6px' }}>
              <Globe size={13} />
              <span>{t('lang_selector_title', 'Multilingual Aaroh')}</span>
            </div>
            <h3 style={{ fontSize: '1.4rem', margin: 0 }}>
              Select Language / भाषा चुनें / اختر اللغة
            </h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              11 Fully Localized Languages (English, Hindi, Punjabi, Bengali, Tamil, Telugu, Marathi, Gujarati, French, Spanish, Arabic) + Regional Scripts.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close language selector">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 28px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-subtle)' }}>
          <div style={{ position: 'relative' }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
            />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by language (e.g., हिन्दी, ਪੰਜਾਬੀ, বাংলা, தமிழ், Français, Español, العربية)..."
              className="form-input"
              style={{ paddingLeft: '44px', fontSize: '0.96rem' }}
            />
          </div>
        </div>

        {/* Transparency Notice */}
        <div style={{
          padding: '10px 28px',
          backgroundColor: 'var(--accent-ochre-soft)',
          borderBottom: '1px solid var(--accent-ochre)',
          fontSize: '0.8rem',
          color: 'var(--accent-ochre)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Sparkles size={14} style={{ flexShrink: 0 }} />
          <span>
            <strong>Instant Localization:</strong> Switching language updates navigation, buttons, forms, authentication, OTP messages, and admin interface immediately. Arabic activates full RTL layout.
          </span>
        </div>

        {/* Language Grid */}
        <div style={{
          maxHeight: '55vh',
          overflowY: 'auto',
          padding: '24px 28px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '12px'
        }}>
          {filteredLanguages.map((langItem) => {
            const isSelected = currentLang === langItem.code;
            return (
              <button
                key={langItem.code}
                onClick={() => {
                  i18n.changeLanguage(langItem.code);
                  if (typeof onSelectLanguage === 'function') onSelectLanguage(langItem.code);
                  onClose();
                }}
                style={{
                  textAlign: langItem.dir === 'rtl' ? 'right' : 'left',
                  direction: langItem.dir === 'rtl' ? 'rtl' : 'ltr',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: isSelected ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  backgroundColor: isSelected ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: isSelected ? 'var(--accent-indigo)' : 'var(--text-primary)',
                    lineHeight: 1.2
                  }}>
                    {langItem.nativeName}
                  </span>
                  {isSelected && (
                    <span style={{ color: 'var(--accent-indigo)' }}>
                      <Check size={16} />
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  {langItem.name} {langItem.flag && <span>{langItem.flag}</span>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {langItem.script}
                  </span>

                  <span style={{
                    fontSize: '0.68rem',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    backgroundColor: langItem.status === 'full' ? 'var(--accent-olive-soft)' : 'var(--accent-ochre-soft)',
                    color: langItem.status === 'full' ? 'var(--accent-olive)' : 'var(--accent-ochre)',
                    border: langItem.status === 'full' ? '1px solid var(--accent-olive)' : '1px solid var(--accent-ochre)'
                  }}>
                    {langItem.status === 'full' ? "Full" : "Preview"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between', padding: '14px 28px' }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Showing {filteredLanguages.length} Languages
          </span>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelectorModal;
