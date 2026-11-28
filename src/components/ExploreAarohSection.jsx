import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ShoppingBag, Eye, MapPin, Sparkles, RotateCcw, ArrowRight, BookOpen, Award } from 'lucide-react';
import { getTranslation } from '../data/translations';
import { CULTURAL_JOURNAL_STORIES } from '../data/mockData';

export const ExploreAarohSection = ({
  lang,
  products,
  onOpenProduct,
  onAddToCart,
  onOpenAuth,
  onOpenArtisanDash,
  currentUser,
  onOpenCommission
}) => {
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
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedStory, setSelectedStory] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedCategory, selectedRegion]);

  const categories = ['All', 'Painting', 'Pottery', 'Metalcraft', 'Handloom & Textiles', 'Embroidery'];
  const regions = ['All', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry'];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesCraft = product.craftName.toLowerCase().includes(q);
        const matchesArtisan = product.artisanName.toLowerCase().includes(q);
        const matchesRegion = product.artisanLocation.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCraft && !matchesArtisan && !matchesRegion) return false;
      }

      if (selectedCategory !== 'All') {
        if (product.category !== selectedCategory) return false;
      }

      if (selectedRegion !== 'All') {
        if (!product.artisanLocation.toLowerCase().includes(selectedRegion.toLowerCase())) return false;
      }

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedRegion]);

  return (
    <section 
      ref={sectionRef}
      id="explore-section"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-surface)',
        padding: 'clamp(64px, 8vw, 110px) 0',
        position: 'relative'
      }}
    >
      <div className="container">
        {/* Step 1: Section Heading */}
        <div 
          className={`scroll-reveal delay-1 ${isInView ? 'is-revealed' : ''}`}
          style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}
        >
          <div className="craft-seal-badge" style={{ marginBottom: '12px' }}>
            <Sparkles size={13} />
            <span>Living Craft Marketplace & Journal</span>
          </div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', marginBottom: '14px' }}>
            {t('explore_title')}
          </h2>
          <p style={{ fontSize: '1.08rem', color: 'var(--text-secondary)' }}>
            {t('explore_sub')}
          </p>
        </div>

        {/* Step 2: Progressive Craft Category Pills */}
        <div 
          className={`scroll-reveal delay-2 ${isInView ? 'is-revealed' : ''}`}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '10px',
            flexWrap: 'wrap',
            marginBottom: '28px'
          }}
        >
          {categories.map((cat, idx) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.88rem',
                fontWeight: 600,
                backgroundColor: selectedCategory === cat ? 'var(--accent-indigo)' : 'var(--bg-surface-subtle)',
                color: selectedCategory === cat ? '#FFF' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              {cat === 'All' ? t('filter_all') : cat}
            </button>
          ))}
        </div>

        {/* Step 3: Search & Region Filter Bar */}
        <div 
          className={`scroll-reveal delay-2 ${isInView ? 'is-revealed' : ''}`}
          style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px 20px',
            display: 'flex',
            gap: '14px',
            flexWrap: 'wrap',
            alignItems: 'center',
            marginBottom: '36px',
            border: '1px solid var(--border-subtle)'
          }}
        >
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by craft, region, or master artisan..."
              className="form-input"
              style={{ paddingLeft: '38px', paddingRight: '12px', fontSize: '0.9rem' }}
            />
          </div>

          <div style={{ width: '200px' }}>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="form-select"
              style={{ padding: '10px 14px', fontSize: '0.88rem' }}
            >
              <option value="All">All States & Regions</option>
              {regions.filter(r => r !== 'All').map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedCategory !== 'All' || selectedRegion !== 'All') && (
            <button
              className="btn-ghost"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedRegion('All');
              }}
              style={{ fontSize: '0.84rem', color: 'var(--accent-rose)' }}
            >
              <RotateCcw size={13} style={{ marginRight: '4px' }} />
              <span>{t('filter_reset')}</span>
            </button>
          )}
        </div>

        {/* Step 4: Selected Products Grid on Calm Backgrounds */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '28px',
          marginBottom: visibleCount < filteredProducts.length ? '32px' : '64px'
        }}>
          {filteredProducts.slice(0, visibleCount).map((product, idx) => (
            <div
              key={product.id}
              className={`product-card scroll-reveal delay-${(idx % 4) + 1} ${isInView ? 'is-revealed' : ''}`}
              onClick={() => onOpenProduct(product.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Product Photo on Calm Neutral Background */}
              <div className="product-image-container">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="product-image"
                  loading="lazy"
                />

                <div className="product-card-hover-overlay" aria-hidden="true" />

                <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 2 }}>
                  <span className={`badge shimmer-badge ${product.readyMade ? 'badge-in-stock' : 'badge-made-to-order'}`}>
                    {product.readyMade ? t('badge_in_stock') : t('badge_made_to_order')}
                  </span>
                </div>

                <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 2 }}>
                  <button
                    className="btn-primary btn-sheen"
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToCart(product);
                    }}
                    style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                  >
                    <ShoppingBag size={14} />
                    <span>₹{product.price.toLocaleString('en-IN')}</span>
                  </button>
                </div>
              </div>

              {/* Product Information */}
              <div className="product-info">
                <div style={{ fontSize: '0.78rem', color: 'var(--accent-ochre)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                  {product.craftName}
                </div>

                <h3 style={{
                  fontSize: '1.18rem',
                  marginBottom: '8px',
                  lineHeight: 1.35,
                  color: 'var(--text-primary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {product.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  <MapPin size={13} color="var(--accent-rose)" />
                  <span>{product.artisanName} • {product.artisanLocation}</span>
                </div>

                <div style={{
                  marginTop: 'auto',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Artisan Price</span>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button className="btn-ghost" style={{ fontSize: '0.82rem', color: 'var(--accent-indigo)', fontWeight: 600 }}>
                    <Eye size={14} />
                    <span>{t('btn_view_details')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visibleCount < filteredProducts.length && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '64px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setVisibleCount((prev) => prev + 12)}
              style={{ padding: '12px 28px', fontSize: '0.95rem', fontWeight: 600 }}
            >
              <span>Load More Crafts</span>
              <span style={{ opacity: 0.75, marginLeft: '8px', fontSize: '0.85rem' }}>
                ({Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length})
              </span>
            </button>
          </div>
        )}

        {/* Step 5: Artisan Chronicles / Story Cards */}
        <div 
          className={`scroll-reveal delay-3 ${isInView ? 'is-revealed' : ''}`}
          style={{
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(28px, 5vw, 48px)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '54px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
            <div>
              <div className="craft-seal-badge" style={{ marginBottom: '8px' }}>
                <BookOpen size={12} />
                <span>Living Oral Archives</span>
              </div>
              <h3 style={{ fontSize: '1.6rem', margin: 0 }}>Stories from the Workshop Floor</h3>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0, maxWidth: '400px' }}>
              Uncut oral histories recorded with hereditary master artisans.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {CULTURAL_JOURNAL_STORIES.map((story) => (
              <div 
                key={story.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  padding: '22px',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(26, 52, 89, 0.09)';
                  e.currentTarget.style.borderColor = 'var(--accent-ochre)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }}
                onClick={() => setSelectedStory(story)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.76rem', color: 'var(--accent-rose)', fontWeight: 600 }}>
                    {story.craft} • {story.readTime}
                  </div>
                  {/* Real animated soundwave indicator */}
                  <div className="soundwave-visualizer" title="Oral Audio Archive Available">
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                    <span className="soundwave-bar" />
                  </div>
                </div>

                <h4 style={{ fontSize: '1.15rem', lineHeight: 1.35, marginBottom: '10px', color: 'var(--text-primary)' }}>
                  {story.title}
                </h4>
                <p style={{
                  fontSize: '0.88rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.55,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  marginBottom: '16px',
                  flex: 1
                }}>
                  {story.previewText}
                </p>
                <button
                  className="btn-ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStory(story);
                  }}
                  style={{ alignSelf: 'flex-start', color: 'var(--accent-indigo)', fontWeight: 600, padding: 0 }}
                >
                  Read Living Story →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Step 6: Clear Action Banners for Joining / Selling */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {/* Sell with Aaroh Card */}
          <div 
            className={`scroll-reveal-left delay-4 ${isInView ? 'is-revealed' : ''}`}
            style={{
              backgroundColor: 'var(--accent-olive-soft)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
              border: '1px solid var(--accent-olive)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(104, 121, 61, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-olive)', fontWeight: 700, marginBottom: '8px' }}>
                <Award size={18} />
                <span>FOR ARTISANS & GUILDS</span>
              </div>
              <h3 style={{ fontSize: '1.45rem', marginBottom: '10px' }}>
                Sell with Aaroh in Your Own Voice
              </h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Speak in Hindi, Bengali, Tamil, or your native dialect. Our studio drafts your listing, computes fair wage costs, and deposits direct customer payments without middleman cuts.
              </p>
            </div>

            <button 
              className="btn-primary btn-sheen"
              onClick={onOpenArtisanDash}
              style={{ alignSelf: 'flex-start', padding: '12px 24px' }}
            >
              <span>Enter Artisan Studio Portal</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* Commission Custom Craft Card */}
          <div 
            className={`scroll-reveal-right delay-4 ${isInView ? 'is-revealed' : ''}`}
            style={{
              backgroundColor: 'var(--accent-ochre-soft)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px',
              border: '1px solid var(--accent-ochre)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(191, 135, 46, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-ochre)', fontWeight: 700, marginBottom: '8px' }}>
                <Sparkles size={18} />
                <span>CUSTOM COMMISSIONS</span>
              </div>
              <h3 style={{ fontSize: '1.45rem', marginBottom: '10px' }}>
                Commission an Heirloom Artwork
              </h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                Collaborate directly with master artisans. Upload reference motifs under verified copyright protections with transparent 85% artisan payout terms.
              </p>
            </div>

            <button 
              className="btn-secondary btn-sheen"
              onClick={() => onOpenCommission(null)}
              style={{ alignSelf: 'flex-start', padding: '12px 24px', borderColor: 'var(--accent-ochre)' }}
            >
              <span>Start Custom Commission</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Story Reader Modal */}
      {selectedStory && (
        <div className="modal-overlay" onClick={() => setSelectedStory(null)}>
          <div className="modal-card modal-card-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="craft-seal-badge" style={{ marginBottom: '4px' }}>
                  {selectedStory.craft}
                </span>
                <h3 style={{ fontSize: '1.4rem' }}>{selectedStory.title}</h3>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>By {selectedStory.author}</div>
              </div>
              <button className="modal-close-btn" onClick={() => setSelectedStory(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto', fontSize: '1.02rem', lineHeight: 1.8 }}>
              {selectedStory.fullContent.split('\n\n').map((p, i) => (
                <p key={i} className={i === 0 ? "drop-cap" : ""} style={{ marginBottom: '16px' }}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
