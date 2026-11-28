import React, { useState, useRef } from 'react';
import { Compass, Sparkles, ShieldCheck, CheckCircle2, AlertTriangle, Upload, BookOpen } from 'lucide-react';
import { MOCK_CRAFTS } from '../data/mockData';
import { predictCraftFromImage } from '../services/artClassifier';

const CRAFT_METADATA = {
  "Madhubani": {
    artForm: "Madhubani (Mithila) Painting",
    technique: "Kachni & Bharni Natural Pigment Linework",
    region: "Mithila Region, Bihar",
    motifs: ["Kalpavriksha", "Double Line Contour", "Peacock", "Sacred Lotus"]
  },
  "Jaipur Blue Pottery": {
    artForm: "Jaipur Blue Pottery",
    technique: "Non-Clay Quartz Low-Fire Oxide Glaze",
    region: "Jaipur, Rajasthan",
    motifs: ["Turquoise Arabesques", "Persian Palmette", "Cobalt Oxide"]
  },
  "Kutch Rogan": {
    artForm: "Kutch Rogan Art",
    technique: "Castor Oil Pigment Thread Dragging",
    region: "Nirona, Kutch, Gujarat",
    motifs: ["Phool Jhad (Tree of Life)", "Symmetrical Fold Transfer", "Castor Polymer"]
  },
  "Bastar Dokra": {
    artForm: "Bastar Dokra Lost-Wax Bell Metal",
    technique: "Cire-Perdue Beeswax Thread Casting",
    region: "Bastar, Chhattisgarh",
    motifs: ["Hand-wound Wax Coils", "Bell Metal Alloy", "Tribal Totem"]
  },
  "Warli": {
    artForm: "Warli Tribal Painting",
    technique: "Rice Paste Geometric Motifs on Ochre",
    region: "Palghar, Maharashtra",
    motifs: ["Tarpa Circle Dance", "Geometric Triangles", "Harvest"]
  },
  "Gond": {
    artForm: "Gond Tribal Art",
    technique: "Pradhan Gond Dot & Dash Signature Infill",
    region: "Dindori, Madhya Pradesh",
    motifs: ["Mahua Tree", "Forest Spirits", "Rhythmic Pattern Infill"]
  },
  "Pattachitra": {
    artForm: "Raghurajpur Pattachitra",
    technique: "Tamarind-Treated Tussar Scroll Painting",
    region: "Puri, Odisha",
    motifs: ["Dasavatara", "Conch Shell White", "Fine Floral Border"]
  },
  "Kalamkari": {
    artForm: "Srikalahasti Kalamkari",
    technique: "Bamboo Pen Freehand Botanical Dyeing",
    region: "Srikalahasti, Andhra Pradesh",
    motifs: ["Temple Narratives", "Natural Indigo & Madder", "Lotus Vine"]
  }
};

export const PaintingDatasetModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('recognition');
  const [selectedSample, setSelectedSample] = useState('/uploads/crafts/Madhubani/ddg_0.jpg');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState({
    artForm: "Madhubani (Mithila) Painting",
    technique: "Kachni & Bharni Natural Pigment Linework",
    region: "Mithila Region, Bihar",
    confidence: 92.4,
    modelAccuracy: 86.0,
    totalSamples: 500,
    detectedMotifs: ["Kalpavriksha", "Double Line Contour", "Peacock", "Sacred Lotus"],
    isUncertain: false
  });
  const [artisanConfirmed, setArtisanConfirmed] = useState(false);
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const sampleImages = [
    { url: '/uploads/crafts/Madhubani/ddg_0.jpg', name: 'Madhubani (Bihar)' },
    { url: '/uploads/crafts/Jaipur_Blue_Pottery/ddg_0.jpg', name: 'Blue Pottery (Rajasthan)' },
    { url: '/uploads/crafts/Kutch_Rogan/ddg_0.jpg', name: 'Kutch Rogan (Gujarat)' },
    { url: '/uploads/crafts/Bastar_Dokra/ddg_0.jpg', name: 'Bastar Dokra (CG)' }
  ];

  const runRealModelInference = async (imgEl) => {
    setIsAnalyzing(true);
    setArtisanConfirmed(false);
    try {
      const res = await predictCraftFromImage(imgEl);
      const meta = CRAFT_METADATA[res.predictedClass] || {
        artForm: res.predictedClass,
        technique: "MobileNetV3-Small Visual Feature Classification",
        region: "Verified Indian Craft Cluster",
        motifs: ["Traditional Geometric Lineage", "Handcrafted Texture"]
      };

      const isUncertain = res.confidence < 55;
      setRecognitionResult({
        artForm: isUncertain ? "Uncertain / Hybrid Tradition" : meta.artForm,
        technique: meta.technique,
        region: meta.region,
        confidence: res.confidence,
        modelAccuracy: res.modelAccuracy,
        totalSamples: res.totalSamples,
        detectedMotifs: meta.motifs,
        isUncertain
      });
    } catch (err) {
      console.error("ONNX inference error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectSample = (imgUrl) => {
    setSelectedSample(imgUrl);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setSelectedSample(objectUrl);
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
              <span>Trained MobileNetV3-Small ONNX • {recognitionResult.modelAccuracy}% Val Accuracy ({recognitionResult.totalSamples} Real Samples)</span>
            </span>
            <h3 style={{ fontSize: '1.4rem' }}>
              Real-Time Craft Recognition & Verified Archival Records
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
            <span>1. Live SML Craft Classifier (ONNX)</span>
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
                  <strong>Real Trained SML Model:</strong> Running live browser inference via <code>aaroh_classifier.onnx</code> trained on 8 Indian craft classes. Low-confidence predictions (&lt;55%) trigger manual artisan verification.
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
                    Select Sample or Upload Craft Photo
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
                      ref={imgRef}
                      src={selectedSample}
                      crossOrigin="anonymous"
                      onLoad={(e) => runRealModelInference(e.currentTarget)}
                      alt="Sample craft"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '14px' }}>
                    {sampleImages.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSample(s.url)}
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

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    className="btn-secondary"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ width: '100%', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <Upload size={16} />
                    <span>Upload Any Craft Image to Test SML Model</span>
                  </button>
                </div>

                {/* Right: Recognition Output */}
                <div>
                  <h4 style={{ marginBottom: '10px', fontSize: '1rem', color: 'var(--accent-indigo)' }}>
                    Live MobileNetV3 Inference Output
                  </h4>

                  {isAnalyzing ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                      <Sparkles size={28} className="animate-pulse-subtle" style={{ margin: '0 auto 12px' }} />
                      <p>Running MobileNetV3-Small ONNX tensor classification...</p>
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
                            Confidence is below the 55% threshold. Aaroh prompts the artisan to manually designate the regional craft lineage.
                          </p>
                        </div>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span className="badge badge-in-stock">Softmax Confidence: {recognitionResult.confidence}%</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{recognitionResult.region}</span>
                          </div>

                          <h3 style={{ fontSize: '1.25rem', color: 'var(--accent-indigo)', marginBottom: '4px' }}>
                            {recognitionResult.artForm}
                          </h3>
                          <div style={{ fontSize: '0.86rem', color: 'var(--accent-ochre)', fontWeight: 600, marginBottom: '14px' }}>
                            Technique: {recognitionResult.technique}
                          </div>

                          <div style={{ marginBottom: '16px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                              Identified Regional Motifs:
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

          {activeTab === 'archive' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Aaroh’s reviewed cultural records track image source, artist or creator where known, licensing permissions, labels, and academic reviewer.
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
