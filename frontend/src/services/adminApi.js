/**
 * Admin-side operations (mock backend, localStorage based).
 *
 * Like mockDb.js, every function here maps to one future admin API endpoint.
 * Admin accounts live in their own store and are NEVER the same as the
 * student / supervisor users of the main website.
 *
 * IMPORTANT: this is only a front-end mock. Real protection of the admin panel
 * must be done by the backend (role checks on every request, hashed passwords,
 * rate limiting, HTTPS).
 */
import { supervisorsData } from '../data/supervisorsData';
import { guidelinesData } from '../data/guidelinesData';
import { templatesData } from '../data/templatesData';
import { journalsData } from '../data/journalsData';
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
  makeId
} from './mockDb';
import { deptLabel } from '../utils/format';

/* ====================================================================
 * Admin authentication
 * ==================================================================== */

// First-run admin account (mock). Change the password from Admin → Settings,
// and replace this whole thing with real backend admin accounts later.
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
  const id = getAdminSessionId();
  if (!id) return null;
  const found = getAdmins().find((a) => a.id === id);
  if (!found) {
    clearAdminSession();
    return null;
  }
  return publicAdmin(found);
}

export function adminLogin(email, password) {
  ensureDefaultAdmin();
  const id = (email || '').trim().toLowerCase();
  const found = getAdmins().find((a) => a.email.toLowerCase() === id);
  // same message for both cases so attackers cannot tell which one was wrong
  if (!found || found.password !== password) {
    return { ok: false, error: 'Invalid admin email or password.' };
  }
  setAdminSessionId(found.id);
  return { ok: true, admin: publicAdmin(found) };
}

export function adminLogout() {
  clearAdminSession();
}

export function updateAdminAccount(adminId, { name, email, currentPassword, newPassword }) {
  const admins = getAdmins();
  const idx = admins.findIndex((a) => a.id === adminId);
  if (idx < 0) return { ok: false, error: 'Admin account not found.' };

  const current = admins[idx];
  const cleanName = (name ?? current.name).trim();
  const cleanEmail = (email ?? current.email).trim().toLowerCase();
  if (!cleanName || !cleanEmail) return { ok: false, error: 'Name and email are required.' };
  if (admins.some((a, i) => i !== idx && a.email.toLowerCase() === cleanEmail)) {
    return { ok: false, error: 'Another admin already uses this email.' };
  }

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

  admins[idx] = { ...current, name: cleanName, email: cleanEmail, password };
  saveAdmins(admins);
  return { ok: true, admin: publicAdmin(admins[idx]) };
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

// Directory profiles nobody has claimed yet (for linking a new supervisor account)
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
  return { ok: true, user: stripPassword(updated) };
}

/**
 * Deleting a user also removes what belongs to them:
 *  - student: their supervision requests + notifications
 *  - supervisor: their notifications; if the directory profile was created for them
 *    it is removed together with the requests sent to it
 */
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
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx >= 0) {
    list[idx] = item;
  } else {
    list.push({ ...item, id: item.id || makeId(kind.slice(0, 3)) });
  }
  saveContent(kind, list);
  return { ok: true };
}

export function deleteItem(kind, id) {
  saveContent(kind, listContent(kind).filter((x) => x.id !== id));
  return { ok: true };
}

export function moveItem(kind, id, direction) {
  const list = [...listContent(kind)];
  const idx = list.findIndex((x) => x.id === id);
  const target = idx + (direction === 'up' ? -1 : 1);
  if (idx < 0 || target < 0 || target >= list.length) return { ok: false };
  [list[idx], list[target]] = [list[target], list[idx]];
  saveContent(kind, list);
  return { ok: true };
}

export function resetToDefaults(kind) {
  resetContent(kind);
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
