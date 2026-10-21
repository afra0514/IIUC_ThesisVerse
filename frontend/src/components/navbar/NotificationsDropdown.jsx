
import React from 'react';
import { CheckCircle2, XCircle, Inbox, BellOff } from 'lucide-react';
import { timeAgo } from '../../utils/format';
import '../../styles/navbar/NotificationsDropdown.css';

const ICONS = {
  request_accepted: { Icon: CheckCircle2, className: 'accepted' },
  request_rejected: { Icon: XCircle, className: 'rejected' },
  request_received: { Icon: Inbox, className: 'received' }
};

export default function NotificationsDropdown({ notifications, unreadCount, onRead, onMarkAllRead, onClose }) {
  return (
    <div className="notif-dropdown">
      <div className="notif-header">
        <span className="notif-title">Notifications</span>
        {unreadCount > 0 && (
          <button type="button" className="notif-mark-all" onClick={onMarkAllRead}>
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="notif-empty">
          <BellOff className="w-6 h-6 text-slate-300" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => {
            const { Icon, className } = ICONS[n.type] || ICONS.request_received;
            return (
              <a
                key={n.id}
                href="#dashboard"
                className={`notif-item ${n.read ? '' : 'unread'}`}
                onClick={() => {
                  onRead(n.id);
                  onClose();
                }}
              >
                <span className={`notif-icon ${className}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className="notif-content">
                  <span className="notif-item-title">{n.title}</span>
                  <span className="notif-item-text">{n.message}</span>
                  <span className="notif-item-time">{timeAgo(n.createdAt)}</span>
                </span>
                {!n.read && <span className="notif-unread-dot"></span>}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
