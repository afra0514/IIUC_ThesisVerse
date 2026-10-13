import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { predatoryJournalTipsData } from '../../data/journalsData';
import '../../styles/journalDiscovery/PredatoryJournalTips.css';

export default function PredatoryJournalTips() {
  const { title, columnOne, columnTwo } = predatoryJournalTipsData;

  return (
    <div className="predatory-tips-banner">
      <div className="tips-icon-wrapper">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
      </div>
      <div className="tips-content-wrapper">
        <h4 className="tips-main-heading">{title}</h4>
        <div className="tips-two-columns">
          {[columnOne, columnTwo].map((column, index) => (
            <div key={index} className="tips-column">
              {column.map((tip) => (
                <p key={tip} className="tips-text">{tip}</p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
