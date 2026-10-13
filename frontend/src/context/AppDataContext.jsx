import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supervisorsData } from '../data/supervisorsData';
import { useAuth } from './AuthContext';
import {
  DB_EVENT,
  getUsers,
  getRequests,
  saveRequests,
  getNotifications,
  saveNotifications,
  getSupervisorProfiles,
  makeId
} from '../services/mockDb';

const AppDataContext = createContext(null);

export const MAX_GROUP_MEMBERS = 3; 

export function AppDataProvider({ children }) {
  const { user } = useAuth();
  const [version, setVersion] = useState(0);

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
  }, [snapshot]);

  const myRequests = useMemo(() => {
    if (!user || user.role !== 'student') return [];
    return snapshot.requests
      .filter((r) => r.studentUserId === user.id)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [snapshot, user]);

  const incomingRequests = useMemo(() => {
    if (!user || user.role !== 'supervisor') return [];
    return snapshot.requests
      .filter((r) => String(r.supervisorId) === String(user.supervisorId))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [snapshot, user]);

  const recipientKey = user
    ? user.role === 'supervisor'
      ? `s:${user.supervisorId}`
      : `u:${user.id}`
    : null;

  const notifications = useMemo(() => {
    if (!recipientKey) return [];
    return snapshot.notifications
      .filter((n) => n.recipient === recipientKey)
      .sort((a, b) => b.createdAt - a.createdAt);
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

  const markNotificationRead = (id) => {
    saveNotifications(getNotifications().map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    if (!recipientKey) return;
    saveNotifications(
      getNotifications().map((n) => (n.recipient === recipientKey ? { ...n, read: true } : n))
    );
  };

  const sendRequest = ({ supervisorId, student, topic, description, members, message }) => {
    if (!user || user.role !== 'student') {
      return { ok: false, error: 'Only students can send supervision requests.' };
    }
    const sup = supervisors.find((s) => String(s.id) === String(supervisorId));
    if (!sup) return { ok: false, error: 'Supervisor not found.' };

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

    const request = {
      id: makeId('req'),
      studentUserId: user.id,
      supervisorId: sup.id,
      status: 'pending',
      createdAt: Date.now(),
      respondedAt: null,
      responseNote: '',
      student,
      topic,
      description,
      members,
      message
    };
    saveRequests([request, ...all]);

    pushNotification(`s:${sup.id}`, {
      type: 'request_received',
      title: 'New supervision request',
      message: `${student.name} (${student.studentId}) sent a request for “${topic}”.`,
      requestId: request.id
    });

    return { ok: true, request };
  };

  const respondToRequest = (requestId, status, note = '') => {
    if (!user || user.role !== 'supervisor') {
      return { ok: false, error: 'Only supervisors can respond to requests.' };
    }
    if (status !== 'accepted' && status !== 'rejected') {
      return { ok: false, error: 'Invalid status.' };
    }

    const all = getRequests();
    const req = all.find((r) => r.id === requestId);
    if (!req) return { ok: false, error: 'Request not found.' };
    if (String(req.supervisorId) !== String(user.supervisorId)) {
      return { ok: false, error: 'This request was not sent to you.' };
    }
    if (req.status !== 'pending') {
      return { ok: false, error: 'This request has already been answered.' };
    }

    if (status === 'accepted') {
      const me = supervisors.find((s) => String(s.id) === String(user.supervisorId));
      if (me && me.openSlotsLeft <= 0) {
        return {
          ok: false,
          error: 'You have no open slots left. Increase your open slots in Profile Settings first.'
        };
      }
    }

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
        markAllNotificationsRead
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
