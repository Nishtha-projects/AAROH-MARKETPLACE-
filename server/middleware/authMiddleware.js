import jwt from 'jsonwebtoken';
import db from '../database/db.js';
import { verifySupabaseToken } from '../services/supabaseAdmin.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aaroh_heritage_jwt_secret_dev_key_2026_!#@$';

/**
 * Validate password against strong security policy:
 * - At least 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one number (0-9)
 * - At least one special symbol (!@#$%^&*...)
 */
export const validatePasswordPolicy = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters in length.' };
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password cannot exceed 128 characters.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (e.g. !@#$%^&*).' };
  }
  return { valid: true };
};

/**
 * Generate a persistent session in SQLite and sign a secure JWT
 */
export const generateSessionToken = (user, req = null) => {
  const tokenId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days

  const userAgent = req?.headers?.['user-agent'] || 'Web Browser';
  const ipAddress = req?.ip || req?.socket?.remoteAddress || '127.0.0.1';

  // Store active session in database
  db.prepare(`
    INSERT INTO sessions (token_id, user_id, user_agent, ip_address, expires_at, created_at, is_active)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `).run(tokenId, user.id, userAgent, ipAddress, expiresAt, new Date().toISOString());

  const token = jwt.sign(
    {
      tokenId,
      uid: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, tokenId, expiresAt };
};

/**
 * Generate short-lived action token for verification / password reset
 */
export const generateActionToken = (payload, expiresIn = '15m') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify action token
 */
export const verifyActionToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

/**
 * Secure Authentication Middleware:
 * Inspects HTTP-only cookies ('aaroh_session') first, falling back to Authorization Bearer header.
 * Parameterized database query against active sessions or Supabase JWT verification.
 */
export const requireAuth = async (req, res, next) => {
  let token = null;

  // 1. Check HTTP-only cookie first
  if (req.cookies && req.cookies.aaroh_session) {
    token = req.cookies.aaroh_session;
  }

  // 2. Fall back to Bearer token header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required. No session token provided.' });
  }

  try {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Verify session in database is still active and not revoked/logged out
      const sessionRecord = db.prepare(`
        SELECT * FROM sessions WHERE token_id = ? AND is_active = 1
      `).get(decoded.tokenId);

      if (!sessionRecord || Date.now() > sessionRecord.expires_at) {
        return res.status(401).json({ success: false, error: 'Session has expired or was terminated. Please log in again.' });
      }

      const user = db.prepare(`
        SELECT id, user_id, full_name, name, email, email_normalized, phone_number, phone, 
               role, avatar, email_verified, phone_verified, created_at, last_login 
        FROM users WHERE id = ?
      `).get(decoded.uid);

      if (!user) {
        return res.status(401).json({ success: false, error: 'User account not found.' });
      }

      req.user = user;
      req.sessionId = decoded.tokenId;
      req.token = token;
      return next();
    } catch (localJwtErr) {
      // Check if it's a Supabase Bearer token
      const supabaseUser = await verifySupabaseToken(token);
      if (supabaseUser) {
        req.user = {
          id: supabaseUser.id,
          user_id: supabaseUser.user_metadata?.user_id || `AAROH-${supabaseUser.id.slice(0, 6).toUpperCase()}`,
          name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
          full_name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0],
          email: supabaseUser.email,
          phone_number: supabaseUser.phone || supabaseUser.user_metadata?.phone_number,
          phone: supabaseUser.phone || '',
          role: supabaseUser.user_metadata?.role || 'customer',
          email_verified: Boolean(supabaseUser.email_confirmed_at) ? 1 : 0,
          phone_verified: Boolean(supabaseUser.phone_confirmed_at) ? 1 : 0,
          created_at: supabaseUser.created_at
        };
        req.token = token;
        return next();
      }

      return res.status(401).json({ success: false, error: 'Invalid or expired session token. Please log in again.' });
    }
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Authentication failed. Please log in again.' });
  }
};

/**
 * Strict Administrator Authorization Middleware:
 * Validates session token and enforces req.user.role === 'admin'.
 * 401 if unauthenticated, 403 if authenticated but not admin.
 */
export const requireAdmin = async (req, res, next) => {
  return requireAuth(req, res, () => {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Administrator privileges required.'
      });
    }
    next();
  });
};

export default {
  validatePasswordPolicy,
  generateSessionToken,
  generateActionToken,
  verifyActionToken,
  requireAuth,
  requireAdmin
};
