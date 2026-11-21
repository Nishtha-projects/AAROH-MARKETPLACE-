import React, { useState } from 'react';
import { CULTURAL_JOURNAL_STORIES } from '../data/mockData';
import { BookOpen, Clock, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export const CulturalJournalSection = ({ lang }) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [selectedStory, setSelectedStory] = useState(null);

  return (
    <section id="journal-section" className="section-spacing bg-motif-pattern">
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 54px' }}>
          <div className="craft-seal-badge" style={{ marginBottom: '14px' }}>
            <BookOpen size={13} />
            <span>Aaroh Cultural Journal • खंड १</span>
          </div>
          <h2 style={{ marginBottom: '16px' }}>
            Living Chronicles of Indian Craft Traditions
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>
            Peer-reviewed field essays, oral histories, and technical records exploring the sacred geometry, natural chemistry, and human hands that preserve our crafts.
          </p>
        </div>

        {/* Journal Stories Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '36px'
        }}>
          {CULTURAL_JOURNAL_STORIES.map((story, idx) => (
            <article 
              key={story.id} 
              className="product-card"
              style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-surface)'
              }}
            >
              <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                <img 
                  src={story.image} 
                  alt={story.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '14px',
                  left: '14px',
                  backgroundColor: 'rgba(26, 52, 89, 0.85)',
                  backdropFilter: 'blur(6px)',
                  color: '#FFF',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.74rem',
                  fontWeight: 600
                }}>
                  {story.craft}
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '14px',
                  right: '14px',
                  backgroundColor: 'rgba(0, 0, 0, 0.65)',
                  color: '#FFF',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock size={12} />
                  <span>{story.readTime}</span>
                </div>
              </div>

              <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--accent-ochre)', fontWeight: 600, marginBottom: '8px' }}>
                  By {story.author}
                </div>

                <h3 style={{
                  fontSize: '1.35rem',
                  lineHeight: 1.3,
                  marginBottom: '12px',
                  color: 'var(--text-primary)'
                }}>
                  {story.title}
                </h3>

                <p style={{
                  fontSize: '0.94rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: '20px',
                  flex: 1
                }}>
                  {story.previewText}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {story.tags.slice(0, 2).map((tag, i) => (
                      <span key={i} style={{
                        fontSize: '0.72rem',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--text-muted)'
                      }}>
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button 
                    className="btn-ghost"
                    onClick={() => setSelectedStory(story)}
                    style={{ color: 'var(--accent-indigo)', fontWeight: 600, padding: '4px 8px' }}
                  >
                    <span>Read Essay</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Full Journal Story Reader Modal */}
      {selectedStory && (
        <div className="modal-overlay" onClick={() => setSelectedStory(null)}>
          <div 
            className="modal-card modal-card-large" 
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '0' }}
          >
            {/* Story Header Hero Image */}
            <div style={{ position: 'relative', height: '320px', overflow: 'hidden' }}>
              <img 
                src={selectedStory.image} 
                alt={selectedStory.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button 
                className="modal-close-btn" 
                onClick={() => setSelectedStory(null)}
                style={{
                  position: 'absolute',
                  top: '18px',
                  right: '18px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                ✕
              </button>
              <div style={{
                position: 'absolute',
                bottom: '18px',
                left: '24px',
                backgroundColor: 'rgba(26, 52, 89, 0.9)',
                color: '#FFF',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600
              }}>
                {selectedStory.craft} • {selectedStory.readTime}
              </div>
            </div>

            <div style={{ padding: ' clamp(24px, 5vw, 44px)' }}>
              <div style={{ fontSize: '0.88rem', color: 'var(--accent-ochre)', fontWeight: 600, marginBottom: '6px' }}>
                DOCUMENTED BY {selectedStory.author.toUpperCase()}
              </div>

              <h2 style={{ fontSize: 'clamp(1.7rem, 4vw, 2.4rem)', lineHeight: 1.25, marginBottom: '14px' }}>
                {selectedStory.title}
              </h2>

              <p style={{
                fontSize: '1.18rem',
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                marginBottom: '32px',
                borderLeft: '3px solid var(--accent-rose)',
                paddingLeft: '18px'
              }}>
                {selectedStory.subtitle}
              </p>

              {/* Full Content with Drop Cap */}
              <div style={{ fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--text-primary)' }}>
                {selectedStory.fullContent.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className={idx === 0 ? "drop-cap" : ""} style={{ marginBottom: '20px' }}>
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Strict separation of Reviewed Archival Source */}
              <div className="archival-record-box" style={{ marginTop: '36px' }}>
                <div className="archival-header">
                  <ShieldCheck size={16} />
                  <span>Curatorial Review & Bibliographical Verification</span>
                </div>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  <strong>Reviewed & Verified By:</strong> {selectedStory.reviewedBy}
                </p>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  <strong>Academic Citations:</strong>
                  <ul style={{ paddingLeft: '18px', marginTop: '6px', lineHeight: 1.6 }}>
                    {selectedStory.citations.map((cite, i) => (
                      <li key={i}>{cite}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setSelectedStory(null)}
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
