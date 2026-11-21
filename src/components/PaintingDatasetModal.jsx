import React, { useState } from 'react';
import { Compass, Sparkles, ShieldCheck, CheckCircle2, AlertCircle, Upload, BookOpen, Layers } from 'lucide-react';
import { MOCK_CRAFTS } from '../data/mockData';

export const PaintingDatasetModal = ({ isOpen, onClose }) => {
  // Active view: 'recognition' | 'archive'
  const [activeTab, setActiveTab] = useState('recognition');

  // Recognition simulation state
  const [selectedSample, setSelectedSample] = useState('/assets/images/madhubani-tree-of-life.jpg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState({
    artForm: "Madhubani (Mithila) Painting",
    technique: "Kachni Style (Fine Line Cross-Hatching)",
    region: "Mithila Region, Northern Bihar",
    confidence: 94,
    detectedMotifs: ["Tree of Life (Kalpavriksha)", "Sacred Peacocks", "Lotus Border", "Double-line contouring"],
    isUncertain: false
  });
  const [artisanConfirmed, setArtisanConfirmed] = useState(false);

  const sampleImages = [
    { url: '/assets/images/madhubani-tree-of-life.jpg', name: 'Mithila Tree of Life', form: 'Madhubani' },
    { url: '/assets/images/jaipur-blue-pottery-urn.jpg', name: 'Persian Blue Urn', form: 'Jaipur Blue Pottery' },
    { url: '/assets/images/kutch-rogan-art.jpg', name: 'Rogan Castor Thread', form: 'Kutch Rogan' },
    { url: '/assets/images/dokra-ceremonial-elephant.jpg', name: 'Bastar Elephant', form: 'Dokra Metalcraft' }
  ];

  const handleRunRecognition = (imgUrl, form) => {
    setSelectedSample(imgUrl);
    setIsAnalyzing(true);
    setArtisanConfirmed(false);

    setTimeout(() => {
      setIsAnalyzing(false);
      if (form === 'Madhubani') {
        setRecognitionResult({
          artForm: "Madhubani (Mithila) Painting",
          technique: "Kachni Geometric Cross-Hatching",
          region: "Bihar",
          confidence: 94,
          detectedMotifs: ["Kalpavriksha", "Double Line Contour", "Peacock", "Sacred Lotus"],
          isUncertain: false
        });
      } else if (form === 'Jaipur Blue Pottery') {
        setRecognitionResult({
          artForm: "Jaipur Blue Pottery",
          technique: "Non-Clay Quartz Low-Fire Glaze",
          region: "Rajasthan",
          confidence: 91,
          detectedMotifs: ["Turquoise Arabesques", "Persian Palmette", "Cobalt Oxide"],
          isUncertain: false
        });
      } else if (form === 'Kutch Rogan') {
        setRecognitionResult({
          artForm: "Kutch Rogan Art",
          technique: "Castor Oil Pigment Thread Dragging",
          region: "Gujarat",
          confidence: 89,
          detectedMotifs: ["Phool Jhad (Tree of Life)", "Symmetrical Fold Transfer", "Castor Polymer"],
          isUncertain: false
        });
      } else {
        // Uncertain simulation demonstration
        setRecognitionResult({
          artForm: "Uncertain / Hybrid Tradition",
          technique: "Ambiguous Motif Geometry",
          region: "Multiple Possibilities (Central India)",
          confidence: 58,
          detectedMotifs: ["Wire lattice", "Stylized animal"],
          isUncertain: true
        });
      }
    }, 700);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-card modal-card-large" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0 }}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <span className="craft-seal-badge" style={{ marginBottom: '4px' }}>
              <Compass size={13} />
              <span>Cultural Knowledge & Dataset Architecture</span>
            </span>
            <h3 style={{ fontSize: '1.4rem' }}>
              Painting Recognition & Verified Archival Records
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* System Separation Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-subtle)',
          padding: '0 24px'
        }}>
          <button
            onClick={() => setActiveTab('recognition')}
            style={{
              padding: '12px 20px',
              fontWeight: activeTab === 'recognition' ? 700 : 500,
              color: activeTab === 'recognition' ? 'var(--accent-indigo)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'recognition' ? '3px solid var(--accent-indigo)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={16} />
            <span>1. Painting Recognition Tool</span>
          </button>

          <button
            onClick={() => setActiveTab('archive')}
            style={{
              padding: '12px 20px',
              fontWeight: activeTab === 'archive' ? 700 : 500,
              color: activeTab === 'archive' ? 'var(--accent-indigo)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'archive' ? '3px solid var(--accent-indigo)' : 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <BookOpen size={16} />
            <span>2. Curated Cultural Archive Records</span>
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* TAB 1: PAINTING RECOGNITION */}
          {activeTab === 'recognition' && (
            <div>
              <div style={{
                backgroundColor: 'var(--accent-ochre-soft)',
                border: '1px solid var(--accent-ochre)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 18px',
                marginBottom: '20px',
                fontSize: '0.86rem',
                color: 'var(--accent-ochre)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                <div>
                  <strong>Architectural Separation:</strong> Painting recognition only suggests likely art form candidates. It never claims cultural significance on its own, explicitly allows <em>Uncertain</em>, and requires the artisan's confirmation.
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '28px'
              }}>
                {/* Left: Input Selection */}
                <div>
                  <h4 style={{ marginBottom: '10px', fontSize: '1rem', color: 'var(--accent-indigo)' }}>
                    Select or Upload Sample Craft Artwork
                  </h4>

                  <div style={{
                    width: '100%',
                    height: '240px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--product-bg)',
                    marginBottom: '14px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <img 
                      src={selectedSample} 
                      alt="Sample craft" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                    {sampleImages.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleRunRecognition(s.url, s.form)}
                        style={{
                          height: '60px',
                          borderRadius: 'var(--radius-sm)',
                          overflow: 'hidden',
                          border: selectedSample === s.url ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                          padding: 0
                        }}
                      >
                        <img src={s.url} alt={s.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                  </div>

                  <button
                    className="btn-secondary"
                    onClick={() => handleRunRecognition(selectedSample, 'Uncertain')}
                    style={{ width: '100%', fontSize: '0.85rem' }}
                  >
                    Test "Uncertain / Ambiguous" Edge Case
                  </button>
                </div>

                {/* Right: Recognition Output */}
                <div>
                  <h4 style={{ marginBottom: '10px', fontSize: '1rem', color: 'var(--accent-indigo)' }}>
                    Model Analysis Output
                  </h4>

                  {isAnalyzing ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                      <Sparkles size={28} className="animate-pulse-subtle" style={{ margin: '0 auto 12px' }} />
                      <p>Analyzing line geometry, pigments, and regional motifs...</p>
                    </div>
                  ) : (
                    <div style={{
                      backgroundColor: 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {recognitionResult.isUncertain ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-rose)', fontWeight: 700, marginBottom: '8px' }}>
                            <AlertTriangle size={18} />
                            <span>Result: UNCERTAIN (Confidence: {recognitionResult.confidence}%)</span>
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                            The visual model could not confidently identify an established traditional school without ambiguous overlap. Aaroh prompts the artisan to manually designate the lineage.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span className="badge badge-in-stock">Confidence: {recognitionResult.confidence}%</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Region: {recognitionResult.region}</span>
                          </div>

                          <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-indigo)', marginBottom: '4px' }}>
                            {recognitionResult.artForm}
                          </h3>
                          <div style={{ fontSize: '0.86rem', color: 'var(--accent-ochre)', fontWeight: 600, marginBottom: '14px' }}>
                            Technique: {recognitionResult.technique}
                          </div>

                          <div style={{ marginBottom: '16px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                              Identified Traditional Motifs:
                            </span>
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {recognitionResult.detectedMotifs.map((m, i) => (
                                <span key={i} style={{
                                  fontSize: '0.76rem',
                                  backgroundColor: 'var(--bg-surface)',
                                  padding: '3px 8px',
                                  borderRadius: 'var(--radius-xs)',
                                  border: '1px solid var(--border-subtle)'
                                }}>
                                  ✓ {m}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Artisan Confirmation Prompt */}
                      <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-strong)', marginTop: '16px' }}>
                        <div style={{ fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
                          <strong>Artisan Confirmation Required:</strong>
                        </div>
                        {artisanConfirmed ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-olive)', fontWeight: 600, fontSize: '0.9rem' }}>
                            <CheckCircle2 size={18} />
                            <span>Confirmed by Artisan Master as Authentic Lineage.</span>
                          </div>
                        ) : (
                          <button
                            className="btn-primary"
                            onClick={() => setArtisanConfirmed(true)}
                            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
                          >
                            <span>I Confirm This Art Form Attribution</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CURATED CULTURAL ARCHIVE */}
          {activeTab === 'archive' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Aaroh’s reviewed cultural records track image source, artist or creator where known, licensing permissions, labels, and academic reviewer. We do not scrape unverified online images.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {MOCK_CRAFTS.map((craft) => (
                  <div
                    key={craft.id}
                    style={{
                      backgroundColor: 'var(--bg-surface-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <span className="badge badge-in-stock" style={{ marginBottom: '4px' }}>{craft.category}</span>
                        <h4 style={{ fontSize: '1.2rem', color: 'var(--accent-indigo)' }}>{craft.name}</h4>
                        <div style={{ fontSize: '0.82rem', color: 'var(--accent-rose)', fontWeight: 600 }}>
                          {craft.region} • {craft.giTag}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                        Curatorial Reviewer:<br />
                        <strong style={{ color: 'var(--accent-olive)' }}>{craft.reviewer}</strong>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '10px 0' }}>
                      {craft.description}
                    </p>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <strong>Peer-Reviewed Literature References:</strong>
                      <ul style={{ paddingLeft: '18px', marginTop: '4px', lineHeight: 1.5 }}>
                        {craft.citations.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
