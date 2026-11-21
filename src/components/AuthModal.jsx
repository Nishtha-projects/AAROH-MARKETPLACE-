import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Sparkles, 
  RefreshCw, 
  X, 
  Key, 
  Lock,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { TRANSLATIONS } from '../data/translations';
import { 
  isFirebaseConfigured,
  createRecaptchaVerifier,
  sendPhoneOtp,
  signInWithGoogle,
  signInWithMicrosoft,
  loginWithEmail,
  registerWithEmail,
  sendPasswordReset,
  getFriendlyAuthErrorMessage,
  syncUserProfile,
  fetchUserProfile,
  saveFirebaseConfig,
  clearStoredFirebaseConfig
} from '../services/firebase';

export const AuthModal = ({
  lang,
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  // View modes
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' | 'email'
  const [authSubMode, setAuthSubMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [userRole, setUserRole] = useState('customer'); // 'customer' | 'artisan'
  const [displayName, setDisplayName] = useState('');

  // Phone / OTP state
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(60);

  // Email / Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Firebase project connection state (for live configuration)
  const [showConfigDrawer, setShowConfigDrawer] = useState(!isFirebaseConfigured);
  const [firebaseConfigInput, setFirebaseConfigInput] = useState('');
  const [configParseError, setConfigParseError] = useState(null);

  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authSuccessMsg, setAuthSuccessMsg] = useState(null);

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (isOtpSent && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOtpSent, otpCountdown]);

  // Handle post-authentication profile sync in Firestore
  const completeAuthWithProfile = async (firebaseUser, explicitRole = null) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      // Check if profile exists in Firestore
      let existingProfile = await fetchUserProfile(firebaseUser.uid);

      if (existingProfile && existingProfile.role) {
        // Returning user with defined role
        onLoginSuccess({
          uid: firebaseUser.uid,
          name: existingProfile.displayName || firebaseUser.displayName || (existingProfile.role === 'artisan' ? 'Artisan' : 'Customer'),
          email: existingProfile.email || firebaseUser.email,
          phone: existingProfile.phone || firebaseUser.phoneNumber,
          role: existingProfile.role,
          avatar: existingProfile.avatar || firebaseUser.photoURL,
          verified: true
        });
        onClose();
      } else {
        // New user profile registration in Firestore
        const assignedRole = explicitRole || userRole;
        const newProfile = {
          uid: firebaseUser.uid,
          displayName: displayName.trim() || firebaseUser.displayName || (assignedRole === 'artisan' ? 'Master Artisan' : 'Valued Patron'),
          email: firebaseUser.email || email || null,
          phone: firebaseUser.phoneNumber || (countryCode + phoneNumber) || null,
          role: assignedRole,
          avatar: firebaseUser.photoURL || null,
          createdAt: new Date().toISOString()
        };

        await syncUserProfile(firebaseUser.uid, newProfile);

        onLoginSuccess({
          ...newProfile,
          name: newProfile.displayName,
          verified: true
        });
        onClose();
      }
    } catch (err) {
      console.error("Profile sync error:", err);
      setAuthError("Authenticated with Firebase, but could not sync profile: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect Firebase project directly via pasted snippet or credentials
  const handleConnectFirebase = (e) => {
    e.preventDefault();
    setConfigParseError(null);

    const input = firebaseConfigInput.trim();
    if (!input) {
      setConfigParseError("The configuration box is empty. Please copy and paste your firebaseConfig object from the Firebase Console, or explore in Local Sandbox Mode below.");
      return;
    }

    if (input.includes('AIzaSy...') || input.includes('YOUR_API_KEY')) {
      setConfigParseError("The input contains the example placeholder template ('AIzaSy...'). Please replace it with your actual project keys from the Firebase Console.");
      return;
    }

    try {
      let parsed = {};

      if (input.startsWith('{') && input.endsWith('}')) {
        try {
          parsed = JSON.parse(input);
        } catch {
          // fallback to regex extraction if JSON contains unquoted keys or comments
        }
      }

      // Robust extraction supporting JS object, JSON, and .env formats
      const extractVal = (names) => {
        for (const name of names) {
          const re = new RegExp(`(?:${name})\\s*[:=]\\s*["']?([^"',;\\s}]+)["']?`, 'i');
          const match = input.match(re);
          if (match && match[1]) return match[1].trim();
        }
        return null;
      };

      if (!parsed.apiKey) parsed.apiKey = extractVal(['apiKey', 'VITE_FIREBASE_API_KEY']);
      if (!parsed.authDomain) parsed.authDomain = extractVal(['authDomain', 'VITE_FIREBASE_AUTH_DOMAIN']);
      if (!parsed.projectId) parsed.projectId = extractVal(['projectId', 'VITE_FIREBASE_PROJECT_ID']);
      if (!parsed.appId) parsed.appId = extractVal(['appId', 'VITE_FIREBASE_APP_ID']);
      if (!parsed.storageBucket) parsed.storageBucket = extractVal(['storageBucket', 'VITE_FIREBASE_STORAGE_BUCKET']);
      if (!parsed.messagingSenderId) parsed.messagingSenderId = extractVal(['messagingSenderId', 'VITE_FIREBASE_MESSAGING_SENDER_ID']);
      if (!parsed.measurementId) parsed.measurementId = extractVal(['measurementId', 'VITE_FIREBASE_MEASUREMENT_ID']);

      if (!parsed.apiKey || !parsed.projectId) {
        setConfigParseError("Could not find valid apiKey and projectId in the pasted text. Please paste the full firebaseConfig object from Firebase Console.");
        return;
      }

      saveFirebaseConfig(parsed);
    } catch (err) {
      setConfigParseError("Parsing error: " + err.message);
    }
  };

  // 0. One-Touch Direct Sign-In for Master Profiles
  const handleInstantSignIn = async (role, emailVal, nameVal, avatarVal) => {
    setAuthError(null);
    setIsLoading(true);
    try {
      const profile = {
        uid: role === 'artisan' ? 'artisan_dulari_devi' : 'patron_aditi_narang',
        displayName: nameVal,
        name: nameVal,
        email: emailVal,
        phone: role === 'artisan' ? '+91 98450 11001' : '+91 98450 22002',
        role,
        avatar: avatarVal || null,
        verified: true
      };
      await syncUserProfile(profile.uid, profile);
      onLoginSuccess(profile);
      onClose();
    } catch (err) {
      console.error("Instant sign in error:", err);
      setAuthError(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Phone Authentication: Send real SMS OTP
  const handleSendPhoneOtp = async (e) => {
    e.preventDefault();
    setAuthError(null);

    const cleanNumber = (phoneNumber || '9845012345').replace(/\D/g, '');
    const fullPhoneNumber = `${countryCode}${cleanNumber}`;

    try {
      setIsLoading(true);
      // Initialize reCAPTCHA verifier
      const appVerifier = createRecaptchaVerifier('recaptcha-container', () => {
        // reCAPTCHA solved
      });

      const confirmResult = await sendPhoneOtp(fullPhoneNumber, appVerifier);
      setConfirmationResult(confirmResult);
      setIsOtpSent(true);
      setOtpCountdown(60);
      if (confirmResult.generatedCode) {
        setOtpCode(confirmResult.generatedCode);
        setAuthSuccessMsg(`SMS verification code dispatched to ${fullPhoneNumber}. (Your OTP is: ${confirmResult.generatedCode})`);
      } else {
        setAuthSuccessMsg(`SMS verification code dispatched to ${fullPhoneNumber}.`);
      }
    } catch (err) {
      console.error("Phone OTP Error:", err);
      setAuthError(getFriendlyAuthErrorMessage(err));
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.render().then((widgetId) => {
            if (window.grecaptcha) window.grecaptcha.reset(widgetId);
          });
        } catch {
          // ignore
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 1b. Phone Authentication: Verify real SMS OTP
  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!confirmationResult) {
      setAuthError("Session expired. Please request a new verification code.");
      return;
    }

    if (otpCode.trim().length !== 6) {
      setAuthError("Please enter the complete 6-digit SMS verification code.");
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await confirmationResult.confirm(otpCode.trim());
      await completeAuthWithProfile(userCredential.user, userRole);
    } catch (err) {
      console.error("OTP verification error:", err);
      setAuthError(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Google Identity Sign-In
  const handleGoogleAuth = async () => {
    setAuthError(null);
    try {
      setIsLoading(true);
      const result = await signInWithGoogle();
      await completeAuthWithProfile(result.user, userRole);
    } catch (err) {
      console.error("Google Auth error:", err);
      setAuthError(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Microsoft OAuth Sign-In
  const handleMicrosoftAuth = async () => {
    setAuthError(null);
    try {
      setIsLoading(true);
      const result = await signInWithMicrosoft();
      await completeAuthWithProfile(result.user, userRole);
    } catch (err) {
      console.error("Microsoft Auth error:", err);
      setAuthError(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Email/Password Sign-In
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !password) {
      setAuthError("Please provide both email address and password.");
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await loginWithEmail(email.trim(), password);
      await completeAuthWithProfile(userCredential.user, userRole);
    } catch (err) {
      console.error("Email sign-in error:", err);
      setAuthError(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 4b. Email/Password Registration
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!email || !password) {
      setAuthError("Please provide an email and password.");
      return;
    }

    if (password.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await registerWithEmail(email.trim(), password);
      await completeAuthWithProfile(userCredential.user, userRole);
    } catch (err) {
      console.error("Email sign-up error:", err);
      setAuthError(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  // 4c. Password Reset Request
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!forgotEmail) {
      setAuthError("Please enter your registered email address.");
      return;
    }

    try {
      setIsLoading(true);
      await sendPasswordReset(forgotEmail.trim());
      setForgotSubmitted(true);
      setAuthSuccessMsg(`Password reset link dispatched to ${forgotEmail}. Please check your inbox.`);
    } catch (err) {
      console.error("Password reset error:", err);
      setAuthError(getFriendlyAuthErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '480px', 
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden'
        }}
      >
        {/* Modal Header */}
        <div 
          className="modal-header" 
          style={{ 
            padding: '20px 24px 16px', 
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0
          }}
        >
          <div>
            <div className="craft-seal-badge" style={{ marginBottom: '6px' }}>
              <ShieldCheck size={13} />
              <span>Aaroh Cultural Collective</span>
            </div>
            <h3 style={{ fontSize: '1.35rem', margin: 0, fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
              {authSubMode === 'signup' 
                ? "Join Aaroh Collective" 
                : authSubMode === 'forgot'
                ? "Reset Your Password"
                : "Sign In to Aaroh"}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Access the artisan studio, craft commissions, and order management.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }}>
          
          {/* One-Touch Verified Member Quick-Access */}
          <div style={{
            marginBottom: '18px',
            padding: '12px 14px',
            backgroundColor: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={13} color="var(--accent-ochre)" />
              <span>Instant Verified Member Profiles:</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleInstantSignIn('artisan', 'dulari@aaroh.in', 'Dulari Devi', '/assets/images/dulari-devi-portrait.jpg')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--accent-olive)',
                  backgroundColor: 'var(--accent-olive-soft)',
                  color: 'var(--accent-olive)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Sparkles size={16} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ lineHeight: 1.2, fontWeight: 700 }}>Dulari Devi</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>Enter Master Studio ➔</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleInstantSignIn('customer', 'patron@aaroh.in', 'Aditi Narang', null)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1.5px solid var(--accent-indigo)',
                  backgroundColor: 'var(--accent-indigo-soft)',
                  color: 'var(--accent-indigo)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textAlign: 'left',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <User size={16} style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ lineHeight: 1.2, fontWeight: 700 }}>Aditi Narang</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>Enter Patron Orders ➔</div>
                </div>
              </button>
            </div>
          </div>

          {/* Feedback: Error Banner */}
          {authError && (
            <div style={{
              marginBottom: '16px',
              padding: '12px 14px',
              backgroundColor: 'var(--accent-rose-soft)',
              border: '1px solid var(--accent-rose)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.82rem',
              color: 'var(--accent-rose)',
              lineHeight: 1.4
            }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{authError}</div>
            </div>
          )}

          {/* Feedback: Success Banner */}
          {authSuccessMsg && (
            <div style={{
              marginBottom: '16px',
              padding: '12px 14px',
              backgroundColor: 'var(--accent-olive-soft)',
              border: '1px solid var(--accent-olive)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.82rem',
              color: 'var(--accent-olive)'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{authSuccessMsg}</span>
            </div>
          )}

          {/* Account Persona Selector (Artisan vs Patron) */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
              I am signing in as:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setUserRole('customer')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: userRole === 'customer' ? '2px solid var(--accent-indigo)' : '1px solid var(--border-subtle)',
                  backgroundColor: userRole === 'customer' ? 'var(--bg-surface-subtle)' : 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <User size={16} color="var(--accent-indigo)" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.84rem', display: 'block', color: 'var(--text-primary)' }}>Craft Patron</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Customer / Buyer</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setUserRole('artisan')}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  border: userRole === 'artisan' ? '2px solid var(--accent-olive)' : '1px solid var(--border-subtle)',
                  backgroundColor: userRole === 'artisan' ? 'var(--accent-olive-soft)' : 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color var(--transition-fast)'
                }}
              >
                <Sparkles size={16} color="var(--accent-olive)" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '0.84rem', display: 'block', color: 'var(--text-primary)' }}>Master Artisan</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Studio & Seller</span>
                </div>
              </button>
            </div>
          </div>

          {/* Social Sign In (Google & Microsoft) */}
          {authSubMode !== 'forgot' && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'border-color var(--transition-fast)'
                  }}
                  title="Sign in using your Google Account"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                {/* Microsoft Sign In */}
                <button
                  type="button"
                  onClick={handleMicrosoftAuth}
                  disabled={isLoading}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-surface)',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'border-color var(--transition-fast)'
                  }}
                  title="Sign in using your Microsoft Account"
                >
                  <svg width="18" height="18" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                  </svg>
                  <span>Microsoft</span>
                </button>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                margin: '18px 0 14px', 
                color: 'var(--text-muted)',
                fontSize: '0.78rem'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                <span style={{ padding: '0 12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>or continue with</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              </div>
            </div>
          )}

          {/* Sign-in Method Tabs: Mobile OTP vs Email */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '18px' }}>
            <button
              type="button"
              onClick={() => {
                setAuthMethod('phone');
                setAuthSubMode('signin');
                setAuthError(null);
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                fontSize: '0.86rem',
                fontWeight: 600,
                borderBottom: authMethod === 'phone' ? '2px solid var(--accent-indigo)' : '2px solid transparent',
                color: authMethod === 'phone' ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'transparent'
              }}
            >
              <Smartphone size={15} />
              <span>Mobile OTP</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMethod('email');
                setAuthError(null);
              }}
              style={{
                flex: 1,
                padding: '10px 12px',
                fontSize: '0.86rem',
                fontWeight: 600,
                borderBottom: authMethod === 'email' ? '2px solid var(--accent-indigo)' : '2px solid transparent',
                color: authMethod === 'email' ? 'var(--accent-indigo)' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: 'transparent'
              }}
            >
              <Mail size={15} />
              <span>Email & Password</span>
            </button>
          </div>

          {/* 1. Mobile Phone OTP Flow */}
          {authMethod === 'phone' && (
            <div>
              {!isOtpSent ? (
                <form onSubmit={handleSendPhoneOtp}>
                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Mobile Phone Number / मोबाइल नंबर
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        value={countryCode} 
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="form-select"
                        style={{ width: '92px', padding: '9px 8px', fontSize: '0.86rem' }}
                      >
                        <option value="+91">+91 (IN)</option>
                        <option value="+1">+1 (US)</option>
                        <option value="+44">+44 (UK)</option>
                        <option value="+971">+971 (AE)</option>
                        <option value="+61">+61 (AU)</option>
                        <option value="+65">+65 (SG)</option>
                      </select>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="98450 12345"
                        className="form-input"
                        style={{ flex: 1, fontSize: '0.94rem', letterSpacing: '0.04em', padding: '9px 12px' }}
                      />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '4px' }}>
                      A secure 6-digit SMS verification code will be dispatched to your phone.
                    </span>
                  </div>

                  {/* reCAPTCHA Container */}
                  <div id="recaptcha-container" style={{ margin: '4px 0 10px', display: 'flex', justifyContent: 'center' }}></div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-md)'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Sending SMS OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Verification Code ➔</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* Step 2: Enter SMS OTP */
                <form onSubmit={handleVerifyPhoneOtp}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        Enter 6-Digit SMS Code
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOtpSent(false);
                          setOtpCode('');
                        }}
                        style={{ fontSize: '0.76rem', color: 'var(--accent-indigo)', background: 'transparent', padding: 0, textDecoration: 'underline' }}
                      >
                        Change Number
                      </button>
                    </div>

                    <input
                      type="text"
                      maxLength={6}
                      autoFocus
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="• • • • • •"
                      className="form-input"
                      style={{
                        textAlign: 'center',
                        fontSize: '1.4rem',
                        letterSpacing: '0.4em',
                        fontWeight: 700,
                        padding: '10px'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                      Code expires in {otpCountdown}s
                    </span>
                    {otpCountdown === 0 && (
                      <button
                        type="button"
                        onClick={handleSendPhoneOtp}
                        style={{ color: 'var(--accent-indigo)', fontWeight: 600, background: 'transparent', padding: 0 }}
                      >
                        Resend SMS
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length !== 6}
                    className="btn-primary"
                    style={{ width: '100%', padding: '11px', fontSize: '0.92rem' }}
                  >
                    {isLoading ? "Verifying with Firebase..." : "Verify & Sign In"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 2. Email & Password Flow */}
          {authMethod === 'email' && (
            <div>
              {authSubMode === 'forgot' ? (
                /* Forgot Password Form */
                <form onSubmit={handlePasswordReset}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Registered Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="patron@example.com or artisan@aaroh.in"
                      className="form-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                    style={{ width: '100%', padding: '11px', fontSize: '0.92rem', marginBottom: '12px' }}
                  >
                    {isLoading ? "Sending Reset Email..." : "Send Password Reset Link"}
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setAuthSubMode('signin')}
                      style={{ fontSize: '0.8rem', color: 'var(--accent-indigo)', background: 'transparent', padding: 0 }}
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              ) : (
                /* Sign In / Sign Up Form */
                <form onSubmit={authSubMode === 'signup' ? handleEmailSignUp : handleEmailSignIn}>
                  {authSubMode === 'signup' && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                        Your Full Name / आपका नाम
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="e.g. Dulari Devi or Aditi Narang"
                        className="form-input"
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="patron@example.com or artisan@aaroh.in"
                      className="form-input"
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>
                        Password
                      </label>
                      {authSubMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => {
                            setAuthSubMode('forgot');
                            setAuthError(null);
                          }}
                          style={{ fontSize: '0.76rem', color: 'var(--accent-indigo)', background: 'transparent', padding: 0 }}
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary"
                    style={{
                      width: '100%',
                      padding: '11px',
                      fontSize: '0.92rem'
                    }}
                  >
                    {isLoading ? (
                      "Connecting to Authentication..."
                    ) : authSubMode === 'signup' ? (
                      "Create Verified Account"
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.82rem' }}>
                    {authSubMode === 'signup' ? (
                      <span>
                        Already registered?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthSubMode('signin')}
                          style={{ color: 'var(--accent-indigo)', fontWeight: 600, background: 'transparent', padding: 0 }}
                        >
                          Sign In
                        </button>
                      </span>
                    ) : (
                      <span>
                        Don't have an account?{" "}
                        <button
                          type="button"
                          onClick={() => setAuthSubMode('signup')}
                          style={{ color: 'var(--accent-indigo)', fontWeight: 600, background: 'transparent', padding: 0 }}
                        >
                          Sign Up for Aaroh
                        </button>
                      </span>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Optional: Cloud Firebase Integration Drawer */}
          <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setShowConfigDrawer(!showConfigDrawer)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Key size={12} />
              <span>{showConfigDrawer ? 'Hide Cloud Firebase Setup' : 'Cloud Firebase Settings (Optional)'}</span>
            </button>

            {showConfigDrawer && (
              <form onSubmit={handleConnectFirebase} style={{ marginTop: '12px', textAlign: 'left' }}>
                <div style={{
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 10px',
                  marginBottom: '8px',
                  fontSize: '0.72rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.45
                }}>
                  Paste your <code>firebaseConfig</code> object from <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-indigo)', textDecoration: 'underline' }}>Firebase Console</a> to synchronize all users directly to Google Cloud:
                </div>

                <textarea
                  rows={3}
                  value={firebaseConfigInput}
                  onChange={(e) => setFirebaseConfigInput(e.target.value)}
                  placeholder="// Paste firebaseConfig JavaScript snippet or .env keys here..."
                  className="form-textarea"
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'monospace',
                    padding: '8px 10px',
                    marginBottom: '8px',
                    backgroundColor: 'var(--bg-surface)'
                  }}
                />

                {configParseError && (
                  <div style={{ color: 'var(--accent-rose)', fontSize: '0.73rem', marginBottom: '8px' }}>
                    {configParseError}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <Key size={12} />
                  <span>Activate Cloud Firebase</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
