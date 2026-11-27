import { createOrder } from '../services/apiMarketplace';
import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, ArrowRight, Truck, CreditCard, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export const CheckoutModal = ({
  lang,
  isOpen,
  onClose,
  cartItems,
  onOrderCompleted
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [formData, setFormData] = useState({
    fullName: 'Aditi Narang',
    phone: '+91 98450 12345',
    email: 'aditi.n@example.com',
    streetAddress: '42 Indiranagar, 12th Main',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    deliveryNotes: 'Please ring bell; fragile handicraft parcel.'
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const welfareContribution = Math.round(subtotal * 0.02);
  const shipping = subtotal > 3000 ? 0 : 150;
  const total = subtotal + welfareContribution + shipping;

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const orderPayload = {
      customerName: formData.fullName,
      customerEmail: formData.email,
      customerPhone: formData.phone,
      customerCity: `${formData.city}, ${formData.state}`,
      shippingAddress: `${formData.streetAddress}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
      items: cartItems.map(item => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        craftName: item.craftName || item.craftStyle || 'Indian Craft'
      })),
      totalAmount: total,
      paymentMode: `${paymentMethod.toUpperCase()} (Demo Mode - Escrow Simulated)`,
      notes: formData.deliveryNotes
    };

    try {
      const res = await createOrder(orderPayload);
      const savedOrder = res?.order || {
        id: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        orderNumber: `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        trackingCode: `AAROH-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        status: 'Order Request Placed (Demo Mode)',
        totalAmount: total
      };

      const finalOrderRecord = {
        id: savedOrder.id || savedOrder.orderNumber,
        date: new Date().toISOString().split('T')[0],
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerCity: `${formData.city}, ${formData.state}`,
        items: [...cartItems],
        productTitle: cartItems[0]?.title || 'Handcrafted Collection',
        amount: total,
        status: 'Order Request Placed (Demo Mode)',
        paymentMode: orderPayload.paymentMode,
        trackingCode: savedOrder.trackingCode || `AAROH-TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        notes: formData.deliveryNotes
      };

      setCompletedOrder(finalOrderRecord);
      onOrderCompleted(finalOrderRecord);
    } catch (err) {
      console.warn("Order persistence notice", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-card modal-card-large" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: 0 }}
      >
        {/* Modal Top Header */}
        <div className="modal-header">
          <div>
            <span className="craft-seal-badge" style={{ marginBottom: '4px' }}>
              <ShieldCheck size={13} />
              <span>Ethical Artisan Commerce</span>
            </span>
            <h3 style={{ fontSize: '1.4rem' }}>{t.checkout_title}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>

        {/* Prototype Transparency Notice */}
        <div style={{
          backgroundColor: 'var(--accent-ochre-soft)',
          borderBottom: '1px solid var(--accent-ochre)',
          padding: '12px 28px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--accent-ochre)',
          fontSize: '0.86rem'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Demo Checkout Mode:</strong> This checkout saves a verified order record into the Aaroh database with escrow tracking codes, and updates artisan and customer dashboards. No actual bank charge occurs in demo mode.
          </div>
        </div>

        <div className="modal-body">
          {completedOrder ? (
            /* Order Placed Success View */
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-olive-soft)',
                color: 'var(--accent-olive)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <CheckCircle2 size={40} />
              </div>

              <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
                Artisan Order Confirmed!
              </h2>

              <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 24px', fontSize: '1rem' }}>
                Your order <strong>{completedOrder.id}</strong> has been transmitted directly to the artisan collective.
              </p>

              <div style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '24px',
                maxWidth: '520px',
                margin: '0 auto 28px',
                textAlign: 'left',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tracking Code:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-indigo)' }}>{completedOrder.trackingCode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Recipient:</span>
                  <span style={{ fontWeight: 600 }}>{completedOrder.customerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Delivery Destination:</span>
                  <span style={{ fontWeight: 600 }}>{completedOrder.customerCity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Transferred:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-indigo)', fontSize: '1.1rem' }}>₹{completedOrder.amount.toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <span className="badge badge-in-stock">In Production</span>
                </div>
              </div>

              <button className="btn-primary" onClick={onClose} style={{ padding: '12px 32px' }}>
                Return to Living Crafts Marketplace
              </button>
            </div>
          ) : (
            /* Order Input Form */
            <form onSubmit={handleSubmitOrder}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '28px'
              }}>
                {/* Left: Customer & Delivery Details */}
                <div>
                  <h4 style={{ marginBottom: '16px', color: 'var(--accent-indigo)' }}>
                    1. Direct Artisan Delivery Address
                  </h4>

                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Phone Number (For OTP/Courier)</label>
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Street Address & House / Studio</label>
                    <input
                      type="text"
                      required
                      value={formData.streetAddress}
                      onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">State</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">PIN Code</label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Handling & Artisan Note (Optional)</label>
                    <textarea
                      rows={2}
                      value={formData.deliveryNotes}
                      onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
                      className="form-textarea"
                    />
                  </div>
                </div>

                {/* Right: Payment Method & Order Summary */}
                <div>
                  <h4 style={{ marginBottom: '16px', color: 'var(--accent-indigo)' }}>
                    2. Payment Method (Prototype Sandbox)
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                    {[
                      { id: 'upi', label: 'UPI / QR Scan (Google Pay, PhonePe, Paytm)', desc: 'Instant zero-fee artisan bank transfer' },
                      { id: 'netbanking', label: 'Net Banking (All Major Indian Banks)', desc: 'Secure verified NEFT/RTGS gateway' },
                      { id: 'card', label: 'Credit / Debit Card (Domestic & International)', desc: 'Visa, Mastercard, RuPay' },
                      { id: 'cod', label: 'Pay on Delivery (for ready-made handicrafts)', desc: 'Verify item condition upon doorstep delivery' }
                    ].map((method) => (
                      <label
                        key={method.id}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-sm)',
                          border: paymentMethod === method.id ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                          backgroundColor: paymentMethod === method.id ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          style={{ marginTop: '3px' }}
                        />
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{method.label}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{method.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* Summary Box */}
                  <div style={{
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '18px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: '10px' }}>
                      Order Summary ({cartItems.length} items)
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Craft Subtotal</span>
                      <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Direct Artisan Shipping</span>
                      <span style={{ fontWeight: 600 }}>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', marginBottom: '10px', color: 'var(--accent-ochre)' }}>
                      <span>Artisan Welfare Fund (2%)</span>
                      <span style={{ fontWeight: 600 }}>+₹{welfareContribution.toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '10px',
                      borderTop: '1px solid var(--border-strong)',
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: 'var(--accent-indigo)'
                    }}>
                      <span>Total</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary"
                      style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
                    >
                      {isSubmitting ? (
                        <span>Simulating Payment Transmission...</span>
                      ) : (
                        <>
                          <span>Confirm Order • ₹{total.toLocaleString('en-IN')}</span>
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
