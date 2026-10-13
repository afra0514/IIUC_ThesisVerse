import React from 'react';
import { GraduationCap } from 'lucide-react';
import '../../styles/footer/Footer.css';

export default function Footer({ onOpenAuthModal, isLoggedIn }) {
  const handleFeatureLink = (e) => {
    if (!isLoggedIn) {
      e.preventDefault();
      if (typeof onOpenAuthModal === 'function') onOpenAuthModal();
    }
  };

  return (
    <footer className="footer-root">
      <div className="footer-container">
        
        <div className="footer-main-grid">
          
          <div className="footer-brand-column">
            <a href="#home" className="footer-logo-link">
              <div className="footer-logo-circle">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="footer-brand-text">
                <span className="footer-brand-prefix">IIUC </span>
                <span className="footer-brand-suffix">ThesisVerse</span>
              </div>
            </a>
            
            <p className="footer-brand-desc">
              An intelligent thesis supervision &amp; academic resource universe for IIUCians.
            </p>
          </div>

          <div className="footer-links-column">
            <h4 className="footer-column-heading">Quick Resources</h4>
            
            <div className="footer-links-two-cols">
              
              <ul className="footer-links-list">
                <li>
                  <a href="#supervisors" className="footer-link-item" onClick={handleFeatureLink}>Supervisor Directory</a>
                </li>
                <li>
                  <a href="#journals" className="footer-link-item" onClick={handleFeatureLink}>Journal &amp; Paper Discovery</a>
                </li>
                <li>
                  <a href="#ai-assistant" className="footer-link-item" onClick={handleFeatureLink}>AI Research Assistant</a>
                </li>
              </ul>

              <ul className="footer-links-list">
                <li>
                  <a href="#guidelines" className="footer-link-item" onClick={handleFeatureLink}>Thesis &amp; Defense Guidelines</a>
                </li>
                <li>
                  <a href="#templates" className="footer-link-item" onClick={handleFeatureLink}>Download Templates Center</a>
                </li>
              </ul>

            </div>
          </div>

        </div>

        <div className="footer-bottom-bar">
          <p className="footer-copyright-text">
            &copy; 2026 IIUC ThesisVerse · International Islamic University Chittagong. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}