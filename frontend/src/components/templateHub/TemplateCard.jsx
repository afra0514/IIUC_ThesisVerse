import React from 'react';
import { Lock, ExternalLink, Download, Bookmark, ListChecks } from 'lucide-react';
import '../../styles/templateHub/TemplateCard.css';

export default function TemplateCard({ template, file, onDownload, onOverleaf, onShowRules, isLoggedIn, isSaved, onToggleSave }) {
  const IconComponent = template.icon;
  const missing = file && !file.ok;

  return (
    <div className="template-card">
      <div className="template-card-top">
        <div className={`template-icon-wrapper ${template.iconBg}`}>
          <IconComponent className={`w-5 h-5 ${template.iconColor}`} />
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
        {missing ? (
          <span className="meta-missing">Not uploaded yet</span>
        ) : (
          <>
            <span className="meta-size">{(file && file.size) || template.fileSize}</span>
            <span className="meta-date">{template.updatedDate}</span>
          </>
        )}
      </div>
      <div className="template-action-buttons">
        <button
          type="button"
          className="template-download-btn"
          onClick={onDownload}
        >
          {isLoggedIn ? <Download className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
          <span>{missing && isLoggedIn ? 'Coming soon' : 'Download File'}</span>
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

        {typeof onShowRules === 'function' && (
          <button
            type="button"
            className="template-overleaf-btn"
            onClick={onShowRules}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Presentation Rules</span>
          </button>
        )}
      </div>
    </div>
  );
}
