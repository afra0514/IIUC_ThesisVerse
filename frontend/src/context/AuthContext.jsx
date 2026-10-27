import React, { createContext, useContext, useState, useEffect } from 'react';
import { supervisorsData } from '../data/supervisorsData';
import api, { setAuthToken, getAuthToken } from '../services/api';
import {
  STORAGE_KEYS,
  getUsers,
  saveUsers,
  getSupervisorProfiles,
  saveSupervisorProfiles,
  getSessionUserId,
  setSessionUserId,
  clearSession,
  makeId,
  syncAllFromBackend
} from '../services/mockDb';
import { deptLabel } from '../utils/format';

const AuthContext = createContext(null);

const sanitize = (u) => {
  if (!u) return null;
  const { password, ...safe } = u;
  return safe;
};

const loadSessionUser = () => {
  try {
    localStorage.removeItem('iiuc_thesis_user');
  } catch (err) {}
  const id = getSessionUserId();
  if (!id) return null;
  const found = getUsers().find((u) => u.id === id || u.customId === id);
  if (!found) {
    return null;
  }
  return sanitize(found);
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSessionUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLoggedIn = !!user;

  // On mount: verify token with MongoDB Atlas backend
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getMe().then((res) => {
        if (res.ok && res.user) {
          setUser(res.user);
          setSessionUserId(res.user.id);
          const users = getUsers();
          const idx = users.findIndex((u) => u.id === res.user.id || u.email === res.user.email);
          if (idx >= 0) {
            users[idx] = { ...users[idx], ...res.user };
            saveUsers(users);
          } else {
            saveUsers([...users, res.user]);
          }
        }
      });
    }
  }, []);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== STORAGE_KEYS.users) return;
      const id = getSessionUserId();
      if (!id) return;
      const found = getUsers().find((u) => u.id === id || u.customId === id);
      setUser(found ? sanitize(found) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = async ({ identifier, password, role }) => {
    const id = (identifier || '').trim().toLowerCase();
    if (!id || !password) {
      return { ok: false, error: 'Please enter your ID/email and password.' };
    }

    setLoading(true);

    try {
      // 1. Try backend MongoDB Atlas authentication
      const res = await api.login({ identifier, password, role });
      if (res.ok && res.user) {
        setAuthToken(res.token);
        setSessionUserId(res.user.id);
        setUser(res.user);

        // Update local store
        const users = getUsers();
        const idx = users.findIndex((u) => u.id === res.user.id || u.email === res.user.email);
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...res.user };
          saveUsers(users);
        } else {
          saveUsers([...users, res.user]);
        }

        setIsAuthModalOpen(false);
        setLoading(false);
        syncAllFromBackend();
        return { ok: true, user: res.user };
      }

      // If backend returned explicit error (like wrong password or role mismatch)
      if (res.status === 400 || res.status === 401) {
        setLoading(false);
        return { ok: false, error: res.error };
      }

      // 2. Fallback to local accounts if backend is unreachable
      const found = getUsers().find(
        (u) =>
          u.email.toLowerCase() === id ||
          (u.studentId && u.studentId.toLowerCase() === id)
      );

      if (!found) {
        setLoading(false);
        return { ok: false, error: res.error || 'No account found. Please register first.' };
      }
      if (role && found.role !== role) {
        setLoading(false);
        return {
          ok: false,
          error: `This account is registered as a ${found.role}. Switch the role above and try again.`
        };
      }
      if (found.password !== password) {
        setLoading(false);
        return { ok: false, error: 'Incorrect password.' };
      }

      setSessionUserId(found.id);
      setUser(sanitize(found));
      setIsAuthModalOpen(false);
      setLoading(false);
      return { ok: true, user: sanitize(found) };
    } catch (err) {
      setLoading(false);
      return { ok: false, error: err.message || 'Login failed' };
    }
  };

  const register = async (data) => {
    const role = data.role === 'supervisor' ? 'supervisor' : 'student';
    const fullName = (data.fullName || '').trim();
    const email = (data.email || '').trim().toLowerCase();
    const password = data.password || '';
    const department = data.department === 'EEE' ? 'EEE' : 'CSE';

    if (!fullName || !email || !password) {
      return { ok: false, error: 'Please fill in all required fields.' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' };
    }

    setLoading(true);

    try {
      // 1. Register with backend MongoDB Atlas
      const res = await api.register(data);
      if (res.ok && res.user) {
        setAuthToken(res.token);
        setSessionUserId(res.user.id);
        setUser(res.user);

        // Update local store
        const users = getUsers();
        saveUsers([...users, res.user]);

        setIsAuthModalOpen(false);
        setLoading(false);
        syncAllFromBackend();
        return { ok: true, user: res.user };
      }

      if (res.status === 400 || res.status === 409) {
        setLoading(false);
        return { ok: false, error: res.error };
      }

      // 2. Fallback to local registration if backend unreachable
      const users = getUsers();
      if (users.some((u) => u.email.toLowerCase() === email)) {
        setLoading(false);
        return { ok: false, error: 'An account with this email already exists. Please sign in.' };
      }

      let newUser;

      if (role === 'student') {
        const studentId = (data.studentId || '').trim();
        if (!studentId) {
          setLoading(false);
          return { ok: false, error: 'Please enter your student ID.' };
        }
        if (
          users.some(
            (u) => u.role === 'student' && (u.studentId || '').toLowerCase() === studentId.toLowerCase()
          )
        ) {
          setLoading(false);
          return { ok: false, error: 'This student ID is already registered.' };
        }
        newUser = {
          id: makeId('stu'),
          role,
          name: fullName,
          studentId,
          email,
          department,
          batch: '',
          phone: '',
          password,
          createdAt: Date.now()
        };
      } else {
        const designation = data.designation || 'Lecturer';
        const profiles = getSupervisorProfiles();
        const base = supervisorsData.find((s) => String(s.id) === String(data.profileChoice));
        let supervisorId;

        if (base) {
          const taken = users.some(
            (u) => u.role === 'supervisor' && String(u.supervisorId) === String(base.id)
          );
          if (taken) {
            setLoading(false);
            return { ok: false, error: 'This faculty profile is already linked to another account.' };
          }
          supervisorId = base.id;
          profiles[base.id] = {
            ...(profiles[base.id] || {}),
            name: fullName,
            designation,
            department: deptLabel(department),
            email
          };
        } else {
          supervisorId = makeId('sv');
          profiles[supervisorId] = {
            id: supervisorId,
            custom: true,
            name: fullName,
            designation,
            department: deptLabel(department),
            papers: 0,
            openSlots: 3,
            tags: [],
            email,
            phone: '',
            scholar: '',
            researchgate: '',
            linkedin: '',
            bio: ''
          };
        }
        saveSupervisorProfiles(profiles);

        newUser = {
          id: makeId('sup'),
          role,
          name: fullName,
          email,
          department,
          designation,
          phone: '',
          supervisorId,
          password,
          createdAt: Date.now()
        };
      }

      saveUsers([...users, newUser]);
      setSessionUserId(newUser.id);
      setUser(sanitize(newUser));
      setIsAuthModalOpen(false);
      setLoading(false);
      return { ok: true, user: sanitize(newUser) };
    } catch (err) {
      setLoading(false);
      return { ok: false, error: err.message || 'Registration failed' };
    }
  };

  const updateProfile = async ({ account = {}, supervisorProfile, currentPassword, newPassword } = {}) => {
    if (!user) return { ok: false, error: 'You are not signed in.' };

    setLoading(true);

    try {
      // 1. Call backend MongoDB Atlas API
      const res = await api.updateProfile({
        account,
        supervisorProfile,
        currentPassword,
        newPassword
      });

      if (res.ok && res.user) {
        setUser(res.user);
        const users = getUsers();
        const idx = users.findIndex((u) => u.id === user.id);
        if (idx >= 0) {
          users[idx] = { ...users[idx], ...res.user };
          saveUsers(users);
        }
        setLoading(false);
        syncAllFromBackend();
        return { ok: true, user: res.user };
      }

      if (res.error && res.status !== 500) {
        setLoading(false);
        return { ok: false, error: res.error };
      }

      // 2. Local fallback
      const users = getUsers();
      const idx = users.findIndex((u) => u.id === user.id);
      if (idx < 0) {
        setLoading(false);
        return { ok: false, error: 'Account not found.' };
      }
      const current = users[idx];

      const name = (account.name ?? current.name).trim();
      const email = (account.email ?? current.email).trim().toLowerCase();
      if (!name || !email) {
        setLoading(false);
        return { ok: false, error: 'Name and email are required.' };
      }

      let password = current.password;
      if (newPassword) {
        if (currentPassword !== current.password) {
          setLoading(false);
          return { ok: false, error: 'Current password is incorrect.' };
        }
        if (newPassword.length < 6) {
          setLoading(false);
          return { ok: false, error: 'New password must be at least 6 characters.' };
        }
        password = newPassword;
      }

      const updated = { ...current, ...account, name, email, password };
      if (updated.studentId) updated.studentId = updated.studentId.trim();
      users[idx] = updated;
      saveUsers(users);

      if (current.role === 'supervisor' && supervisorProfile) {
        const profiles = getSupervisorProfiles();
        profiles[current.supervisorId] = {
          ...(profiles[current.supervisorId] || {}),
          ...supervisorProfile,
          name,
          email
        };
        saveSupervisorProfiles(profiles);
      }

      setUser(sanitize(updated));
      setLoading(false);
      return { ok: true, user: sanitize(updated) };
    } catch (err) {
      setLoading(false);
      return { ok: false, error: err.message || 'Profile update failed' };
    }
  };

  const logout = () => {
    setAuthToken(null);
    clearSession();
    setUser(null);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        loading,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
