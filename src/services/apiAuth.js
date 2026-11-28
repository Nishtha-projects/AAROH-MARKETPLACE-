/**
 * Aaroh Secure Authentication & Session Client Service
 * Integrated with Supabase Auth & Supabase PostgreSQL (with automatic local fallback)
 * Uses Row Level Security (RLS) and does not store plaintext passwords.
 */

import { supabase, isSupabaseConfigured, getSupabaseConfigStatus } from './supabaseClient';

const CACHED_USER_KEY = 'aaroh_cached_user';
const listeners = new Set();

const notifyListeners = (user) => {
  listeners.forEach((listener) => {
    try {
      listener(user);
    } catch (e) {
      console.warn('[apiAuth] Listener notice:', e);
    }
  });
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const storeSession = (token, user) => {
  if (token) {
    try { localStorage.setItem('aaroh_jwt_token', token); } catch {}
  }
  if (user) {
    try {
      localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
      localStorage.setItem('aaroh_authenticated_user', JSON.stringify(user));
    } catch {}
  }
  notifyListeners(user);
};

export const clearSession = () => {
  try {
    localStorage.removeItem(CACHED_USER_KEY);
    localStorage.removeItem('aaroh_jwt_token');
    localStorage.removeItem('aaroh_authenticated_user');
  } catch {}
  notifyListeners(null);
};

export const getStoredToken = () => {
  try {
    // Token is stored as a plain string (not JSON)
    return localStorage.getItem('aaroh_jwt_token') || null;
  } catch (e) {
    console.warn('[apiAuth] Failed to read stored token:', e);
    return null;
  }
};

export const subscribeToAuthService = (callback) => {
  callback(getStoredUser());
  listeners.add(callback);

  // If Supabase is active, listen to auth state changes directly
  let authSubscription = null;
  if (isSupabaseConfigured() && supabase) {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const mappedUser = {
            id: session.user.id,
            user_id: profile?.user_id || session.user.user_metadata?.user_id || `AAROH-${session.user.id.slice(0, 6).toUpperCase()}`,
            name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            full_name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            email: session.user.email,
            phone_number: profile?.phone_number || session.user.phone || session.user.user_metadata?.phone_number,
            phone: profile?.phone_number || session.user.phone,
            role: profile?.role || session.user.user_metadata?.role || 'customer',
            avatar: profile?.avatar || null,
            email_verified: Boolean(session.user.email_confirmed_at || profile?.email_verified),
            phone_verified: Boolean(session.user.phone_confirmed_at || profile?.phone_verified),
            created_at: session.user.created_at
          };
          storeSession(session.access_token, mappedUser);
        } catch {
          // Keep active cached user
        }
      } else if (event === 'SIGNED_OUT') {
        clearSession();
      }
    });
    authSubscription = data.subscription;
  }

  return () => {
    listeners.delete(callback);
    if (authSubscription) authSubscription.unsubscribe();
  };
};

/**
 * Universal fallback fetch helper for local backend
 */
const apiRequest = async (endpoint, options = {}) => {
    const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ` } : {}),
    ...options.headers
  };

  const response = await fetch(endpoint, {
    ...options,
    credentials: 'include',
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.isDuplicate = Boolean(data.isDuplicate);
    err.requiresVerification = Boolean(data.requiresVerification);
    err.data = data;
    throw err;
  }

  return data;
};

// ============================================================================
// 1. SIGNUP: Account Creation (Email OR Mobile Phone)
// ============================================================================
export const signup = async ({ name, fullName, identifier, email, phone_number, phone, password, confirmPassword, role = 'customer', captchaToken }) => {
  const rawName = (name || fullName || '').trim();
  const rawIdentifier = (identifier || '').trim();
  const rawEmail = (email || '').trim().toLowerCase();
  const rawPhone = (phone_number || phone || '').trim();

  // If Supabase is configured, use Supabase Auth + Profiles table
  if (isSupabaseConfigured() && supabase) {
    const uniqueUserId = `AAROH-${Math.floor(100000 + Math.random() * 900000)}`;

    const { data, error } = await supabase.auth.signUp({
      email: rawEmail || undefined,
      phone: rawPhone || undefined,
      password,
      options: {
        data: {
          name: rawName,
          full_name: rawName,
          phone_number: rawPhone,
          role,
          user_id: uniqueUserId
        }
      }
    });

    if (error) {
      const err = new Error(error.message);
      err.status = error.status || 400;
      throw err;
    }

    const user = data.user;
    const isEmailVerified = Boolean(user?.email_confirmed_at);
    const isPhoneVerified = Boolean(user?.phone_confirmed_at);

    // Ensure profile row exists in PostgreSQL public.profiles table
    if (user) {
      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: rawName,
          email: rawEmail,
          phone_number: rawPhone,
          email_verified: isEmailVerified,
          phone_verified: isPhoneVerified,
          role,
          user_id: uniqueUserId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      } catch (upsertErr) {
        console.warn('[Supabase Profiles notice]', upsertErr.message);
      }
    }

    return {
      success: true,
      message: 'Account created with Supabase. Please enter your verification code.',
      userId: user?.id,
      uniqueUserId,
      name: rawName,
      email: rawEmail,
      phone_number: rawPhone,
      email_verified: isEmailVerified,
      phone_verified: isPhoneVerified,
      emailDelivery: { sent: !isEmailVerified, error: null },
      phoneDelivery: { sent: false, error: null }
    };
  }

  // Fallback to local Express/SQLite backend
  return await apiRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: rawName,
      identifier: rawIdentifier || undefined,
      email: rawEmail || undefined,
      phone_number: rawPhone || undefined,
      password,
      confirmPassword,
      role,
      captchaToken
    })
  });
};

// ============================================================================
// 1.1 VERIFY SIGNUP OTP (UNIFIED EMAIL OR MOBILE)
// ============================================================================
export const verifySignupOtp = async ({ identifier, email, phone, phone_number, userId, code }) => {
  const res = await apiRequest('/api/auth/verify-signup-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier, email, phone, phone_number, userId, code })
  });
  if (res.fully_verified && res.user) {
    storeSession(res.token, res.user);
  }
  return res;
};

export const resendSignupOtp = async ({ identifier, email, phone, phone_number, userId, captchaToken }) => {
  return await apiRequest('/api/auth/resend-signup-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier, email, phone, phone_number, userId, captchaToken })
  });
};

// ============================================================================
// 1.2 PASSWORDLESS LOGIN OTP (EMAIL OR MOBILE)
// ============================================================================
export const sendLoginOtp = async ({ identifier, captchaToken }) => {
  try {
    return await apiRequest('/api/auth/login-otp/send', {
      method: 'POST',
      body: JSON.stringify({ identifier: (identifier || '').trim(), captchaToken })
    });
  } catch (err) {
    if (err?.status === 404 || err?.message?.includes('Failed to fetch')) {
      return {
        success: true,
        message: 'Demo code 123456 sent (Vercel demo mode).',
        isDemo: true
      };
    }
    throw err;
  }
};

export const verifyLoginOtp = async ({ identifier, code }) => {
  try {
    const res = await apiRequest('/api/auth/login-otp/verify', {
      method: 'POST',
      body: JSON.stringify({ identifier: (identifier || '').trim(), code: (code || '').trim() })
    });
    if (res.user) {
      storeSession(res.token, res.user);
    }
    return res;
  } catch (err) {
    if (err?.status === 404 || err?.message?.includes('Failed to fetch')) {
      const cleanLower = (identifier || '').toLowerCase();
      const role = cleanLower.includes('dulari') || cleanLower.includes('artisan') ? 'artisan' : (cleanLower.includes('admin') ? 'admin' : 'customer');
      const name = role === 'artisan' ? 'Dulari Devi' : (role === 'admin' ? 'Aaroh System Administrator' : 'Aditi Narang');
      const demoUser = {
        id: `demo_${role}`,
        user_id: role === 'artisan' ? 'ARH-000101' : (role === 'admin' ? 'ARH-000303' : 'ARH-000202'),
        name,
        full_name: name,
        email: cleanLower.includes('@') ? cleanLower : `${role}@aaroh.in`,
        phone_number: '+919845011001',
        phone: '+91 98450 11001',
        role,
        avatar: role === 'artisan' ? '/assets/images/hero-artisan.jpg' : null,
        email_verified: true,
        phone_verified: true
      };
      storeSession(`demo_token_${role}`, demoUser);
      return { success: true, message: 'Signed in successfully (Demo Mode)', user: demoUser, token: `demo_token_${role}` };
    }
    throw err;
  }
};

// ============================================================================
// 2. EMAIL OTP VERIFY & RESEND (Supabase Auth)
// ============================================================================
export const verifyEmailOtp = async ({ email, userId, code }) => {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanCode = (code || '').trim();

  if (isSupabaseConfigured() && supabase) {
    // Attempt verification as signup confirmation
    let { data, error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanCode,
      type: 'signup'
    });

    // Fallback to 'email' verification type if already invited/existing
    if (error) {
      const retry = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: 'email'
      });
      if (!retry.error) {
        data = retry.data;
        error = null;
      }
    }

    if (error) {
      const err = new Error(error.message || 'Invalid or expired verification code.');
      err.status = 400;
      throw err;
    }

    // Update profile in PostgreSQL
    if (data?.user) {
      try {
        await supabase.from('profiles').update({
          email_verified: true,
          updated_at: new Date().toISOString()
        }).eq('id', data.user.id);
      } catch {}

      const mappedUser = {
        id: data.user.id,
        name: data.user.user_metadata?.name || cleanEmail.split('@')[0],
        email: data.user.email,
        phone_number: data.user.phone || data.user.user_metadata?.phone_number,
        role: data.user.user_metadata?.role || 'customer',
        email_verified: true,
        phone_verified: Boolean(data.user.phone_confirmed_at)
      };

      storeSession(data.session?.access_token, mappedUser);

      return {
        success: true,
        message: 'Email verified successfully!',
        email_verified: true,
        phone_verified: Boolean(data.user.phone_confirmed_at),
        fully_verified: true,
        user: mappedUser
      };
    }
  }

  // Fallback to local backend
  const res = await apiRequest('/api/auth/verify-email-otp', {
    method: 'POST',
    body: JSON.stringify({ email: cleanEmail, userId, code: cleanCode })
  });
  if (res.fully_verified && res.user) {
    storeSession(res.token, res.user);
  }
  return res;
};

export const resendEmailOtp = async ({ email, userId, captchaToken }) => {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: cleanEmail
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: `A new verification code has been dispatched via Supabase to ${cleanEmail}.`,
      cooldownSeconds: 60
    };
  }

  return await apiRequest('/api/auth/send-email-otp', {
    method: 'POST',
    body: JSON.stringify({ email: cleanEmail, userId, captchaToken })
  });
};

export const sendEmailOtp = resendEmailOtp;

// ============================================================================
// 3. PHONE SMS OTP VERIFY & RESEND (Supabase Auth / Twilio)
// ============================================================================
export const verifyPhoneOtp = async ({ phone_number, phone, userId, code }) => {
  const targetPhone = (phone_number || phone || '').trim();
  const cleanCode = (code || '').trim();

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: targetPhone,
      token: cleanCode,
      type: 'sms'
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data?.user) {
      try {
        await supabase.from('profiles').update({
          phone_verified: true,
          updated_at: new Date().toISOString()
        }).eq('id', data.user.id);
      } catch {}

      const mappedUser = {
        id: data.user.id,
        name: data.user.user_metadata?.name,
        email: data.user.email,
        phone_number: targetPhone,
        role: data.user.user_metadata?.role || 'customer',
        email_verified: Boolean(data.user.email_confirmed_at),
        phone_verified: true
      };

      storeSession(data.session?.access_token, mappedUser);

      return {
        success: true,
        message: 'Phone verified successfully via Supabase!',
        phone_verified: true,
        email_verified: Boolean(data.user.email_confirmed_at),
        fully_verified: true,
        user: mappedUser
      };
    }
  }

  // Fallback to local Twilio Verify backend
  const res = await apiRequest('/api/auth/verify-phone-otp', {
    method: 'POST',
    body: JSON.stringify({ phone_number: targetPhone, userId, code: cleanCode })
  });
  if (res.fully_verified && res.user) {
    storeSession(res.token, res.user);
  }
  return res;
};

export const resendPhoneOtp = async ({ phone_number, phone, userId, captchaToken }) => {
  const targetPhone = (phone_number || phone || '').trim();

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.auth.signInWithOtp({
      phone: targetPhone
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: `A new SMS verification code has been dispatched via Supabase to ${targetPhone}.`,
      cooldownSeconds: 60
    };
  }

  return await apiRequest('/api/auth/send-phone-otp', {
    method: 'POST',
    body: JSON.stringify({ phone_number: targetPhone, userId, captchaToken })
  });
};

export const sendPhoneOtp = resendPhoneOtp;

// ============================================================================
// 4. LOGIN (Supabase Auth)
// ============================================================================
export const login = async (input, maybePassword, maybeCaptcha) => {
  let identifier, email, phone, phone_number, password, captchaToken;
  if (typeof input === 'string') {
    identifier = input;
    password = maybePassword;
    captchaToken = maybeCaptcha;
  } else if (input && typeof input === 'object') {
    ({ identifier, email, phone, phone_number, password, captchaToken } = input);
  }
  const loginId = (identifier || email || phone_number || phone || '').trim();

  if (isSupabaseConfigured() && supabase) {
    const isEmail = loginId.includes('@');
    const credentials = isEmail
      ? { email: loginId, password }
      : { phone: loginId, password };

    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      const err = new Error(error.message);
      err.status = error.status || 401;
      throw err;
    }

    const user = data.user;

    // Check verification status if required
    const isEmailVerified = Boolean(user.email_confirmed_at);
    const isPhoneVerified = Boolean(user.phone_confirmed_at);

    // Fetch user profile from public.profiles
    let profile = null;
    try {
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      profile = p;
    } catch {}

    const mappedUser = {
      id: user.id,
      user_id: profile?.user_id || user.user_metadata?.user_id || `AAROH-${user.id.slice(0, 6).toUpperCase()}`,
      name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0],
      full_name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0],
      email: user.email,
      phone_number: profile?.phone_number || user.phone || user.user_metadata?.phone_number,
      phone: profile?.phone_number || user.phone,
      role: profile?.role || user.user_metadata?.role || 'customer',
      avatar: profile?.avatar || null,
      email_verified: isEmailVerified,
      phone_verified: isPhoneVerified,
      created_at: user.created_at
    };

    storeSession(data.session?.access_token, mappedUser);

    return {
      success: true,
      message: `Welcome back, ${mappedUser.name}!`,
      user: mappedUser,
      token: data.session?.access_token
    };
  }

  // Fallback to local backend
  try {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier: loginId, password, captchaToken })
    });

    if (res.user) {
      storeSession(res.token, res.user);
    }

    return res;
  } catch (err) {
    if (err?.status === 404 || err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')) {
      const cleanLower = loginId.toLowerCase();
      if (cleanLower === 'dulari@aaroh.in' || cleanLower === 'arh-000101' || cleanLower.includes('dulari')) {
        const demoUser = {
          id: 'artisan_dulari_devi',
          user_id: 'ARH-000101',
          name: 'Dulari Devi',
          full_name: 'Dulari Devi',
          email: 'dulari@aaroh.in',
          phone_number: '+919845011001',
          phone: '+91 98450 11001',
          role: 'artisan',
          avatar: '/assets/images/hero-artisan.jpg',
          email_verified: true,
          phone_verified: true
        };
        storeSession('demo_token_artisan_dulari', demoUser);
        return { success: true, message: 'Welcome back, Dulari Devi! (Demo Mode)', user: demoUser, token: 'demo_token_artisan_dulari' };
      }
      if (cleanLower === 'patron@aaroh.in' || cleanLower === 'arh-000202' || cleanLower.includes('patron')) {
        const demoUser = {
          id: 'patron_aditi_narang',
          user_id: 'ARH-000202',
          name: 'Aditi Narang',
          full_name: 'Aditi Narang',
          email: 'patron@aaroh.in',
          phone_number: '+919845022002',
          phone: '+91 98450 22002',
          role: 'customer',
          avatar: null,
          email_verified: true,
          phone_verified: true
        };
        storeSession('demo_token_patron_aditi', demoUser);
        return { success: true, message: 'Welcome back, Aditi Narang! (Demo Mode)', user: demoUser, token: 'demo_token_patron_aditi' };
      }
      if (cleanLower === 'admin@aaroh.in' || cleanLower === 'arh-000303' || cleanLower.includes('admin')) {
        const demoUser = {
          id: 'admin_system',
          user_id: 'ARH-000303',
          name: 'Aaroh System Administrator',
          full_name: 'Aaroh System Administrator',
          email: 'admin@aaroh.in',
          phone_number: '+919845099009',
          phone: '+91 98450 99009',
          role: 'admin',
          avatar: null,
          email_verified: true,
          phone_verified: true
        };
        storeSession('demo_token_admin_system', demoUser);
        return { success: true, message: 'Welcome back, System Administrator! (Demo Mode)', user: demoUser, token: 'demo_token_admin_system' };
      }
    }
    throw err;
  }
};

export const loginWithCredentials = (idOrObj, pwd, cap) => {
  if (typeof idOrObj === 'string') {
    return login(idOrObj, pwd, cap);
  }
  return login(idOrObj);
};

// ============================================================================
// 5. LOGOUT (Supabase Auth)
// ============================================================================
export const logout = async () => {
  try {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    } else {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    }
  } catch {
    // Ignore network failure on logout
  } finally {
    clearSession();
  }
};

export const logoutUser = logout;

// ============================================================================
// 6. GET CURRENT USER / ACTIVE SESSION
// ============================================================================
export const getMe = async () => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        clearSession();
        return null;
      }

      let profile = null;
      try {
        const { data: p } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        profile = p;
      } catch {}

      const mappedUser = {
        id: user.id,
        user_id: profile?.user_id || user.user_metadata?.user_id || `AAROH-${user.id.slice(0, 6).toUpperCase()}`,
        name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0],
        full_name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0],
        email: user.email,
        phone_number: profile?.phone_number || user.phone || user.user_metadata?.phone_number,
        phone: profile?.phone_number || user.phone,
        role: profile?.role || user.user_metadata?.role || 'customer',
        avatar: profile?.avatar || null,
        email_verified: Boolean(user.email_confirmed_at),
        phone_verified: Boolean(user.phone_confirmed_at),
        created_at: user.created_at
      };

      storeSession(null, mappedUser);
      return mappedUser;
    } catch {
      clearSession();
      return null;
    }
  }

  // Fallback to local backend
  try {
    const res = await apiRequest('/api/auth/me');
    if (res.user) {
      storeSession(null, res.user);
      return res.user;
    }
    clearSession();
    return null;
  } catch (err) {
    // On static hosting (e.g. Vercel without backend API), /api/auth/me returns 404.
    // Silently fall back to cached demo user or guest mode (null) without throwing.
    if (err?.status === 404) {
      return getStoredUser() || null;
    }
    clearSession();
    return null;
  }
};

export const verifyActiveSession = getMe;

// ============================================================================
// 7. PASSWORD RESET (Supabase Auth)
// ============================================================================
export const forgotPassword = async ({ identifier, captchaToken }) => {
  const cleanId = (identifier || '').trim();

  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.auth.resetPasswordForEmail(cleanId, {
      redirectTo: `${window.location.origin}/#login?tab=reset`
    });

    if (error) {
      // Privacy-safe error masking
      console.warn('[Supabase Reset Password notice]', error.message);
    }

    return {
      success: true,
      message: 'If an account matches those details, a verification code has been dispatched.',
      cooldownSeconds: 60
    };
  }

  return await apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ identifier: cleanId, captchaToken })
  });
};

export const requestForgotPassword = (identifier) => forgotPassword({ identifier });

export const verifyPasswordResetOtp = async ({ identifier, code }) => {
  const cleanId = (identifier || '').trim();
  const cleanCode = (code || '').trim();

  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.verifyOtp({
      email: cleanId,
      token: cleanCode,
      type: 'recovery'
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'Code verified successfully! Please enter your new password.',
      actionToken: data.session?.access_token
    };
  }

  return await apiRequest('/api/auth/verify-password-reset-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier: cleanId, code: cleanCode })
  });
};

export const resetPassword = async ({ actionToken, newPassword, confirmPassword }) => {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw new Error(error.message);
    }

    const mappedUser = {
      id: data.user.id,
      name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
      email: data.user.email,
      role: data.user.user_metadata?.role || 'customer'
    };

    storeSession(null, mappedUser);

    return {
      success: true,
      message: 'Password reset successfully! You are now securely logged in.',
      user: mappedUser
    };
  }

  return await apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ actionToken, newPassword, confirmPassword })
  });
};

export const resetForgottenPassword = resetPassword;

// Backwards-compatible aliases
export const checkPreSignup = async ({ email, phone }) => {
  return await apiRequest('/api/auth/check-pre-signup', {
    method: 'POST',
    body: JSON.stringify({ email, phone })
  });
};

export const sendSignupVerification = async ({ fullName, email, phone, verificationMethod, captchaToken }) => {
  return await apiRequest('/api/auth/send-signup-verification', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, phone, verificationMethod, captchaToken })
  });
};


export const verifySignupLink = async (token) => {
  return await apiRequest('/api/auth/verify-signup-link', {
    method: 'POST',
    body: JSON.stringify({ token })
  });
};

export const completeSignup = async ({ actionToken, password, confirmPassword, role = 'customer' }) => {
  const res = await apiRequest('/api/auth/complete-signup', {
    method: 'POST',
    body: JSON.stringify({ actionToken, password, confirmPassword, role })
  });
  if (res.user) {
    storeSession(res.token, res.user);
  }
  return res;
};

export const logoutAllOtherSessions = async () => {
  return await apiRequest('/api/auth/logout-all-others', { method: 'POST' });
};

export const getActiveSessions = async () => {
  return [];
};

export const changeAccountPassword = async ({ currentPassword, newPassword, confirmPassword }) => {
  return await resetPassword({ newPassword, confirmPassword });
};

export const fetchSecurityActivity = async () => {
  return [];
};

export const getOAuthStatus = async () => {
  try {
    const res = await apiRequest('/api/auth/service-status');
    return {
      google: res.google || { configured: false },
      microsoft: res.microsoft || { configured: false },
      turnstile: res.turnstile || { configured: false },
      email: res.email || { configured: false },
      sms: res.sms || { configured: false }
    };
  } catch (err) {
    console.warn('[apiAuth] Service status check failed:', err);
    return {
      google: { configured: false },
      microsoft: { configured: false },
      turnstile: { configured: false },
      email: { configured: false },
      sms: { configured: false }
    };
  }
};

export const initiateGoogleLogin = async ({ role = 'customer' } = {}) => {
  const data = await apiRequest(`/api/auth/google?format=json&role=${encodeURIComponent(role)}`);
  if (!data?.configured || !data?.url) {
    const err = new Error(data?.error || 'Google OAuth is not configured on the server. Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.');
    err.code = 'GOOGLE_OAUTH_NOT_CONFIGURED';
    throw err;
  }
  window.location.href = data.url;
};

export const initiateMicrosoftLogin = async ({ role = 'customer' } = {}) => {
  const data = await apiRequest(`/api/auth/microsoft?format=json&role=${encodeURIComponent(role)}`);
  if (!data?.configured || !data?.url) {
    const err = new Error(data?.error || 'Microsoft OAuth is not configured on the server. Please configure MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET.');
    err.code = 'MICROSOFT_OAUTH_NOT_CONFIGURED';
    throw err;
  }
  window.location.href = data.url;
};


export const requestEmailOtp = async (email, purpose = 'signup', displayName = '', captchaToken = '') => {
  if (purpose === 'signup') {
    return await sendSignupVerification({ fullName: displayName, email, verificationMethod: 'email', captchaToken });
  } else if (purpose === 'forgot_password') {
    return await forgotPassword({ identifier: email, captchaToken });
  } else {
    return await sendLoginOtp({ identifier: email, captchaToken });
  }
};

export const verifyOtpCode = async (email, code, purpose = 'signup') => {
  if (purpose === 'signup') {
    return await verifySignupOtp({ email, identifier: email, code });
  } else if (purpose === 'forgot_password') {
    return await verifyPasswordResetOtp({ identifier: email, code });
  } else {
    return await verifyLoginOtp({ identifier: email, code });
  }
};

export const completePasswordRegistration = async ({ actionToken, name, phone, password, role = 'customer' }) => {
  return await completeSignup({ actionToken, password, confirmPassword: password, role });
};

export const verifyGoogleIdToken = async ({ idToken, role = 'customer' }) => {
  const res = await apiRequest('/api/auth/google/verify-token', {
    method: 'POST',
    body: JSON.stringify({ idToken, role })
  });
  if (res?.token && res?.user) {
    storeSession(res.token, res.user);
  }
  return res;
};

export default {
  signup,
  sendEmailOtp,
  verifyEmailOtp,
  sendPhoneOtp,
  verifyPhoneOtp,
  resendEmailOtp,
  resendPhoneOtp,
  login,
  logout,
  logoutUser,
  getMe,
  verifyActiveSession,
  forgotPassword,
  verifyPasswordResetOtp,
  resetPassword,
  checkPreSignup,
  sendSignupVerification,
  verifySignupOtp,
  resendSignupOtp,
  sendLoginOtp,
  verifyLoginOtp,
  verifySignupLink,
  completeSignup,
  loginWithCredentials,
  logoutAllOtherSessions,
  getActiveSessions,
  changeAccountPassword,
  fetchSecurityActivity,
  getStoredUser,
  getStoredToken,
  subscribeToAuthService,
  isSupabaseConfigured,
  getSupabaseConfigStatus,
  getOAuthStatus,
  initiateGoogleLogin,
  initiateMicrosoftLogin,
  verifyGoogleIdToken
};

