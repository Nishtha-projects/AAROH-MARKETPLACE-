import React, { useState, useMemo } from 'react';
import { Search, RotateCcw, ShoppingBag, Eye, MapPin, Sparkles, Paintbrush } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export const MarketplaceBrowse = ({
  lang,
  products,
  onOpenProduct,
  onAddToCart,
  selectedCraftFilter,
  setSelectedCraftFilter
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedMaterial, setSelectedMaterial] = useState('All');
  const [selectedAvailability, setSelectedAvailability] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

  const categories = ['All', 'Painting', 'Pottery', 'Metalcraft', 'Handloom & Textiles', 'Embroidery'];
  const regions = [
    'All',
    'Andhra Pradesh',
    'Bihar',
    'Chhattisgarh',
    'Gujarat',
    'Madhya Pradesh',
    'Maharashtra',
    'Odisha',
    'Rajasthan',
    'Tamil Nadu',
    'Uttar Pradesh',
    'West Bengal',
    'Jammu & Kashmir'
  ];
  const materials = ['All', 'Lokta', 'Quartz Stone', 'Beeswax', 'Silk', 'Cotton', 'Rice Paste', 'Pigments'];

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRegion('All');
    setSelectedMaterial('All');
    setSelectedAvailability('All');
    setSelectedCraftFilter(null);
    setSortBy('featured');
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (selectedCraftFilter && product.craftId !== selectedCraftFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesCraft = product.craftName.toLowerCase().includes(q);
        const matchesArtisan = product.artisanName.toLowerCase().includes(q);
        const matchesRegion = product.artisanLocation.toLowerCase().includes(q);
        const matchesState = (product.state || '').toLowerCase().includes(q);
        const matchesMaterial = product.materials.some(m => m.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCraft && !matchesArtisan && !matchesRegion && !matchesState && !matchesMaterial) {
          return false;
        }
      }

      if (selectedCategory !== 'All') {
        if (selectedCategory === 'Painting' && !product.craftName.toLowerCase().includes('painting') && !product.craftName.toLowerCase().includes('pattachitra') && !product.craftName.toLowerCase().includes('art')) return false;
        if (selectedCategory === 'Pottery' && !product.craftName.toLowerCase().includes('pottery')) return false;
        if (selectedCategory === 'Metalcraft' && !product.craftName.toLowerCase().includes('metal') && !product.craftName.toLowerCase().includes('dokra')) return false;
        if (selectedCategory === 'Handloom & Textiles' && !product.craftName.toLowerCase().includes('rogan') && !product.craftName.toLowerCase().includes('kalamkari') && !product.craftName.toLowerCase().includes('textile')) return false;
      }

      if (selectedRegion !== 'All') {
        const stateMatch = (product.state || '').toLowerCase().includes(selectedRegion.toLowerCase());
        const locMatch = product.artisanLocation.toLowerCase().includes(selectedRegion.toLowerCase());
        if (!stateMatch && !locMatch) {
          return false;
        }
      }

      if (selectedMaterial !== 'All') {
        const hasMat = product.materials.some(m => m.toLowerCase().includes(selectedMaterial.toLowerCase()));
        if (!hasMat) return false;
      }

      if (selectedAvailability !== 'All') {
        if (selectedAvailability === 'In Stock' && !product.readyMade) return false;
        if (selectedAvailability === 'Made to Order' && product.readyMade) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      return 0;
    });
  }, [products, searchQuery, selectedCategory, selectedRegion, selectedMaterial, selectedAvailability, selectedCraftFilter, sortBy]);

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedRegion !== 'All' || selectedMaterial !== 'All' || selectedAvailability !== 'All' || selectedCraftFilter;

  return (
    <section id="marketplace-section" className="section-spacing" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '36px'
        }}>
          <div>
            <div className="craft-seal-badge" style={{ marginBottom: '10px' }}>
              <Sparkles size={13} />
              <span>All-India State Craft Directory & Custom Commissions</span>
            </div>
            <h2>Handmade Works & Direct Guild Offerings</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Search by any Indian state (e.g. Rajasthan, Bihar, Odisha, Maharashtra) to buy ready pieces or commission custom work directly from local artisans.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
              style={{ width: 'auto', padding: '8px 14px', fontSize: '0.88rem' }}
            >
              <option value="featured">Curator’s Selection</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Search Bar & Multi-Filter Bar */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            alignItems: 'center'
          }}>
            <div style={{ position: 'relative', gridColumn: 'span 2' }}>
              <Search
                size={18}
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Indian State (e.g., Rajasthan, Bihar), Craft, or Artisan..."
                className="form-input"
                style={{ paddingLeft: '42px' }}
              />
            </div>

            <div>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="form-select"
              >
                <option value="All">All Indian States</option>
                {regions.filter(r => r !== 'All').map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="form-select"
              >
                <option value="All">All Traditional Materials</option>
                {materials.filter(m => m !== 'All').map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedAvailability}
                onChange={(e) => setSelectedAvailability(e.target.value)}
                className="form-select"
              >
                <option value="All">All Availability</option>
                <option value="In Stock">In Stock (Ready to Ship)</option>
                <option value="Made to Order">Made to Order / Custom</option>
              </select>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '18px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSelectedCraftFilter(null);
                  }}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    backgroundColor: selectedCategory === cat && !selectedCraftFilter ? 'var(--accent-indigo)' : 'var(--bg-surface-subtle)',
                    color: selectedCategory === cat && !selectedCraftFilter ? '#FFF' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {cat === 'All' ? t.filter_all : cat}
                </button>
              ))}

              {selectedCraftFilter && (
                <span className="badge badge-in-stock" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>Craft: {selectedCraftFilter}</span>
                  <button onClick={() => setSelectedCraftFilter(null)} style={{ color: 'inherit', fontWeight: 'bold' }}>✕</button>
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                className="btn-ghost"
                onClick={handleResetFilters}
                style={{ color: 'var(--accent-rose)', fontSize: '0.86rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RotateCcw size={14} />
                <span>{t.filter_reset}</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 20px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-strong)'
          }}>
            <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              No artisan works matched your specific filter combination.
            </p>
            <button className="btn-secondary" onClick={handleResetFilters}>
              Reset Filters to View All Crafts
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '28px'
          }}>
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => onOpenProduct(product.id)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image-container">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="product-image"
                    loading="lazy"
                  />

                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 2,
                    display: 'flex',
                    gap: '6px',
                    flexWrap: 'wrap'
                  }}>
                    <span className={`badge ${product.readyMade ? 'badge-in-stock' : 'badge-made-to-order'}`}>
                      {product.readyMade ? t.badge_in_stock : t.badge_made_to_order}
                    </span>
                    {product.state && (
                      <span className="badge" style={{ backgroundColor: 'rgba(20, 20, 30, 0.78)', color: '#fff' }}>
                        {product.state}
                      </span>
                    )}
                  </div>

                  <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    zIndex: 2
                  }}>
                    <button
                      className="btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddToCart(product);
                      }}
                      style={{ padding: '8px 14px', fontSize: '0.84rem' }}
                      title="Add directly to cart"
                    >
                      <ShoppingBag size={14} />
                      <span>₹{product.price.toLocaleString('en-IN')}</span>
                    </button>
                  </div>
                </div>

                <div className="product-info">
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent-ochre)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
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

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    <MapPin size={13} color="var(--accent-rose)" />
                    <span>{product.artisanName} • {product.artisanLocation}</span>
                  </div>

                  <div style={{
                    fontSize: '0.78rem',
                    color: 'var(--accent-olive)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    marginBottom: '12px'
                  }}>
                    <Paintbrush size={13} />
                    <span>Direct Custom Commission Available with Local Artisan</span>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {product.materials.slice(0, 2).map((m, i) => (
                      <span key={i} style={{
                        fontSize: '0.74rem',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-xs)',
                        color: 'var(--text-muted)'
                      }}>
                        {m}
                      </span>
                    ))}
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
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Artisan Price</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      className="btn-ghost"
                      style={{ fontSize: '0.84rem', color: 'var(--accent-indigo)', fontWeight: 600, padding: '4px 8px' }}
                    >
                      <Eye size={14} />
                      <span>{t.btn_view_details}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
