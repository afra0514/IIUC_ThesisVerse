import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import GuidelineCard from './GuidelineCard';
import DefenseRubricsModal from './DefenseRubricsModal';
import '../../styles/thesisGuidelines/GuidelinesSection.css';

export default function GuidelinesSection({ onOpenAuthModal, isLoggedIn }) {
  const [selectedGuideline, setSelectedGuideline] = useState(null);

  const { guidelines } = useContent();

  const handleCardClick = (item) => {
    if (!isLoggedIn) {
      onOpenAuthModal();
      return;
    }
    setSelectedGuideline(item);
  };

  return (
    <section className="guidelines-section" id="guidelines">
      <div className="guidelines-container">
        
        <div className="guidelines-header-wrapper">
          <div>
            <span className="guidelines-feature-tag">FEATURE 02</span>
            <h2 className="guidelines-main-title">Thesis &amp; Defense Guidelines</h2>
            <p className="guidelines-subtitle">
              Official, step-by-step guidance from topic selection to your final viva — aligned with IIUC CSE &amp; EEE evaluation rubrics.
            </p>
          </div>
          
          {!isLoggedIn && (
            <div className="preview-lock-badge">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Preview Only - Login to Access</span>
            </div>
          )}
        </div>

        <div className="guidelines-grid">
          {guidelines.map((item) => (
            <GuidelineCard
              key={item.id}
              item={item}
              onClick={() => handleCardClick(item)}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>

      </div>

      {selectedGuideline && isLoggedIn && (
        <DefenseRubricsModal
          title={selectedGuideline.title}
          subtitle={(selectedGuideline.details && selectedGuideline.details.subtitle) || selectedGuideline.description}
          stages={(selectedGuideline.details && selectedGuideline.details.stages) || []}
          onClose={() => setSelectedGuideline(null)}
        />
      )}
    </section>
  );
}