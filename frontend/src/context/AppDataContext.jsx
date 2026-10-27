import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { supervisorsData } from '../data/supervisorsData';
import { useAuth } from './AuthContext';
import api from '../services/api';
import {
  DB_EVENT,
  getUsers,
  getRequests,
  saveRequests,
  getNotifications,
  saveNotifications,
  getSupervisorProfiles,
  saveSupervisorProfiles,
  makeId
} from '../services/mockDb';

const AppDataContext = createContext(null);

export const MAX_GROUP_MEMBERS = 3;

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [version, setVersion] = useState(0);
  const [remoteSupervisors, setRemoteSupervisors] = useState(null);

  // Sync data from backend MongoDB Atlas
  const refreshBackendData = useCallback(async () => {
    try {
      const supRes = await api.getSupervisors();
      if (supRes.ok && Array.isArray(supRes.supervisors)) {
        setRemoteSupervisors(supRes.supervisors);
        // Also update local profile cache
        const pMap = { ...getSupervisorProfiles() };
        supRes.supervisors.forEach((s) => {
          pMap[s.id] = { ...pMap[s.id], ...s };
        });
        saveSupervisorProfiles(pMap);
      }

      if (user) {
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
      console.warn('[AppData] Error refreshing from MongoDB Atlas:', err.message);
    }
  }, [user]);

  useEffect(() => {
    refreshBackendData();
  }, [refreshBackendData]);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener('storage', bump);
    window.addEventListener(DB_EVENT, bump);
    return () => {
      window.removeEventListener('storage', bump);
      window.removeEventListener(DB_EVENT, bump);
    };
  }, []);

  const snapshot = useMemo(
    () => ({
      requests: getRequests(),
      notifications: getNotifications(),
      profiles: getSupervisorProfiles(),
      users: getUsers()
    }),
    [version]
  );

  const supervisors = useMemo(() => {
    if (remoteSupervisors && remoteSupervisors.length > 0) {
      return remoteSupervisors;
    }

    const { requests, profiles, users } = snapshot;
    const claimed = new Set(
      users.filter((u) => u.role === 'supervisor').map((u) => String(u.supervisorId))
    );
    const base = supervisorsData.map((s) => ({ ...s, ...(profiles[s.id] || {}), id: s.id }));
    const custom = Object.values(profiles).filter((p) => p.custom);

    return [...base, ...custom].map((s) => {
      const acceptedCount = requests.filter(
        (r) => r.status === 'accepted' && String(r.supervisorId) === String(s.id)
      ).length;
      const openSlots = Number(s.openSlots) || 0;
      return {
        ...s,
        tags: Array.isArray(s.tags) ? s.tags : [],
        hasAccount: claimed.has(String(s.id)),
        acceptedCount,
        openSlotsLeft: Math.max(0, openSlots - acceptedCount)
      };
    });
  }, [remoteSupervisors, snapshot]);

  const myRequests = useMemo(() => {
    if (!user || user.role !== 'student') return [];
    const userId = user.id || user.customId;
    return snapshot.requests
      .filter((r) => r.studentUserId === userId || (user._id && r.studentUserId === user._id.toString()))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [snapshot, user]);

  const incomingRequests = useMemo(() => {
    if (!user || user.role !== 'supervisor') return [];
    return snapshot.requests
      .filter((r) => String(r.supervisorId) === String(user.supervisorId))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [snapshot, user]);

  const recipientKey = user
    ? user.role === 'supervisor'
      ? `s:${user.supervisorId}`
      : `u:${user.id || user.customId}`
    : null;

  const notifications = useMemo(() => {
    if (!recipientKey) return [];
    return snapshot.notifications
      .filter((n) => n.recipient === recipientKey)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [snapshot, recipientKey]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const pushNotification = (recipient, data) => {
    const item = {
      id: makeId('ntf'),
      recipient,
      read: false,
      createdAt: Date.now(),
      ...data
    };
    saveNotifications([item, ...getNotifications()]);
  };

  const markNotificationRead = async (id) => {
    saveNotifications(getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n)));
    await api.markNotificationRead(id);
  };

  const markAllNotificationsRead = async () => {
    if (!recipientKey) return;
    saveNotifications(
      getNotifications().map((n) => (n.recipient === recipientKey ? { ...n, read: true } : n))
    );
    await api.markAllNotificationsRead();
  };

  const sendRequest = async ({ supervisorId, student, topic, description, members, message }) => {
    if (!user || user.role !== 'student') {
      return { ok: false, error: 'Only students can send supervision requests.' };
    }
    const sup = supervisors.find((s) => String(s.id) === String(supervisorId));
    if (!sup) return { ok: false, error: 'Supervisor not found.' };

    const cleanTopic = (topic || '').trim();
    if (!cleanTopic) return { ok: false, error: 'Thesis topic is required.' };

    const payload = {
      supervisorId: sup.id,
      student,
      topic: cleanTopic,
      description,
      members,
      message
    };

    // 1. Send to backend MongoDB Atlas API
    const res = await api.createRequest(payload);
    if (res.ok && res.request) {
      saveRequests([res.request, ...getRequests()]);
      refreshBackendData();
      return { ok: true, request: res.request };
    }

    if (res.error && res.status !== 500) {
      return { ok: false, error: res.error };
    }

    // 2. Local fallback if offline
    const all = getRequests();
    const existing = all.find(
      (r) =>
        r.studentUserId === user.id &&
        String(r.supervisorId) === String(sup.id) &&
        (r.status === 'pending' || r.status === 'accepted')
    );
    if (existing) {
      return {
        ok: false,
        error:
          existing.status === 'pending'
            ? 'You already have a pending request with this supervisor.'
            : 'This supervisor has already accepted your request.'
      };
    }
    if (sup.openSlotsLeft <= 0) {
      return { ok: false, error: 'This supervisor has no open supervision slots left.' };
    }

    const localRequest = {
      id: makeId('req'),
      studentUserId: user.id,
      supervisorId: sup.id,
      status: 'pending',
      createdAt: Date.now(),
      respondedAt: null,
      responseNote: '',
      student,
      topic: cleanTopic,
      description,
      members,
      message
    };
    saveRequests([localRequest, ...all]);

    pushNotification(`s:${sup.id}`, {
      type: 'request_received',
      title: 'New supervision request',
      message: `${student.name} (${student.studentId}) sent a request for “${cleanTopic}”.`,
      requestId: localRequest.id
    });

    return { ok: true, request: localRequest };
  };

  const respondToRequest = async (requestId, status, note = '') => {
    if (!user || user.role !== 'supervisor') {
      return { ok: false, error: 'Only supervisors can respond to requests.' };
    }
    if (status !== 'accepted' && status !== 'rejected') {
      return { ok: false, error: 'Invalid status.' };
    }

    // 1. Respond via backend MongoDB Atlas API
    const res = await api.respondToRequest(requestId, { status, note });
    if (res.ok) {
      const all = getRequests();
      saveRequests(
        all.map((r) =>
          r.id === requestId
            ? { ...r, status, responseNote: note.trim(), respondedAt: Date.now() }
            : r
        )
      );
      refreshBackendData();
      return { ok: true };
    }

    if (res.error && res.status !== 500) {
      return { ok: false, error: res.error };
    }

    // 2. Local fallback
    const all = getRequests();
    const req = all.find((r) => r.id === requestId);
    if (!req) return { ok: false, error: 'Request not found.' };

    const cleanNote = note.trim();
    saveRequests(
      all.map((r) =>
        r.id === requestId
          ? { ...r, status, responseNote: cleanNote, respondedAt: Date.now() }
          : r
      )
    );

    const supName = user.name;
    pushNotification(`u:${req.studentUserId}`, {
      type: status === 'accepted' ? 'request_accepted' : 'request_rejected',
      title: status === 'accepted' ? 'Request accepted' : 'Request rejected',
      message:
        status === 'accepted'
          ? `${supName} accepted your supervision request for “${req.topic}”.`
          : `${supName} rejected your supervision request for “${req.topic}”.${
              cleanNote ? ` Reason: ${cleanNote}` : ''
            }`,
      requestId: requestId
    });

    return { ok: true };
  };

  return (
    <AppDataContext.Provider
      value={{
        supervisors,
        myRequests,
        incomingRequests,
        notifications,
        unreadCount,
        sendRequest,
        respondToRequest,
        markNotificationRead,
        markAllNotificationsRead,
        refreshBackendData
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
