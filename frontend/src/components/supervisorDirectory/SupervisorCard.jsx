
import React from 'react';
import { Lock, FileText, ArrowRight, Bookmark, UserRound } from 'lucide-react';
import '../../styles/supervisorDirectory/SupervisorCard.css';

export default function SupervisorCard({ supervisor, onClick, isLoggedIn, isSaved, onToggleSave }) {
  const handleAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <div className="supervisor-card" onClick={handleAction}>
      
      <div className="card-top-row">
        <div className="avatar-wrapper">
          {supervisor.image ? (
            <img
              src={supervisor.image}
              alt={supervisor.name}
              className="faculty-avatar"
            />
          ) : (
            <div className="faculty-avatar faculty-avatar-placeholder">
              <UserRound className="w-7 h-7" />
            </div>
          )}
        </div>

        <div className="faculty-meta">
          <h3 className="faculty-name">{supervisor.name}</h3>
          <p className="faculty-designation">{supervisor.designation}</p>
          <p className="faculty-dept">{supervisor.department}</p>
        </div>

        {isLoggedIn && typeof onToggleSave === 'function' && (
          <button
            type="button"
            className={`bookmark-toggle-btn ${isSaved ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleSave();
            }}
            aria-label={isSaved ? 'Remove bookmark' : 'Bookmark supervisor'}
            title={isSaved ? 'Remove bookmark' : 'Bookmark supervisor'}
          >
            <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      <div className="papers-badge-wrapper">
        <span className="papers-count-badge">
          <FileText className="w-3.5 h-3.5" />
          <span>{supervisor.papers} Research Papers</span>
        </span>
      </div>

      <div className="faculty-tags-list">
        {supervisor.tags.map((tag, index) => (
          <span key={index} className="faculty-domain-pill">
            {tag}
          </span>
        ))}
      </div>

      <button
        type="button"
        className="view-contact-btn"
        onClick={handleAction}
      >
        {isLoggedIn ? <ArrowRight className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
        <span>View Profile &amp; Contact</span>
      </button>

    </div>
  );

}