import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export const CartDrawer = ({
  lang,
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const welfareContribution = Math.round(subtotal * 0.02);
  const shipping = subtotal > 3000 ? 0 : (subtotal > 0 ? 150 : 0);
  const total = subtotal + welfareContribution + shipping;

  return (
    <div className="drawer-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={20} color="var(--accent-indigo)" />
            <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{t.cart_title}</h3>
            <span className="badge" style={{ backgroundColor: 'var(--bg-surface-subtle)' }}>
              {cartItems.reduce((sum, i) => sum + i.quantity, 0)} items
            </span>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close cart">
            <X size={20} />
          </button>
        </div>

        {/* Drawer Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px'
        }}>
          {cartItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: 'var(--accent-ochre)'
              }}>
                <ShoppingBag size={28} />
              </div>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                {t.cart_empty}
              </p>
              <button 
                className="btn-primary" 
                onClick={onClose}
              >
                Browse Living Crafts
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {cartItems.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    gap: '14px',
                    paddingBottom: '16px',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{
                    width: '74px',
                    height: '74px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    backgroundColor: 'var(--product-bg)',
                    flexShrink: 0
                  }}>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--accent-ochre)', fontWeight: 600 }}>
                      {item.craftName}
                    </div>
                    <h4 style={{
                      fontSize: '0.98rem',
                      lineHeight: 1.3,
                      marginBottom: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.title}
                    </h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      By {item.artisanName}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {/* Quantity Controls */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--border-strong)',
                        borderRadius: 'var(--radius-full)',
                        padding: '2px 6px',
                        backgroundColor: 'var(--bg-surface-subtle)'
                      }}>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          style={{ padding: '0 6px', fontWeight: 'bold', fontSize: '0.9rem' }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, padding: '0 6px' }}>{item.quantity}</span>
                        <button 
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          style={{ padding: '0 6px', fontWeight: 'bold', fontSize: '0.9rem' }}
                        >
                          +
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--accent-indigo)', fontSize: '1rem' }}>
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </span>
                        <button 
                          onClick={() => onRemoveItem(item.id)}
                          style={{ color: 'var(--text-muted)' }}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drawer Footer / Cost Breakdown */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface-subtle)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.cart_subtotal}</span>
                <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>{t.cart_shipping}</span>
                <span style={{ fontWeight: 600, color: shipping === 0 ? 'var(--accent-olive)' : 'var(--text-primary)' }}>
                  {shipping === 0 ? t.cart_free : `₹${shipping}`}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-ochre)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Heart size={13} />
                  <span>{t.cart_welfare_fund}</span>
                </span>
                <span style={{ fontWeight: 600 }}>+₹{welfareContribution.toLocaleString('en-IN')}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '10px',
                borderTop: '1px solid var(--border-subtle)',
                fontSize: '1.15rem',
                fontWeight: 700,
                color: 'var(--accent-indigo)'
              }}>
                <span>{t.cart_total}</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div style={{
              fontSize: '0.78rem',
              color: 'var(--text-muted)',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <ShieldCheck size={14} color="var(--accent-olive)" />
              <span>Direct guild payment. 100% funds transferred upon delivery.</span>
            </div>

            <button
              className="btn-primary"
              onClick={onCheckout}
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              <span>{t.cart_checkout}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
