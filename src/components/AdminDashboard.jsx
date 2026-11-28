import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Lock,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  ArrowLeft,
  Database,
  Activity,
  Sparkles,
  KeyRound,
  Copy,
  Check,
  Mail,
  Phone,
  BarChart3,
  Server,
  Layers,
  Zap,
  Globe,
  SlidersHorizontal,
  Sun,
  Moon
} from 'lucide-react';
import {
  checkAdminAccess,
  getAdminStats,
  getAdminUsers,
  getAdminActivities,
  updateUserRole
} from '../services/adminApi';
import { login, logoutUser } from '../services/apiAuth';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n';

export function AdminDashboard({
  lang = 'en',
  setLang,
  themeMode = 'light',
  setThemeMode,
  onReturnToHome,
  onOpenAuth
}) {
  const { t, i18n } = useTranslation();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    if (langMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [langMenuOpen]);

  // Authentication & Authorization State
  const [authState, setAuthState] = useState({
    checking: true,
    isAdmin: false,
    currentUser: null,
    error: null
  });

  // Admin login form state for visitors
  const [loginForm, setLoginForm] = useState({
    identifier: '',
    password: '',
    submitting: false,
    error: null
  });

  // Active view tab: 'overview' | 'users' | 'activities' | 'system'
  const [activeTab, setActiveTab] = useState('overview');

  // Stats State
  const [statsData, setStatsData] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(null);

  // Users Table State
  const [usersData, setUsersData] = useState([]);
  const [usersPagination, setUsersPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Users Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [loginStatusFilter, setLoginStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Activities Log State
  const [activitiesData, setActivitiesData] = useState([]);
  const [activitiesPagination, setActivitiesPagination] = useState({ total: 0, page: 1, limit: 25, totalPages: 1 });
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activityEventFilter, setActivityEventFilter] = useState('all');
  const [activitySearch, setActivitySearch] = useState('');
  const [activityPage, setActivityPage] = useState(1);

  // Auto-refresh countdown state (20s interval)
  const AUTO_REFRESH_INTERVAL = 20;
  const [countdown, setCountdown] = useState(AUTO_REFRESH_INTERVAL);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());
  const [copyStatus, setCopyStatus] = useState({});
  const [actionNotice, setActionNotice] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 350);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 1. Initial Access Verification
  const verifyAccess = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, checking: true, error: null }));
      const checkRes = await checkAdminAccess();
      if (checkRes.isAdmin && checkRes.user) {
        setAuthState({
          checking: false,
          isAdmin: true,
          currentUser: checkRes.user,
          error: null
        });
      } else {
        setAuthState({
          checking: false,
          isAdmin: false,
          currentUser: null,
          error: 'Administrator credentials required.'
        });
      }
    } catch (err) {
      if (err.status === 403) {
        // Logged in, but role is not admin
        setAuthState({
          checking: false,
          isAdmin: false,
          currentUser: err.data?.user || { role: 'customer' },
          error: 'Access denied: Your account does not have administrator privileges.'
        });
      } else {
        // Not logged in (401 or network)
        setAuthState({
          checking: false,
          isAdmin: false,
          currentUser: null,
          error: null
        });
      }
    }
  }, []);

  useEffect(() => {
    verifyAccess();
  }, [verifyAccess]);

  // 2. Fetch Live Stats
  const fetchStats = useCallback(async (isSilent = false) => {
    if (!authState.isAdmin) return;
    try {
      if (!isSilent) setStatsLoading(true);
      setStatsError(null);
      const res = await getAdminStats();
      if (res.success) {
        setStatsData(res);
        setLastRefreshedAt(new Date());
      }
    } catch (err) {
      setStatsError(err.message || 'Failed to fetch statistics');
    } finally {
      if (!isSilent) setStatsLoading(false);
    }
  }, [authState.isAdmin]);

  // 3. Fetch Users
  const fetchUsers = useCallback(async (isSilent = false) => {
    if (!authState.isAdmin) return;
    try {
      if (!isSilent) setUsersLoading(true);
      setUsersError(null);
      const res = await getAdminUsers({
        search: debouncedSearch,
        role: roleFilter,
        verification: verificationFilter,
        loginStatus: loginStatusFilter,
        page,
        limit,
        sortBy,
        sortOrder
      });
      if (res.success) {
        setUsersData(res.users);
        setUsersPagination(res.pagination);
      }
    } catch (err) {
      setUsersError(err.message || 'Failed to load user directory');
    } finally {
      if (!isSilent) setUsersLoading(false);
    }
  }, [authState.isAdmin, debouncedSearch, roleFilter, verificationFilter, loginStatusFilter, page, limit, sortBy, sortOrder]);

  // 4. Fetch Activities
  const fetchActivities = useCallback(async (isSilent = false) => {
    if (!authState.isAdmin) return;
    try {
      if (!isSilent) setActivitiesLoading(true);
      const res = await getAdminActivities({
        event: activityEventFilter,
        search: activitySearch,
        page: activityPage,
        limit: 25
      });
      if (res.success) {
        setActivitiesData(res.activities);
        setActivitiesPagination(res.pagination);
      }
    } catch (err) {
      console.warn('[Admin Activities error]', err);
    } finally {
      if (!isSilent) setActivitiesLoading(false);
    }
  }, [authState.isAdmin, activityEventFilter, activitySearch, activityPage]);

  // Initial data load when admin access is confirmed
  useEffect(() => {
    if (authState.isAdmin) {
      fetchStats();
      fetchUsers();
      fetchActivities();
    }
  }, [authState.isAdmin, fetchStats, fetchUsers, fetchActivities]);

  // Reload users when filters or pagination change
  useEffect(() => {
    if (authState.isAdmin) {
      fetchUsers();
    }
  }, [fetchUsers, authState.isAdmin]);

  // Reload activities when filters change
  useEffect(() => {
    if (authState.isAdmin && activeTab === 'activities') {
      fetchActivities();
    }
  }, [fetchActivities, authState.isAdmin, activeTab]);

  // 5. Auto-refresh Timer: every 20 seconds
  useEffect(() => {
    if (!authState.isAdmin) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger background auto-refresh
          fetchStats(true);
          fetchUsers(true);
          if (activeTab === 'activities') fetchActivities(true);
          return AUTO_REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [authState.isAdmin, fetchStats, fetchUsers, fetchActivities, activeTab]);

  // Manual Refresh Handler
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setCountdown(AUTO_REFRESH_INTERVAL);
    await Promise.all([
      fetchStats(false),
      fetchUsers(false),
      fetchActivities(false)
    ]);
    setIsRefreshing(false);
    showNotice('Dashboard refreshed with latest database records');
  };

  // Admin Direct Login Handler
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.identifier || !loginForm.password) {
      setLoginForm(prev => ({ ...prev, error: 'Please enter both your Email / Phone and password.' }));
      return;
    }

    try {
      setLoginForm(prev => ({ ...prev, submitting: true, error: null }));
      const res = await login({
        identifier: loginForm.identifier,
        password: loginForm.password
      });

      if (res.user?.role !== 'admin') {
        setLoginForm(prev => ({
          ...prev,
          submitting: false,
          error: `Logged in as ${res.user?.name || res.user?.email}, but this account is not an Administrator (Role: ${res.user?.role}). Please sign in with an admin account.`
        }));
        await verifyAccess();
        return;
      }

      setLoginForm({ identifier: '', password: '', submitting: false, error: null });
      await verifyAccess();
      showNotice(`Welcome, Administrator ${res.user.name || res.user.email}!`);
    } catch (err) {
      setLoginForm(prev => ({
        ...prev,
        submitting: false,
        error: err.message || 'Authentication failed. Please check your credentials.'
      }));
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    await logoutUser();
    setAuthState({
      checking: false,
      isAdmin: false,
      currentUser: null,
      error: null
    });
    showNotice('Administrator session safely terminated');
  };

  // Role Promotion Handler
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await updateUserRole(userId, newRole);
      if (res.success) {
        showNotice(res.message || `User role updated to ${newRole}`);
        fetchUsers(true);
        fetchStats(true);
      }
    } catch (err) {
      showNotice(err.message || 'Failed to update user role', true);
    }
  };

  // Copy helper
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setCopyStatus(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  // Floating notification helper
  const showNotice = (msg, isError = false) => {
    setActionNotice({ text: msg, isError });
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Format date helper
  const formatDate = (isoString) => {
    if (!isoString) return 'Never';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  // ============================================================================
  // VIEW: 1. Loading Access Verification
  // ============================================================================
  if (authState.checking) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px', animation: 'spin 2s linear infinite' }}>🪷</div>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', color: '#FCD34D' }}>
          Aaroh Identity & Security Gate
        </h2>
        <p style={{ color: '#94A3B8', marginTop: '8px' }}>
          Verifying cryptographic session & administrator credentials...
        </p>
      </div>
    );
  }

  // ============================================================================
  // VIEW: 2. Access Denied / 403 Forbidden Barrier (Non-Admin User)
  // ============================================================================
  if (!authState.isAdmin && authState.currentUser && authState.currentUser.role !== 'admin') {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: '#1E293B',
          borderRadius: '16px',
          border: '1px solid #334155',
          padding: '36px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#EF4444'
            }}>
              <ShieldAlert size={30} />
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#EF4444', fontWeight: 700 }}>
                403 Access Denied
              </span>
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.85rem', color: '#F8FAFC', margin: 0 }}>
                Administrator Privileges Required
              </h2>
            </div>
          </div>

          <p style={{ color: '#CBD5E1', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '20px' }}>
            The Aaroh Command Dashboard is strictly protected by server-side authorization. Your currently authenticated account does not possess administrative credentials.
          </p>

          <div style={{
            backgroundColor: '#0F172A',
            borderRadius: '10px',
            padding: '16px',
            border: '1px solid #334155',
            marginBottom: '24px',
            fontSize: '0.9rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Authenticated User:</span>
              <strong style={{ color: '#F8FAFC' }}>{authState.currentUser.name || authState.currentUser.full_name || 'Member'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#94A3B8' }}>Identifier:</span>
              <span style={{ color: '#F8FAFC' }}>{authState.currentUser.email || authState.currentUser.phone}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#94A3B8' }}>Assigned Role:</span>
              <span style={{
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(217, 119, 6, 0.2)',
                color: '#FCD34D',
                fontWeight: 600,
                fontSize: '0.82rem'
              }}>
                {authState.currentUser.role || 'customer'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={handleSignOut}
              style={{
                flex: 1,
                padding: '12px 18px',
                backgroundColor: '#D97706',
                color: '#FAF5EB',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <LogOut size={16} /> Sign in as Admin
            </button>
            <button
              onClick={onReturnToHome}
              style={{
                flex: 1,
                padding: '12px 18px',
                backgroundColor: 'transparent',
                color: '#CBD5E1',
                border: '1px solid #475569',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={16} /> Return to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW: 3. Unauthenticated Visitor - Dedicated Admin Sign-In Portal
  // ============================================================================
  if (!authState.isAdmin) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0A0F1D',
        color: '#F8FAFC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{
          maxWidth: '460px',
          width: '100%',
          backgroundColor: '#131D31',
          borderRadius: '20px',
          border: '1px solid rgba(217, 119, 6, 0.3)',
          padding: '40px 32px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '42px', marginBottom: '10px' }}>🪷</div>
            <span style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(217, 119, 6, 0.2)',
              color: '#FCD34D',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '10px'
            }}>
              Restricted Access
            </span>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', color: '#FAF5EB', margin: 0 }}>
              Aaroh Admin Portal
            </h1>
            <p style={{ color: '#94A3B8', fontSize: '0.9rem', marginTop: '8px' }}>
              Sign in with your verified administrator credentials to view live platform metrics.
            </p>
          </div>

          {/* Error Message */}
          {loginForm.error && (
            <div style={{
              padding: '12px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#FCA5A5',
              fontSize: '0.88rem',
              marginBottom: '20px',
              display: 'flex',
              gap: '10px',
              alignItems: 'flex-start'
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{loginForm.error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleAdminLogin}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>
                Admin Email or User ID
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={loginForm.identifier}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, identifier: e.target.value }))}
                  placeholder="e.g. admin@aaroh.in or ARH-XXXXXX"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    backgroundColor: '#0A0F1D',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Shield size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#64748B' }} />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#E2E8F0', marginBottom: '8px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter administrator password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    backgroundColor: '#0A0F1D',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Lock size={18} style={{ position: 'absolute', left: '14px', top: '14px', color: '#64748B' }} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginForm.submitting}
              style={{
                width: '100%',
                padding: '13px',
                backgroundColor: '#D97706',
                color: '#FAF5EB',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: loginForm.submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: loginForm.submitting ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loginForm.submitting ? (
                <>
                  <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Authenticating...
                </>
              ) : (
                <>
                  <KeyRound size={18} /> Authenticate into Admin Console
                </>
              )}
            </button>
          </form>

          {/* Quick CLI Provisioning Notice */}
          <div style={{
            marginTop: '24px',
            padding: '14px',
            borderRadius: '8px',
            backgroundColor: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid #1E293B',
            fontSize: '0.82rem',
            color: '#94A3B8'
          }}>
            <div style={{ fontWeight: 600, color: '#FCD34D', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Server size={14} /> Academic / Developer Provisioning:
            </div>
            <div>To create your first admin account safely from your terminal:</div>
            <code style={{
              display: 'block',
              marginTop: '6px',
              padding: '6px 10px',
              backgroundColor: '#0A0F1D',
              borderRadius: '6px',
              color: '#38BDF8',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              overflowX: 'auto'
            }}>
              npm run admin:create
            </code>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onReturnToHome}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'underline'
              }}
            >
              <ArrowLeft size={14} /> Back to Aaroh Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW: 4. Authenticated Full Admin Dashboard
  // ============================================================================
  const stats = statsData?.stats;
  const recentLogins = statsData?.recentLogins || [];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0A0F1D',
      color: '#F8FAFC',
      fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: '80px'
    }}>
      {/* Toast Notice */}
      {actionNotice && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          backgroundColor: actionNotice.isError ? '#DC2626' : '#059669',
          color: '#FAF5EB',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.9rem',
          fontWeight: 600,
          animation: 'slideIn 0.2s ease-out'
        }}>
          {actionNotice.isError ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <header style={{
        backgroundColor: '#131D31',
        borderBottom: '1px solid #1E293B',
        padding: '16px 28px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          {/* Brand & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={onReturnToHome}
              title="Return to Marketplace"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                backgroundColor: '#1E293B',
                color: '#CBD5E1',
                border: '1px solid #334155',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <ArrowLeft size={16} /> Marketplace
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '26px' }}>🪷</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.45rem', margin: 0, color: '#FAF5EB', fontWeight: 700 }}>
                    AAROH
                  </h1>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(217, 119, 6, 0.2)',
                    color: '#FCD34D',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase'
                  }}>
                    {t('admin_title', 'Admin Console')}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  {t('admin_subtitle', 'Identity Nexus • Real-Time Database Telemetry')}
                </div>
              </div>
            </div>
          </div>

          {/* Live Status & Quick Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* Auto-Refresh Indicator Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: '#0F172A',
              border: '1px solid #334155',
              fontSize: '0.8rem',
              color: '#94A3B8'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#10B981',
                boxShadow: '0 0 8px #10B981',
                display: 'inline-block'
              }} />
              <span>{t('admin_auto_refresh', 'Live Sync in')} <strong>{countdown}s</strong></span>
            </div>

            {/* Language Selector Dropdown */}
            <div ref={langMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  backgroundColor: '#1E293B',
                  color: '#CBD5E1',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <Globe size={14} style={{ color: '#38BDF8' }} />
                <span>{SUPPORTED_LANGUAGES.find(l => l.code === (i18n.language || lang))?.nativeName || 'Language'}</span>
              </button>
              {langMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  backgroundColor: '#131D31',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.7)',
                  width: '180px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                  zIndex: 100,
                  padding: '6px'
                }}>
                  {SUPPORTED_LANGUAGES.map((sl) => (
                    <button
                      key={sl.code}
                      type="button"
                      onClick={() => {
                        i18n.changeLanguage(sl.code);
                        if (typeof setLang === 'function') setLang(sl.code);
                        setLangMenuOpen(false);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '7px 10px',
                        borderRadius: '6px',
                        backgroundColor: i18n.language === sl.code ? '#1E293B' : 'transparent',
                        border: 'none',
                        color: i18n.language === sl.code ? '#FCD34D' : '#F8FAFC',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>{sl.flag}</span>
                      <span>{sl.nativeName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Manual Refresh Button */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#1E293B',
                color: '#FAF5EB',
                border: '1px solid #334155',
                borderRadius: '8px',
                cursor: isRefreshing ? 'not-allowed' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              <RefreshCw size={15} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>

            {/* Admin Profile & Sign out */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingLeft: '12px',
              borderLeft: '1px solid #334155'
            }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#F8FAFC' }}>
                  {authState.currentUser?.name || authState.currentUser?.email?.split('@')[0]}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#FCD34D' }}>
                  System Administrator
                </div>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out of Administrator Portal"
                style={{
                  padding: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#FCA5A5',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: 'clamp(14px, 3vw, 28px) clamp(12px, 3vw, 24px)' }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #1E293B',
          marginBottom: '28px',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}>
          {[
            { id: 'overview', label: t('admin_overview', 'Live Overview & Metrics'), icon: BarChart3 },
            { id: 'users', label: t('admin_users', 'User Directory Management'), icon: Users, badge: stats?.totalUsers },
            { id: 'activities', label: t('admin_activities', 'Security & Activity Stream'), icon: Activity },
            { id: 'system', label: t('admin_system', 'Database & System Health'), icon: Database }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 18px',
                  backgroundColor: isActive ? '#1E293B' : 'transparent',
                  color: isActive ? '#FCD34D' : '#94A3B8',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #FCD34D' : '2px solid transparent',
                  borderRadius: '8px 8px 0 0',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span style={{
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    backgroundColor: isActive ? 'rgba(217, 119, 6, 0.3)' : '#0F172A',
                    color: isActive ? '#FCD34D' : '#64748B',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ==================================================================== */}
        {/* TAB 1: OVERVIEW & LIVE USER STATISTICS                               */}
        {/* ==================================================================== */}
        {activeTab === 'overview' && (
          <div>
            {/* Top Metric Cards Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '18px',
              marginBottom: '28px'
            }}>
              {/* Card 1: Total Registered Users */}
              <div style={{
                backgroundColor: '#131D31',
                borderRadius: '14px',
                padding: '22px',
                border: '1px solid #1E293B',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('admin_total_users', 'Total Registered Users')}
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#FAF5EB', marginTop: '6px' }}>
                      {statsLoading ? '...' : (stats?.totalUsers || 0)}
                    </div>
                  </div>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: '#38BDF8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Users size={24} />
                  </div>
                </div>
                <div style={{ marginTop: '14px', display: 'flex', gap: '8px', fontSize: '0.78rem' }}>
                  <span style={{ color: '#38BDF8', fontWeight: 600 }}>
                    {stats?.breakdown?.artisans || 0} Artisans
                  </span>
                  <span style={{ color: '#64748B' }}>•</span>
                  <span style={{ color: '#FCD34D', fontWeight: 600 }}>
                    {stats?.breakdown?.customers || 0} Patrons
                  </span>
                  <span style={{ color: '#64748B' }}>•</span>
                  <span style={{ color: '#A78BFA', fontWeight: 600 }}>
                    {stats?.breakdown?.admins || 0} Admins
                  </span>
                </div>
              </div>

              {/* Card 2: New Signups Today & This Month */}
              <div style={{
                backgroundColor: '#131D31',
                borderRadius: '14px',
                padding: '22px',
                border: '1px solid #1E293B',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('admin_signups_today', 'New Signups Today')}
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#10B981', marginTop: '6px' }}>
                      +{statsLoading ? '...' : (stats?.signupsToday || 0)}
                    </div>
                  </div>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Calendar size={24} />
                  </div>
                </div>
                <div style={{ marginTop: '14px', fontSize: '0.82rem', color: '#94A3B8' }}>
                  <strong style={{ color: '#FAF5EB' }}>{stats?.signupsThisMonth || 0}</strong> {t('admin_signups_month', 'signups registered this calendar month')}
                </div>
              </div>

              {/* Card 3: Logged In vs Never Logged In */}
              <div style={{
                backgroundColor: '#131D31',
                borderRadius: '14px',
                padding: '22px',
                border: '1px solid #1E293B',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('admin_successful_logins', 'Login Engagement')}
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#FCD34D', marginTop: '6px' }}>
                      {statsLoading ? '...' : (stats?.loggedUsersCount || 0)}
                    </div>
                  </div>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(217, 119, 6, 0.15)',
                    color: '#FCD34D',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <UserCheck size={24} />
                  </div>
                </div>
                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <span style={{ color: '#10B981' }}>{stats?.percentages?.hasLoggedIn || 0}% {t('admin_successful_logins', 'active logins')}</span>
                  <span style={{ color: '#94A3B8' }}>{stats?.neverLoggedCount || 0} {t('admin_never_logged_in', 'never logged in')}</span>
                </div>
              </div>

              {/* Card 4: Verification Status */}
              <div style={{
                backgroundColor: '#131D31',
                borderRadius: '14px',
                padding: '22px',
                border: '1px solid #1E293B',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ color: '#94A3B8', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {t('admin_both_verified', 'Dual Verified (Email + Phone)')}
                    </div>
                    <div style={{ fontSize: '2.2rem', fontWeight: 700, color: '#A78BFA', marginTop: '6px' }}>
                      {statsLoading ? '...' : (stats?.bothVerifiedCount || 0)}
                    </div>
                  </div>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(167, 139, 250, 0.15)',
                    color: '#A78BFA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <ShieldCheck size={24} />
                  </div>
                </div>
                <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94A3B8' }}>
                  <span>{t('admin_email_verified', 'Email')}: <strong style={{ color: '#FAF5EB' }}>{stats?.emailVerifiedCount || 0}</strong></span>
                  <span>•</span>
                  <span>{t('admin_phone_verified', 'Phone')}: <strong style={{ color: '#FAF5EB' }}>{stats?.phoneVerifiedCount || 0}</strong></span>
                </div>
              </div>
            </div>

            {/* Verification Breakdown Progress Bars */}
            <div style={{
              backgroundColor: '#131D31',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #1E293B',
              marginBottom: '28px'
            }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#FAF5EB', margin: '0 0 16px 0' }}>
                Identity & Verification Distribution
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Email Verified */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#CBD5E1' }}>
                      <Mail size={15} color="#38BDF8" /> {t('admin_email_verified', 'Email Verified')}
                    </span>
                    <strong style={{ color: '#38BDF8' }}>
                      {stats?.emailVerifiedCount || 0} / {stats?.totalUsers || 0} ({stats?.percentages?.emailVerified || 0}%)
                    </strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#0A0F1D', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${stats?.percentages?.emailVerified || 0}%`,
                      backgroundColor: '#38BDF8',
                      transition: 'width 0.5s ease-out'
                    }} />
                  </div>
                </div>

                {/* Phone Verified */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#CBD5E1' }}>
                      <Phone size={15} color="#10B981" /> {t('admin_phone_verified', 'Phone Verified')}
                    </span>
                    <strong style={{ color: '#10B981' }}>
                      {stats?.phoneVerifiedCount || 0} / {stats?.totalUsers || 0} ({stats?.percentages?.phoneVerified || 0}%)
                    </strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#0A0F1D', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${stats?.percentages?.phoneVerified || 0}%`,
                      backgroundColor: '#10B981',
                      transition: 'width 0.5s ease-out'
                    }} />
                  </div>
                </div>

                {/* Both Verified */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#CBD5E1' }}>
                      <ShieldCheck size={15} color="#A78BFA" /> {t('admin_both_verified', 'Dual Verified (Both)')}
                    </span>
                    <strong style={{ color: '#A78BFA' }}>
                      {stats?.bothVerifiedCount || 0} / {stats?.totalUsers || 0} ({stats?.percentages?.bothVerified || 0}%)
                    </strong>
                  </div>
                  <div style={{ height: '8px', backgroundColor: '#0A0F1D', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${stats?.percentages?.bothVerified || 0}%`,
                      backgroundColor: '#A78BFA',
                      transition: 'width 0.5s ease-out'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Successful Login Activity Stream */}
            <div style={{
              backgroundColor: '#131D31',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #1E293B'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#FAF5EB', margin: 0 }}>
                    Recent Successful Login Activity
                  </h3>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                    Authenticated user sessions verified by password and cryptographic tokens.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('activities')}
                  style={{
                    padding: '6px 14px',
                    backgroundColor: '#1E293B',
                    color: '#FCD34D',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  View Complete Audit Stream →
                </button>
              </div>

              {recentLogins.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                  No recent login activity recorded.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1E293B', color: '#94A3B8', textAlign: 'left' }}>
                        <th style={{ padding: '10px 12px' }}>Member</th>
                        <th style={{ padding: '10px 12px' }}>Identifier</th>
                        <th style={{ padding: '10px 12px' }}>Role</th>
                        <th style={{ padding: '10px 12px' }}>IP Address</th>
                        <th style={{ padding: '10px 12px' }}>Timestamp</th>
                        <th style={{ padding: '10px 12px' }}>Auth Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentLogins.map((loginItem) => (
                        <tr key={loginItem.id} style={{ borderBottom: '1px solid #1E293B' }}>
                          <td style={{ padding: '12px', fontWeight: 600, color: '#FAF5EB' }}>
                            {loginItem.name}
                          </td>
                          <td style={{ padding: '12px', color: '#CBD5E1' }}>
                            {loginItem.identifier}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: loginItem.role === 'admin' ? 'rgba(167, 139, 250, 0.2)' : loginItem.role === 'artisan' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(217, 119, 6, 0.2)',
                              color: loginItem.role === 'admin' ? '#A78BFA' : loginItem.role === 'artisan' ? '#38BDF8' : '#FCD34D',
                              fontSize: '0.78rem',
                              fontWeight: 600
                            }}>
                              {loginItem.role}
                            </span>
                          </td>
                          <td style={{ padding: '12px', color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                            {loginItem.ipAddress}
                          </td>
                          <td style={{ padding: '12px', color: '#94A3B8' }}>
                            {formatDate(loginItem.timestamp)}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: '#10B981',
                              fontWeight: 600,
                              fontSize: '0.8rem'
                            }}>
                              <CheckCircle2 size={14} /> Password Verified
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: USER DIRECTORY MANAGEMENT TABLE                               */}
        {/* ==================================================================== */}
        {activeTab === 'users' && (
          <div>
            {/* Filter and Search Bar */}
            <div style={{
              backgroundColor: '#131D31',
              borderRadius: '14px',
              padding: '20px',
              border: '1px solid #1E293B',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                gap: '14px',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                {/* Search Input */}
                <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('admin_search_placeholder', 'Search by name, email, phone, or User ID...')}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      backgroundColor: '#0A0F1D',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748B' }} />
                </div>

                {/* Dropdown Filters */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {/* Role Filter */}
                  <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#0A0F1D',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.85rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Roles</option>
                    <option value="customer">Craft Patron (Customer)</option>
                    <option value="artisan">Artisan Creator</option>
                    <option value="admin">Administrator</option>
                  </select>

                  {/* Verification Filter */}
                  <select
                    value={verificationFilter}
                    onChange={(e) => { setVerificationFilter(e.target.value); setPage(1); }}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#0A0F1D',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.85rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Verification States</option>
                    <option value="both">Dual Verified (Both)</option>
                    <option value="email_only">Email Only</option>
                    <option value="phone_only">Phone Only</option>
                    <option value="unverified">Unverified</option>
                  </select>

                  {/* Login Status Filter */}
                  <select
                    value={loginStatusFilter}
                    onChange={(e) => { setLoginStatusFilter(e.target.value); setPage(1); }}
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#0A0F1D',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#F8FAFC',
                      fontSize: '0.85rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Login States</option>
                    <option value="logged_in">Has Logged In</option>
                    <option value="never_logged">Never Logged In</option>
                  </select>

                  {/* Page Size Selector */}
                  <select
                    value={limit}
                    onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: '#0A0F1D',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                      color: '#94A3B8',
                      fontSize: '0.85rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Users Data Table */}
            <div style={{
              backgroundColor: '#131D31',
              borderRadius: '14px',
              border: '1px solid #1E293B',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
            }}>
              {usersLoading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
                  <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
                  <div>Loading user directory from SQLite database...</div>
                </div>
              ) : usersData.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
                  <Users size={36} style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <div style={{ fontSize: '1.1rem', color: '#FAF5EB', fontWeight: 600 }}>No users found</div>
                  <p style={{ fontSize: '0.88rem', margin: '6px 0 0 0' }}>
                    Try adjusting your search query or filters.
                  </p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{
                        backgroundColor: '#0F172A',
                        borderBottom: '1px solid #1E293B',
                        color: '#94A3B8',
                        textAlign: 'left'
                      }}>
                        <th style={{ padding: '12px 14px' }}>{t('admin_col_user', 'User ID')}</th>
                        <th style={{ padding: '12px 14px' }}>{t('auth_fullname', 'Name')}</th>
                        <th style={{ padding: '12px 14px' }}>{t('admin_col_email', 'Email')}</th>
                        <th style={{ padding: '12px 14px' }}>{t('admin_col_phone', 'Phone')}</th>
                        <th style={{ padding: '12px 14px' }}>{t('admin_col_role', 'Role')}</th>
                        <th style={{ padding: '12px 14px' }}>{t('admin_email_verified', 'Email Ver.')}</th>
                        <th style={{ padding: '12px 14px' }}>{t('admin_phone_verified', 'Phone Ver.')}</th>
                        <th style={{ padding: '12px 14px' }}>{t('admin_col_last_login', 'Last Login')}</th>
                        <th style={{ padding: '12px 14px' }}>{t('admin_successful_logins', 'Logins')}</th>
                        <th style={{ padding: '12px 14px' }}>{t('auth_password', 'Password')}</th>
                        <th style={{ padding: '12px 14px' }}>{t('admin_col_created_at', 'Joined')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData.map((user) => (
                        <tr
                          key={user.id}
                          style={{
                            borderBottom: '1px solid #1E293B',
                            transition: 'background-color 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1A2640'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {/* User ID */}
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <code style={{
                                fontFamily: 'monospace',
                                color: '#38BDF8',
                                backgroundColor: '#0A0F1D',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.82rem'
                              }}>
                                {user.userId}
                              </code>
                              <button
                                onClick={() => handleCopy(user.userId, `uid_${user.id}`)}
                                title="Copy User ID"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: copyStatus[`uid_${user.id}`] ? '#10B981' : '#64748B',
                                  cursor: 'pointer',
                                  padding: '2px'
                                }}
                              >
                                {copyStatus[`uid_${user.id}`] ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </td>

                          {/* Name */}
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#FAF5EB' }}>
                            {user.name}
                          </td>

                          {/* Email */}
                          <td style={{ padding: '12px 14px', color: '#CBD5E1' }}>
                            {user.email}
                          </td>

                          {/* Phone */}
                          <td style={{ padding: '12px 14px', color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                            {user.phone || '—'}
                          </td>

                          {/* Role */}
                          <td style={{ padding: '12px 14px' }}>
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                backgroundColor: user.role === 'admin' ? 'rgba(167, 139, 250, 0.2)' : user.role === 'artisan' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(217, 119, 6, 0.2)',
                                color: user.role === 'admin' ? '#A78BFA' : user.role === 'artisan' ? '#38BDF8' : '#FCD34D',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="customer" style={{ backgroundColor: '#0F172A', color: '#FCD34D' }}>customer</option>
                              <option value="artisan" style={{ backgroundColor: '#0F172A', color: '#38BDF8' }}>artisan</option>
                              <option value="admin" style={{ backgroundColor: '#0F172A', color: '#A78BFA' }}>admin</option>
                            </select>
                          </td>

                          {/* Email Verified Status */}
                          <td style={{ padding: '12px 14px' }}>
                            {user.emailVerified ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#10B981',
                                fontSize: '0.78rem',
                                fontWeight: 600
                              }}>
                                <CheckCircle2 size={14} /> Verified
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#F87171',
                                fontSize: '0.78rem'
                              }}>
                                <XCircle size={14} /> Pending
                              </span>
                            )}
                          </td>

                          {/* Phone Verified Status */}
                          <td style={{ padding: '12px 14px' }}>
                            {user.phoneVerified ? (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#10B981',
                                fontSize: '0.78rem',
                                fontWeight: 600
                              }}>
                                <CheckCircle2 size={14} /> Verified
                              </span>
                            ) : (
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#F87171',
                                fontSize: '0.78rem'
                              }}>
                                <XCircle size={14} /> Pending
                              </span>
                            )}
                          </td>

                          {/* Last Successful Login */}
                          <td style={{ padding: '12px 14px', color: user.lastLoginAt ? '#CBD5E1' : '#64748B', fontSize: '0.82rem' }}>
                            {formatDate(user.lastLoginAt)}
                          </td>

                          {/* Login Count */}
                          <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              backgroundColor: user.loginCount > 0 ? 'rgba(16, 185, 129, 0.15)' : '#0A0F1D',
                              color: user.loginCount > 0 ? '#10B981' : '#64748B',
                              fontWeight: 600,
                              fontSize: '0.78rem'
                            }}>
                              {user.loginCount || 0}
                            </span>
                          </td>

                          {/* Password Status: Explicitly Never Revealed */}
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(56, 189, 248, 0.1)',
                              color: '#38BDF8',
                              fontSize: '0.78rem',
                              fontWeight: 600
                            }}>
                              <Lock size={12} /> {user.passwordStatus}
                            </span>
                          </td>

                          {/* Signup Date */}
                          <td style={{ padding: '12px 14px', color: '#94A3B8', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {formatDate(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination Bar */}
              <div style={{
                padding: '16px 20px',
                backgroundColor: '#0F172A',
                borderTop: '1px solid #1E293B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ fontSize: '0.85rem', color: '#94A3B8' }}>
                  Showing <strong>{usersData.length ? ((page - 1) * limit + 1) : 0}</strong> to <strong>{Math.min(page * limit, usersPagination.total)}</strong> of <strong>{usersPagination.total}</strong> registered members
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page <= 1}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: page <= 1 ? '#0A0F1D' : '#1E293B',
                      color: page <= 1 ? '#475569' : '#FAF5EB',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      cursor: page <= 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.82rem'
                    }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>

                  <span style={{ fontSize: '0.85rem', color: '#CBD5E1', padding: '0 8px' }}>
                    Page <strong>{page}</strong> of <strong>{usersPagination.totalPages || 1}</strong>
                  </span>

                  <button
                    onClick={() => setPage(prev => Math.min(usersPagination.totalPages, prev + 1))}
                    disabled={page >= usersPagination.totalPages}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: page >= usersPagination.totalPages ? '#0A0F1D' : '#1E293B',
                      color: page >= usersPagination.totalPages ? '#475569' : '#FAF5EB',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      cursor: page >= usersPagination.totalPages ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.82rem'
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: SECURITY & ACTIVITY STREAM                                   */}
        {/* ==================================================================== */}
        {activeTab === 'activities' && (
          <div>
            {/* Filter Bar */}
            <div style={{
              backgroundColor: '#131D31',
              borderRadius: '14px',
              padding: '20px',
              border: '1px solid #1E293B',
              marginBottom: '20px',
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
                <input
                  type="text"
                  value={activitySearch}
                  onChange={(e) => { setActivitySearch(e.target.value); setActivityPage(1); }}
                  placeholder="Filter by identifier or event detail..."
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    backgroundColor: '#0A0F1D',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#F8FAFC',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748B' }} />
              </div>

              <select
                value={activityEventFilter}
                onChange={(e) => { setActivityEventFilter(e.target.value); setActivityPage(1); }}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#0A0F1D',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#F8FAFC',
                  fontSize: '0.85rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Events</option>
                <option value="LOGIN_SUCCESS">Successful Logins</option>
                <option value="SIGNUP_SUCCESS">Successful Signups</option>
                <option value="EMAIL_VERIFIED_SUCCESS">Email Verified</option>
                <option value="PHONE_VERIFIED_SUCCESS">Phone Verified</option>
                <option value="LOGIN_FAILED_BAD_PASSWORD">Failed Logins (Bad Password)</option>
                <option value="LOGIN_RATE_LIMITED">Rate Limited Attempts</option>
                <option value="LOGOUT">Logouts</option>
              </select>
            </div>

            {/* Activities Table */}
            <div style={{
              backgroundColor: '#131D31',
              borderRadius: '14px',
              border: '1px solid #1E293B',
              overflow: 'hidden'
            }}>
              {activitiesLoading ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>
                  <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '12px' }} />
                  <div>Loading audit events...</div>
                </div>
              ) : activitiesData.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center', color: '#64748B' }}>
                  No security activity matching your filters.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#0F172A', borderBottom: '1px solid #1E293B', color: '#94A3B8', textAlign: 'left' }}>
                        <th style={{ padding: '12px 14px' }}>Timestamp</th>
                        <th style={{ padding: '12px 14px' }}>Event</th>
                        <th style={{ padding: '12px 14px' }}>Target Identifier</th>
                        <th style={{ padding: '12px 14px' }}>IP Address</th>
                        <th style={{ padding: '12px 14px' }}>Audit Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activitiesData.map((act) => {
                        const isSuccess = act.event.includes('SUCCESS') || act.event.includes('VERIFIED');
                        const isDanger = act.event.includes('FAILED') || act.event.includes('LIMITED') || act.event.includes('BLOCKED');
                        return (
                          <tr key={act.id} style={{ borderBottom: '1px solid #1E293B' }}>
                            <td style={{ padding: '12px 14px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                              {formatDate(act.createdAt)}
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              <span style={{
                                padding: '3px 8px',
                                borderRadius: '4px',
                                backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.15)' : isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                                color: isSuccess ? '#10B981' : isDanger ? '#F87171' : '#38BDF8',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                fontFamily: 'monospace'
                              }}>
                                {act.event}
                              </span>
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 600, color: '#FAF5EB' }}>
                              {act.identifier}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#94A3B8', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                              {act.ipAddress}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#CBD5E1', fontSize: '0.84rem' }}>
                              {act.details || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: DATABASE & SYSTEM HEALTH                                      */}
        {/* ==================================================================== */}
        {activeTab === 'system' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
            {/* Database Persistence Box */}
            <div style={{
              backgroundColor: '#131D31',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #1E293B'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <Database size={22} color="#38BDF8" />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#FAF5EB', margin: 0 }}>
                  Persistent Database Engine
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '8px' }}>
                  <span style={{ color: '#94A3B8' }}>Storage Technology:</span>
                  <strong style={{ color: '#FAF5EB' }}>SQLite 3 (Node.js 22 DatabaseSync)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '8px' }}>
                  <span style={{ color: '#94A3B8' }}>Journal Mode:</span>
                  <strong style={{ color: '#10B981' }}>WAL (Write-Ahead Logging)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '8px' }}>
                  <span style={{ color: '#94A3B8' }}>Foreign Keys:</span>
                  <strong style={{ color: '#10B981' }}>ON (Strict Cascades)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '8px' }}>
                  <span style={{ color: '#94A3B8' }}>Disk File Location:</span>
                  <code style={{ color: '#38BDF8', fontSize: '0.8rem' }}>server/database/aaroh.sqlite</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: '8px' }}>
                  <span style={{ color: '#94A3B8' }}>Password Hashing:</span>
                  <strong style={{ color: '#A78BFA' }}>bcrypt (10 rounds, salt)</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#94A3B8' }}>Raw Secrets in DB:</span>
                  <strong style={{ color: '#10B981' }}>0 (Never plain password or OTP)</strong>
                </div>
              </div>
            </div>

            {/* Quick CLI Commands Box */}
            <div style={{
              backgroundColor: '#131D31',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #1E293B'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                <Server size={22} color="#FCD34D" />
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#FAF5EB', margin: 0 }}>
                  Teacher & Academic Inspection Commands
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
                    1. Inspect persistent database records:
                  </div>
                  <code style={{
                    display: 'block',
                    padding: '8px 12px',
                    backgroundColor: '#0A0F1D',
                    borderRadius: '6px',
                    color: '#38BDF8',
                    fontFamily: 'monospace'
                  }}>
                    npm run db:inspect
                  </code>
                </div>
                <div>
                  <div style={{ color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
                    2. Provision or promote an Administrator:
                  </div>
                  <code style={{
                    display: 'block',
                    padding: '8px 12px',
                    backgroundColor: '#0A0F1D',
                    borderRadius: '6px',
                    color: '#FCD34D',
                    fontFamily: 'monospace'
                  }}>
                    npm run admin:create
                  </code>
                </div>
                <div>
                  <div style={{ color: '#CBD5E1', marginBottom: '4px', fontWeight: 600 }}>
                    3. Retrieve latest development demo OTP:
                  </div>
                  <code style={{
                    display: 'block',
                    padding: '8px 12px',
                    backgroundColor: '#0A0F1D',
                    borderRadius: '6px',
                    color: '#10B981',
                    fontFamily: 'monospace'
                  }}>
                    npm run demo:otp
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
