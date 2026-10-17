import React from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { GUIDELINE_ICONS } from '../../utils/icons';
import '../../styles/thesisGuidelines/GuidelineCard.css';

export default function GuidelineCard({ item, onClick, isLoggedIn }) {
  const IconComponent = GUIDELINE_ICONS[item.iconName] || GUIDELINE_ICONS.BookOpen;

  return (
    <div className="guideline-card" onClick={onClick}>
      <div className="guideline-card-header">
        <div className="guideline-icon-box">
          <IconComponent className="w-5 h-5 text-white" />
        </div>
        <div className="guideline-title-box">
          <h3 className="guideline-card-title">{item.title}</h3>
          <p className="guideline-card-description">{item.description}</p>
        </div>
      </div>

      <div className="guideline-tags-wrapper">
        {(item.tags || []).map((tag, index) => (
          <span key={index} className="guideline-tag-pill">
            {tag}
          </span>
        ))}
      </div>

      <button type="button" className="guideline-action-btn">
        {isLoggedIn ? <ArrowRight className="w-3.5 h-3.5 text-slate-500" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
        <span>Read Full Guidelines</span>
      </button>
    </div>
  );
}