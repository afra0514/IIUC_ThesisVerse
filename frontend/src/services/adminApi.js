/**
 * Admin-side operations connected directly to the Express backend and MongoDB Atlas.
 * Maintains local caching and event dispatching for instantaneous UI reactivity.
 */
import { supervisorsData } from '../data/supervisorsData';
import { guidelinesData } from '../data/guidelinesData';
import { templatesData } from '../data/templatesData';
import { journalsData } from '../data/journalsData';
import api, { setAdminAuthToken, getAdminAuthToken } from './api';
import {
  getUsers,
  saveUsers,
  getRequests,
  saveRequests,
  getNotifications,
  saveNotifications,
  getSupervisorProfiles,
  saveSupervisorProfiles,
  getContent,
  saveContent,
  resetContent,
  getAdmins,
  saveAdmins,
  getAdminSessionId,
  setAdminSessionId,
  clearAdminSession,
  makeId,
  DB_EVENT
} from './mockDb';
import { deptLabel } from '../utils/format';

/* ====================================================================
 * Admin authentication
 * ==================================================================== */

const DEFAULT_ADMIN = {
  id: 'adm-default',
  name: 'Administrator',
  email: 'admin@iiuc.ac.bd',
  password: 'Admin@12345'
};

const publicAdmin = (a) => (a ? { id: a.id, name: a.name, email: a.email } : null);

export function ensureDefaultAdmin() {
  if (getAdmins().length === 0) {
    saveAdmins([{ ...DEFAULT_ADMIN, createdAt: Date.now() }]);
  }
}

export function getAdminSession() {
  ensureDefaultAdmin();
  const token = getAdminAuthToken();
  const id = getAdminSessionId();
  if (!id && !token) return null;

  const found = getAdmins().find((a) => a.id === id);
  if (found) return publicAdmin(found);

  // If token exists, verify in background
  if (token) {
    api.getAdminSession().then((res) => {
      if (res.ok && res.admin) {
        setAdminSessionId(res.admin.id);
        const admins = getAdmins();
        const exists = admins.some((a) => a.id === res.admin.id);
        if (!exists) saveAdmins([res.admin, ...admins]);
      }
    });
  }

  return found ? publicAdmin(found) : (id ? { id, name: 'Administrator', email: 'admin@iiuc.ac.bd' } : null);
}

export async function adminLogin(email, password) {
  ensureDefaultAdmin();
  const cleanEmail = (email || '').trim().toLowerCase();

  // Try real MongoDB Atlas backend login first
  const res = await api.adminLogin({ email: cleanEmail, password });
  if (res.ok && res.admin) {
    setAdminAuthToken(res.token);
    setAdminSessionId(res.admin.id);
    const admins = getAdmins();
    const idx = admins.findIndex((a) => a.email.toLowerCase() === cleanEmail);
    if (idx >= 0) {
      admins[idx] = { ...admins[idx], ...res.admin };
      saveAdmins(admins);
    } else {
      saveAdmins([res.admin, ...admins]);
    }
    // Sync users & stats
    syncAdminData();
    return { ok: true, admin: res.admin };
  }

  // Fallback to local default admin if backend temporarily unreachable
  const found = getAdmins().find((a) => a.email.toLowerCase() === cleanEmail);
  if (!found || found.password !== password) {
    return { ok: false, error: res.error || 'Invalid admin email or password.' };
  }
  setAdminSessionId(found.id);
  return { ok: true, admin: publicAdmin(found) };
}

export function adminLogout() {
  setAdminAuthToken(null);
  clearAdminSession();
}

export async function updateAdminAccount(adminId, { name, email, currentPassword, newPassword }) {
  const admins = getAdmins();
  const idx = admins.findIndex((a) => a.id === adminId);
  const current = idx >= 0 ? admins[idx] : { name: 'Administrator', email: 'admin@iiuc.ac.bd', password: '' };

  const cleanName = (name ?? current.name).trim();
  const cleanEmail = (email ?? current.email).trim().toLowerCase();
  if (!cleanName || !cleanEmail) return { ok: false, error: 'Name and email are required.' };

  // Call backend API
  const res = await api.updateAdminAccount({
    name: cleanName,
    email: cleanEmail,
    currentPassword,
    newPassword
  });

  if (res.ok && res.admin) {
    if (idx >= 0) {
      admins[idx] = { ...current, name: cleanName, email: cleanEmail };
      saveAdmins(admins);
    }
    return { ok: true, admin: res.admin };
  }

  // Local fallback
  let password = current.password;
  if (newPassword) {
    if (currentPassword !== current.password) {
      return { ok: false, error: 'Current password is incorrect.' };
    }
    if (newPassword.length < 8) {
      return { ok: false, error: 'New password must be at least 8 characters.' };
    }
    password = newPassword;
  }

  if (idx >= 0) {
    admins[idx] = { ...current, name: cleanName, email: cleanEmail, password };
    saveAdmins(admins);
  }

  return { ok: true, admin: { id: adminId, name: cleanName, email: cleanEmail } };
}

/* ====================================================================
 * Users (students + supervisors)
 * ==================================================================== */

const stripPassword = (u) => {
  const { password, ...safe } = u;
  return safe;
};

export function listUsers() {
  const profiles = getSupervisorProfiles();
  return getUsers()
    .map((u) => {
      const safe = stripPassword(u);
      if (u.role === 'supervisor') {
        const base = supervisorsData.find((s) => String(s.id) === String(u.supervisorId));
        safe.profile = { ...(base || {}), ...(profiles[u.supervisorId] || {}) };
      }
      return safe;
    })
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

export function listUnclaimedProfiles() {
  const claimed = new Set(
    getUsers().filter((u) => u.role === 'supervisor').map((u) => String(u.supervisorId))
  );
  const profiles = getSupervisorProfiles();
  return supervisorsData
    .filter((s) => !claimed.has(String(s.id)))
    .map((s) => ({ ...s, ...(profiles[s.id] || {}) }));
}

const cleanTags = (tags) =>
  Array.isArray(tags)
    ? tags.map((t) => String(t).trim()).filter(Boolean)
    : String(tags || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

const profileFields = (d) => ({
  papers: Math.max(0, Number(d.papers) || 0),
  openSlots: Math.max(0, Number(d.openSlots) || 0),
  tags: cleanTags(d.tags),
  bio: (d.bio || '').trim(),
  scholar: (d.scholar || '').trim(),
  researchgate: (d.researchgate || '').trim(),
  linkedin: (d.linkedin || '').trim()
});

export function createUser(data) {
  const role = data.role === 'supervisor' ? 'supervisor' : 'student';
  const name = (data.name || '').trim();
  const email = (data.email || '').trim().toLowerCase();
  const password = data.password || '';
  const department = data.department === 'EEE' ? 'EEE' : 'CSE';

  if (!name || !email) return { ok: false, error: 'Name and email are required.' };
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email)) {
    return { ok: false, error: 'A user with this email already exists.' };
  }

  let newUser;

  if (role === 'student') {
    const studentId = (data.studentId || '').trim();
    if (!studentId) return { ok: false, error: 'Student ID is required.' };
    if (users.some((u) => u.role === 'student' && (u.studentId || '').toLowerCase() === studentId.toLowerCase())) {
      return { ok: false, error: 'This student ID is already registered.' };
    }
    newUser = {
      id: makeId('stu'),
      role,
      name,
      studentId,
      email,
      department,
      batch: (data.batch || '').trim(),
      phone: (data.phone || '').trim(),
      password,
      createdAt: Date.now()
    };
  } else {
    const designation = data.designation || 'Lecturer';
    const profiles = getSupervisorProfiles();
    const base = supervisorsData.find((s) => String(s.id) === String(data.profileChoice));
    let supervisorId;

    if (base) {
      if (users.some((u) => u.role === 'supervisor' && String(u.supervisorId) === String(base.id))) {
        return { ok: false, error: 'This directory profile is already linked to another account.' };
      }
      supervisorId = base.id;
      profiles[base.id] = {
        ...(profiles[base.id] || {}),
        ...profileFields(data),
        name,
        designation,
        department: deptLabel(department),
        email,
        phone: (data.phone || '').trim()
      };
    } else {
      supervisorId = makeId('sv');
      profiles[supervisorId] = {
        id: supervisorId,
        custom: true,
        ...profileFields(data),
        name,
        designation,
        department: deptLabel(department),
        email,
        phone: (data.phone || '').trim()
      };
    }
    saveSupervisorProfiles(profiles);

    newUser = {
      id: makeId('sup'),
      role,
      name,
      email,
      department,
      designation,
      phone: (data.phone || '').trim(),
      supervisorId,
      password,
      createdAt: Date.now()
    };
  }

  saveUsers([...users, newUser]);

  // Persist to MongoDB Atlas via backend API
  api.createUser(data).then((res) => {
    if (res.ok && res.user) {
      const currentUsers = getUsers();
      const updated = currentUsers.map((u) => (u.id === newUser.id ? { ...u, ...res.user } : u));
      saveUsers(updated);
    }
  });

  return { ok: true, user: stripPassword(newUser) };
}

export function updateUser(id, data) {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx < 0) return { ok: false, error: 'User not found.' };
  const current = users[idx];

  const name = (data.name ?? current.name).trim();
  const email = (data.email ?? current.email).trim().toLowerCase();
  const department = (data.department ?? current.department) === 'EEE' ? 'EEE' : 'CSE';
  if (!name || !email) return { ok: false, error: 'Name and email are required.' };
  if (users.some((u, i) => i !== idx && u.email.toLowerCase() === email)) {
    return { ok: false, error: 'Another user already uses this email.' };
  }

  let password = current.password;
  if (data.password) {
    if (data.password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
    password = data.password;
  }

  const updated = { ...current, name, email, department, password, phone: (data.phone ?? current.phone ?? '').trim() };

  if (current.role === 'student') {
    const studentId = (data.studentId ?? current.studentId).trim();
    if (!studentId) return { ok: false, error: 'Student ID is required.' };
    if (users.some((u, i) => i !== idx && u.role === 'student' && (u.studentId || '').toLowerCase() === studentId.toLowerCase())) {
      return { ok: false, error: 'Another student already uses this ID.' };
    }
    updated.studentId = studentId;
    updated.batch = (data.batch ?? current.batch ?? '').trim();
  } else {
    updated.designation = data.designation || current.designation;
    const profiles = getSupervisorProfiles();
    profiles[current.supervisorId] = {
      ...(profiles[current.supervisorId] || {}),
      ...profileFields(data),
      name,
      email,
      designation: updated.designation,
      department: deptLabel(department),
      phone: updated.phone
    };
    saveSupervisorProfiles(profiles);
  }

  users[idx] = updated;
  saveUsers(users);

  // Sync to backend MongoDB Atlas
  api.updateUser(id, data);

  return { ok: true, user: stripPassword(updated) };
}

export function deleteUser(id) {
  const users = getUsers();
  const target = users.find((u) => u.id === id);
  if (!target) return { ok: false, error: 'User not found.' };

  saveUsers(users.filter((u) => u.id !== id));

  if (target.role === 'student') {
    saveRequests(getRequests().filter((r) => r.studentUserId !== id));
    saveNotifications(getNotifications().filter((n) => n.recipient !== `u:${id}`));
  } else {
    const key = `s:${target.supervisorId}`;
    const profiles = getSupervisorProfiles();
    if (profiles[target.supervisorId] && profiles[target.supervisorId].custom) {
      delete profiles[target.supervisorId];
      saveSupervisorProfiles(profiles);
      saveRequests(getRequests().filter((r) => String(r.supervisorId) !== String(target.supervisorId)));
    }
    saveNotifications(getNotifications().filter((n) => n.recipient !== key));
  }

  // Delete from backend MongoDB Atlas
  api.deleteUser(id);

  return { ok: true };
}

/* ====================================================================
 * Content: guidelines / templates / journals (CRUD)
 * ==================================================================== */

const DEFAULTS = {
  guidelines: guidelinesData,
  templates: templatesData,
  journals: journalsData
};

export function listContent(kind) {
  return getContent(kind) || DEFAULTS[kind];
}

export function saveItem(kind, item) {
  const list = [...listContent(kind)];
  const itemId = item.id || makeId(kind.slice(0, 3));
  const fullItem = { ...item, id: itemId };
  const idx = list.findIndex((x) => x.id === itemId);

  if (idx >= 0) {
    list[idx] = fullItem;
  } else {
    list.push(fullItem);
  }

  saveContent(kind, list);

  // Save to MongoDB Atlas via backend API
  api.saveItem(kind, fullItem);

  return { ok: true, item: fullItem };
}

export function deleteItem(kind, id) {
  saveContent(kind, listContent(kind).filter((x) => x.id !== id));
  api.deleteItem(kind, id);
  return { ok: true };
}

export function moveItem(kind, id, direction) {
  const list = [...listContent(kind)];
  const idx = list.findIndex((x) => x.id === id);
  const target = idx + (direction === 'up' ? -1 : 1);
  if (idx < 0 || target < 0 || target >= list.length) return { ok: false };
  [list[idx], list[target]] = [list[target], list[idx]];
  saveContent(kind, list);

  api.moveItem(kind, { id, direction });
  return { ok: true };
}

export function resetToDefaults(kind) {
  resetContent(kind);
  api.resetDefaults(kind);
  return { ok: true };
}

/* ====================================================================
 * Dashboard numbers
 * ==================================================================== */

export function getStats() {
  const users = getUsers();
  const requests = getRequests();
  return {
    students: users.filter((u) => u.role === 'student').length,
    supervisors: users.filter((u) => u.role === 'supervisor').length,
    requests: {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      accepted: requests.filter((r) => r.status === 'accepted').length,
      rejected: requests.filter((r) => r.status === 'rejected').length
    },
    guidelines: listContent('guidelines').length,
    templates: listContent('templates').length,
    journals: listContent('journals').length
  };
}

/* ====================================================================
 * Background Data Synchronizer with MongoDB Atlas
 * ==================================================================== */

export async function syncAdminData() {
  try {
    const [statsRes, usersRes, guidelinesRes, templatesRes, journalsRes] = await Promise.all([
      api.getStats(),
      api.listUsers(),
      api.getContent('guidelines'),
      api.getContent('templates'),
      api.getContent('journals')
    ]);

    if (usersRes.ok && Array.isArray(usersRes.users)) {
      saveUsers(usersRes.users);
    }
    if (guidelinesRes.ok && Array.isArray(guidelinesRes.items)) {
      saveContent('guidelines', guidelinesRes.items);
    }
    if (templatesRes.ok && Array.isArray(templatesRes.items)) {
      saveContent('templates', templatesRes.items);
    }
    if (journalsRes.ok && Array.isArray(journalsRes.items)) {
      saveContent('journals', journalsRes.items);
    }
  } catch (err) {
    console.warn('[AdminApi] sync error:', err.message);
  }
}

// Initial background sync when admin panel is loaded
if (typeof window !== 'undefined') {
  syncAdminData();
}
