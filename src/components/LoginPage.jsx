import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Smartphone, 
  Mail, 
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
  RefreshCw
} from 'lucide-react';
import { CulturalParticles } from './CulturalParticles';
import { 
  signup,
  verifySignupOtp,
  resendSignupOtp,
  sendLoginOtp,
  verifyLoginOtp,
  verifyEmailOtp,
  verifyPhoneOtp,
  resendEmailOtp,
  resendPhoneOtp,
  login,
  forgotPassword,
  verifyPasswordResetOtp,
  resetPassword,
  initiateGoogleLogin,
  initiateMicrosoftLogin
} from '../services/apiAuth';
import { useTranslation } from 'react-i18next';
import { TurnstileWidget } from './TurnstileWidget';

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" aria-hidden="true" style={{ flexShrink: 0 }}>
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

export const LoginPage = ({
  lang,
  setLang,
  onOpenLanguageModal,
  themeMode,
  setThemeMode,
  onLoginSuccess,
  onReturnToHome
}) => {
  const { t, i18n } = useTranslation();
  const [captchaToken, setCaptchaToken] = useState('');
  const [oauthLoading, setOauthLoading] = useState(null); // 'google' | 'microsoft' | null

  // Primary Persona / Role: 'customer' | 'artisan'
  const [userRole, setUserRole] = useState('customer');

  // Main Auth Tab: 'signin' | 'signup' | 'verify' | 'forgot' | 'demo'
  const [authTab, setAuthTab] = useState('signin');

  // ==========================================
  // SIGNUP FORM STATE (Email OR Mobile Phone)
  // ==========================================
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);

  // ==========================================
  // VERIFICATION SCREEN STATE (Unified Contact)
  // ==========================================
  const [pendingUserId, setPendingUserId] = useState(null);
  const [verificationTarget, setVerificationTarget] = useState('');
  const [verificationContactType, setVerificationContactType] = useState('email');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationPhone, setVerificationPhone] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verifiedUserProfile, setVerifiedUserProfile] = useState(null);
  const [isDemoModeActive, setIsDemoModeActive] = useState(false);
  const [demoCodesList, setDemoCodesList] = useState([]);

  // Unified Signup OTP Input
  const [signupOtpCode, setSignupOtpCode] = useState('');
  const [signupOtpDigits, setSignupOtpDigits] = useState(['', '', '', '', '', '']);
  const [signupOtpCountdown, setSignupOtpCountdown] = useState(60);
  const [isVerifyingSignupOtp, setIsVerifyingSignupOtp] = useState(false);
  const [isResendingSignupOtp, setIsResendingSignupOtp] = useState(false);
  const signupOtpInputRefs = useRef([]);

  // Email OTP Input (For dual legacy accounts)
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailOtpDigits, setEmailOtpDigits] = useState(['', '', '', '', '', '']);
  const [emailCountdown, setEmailCountdown] = useState(60);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const emailInputRefs = useRef([]);

  // Phone OTP Input (For dual legacy accounts)
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [phoneOtpDigits, setPhoneOtpDigits] = useState(['', '', '', '', '', '']);
  const [phoneCountdown, setPhoneCountdown] = useState(60);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isResendingPhone, setIsResendingPhone] = useState(false);
  const phoneInputRefs = useRef([]);

  // ==========================================
  // LOGIN FORM STATE (OTP OR Password)
  // ==========================================
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginMode, setLoginMode] = useState('otp'); // 'otp' | 'password'
  const [loginOtpStep, setLoginOtpStep] = useState(1); // 1: enter identifier, 2: enter 6-digit OTP
  const [loginOtpDigits, setLoginOtpDigits] = useState(['', '', '', '', '', '']);
  const [loginOtpCode, setLoginOtpCode] = useState('');
  const [loginOtpCountdown, setLoginOtpCountdown] = useState(60);
  const [loginOtpTarget, setLoginOtpTarget] = useState('');
  const [loginOtpContactType, setLoginOtpContactType] = useState('email');
  const [isSendingLoginOtp, setIsSendingLoginOtp] = useState(false);
  const [isVerifyingLoginOtp, setIsVerifyingLoginOtp] = useState(false);
  const loginOtpInputRefs = useRef([]);

  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // ==========================================
  // FORGOT PASSWORD FLOW STATE
  // ==========================================
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotOtpCode, setForgotOtpCode] = useState('');
  const [forgotOtpDigits, setForgotOtpDigits] = useState(['', '', '', '', '', '']);
  const [forgotCountdown, setForgotCountdown] = useState(60);
  const [forgotActionToken, setForgotActionToken] = useState(null);
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const forgotInputRefs = useRef([]);

  // UI Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ==========================================
  // STRONG PASSWORD VALIDATION CHECKERS
  // ==========================================
  const checkPasswordStrength = (pwd) => {
    const val = pwd || '';
    return {
      hasMinLength: val.length >= 8,
      hasUpper: /[A-Z]/.test(val),
      hasLower: /[a-z]/.test(val),
      hasNumber: /[0-9]/.test(val),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(val),
      isStrong: val.length >= 8 && /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(val)
    };
  };

  const signupStrength = checkPasswordStrength(signupPassword);
  const forgotStrength = checkPasswordStrength(forgotNewPassword);

  // Timers for resend countdowns
  useEffect(() => {
    let timer;
    if (emailCountdown > 0) {
      timer = setInterval(() => setEmailCountdown((p) => p - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [emailCountdown]);

  useEffect(() => {
    let timer;
    if (phoneCountdown > 0) {
      timer = setInterval(() => setPhoneCountdown((p) => p - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [phoneCountdown]);

  useEffect(() => {
    let timer;
    if (signupOtpCountdown > 0) {
      timer = setInterval(() => setSignupOtpCountdown((p) => p - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [signupOtpCountdown]);

  useEffect(() => {
    let timer;
    if (loginOtpCountdown > 0) {
      timer = setInterval(() => setLoginOtpCountdown((p) => p - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [loginOtpCountdown]);

  useEffect(() => {
    let timer;
    if (forgotCountdown > 0) {
      timer = setInterval(() => setForgotCountdown((p) => p - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [forgotCountdown]);

  // Check URL query parameters for OAuth error responses
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const err = params.get('error');
      if (err) {
        if (err === 'GOOGLE_OAUTH_NOT_CONFIGURED') {
          setErrorMessage('Google Sign-In is not configured yet on the backend. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env (see AUTH_SETUP_GUIDE.md).');
        } else if (err === 'MICROSOFT_OAUTH_NOT_CONFIGURED') {
          setErrorMessage('Microsoft Sign-In is not configured yet on the backend. Please add MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET in server/.env (see AUTH_SETUP_GUIDE.md).');
        } else if (err.toLowerCase().includes('denied') || err === 'access_denied') {
          setErrorMessage('Sign-in was cancelled or access was denied by provider.');
        } else {
          setErrorMessage(decodeURIComponent(err));
        }
      }
    } catch {}
  }, []);

  const handleGoogleOAuth = async () => {
    try {
      setOauthLoading('google');
      setErrorMessage(null);
      await initiateGoogleLogin({ role: userRole });
    } catch (err) {
      setOauthLoading(null);
      if (err.code === 'GOOGLE_OAUTH_NOT_CONFIGURED') {
        setErrorMessage('Google Sign-In is not configured yet. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env (see AUTH_SETUP_GUIDE.md).');
      } else {
        setErrorMessage(err.message || 'Failed to initiate Google Sign-In.');
      }
    }
  };

  const handleMicrosoftOAuth = async () => {
    try {
      setOauthLoading('microsoft');
      setErrorMessage(null);
      await initiateMicrosoftLogin({ role: userRole });
    } catch (err) {
      setOauthLoading(null);
      if (err.code === 'MICROSOFT_OAUTH_NOT_CONFIGURED') {
        setErrorMessage('Microsoft Sign-In is not configured yet. Please configure MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET in server/.env (see AUTH_SETUP_GUIDE.md).');
      } else {
        setErrorMessage(err.message || 'Failed to initiate Microsoft Sign-In.');
      }
    }
  };

  // Tab Switcher
  const handleSwitchTab = (tab) => {
    setAuthTab(tab);
    setCaptchaToken('');
    setErrorMessage(null);
    setSuccessMessage(null);
    if (tab === 'forgot') setForgotStep(1);
  };

  // Helper for high-visibility 6-box OTP changes
  const handleBoxChange = (digits, setDigits, refs, index, val) => {
    const clean = (val || '').replace(/\D/g, '');
    if (!clean) {
      const updated = [...digits];
      updated[index] = '';
      setDigits(updated);
      return;
    }

    const updated = [...digits];
    if (clean.length > 1) {
      // Pasted or typed multi-digit sequence: distribute starting from current index
      for (let i = 0; i < clean.length && (index + i) < 6; i++) {
        updated[index + i] = clean[i];
      }
      setDigits(updated);
      const nextIdx = Math.min(index + clean.length, 5);
      refs.current[nextIdx]?.focus();
    } else {
      updated[index] = clean[0];
      setDigits(updated);
      if (index < 5) {
        refs.current[index + 1]?.focus();
      }
    }
  };

  const handleBoxKeyDown = (digits, setDigits, refs, index, e) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        e.preventDefault();
        const updated = [...digits];
        updated[index - 1] = '';
        setDigits(updated);
        refs.current[index - 1]?.focus();
      } else if (digits[index]) {
        const updated = [...digits];
        updated[index] = '';
        setDigits(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      refs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      refs.current[index + 1]?.focus();
    }
  };

  const handleBoxPaste = (setDigits, refs, e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;
    const updated = ['', '', '', '', '', ''];
    for (let i = 0; i < pasteData.length; i++) updated[i] = pasteData[i];
    setDigits(updated);
    const nextIdx = Math.min(pasteData.length, 5);
    refs.current[nextIdx]?.focus();
  };

  // ============================================================================
  // 1. SIGNUP SUBMISSION (EMAIL, MOBILE PHONE, OR BOTH)
  // ============================================================================
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').trim();

    if (!cleanEmail && !cleanPhone) {
      setErrorMessage("Please enter at least an email address or a mobile phone number.");
      return;
    }

    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }
    }

    if (cleanPhone) {
      const digitsOnly = cleanPhone.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        setErrorMessage("Please enter a valid mobile phone number with country code (e.g. +91 91757 02555).");
        return;
      }
    }

    if (!signupStrength.isStrong) {
      setErrorMessage("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await signup({
        name: fullName.trim(),
        email: cleanEmail || undefined,
        phone_number: cleanPhone || undefined,
        password: signupPassword,
        confirmPassword: signupConfirmPassword,
        role: userRole,
        captchaToken
      });

      setPendingUserId(res.userId);
      setVerificationTarget(res.identifier || cleanEmail || cleanPhone);
      setVerificationContactType(res.contactType || (cleanEmail && cleanPhone ? 'both' : (cleanEmail ? 'email' : 'phone')));
      setVerificationEmail(res.email || cleanEmail || '');
      setVerificationPhone(res.phone_number || cleanPhone || '');
      setIsEmailVerified(Boolean(res.email_verified));
      setIsPhoneVerified(Boolean(res.phone_verified));

      setSignupOtpCountdown(60);
      setSignupOtpCode('');
      setSignupOtpDigits(['', '', '', '', '', '']);
      setEmailCountdown(60);
      setPhoneCountdown(60);
      setEmailOtpCode('');
      setPhoneOtpCode('');
      setEmailOtpDigits(['', '', '', '', '', '']);
      setPhoneOtpDigits(['', '', '', '', '', '']);

      setAuthTab('verify');
      setIsDemoModeActive(false);

      if (cleanEmail && cleanPhone) {
        setSuccessMessage("Account created! Real verification codes have been dispatched to both your email and phone.");
      } else if (cleanEmail) {
        setSuccessMessage(`Account created! A real 6-digit verification code has been dispatched to ${res.email || cleanEmail}. Valid for 5 minutes.`);
      } else {
        setSuccessMessage(`Account created! A real 6-digit SMS verification code has been dispatched via Twilio to ${res.phone_number || cleanPhone}.`);
      }
    } catch (err) {
      if (err.status === 409) {
        setErrorMessage("An account already exists with this email address or phone number. Please login instead.");
      } else {
        setErrorMessage(err.message || "Failed to create account. Please check your details.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // 1.1 UNIFIED SIGNUP OTP VERIFY & RESEND
  // ============================================================================
  const handleVerifySignupOtp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const code = (signupOtpCode || signupOtpDigits.join('')).trim();
    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setIsVerifyingSignupOtp(true);
      const res = await verifySignupOtp({
        identifier: verificationTarget || verificationEmail || verificationPhone,
        userId: pendingUserId,
        code
      });

      setSuccessMessage("Verification successful! Welcome to Aaroh.");
      if (res.user) {
        setVerifiedUserProfile(res.user);
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 1000);
      }
    } catch (err) {
      setErrorMessage(err.message || "Invalid or expired verification code.");
    } finally {
      setIsVerifyingSignupOtp(false);
    }
  };

  const handleResendSignupOtp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      setIsResendingSignupOtp(true);
      const res = await resendSignupOtp({
        identifier: verificationTarget || verificationEmail || verificationPhone,
        userId: pendingUserId,
        captchaToken
      });
      setSignupOtpCountdown(res.cooldownSeconds || 60);
      setSignupOtpCode('');
      setSignupOtpDigits(['', '', '', '', '', '']);
      if (res.isDemo) {
        setSuccessMessage("Development demo code generated (Check backend terminal for code).");
      } else {
        setSuccessMessage(res.message || `Verification code resent to ${verificationTarget || verificationEmail || verificationPhone}.`);
      }
      signupOtpInputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMessage(err.message || "Failed to resend verification code.");
    } finally {
      setIsResendingSignupOtp(false);
    }
  };

  // ============================================================================
  // 2. EMAIL OTP VERIFY & RESEND (For Legacy Dual Users)
  // ============================================================================
  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const code = (emailOtpCode || emailOtpDigits.join('')).trim();
    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit email verification code.");
      return;
    }

    try {
      setIsVerifyingEmail(true);
      const res = await verifyEmailOtp({
        email: verificationEmail,
        userId: pendingUserId,
        code
      });

      setIsEmailVerified(true);
      setSuccessMessage("Email address verified successfully!");

      if (res.fully_verified && res.user) {
        setVerifiedUserProfile(res.user);
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(err.message || "Email verification code is invalid or has expired.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const handleResendEmail = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      setIsResendingEmail(true);
      const res = await resendEmailOtp({
        email: verificationEmail,
        userId: pendingUserId,
        captchaToken
      });
      setEmailCountdown(res.cooldownSeconds || 60);
      setEmailOtpCode('');
      setEmailOtpDigits(['', '', '', '', '', '']);
      if (res.isDemo) {
        setSuccessMessage("Development demo code generated; no email was sent (Check terminal for code).");
      } else {
        setSuccessMessage(`Email sent to ${verificationEmail}. Please check your inbox.`);
      }
      emailInputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMessage(err.message || "Failed to resend email code.");
    } finally {
      setIsResendingEmail(false);
    }
  };

  // ============================================================================
  // 3. PHONE SMS OTP VERIFY & RESEND (For Legacy Dual Users)
  // ============================================================================
  const handleVerifyPhone = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const code = (phoneOtpCode || phoneOtpDigits.join('')).trim();
    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit SMS verification code.");
      return;
    }

    try {
      setIsVerifyingPhone(true);
      const res = await verifyPhoneOtp({
        phone_number: verificationPhone,
        userId: pendingUserId,
        code
      });

      setIsPhoneVerified(true);
      setSuccessMessage("Phone number verified successfully!");

      if (res.fully_verified && res.user) {
        setVerifiedUserProfile(res.user);
        setTimeout(() => {
          onLoginSuccess(res.user);
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(err.message || "SMS verification code is invalid or has expired.");
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleResendPhone = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      setIsResendingPhone(true);
      const res = await resendPhoneOtp({
        phone_number: verificationPhone,
        userId: pendingUserId,
        captchaToken
      });
      setPhoneCountdown(res.cooldownSeconds || 60);
      setPhoneOtpCode('');
      setPhoneOtpDigits(['', '', '', '', '', '']);
      if (res.isDemo) {
        setSuccessMessage("Development demo code generated; no SMS was sent (Check terminal for code).");
      } else {
        setSuccessMessage(`A new verification code has been dispatched via SMS to ${verificationPhone}.`);
      }
      phoneInputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMessage(err.message || "Failed to resend phone verification code.");
    } finally {
      setIsResendingPhone(false);
    }
  };

  // ============================================================================
  // 3.1 PASSWORDLESS LOGIN OTP (EMAIL OR PHONE)
  // ============================================================================
  const handleSendLoginOtp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetId = (loginIdentifier || '').trim();
    if (!targetId) {
      setErrorMessage("Please enter your registered email address or mobile phone number.");
      return;
    }

    try {
      setIsSendingLoginOtp(true);
      const res = await sendLoginOtp({
        identifier: targetId,
        captchaToken
      });

      setLoginOtpTarget(res.target || targetId);
      setLoginOtpContactType(res.contactType || 'email');
      setLoginOtpStep(2);
      setLoginOtpCountdown(res.cooldownSeconds || 60);
      setLoginOtpCode('');
      setLoginOtpDigits(['', '', '', '', '', '']);
      if (res.isDemo) {
        setSuccessMessage("Development demo code generated (Check backend terminal for 6-digit code).");
      } else {
        setSuccessMessage(res.message || `Verification code sent to ${res.target || targetId}`);
      }
      setTimeout(() => loginOtpInputRefs.current[0]?.focus(), 150);
    } catch (err) {
      if (err.requiresVerification || err.status === 403) {
        setPendingUserId(err.data?.userId);
        setVerificationTarget(targetId);
        setVerificationEmail(err.data?.email || '');
        setVerificationPhone(err.data?.phone_number || '');
        setAuthTab('verify');
        setErrorMessage("Please complete your account verification before logging in.");
      } else {
        setErrorMessage(err.message || "Failed to dispatch verification code.");
      }
    } finally {
      setIsSendingLoginOtp(false);
    }
  };

  const handleVerifyLoginOtp = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const code = (loginOtpCode || loginOtpDigits.join('')).trim();
    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setIsVerifyingLoginOtp(true);
      const res = await verifyLoginOtp({
        identifier: loginIdentifier.trim(),
        code
      });

      setSuccessMessage(res.message || "Sign in successful! Entering Aaroh...");
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || "Invalid or expired verification code.");
    } finally {
      setIsVerifyingLoginOtp(false);
    }
  };

  // ============================================================================
  // 4. LOGIN SUBMISSION
  // ============================================================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetId = (loginIdentifier || '').trim();
    if (!targetId || !loginPassword) {
      setErrorMessage("Please enter your Email or Phone number and password.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await login({
        identifier: targetId,
        password: loginPassword,
        captchaToken
      });

      setSuccessMessage(res.message || "Login successful! Entering Aaroh...");
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err) {
      if (err.requiresVerification || err.status === 403) {
        setPendingUserId(err.data?.userId);
        setVerificationEmail(err.data?.email || '');
        setVerificationPhone(err.data?.phone_number || '');
        setIsEmailVerified(Boolean(err.data?.emailVerified));
        setIsPhoneVerified(Boolean(err.data?.phoneVerified));

        setAuthTab('verify');
        setErrorMessage("Please complete your account verification before logging in.");
      } else {
        setErrorMessage(err.message || "Invalid Email, Phone number, or password.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================================================
  // 5. FORGOT PASSWORD FLOW
  // ============================================================================
  const handleForgotStep1Submit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotIdentifier.trim()) {
      setErrorMessage("Please enter your registered Email Address or Phone Number.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await forgotPassword({ identifier: forgotIdentifier.trim(), captchaToken });
      setForgotStep(2);
      setForgotCountdown(res.cooldownSeconds || 60);
      setForgotOtpCode('');
      setForgotOtpDigits(['', '', '', '', '', '']);
      setSuccessMessage(res.message || "If an account matches those details, a verification code has been dispatched.");
      setTimeout(() => forgotInputRefs.current[0]?.focus(), 150);
    } catch (err) {
      setErrorMessage(err.message || "Failed to send reset code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotStep2Submit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const code = (forgotOtpCode || forgotOtpDigits.join('')).trim();
    if (code.length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await verifyPasswordResetOtp({
        identifier: forgotIdentifier.trim(),
        code
      });
      setForgotActionToken(res.actionToken);
      setForgotStep(3);
      setSuccessMessage("Code verified! Please create your new strong password.");
    } catch (err) {
      setErrorMessage(err.message || "Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotStep3Submit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!forgotStrength.isStrong) {
      setErrorMessage("Password must be at least 8 characters and include uppercase, lowercase, number, and special character.");
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      const res = await resetPassword({
        actionToken: forgotActionToken,
        newPassword: forgotNewPassword,
        confirmPassword: forgotConfirmPassword
      });

      setSuccessMessage(res.message || "Password updated successfully! Entering Aaroh...");
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 600);
    } catch (err) {
      setErrorMessage(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Profiles
  const handleQuickDemoLogin = async (demoIdentifier) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      const res = await login({ identifier: demoIdentifier, password: 'Password@123' });
      setSuccessMessage(`Welcome, ${res.user.name || res.user.full_name}! Entering Aaroh...`);
      setTimeout(() => {
        onLoginSuccess(res.user);
      }, 500);
    } catch (err) {
      setErrorMessage(`Demo login failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-canvas)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden'
    }}>
      {/* Background Cultural Micro-Particles */}
      <CulturalParticles count={24} />

      {/* Top Navbar */}
      <header style={{
        padding: '16px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        zIndex: 10
      }}>
        <button 
          onClick={onReturnToHome}
          className="btn-ghost"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <ArrowLeft size={18} />
          <span>{t('auth_btn_back_to_login', 'Return to Marketplace')}</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onOpenLanguageModal}
            className="btn-ghost"
            title="Change Language"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Globe size={16} />
            <span style={{ textTransform: 'uppercase', fontSize: '0.85rem' }}>{lang}</span>
          </button>

          <button 
            onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
            className="btn-ghost"
            title="Toggle Theme"
          >
            {themeMode === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        zIndex: 10
      }}>
        <div style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden'
        }}>
          {/* Header Card Brand Banner */}
          <div style={{
            padding: '28px 24px 20px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '4px' }}>🪷</div>
            <h1 style={{
              margin: '0 0 4px',
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              color: 'var(--accent-indigo)',
              letterSpacing: '0.04em'
            }}>
              Aaroh
            </h1>
            <p style={{
              margin: 0,
              fontSize: '0.86rem',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}>
              Living Cultural Craft Marketplace & Fair-Trade Sanctuary
            </p>

            {/* Persona Switcher */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-full)',
              padding: '4px',
              marginTop: '18px',
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                type="button"
                onClick={() => setUserRole('customer')}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: userRole === 'customer' ? 'var(--accent-indigo)' : 'transparent',
                  color: userRole === 'customer' ? '#FFFFFF' : 'var(--text-muted)',
                  fontWeight: userRole === 'customer' ? 600 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <User size={14} />
                <span>{t('auth_role_collector', 'Craft Patron / Collector')}</span>
              </button>
              <button
                type="button"
                onClick={() => setUserRole('artisan')}
                style={{
                  flex: 1,
                  padding: '7px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: 'none',
                  backgroundColor: userRole === 'artisan' ? 'var(--accent-terracotta)' : 'transparent',
                  color: userRole === 'artisan' ? '#FFFFFF' : 'var(--text-muted)',
                  fontWeight: userRole === 'artisan' ? 600 : 500,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Award size={14} />
                <span>{t('auth_role_artisan', 'Master Artisan')}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)'
          }}>
            <button
              type="button"
              onClick={() => handleSwitchTab('signin')}
              style={{
                flex: 1,
                padding: '13px 10px',
                border: 'none',
                borderBottom: authTab === 'signin' ? '2px solid var(--accent-indigo)' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: authTab === 'signin' ? 'var(--accent-indigo)' : 'var(--text-muted)',
                fontWeight: authTab === 'signin' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              {t('auth_btn_login', 'Login')}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('signup')}
              style={{
                flex: 1,
                padding: '13px 10px',
                border: 'none',
                borderBottom: authTab === 'signup' ? '2px solid var(--accent-terracotta)' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: authTab === 'signup' ? 'var(--accent-terracotta)' : 'var(--text-muted)',
                fontWeight: authTab === 'signup' ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              {t('auth_btn_create_account', 'Sign Up')}
            </button>
            {(pendingUserId || authTab === 'verify') && (
              <button
                type="button"
                onClick={() => handleSwitchTab('verify')}
                style={{
                  flex: 1,
                  padding: '13px 10px',
                  border: 'none',
                  borderBottom: authTab === 'verify' ? '2px solid #2D6629' : '2px solid transparent',
                  backgroundColor: 'transparent',
                  color: authTab === 'verify' ? '#2D6629' : 'var(--text-muted)',
                  fontWeight: authTab === 'verify' ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                {t('auth_verify_title', 'Verification')}
              </button>
            )}
          </div>

          {/* Card Body */}
          <div style={{ padding: '24px' }}>
            {/* Error Notification */}
            {errorMessage && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#FFF0F2',
                color: '#B82D43',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '18px',
                border: '1px solid #F5C6CB'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Success Notification */}
            {successMessage && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#EEF6E8',
                color: '#2D6629',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '18px',
                border: '1px solid #C3E6CB'
              }}>
                <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                <span>{successMessage}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 1: LOGIN (EMAIL OR PHONE VIA OTP OR PASSWORD)        */}
            {/* ========================================================= */}
            {authTab === 'signin' && (
              <div>
                {/* Social Login Options (Google & Microsoft Entra ID) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={handleGoogleOAuth}
                    disabled={oauthLoading !== null}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1.5px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      cursor: oauthLoading ? 'wait' : 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                    aria-label="Continue with Google"
                  >
                    {oauthLoading === 'google' ? <RefreshCw size={16} className="animate-spin" /> : <GoogleIcon />}
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleMicrosoftOAuth}
                    disabled={oauthLoading !== null}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1.5px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      cursor: oauthLoading ? 'wait' : 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                    aria-label="Continue with Microsoft"
                  >
                    {oauthLoading === 'microsoft' ? <RefreshCw size={16} className="animate-spin" /> : <MicrosoftIcon />}
                    <span>Microsoft</span>
                  </button>
                </div>

                {/* Heritage Divider */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 18px', color: 'var(--text-muted)' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                  <span style={{ padding: '0 10px', fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    or continue with
                  </span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                </div>

                {/* Mode Selector: Sign in with OTP vs Sign in with Password */}
                <div style={{
                  display: 'flex',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '3px',
                  marginBottom: '18px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <button
                    type="button"
                    onClick={() => { setLoginMode('otp'); setErrorMessage(null); }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: loginMode === 'otp' ? 'var(--accent-indigo)' : 'transparent',
                      color: loginMode === 'otp' ? '#FFFFFF' : 'var(--text-muted)',
                      fontWeight: loginMode === 'otp' ? 700 : 500,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Smartphone size={14} />
                    <span>Sign in with OTP</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginMode('password'); setErrorMessage(null); }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: loginMode === 'password' ? 'var(--accent-indigo)' : 'transparent',
                      color: loginMode === 'password' ? '#FFFFFF' : 'var(--text-muted)',
                      fontWeight: loginMode === 'password' ? 700 : 500,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Lock size={14} />
                    <span>Sign in with Password</span>
                  </button>
                </div>

                {/* MODE 1: OTP LOGIN (STEP 1: ENTER CONTACT, STEP 2: VERIFY 6-DIGIT OTP) */}
                {loginMode === 'otp' && (
                  <>
                    {loginOtpStep === 1 && (
                      <form onSubmit={handleSendLoginOtp}>
                        <div className="form-group">
                          <label className="form-label">
                            {t('auth_email', 'Enter your registered email or mobile number')}
                          </label>
                          <input
                            type="text"
                            required
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            placeholder="e.g. aditi@aaroh.in or +91 98450 12345"
                            className="form-input"
                            autoComplete="username"
                          />
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                            We will send a fresh 6-digit verification code to your email or phone number.
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
                          disabled={isSendingLoginOtp || !loginIdentifier.trim()}
                          className="btn-primary"
                          style={{ width: '100%', padding: '13px', marginTop: '6px' }}
                        >
                          {isSendingLoginOtp ? (
                            <>
                              <RefreshCw size={16} className="animate-spin" />
                              <span>Sending Verification Code...</span>
                            </>
                          ) : (
                            <>
                              <span>Send Verification Code</span>
                              <ArrowRight size={16} />
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {loginOtpStep === 2 && (
                      <form onSubmit={handleVerifyLoginOtp}>
                        <div style={{
                          padding: '12px 14px',
                          backgroundColor: 'var(--bg-surface-subtle)',
                          borderRadius: 'var(--radius-md)',
                          marginBottom: '16px',
                          fontSize: '0.86rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Code sent to: </span>
                            <strong>{loginOtpTarget || loginIdentifier}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setLoginOtpStep(1); setErrorMessage(null); }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--accent-terracotta)',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Change
                          </button>
                        </div>

                        <div style={{ margin: '14px 0 16px' }}>
                          <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                            Enter 6-Digit Verification Code
                          </label>
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(6, 1fr)',
                            gap: '10px',
                            maxWidth: '400px',
                            margin: '0 auto',
                            width: '100%'
                          }}>
                            {[0, 1, 2, 3, 4, 5].map((idx) => {
                              const digit = loginOtpDigits[idx] || '';
                              return (
                                <input
                                  key={idx}
                                  ref={(el) => (loginOtpInputRefs.current[idx] = el)}
                                  type="text"
                                  inputMode="numeric"
                                  autoComplete="one-time-code"
                                  maxLength={6}
                                  value={digit}
                                  onChange={(e) => handleBoxChange(loginOtpDigits, setLoginOtpDigits, loginOtpInputRefs, idx, e.target.value)}
                                  onKeyDown={(e) => handleBoxKeyDown(loginOtpDigits, setLoginOtpDigits, loginOtpInputRefs, idx, e)}
                                  onPaste={(e) => handleBoxPaste(setLoginOtpDigits, loginOtpInputRefs, e)}
                                  onFocus={(e) => e.target.select()}
                                  aria-label={`Login code digit ${idx + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '56px',
                                    textAlign: 'center',
                                    fontSize: '1.65rem',
                                    fontWeight: 800,
                                    fontFamily: 'system-ui, -apple-system, sans-serif',
                                    color: '#0F172A',
                                    backgroundColor: '#FFFFFF',
                                    border: digit ? '2.5px solid #1A3459' : '2px solid #94A3B8',
                                    borderRadius: '10px',
                                    outline: 'none',
                                    boxShadow: digit ? '0 0 0 3px rgba(26, 52, 89, 0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                                    transition: 'all 0.15s ease',
                                    boxSizing: 'border-box'
                                  }}
                                />
                              );
                            })}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            <span>Valid for 5 minutes</span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{loginOtpDigits.join('').length}/6 digits</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                          <button
                            type="submit"
                            disabled={isVerifyingLoginOtp || loginOtpDigits.join('').length !== 6}
                            className="btn-primary"
                            style={{ flex: 1, padding: '12px' }}
                          >
                            {isVerifyingLoginOtp ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Verifying & Signing In...</span>
                              </>
                            ) : (
                              <span>Verify & Sign In</span>
                            )}
                          </button>

                          <button
                            type="button"
                            disabled={loginOtpCountdown > 0 || isSendingLoginOtp}
                            onClick={handleSendLoginOtp}
                            className="btn-secondary"
                            style={{ padding: '12px 14px', fontSize: '0.84rem' }}
                          >
                            {loginOtpCountdown > 0 ? `Resend (${loginOtpCountdown}s)` : 'Resend Code'}
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}

                {/* MODE 2: PASSWORD LOGIN (FOR ADMIN & USERS WITH PASSWORDS) */}
                {loginMode === 'password' && (
                  <form onSubmit={handleLoginSubmit}>
                    <div className="form-group">
                      <label className="form-label">
                        {t('auth_email', 'Email Address, Mobile Number, or User ID')}
                      </label>
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. aditi@aaroh.in, +91 98450 12345, or ARH-ADMIN"
                        className="form-input"
                        autoComplete="username"
                      />
                    </div>

                    <div className="form-group">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <label className="form-label" style={{ margin: 0 }}>{t('auth_password', 'Password')}</label>
                        <button
                          type="button"
                          onClick={() => handleSwitchTab('forgot')}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-terracotta)',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          {t('auth_forgot_password_link', 'Forgot password?')}
                        </button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showLoginPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="form-input"
                          autoComplete="current-password"
                          style={{ paddingRight: '42px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                      disabled={isLoading}
                      className="btn-primary"
                      style={{ width: '100%', padding: '13px', marginTop: '6px' }}
                    >
                      <Lock size={16} />
                      <span>{isLoading ? 'Authenticating...' : t('auth_btn_login', 'Sign In')}</span>
                    </button>
                  </form>
                )}

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {t('auth_dont_have_account', "Don't have an account yet?")}{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('signup')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-indigo)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {t('auth_btn_create_account', 'Create Account')}
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: FUNCTIONAL SIGNUP FLOW                             */}
            {/* ========================================================= */}
            {authTab === 'signup' && (
              <form onSubmit={handleSignupSubmit}>
                {/* Social Signup Options (Google & Microsoft Entra ID) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' }}>
                  <button
                    type="button"
                    onClick={handleGoogleOAuth}
                    disabled={oauthLoading !== null}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1.5px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      cursor: oauthLoading ? 'wait' : 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                    aria-label="Sign up with Google"
                  >
                    {oauthLoading === 'google' ? <RefreshCw size={16} className="animate-spin" /> : <GoogleIcon />}
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleMicrosoftOAuth}
                    disabled={oauthLoading !== null}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '11px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1.5px solid var(--border-subtle)',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      cursor: oauthLoading ? 'wait' : 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s ease',
                      width: '100%'
                    }}
                    aria-label="Sign up with Microsoft"
                  >
                    {oauthLoading === 'microsoft' ? <RefreshCw size={16} className="animate-spin" /> : <MicrosoftIcon />}
                    <span>Microsoft</span>
                  </button>
                </div>

                {/* Heritage Divider */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 18px', color: 'var(--text-muted)' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                  <span style={{ padding: '0 10px', fontSize: '0.74rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    or register with email / mobile
                  </span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('auth_fullname', 'Full Name')}</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {t('auth_email', 'Email Address')} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>(Optional if mobile phone entered)</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aditi@aaroh.in"
                    className="form-input"
                    autoComplete="email"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {t('auth_phone', 'Mobile Phone Number')} <span style={{ fontSize: '0.8rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>(Optional if email entered)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 91757 02555"
                    className="form-input"
                    autoComplete="tel"
                  />
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Enter email, mobile phone, or both. At least one contact method is required to receive verification OTPs.
                  </span>
                </div>

                {/* Password field with live strength requirement checklist */}
                <div className="form-group">
                  <label className="form-label">{t('auth_password', 'Password')}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      required
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="At least 8 characters with symbol & number"
                      className="form-input"
                      style={{ paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
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
                      {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Real-time Password Policy Checklist */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '6px',
                    marginTop: '8px',
                    padding: '8px',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{ fontSize: '0.74rem', color: signupStrength.hasMinLength ? '#2D6629' : 'var(--text-muted)' }}>
                      {signupStrength.hasMinLength ? '✓' : '○'} 8+ Characters
                    </div>
                    <div style={{ fontSize: '0.74rem', color: signupStrength.hasUpper ? '#2D6629' : 'var(--text-muted)' }}>
                      {signupStrength.hasUpper ? '✓' : '○'} Uppercase (A-Z)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: signupStrength.hasLower ? '#2D6629' : 'var(--text-muted)' }}>
                      {signupStrength.hasLower ? '✓' : '○'} Lowercase (a-z)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: signupStrength.hasNumber ? '#2D6629' : 'var(--text-muted)' }}>
                      {signupStrength.hasNumber ? '✓' : '○'} Number (0-9)
                    </div>
                    <div style={{ fontSize: '0.74rem', color: signupStrength.hasSpecial ? '#2D6629' : 'var(--text-muted)' }}>
                      {signupStrength.hasSpecial ? '✓' : '○'} Special (!@#$)
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('auth_confirm_password', 'Confirm Password')}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showSignupConfirmPassword ? 'text' : 'password'}
                      required
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="form-input"
                      style={{ paddingRight: '42px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
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
                      {showSignupConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
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
                  disabled={isLoading || !signupStrength.isStrong}
                  className="btn-primary"
                  style={{ width: '100%', padding: '13px', marginTop: '6px' }}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Creating Account & Sending Codes...</span>
                    </>
                  ) : (
                    <>
                      <span>{t('auth_btn_create_account', 'Create Account & Verify')}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  {t('auth_already_have_account', 'Already registered with Aaroh?')}{' '}
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('signin')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-indigo)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {t('auth_btn_login', 'Login')}
                  </button>
                </div>
              </form>
            )}

            {/* ========================================================= */}
            {/* TAB 3: INDEPENDENT EMAIL & PHONE VERIFICATION SCREEN     */}
            {/* ========================================================= */}
            {authTab === 'verify' && (
              <div>
                <div style={{ textAlign: 'center', marginBottom: '22px' }}>
                  <h2 style={{
                    margin: '0 0 6px',
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.35rem',
                    color: 'var(--accent-indigo)'
                  }}>
                    Complete Account Verification
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Verify your email and phone number independently to unlock full access to the Aaroh Fair-Trade Sanctuary.
                  </p>
                </div>

                {/* Overall Completion Celebration */}
                {((isEmailVerified && isPhoneVerified) ||
                  (verificationContactType === 'email' && isEmailVerified) ||
                  (verificationContactType === 'phone' && isPhoneVerified) ||
                  (Boolean(verificationEmail) && !verificationPhone && isEmailVerified) ||
                  (Boolean(verificationPhone) && !verificationEmail && isPhoneVerified)) && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#EEF6E8',
                    border: '1.5px solid #68793D',
                    borderRadius: 'var(--radius-lg)',
                    textAlign: 'center',
                    marginBottom: '24px'
                  }}>
                    <div style={{ fontSize: '32px', marginBottom: '6px' }}>🪷</div>
                    <h3 style={{ margin: '0 0 4px', color: '#2D6629', fontSize: '1.15rem', fontWeight: 700 }}>
                      Account Successfully Verified!
                    </h3>
                    <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: '#3A5A40' }}>
                      Your account has been securely verified. Welcome to Aaroh!
                    </p>
                    <button
                      type="button"
                      onClick={() => onLoginSuccess(verifiedUserProfile || { email: verificationEmail, phone_number: verificationPhone, role: userRole })}
                      className="btn-primary"
                      style={{ padding: '12px 28px', backgroundColor: '#2D6629', borderColor: '#2D6629' }}
                    >
                      <span>Enter Aaroh Marketplace</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}

                {/* SINGLE CONTACT VERIFICATION (EITHER EMAIL OR PHONE NUMBER) */}
                {!(Boolean(verificationEmail) && Boolean(verificationPhone)) ? (
                  <div style={{
                    border: '1.5px solid var(--accent-indigo)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px',
                    marginBottom: '20px',
                    backgroundColor: 'var(--bg-surface)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1rem' }}>
                        {verificationContactType === 'email' || (!verificationPhone && Boolean(verificationEmail)) ? (
                          <>
                            <Mail size={18} color="var(--accent-indigo)" />
                            <span>Email Verification</span>
                          </>
                        ) : (
                          <>
                            <Smartphone size={18} color="var(--accent-terracotta)" />
                            <span>Mobile Phone SMS Verification</span>
                          </>
                        )}
                      </div>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: '#FFF3CD',
                        color: '#856404',
                        fontSize: '0.78rem',
                        fontWeight: 700
                      }}>
                        Pending Verification
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                      {verificationContactType === 'email' || (!verificationPhone && Boolean(verificationEmail)) ? (
                        <span>A real 6-digit verification code has been dispatched via Gmail SMTP to: <strong>{verificationEmail || verificationTarget}</strong> (Valid for 5 mins)</span>
                      ) : (
                        <span>A real 6-digit SMS verification code has been dispatched via Twilio to: <strong>{verificationPhone || verificationTarget}</strong> (Valid for 5 mins)</span>
                      )}
                    </div>

                    <form onSubmit={handleVerifySignupOtp}>
                      <div style={{ margin: '14px 0 16px' }}>
                        <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                          Enter 6-Digit Verification Code
                        </label>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(6, 1fr)',
                          gap: '10px',
                          maxWidth: '400px',
                          margin: '0 auto',
                          width: '100%'
                        }}>
                          {[0, 1, 2, 3, 4, 5].map((idx) => {
                            const digit = signupOtpDigits[idx] || '';
                            return (
                              <input
                                key={idx}
                                ref={(el) => (signupOtpInputRefs.current[idx] = el)}
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={digit}
                                onChange={(e) => handleBoxChange(signupOtpDigits, setSignupOtpDigits, signupOtpInputRefs, idx, e.target.value)}
                                onKeyDown={(e) => handleBoxKeyDown(signupOtpDigits, setSignupOtpDigits, signupOtpInputRefs, idx, e)}
                                onPaste={(e) => handleBoxPaste(setSignupOtpDigits, signupOtpInputRefs, e)}
                                onFocus={(e) => e.target.select()}
                                aria-label={`Signup code digit ${idx + 1}`}
                                style={{
                                  width: '100%',
                                  height: '56px',
                                  textAlign: 'center',
                                  fontSize: '1.65rem',
                                  fontWeight: 800,
                                  fontFamily: 'system-ui, -apple-system, sans-serif',
                                  color: '#0F172A',
                                  backgroundColor: '#FFFFFF',
                                  border: digit ? '2.5px solid #1A3459' : '2px solid #94A3B8',
                                  borderRadius: '10px',
                                  outline: 'none',
                                  boxShadow: digit ? '0 0 0 3px rgba(26, 52, 89, 0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                                  transition: 'all 0.15s ease',
                                  boxSizing: 'border-box'
                                }}
                              />
                            );
                          })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                          <span>Type each digit or paste full 6-digit code</span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{signupOtpDigits.join('').length}/6 digits</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                        <button
                          type="submit"
                          disabled={isVerifyingSignupOtp || signupOtpDigits.join('').length !== 6}
                          className="btn-primary"
                          style={{ flex: 1, padding: '12px' }}
                        >
                          {isVerifyingSignupOtp ? (
                            <>
                              <RefreshCw size={14} className="animate-spin" />
                              <span>Verifying Code...</span>
                            </>
                          ) : (
                            <span>Verify & Complete Registration</span>
                          )}
                        </button>

                        <button
                          type="button"
                          disabled={signupOtpCountdown > 0 || isResendingSignupOtp}
                          onClick={handleResendSignupOtp}
                          className="btn-secondary"
                          style={{ padding: '12px 16px', fontSize: '0.84rem' }}
                        >
                          {signupOtpCountdown > 0 ? `Resend (${signupOtpCountdown}s)` : 'Resend Code'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* LEGACY DUAL USERS (BOTH EMAIL AND PHONE ON FILE) */
                  <>
                    {/* SECTION A: EMAIL VERIFICATION */}
                    <div style={{
                      border: isEmailVerified ? '1.5px solid #A3D9A5' : '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px 20px',
                      marginBottom: '20px',
                      backgroundColor: isEmailVerified ? '#F7FCF5' : 'var(--bg-surface)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.98rem' }}>
                          <Mail size={18} color="var(--accent-indigo)" />
                          <span>1. Email Verification</span>
                        </div>
                        {isEmailVerified ? (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#D4EDDA',
                            color: '#155724',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}>
                            Verified ✓
                          </span>
                        ) : (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#FFF3CD',
                            color: '#856404',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}>
                            Pending Verification
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        <span>A real 6-digit verification code has been dispatched via Gmail SMTP to: <strong>{verificationEmail}</strong> (Valid for 5 mins)</span>
                      </div>

                      {!isEmailVerified && (
                        <form onSubmit={handleVerifyEmail}>
                          <div style={{ margin: '14px 0 16px' }}>
                            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                              Enter 6-Digit Email Verification Code
                            </label>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(6, 1fr)',
                              gap: '10px',
                              maxWidth: '400px',
                              margin: '0 auto',
                              width: '100%'
                            }}>
                              {[0, 1, 2, 3, 4, 5].map((idx) => {
                                const digit = emailOtpDigits[idx] || '';
                                return (
                                  <input
                                    key={idx}
                                    ref={(el) => (emailInputRefs.current[idx] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={digit}
                                    onChange={(e) => handleBoxChange(emailOtpDigits, setEmailOtpDigits, emailInputRefs, idx, e.target.value)}
                                    onKeyDown={(e) => handleBoxKeyDown(emailOtpDigits, setEmailOtpDigits, emailInputRefs, idx, e)}
                                    onPaste={(e) => handleBoxPaste(setEmailOtpDigits, emailInputRefs, e)}
                                    onFocus={(e) => e.target.select()}
                                    aria-label={`Email code digit ${idx + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '56px',
                                      textAlign: 'center',
                                      fontSize: '1.65rem',
                                      fontWeight: 800,
                                      fontFamily: 'system-ui, -apple-system, sans-serif',
                                      color: '#0F172A',
                                      backgroundColor: '#FFFFFF',
                                      border: digit ? '2.5px solid #1A3459' : '2px solid #94A3B8',
                                      borderRadius: '10px',
                                      outline: 'none',
                                      boxShadow: digit ? '0 0 0 3px rgba(26, 52, 89, 0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                                      transition: 'all 0.15s ease',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                );
                              })}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              <span>Type each digit or paste full 6-digit code</span>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{emailOtpDigits.join('').length}/6 digits</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                            <button
                              type="submit"
                              disabled={isVerifyingEmail || emailOtpDigits.join('').length !== 6}
                              className="btn-primary"
                              style={{ flex: 1, padding: '10px' }}
                            >
                              {isVerifyingEmail ? (
                                <>
                                  <RefreshCw size={14} className="animate-spin" />
                                  <span>Verifying...</span>
                                </>
                              ) : (
                                <span>{t('auth_btn_verify', 'Verify Email Code')}</span>
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={emailCountdown > 0 || isResendingEmail}
                              onClick={handleResendEmail}
                              className="btn-secondary"
                              style={{ padding: '10px 14px', fontSize: '0.84rem' }}
                            >
                              {emailCountdown > 0 ? `Resend (${emailCountdown}s)` : t('auth_btn_resend', 'Resend Code')}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>

                    {/* SECTION B: PHONE SMS VERIFICATION (Twilio Verify) */}
                    <div style={{
                      border: isPhoneVerified ? '1.5px solid #A3D9A5' : '1px solid var(--border-medium)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px 20px',
                      marginBottom: '20px',
                      backgroundColor: isPhoneVerified ? '#F7FCF5' : 'var(--bg-surface)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.98rem' }}>
                          <Smartphone size={18} color="var(--accent-terracotta)" />
                          <span>{t('auth_enter_phone_code', '2. Phone SMS Verification (Twilio Verify)')}</span>
                        </div>
                        {isPhoneVerified ? (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#D4EDDA',
                            color: '#155724',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}>
                            {t('auth_phone_verified_badge', 'Verified ✓')}
                          </span>
                        ) : (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: '#FFF3CD',
                            color: '#856404',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}>
                            Pending Verification
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        <span>A real 6-digit SMS verification code has been dispatched via Twilio to: <strong>{verificationPhone}</strong> (Valid for 5 mins)</span>
                      </div>

                      {!isPhoneVerified && (
                        <form onSubmit={handleVerifyPhone}>
                          <div style={{ margin: '14px 0 16px' }}>
                            <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                              {t('auth_enter_phone_code', 'Enter 6-Digit SMS Verification Code')}
                            </label>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(6, 1fr)',
                              gap: '10px',
                              maxWidth: '400px',
                              margin: '0 auto',
                              width: '100%'
                            }}>
                              {[0, 1, 2, 3, 4, 5].map((idx) => {
                                const digit = phoneOtpDigits[idx] || '';
                                return (
                                  <input
                                    key={idx}
                                    ref={(el) => (phoneInputRefs.current[idx] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    maxLength={6}
                                    value={digit}
                                    onChange={(e) => handleBoxChange(phoneOtpDigits, setPhoneOtpDigits, phoneInputRefs, idx, e.target.value)}
                                    onKeyDown={(e) => handleBoxKeyDown(phoneOtpDigits, setPhoneOtpDigits, phoneInputRefs, idx, e)}
                                    onPaste={(e) => handleBoxPaste(setPhoneOtpDigits, phoneInputRefs, e)}
                                    onFocus={(e) => e.target.select()}
                                    aria-label={`SMS code digit ${idx + 1}`}
                                    style={{
                                      width: '100%',
                                      height: '56px',
                                      textAlign: 'center',
                                      fontSize: '1.65rem',
                                      fontWeight: 800,
                                      fontFamily: 'system-ui, -apple-system, sans-serif',
                                      color: '#0F172A',
                                      backgroundColor: '#FFFFFF',
                                      border: digit ? '2.5px solid #1A3459' : '2px solid #94A3B8',
                                      borderRadius: '10px',
                                      outline: 'none',
                                      boxShadow: digit ? '0 0 0 3px rgba(26, 52, 89, 0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                                      transition: 'all 0.15s ease',
                                      boxSizing: 'border-box'
                                    }}
                                  />
                                );
                              })}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                              <span>Type each digit or paste full 6-digit code</span>
                              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{phoneOtpDigits.join('').length}/6 digits</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                            <button
                              type="submit"
                              disabled={isVerifyingPhone || phoneOtpDigits.join('').length !== 6}
                              className="btn-primary"
                              style={{ flex: 1, padding: '10px' }}
                            >
                              {isVerifyingPhone ? (
                                <>
                                  <RefreshCw size={14} className="animate-spin" />
                                  <span>Checking Twilio...</span>
                                </>
                              ) : (
                                <span>{t('auth_btn_verify', 'Verify Phone Code')}</span>
                              )}
                            </button>

                            <button
                              type="button"
                              disabled={phoneCountdown > 0 || isResendingPhone}
                              onClick={handleResendPhone}
                              className="btn-secondary"
                              style={{ padding: '10px 14px', fontSize: '0.84rem' }}
                            >
                              {phoneCountdown > 0 ? `Resend (${phoneCountdown}s)` : t('auth_btn_resend', 'Resend Code')}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </>
                )}

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('signin')}
                    className="btn-ghost"
                    style={{ fontSize: '0.85rem' }}
                  >
                    {t('auth_btn_back_to_login', '← Return to Login Screen')}
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: PASSWORD RESET FLOW                                */}
            {/* ========================================================= */}
            {authTab === 'forgot' && (
              <div>
                <h3 style={{
                  margin: '0 0 6px',
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  color: 'var(--accent-terracotta)'
                }}>
                  {t('auth_forgot_title', 'Password Recovery')}
                </h3>

                {forgotStep === 1 && (
                  <form onSubmit={handleForgotStep1Submit}>
                    <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      Enter your registered Email Address or Phone Number. We will dispatch a single-use 6-digit recovery code.
                    </p>

                    <div className="form-group">
                      <label className="form-label">{t('auth_email', 'Email Address or Phone Number')}</label>
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="e.g. aditi@aaroh.in or +91 98450 22002"
                        className="form-input"
                      />
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
                      disabled={isLoading}
                      className="btn-primary"
                      style={{ width: '100%', padding: '12px' }}
                    >
                      {isLoading ? 'Dispatching Recovery Code...' : t('auth_btn_send_reset', 'Send Recovery Code')}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <button
                        type="button"
                        onClick={() => handleSwitchTab('signin')}
                        className="btn-ghost"
                        style={{ fontSize: '0.85rem' }}
                      >
                        {t('auth_btn_back_to_login', '← Back to Sign In')}
                      </button>
                    </div>
                  </form>
                )}

                {forgotStep === 2 && (
                  <form onSubmit={handleForgotStep2Submit}>
                    <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                      Enter the 6-digit verification code sent to <strong>{forgotIdentifier}</strong>.
                    </p>

                    <div style={{ margin: '16px 0 20px' }}>
                      <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
                        Enter 6-Digit Password Reset Code
                      </label>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: '10px',
                        maxWidth: '400px',
                        margin: '0 auto',
                        width: '100%'
                      }}>
                        {[0, 1, 2, 3, 4, 5].map((idx) => {
                          const digit = forgotOtpDigits[idx] || '';
                          return (
                            <input
                              key={idx}
                              ref={(el) => (forgotInputRefs.current[idx] = el)}
                              type="text"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={6}
                              value={digit}
                              onChange={(e) => handleBoxChange(forgotOtpDigits, setForgotOtpDigits, forgotInputRefs, idx, e.target.value)}
                              onKeyDown={(e) => handleBoxKeyDown(forgotOtpDigits, setForgotOtpDigits, forgotInputRefs, idx, e)}
                              onPaste={(e) => handleBoxPaste(setForgotOtpDigits, forgotInputRefs, e)}
                              onFocus={(e) => e.target.select()}
                              aria-label={`Reset code digit ${idx + 1}`}
                              style={{
                                width: '100%',
                                height: '56px',
                                textAlign: 'center',
                                fontSize: '1.65rem',
                                fontWeight: 800,
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                                color: '#0F172A',
                                backgroundColor: '#FFFFFF',
                                border: digit ? '2.5px solid #1A3459' : '2px solid #94A3B8',
                                borderRadius: '10px',
                                outline: 'none',
                                boxShadow: digit ? '0 0 0 3px rgba(26, 52, 89, 0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                                transition: 'all 0.15s ease',
                                boxSizing: 'border-box'
                              }}
                            />
                          );
                        })}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <span>Type each digit or paste full 6-digit code</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{forgotOtpDigits.join('').length}/6 digits</span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || forgotOtpDigits.join('').length !== 6}
                      className="btn-primary"
                      style={{ width: '100%', padding: '12px' }}
                    >
                      {isLoading ? 'Verifying Code...' : t('auth_btn_verify', 'Verify Code & Proceed')}
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '0.84rem' }}>
                      <button
                        type="button"
                        onClick={() => setForgotStep(1)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        Change details
                      </button>
                      {forgotCountdown > 0 ? (
                        <span style={{ color: 'var(--text-muted)' }}>Resend in {forgotCountdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleForgotStep1Submit}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-terracotta)', fontWeight: 600, cursor: 'pointer' }}
                        >
                          {t('auth_btn_resend', 'Resend Code')}
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {forgotStep === 3 && (
                  <form onSubmit={handleForgotStep3Submit}>
                    <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: 'var(--text-secondary)' }}>
                      Identity verified! Create your new strong password.
                    </p>

                    <div className="form-group">
                      <label className="form-label">{t('auth_new_password', 'New Password (8+ characters)')}</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showForgotNewPassword ? 'text' : 'password'}
                          required
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          placeholder="Enter strong password"
                          className="form-input"
                          style={{ paddingRight: '42px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
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
                          {showForgotNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                        gap: '6px',
                        marginTop: '8px',
                        padding: '8px',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <div style={{ fontSize: '0.74rem', color: forgotStrength.hasMinLength ? '#2D6629' : 'var(--text-muted)' }}>
                          {forgotStrength.hasMinLength ? '✓' : '○'} 8+ Chars
                        </div>
                        <div style={{ fontSize: '0.74rem', color: forgotStrength.hasUpper ? '#2D6629' : 'var(--text-muted)' }}>
                          {forgotStrength.hasUpper ? '✓' : '○'} Uppercase
                        </div>
                        <div style={{ fontSize: '0.74rem', color: forgotStrength.hasLower ? '#2D6629' : 'var(--text-muted)' }}>
                          {forgotStrength.hasLower ? '✓' : '○'} Lowercase
                        </div>
                        <div style={{ fontSize: '0.74rem', color: forgotStrength.hasNumber ? '#2D6629' : 'var(--text-muted)' }}>
                          {forgotStrength.hasNumber ? '✓' : '○'} Number
                        </div>
                        <div style={{ fontSize: '0.74rem', color: forgotStrength.hasSpecial ? '#2D6629' : 'var(--text-muted)' }}>
                          {forgotStrength.hasSpecial ? '✓' : '○'} Special symbol
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">{t('auth_confirm_password', 'Confirm New Password')}</label>
                      <input
                        type="password"
                        required
                        value={forgotConfirmPassword}
                        onChange={(e) => setForgotConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        className="form-input"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !forgotStrength.isStrong}
                      className="btn-primary"
                      style={{ width: '100%', padding: '12px' }}
                    >
                      {isLoading ? 'Updating Password...' : t('auth_btn_reset_password', 'Reset & Log In')}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 5: DEMO ACCOUNTS (PRE-SEEDED SQLITE USERS)             */}
            {/* ========================================================= */}
            {authTab === 'demo' && (
              <div>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
                  Quickly test the marketplace using genuine pre-seeded verified accounts:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>Dulari Devi</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--accent-terracotta)', fontWeight: 600 }}>
                        Master Artisan • User ID: ARH-000101
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        dulari@aaroh.in • Verified Email & Phone
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('dulari@aaroh.in')}
                      disabled={isLoading}
                      className="btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                    >
                      Login Artisan
                    </button>
                  </div>

                  <div style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>Aditi Narang</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--accent-indigo)', fontWeight: 600 }}>
                        Craft Patron / Collector • User ID: ARH-000202
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        patron@aaroh.in • Verified Email & Phone
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('patron@aaroh.in')}
                      disabled={isLoading}
                      className="btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                    >
                      Login Patron
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
