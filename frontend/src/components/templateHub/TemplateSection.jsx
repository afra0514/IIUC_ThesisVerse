import React from 'react';
import { Lock } from 'lucide-react';
import TemplateCard from './TemplateCard';
import { useContent } from '../../context/ContentContext';
import '../../styles/templateHub/TemplateSection.css';

export default function TemplateSection({ onOpenAuthModal, isLoggedIn, savedKeys = [], onToggleSave }) {
  const { templates } = useContent();

  const handleDownload = (item) => {
    if (!isLoggedIn) {
      onOpenAuthModal();
    } else if (/^https?:\/\//i.test(item.downloadUrl || '')) {
      window.open(item.downloadUrl, '_blank', 'noopener,noreferrer');
    } else {
      const link = document.createElement('a');
      link.href = item.downloadUrl;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOverleaf = (url) => {
    if (!isLoggedIn) {
      onOpenAuthModal();
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="template-section" id="templates">
      <div className="template-container">
          <div className="template-header-wrapper">
          <div>
            <span className="template-feature-tag">FEATURE 04</span>
            <h2 className="template-main-title">Download Templates Hub</h2>
            <p className="template-subtitle">
              Department-approved formats so you can focus on research, not margins and font sizes.
            </p>
          </div>

          {!isLoggedIn && (
            <div className="preview-lock-badge">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Preview Only - Login to Access</span>
            </div>
          )}
        </div>

        <div className="template-grid">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onDownload={() => handleDownload(template)}
              onOverleaf={() => handleOverleaf(template.overleafUrl)}
              isLoggedIn={isLoggedIn}
              isSaved={savedKeys.includes(`tpl-${template.id}`)}
              onToggleSave={() =>
                onToggleSave && onToggleSave({
                  key: `tpl-${template.id}`,
                  kind: 'template',
                  title: template.title,
                  subtitle: template.formatBadge
                })
              }
            />
          ))}
        </div>

      </div>
    </section>
  );
}