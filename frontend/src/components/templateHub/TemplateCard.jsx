import React from 'react';
import { Lock, ExternalLink, Download, Bookmark } from 'lucide-react';
import { TEMPLATE_ICONS, TEMPLATE_THEMES } from '../../utils/icons';
import '../../styles/templateHub/TemplateCard.css';

export default function TemplateCard({ template, onDownload, onOverleaf, isLoggedIn, isSaved, onToggleSave }) {
  const IconComponent = TEMPLATE_ICONS[template.iconName] || TEMPLATE_ICONS.FileText;
  const theme = TEMPLATE_THEMES[template.theme] || TEMPLATE_THEMES.blue;

  return (
    <div className="template-card">
      
      <div className="template-card-top">
        <div className={`template-icon-wrapper ${theme.iconBg}`}>
          <IconComponent className={`w-5 h-5 ${theme.iconColor}`} />
        </div>
        <div className="flex items-center gap-2">
          <span className="template-format-badge">{template.formatBadge}</span>
          {isLoggedIn && typeof onToggleSave === 'function' && (
            <button
              type="button"
              className={`bookmark-toggle-btn ${isSaved ? 'active' : ''}`}
              onClick={onToggleSave}
              aria-label={isSaved ? 'Remove from saved' : 'Save template'}
              title={isSaved ? 'Remove from saved' : 'Save template'}
            >
              <Bookmark className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      <div className="template-content-area">
        <h3 className="template-title">{template.title}</h3>
        <p className="template-description">{template.description}</p>
      </div>

      <div className="template-meta-row">
        <span className="meta-size">{template.fileSize}</span>
        <span className="meta-date">{template.updatedDate}</span>
      </div>

      <div className="template-action-buttons">
        <button
          type="button"
          className="template-download-btn"
          onClick={onDownload}
        >
          {isLoggedIn ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          <span>Download File</span>
        </button>

        {template.hasOverleafLink && (
          <button
            type="button"
            className="template-overleaf-btn"
            onClick={onOverleaf}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in Overleaf</span>
          </button>
        )}
      </div>

    </div>
  );
}