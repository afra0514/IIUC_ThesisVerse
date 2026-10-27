/**
 * Centralized API client for communicating with the Node.js / Express backend
 * connected to MongoDB Atlas.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'iiuc_tv_token';
const ADMIN_TOKEN_KEY = 'iiuc_tv_admin_token';

export const getAuthToken = () => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY) || null;
  } catch (e) {
    return null;
  }
};

export const setAuthToken = (token) => {
  try {
    if (token) {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {}
};

export const getAdminAuthToken = () => {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY) || null;
  } catch (e) {
    return null;
  }
};

export const setAdminAuthToken = (token) => {
  try {
    if (token) {
      sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
      localStorage.setItem(ADMIN_TOKEN_KEY, token);
    } else {
      sessionStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_TOKEN_KEY);
    }
  } catch (e) {}
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  // Attach auth token if available and not explicitly provided
  if (!headers.Authorization) {
    const token = options.isAdmin ? getAdminAuthToken() : getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        ok: false,
        error: data.error || `HTTP ${res.status}: ${res.statusText}`,
        status: res.status
      };
    }

    return data;
  } catch (err) {
    console.warn(`[API] Failed to fetch ${endpoint}:`, err.message);
    return {
      ok: false,
      error: err.message || 'Network connection failed'
    };
  }
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  getMe: () => request('/auth/me', { method: 'GET' }),
  updateProfile: (body) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(body) }),

  // Admin
  adminLogin: (body) => request('/admin/login', { method: 'POST', body: JSON.stringify(body) }),
  getAdminSession: () => request('/admin/session', { method: 'GET', isAdmin: true }),
  updateAdminAccount: (body) => request('/admin/account', { method: 'PUT', body: JSON.stringify(body), isAdmin: true }),
  getStats: () => request('/admin/stats', { method: 'GET' }),
  listUsers: () => request('/admin/users', { method: 'GET', isAdmin: true }),
  listUnclaimedProfiles: () => request('/admin/unclaimed-profiles', { method: 'GET', isAdmin: true }),
  createUser: (body) => request('/admin/users', { method: 'POST', body: JSON.stringify(body), isAdmin: true }),
  updateUser: (id, body) => request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(body), isAdmin: true }),
  deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE', isAdmin: true }),

  // Supervisors
  getSupervisors: () => request('/supervisors', { method: 'GET' }),
  getSupervisorById: (id) => request(`/supervisors/${id}`, { method: 'GET' }),
  updateSupervisor: (id, body) => request(`/supervisors/${id}`, { method: 'PUT', body: JSON.stringify(body) }),

  // Requests
  getRequests: () => request('/requests', { method: 'GET' }),
  createRequest: (body) => request('/requests', { method: 'POST', body: JSON.stringify(body) }),
  respondToRequest: (id, body) => request(`/requests/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) }),

  // Notifications
  getNotifications: () => request('/notifications', { method: 'GET' }),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PATCH' }),

  // Content (guidelines, templates, journals)
  getContent: (kind) => request(`/content/${kind}`, { method: 'GET' }),
  saveItem: (kind, body) => request(`/content/${kind}`, { method: 'POST', body: JSON.stringify(body), isAdmin: true }),
  moveItem: (kind, body) => request(`/content/${kind}/move`, { method: 'POST', body: JSON.stringify(body), isAdmin: true }),
  resetDefaults: (kind) => request(`/content/${kind}/reset`, { method: 'POST', isAdmin: true }),
  deleteItem: (kind, id) => request(`/content/${kind}/${id}`, { method: 'DELETE', isAdmin: true }),

  // Chat
  sendChatMessage: (text) => request('/chat', { method: 'POST', body: JSON.stringify({ text }) }),

  // Bookmarks
  getBookmarks: () => request('/bookmarks', { method: 'GET' }),
  saveBookmarks: (items) => request('/bookmarks', { method: 'POST', body: JSON.stringify({ items }) })
};

export default api;
