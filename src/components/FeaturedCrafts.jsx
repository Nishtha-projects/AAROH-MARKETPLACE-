import React, { useState } from 'react';
import { MOCK_CRAFTS } from '../data/mockData';
import { ShieldCheck, Sparkles, BookOpen, Layers, MapPin } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export const FeaturedCrafts = ({ lang, onSelectCraftFilter }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [selectedCraft, setSelectedCraft] = useState(null);

  return (
    <section id="crafts-section" className="section-spacing" style={{ backgroundColor: 'var(--bg-surface)' }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 48px' }}>
          <div className="craft-seal-badge" style={{ marginBottom: '14px' }}>
            <Sparkles size={13} />
            <span>Living Craft Lineages</span>
          </div>
          <h2 style={{ marginBottom: '16px' }}>
            Living Traditions & Lesser-Known Guilds
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
            Each tradition carries millennia of ancestral knowledge, natural material chemistry, and oral ritual folklore preserved across generations.
          </p>
        </div>

        {/* Crafts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {MOCK_CRAFTS.map((craft) => (
            <div 
              key={craft.id}
              className="product-card"
              style={{ padding: '24px', cursor: 'pointer' }}
              onClick={() => setSelectedCraft(craft)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <span className="badge" style={{ backgroundColor: 'var(--accent-olive-soft)', color: 'var(--accent-olive)' }}>
                  {craft.category}
                </span>

                {craft.giCertified && (
                  <span className="badge" style={{ backgroundColor: 'var(--accent-ochre-soft)', color: 'var(--accent-ochre)' }}>
                    <ShieldCheck size={12} />
                    <span>{craft.giTag}</span>
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: '1.3rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                {craft.name}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose)', fontSize: '0.86rem', fontWeight: 600, marginBottom: '14px' }}>
                <MapPin size={14} />
                <span>{craft.region}</span>
              </div>

              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '18px',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {craft.description}
              </p>

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {craft.materials.length} Raw Materials
                </span>

                <button 
                  className="btn-ghost"
                  style={{ color: 'var(--accent-indigo)', fontWeight: 600, padding: '4px 8px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectCraftFilter(craft.id);
                    document.getElementById('marketplace-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  View Marketplace Works →
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Ornate Cultural Journal Divider */}
        <div className="ornate-divider">
          <span className="ornate-divider-icon">
            <span>✦</span>
            <span>Traditions Preserved in Their Own Words</span>
            <span>✦</span>
          </span>
        </div>
      </div>

      {/* Craft Detail Modal */}
      {selectedCraft && (
        <div className="modal-overlay" onClick={() => setSelectedCraft(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-in-stock" style={{ marginBottom: '6px' }}>
                  {selectedCraft.category}
                </span>
                <h3 style={{ fontSize: '1.45rem' }}>{selectedCraft.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-rose)', fontSize: '0.88rem', marginTop: '4px' }}>
                  <MapPin size={14} />
                  <span>{selectedCraft.region}</span>
                  <span>•</span>
                  <span>{selectedCraft.giTag}</span>
                </div>
              </div>

              <button className="modal-close-btn" onClick={() => setSelectedCraft(null)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '20px' }}>
                {selectedCraft.description}
              </p>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--accent-indigo)', marginBottom: '8px' }}>
                  Natural & Traditional Raw Materials
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedCraft.materials.map((mat, i) => (
                    <span key={i} style={{
                      backgroundColor: 'var(--bg-surface-subtle)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.84rem',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '1rem', color: 'var(--accent-indigo)', marginBottom: '8px' }}>
                  Sacred & Traditional Motifs
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedCraft.motifs.map((motif, i) => (
                    <span key={i} style={{
                      backgroundColor: 'var(--accent-ochre-soft)',
                      color: 'var(--accent-ochre)',
                      padding: '4px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.82rem',
                      fontWeight: 600
                    }}>
                      {motif}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verified Archival Information Record */}
              <div className="archival-record-box">
                <div className="archival-header">
                  <ShieldCheck size={16} />
                  <span>Curated Archival Record & Citations</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>Curatorial Reviewer:</strong> {selectedCraft.reviewer}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <strong>Academic & Field References:</strong>
                  <ul style={{ paddingLeft: '18px', marginTop: '6px', lineHeight: 1.5 }}>
                    {selectedCraft.citations.map((cite, i) => (
                      <li key={i}>{cite}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary"
                onClick={() => setSelectedCraft(null)}
              >
                Close Record
              </button>
              <button 
                className="btn-primary"
                onClick={() => {
                  const craftId = selectedCraft.id;
                  setSelectedCraft(null);
                  onSelectCraftFilter(craftId);
                  document.getElementById('marketplace-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Browse Marketplace Products
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
