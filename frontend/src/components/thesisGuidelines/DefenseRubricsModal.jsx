import React from 'react';
import { X, CheckCircle } from 'lucide-react';
import '../../styles/thesisGuidelines/DefenseRubricsModal.css';

export default function DefenseRubricsModal({ onClose, title, subtitle, stages: customStages }) {
  const defaultStages = [
    {
      title: 'Proposal Defense (30% Weight)',
      points: [
        'Problem definition clarity & motivation',
        'Literature review depth (last 3-5 years)',
        'Proposed methodology feasibility',
        'Slide presentation & initial timeline'
      ]
    },
    {
      title: 'Pre-Defense (20% Weight)',
      points: [
        'Implementation progress (at least 60-70%)',
        'Preliminary results & validation',
        'Draft report structure review',
        'Handling supervisor feedback'
      ]
    },
    {
      title: 'Final Defense (50% Weight)',
      points: [
        'Final thesis report formatting & plagiarism score',
        'Performance comparison with benchmark models',
        'Q&A defense before the examination board',
        'Publication acceptance (IEEE/Scopus/Conference)'
      ]
    }
  ];

  const stages = customStages || defaultStages;

  return (
    <div className="rubrics-modal-backdrop">
      <div className="rubrics-modal-box">
        
        <div className="rubrics-modal-header">
          <div>
            <h3 className="rubrics-modal-title">{title || 'IIUC 3-Stage Defense Rubrics'}</h3>
            <p className="rubrics-modal-subtitle">{subtitle || 'Official evaluation criteria for CSE & EEE departments'}</p>
          </div>
          <button type="button" className="rubrics-modal-close" onClick={onClose}>
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="rubrics-modal-body">
          {stages.length === 0 && (
            <p className="text-sm text-slate-500">No detailed guidelines have been added yet.</p>
          )}
          {stages.map((stage, idx) => (
            <div key={idx} className="rubric-stage-card">
              <h4 className="rubric-stage-title">{stage.title}</h4>
              <ul className="rubric-stage-list">
                {stage.points.map((point, pIdx) => (
                  <li key={pIdx} className="rubric-stage-item">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}