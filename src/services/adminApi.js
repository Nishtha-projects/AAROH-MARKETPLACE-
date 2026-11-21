/**
 * Aaroh Administrative Client Service
 * Interacts with protected /api/admin endpoints using HTTP-only session cookies
 */

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

export const checkAdminAccess = async () => {
  const res = await fetch('/api/admin/check', {
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(res);
};

export const getAdminStats = async () => {
  const res = await fetch('/api/admin/stats', {
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(res);
};

export const getAdminUsers = async ({
  search = '',
  role = 'all',
  verification = 'all',
  loginStatus = 'all',
  page = 1,
  limit = 10,
  sortBy = 'created_at',
  sortOrder = 'desc'
} = {}) => {
  const params = new URLSearchParams({
    search,
    role,
    verification,
    loginStatus,
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder
  });

  const res = await fetch(`/api/admin/users?${params.toString()}`, {
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(res);
};

export const getAdminActivities = async ({
  event = 'all',
  search = '',
  page = 1,
  limit = 25
} = {}) => {
  const params = new URLSearchParams({
    event,
    search,
    page: page.toString(),
    limit: limit.toString()
  });

  const res = await fetch(`/api/admin/activities?${params.toString()}`, {
    credentials: 'include',
    headers: { 'Accept': 'application/json' }
  });
  return handleResponse(res);
};

export const updateUserRole = async (userId, role) => {
  const res = await fetch(`/api/admin/users/${userId}/role`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ role })
  });
  return handleResponse(res);
};
