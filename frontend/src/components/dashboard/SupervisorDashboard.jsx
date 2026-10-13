import React, { useState } from 'react';
import { Check, X, ChevronDown, Mail, Phone, Inbox, Clock, CheckCircle2, XCircle, Users } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { getFirstName, timeAgo, formatDateTime, deptLabel } from '../../utils/format';
import '../../styles/dashboard/StudentDashboard.css';
import '../../styles/dashboard/SupervisorDashboard.css';

const TABS = [
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'all', label: 'All' }
];

const STATUS_LABEL = { pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected' };

export default function SupervisorDashboard({ user }) {
  const { supervisors, incomingRequests, respondToRequest } = useAppData();
  const profile = supervisors.find((s) => String(s.id) === String(user.supervisorId));

  const [tab, setTab] = useState('pending');
  const [expandedId, setExpandedId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [actionError, setActionError] = useState({ id: null, message: '' });

  const counts = {
    pending: incomingRequests.filter((r) => r.status === 'pending').length,
    accepted: incomingRequests.filter((r) => r.status === 'accepted').length,
    rejected: incomingRequests.filter((r) => r.status === 'rejected').length
  };

  const visible = incomingRequests.filter((r) => tab === 'all' || r.status === tab);

  const handleAccept = (id) => {
    const result = respondToRequest(id, 'accepted');
    setActionError(result.ok ? { id: null, message: '' } : { id, message: result.error });
  };

  const handleConfirmReject = (id) => {
    const result = respondToRequest(id, 'rejected', rejectNote);
    if (result.ok) {
      setRejectingId(null);
      setRejectNote('');
      setActionError({ id: null, message: '' });
    } else {
      setActionError({ id, message: result.error });
    }
  };

  return (
    <section className="student-dashboard-section" id="dashboard">
      <div className="dashboard-container">
        <span className="dashboard-tag">SUPERVISOR DASHBOARD</span>
        <h2 className="dashboard-title">Welcome, {getFirstName(user.name)}</h2>

         <div className="sd-stats-grid">
          <div className="sd-stat-card">
            <Clock className="w-4 h-4 text-amber-600" />
            <span className="sd-stat-value">{counts.pending}</span>
            <span className="sd-stat-label">Pending requests</span>
          </div>
          <div className="sd-stat-card">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="sd-stat-value">{counts.accepted}</span>
            <span className="sd-stat-label">Accepted groups</span>
          </div>
          <div className="sd-stat-card">
            <XCircle className="w-4 h-4 text-red-500" />
            <span className="sd-stat-value">{counts.rejected}</span>
            <span className="sd-stat-label">Rejected</span>
          </div>
          <div className="sd-stat-card">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="sd-stat-value">
              {profile ? `${profile.openSlotsLeft} / ${profile.openSlots}` : '–'}
            </span>
            <span className="sd-stat-label">Open slots left</span>
          </div>
        </div>

         <div className="sd-requests-card">
          <div className="sd-requests-header">
            <h3 className="milestone-title">Supervision Requests</h3>
            <div className="sd-tabs">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`sd-tab-btn ${tab === t.key ? 'active' : ''}`}
                  onClick={() => setTab(t.key)}
                >
                  {t.label}
                  {t.key !== 'all' && <span className="sd-tab-count">{counts[t.key]}</span>}
                </button>
              ))}
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="sd-empty">
              <Inbox className="w-7 h-7 text-slate-300" />
              <p>
                {incomingRequests.length === 0
                  ? 'No requests yet. When a student sends you a supervision request it will appear here.'
                  : `No ${tab} requests.`}
              </p>
            </div>
          ) : (
            <div className="sd-request-list">
              {visible.map((r) => {
                const isOpen = expandedId === r.id;
                return (
                  <div key={r.id} className="sd-request-item">
                    <div className="sd-request-top">
                      <div className="min-w-0">
                        <p className="sd-request-topic">{r.topic}</p>
                        <p className="sd-request-student">
                          {r.student.name} · {r.student.studentId} · {deptLabel(r.student.department)}
                          {r.members.length > 0 && ` · Group of ${r.members.length + 1}`}
                        </p>
                        <p className="sd-request-time">Sent {timeAgo(r.createdAt)}</p>
                      </div>
                      <span className={`request-status-chip ${r.status}`}>{STATUS_LABEL[r.status]}</span>
                    </div>

                    <button
                      type="button"
                      className="sd-details-toggle"
                      onClick={() => setExpandedId(isOpen ? null : r.id)}
                    >
                      <span>{isOpen ? 'Hide details' : 'View details'}</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isOpen && (
                      <div className="sd-details">
                        <div className="sd-detail-block">
                          <h4 className="sd-detail-title">Topic description</h4>
                          <p className="sd-detail-text">{r.description}</p>
                        </div>

                        <div className="sd-detail-block">
                          <h4 className="sd-detail-title">Group leader</h4>
                          <p className="sd-detail-text">
                            {r.student.name} ({r.student.studentId})
                            {r.student.batch && ` · ${r.student.batch}`}
                          </p>
                          <div className="sd-contact-row">
                            {r.student.email && (
                              <a href={`mailto:${r.student.email}`} className="sd-contact-link">
                                <Mail className="w-3.5 h-3.5" />
                                <span>{r.student.email}</span>
                              </a>
                            )}
                            {r.student.phone && (
                              <a href={`tel:${r.student.phone}`} className="sd-contact-link">
                                <Phone className="w-3.5 h-3.5" />
                                <span>{r.student.phone}</span>
                              </a>
                            )}
                          </div>
                        </div>

                        <div className="sd-detail-block">
                          <h4 className="sd-detail-title">Group members</h4>
                          {r.members.length === 0 ? (
                            <p className="sd-detail-text">Individual thesis (no other members).</p>
                          ) : (
                            <ul className="sd-member-list">
                              {r.members.map((m, i) => (
                                <li key={i} className="sd-member-item">
                                  <span className="font-semibold text-slate-800">{m.name}</span>
                                  <span>{m.studentId}</span>
                                  {m.email && <span>{m.email}</span>}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {r.message && (
                          <div className="sd-detail-block">
                            <h4 className="sd-detail-title">Message from student</h4>
                            <p className="sd-detail-text">{r.message}</p>
                          </div>
                        )}

                        {r.status !== 'pending' && (
                          <div className="sd-detail-block">
                            <h4 className="sd-detail-title">Your response</h4>
                            <p className="sd-detail-text">
                              {STATUS_LABEL[r.status]} on {formatDateTime(r.respondedAt)}
                              {r.responseNote && ` — ${r.responseNote}`}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {r.status === 'pending' && (
                      <div className="sd-actions">
                        {rejectingId === r.id ? (
                          <div className="sd-reject-box">
                            <textarea
                              className="form-textarea-field"
                              rows={2}
                              placeholder="Reason for rejecting (optional) — the student will see this"
                              value={rejectNote}
                              onChange={(e) => setRejectNote(e.target.value)}
                            />
                            <div className="sd-reject-actions">
                              <button
                                type="button"
                                className="sd-cancel-btn"
                                onClick={() => {
                                  setRejectingId(null);
                                  setRejectNote('');
                                }}
                              >
                                Cancel
                              </button>
                              <button type="button" className="sd-reject-btn" onClick={() => handleConfirmReject(r.id)}>
                                <X className="w-3.5 h-3.5" />
                                <span>Confirm reject</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <button type="button" className="sd-accept-btn" onClick={() => handleAccept(r.id)}>
                              <Check className="w-3.5 h-3.5" />
                              <span>Accept</span>
                            </button>
                            <button
                              type="button"
                              className="sd-reject-outline-btn"
                              onClick={() => {
                                setRejectingId(r.id);
                                setRejectNote('');
                                setActionError({ id: null, message: '' });
                              }}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {actionError.id === r.id && actionError.message && (
                      <p className="form-error-text">{actionError.message}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
