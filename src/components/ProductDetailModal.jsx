import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MessageSquare, 
  Sparkles, 
  MapPin, 
  ShieldCheck, 
  Info, 
  Clock, 
  Ruler, 
  Heart, 
  Share2, 
  ChevronRight,
  BookOpen,
  Volume2,
  Play,
  Pause
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export const ProductDetailModal = ({
  lang,
  product,
  onClose,
  onAddToCart,
  onOpenEnquiry,
  onOpenCommission
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [activeTab, setActiveTab] = useState('artisan'); // 'artisan' | 'archive'
  const [selectedImage, setSelectedImage] = useState(product?.image || '');
  const [quantity, setQuantity] = useState(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!product) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-card modal-card-large" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0 }}
      >
        {/* Modal Top Bar */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            <span>Living Crafts</span>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>{product.craftName}</span>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close product view">
            ✕
          </button>
        </div>

        {/* Modal Body: Split 2 Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '32px',
          padding: 'clamp(20px, 4vw, 36px)',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          {/* Left Column: Image Gallery on Calm Background */}
          <div>
            <div style={{
              backgroundColor: 'var(--product-bg)',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              aspectRatio: '1 / 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)',
              marginBottom: '14px'
            }}>
              <img 
                src={selectedImage} 
                alt={product.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>

            {/* Thumbnail switcher if multiple photos exist */}
            {product.gallery && product.gallery.length > 1 && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {product.gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      border: selectedImage === imgUrl ? '2px solid var(--accent-indigo)' : '1px solid var(--border-strong)',
                      padding: 0,
                      backgroundColor: 'var(--product-bg)'
                    }}
                  >
                    <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Craft Origin Box */}
            <div style={{
              marginTop: '24px',
              padding: '16px',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', color: 'var(--accent-olive)', fontWeight: 600, fontSize: '0.85rem' }}>
                <ShieldCheck size={16} />
                <span>Geographic Indication & Origin Tracking</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                Certified genuine craft produced in {product.artisanLocation}. Sourced without middleman markups.
              </p>
            </div>
          </div>

          {/* Right Column: Narrative, Details, Specs & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
              <span className="craft-seal-badge">
                {product.craftName}
              </span>

              <span className={`badge ${product.readyMade ? 'badge-in-stock' : 'badge-made-to-order'}`}>
                {product.availability}
              </span>
            </div>

            <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 1.9rem)', lineHeight: 1.25, marginBottom: '12px' }}>
              {product.title}
            </h2>

            {/* Artisan Credential Line */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              paddingBottom: '16px',
              borderBottom: '1px solid var(--border-subtle)',
              marginBottom: '18px'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-indigo)',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}>
                {product.artisanName[0]}
              </div>
              <div>
                <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {product.artisanName}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {product.artisanLocation}
                </div>
              </div>
            </div>

            {/* Price and Stock Notice */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                (Inclusive of all artisan guild compensation)
              </span>
            </div>

            {/* CRITICAL SEPARATION TABS */}
            <div style={{
              display: 'flex',
              borderBottom: '2px solid var(--border-subtle)',
              marginBottom: '20px'
            }}>
              <button
                onClick={() => setActiveTab('artisan')}
                style={{
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  color: activeTab === 'artisan' ? 'var(--accent-indigo)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'artisan' ? '2px solid var(--accent-indigo)' : 'none',
                  marginBottom: '-2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>🪷</span>
                <span>{t.tab_artisan_voice}</span>
              </button>

              <button
                onClick={() => setActiveTab('archive')}
                style={{
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  color: activeTab === 'archive' ? 'var(--accent-indigo)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'archive' ? '2px solid var(--accent-indigo)' : 'none',
                  marginBottom: '-2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <BookOpen size={15} />
                <span>{t.tab_cultural_archive}</span>
              </button>
            </div>

            {/* Tab 1: Artisan's Personal Story (In their own words) */}
            {activeTab === 'artisan' && (
              <div style={{ marginBottom: '24px' }}>
                <div className="artisan-quote-ribbon">
                  <p style={{ fontSize: '1.02rem', lineHeight: 1.7, color: 'var(--text-primary)' }}>
                    "{product.artisanStory}"
                  </p>
                  <div style={{ marginTop: '10px', fontSize: '0.82rem', color: 'var(--accent-rose)', fontWeight: 600, fontStyle: 'normal' }}>
                    — Recorded in conversation with {product.artisanName}
                  </div>
                </div>

                {product.oralAudioUrl && (
                  <div className="oral-archive-player" style={{ marginBottom: '16px' }}>
                    <button
                      type="button"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: '#68793D',
                        color: '#FFF',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer'
                      }}
                      title="Listen to original oral recording"
                    >
                      {isPlayingAudio ? <Pause size={16} /> : <Play size={16} style={{ marginLeft: '2px' }} />}
                    </button>
                    <audio
                      src={product.oralAudioUrl}
                      autoPlay={isPlayingAudio}
                      onEnded={() => setIsPlayingAudio(false)}
                      style={{ display: 'none' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#1A3459', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Volume2 size={14} color="#68793D" />
                        <span>Listen to Artisan's Spoken Narrative</span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Original living oral archive recorded directly in the artisan's voice
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  <strong>Curatorial Note:</strong> {product.curatorNote}
                </div>
              </div>
            )}

            {/* Tab 2: Curated & Researched Cultural Heritage Background */}
            {activeTab === 'archive' && (
              <div style={{ marginBottom: '24px' }}>
                <div className="archival-record-box" style={{ margin: 0 }}>
                  <div className="archival-header">
                    <ShieldCheck size={16} />
                    <span>Peer-Reviewed Living Heritage Documentation</span>
                  </div>
                  <p style={{ fontSize: '0.96rem', lineHeight: 1.65, color: 'var(--text-primary)', marginBottom: '12px' }}>
                    {product.culturalContext}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Documentation preserved in Aaroh Cultural Archives. Separate from artisan subjective claims.
                  </p>
                </div>
              </div>
            )}

            {/* Specifications Matrix */}
            <div style={{
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px 20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              fontSize: '0.86rem',
              marginBottom: '24px'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>{t.label_materials}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.materials.join(', ')}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>{t.label_dimensions}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.dimensions}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>Fulfillment Model</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {product.readyMade ? "Ready-made (Ships in 48h)" : `Made to order (${product.leadTimeDays} days)`}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.78rem' }}>{t.label_care}</span>
                <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>{product.care}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 8px',
                  backgroundColor: 'var(--bg-surface)'
                }}>
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    style={{ width: '32px', height: '32px', fontWeight: 'bold' }}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span style={{ padding: '0 12px', fontWeight: 600 }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    style={{ width: '32px', height: '32px', fontWeight: 'bold' }}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  className="btn-primary"
                  onClick={() => {
                    onAddToCart({ ...product, quantity });
                    onClose();
                  }}
                  style={{ flex: 1, padding: '14px 24px' }}
                >
                  <ShoppingBag size={18} />
                  <span>{t.btn_add_to_cart} • ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                </button>
              </div>

              {/* Secondary Actions: Enquire & Custom Commission */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    onOpenEnquiry(product);
                  }}
                  style={{ padding: '10px 16px', fontSize: '0.88rem' }}
                >
                  <MessageSquare size={16} />
                  <span>{t.btn_enquire}</span>
                </button>

                <button
                  className="btn-rose"
                  onClick={() => {
                    onOpenCommission(product);
                  }}
                  style={{ padding: '10px 16px', fontSize: '0.88rem' }}
                >
                  <Sparkles size={16} />
                  <span>{t.btn_custom_commission}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
