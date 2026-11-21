import express from 'express';
import db from '../database/db.js';
import { requireAdmin } from '../middleware/authMiddleware.js';
import { logSecurityEvent } from '../services/securityLogger.js';

const router = express.Router();

/**
 * All admin routes require strict server-side admin authentication and authorization.
 * If not authenticated: 401 Unauthorized.
 * If authenticated but user.role !== 'admin': 403 Forbidden.
 */
router.use(requireAdmin);

// ============================================================================
// 1. ADMIN SESSION CHECK: GET /api/admin/check
// ============================================================================
router.get('/check', (req, res) => {
  const { password_hash, ...safeUser } = req.user;
  return res.json({
    success: true,
    isAdmin: true,
    user: safeUser
  });
});

// ============================================================================
// 2. LIVE USER STATISTICS: GET /api/admin/stats
// Returns real-time metrics, signup counts, verification breakdown, recent logins
// ============================================================================
router.get('/stats', (req, res) => {
  try {
    // Total registered users
    const totalRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
    const totalUsers = totalRow?.count || 0;

    // Time calculations for today and this month
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const signupsTodayRow = db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= ? OR date(created_at) = date('now', 'localtime')
    `).get(todayStart);
    const signupsToday = signupsTodayRow?.count || 0;

    const signupsMonthRow = db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= ? OR strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now', 'localtime')
    `).get(monthStart);
    const signupsThisMonth = signupsMonthRow?.count || 0;

    // Users who have logged in at least once
    const loggedRow = db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE (login_count IS NOT NULL AND login_count > 0)
         OR last_login_at IS NOT NULL 
         OR last_login IS NOT NULL
    `).get();
    const loggedUsersCount = loggedRow?.count || 0;

    // Users who have never logged in
    const neverLoggedRow = db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE (login_count IS NULL OR login_count = 0)
        AND last_login_at IS NULL 
        AND last_login IS NULL
    `).get();
    const neverLoggedCount = neverLoggedRow?.count || 0;

    // Email-verified users
    const emailVerifiedRow = db.prepare('SELECT COUNT(*) as count FROM users WHERE email_verified = 1').get();
    const emailVerifiedCount = emailVerifiedRow?.count || 0;

    // Phone-verified users
    const phoneVerifiedRow = db.prepare('SELECT COUNT(*) as count FROM users WHERE phone_verified = 1').get();
    const phoneVerifiedCount = phoneVerifiedRow?.count || 0;

    // Users with both email and phone verified
    const bothVerifiedRow = db.prepare(`
      SELECT COUNT(*) as count FROM users 
      WHERE email_verified = 1 AND phone_verified = 1
    `).get();
    const bothVerifiedCount = bothVerifiedRow?.count || 0;

    // Role breakdown
    const artisanRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'artisan'").get();
    const customerRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'customer'").get();
    const adminRow = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get();

    // Recent successful logins (from security_logs)
    const recentLogins = db.prepare(`
      SELECT s.id, s.user_id, s.identifier, s.ip_address, s.user_agent, s.created_at,
             u.name, u.full_name, u.role
      FROM security_logs s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.event = 'LOGIN_SUCCESS'
      ORDER BY s.id DESC 
      LIMIT 10
    `).all();

    return res.json({
      success: true,
      stats: {
        totalUsers,
        signupsToday,
        signupsThisMonth,
        loggedUsersCount,
        neverLoggedCount,
        emailVerifiedCount,
        phoneVerifiedCount,
        bothVerifiedCount,
        breakdown: {
          artisans: artisanRow?.count || 0,
          customers: customerRow?.count || 0,
          admins: adminRow?.count || 0
        },
        percentages: {
          emailVerified: totalUsers ? Math.round((emailVerifiedCount / totalUsers) * 100) : 0,
          phoneVerified: totalUsers ? Math.round((phoneVerifiedCount / totalUsers) * 100) : 0,
          bothVerified: totalUsers ? Math.round((bothVerifiedCount / totalUsers) * 100) : 0,
          hasLoggedIn: totalUsers ? Math.round((loggedUsersCount / totalUsers) * 100) : 0
        }
      },
      recentLogins: recentLogins.map(l => ({
        id: l.id,
        userId: l.user_id,
        name: l.name || l.full_name || 'Member',
        identifier: l.identifier,
        role: l.role || 'customer',
        ipAddress: l.ip_address,
        userAgent: l.user_agent,
        timestamp: l.created_at
      })),
      system: {
        database: 'SQLite 3 (WAL Mode)',
        serverTime: new Date().toISOString(),
        uptimeSeconds: Math.floor(process.uptime())
      }
    });
  } catch (err) {
    console.error('[Admin Stats Error]', err);
    return res.status(500).json({ success: false, error: 'Failed to aggregate statistics.' });
  }
});

// ============================================================================
// 3. USER MANAGEMENT TABLE: GET /api/admin/users
// Searchable, filterable, paginated.
// NEVER reveals password hashes, OTPs, or authentication secrets.
// ============================================================================
router.get('/users', (req, res) => {
  try {
    const {
      search = '',
      role = 'all',
      verification = 'all',
      loginStatus = 'all',
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const whereClauses = [];
    const queryParams = [];

    // Search filter across name, email, phone, user_id
    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      whereClauses.push(`(
        LOWER(name) LIKE ? OR 
        LOWER(full_name) LIKE ? OR 
        LOWER(email) LIKE ? OR 
        phone LIKE ? OR 
        phone_number LIKE ? OR 
        LOWER(user_id) LIKE ?
      )`);
      queryParams.push(term, term, term, term, term, term);
    }

    // Role filter
    if (role && role !== 'all') {
      whereClauses.push('role = ?');
      queryParams.push(role);
    }

    // Verification filter
    if (verification === 'both') {
      whereClauses.push('email_verified = 1 AND phone_verified = 1');
    } else if (verification === 'email_only') {
      whereClauses.push('email_verified = 1 AND phone_verified = 0');
    } else if (verification === 'phone_only') {
      whereClauses.push('phone_verified = 1 AND email_verified = 0');
    } else if (verification === 'unverified') {
      whereClauses.push('email_verified = 0 AND phone_verified = 0');
    } else if (verification === 'either') {
      whereClauses.push('(email_verified = 1 OR phone_verified = 1)');
    }

    // Login status filter
    if (loginStatus === 'logged_in') {
      whereClauses.push('((login_count IS NOT NULL AND login_count > 0) OR last_login_at IS NOT NULL OR last_login IS NOT NULL)');
    } else if (loginStatus === 'never_logged') {
      whereClauses.push('((login_count IS NULL OR login_count = 0) AND last_login_at IS NULL AND last_login IS NULL)');
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Allowed sort columns for SQL safety
    const allowedSort = ['created_at', 'last_login_at', 'login_count', 'name', 'email', 'user_id', 'role'];
    const safeSortBy = allowedSort.includes(sortBy) ? sortBy : 'created_at';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Count matching rows
    const countSql = `SELECT COUNT(*) as total FROM users ${whereSql}`;
    const totalRow = db.prepare(countSql).get(...queryParams);
    const total = totalRow?.total || 0;

    // Parameterized SELECT query - STRICTLY EXCLUDES password_hash
    const selectSql = `
      SELECT id, user_id, full_name, name, email, phone_number, phone, role, avatar,
             email_verified, phone_verified, created_at, updated_at, 
             last_login, last_login_at, login_count
      FROM users
      ${whereSql}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    const rawUsers = db.prepare(selectSql).all(...queryParams, limitNum, offset);

    // Format safe users with clear labels and explicit "Password protected" indicator
    const users = rawUsers.map(u => ({
      id: u.id,
      userId: u.user_id,
      name: u.name || u.full_name || 'Member',
      fullName: u.full_name || u.name,
      email: u.email,
      phone: u.phone_number || u.phone,
      phoneNumber: u.phone_number,
      role: u.role || 'customer',
      avatar: u.avatar,
      emailVerified: u.email_verified === 1,
      phoneVerified: u.phone_verified === 1,
      bothVerified: u.email_verified === 1 && u.phone_verified === 1,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
      lastLoginAt: u.last_login_at || u.last_login || null,
      loginCount: u.login_count || (u.last_login_at || u.last_login ? 1 : 0),
      passwordStatus: 'Password protected' // Explicitly NEVER outputs password or hash
    }));

    return res.json({
      success: true,
      users,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    console.error('[Admin Users Error]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch user directory.' });
  }
});

// ============================================================================
// 4. SECURITY & ACTIVITY LOGS: GET /api/admin/activities
// Live audit trail of signups, logins, failed attempts, and verifications
// ============================================================================
router.get('/activities', (req, res) => {
  try {
    const {
      event = 'all',
      search = '',
      page = 1,
      limit = 25
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const offset = (pageNum - 1) * limitNum;

    const whereClauses = [];
    const queryParams = [];

    if (event && event !== 'all') {
      whereClauses.push('event = ?');
      queryParams.push(event);
    }

    if (search && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      whereClauses.push('(LOWER(identifier) LIKE ? OR LOWER(event) LIKE ? OR LOWER(details) LIKE ?)');
      queryParams.push(term, term, term);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) as total FROM security_logs ${whereSql}`;
    const totalRow = db.prepare(countSql).get(...queryParams);
    const total = totalRow?.total || 0;

    const selectSql = `
      SELECT id, user_id, identifier, event, ip_address, user_agent, details, created_at
      FROM security_logs
      ${whereSql}
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    const logs = db.prepare(selectSql).all(...queryParams, limitNum, offset);

    return res.json({
      success: true,
      activities: logs.map(l => ({
        id: l.id,
        userId: l.user_id,
        identifier: l.identifier,
        event: l.event,
        ipAddress: l.ip_address,
        userAgent: l.user_agent,
        details: l.details,
        createdAt: l.created_at
      })),
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    console.error('[Admin Activities Error]', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch activity logs.' });
  }
});

// ============================================================================
// 5. UPDATE USER ROLE: POST /api/admin/users/:id/role
// Promotes or alters a user role safely; prevents self-demotion lockout
// ============================================================================
router.post('/users/:id/role', (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['customer', 'artisan', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
    }

    const targetUser = db.prepare('SELECT id, user_id, name, email, role FROM users WHERE id = ?').get(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Prevent admin self-demotion lockout
    if (req.user.id === targetUser.id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'You cannot remove your own administrator privileges to prevent system lockout.'
      });
    }

    const now = new Date().toISOString();
    db.prepare('UPDATE users SET role = ?, updated_at = ? WHERE id = ?').run(role, now, id);

    logSecurityEvent({
      req,
      userId: req.user.id,
      identifier: req.user.email,
      event: 'ADMIN_ROLE_CHANGED',
      details: `User ${targetUser.email} (${targetUser.user_id}) role changed from ${targetUser.role} to ${role}`
    });

    return res.json({
      success: true,
      message: `User role successfully updated to ${role}.`,
      user: {
        id: targetUser.id,
        userId: targetUser.user_id,
        email: targetUser.email,
        role
      }
    });
  } catch (err) {
    console.error('[Admin Role Update Error]', err);
    return res.status(500).json({ success: false, error: 'Failed to update user role.' });
  }
});

export default router;
