import React, { useState } from 'react';
import { MessageSquare, CheckCircle, Send, ShieldCheck } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export const EnquiryModal = ({
  lang,
  isOpen,
  onClose,
  product,
  onEnquirySubmitted
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [formData, setFormData] = useState({
    customerName: 'Aditi Narang',
    phone: '+91 98450 12345',
    email: 'aditi.n@example.com',
    location: 'Bengaluru, Karnataka',
    quantity: 1,
    purpose: 'Personal Collection',
    preferredContact: 'WhatsApp',
    message: product ? `Inquiring regarding custom dimensions or bulk availability for ${product.title}.` : ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEnquiry = {
      id: `ENQ-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      customerName: formData.customerName,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      customerCity: formData.location,
      productTitle: product ? product.title : 'Direct Artisan Enquiry',
      artisanId: product ? product.artisanId : 'general',
      quantity: Number(formData.quantity),
      purpose: formData.purpose,
      preferredContact: formData.preferredContact,
      status: 'New Enquiry',
      message: formData.message
    };

    setSubmitted(true);
    onEnquirySubmitted(newEnquiry);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="craft-seal-badge" style={{ marginBottom: '4px' }}>
              <MessageSquare size={13} />
              <span>Direct Artisan & Bulk Dialogue</span>
            </span>
            <h3 style={{ fontSize: '1.35rem' }}>
              {product ? `Enquire about: ${product.title}` : 'Artisan Enquiry & Bulk Order'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>

        <div className="modal-body">
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '36px 16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-olive-soft)',
                color: 'var(--accent-olive)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <CheckCircle size={36} />
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                Enquiry Transmitted to Artisan
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 24px' }}>
                Your message has been sent to the artisan's dashboard. They typically reply via {formData.preferredContact} within 24 to 48 hours.
              </p>
              <button className="btn-primary" onClick={onClose}>
                Back to Crafts
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Your Location / City</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Preferred Contact Method</label>
                  <select
                    value={formData.preferredContact}
                    onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value })}
                    className="form-select"
                  >
                    <option value="WhatsApp">WhatsApp (Fastest)</option>
                    <option value="Phone Call">Direct Phone Call</option>
                    <option value="Email">Email Communication</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Requested Quantity</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Purpose of Enquiry</label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="form-select"
                  >
                    <option value="Personal Collection">Personal Collection</option>
                    <option value="Bulk Wedding / Corporate Gifting">Bulk Wedding / Corporate Gifting</option>
                    <option value="Architectural / Interior Project">Architectural / Interior Project</option>
                    <option value="Museum / Academic Exhibition">Museum / Academic Exhibition</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Message / Custom Dimensions / Specific Requirements</label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginBottom: '20px'
              }}>
                <ShieldCheck size={14} color="var(--accent-olive)" />
                <span>Your contact information is only shared with the verified artisan collective.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Send size={15} />
                  <span>Send Enquiry to Artisan</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
