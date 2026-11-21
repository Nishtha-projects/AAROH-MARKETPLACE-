import React, { useState } from 'react';
import { Package, Truck, Heart, MessageSquare, Settings, Sparkles, User, Globe, CheckCircle2, X, ShieldCheck, KeyRound } from 'lucide-react';
import { getTranslation } from '../data/translations';

export const CustomerOrdersModal = ({
  lang,
  isOpen,
  onClose,
  orders,
  currentUser,
  onSignOut,
  onOpenLanguageModal,
  onOpenSecurity
}) => {
  const t = (k) => getTranslation(lang, k);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'saved' | 'commissions' | 'settings' | 'security'

  if (!isOpen || !currentUser) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" style={{ padding: '16px' }}>
      <div 
        className="modal-card modal-card-large" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1040px',
          height: '84vh',
          display: 'flex',
          padding: 0,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#FAF6EE'
        }}
      >
        {/* LEFT: DEEP FOREST GREEN SIDEBAR */}
        <div style={{
          width: '260px',
          backgroundColor: '#1E3524',
          color: '#FAF6EE',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px 18px',
          flexShrink: 0
        }}>
          <div>
            {/* Wooden Badge Header */}
            <div style={{
              backgroundColor: '#2A4732',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              border: '1px solid #3D5F47',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#B6D1BD' }}>
                Connoisseur Portal
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#FAF6EE', margin: '2px 0 0', fontFamily: 'var(--font-serif)' }}>
                {currentUser?.name || currentUser?.displayName || "Art Collector"}
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#9EBEA4', marginTop: '2px' }}>
                {currentUser?.email}
              </div>
              {currentUser?.user_id && (
                <div style={{
                  fontSize: '0.74rem',
                  fontWeight: 'bold',
                  color: '#FAF6EE',
                  backgroundColor: '#3D5F47',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  display: 'inline-block',
                  marginTop: '6px'
                }}>
                  ID: {currentUser.user_id}
                </div>
              )}
            </div>

            {/* Navigation links */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { id: 'orders', label: 'My Artisan Orders', icon: Package, count: orders.length },
                { id: 'saved', label: 'Saved Heirlooms', icon: Heart, count: 3 },
                { id: 'commissions', label: 'Custom Commissions', icon: Sparkles, count: 1 },
                { id: 'security', label: 'Account Security', icon: ShieldCheck },
                { id: 'settings', label: 'Language & Profile', icon: Settings }
              ].map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? '#FAF6EE' : 'transparent',
                      color: isActive ? '#1E3524' : '#D0E0D4',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.88rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: 'none'
                    }}
                  >
                    <Icon size={16} color={isActive ? '#1E3524' : '#9EBEA4'} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.count !== undefined && (
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '2px 7px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isActive ? '#1E3524' : '#2A4732',
                        color: isActive ? '#FFF' : '#B6D1BD',
                        fontWeight: 700
                      }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <button
            onClick={onSignOut}
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #3D5F47',
              color: '#F4A5B5',
              fontSize: '0.84rem',
              fontWeight: 600,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            Sign Out of Account
          </button>
        </div>

        {/* RIGHT: SOFT CREAM CONTENT CANVAS */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          backgroundColor: '#FAF6EE'
        }}>
          {/* Header */}
          <div style={{
            padding: '18px 28px',
            borderBottom: '1px solid #EBE4D5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFDF9'
          }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#7E8BA0' }}>Aaroh Collector’s Sanctuary</span>
              <h2 style={{ fontSize: '1.35rem', color: '#1C2638', margin: 0 }}>
                {activeTab === 'orders' ? 'Active Craft Deliveries' : 
                 (activeTab === 'saved' ? 'Saved Heirlooms' : 
                 (activeTab === 'security' ? 'Account Security & Encryption' : 'Collector Settings'))}
              </h2>
            </div>
            <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
          </div>

          {/* Body */}
          <div style={{ padding: '24px 28px' }}>
            {activeTab === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    style={{
                      backgroundColor: '#FFFDF9',
                      borderRadius: 'var(--radius-lg)',
                      padding: '20px',
                      border: '1px solid #EBE4D5',
                      boxShadow: 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '0.76rem', color: '#7E8BA0' }}>Order #{ord.id} • {ord.date}</span>
                        <h4 style={{ fontSize: '1.15rem', color: '#1C2638', margin: '4px 0' }}>{ord.productTitle}</h4>
                        <div style={{ fontSize: '0.84rem', color: '#BF872E', fontWeight: 600 }}>Artisan Guild: {ord.artisanId}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A3459' }}>₹{ord.amount.toLocaleString('en-IN')}</div>
                        <span className="badge badge-in-stock" style={{ marginTop: '4px' }}>{ord.status}</span>
                      </div>
                    </div>

                    <div style={{
                      backgroundColor: '#FAF5EB',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: '#525E75'
                    }}>
                      <Truck size={15} color="#1A3459" />
                      <span>Tracking ID: <strong>{ord.trackingCode}</strong> • Insured Handicraft Delivery</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'saved' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {['Tree of Eternal Life (Kalpavriksha)', 'Jaipur Blue Pottery Persian Urn', 'Kutch Rogan Silk Shawl'].map((title, i) => (
                  <div key={i} style={{ backgroundColor: '#FFFDF9', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid #EBE4D5' }}>
                    <div style={{ height: '110px', borderRadius: 'var(--radius-sm)', backgroundColor: '#F0EBE0', marginBottom: '10px', overflow: 'hidden' }}>
                      <img src="/assets/images/madhubani-tree-of-life.jpg" alt="Saved" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <h4 style={{ fontSize: '0.98rem', marginBottom: '4px' }}>{title}</h4>
                    <span style={{ fontSize: '0.78rem', color: '#68793D', fontWeight: 600 }}>In Artisan Production</span>
                  </div>
                ))}
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ backgroundColor: '#FFFDF9', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #EBE4D5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#EEF3E4', color: '#68793D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={22} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.15rem', color: '#1A3459' }}>Email Verification Status</h4>
                      <span style={{ fontSize: '0.82rem', color: '#68793D', fontWeight: 600 }}>✓ Verified Email Account</span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#525E75', margin: '0 0 16px' }}>
                    Your primary login email is <strong>{currentUser.email}</strong>. OTP verifications and critical notifications are bound to this address.
                  </p>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button 
                      className="btn-primary" 
                      onClick={() => {
                        onClose();
                        if (onOpenSecurity) onOpenSecurity();
                      }}
                      style={{ padding: '10px 20px', fontSize: '0.88rem' }}
                    >
                      <KeyRound size={15} />
                      <span>Change Password & View Security Logs</span>
                    </button>
                  </div>
                </div>

                <div style={{ backgroundColor: '#FFFDF9', padding: '20px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid #EBE4D5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h5 style={{ margin: 0, fontSize: '0.98rem', color: '#1C2638' }}>Active Session Management</h5>
                    <span style={{ fontSize: '0.82rem', color: '#7E8BA0' }}>Terminate current device token and return to visitor view.</span>
                  </div>
                  <button 
                    onClick={onSignOut}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#FFF0F2',
                      color: '#B82D43',
                      border: '1px solid #F5C6CB',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Logout Now
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div style={{ backgroundColor: '#FFFDF9', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid #EBE4D5' }}>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '16px', color: '#1A3459' }}>Language & Interface Preferences</h4>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #EBE4D5', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Active Language</div>
                    <div style={{ fontSize: '0.84rem', color: '#7E8BA0' }}>Currently displaying in <strong>{lang}</strong> (from 22 scheduled languages)</div>
                  </div>
                  <button className="btn-secondary" onClick={onOpenLanguageModal} style={{ fontSize: '0.84rem' }}>
                    <Globe size={14} />
                    <span>Change Language</span>
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>Account Security & Credentials</div>
                    <div style={{ fontSize: '0.84rem', color: '#7E8BA0' }}>Update password, view verification status, and examine login audit logs.</div>
                  </div>
                  <button 
                    className="btn-primary" 
                    onClick={() => {
                      onClose();
                      if (onOpenSecurity) onOpenSecurity();
                    }} 
                    style={{ fontSize: '0.84rem', padding: '8px 16px' }}
                  >
                    <ShieldCheck size={14} />
                    <span>Security Page</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrdersModal;
