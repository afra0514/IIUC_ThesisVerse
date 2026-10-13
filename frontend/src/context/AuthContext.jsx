import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const SESSION_KEY = 'iiuc_thesis_user';
const ACCOUNTS_KEY = 'iiuc_thesis_accounts';

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
  }
}

function buildUser(userData = {}) {
  const studentId = (userData.studentId || '').trim().toUpperCase();
  const accounts = readJson(ACCOUNTS_KEY, {});
  const saved = accounts[studentId] || {};

  const name = (userData.fullName || '').trim() || saved.fullName || studentId || 'Student';
  return {
    name,
    studentId,
    email: (userData.email || '').trim() || saved.email || '',
    department: userData.department || saved.department || 'CSE',
    role: 'student'
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJson(SESSION_KEY, null));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const isLoggedIn = Boolean(user);

  const login = (userData) => {
    const studentUser = buildUser(userData);

    if (userData && userData.fullName && studentUser.studentId) {
      const accounts = readJson(ACCOUNTS_KEY, {});
      accounts[studentUser.studentId] = {
        fullName: studentUser.name,
        email: studentUser.email,
        department: studentUser.department
      };
      writeJson(ACCOUNTS_KEY, accounts);
    }

    setUser(studentUser);
    writeJson(SESSION_KEY, studentUser);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    writeJson(SESSION_KEY, null);
  };

  const togglePreviewMode = () => {
    if (isLoggedIn) logout();
    else login({ fullName: 'Demo Student', studentId: 'C000000', department: 'CSE' });
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        login,
        logout,
        togglePreviewMode
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
