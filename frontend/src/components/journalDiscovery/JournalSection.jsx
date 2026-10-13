import React from 'react';
import { Lock } from 'lucide-react';
import JournalCard from './JournalCard';
import { useContent } from '../../context/ContentContext';
import PredatoryJournalTips from './PredatoryJournalTips';
import '../../styles/journalDiscovery/JournalSection.css';

export default function JournalSection({ onOpenAuthModal, isLoggedIn, savedKeys = [], onToggleSave, searchKeyword = '' }) {
  const { journals } = useContent();

  const handleCardClick = (journal) => {
    if (!isLoggedIn) {
      onOpenAuthModal();
    } else {
      const keyword = (searchKeyword || '').trim();
      const url = keyword && (journal.searchUrl || '').endsWith('=')
        ? journal.searchUrl + encodeURIComponent(keyword)
        : journal.searchUrl;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="journal-section" id="journals">
      <div className="journal-container">
        
        <div className="journal-header-wrapper">
          <div>
            <span className="journal-feature-tag">FEATURE 03</span>
            <h2 className="journal-main-title">Journals &amp; Paper Discovery</h2>
            <p className="journal-subtitle">
              Jump straight into the indexing portals reviewers trust. Your hero search keyword is passed to each portal.
            </p>
          </div>

          {!isLoggedIn && (
            <div className="preview-lock-badge">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Preview Only - Login to Access</span>
            </div>
          )}
        </div>

        <div className="journal-grid">
          {journals.map((journal) => (
            <JournalCard
              key={journal.id}
              journal={journal}
              onClick={() => handleCardClick(journal)}
              isLoggedIn={isLoggedIn}
              isSaved={savedKeys.includes(`jr-${journal.id}`)}
              onToggleSave={() =>
                onToggleSave && onToggleSave({
                  key: `jr-${journal.id}`,
                  kind: 'journal',
                  title: journal.name,
                  subtitle: journal.tierBadge
                })
              }
            />
          ))}
        </div>

        <PredatoryJournalTips />

      </div>
    </section>
  );
}