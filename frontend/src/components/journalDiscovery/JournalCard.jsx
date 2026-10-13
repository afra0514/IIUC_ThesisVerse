import React from 'react';
import { Lock, ExternalLink, Bookmark } from 'lucide-react';
import '../../styles/journalDiscovery/JournalCard.css';

export default function JournalCard({ journal, onClick, isLoggedIn, isSaved, onToggleSave }) {
  const isSlateBadge = journal.tierColor === 'slate';

  return (
    <div className="journal-card" onClick={onClick}>
      <div className="journal-top-row">
        <div className={`journal-logo-box ${journal.bgColor}`}>
          <span className="journal-short-code">{journal.shortCode}</span>
        </div>
        <div className="journal-title-tier">
          <h3 className="journal-name">{journal.name}</h3>
          <span className={`journal-tier-badge ${isSlateBadge ? 'badge-slate' : 'badge-emerald'}`}>
            {journal.tierBadge}
          </span>
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
            aria-label={isSaved ? 'Remove from saved' : 'Save journal'}
            title={isSaved ? 'Remove from saved' : 'Save journal'}
          >
            <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
      <p className="journal-description">
        {journal.description}
      </p>
      <button type="button" className="open-search-btn">
        {isLoggedIn ? <ExternalLink className="w-3.5 h-3.5 text-slate-500" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
        <span>Open Journal Search</span>
      </button>
    </div>
  );
}