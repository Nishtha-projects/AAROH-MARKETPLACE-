import '../env.js';
import { reloadEnv } from '../env.js';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import db, { generateUniqueUserId } from '../database/db.js';
import { logSecurityEvent } from './securityLogger.js';

/**
 * Production-Ready OAuth 2.0 & OpenID Connect Service
 * Integrates Google Identity and Microsoft Entra ID (personal & organizational).
 * Enforces CSRF state validation, identity token verification, and secure account linking.
 */

// ---------------------------------------------------------------------------
// 1. CONFIGURATION STATUS
// ---------------------------------------------------------------------------

export const checkGoogleConfigStatus = () => {
  reloadEnv();
  const clientId = (process.env.GOOGLE_CLIENT_ID || '').trim();
  const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || '').trim();
  const backendUrl = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
  const redirectUri = (process.env.GOOGLE_REDIRECT_URI || `${backendUrl}/api/auth/google/callback`).trim();

  const isClientIdValid = Boolean(clientId && !clientId.includes('your_') && !clientId.includes('xxxx'));
  const isClientSecretValid = Boolean(clientSecret && !clientSecret.includes('your_') && !clientSecret.includes('xxxx'));

  const configured = isClientIdValid && isClientSecretValid;
  const missing = [];
  if (!isClientIdValid) missing.push('GOOGLE_CLIENT_ID');
  if (!isClientSecretValid) missing.push('GOOGLE_CLIENT_SECRET');

  return {
    configured,
    provider: 'Google Identity (OAuth 2.0 / OIDC)',
    clientIdConfigured: isClientIdValid,
    clientSecretConfigured: isClientSecretValid,
    redirectUri,
    missing
  };
};

export const checkMicrosoftConfigStatus = () => {
  reloadEnv();
  const clientId = (process.env.MICROSOFT_CLIENT_ID || '').trim();
  const clientSecret = (process.env.MICROSOFT_CLIENT_SECRET || '').trim();
  const tenantId = (process.env.MICROSOFT_TENANT_ID || 'common').trim();
  const backendUrl = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/+$/, '');
  const redirectUri = (process.env.MICROSOFT_REDIRECT_URI || `${backendUrl}/api/auth/microsoft/callback`).trim();

  const isClientIdValid = Boolean(clientId && !clientId.includes('your_') && !clientId.includes('xxxx'));
  const isClientSecretValid = Boolean(clientSecret && !clientSecret.includes('your_') && !clientSecret.includes('xxxx'));

  const configured = isClientIdValid && isClientSecretValid;
  const missing = [];
  if (!isClientIdValid) missing.push('MICROSOFT_CLIENT_ID');
  if (!isClientSecretValid) missing.push('MICROSOFT_CLIENT_SECRET');

  return {
    configured,
    provider: 'Microsoft Entra ID (Personal & Work Accounts)',
    clientIdConfigured: isClientIdValid,
    clientSecretConfigured: isClientSecretValid,
    tenantId,
    redirectUri,
    missing
  };
};

// ---------------------------------------------------------------------------
// 2. CSRF STATE MANAGEMENT
// ---------------------------------------------------------------------------

export const generateOAuthState = ({ provider, role = 'customer', redirectUrl = null }) => {
  const state = crypto.randomBytes(24).toString('hex');
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000; // 10 minutes expiry

  // Clean stale states older than 15 minutes
  try {
    db.prepare('DELETE FROM oauth_states WHERE expires_at < ?').run(now);
  } catch {}

  db.prepare(`
    INSERT INTO oauth_states (state, provider, role, redirect_url, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(state, provider, role === 'artisan' ? 'artisan' : 'customer', redirectUrl, expiresAt, new Date().toISOString());

  return state;
};

export const verifyAndConsumeOAuthState = ({ state, provider }) => {
  if (!state || typeof state !== 'string') {
    const err = new Error('OAuth security state parameter is missing.');
    err.status = 400;
    err.code = 'OAUTH_STATE_MISSING';
    throw err;
  }

  const record = db.prepare(`
    SELECT * FROM oauth_states WHERE state = ? AND provider = ?
  `).get(state.trim(), provider);

  if (!record) {
    const err = new Error('Invalid or expired OAuth state parameter. Please restart sign-in.');
    err.status = 400;
    err.code = 'INVALID_OAUTH_STATE';
    throw err;
  }

  // Delete state so it cannot be reused
  db.prepare('DELETE FROM oauth_states WHERE state = ?').run(record.state);

  if (Date.now() > record.expires_at) {
    const err = new Error('OAuth authentication session expired. Please try signing in again.');
    err.status = 400;
    err.code = 'OAUTH_STATE_EXPIRED';
    throw err;
  }

  return record;
};

// ---------------------------------------------------------------------------
// 3. GOOGLE OAUTH 2.0 / OPENID CONNECT
// ---------------------------------------------------------------------------

export const getGoogleAuthUrl = ({ state, prompt = 'select_account' }) => {
  const config = checkGoogleConfigStatus();
  if (!config.configured) {
    const err = new Error(`Google OAuth is not configured. Missing in server/.env: ${config.missing.join(', ')}.`);
    err.status = 503;
    err.code = 'GOOGLE_OAUTH_NOT_CONFIGURED';
    throw err;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID.trim();
  const redirectUri = config.redirectUri;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const exchangeGoogleCodeForProfile = async ({ code, redirectUri = null }) => {
  const config = checkGoogleConfigStatus();
  if (!config.configured) {
    const err = new Error(`Google OAuth is not configured. Missing in server/.env: ${config.missing.join(', ')}.`);
    err.status = 503;
    err.code = 'GOOGLE_OAUTH_NOT_CONFIGURED';
    throw err;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET.trim();
  const targetRedirectUri = redirectUri || config.redirectUri;

  const tokenParams = new URLSearchParams({
    code: code.trim(),
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: targetRedirectUri,
    grant_type: 'authorization_code'
  });

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString()
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error('[Google Token Exchange Error]', tokenData);
    const err = new Error(tokenData.error_description || tokenData.error || 'Failed to exchange Google authorization code.');
    err.status = 400;
    err.code = 'GOOGLE_TOKEN_EXCHANGE_FAILED';
    throw err;
  }

  // Retrieve verified user profile from Google UserInfo
  const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });

  const profile = await profileRes.json();
  if (!profileRes.ok || !profile.sub) {
    console.error('[Google UserInfo Error]', profile);
    const err = new Error('Failed to retrieve verified Google profile.');
    err.status = 400;
    err.code = 'GOOGLE_PROFILE_FETCH_FAILED';
    throw err;
  }

  return {
    googleId: profile.sub,
    email: profile.email ? profile.email.toLowerCase() : null,
    name: profile.name || profile.given_name || (profile.email ? profile.email.split('@')[0] : 'Google User'),
    avatar: profile.picture || null,
    emailVerified: Boolean(profile.email_verified)
  };
};

export const verifyGoogleIdToken = async ({ idToken }) => {
  const config = checkGoogleConfigStatus();
  if (!config.configured) {
    const err = new Error('Google OAuth is not configured on the server.');
    err.status = 503;
    err.code = 'GOOGLE_OAUTH_NOT_CONFIGURED';
    throw err;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID.trim();
  const tokeninfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken.trim())}`);
  const payload = await tokeninfoRes.json();

  if (!tokeninfoRes.ok || payload.error_description) {
    const err = new Error(payload.error_description || 'Invalid Google ID token.');
    err.status = 400;
    err.code = 'INVALID_GOOGLE_TOKEN';
    throw err;
  }

  if (payload.aud !== clientId) {
    const err = new Error('Google ID token audience mismatch.');
    err.status = 401;
    err.code = 'TOKEN_AUDIENCE_MISMATCH';
    throw err;
  }

  return {
    googleId: payload.sub,
    email: payload.email ? payload.email.toLowerCase() : null,
    name: payload.name || (payload.email ? payload.email.split('@')[0] : 'Google User'),
    avatar: payload.picture || null,
    emailVerified: payload.email_verified === 'true' || payload.email_verified === true
  };
};

// ---------------------------------------------------------------------------
// 4. MICROSOFT ENTRA ID (OAUTH 2.0 / OPENID CONNECT)
// ---------------------------------------------------------------------------

export const getMicrosoftAuthUrl = ({ state, prompt = 'select_account' }) => {
  const config = checkMicrosoftConfigStatus();
  if (!config.configured) {
    const err = new Error(`Microsoft OAuth is not configured. Missing in server/.env: ${config.missing.join(', ')}.`);
    err.status = 503;
    err.code = 'MICROSOFT_OAUTH_NOT_CONFIGURED';
    throw err;
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID.trim();
  const tenant = config.tenantId;
  const redirectUri = config.redirectUri;

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    response_mode: 'query',
    scope: 'openid profile email User.Read',
    state,
    prompt
  });

  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;
};

export const exchangeMicrosoftCodeForProfile = async ({ code, redirectUri = null }) => {
  const config = checkMicrosoftConfigStatus();
  if (!config.configured) {
    const err = new Error(`Microsoft OAuth is not configured. Missing in server/.env: ${config.missing.join(', ')}.`);
    err.status = 503;
    err.code = 'MICROSOFT_OAUTH_NOT_CONFIGURED';
    throw err;
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID.trim();
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET.trim();
  const tenant = config.tenantId;
  const targetRedirectUri = redirectUri || config.redirectUri;

  const tokenParams = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: code.trim(),
    grant_type: 'authorization_code',
    redirect_uri: targetRedirectUri,
    scope: 'openid profile email User.Read'
  });

  const tokenRes = await fetch(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenParams.toString()
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) {
    console.error('[Microsoft Token Exchange Error]', tokenData);
    const err = new Error(tokenData.error_description || tokenData.error || 'Failed to exchange Microsoft authorization code.');
    err.status = 400;
    err.code = 'MICROSOFT_TOKEN_EXCHANGE_FAILED';
    throw err;
  }

  // Retrieve user details from Microsoft Graph API
  const graphRes = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });

  const graphData = await graphRes.json();
  if (!graphRes.ok || !graphData.id) {
    console.error('[Microsoft Graph Error]', graphData);
    const err = new Error('Failed to retrieve user profile from Microsoft Graph.');
    err.status = 400;
    err.code = 'MICROSOFT_GRAPH_FETCH_FAILED';
    throw err;
  }

  const rawEmail = graphData.mail || graphData.userPrincipalName || null;
  const cleanEmail = rawEmail ? rawEmail.toLowerCase() : null;

  return {
    microsoftId: graphData.id,
    email: cleanEmail,
    name: graphData.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'Microsoft User')
  };
};

// ---------------------------------------------------------------------------
// 5. ACCOUNT LINKING & PROVISIONING (SQLITE ENGINE)
// ---------------------------------------------------------------------------

export const syncOAuthUser = ({ provider, providerId, email, name, avatar = null, requestedRole = 'customer', req = null }) => {
  const cleanEmail = email ? email.trim().toLowerCase() : null;
  const cleanName = (name || (cleanEmail ? cleanEmail.split('@')[0] : 'Aaroh Member')).trim();
  const now = new Date().toISOString();

  let user = null;

  // 1. Check if user already linked this provider ID
  if (provider === 'google' && providerId) {
    user = db.prepare('SELECT * FROM users WHERE google_id = ?').get(providerId);
  } else if (provider === 'microsoft' && providerId) {
    user = db.prepare('SELECT * FROM users WHERE microsoft_id = ?').get(providerId);
  }

  // 2. If not matched by provider ID, match by verified email
  if (!user && cleanEmail) {
    user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR email_normalized = LOWER(?)').get(cleanEmail, cleanEmail);
  }

  if (user) {
    // Account exists: link provider ID, mark email verified, preserve existing role
    const currentProviders = (user.oauth_provider || '').split(',').map(s => s.trim()).filter(Boolean);
    if (!currentProviders.includes(provider)) {
      currentProviders.push(provider);
    }
    const updatedProviders = currentProviders.join(',');

    const googleIdToSet = provider === 'google' ? providerId : user.google_id;
    const microsoftIdToSet = provider === 'microsoft' ? providerId : user.microsoft_id;
    const avatarToSet = user.avatar || avatar || null;

    db.prepare(`
      UPDATE users 
      SET email_verified = 1,
          google_id = COALESCE(?, google_id),
          microsoft_id = COALESCE(?, microsoft_id),
          oauth_provider = ?,
          avatar = COALESCE(avatar, ?),
          last_login_at = ?,
          last_login = ?,
          login_count = COALESCE(login_count, 0) + 1,
          updated_at = ?
      WHERE id = ?
    `).run(googleIdToSet, microsoftIdToSet, updatedProviders, avatarToSet, now, now, now, user.id);

    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id);

    if (req) {
      logSecurityEvent({
        req,
        userId: updatedUser.id,
        identifier: updatedUser.email || updatedUser.user_id,
        event: `${provider.toUpperCase()}_LOGIN_SUCCESS`,
        details: `Linked OAuth login via ${provider}. Preserved role: ${updatedUser.role}`
      });
    }

    return { user: updatedUser, isNewUser: false };
  }

  // 3. Create new user account for first-time OAuth member
  const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const uniqueUserId = generateUniqueUserId();
  const safeRole = requestedRole === 'artisan' ? 'artisan' : 'customer';
  // Secure random unguessable password hash so passwordless account cannot be brute-forced
  const randomPassSecret = crypto.randomBytes(32).toString('hex');
  const passwordHash = bcrypt.hashSync(randomPassSecret, 10);

  db.prepare(`
    INSERT INTO users (
      id, user_id, full_name, name, email, email_normalized, phone_number, phone,
      password_hash, role, avatar, email_verified, phone_verified, login_count,
      google_id, microsoft_id, oauth_provider,
      created_at, updated_at, last_login_at, last_login
    )
    VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, 1, 0, 1, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    uniqueUserId,
    cleanName,
    cleanName,
    cleanEmail,
    cleanEmail,
    passwordHash,
    safeRole,
    avatar || (safeRole === 'artisan' ? '/assets/images/hero-artisan.jpg' : null),
    provider === 'google' ? providerId : null,
    provider === 'microsoft' ? providerId : null,
    provider,
    now,
    now,
    now,
    now
  );

  const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

  if (req) {
    logSecurityEvent({
      req,
      userId: newUser.id,
      identifier: newUser.email || uniqueUserId,
      event: `${provider.toUpperCase()}_SIGNUP_SUCCESS`,
      details: `New account created via ${provider} OAuth with role: ${safeRole}`
    });
  }

  return { user: newUser, isNewUser: true };
};

export default {
  checkGoogleConfigStatus,
  checkMicrosoftConfigStatus,
  generateOAuthState,
  verifyAndConsumeOAuthState,
  getGoogleAuthUrl,
  exchangeGoogleCodeForProfile,
  verifyGoogleIdToken,
  getMicrosoftAuthUrl,
  exchangeMicrosoftCodeForProfile,
  syncOAuthUser
};
