import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Smartphone, 
  Mail, 
  Sparkles, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Globe, 
  Moon, 
  Sun,
  Award,
  ArrowRight,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { CulturalParticles } from './CulturalParticles';
import { 
  requestEmailOtp, 
  verifyOtpCode, 
  completePasswordRegistration, 
  loginWithCredentials, 
  resetForgottenPassword 
} from '../services/apiAuth';
import { TurnstileWidget } from './TurnstileWidget';

export const LoginPage = ({
  lang,
  onOpenLanguageModal,
  themeMode,
  setThemeMode,
  onLoginSuccess,
  onReturnToHome
}) => {
  // Primary Persona / Role
  const [userRole, setUserRole] = useState('customer'); // 'customer' | 'artisan'

  // Auth Method Tabs: 'email' | 'phone' | 'demo'
  const [authMethod, setAuthMethod] = useState('email'); 
  
  // Email Sub-modes: 'signin' | 'register' | 'forgot' | 'passwordless'
  const [emailMode, setEmailMode] = useState('signin'); 

  // Multi-step Registration State
  // Step 1: Request & Verify Email OTP
  // Step 2: Set Name, Phone, and Password
  const [regStep, setRegStep] = useState(1); 
  const [regActionToken, setRegActionToken] = useState(null);

  // Multi-step Forgot Password State
  // Step 1: Enter Email & Request OTP
  // Step 2: Verify OTP
  // Step 3: Enter New Password & Confirm
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotActionToken, setForgotActionToken] = useState(null);

  // Common Form Fields
  const [email, setEmail] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [assignedUserId, setAssignedUserId] = useState(null);
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Password Confirmation & Reset Fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('');

  // OTP Fields
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const otpInputRefs = useRef([]);

  // UI / Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Live password validation for new password creation
  const targetPasswordToCheck = emailMode === 'forgot' ? newPassword : password;
  const hasUpper = /[A-Z]/.test(targetPasswordToCheck);
  const hasLower = /[a-z]/.test(targetPasswordToCheck);
  const hasNumber = /[0-9]/.test(targetPasswordToCheck);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(targetPasswordToCheck);
  const isValidLength = targetPasswordToCheck.length >= 4 && targetPasswordToCheck.length <= 8;
  const isPasswordPolicySatisfied = hasUpper && hasLower && hasNumber && hasSpecial && isValidLength;

  // Countdown timer for resending OTP
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Reset errors and sub-flows on tab change
  const handleSwitchAuthMethod = (method) => {
    setAuthMethod(method);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
    setRegStep(1);
    setForgotStep(1);
    setAssignedUserId(null);
    setCaptchaToken('');
  };

  const handleSwitchEmailMode = (mode) => {
    setEmailMode(mode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
    setRegStep(1);
    setForgotStep(1);
    setAssignedUserId(null);
    setCaptchaToken('');
  };

  // OTP Input Handlers (6-digit boxes)
  const handleOtpBoxChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePasteOtp = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const updated = ['', '', '', '', '', ''];
    for (let i = 0; i < pasteData.length; i++) {
      updated[i] = pasteData[i];
    }
    setOtpDigits(updated);

    const nextIndex = Math.min(pasteData.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  // ==========================================
  // FLOW 1: EMAIL / USER ID & PASSWORD SIGN IN
  // ==========================================
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetIdentifier = (loginIdentifier || email || '').trim();
    if (!targetIdentifier || !password) {
      setErrorMessage("Please enter both Email / User ID and password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await loginWithCredentials(targetIdentifier, password, captchaToken);
      setSuccessMessage(res.message || "Login successful! Entering Aaroh...");
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // FLOW 2: SIGNUP FLOW
  // Name + Email + Phone → Send Real Email OTP → Verify OTP → Unique User ID → Set Password → Create Account
  // ==========================================
  const handleSendRegOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!displayName || !displayName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }

    if (!phone || !phone.trim()) {
      setErrorMessage("Please enter your mobile phone number.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await requestEmailOtp(email, 'signup', displayName.trim(), captchaToken);
      setIsOtpSent(true);
      setOtpCountdown(res.cooldownSeconds || 60);
      setSuccessMessage(`A real single-use verification code was dispatched to ${email}. Please check your email inbox.`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setErrorMessage(err.message || "Failed to dispatch verification email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyRegOtp = async (e) => {
    e?.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const enteredCode = otpDigits.join('');
    if (enteredCode.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code from your email.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await verifyOtpCode(email, enteredCode, 'signup');
      setRegActionToken(res.actionToken);
      if (res.uniqueUserId) {
        setAssignedUserId(res.uniqueUserId);
      }
      setRegStep(2); // Advance to Password Creation & Account Finalization
      setSuccessMessage(
        res.uniqueUserId 
          ? `Email verified! Your unique Aaroh User ID is ${res.uniqueUserId}. Now set your password.`
          : "Email verified successfully! Now create your secure password."
      );
    } catch (err) {
      setErrorMessage(err.message || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistration = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isPasswordPolicySatisfied) {
      setErrorMessage("Please satisfy all password criteria (1 uppercase, 1 lowercase, 1 number, 1 special character, maximum 8 characters).");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await completePasswordRegistration({
        actionToken: regActionToken,
        name: displayName.trim(),
        phone: phone.trim(),
        password,
        role: userRole
      });

      setSuccessMessage(res.message || "Account registered successfully! Entering Aaroh...");
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 600);
    } catch (err) {
      setErrorMessage(err.message || "Failed to complete account registration.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // FLOW 3: FORGOT PASSWORD WITH EMAIL OTP
  // ==========================================
  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.trim()) {
      setErrorMessage("Please enter your registered Email Address or User ID.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await requestEmailOtp(email.trim(), 'forgot_password', '', captchaToken);
      setForgotStep(2);
      setOtpCountdown(res.cooldownSeconds || 60);
      setSuccessMessage(res.message || `Password reset code sent to ${email}. Please check your inbox.`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setErrorMessage(err.message || "Failed to send reset code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyForgotOtp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const enteredCode = otpDigits.join('');
    if (enteredCode.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit code.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await verifyOtpCode(email, enteredCode, 'forgot_password');
      setForgotActionToken(res.actionToken);
      setForgotStep(3); // Advance to New Password entry
      setSuccessMessage("Code verified. Please set your new password.");
    } catch (err) {
      setErrorMessage(err.message || "Invalid or expired code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!isPasswordPolicySatisfied) {
      setErrorMessage("Please satisfy all password criteria (1 uppercase, 1 lowercase, 1 number, 1 special character, max 8 chars).");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await resetForgottenPassword({
        actionToken: forgotActionToken,
        newPassword,
        confirmPassword
      });

      setSuccessMessage(res.message || "Password reset successfully! Entering Aaroh...");
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 600);
    } catch (err) {
      setErrorMessage(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // FLOW 4: PASSWORDLESS EMAIL OTP LOGIN
  // ==========================================
  const handleSendPasswordlessOtp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !email.includes('@')) {
      setErrorMessage("Please enter your registered email address.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await requestEmailOtp(email, 'login', '', captchaToken);
      setIsOtpSent(true);
      setOtpCountdown(res.cooldownSeconds || 60);
      setSuccessMessage(`Instant login passcode dispatched to ${email}. Check your email.`);
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setErrorMessage(err.message || "Failed to dispatch login code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPasswordlessOtp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const enteredCode = otpDigits.join('');
    if (enteredCode.length !== 6) {
      setErrorMessage("Please enter the 6-digit code.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await verifyOtpCode(email, enteredCode, 'login');
      setSuccessMessage("Identity verified! Entering Aaroh...");
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || "Invalid or expired passcode.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // FLOW 5: QUICK DEMO PROFILES (REAL SQLITE LOGIN)
  // ==========================================
  const handleQuickDemoLogin = async (demoEmail, demoRole) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      const res = await loginWithCredentials(demoEmail, 'Password@123');
      setSuccessMessage(`Welcome, ${res.user.name}! Entering Aaroh...`);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || "Demo login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Top Header Navigation */}
      <header className="login-top-bar">
        <button 
          onClick={onReturnToHome} 
          className="login-back-btn"
          title="Return to Aaroh Cultural Journal"
        >
          <ArrowLeft size={16} />
          <span>Return to Cultural Journal • मुख्य पृष्ठ</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenLanguageModal}
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '0.82rem', gap: '6px' }}
            title="Switch language between 22 Indian scheduled languages"
          >
            <Globe size={14} color="var(--accent-indigo)" />
            <span style={{ textTransform: 'capitalize' }}>{lang} • Language</span>
          </button>

          <button
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            className="btn-icon"
            style={{ width: '36px', height: '36px' }}
            title="Toggle theme light/dark"
          >
            {themeMode === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </header>

      {/* Main Split Grid */}
      <div className="login-grid">
        {/* Left Visual Sanctum Pane */}
        <div className="login-sanctuary-pane">
          <CulturalParticles reducedMotion={false} />

          <div className="login-sanctuary-content">
            <div className="sanctuary-emblem-badge animate-float">
              <span>🪷</span>
              <span>Aaroh • Living Guild Sanctum</span>
            </div>

            <h1 className="sanctuary-title">
              कला प्रवेश द्वार
              <span style={{ display: 'block', fontSize: '0.62em', fontWeight: 400, marginTop: '6px', color: '#D5C5B2' }}>
                Where Indian Heritage Breathes
              </span>
            </h1>

            <p className="sanctuary-subtitle">
              Authentic Indian folk arts, handloom textiles, and living traditions. Connect directly with hereditary master craftspeople with transparent fair wages and certified geographic indications.
            </p>

            {/* Three Living Provenance Pillars */}
            <div className="sanctuary-pillars">
              <div className="sanctuary-pillar-item">
                <span className="pillar-icon">✉️</span>
                <div className="pillar-text">
                  <strong>Real Email OTP Verification</strong>
                  <span>Single-use 6-digit security codes dispatched directly to your personal email inbox.</span>
                </div>
              </div>

              <div className="sanctuary-pillar-item">
                <span className="pillar-icon">🔒</span>
                <div className="pillar-text">
                  <strong>Bcrypt Encrypted Passwords</strong>
                  <span>Passwords are salted and cryptographically hashed before persistent database storage.</span>
                </div>
              </div>

              <div className="sanctuary-pillar-item">
                <span className="pillar-icon">⚖️</span>
                <div className="pillar-text">
                  <strong>Direct Fair Trade Payouts</strong>
                  <span>85% goes directly to artisan guilds without exploitative middleman deductions.</span>
                </div>
              </div>
            </div>

            {/* Living Artisan Master Quote */}
            <div className="sanctuary-artisan-quote">
              “In Mithila, the ink is soot and tree gum. When patrons connect through Aaroh, our craft remains a living prayer, not a museum memory.”
              <div style={{ marginTop: '8px', fontWeight: 600, color: '#E6AA4E', fontStyle: 'normal', fontSize: '0.82rem' }}>
                — Dulari Devi • Padma Shri Master Painter, Ranti Village, Bihar
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Console */}
        <div className="login-form-pane">
          <div className="login-form-card">
            {/* Header Heading */}
            <div className="login-header-group">
              <h2 className="login-heading">Welcome to Aaroh</h2>
              <p className="login-caption">
                Sign in to manage your collection, commission custom heritage artworks, or administer your artisan studio.
              </p>
            </div>

            {/* Persona Selector (Collector vs Artisan) */}
            <div className="persona-selector-grid">
              <div 
                className={`persona-card ${userRole === 'customer' ? 'active' : ''}`}
                onClick={() => setUserRole('customer')}
                role="button"
                tabIndex={0}
              >
                <div className="persona-card-header">
                  <span className="persona-icon">🪷</span>
                  <div className="persona-check">✓</div>
                </div>
                <div className="persona-title">Craft Patron</div>
                <div className="persona-desc">Collect, commission custom art, and track guild shipments.</div>
              </div>

              <div 
                className={`persona-card ${userRole === 'artisan' ? 'active' : ''}`}
                onClick={() => setUserRole('artisan')}
                role="button"
                tabIndex={0}
              >
                <div className="persona-card-header">
                  <span className="persona-icon">🏺</span>
                  <div className="persona-check">✓</div>
                </div>
                <div className="persona-title">Master Artisan</div>
                <div className="persona-desc">Voice cataloging, fair wage payouts, and patron orders.</div>
              </div>
            </div>

            {/* Auth Method Navigation Tabs */}
            <div className="auth-methods-nav">
              <button 
                className={`auth-method-pill ${authMethod === 'email' ? 'active' : ''}`}
                onClick={() => handleSwitchAuthMethod('email')}
              >
                <Mail size={14} />
                <span>Email Authentication</span>
              </button>

              <button 
                className={`auth-method-pill ${authMethod === 'demo' ? 'active' : ''}`}
                onClick={() => handleSwitchAuthMethod('demo')}
              >
                <Sparkles size={14} />
                <span>Demo Accounts</span>
              </button>
            </div>

            {/* Live Feedback Banners */}
            {errorMessage && (
              <div className="login-alert-banner error" role="alert">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="login-alert-banner success" role="status">
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ======================================================== */}
            {/* METHOD 1: EMAIL AUTHENTICATION (SIGNIN / REGISTER / FORGOT) */}
            {/* ======================================================== */}
            {authMethod === 'email' && (
              <div>
                {/* Mode Selector Tabs (Sign In / Register / Passwordless) */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  borderBottom: '1px solid var(--border-subtle)',
                  marginBottom: '20px',
                  paddingBottom: '10px'
                }}>
                  <button
                    type="button"
                    onClick={() => handleSwitchEmailMode('signin')}
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.86rem',
                      fontWeight: emailMode === 'signin' ? 700 : 500,
                      color: emailMode === 'signin' ? 'var(--accent-indigo)' : 'var(--text-muted)',
                      borderBottom: emailMode === 'signin' ? '2px solid var(--accent-indigo)' : 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Password Login
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchEmailMode('register')}
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.86rem',
                      fontWeight: emailMode === 'register' ? 700 : 500,
                      color: emailMode === 'register' ? 'var(--accent-indigo)' : 'var(--text-muted)',
                      borderBottom: emailMode === 'register' ? '2px solid var(--accent-indigo)' : 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Email OTP Signup
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchEmailMode('passwordless')}
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.86rem',
                      fontWeight: emailMode === 'passwordless' ? 700 : 500,
                      color: emailMode === 'passwordless' ? 'var(--accent-indigo)' : 'var(--text-muted)',
                      borderBottom: emailMode === 'passwordless' ? '2px solid var(--accent-indigo)' : 'none',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Passwordless OTP Login
                  </button>
                </div>

                {/* 1A. STANDARD PASSWORD SIGN IN */}
                {emailMode === 'signin' && (
                  <form onSubmit={handlePasswordLogin}>
                    <div className="form-group">
                      <label className="form-label">Email Address or User ID • ईमेल या यूज़र आईडी</label>
                      <input 
                        type="text"
                        value={loginIdentifier || email}
                        onChange={(e) => {
                          setLoginIdentifier(e.target.value);
                          setEmail(e.target.value);
                        }}
                        placeholder="you@domain.com or ARH-000101"
                        className="form-input"
                        required
                        autoFocus
                      />
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label className="form-label">Password • पासवर्ड</label>
                        <button
                          type="button"
                          onClick={() => handleSwitchEmailMode('forgot')}
                          style={{ fontSize: '0.78rem', color: 'var(--accent-indigo)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="form-input"
                          style={{ paddingRight: '40px' }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Cloudflare Turnstile CAPTCHA */}
                    <div style={{ margin: '14px 0', minHeight: '65px' }}>
                      <TurnstileWidget
                        theme={themeMode}
                        action="login"
                        onVerify={(token) => setCaptchaToken(token)}
                        onExpire={() => setCaptchaToken('')}
                        onError={() => setCaptchaToken('')}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn-primary btn-sheen" 
                      disabled={isLoading}
                      style={{ width: '100%', padding: '13px 20px', marginTop: '6px' }}
                    >
                      {isLoading ? "Authenticating..." : "Sign In • प्रवेश करें"}
                    </button>

                    <div style={{ marginTop: '14px', padding: '10px 12px', background: 'var(--bg-surface-subtle)', borderRadius: '8px', border: '1px dashed var(--border-subtle)', textAlign: 'center' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                        ⚡ Quick Demo Sign-in (Pre-seeded Accounts):
                      </span>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginIdentifier('dulari@aaroh.in');
                            setEmail('dulari@aaroh.in');
                            setPassword('Password@123');
                          }}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                        >
                          Dulari Devi (Artisan)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLoginIdentifier('patron@aaroh.in');
                            setEmail('patron@aaroh.in');
                            setPassword('Password@123');
                          }}
                          className="btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.76rem' }}
                        >
                          Aditi Narang (Patron)
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.84rem' }}>
                      <span>
                        Need an account?{' '}
                        <button 
                          type="button" 
                          onClick={() => handleSwitchEmailMode('register')}
                          style={{ color: 'var(--accent-indigo)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          Create Account with Email OTP
                        </button>
                      </span>
                    </div>
                  </form>
                )}

                {/* 1B. MULTI-STEP EMAIL OTP REGISTRATION */}
                {emailMode === 'register' && (
                  <div>
                    {regStep === 1 ? (
                      <div>
                        {!isOtpSent ? (
                          <form onSubmit={handleSendRegOtp}>
                            <div className="form-group">
                              <label className="form-label">Full Name • पूरा नाम</label>
                              <input 
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="e.g. Aditi Narang or Raghav Sharma"
                                className="form-input"
                                required
                                autoFocus
                              />
                            </div>

                            <div className="form-group">
                              <label className="form-label">Email Address • ईमेल</label>
                              <input 
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@domain.com"
                                className="form-input"
                                required
                              />
                              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                                A real single-use 6-digit verification code will be sent to this email inbox.
                              </span>
                            </div>

                            <div className="form-group">
                              <label className="form-label">Mobile Number • मोबाइल नंबर</label>
                              <input 
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                className="form-input"
                                required
                              />
                            </div>

                            {/* Cloudflare Turnstile CAPTCHA */}
                            <div style={{ margin: '14px 0', minHeight: '65px' }}>
                              <TurnstileWidget
                                theme={themeMode}
                                action="signup"
                                onVerify={(token) => setCaptchaToken(token)}
                                onExpire={() => setCaptchaToken('')}
                                onError={() => setCaptchaToken('')}
                              />
                            </div>

                            <button 
                              type="submit" 
                              className="btn-primary btn-sheen" 
                              disabled={isLoading}
                              style={{ width: '100%', padding: '13px 20px', marginTop: '8px' }}
                            >
                              {isLoading ? "Dispatching Email..." : "Send Verification Code • कोड भेजें"}
                            </button>
                          </form>
                        ) : (
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Code dispatched to <strong>{email}</strong>
                              </span>
                              <button 
                                onClick={() => {
                                  setIsOtpSent(false);
                                  setOtpDigits(['', '', '', '', '', '']);
                                }}
                                style={{ fontSize: '0.8rem', color: 'var(--accent-indigo)', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                              >
                                Edit Details
                              </button>
                            </div>

                            <div style={{
                              backgroundColor: 'var(--bg-surface-subtle)',
                              padding: '10px 14px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.82rem',
                              color: 'var(--text-secondary)',
                              marginBottom: '14px'
                            }}>
                              Applicant: <strong>{displayName}</strong> • Phone: <strong>{phone}</strong>
                            </div>

                            {/* 6 Square PIN Input Boxes */}
                            <div className="otp-boxes-grid" onPaste={handlePasteOtp}>
                              {otpDigits.map((digit, index) => (
                                <input 
                                  key={index}
                                  ref={(el) => (otpInputRefs.current[index] = el)}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  value={digit}
                                  onChange={(e) => handleOtpBoxChange(index, e.target.value)}
                                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                  className={`otp-box-input ${digit ? 'filled' : ''}`}
                                />
                              ))}
                            </div>

                            <button 
                              type="button"
                              onClick={handleVerifyRegOtp}
                              className="btn-primary btn-sheen" 
                              disabled={isLoading}
                              style={{ width: '100%', padding: '13px 20px', marginTop: '14px' }}
                            >
                              {isLoading ? "Verifying..." : "Verify Code & Generate Unique User ID"}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.82rem' }}>
                              {otpCountdown > 0 ? (
                                <span style={{ color: 'var(--text-muted)' }}>
                                  Resend code in <strong>{otpCountdown}s</strong>
                                </span>
                              ) : (
                                <button 
                                  type="button"
                                  onClick={handleSendRegOtp} 
                                  style={{ color: 'var(--accent-indigo)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none' }}
                                >
                                  Resend Email Verification Code
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* STEP 2: DISPLAY ASSIGNED UNIQUE USER ID & PASSWORD SETUP */
                      <form onSubmit={handleCompleteRegistration}>
                        <div style={{
                          backgroundColor: 'var(--bg-surface-subtle)',
                          border: '1px solid var(--accent-olive)',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.84rem',
                          color: 'var(--accent-olive)',
                          marginBottom: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                            <CheckCircle2 size={16} />
                            <span>Unique User ID Assigned: {assignedUserId || 'ARH-XXXXXX'}</span>
                          </div>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Verified Profile: <strong>{displayName}</strong> ({email} • {phone})
                          </span>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Create Password (Maximum 8 characters)</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type={showPassword ? 'text' : 'password'}
                              maxLength={8}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="e.g. Pass@12"
                              className="form-input"
                              style={{ paddingRight: '40px' }}
                              required
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>

                          {/* Live Password Criteria Badges */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '4px',
                            marginTop: '8px'
                          }}>
                            <div style={{ fontSize: '0.74rem', color: hasUpper ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                              <span>{hasUpper ? '✓' : '○'}</span> Uppercase letter
                            </div>
                            <div style={{ fontSize: '0.74rem', color: hasLower ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                              <span>{hasLower ? '✓' : '○'}</span> Lowercase letter
                            </div>
                            <div style={{ fontSize: '0.74rem', color: hasNumber ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                              <span>{hasNumber ? '✓' : '○'}</span> Number (0-9)
                            </div>
                            <div style={{ fontSize: '0.74rem', color: hasSpecial ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                              <span>{hasSpecial ? '✓' : '○'}</span> Special character
                            </div>
                            <div style={{ fontSize: '0.74rem', color: isValidLength ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                              <span>{isValidLength ? '✓' : '○'}</span> Max 8 characters
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Confirm Password</label>
                          <input 
                            type="password"
                            maxLength={8}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                            className="form-input"
                            required
                          />
                        </div>

                        <button 
                          type="submit" 
                          className="btn-primary btn-sheen" 
                          disabled={isLoading || !isPasswordPolicySatisfied}
                          style={{ width: '100%', padding: '13px 20px', marginTop: '6px' }}
                        >
                          {isLoading ? "Creating Encrypted Account..." : "Complete Registration • खाता बनाएँ"}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* 1C. PASSWORDLESS EMAIL OTP LOGIN */}
                {emailMode === 'passwordless' && (
                  <div>
                    {!isOtpSent ? (
                      <form onSubmit={handleSendPasswordlessOtp}>
                        <div className="form-group">
                          <label className="form-label">Registered Email Address</label>
                          <input 
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@domain.com"
                            className="form-input"
                            required
                            autoFocus
                          />
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                            We will email you a secure 6-digit one-time sign-in code. No password needed.
                          </span>
                        </div>

                        {/* Cloudflare Turnstile CAPTCHA */}
                        <div style={{ margin: '14px 0', minHeight: '65px' }}>
                          <TurnstileWidget
                            theme={themeMode}
                            action="login_otp"
                            onVerify={(token) => setCaptchaToken(token)}
                            onExpire={() => setCaptchaToken('')}
                            onError={() => setCaptchaToken('')}
                          />
                        </div>

                        <button 
                          type="submit" 
                          className="btn-primary btn-sheen" 
                          disabled={isLoading}
                          style={{ width: '100%', padding: '13px 20px', marginTop: '8px' }}
                        >
                          {isLoading ? "Sending..." : "Send One-Time Login Code"}
                        </button>
                      </form>
                    ) : (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Login code sent to <strong>{email}</strong>
                          </span>
                          <button 
                            onClick={() => {
                              setIsOtpSent(false);
                              setOtpDigits(['', '', '', '', '', '']);
                            }}
                            style={{ fontSize: '0.8rem', color: 'var(--accent-indigo)', fontWeight: 600, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Change
                          </button>
                        </div>

                        <div className="otp-boxes-grid" onPaste={handlePasteOtp}>
                          {otpDigits.map((digit, index) => (
                            <input 
                              key={index}
                              ref={(el) => (otpInputRefs.current[index] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpBoxChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className={`otp-box-input ${digit ? 'filled' : ''}`}
                            />
                          ))}
                        </div>

                        <button 
                          type="button"
                          onClick={handleVerifyPasswordlessOtp}
                          className="btn-primary btn-sheen" 
                          disabled={isLoading}
                          style={{ width: '100%', padding: '13px 20px', marginTop: '14px' }}
                        >
                          {isLoading ? "Verifying..." : "Verify & Sign In Instantly"}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.82rem' }}>
                          {otpCountdown > 0 ? (
                            <span style={{ color: 'var(--text-muted)' }}>
                              Resend code in <strong>{otpCountdown}s</strong>
                            </span>
                          ) : (
                            <button 
                              type="button"
                              onClick={handleSendPasswordlessOtp} 
                              style={{ color: 'var(--accent-indigo)', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none' }}
                            >
                              Resend Login Code
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 1D. FORGOT PASSWORD MULTI-STEP FLOW */}
                {emailMode === 'forgot' && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <button
                        type="button"
                        onClick={() => handleSwitchEmailMode('signin')}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.84rem' }}
                      >
                        <ArrowLeft size={14} /> Back to Sign In
                      </button>
                    </div>

                    {forgotStep === 1 && (
                      <form onSubmit={handleSendForgotOtp}>
                        <div className="form-group">
                          <label className="form-label">Registered Account Email or User ID</label>
                          <input 
                            type="text"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@domain.com or ARH-000101"
                            className="form-input"
                            required
                            autoFocus
                          />
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>
                            We will send a real 6-digit verification code to your verified email inbox.
                          </span>
                        </div>

                        {/* Cloudflare Turnstile CAPTCHA */}
                        <div style={{ margin: '14px 0', minHeight: '65px' }}>
                          <TurnstileWidget
                            theme={themeMode}
                            action="forgot_password"
                            onVerify={(token) => setCaptchaToken(token)}
                            onExpire={() => setCaptchaToken('')}
                            onError={() => setCaptchaToken('')}
                          />
                        </div>

                        <button 
                          type="submit" 
                          className="btn-primary" 
                          disabled={isLoading}
                          style={{ width: '100%', padding: '12px 20px', marginTop: '8px' }}
                        >
                          {isLoading ? "Sending..." : "Send Reset Code • रीसेट कोड भेजें"}
                        </button>
                      </form>
                    )}

                    {forgotStep === 2 && (
                      <div>
                        <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                          Enter the 6-digit reset code sent to <strong>{email}</strong>:
                        </div>

                        <div className="otp-boxes-grid" onPaste={handlePasteOtp}>
                          {otpDigits.map((digit, index) => (
                            <input 
                              key={index}
                              ref={(el) => (otpInputRefs.current[index] = el)}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpBoxChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              className={`otp-box-input ${digit ? 'filled' : ''}`}
                            />
                          ))}
                        </div>

                        <button 
                          type="button"
                          onClick={handleVerifyForgotOtp}
                          className="btn-primary" 
                          disabled={isLoading}
                          style={{ width: '100%', padding: '12px 20px', marginTop: '14px' }}
                        >
                          {isLoading ? "Verifying..." : "Verify Code & Proceed to New Password"}
                        </button>
                      </div>
                    )}

                    {forgotStep === 3 && (
                      <form onSubmit={handleResetPasswordSubmit}>
                        <div className="form-group">
                          <label className="form-label">Create New Password (Max 8 characters)</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type={showNewPassword ? 'text' : 'password'}
                              maxLength={8}
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="e.g. NewPass1@"
                              className="form-input"
                              style={{ paddingRight: '40px' }}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>

                          {/* Live Password Criteria Badges */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                            gap: '4px',
                            marginTop: '8px'
                          }}>
                            <div style={{ fontSize: '0.74rem', color: hasUpper ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                              <span>{hasUpper ? '✓' : '○'}</span> Uppercase letter
                            </div>
                            <div style={{ fontSize: '0.74rem', color: hasLower ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                              <span>{hasLower ? '✓' : '○'}</span> Lowercase letter
                            </div>
                            <div style={{ fontSize: '0.74rem', color: hasNumber ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                              <span>{hasNumber ? '✓' : '○'}</span> Number (0-9)
                            </div>
                            <div style={{ fontSize: '0.74rem', color: hasSpecial ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                              <span>{hasSpecial ? '✓' : '○'}</span> Special character
                            </div>
                            <div style={{ fontSize: '0.74rem', color: isValidLength ? 'var(--accent-olive)' : 'var(--text-muted)' }}>
                              <span>{isValidLength ? '✓' : '○'}</span> Max 8 characters
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Confirm New Password</label>
                          <input 
                            type="password"
                            maxLength={8}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className="form-input"
                            required
                          />
                        </div>

                        <button 
                          type="submit" 
                          className="btn-primary" 
                          disabled={isLoading || !isPasswordPolicySatisfied}
                          style={{ width: '100%', padding: '12px 20px', marginTop: '6px' }}
                        >
                          {isLoading ? "Encrypting & Updating..." : "Update Password & Sign In"}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* METHOD 2: QUICK DEMO PROFILES (PERSISTED IN SQLITE DB) */}
            {/* ======================================================== */}
            {authMethod === 'demo' && (
              <div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  These pre-seeded accounts authenticate directly with our SQLite database using Bcrypt password hashes:
                </p>

                <div className="demo-profiles-stack">
                  {/* Master Artisan Card */}
                  <div 
                    className="demo-profile-card"
                    onClick={() => handleQuickDemoLogin('dulari@aaroh.in', 'artisan')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="demo-avatar-box">
                      <img src="/assets/images/hero-artisan.jpg" alt="Dulari Devi" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="demo-info">
                      <div className="demo-name-badge">
                        <strong>Dulari Devi</strong>
                        <span className="badge badge-in-stock" style={{ fontSize: '0.7rem' }}>Master Artisan</span>
                      </div>
                      <div className="demo-subtitle">Mithila Painting Custodian • Ranti, Bihar</div>
                      <div className="demo-creds">dulari@aaroh.in • Password: Password@123</div>
                    </div>
                    <div className="demo-action-arrow">→</div>
                  </div>

                  {/* Craft Patron Card */}
                  <div 
                    className="demo-profile-card"
                    onClick={() => handleQuickDemoLogin('patron@aaroh.in', 'customer')}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="demo-avatar-box" style={{ backgroundColor: 'var(--accent-indigo)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      AN
                    </div>
                    <div className="demo-info">
                      <div className="demo-name-badge">
                        <strong>Aditi Narang</strong>
                        <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'var(--bg-surface-subtle)', color: 'var(--text-secondary)' }}>Craft Patron</span>
                      </div>
                      <div className="demo-subtitle">Indian Folk Heritage Collector • Bengaluru</div>
                      <div className="demo-creds">patron@aaroh.in • Password: Password@123</div>
                    </div>
                    <div className="demo-action-arrow">→</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
