import { createCommission } from '../services/apiMarketplace';
import { Download, FileText, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { Upload, Sparkles, ShieldCheck, CheckCircle, Info, DollarSign, Image as ImageIcon } from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';

export const CustomCommissionModal = ({
  lang,
  isOpen,
  onClose,
  product,
  onCommissionSubmitted
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const [commissionType, setCommissionType] = useState('physical'); // 'physical' | 'digital' | 'license'
  const [licenseChoice, setLicenseChoice] = useState('personal_display'); // 'personal_display' | 'commercial_reproduction' | 'portfolio_only'
  const [imagePreview, setImagePreview] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [rightsHolderModel, setRightsHolderModel] = useState('creator-collaborative');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Custom Ancestral Motif Commission',
    craftStyle: product ? product.craftName : 'Madhubani (Mithila) Painting',
    description: 'A customized rendition of our family lotus symbol rendered with natural mineral dyes and bamboo nibs.',
    dimensions: '20 x 26 inches',
    estimatedBudget: '9500',
    deadlineWeeks: '4'
  });
  const [submitted, setSubmitted] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!hasPermission) {
      alert("Please confirm you have permission to use the reference image.");
      return;
    }

    setIsSubmitting(true);
    const budgetVal = Number(formData.estimatedBudget) || 9500;

    const payload = {
      customerName: "Aditi Narang (Patron)",
      customerEmail: "aditi.n@example.com",
      customerPhone: "+91 98450 12345",
      craftType: formData.craftStyle,
      title: formData.title,
      description: formData.description,
      budget: budgetVal,
      dimensions: formData.dimensions,
      timelineWeeks: Number(formData.deadlineWeeks) || 4,
      referenceImages: imagePreview ? [imagePreview] : [],
      licenseChoice,
      usagePermission: hasPermission,
      isPrivate: true
    };

    try {
      const res = await createCommission(payload);
      const savedComm = res?.commission || {
        id: `COM-${Math.floor(1000 + Math.random() * 9000)}`,
        initialAdvance: Math.round(budgetVal * 0.25),
        status: 'Under Review by Artisan',
        escrowStatus: `Advance Escrow Held (25% - ₹${Math.round(budgetVal * 0.25).toLocaleString('en-IN')})`,
        licenseChoice
      };

      const finalRecord = {
        id: savedComm.id,
        date: new Date().toISOString().split('T')[0],
        title: formData.title,
        craftStyle: formData.craftStyle,
        description: formData.description,
        commissionType,
        licenseChoice,
        budget: budgetVal,
        deadline: `${formData.deadlineWeeks} weeks`,
        status: savedComm.status || 'Under Review by Artisan',
        escrowStatus: savedComm.escrowStatus,
        hasImage: !!imagePreview,
        permissionConfirmed: true
      };

      setSubmitted(true);
      onCommissionSubmitted(finalRecord);
    } catch (err) {
      console.warn("Commission submit notice:", err);
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
        <div className="modal-header">
          <div>
            <span className="craft-seal-badge" style={{ marginBottom: '4px' }}>
              <Sparkles size={13} />
              <span>Artisan Custom Commission</span>
            </span>
            <h3 style={{ fontSize: '1.4rem' }}>{t.custom_commission_title || "Commission Custom Heritage Art"}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">✕</button>
        </div>

        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 16px' }}>
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
                <CheckCircle size={40} />
              </div>
              <h3 style={{ fontSize: '1.6rem', marginBottom: '10px' }}>
                Commission Request Logged
              </h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 20px' }}>
                The artisan collective will review your reference motif, confirm material feasibility, and reply with custom timeline and pricing within 48 hours. No payment is deducted until mutual agreement.
              </p>
              <button className="btn-primary" onClick={onClose}>
                Back to Living Crafts
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Step 1: Commission Type */}
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label" style={{ fontSize: '0.95rem', marginBottom: '8px' }}>
                  1. What format are you commissioning?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  {[
                    { id: 'physical', title: 'Physical Handcrafted Piece', desc: 'Tangible artwork made with authentic natural dyes/alloys' },
                    { id: 'digital', title: 'Archival Digital Master', desc: 'Museum scan (600 DPI) for non-exclusive digital display' },
                    { id: 'license', title: 'Heritage Motif Licensing', desc: 'Agreement for sustainable textile/merchandise production' }
                  ].map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => setCommissionType(opt.id)}
                      style={{
                        border: commissionType === opt.id ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                        backgroundColor: commissionType === opt.id ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
                        padding: '14px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {opt.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {opt.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 2: Reference Image Upload & Transparency */}
              <div style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--accent-indigo)', fontWeight: 600 }}>
                  <ImageIcon size={18} />
                  <span>2. Upload Reference Image & Motif</span>
                </div>

                {/* Explanation of Why the Image is Requested */}
                <div style={{
                  fontSize: '0.84rem',
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-surface)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '14px',
                  borderLeft: '3px solid var(--accent-ochre)'
                }}>
                  <strong>Why we request this image:</strong> Traditional Indian artisans need visual references to evaluate whether the requested design aligns with traditional geometric motifs, natural dye chemical compatibility, and dimensional proportions.
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap'
                }}>
                  <label style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px dashed var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--accent-indigo)'
                  }}>
                    <Upload size={16} />
                    <span>Choose Reference File (JPG / PNG)</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                  </label>

                  {imagePreview && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={imagePreview} 
                        alt="Uploaded preview" 
                        style={{ width: '54px', height: '54px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }} 
                      />
                      <span style={{ fontSize: '0.82rem', color: 'var(--accent-olive)', fontWeight: 600 }}>
                        ✓ Reference Motif Loaded
                      </span>
                    </div>
                  )}
                </div>

                {/* Mandatory Copyright & Permission Confirmation */}
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', fontSize: '0.86rem' }}>
                    <input
                      type="checkbox"
                      required
                      checked={hasPermission}
                      onChange={(e) => setHasPermission(e.target.checked)}
                      style={{ marginTop: '3px' }}
                    />
                    <span style={{ color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      <strong>Copyright & Rights Confirmation:</strong> I confirm that I own the rights to this image or hold verified legal permission to use it as a reference for this custom artisan commission.
                    </span>
                  </label>
                </div>
              </div>

              {/* Explicit IP & Licensing Model Selection */}
              <div style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-indigo)', fontWeight: 600 }}>
                  <ShieldCheck size={18} />
                  <span>3. Select Intellectual Property & Usage License</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  Aaroh requires explicit licensing clarity so artisans and creators mutually understand how this custom work may be used:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    {
                      id: 'personal_display',
                      title: 'Personal Display Only (Non-commercial)',
                      desc: 'Piece is commissioned strictly for private home or office display. Artisan guild retains lineage motif rights.'
                    },
                    {
                      id: 'commercial_reproduction',
                      title: 'Commercial Reproduction & Merchandising',
                      desc: 'Extended manufacturing rights. Requires 10% royalty escrow distribution to the crafting artisan guild.'
                    },
                    {
                      id: 'portfolio_only',
                      title: 'Artisan Portfolio & Exhibition Rights',
                      desc: 'Artisan and commissioner mutually agree to display digital photography in curated heritage archives.'
                    }
                  ].map((lic) => (
                    <label
                      key={lic.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: licenseChoice === lic.id ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                        backgroundColor: licenseChoice === lic.id ? 'var(--bg-surface)' : 'transparent',
                        cursor: 'pointer'
                      }}
                    >
                      <input
                        type="radio"
                        name="licenseChoice"
                        value={lic.id}
                        checked={licenseChoice === lic.id}
                        onChange={() => setLicenseChoice(lic.id)}
                        style={{ marginTop: '3px' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                          {lic.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {lic.desc}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Step 3: Business Model & Transparent Payout Breakdown */}
              <div style={{
                backgroundColor: 'var(--accent-olive-soft)',
                borderRadius: 'var(--radius-md)',
                padding: '18px 20px',
                marginBottom: '24px',
                border: '1px solid var(--accent-olive)'
              }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-olive)', marginBottom: '8px' }}>
                  3. Aaroh Transparent Payout & Royalty Breakdown
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Aaroh solves the custom commission question through transparent, fair-trade revenue sharing:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-olive)' }}>85%</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Crafting Artisan Guild (Materials & Labor)</div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-ochre)' }}>10%</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Image Creator / Rights Holder (Royalties)</div>
                  </div>

                  <div style={{ backgroundColor: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-indigo)' }}>5%</div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Aaroh Platform (Escrow & GI Protection)</div>
                  </div>
                </div>
              </div>

              {/* Step 4: Details & Budget */}
              <div className="responsive-form-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Commission Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Desired Craft School</label>
                  <input
                    type="text"
                    required
                    value={formData.craftStyle}
                    onChange={(e) => setFormData({ ...formData, craftStyle: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Description of Work Wanted</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                />
              </div>

              <div className="responsive-form-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Desired Dimensions</label>
                  <input
                    type="text"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Estimated Budget (₹ INR)</label>
                  <input
                    type="number"
                    value={formData.estimatedBudget}
                    onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Target Weeks</label>
                  <input
                    type="number"
                    min={2}
                    max={16}
                    value={formData.deadlineWeeks}
                    onChange={(e) => setFormData({ ...formData, deadlineWeeks: e.target.value })}
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '12px 28px' }}>
                  <Sparkles size={16} />
                  <span>Submit Commission Proposal</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
