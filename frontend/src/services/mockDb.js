/**
 * Reactive data store bridging the React frontend with the Express backend & MongoDB Atlas.
 * Provides instant local updates, cross-tab synchronization, and persistent MongoDB Atlas storage.
 */
import api, { getAuthToken } from './api';

export const DB_EVENT = 'iiuc-db-change';

export const STORAGE_KEYS = {
  users: 'iiuc_tv_users',
  requests: 'iiuc_tv_requests',
  notifications: 'iiuc_tv_notifications',
  supervisorProfiles: 'iiuc_tv_supervisor_profiles',
  session: 'iiuc_tv_session',
  // content managed from the admin panel
  guidelines: 'iiuc_tv_guidelines',
  templates: 'iiuc_tv_templates',
  journals: 'iiuc_tv_journals',
  // admin panel (separate from normal users)
  admins: 'iiuc_tv_admins',
  adminSession: 'iiuc_tv_admin_session'
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // storage unavailable
  }
  // tell listeners in this tab (other tabs get the native "storage" event)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DB_EVENT));
  }
}

export const makeId = (prefix) =>
  `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/* ---------- Users ---------- */
export const getUsers = () => read(STORAGE_KEYS.users, []);
export const saveUsers = (users) => write(STORAGE_KEYS.users, users);

/* ---------- Supervisor profiles (edits + newly created profiles) ---------- */
export const getSupervisorProfiles = () => read(STORAGE_KEYS.supervisorProfiles, {});
export const saveSupervisorProfiles = (profiles) =>
  write(STORAGE_KEYS.supervisorProfiles, profiles);

/* ---------- Supervision requests ---------- */
export const getRequests = () => read(STORAGE_KEYS.requests, []);
export const saveRequests = (requests) => write(STORAGE_KEYS.requests, requests);

/* ---------- Notifications ---------- */
export const getNotifications = () => read(STORAGE_KEYS.notifications, []);
export const saveNotifications = (list) => write(STORAGE_KEYS.notifications, list);

/* ---------- Content lists (guidelines / templates / journals) ----------
 * null = the admin never edited it, so the app falls back to the built-in defaults. */
export const getContent = (kind) => read(STORAGE_KEYS[kind], null);
export const saveContent = (kind, list) => write(STORAGE_KEYS[kind], list);
export const resetContent = (kind) => {
  try {
    localStorage.removeItem(STORAGE_KEYS[kind]);
  } catch (err) {
    // ignore
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DB_EVENT));
  }
};

/* ---------- Admin accounts (never mixed with student / supervisor users) ---------- */
export const getAdmins = () => read(STORAGE_KEYS.admins, []);
export const saveAdmins = (admins) => write(STORAGE_KEYS.admins, admins);

export const getAdminSessionId = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.adminSession) || localStorage.getItem(STORAGE_KEYS.adminSession);
  } catch (err) {
    return null;
  }
};
export const setAdminSessionId = (id) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.adminSession, id);
    localStorage.setItem(STORAGE_KEYS.adminSession, id);
  } catch (err) {
    // ignore
  }
};
export const clearAdminSession = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.adminSession);
    localStorage.removeItem(STORAGE_KEYS.adminSession);
  } catch (err) {
    // ignore
  }
};

/* ---------- Session (per browser tab, so two accounts can be tested side by side) ---------- */
export const getSessionUserId = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.session) || localStorage.getItem(STORAGE_KEYS.session);
  } catch (err) {
    return null;
  }
};
export const setSessionUserId = (id) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.session, id);
    localStorage.setItem(STORAGE_KEYS.session, id);
  } catch (err) {
    // ignore
  }
};
export const clearSession = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.session);
    localStorage.removeItem(STORAGE_KEYS.session);
  } catch (err) {
    // ignore
  }
};

/* ====================================================================
 * MongoDB Atlas Synchronizer
 * ==================================================================== */

export async function syncAllFromBackend() {
  try {
    // 1. Fetch supervisors from MongoDB Atlas
    const supRes = await api.getSupervisors();
    if (supRes.ok && Array.isArray(supRes.supervisors)) {
      const profileMap = { ...getSupervisorProfiles() };
      supRes.supervisors.forEach((s) => {
        profileMap[s.id] = { ...profileMap[s.id], ...s };
      });
      saveSupervisorProfiles(profileMap);
    }

    // 2. Fetch Guidelines, Templates, Journals from MongoDB Atlas
    const [gRes, tRes, jRes] = await Promise.all([
      api.getContent('guidelines'),
      api.getContent('templates'),
      api.getContent('journals')
    ]);

    if (gRes.ok && Array.isArray(gRes.items)) saveContent('guidelines', gRes.items);
    if (tRes.ok && Array.isArray(tRes.items)) saveContent('templates', tRes.items);
    if (jRes.ok && Array.isArray(jRes.items)) saveContent('journals', jRes.items);

    // 3. If user token present, fetch requests & notifications
    if (getAuthToken()) {
      const [reqRes, notifRes] = await Promise.all([
        api.getRequests(),
        api.getNotifications()
      ]);
      if (reqRes.ok && Array.isArray(reqRes.requests)) {
        saveRequests(reqRes.requests);
      }
      if (notifRes.ok && Array.isArray(notifRes.notifications)) {
        saveNotifications(notifRes.notifications);
      }
    }
  } catch (err) {
    console.warn('[Sync] Backend sync warning:', err.message);
  }
}

// Automatically sync on load if running in browser
if (typeof window !== 'undefined') {
  syncAllFromBackend();
}
