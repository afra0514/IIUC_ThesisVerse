import React, { useEffect, useRef } from 'react';
import { X, Presentation } from 'lucide-react';
import { presentationLimits, presentationRulesData } from '../../data/presentationRulesData';
import '../../styles/templateHub/PresentationRulesModal.css';

export default function PresentationRulesModal({ isOpen, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  let number = 0;

  return (
    <div className="rules-modal-backdrop" onClick={onClose}>
      <div
        className="rules-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rules-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rules-modal-header">
          <div className="rules-header-info">
            <div className="rules-header-icon">
              <Presentation className="w-5 h-5 text-[#EA580C]" />
            </div>
            <div>
              <h3 id="rules-modal-title" className="rules-modal-title">Presentation rules</h3>
              <p className="rules-modal-subtitle">For the proposal, pre-defense and final defense</p>
            </div>
          </div>
          <button ref={closeRef} type="button" className="rules-close-btn" onClick={onClose} aria-label="Close presentation rules">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="rules-modal-body">
          <div className="rules-limits-grid">
            {presentationLimits.map((limit) => (
              <div key={limit.label} className="rules-limit-item">
                <span className="rules-limit-value">{limit.value}</span>
                <span className="rules-limit-label">{limit.label}</span>
              </div>
            ))}
          </div>
          {presentationRulesData.map((section) => (
            <div key={section.group} className="rules-group">
              <h4 className="rules-group-title">{section.group}</h4>
              <ol className="rules-list">
                {section.rules.map((rule) => {
                  number += 1;
                  return (
                    <li key={rule} className="rules-item">
                      <span className="rules-number">{number}</span>
                      <span>{rule}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
