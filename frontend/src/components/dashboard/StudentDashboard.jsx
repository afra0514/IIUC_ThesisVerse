import React, { useState, useEffect } from 'react';
import { Bookmark, FolderOpen, Check, X, Send } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { getFirstName, timeAgo, formatDateTime } from '../../utils/format';
import '../../styles/dashboard/StudentDashboard.css';

const MILESTONES = [
  'Research Topic Selected',
  'Supervisor Finalized',
  'Proposal Defense Completed',
  'Pre-Defense & Paper Draft Ready',
  'Final Defense & Report Submitted'
];

const MILESTONE_KEY = 'iiuc_thesis_milestones';

export default function StudentDashboard({ user, savedItems = [], onToggleSave }) {
  const firstName = getFirstName(user?.name || 'Student');
  const { myRequests, supervisors } = useAppData();
  const milestoneKey = `${MILESTONE_KEY}_${user?.id || 'guest'}`;

  const [done, setDone] = useState(() => {
    try {
      const raw = localStorage.getItem(milestoneKey);
      const parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.length === MILESTONES.length) return parsed;
    } catch (err) {
    }
    return [true, false, false, false, false];
  });

  useEffect(() => {
    try {
      localStorage.setItem(milestoneKey, JSON.stringify(done));
    } catch (err) {
    }
  }, [done, milestoneKey]);

  const toggleStep = (index) => {
    setDone((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const percent = Math.round((done.filter(Boolean).length / MILESTONES.length) * 100);

  const bookmarkedSupervisors = savedItems.filter((i) => i.kind === 'supervisor');
  const savedResources = savedItems.filter((i) => i.kind !== 'supervisor');

  const renderSavedList = (items) => (
    <div className="saved-list">
      {items.map((item) => (
        <div key={item.key} className="saved-item">
          <div className="min-w-0">
            <p className="saved-item-title">{item.title}</p>
            {item.subtitle && <p className="saved-item-sub">{item.subtitle}</p>}
          </div>
          <button
            type="button"
            className="saved-remove-btn"
            onClick={() => onToggleSave && onToggleSave(item)}
            aria-label="Remove"
            title="Remove"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <section className="student-dashboard-section" id="dashboard">
      <div className="dashboard-container">
        <span className="dashboard-tag">STUDENT DASHBOARD</span>
        <h2 className="dashboard-title">Welcome back, {firstName}</h2>

        <div className="dashboard-grid">

          <div className="milestone-card">
            <div className="milestone-header">
              <h3 className="milestone-title">Thesis Milestone Progress</h3>
              <span className="milestone-percent">{percent}%</span>
            </div>

            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${percent}%` }}></div>
            </div>

            <div className="milestone-list">
              {MILESTONES.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={`milestone-step ${done[index] ? 'done' : ''}`}
                  onClick={() => toggleStep(index)}
                >
                  <span className="step-circle">
                    {done[index] && <Check className="w-3 h-3 text-white" />}
                  </span>
                  <span className="step-label">Step {index + 1}</span>
                  <span className="step-text">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="dashboard-side">
            <div className="dashboard-side-card">
              <h3 className="side-card-title">
                <Bookmark className="w-4 h-4 text-emerald-600" />
                <span>Bookmarked Supervisors</span>
              </h3>
              {bookmarkedSupervisors.length === 0 ? (
                <p className="side-card-hint">
                  Use the bookmark icon on a supervisor card to save them here.
                </p>
              ) : (
                renderSavedList(bookmarkedSupervisors)
              )}
            </div>

            <div className="dashboard-side-card">
              <h3 className="side-card-title">
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <span>Saved Templates &amp; Journals</span>
              </h3>
              {savedResources.length === 0 ? (
                <p className="side-card-hint">
                  Save templates and journal portals to build your research toolkit.
                </p>
              ) : (
                renderSavedList(savedResources)
              )}
            </div>
          </div>

        </div>

        <div className="my-requests-card">
          <h3 className="side-card-title">
            <Send className="w-4 h-4 text-emerald-600" />
            <span>My Supervision Requests</span>
          </h3>

          {myRequests.length === 0 ? (
            <p className="side-card-hint">
              You haven&apos;t sent any request yet. Open a supervisor profile in the directory below and
              use &quot;Send Supervision Request&quot;.
            </p>
          ) : (
            <div className="my-request-list">
              {myRequests.map((r) => {
                const sup = supervisors.find((s) => String(s.id) === String(r.supervisorId));
                return (
                  <div key={r.id} className="my-request-item">
                    <div className="min-w-0">
                      <p className="my-request-topic">{r.topic}</p>
                      <p className="my-request-meta">
                        To {sup ? sup.name : 'Supervisor'}
                        {r.members.length > 0 && ` · Group of ${r.members.length + 1}`}
                        {` · Sent ${timeAgo(r.createdAt)}`}
                      </p>
                      {r.status === 'rejected' && r.responseNote && (
                        <p className="my-request-note">Reason: {r.responseNote}</p>
                      )}
                      {r.status !== 'pending' && (
                        <p className="my-request-note">
                          {r.status === 'accepted' ? 'Accepted' : 'Rejected'} on {formatDateTime(r.respondedAt)}
                        </p>
                      )}
                    </div>
                    <span className={`request-status-chip ${r.status}`}>
                      {r.status === 'pending' ? 'Pending' : r.status === 'accepted' ? 'Accepted' : 'Rejected'}
                    </span>
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
