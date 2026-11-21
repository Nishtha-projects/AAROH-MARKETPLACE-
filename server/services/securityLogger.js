import db from '../database/db.js';

export const logSecurityEvent = ({ req, userId = null, email, identifier, event, details = null }) => {
  try {
    const ipAddress = (req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || req?.ip || '127.0.0.1').toString();
    const userAgent = (req?.headers['user-agent'] || 'Unknown Client').toString();
    const now = new Date().toISOString();
    const targetIdentifier = identifier || email || 'anonymous';

    db.prepare(`
      INSERT INTO security_logs (user_id, identifier, event, ip_address, user_agent, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, targetIdentifier, event, ipAddress, userAgent, details, now);
  } catch (err) {
    console.warn('[SecurityLogger] Failed to write security log:', err.message);
  }
};

export const getSecurityLogsForUser = (userId, limit = 20) => {
  try {
    return db.prepare(`
      SELECT id, event, ip_address, user_agent, details, created_at
      FROM security_logs
      WHERE user_id = ?
      ORDER BY id DESC LIMIT ?
    `).all(userId, limit);
  } catch (err) {
    return [];
  }
};

export const getActiveSessionsForUser = (userId) => {
  try {
    const now = Date.now();
    return db.prepare(`
      SELECT token_id, user_agent, ip_address, created_at, expires_at
      FROM sessions
      WHERE user_id = ? AND is_active = 1 AND expires_at > ?
      ORDER BY created_at DESC
    `).all(userId, now);
  } catch (err) {
    return [];
  }
};

export const revokeAllOtherSessions = (userId, currentSessionId) => {
  try {
    const result = db.prepare(`
      UPDATE sessions 
      SET is_active = 0 
      WHERE user_id = ? AND token_id != ? AND is_active = 1
    `).run(userId, currentSessionId);
    return result.changes || 0;
  } catch (err) {
    return 0;
  }
};

