import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Activity, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  X,
  Clock,
  Laptop,
  User,
  Smartphone,
  Mail,
  Shield,
  Trash2
} from 'lucide-react';
import { 
  changeAccountPassword, 
  fetchSecurityActivity, 
  logoutUser, 
  getActiveSessions, 
  logoutAllOtherSessions 
} from '../services/apiAuth';

export const SecurityModal = ({
  isOpen,
  onClose,
  currentUser,
  onLogoutSuccess
}) => {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password' | 'sessions' | 'activity'
  
  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Active sessions state
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Status & activity state
  const [logs, setLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Live password validation (Max 8 characters requirement)
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(newPassword);
  const isValidLength = newPassword.length >= 4 && newPassword.length <= 8;
  const isPasswordValid = hasUpper && hasLower && hasNumber && hasSpecial && isValidLength;

  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'activity') loadLogs();
      if (activeTab === 'sessions') loadSessions();
    }
  }, [isOpen, activeTab]);

  const loadLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const activityLogs = await fetchSecurityActivity();
      setLogs(activityLogs);
    } catch (err) {
      console.warn("Could not load security logs:", err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const loadSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const activeList = await getActiveSessions();
      setSessions(activeList);
    } catch (err) {
      console.warn("Could not load sessions:", err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isPasswordValid) {
      setErrorMessage("Please ensure your new password satisfies all validation criteria (including maximum 8 characters).");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      await changeAccountPassword({
        currentPassword,
        newPassword,
        confirmPassword
      });

      setSuccessMessage("Password successfully updated and encrypted with Bcrypt!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      loadLogs();
    } catch (err) {
      setErrorMessage(err.message || "Failed to update password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutAllOthers = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const res = await logoutAllOtherSessions();
      setSuccessMessage(res.message || "Terminated all other active sessions.");
      loadSessions();
      loadLogs();
    } catch (err) {
      setErrorMessage(err.message || "Failed to terminate other sessions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogoutCurrent = async () => {
    try {
      await logoutUser();
    } finally {
      onLogoutSuccess();
      onClose();
    }
  };

  if (!isOpen || !currentUser) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" style={{ padding: '16px', zIndex: 1100 }}>
      <div 
        className="modal-card modal-card-large" 
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '780px',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-surface)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-olive-soft)',
              color: 'var(--accent-olive)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                Account Security Sanctuary & Profile
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {currentUser.name} • User ID: <strong>{currentUser.user_id || 'AAROH-MEMBER'}</strong>
              </span>
            </div>
          </div>

          <button className="modal-close-btn" onClick={onClose} aria-label="Close security modal">
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          padding: '0 20px',
          overflowX: 'auto'
        }}>
          {[
            { id: 'profile', label: 'User Profile & Status', icon: User },
            { id: 'password', label: 'Change Password', icon: KeyRound },
            { id: 'sessions', label: 'Active Sessions', icon: Laptop },
            { id: 'activity', label: 'Security Activity Log', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 16px',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--accent-indigo)' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: isActive ? 'var(--accent-indigo)' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Notifications */}
          {errorMessage && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#FFF0F2',
              color: '#B82D43',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              border: '1px solid #F5C6CB'
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#EEF6E8',
              color: '#2D6629',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px',
              border: '1px solid #C3E6CB'
            }}>
              <CheckCircle2 size={16} />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: USER PROFILE & VERIFICATION STATUS */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '620px' }}>
              <div style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                padding: '22px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                      {currentUser.name || currentUser.full_name}
                    </h4>
                    <div style={{ fontSize: '0.88rem', color: 'var(--accent-terracotta)', fontWeight: 600 }}>
                      Role: {currentUser.role === 'artisan' ? 'Master Artisan (शिल्पकार)' : 'Craft Patron & Collector'}
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 14px',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--accent-indigo)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    color: 'var(--accent-indigo)'
                  }}>
                    AAROH ID: {currentUser.user_id}
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '16px',
                  marginTop: '20px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '18px'
                }}>
                  {/* Email & Status */}
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Email Address • ईमेल
                    </div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 600, marginTop: '2px', wordBreak: 'break-all' }}>
                      {currentUser.email}
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.76rem',
                      color: currentUser.email_verified ? 'var(--accent-olive)' : 'var(--text-muted)',
                      marginTop: '4px',
                      fontWeight: 600
                    }}>
                      <CheckCircle2 size={13} />
                      <span>{currentUser.email_verified ? 'Email Verified (Real Server OTP)' : 'Unverified'}</span>
                    </div>
                  </div>

                  {/* Mobile & Status */}
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Mobile Number • मोबाइल नंबर
                    </div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 600, marginTop: '2px' }}>
                      {currentUser.phone || 'Not registered'}
                    </div>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.76rem',
                      color: currentUser.phone_verified ? 'var(--accent-olive)' : 'var(--text-muted)',
                      marginTop: '4px',
                      fontWeight: 600
                    }}>
                      <CheckCircle2 size={13} />
                      <span>{currentUser.phone_verified ? 'Mobile Verified' : 'Standard'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Architecture Guarantees */}
              <div style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Shield size={18} color="var(--accent-indigo)" />
                  <h5 style={{ margin: 0, fontSize: '0.96rem' }}>Cryptographic Session & Password Protection</h5>
                </div>
                <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Your password is encrypted using the <strong>Bcrypt 10-round salted hash algorithm</strong>. Sessions are signed using cryptographically generated JWT tokens validated against your SQLite session ledger.
                </p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Member since: {new Date(currentUser.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} style={{ maxWidth: '520px' }}>
              <div className="form-group">
                <label className="form-label">Current Password • वर्तमान पासवर्ड</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="form-input"
                    placeholder="Enter current password"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">New Password • नया पासवर्ड (Max 8 characters)</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    maxLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Pass@12"
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Criteria Badges */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '6px',
                  marginTop: '10px'
                }}>
                  <div style={{ fontSize: '0.74rem', color: isValidLength ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                    {isValidLength ? '✓' : '○'} Max 8 characters
                  </div>
                  <div style={{ fontSize: '0.74rem', color: hasUpper ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                    {hasUpper ? '✓' : '○'} 1 Uppercase (A-Z)
                  </div>
                  <div style={{ fontSize: '0.74rem', color: hasSpecial ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                    {hasSpecial ? '✓' : '○'} 1 Special symbol
                  </div>
                  <div style={{ fontSize: '0.74rem', color: hasLower ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                    {hasLower ? '✓' : '○'} 1 Lowercase (a-z)
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password • पासवर्ड की पुष्टि करें</label>
                <input
                  type="password"
                  required
                  maxLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-input"
                  placeholder="Re-enter new password"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isPasswordValid}
                className="btn-primary"
                style={{ padding: '12px 28px', marginTop: '8px' }}
              >
                <KeyRound size={16} />
                <span>{isSubmitting ? 'Updating...' : 'Update Password Securely'}</span>
              </button>
            </form>
          )}

          {/* TAB 3: ACTIVE SESSIONS */}
          {activeTab === 'sessions' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Manage active browser sessions connected to your account:
                </div>
                <button
                  type="button"
                  onClick={handleLogoutAllOthers}
                  disabled={isSubmitting}
                  style={{
                    padding: '7px 14px',
                    fontSize: '0.82rem',
                    backgroundColor: '#FFF0F2',
                    color: '#B82D43',
                    border: '1px solid #F5C6CB',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Trash2 size={14} />
                  <span>Logout All Other Sessions</span>
                </button>
              </div>

              {isLoadingSessions ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Loading active sessions...
                </div>
              ) : sessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  1 active session (current browser)
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sessions.map((sess, idx) => (
                    <div
                      key={sess.token_id || idx}
                      style={{
                        padding: '14px 18px',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Laptop size={20} color="var(--accent-indigo)" />
                        <div>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                            {sess.user_agent ? sess.user_agent.slice(0, 45) + '...' : 'Web Browser Session'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            IP Address: {sess.ip_address} • Logged in: {new Date(sess.created_at).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <span style={{
                        fontSize: '0.76rem',
                        padding: '3px 10px',
                        backgroundColor: '#EEF6E8',
                        color: '#2D6629',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 600
                      }}>
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SECURITY ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Server-side security events and authentication history:
                </div>
                <button 
                  className="btn-ghost" 
                  onClick={loadLogs} 
                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                >
                  Refresh Log
                </button>
              </div>

              {isLoadingLogs ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  Loading security audit trail...
                </div>
              ) : logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  No security incidents recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        padding: '12px 16px',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {log.event.replace(/_/g, ' ')}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {log.details || 'System audit checkpoint'} • IP: {log.ip_address}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <Clock size={12} />
                        <span>{new Date(log.created_at).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer / Current Session Termination */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            type="button"
            className="btn-danger"
            onClick={handleLogoutCurrent}
            style={{
              padding: '8px 16px',
              fontSize: '0.85rem',
              backgroundColor: '#FFF0F2',
              color: '#B82D43',
              border: '1px solid #F5C6CB',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={15} />
            <span>Terminate Current Session & Sign Out</span>
          </button>

          <button className="btn-secondary" onClick={onClose} style={{ padding: '8px 18px', fontSize: '0.85rem' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityModal;
