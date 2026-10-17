
/**
 * Temporary "backend" built on localStorage.
 *
 * Every function in this file maps to one future API call, so when the real
 * backend is ready you only need to replace the bodies here (or swap these
 * calls for fetch/axios) and the rest of the app stays the same.
 *
 * NOTE: passwords are stored in plain text here ONLY because this is a mock.
 * The real backend must hash them.
 */

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
  window.dispatchEvent(new Event(DB_EVENT));
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
  window.dispatchEvent(new Event(DB_EVENT));
};

/* ---------- Admin accounts (never mixed with student / supervisor users) ---------- */
export const getAdmins = () => read(STORAGE_KEYS.admins, []);
export const saveAdmins = (admins) => write(STORAGE_KEYS.admins, admins);

export const getAdminSessionId = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.adminSession);
  } catch (err) {
    return null;
  }
};
export const setAdminSessionId = (id) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.adminSession, id);
  } catch (err) {
    // ignore
  }
};
export const clearAdminSession = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.adminSession);
  } catch (err) {
    // ignore
  }
};

/* ---------- Session (per browser tab, so two accounts can be tested side by side) ---------- */
export const getSessionUserId = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.session);
  } catch (err) {
    return null;
  }
};
export const setSessionUserId = (id) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.session, id);
  } catch (err) {
    // ignore
  }
};
export const clearSession = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.session);
  } catch (err) {
    // ignore
  }
};

