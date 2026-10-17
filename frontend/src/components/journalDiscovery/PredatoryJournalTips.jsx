import React from 'react';
import { AlertTriangle } from 'lucide-react';
import '../../styles/journalDiscovery/PredatoryJournalTips.css';

export default function PredatoryJournalTips() {
  return (
    <div className="predatory-tips-banner">
      <div className="tips-icon-wrapper">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
      </div>

      <div className="tips-content-wrapper">
        <h4 className="tips-main-heading">
          How to find high-impact papers &amp; avoid predatory journals
        </h4>

        <div className="tips-two-columns">
          
          {/* Column 1 */}
          <div className="tips-column">
            <p className="tips-text">
              Verify the journal quartile on Scopus or SCImago before submitting.
            </p>
            <p className="tips-text">
              Check that the publisher is a COPE member and lists real editors.
            </p>
          </div>

          {/* Column 2 */}
          <div className="tips-column">
            <p className="tips-text">
              Beware of &apos;guaranteed acceptance&apos; or review times under 7 days.
            </p>
            <p className="tips-text">
              Sort by citations and filter to the last 3–5 years for recent work.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}