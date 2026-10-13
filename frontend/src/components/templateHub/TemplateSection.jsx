import React, { useCallback, useEffect, useState } from 'react';
import { Lock, FileText, FileCode, Presentation } from 'lucide-react';
import TemplateCard from './TemplateCard';
import PresentationRulesModal from './PresentationRulesModal';
import { templatesData } from '../../data/templatesData';
import '../../styles/templateHub/TemplateSection.css';

const ICONS = {
  'docx-report': FileText,
  'latex-package': FileCode,
  'pptx-slides': Presentation
};

const formatSize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

async function checkFile(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const type = response.headers.get('content-type') || '';
    if (!response.ok || type.includes('text/html')) return { ok: false };
    const length = Number(response.headers.get('content-length'));
    return { ok: true, size: length ? formatSize(length) : null };
  } catch (err) {
    return { ok: false };
  }
}

export default function TemplateSection({ onOpenAuthModal, isLoggedIn, savedKeys = [], onToggleSave }) {
  const [files, setFiles] = useState({});
  const [notice, setNotice] = useState('');
  const [rulesOpen, setRulesOpen] = useState(false);
  const closeRules = useCallback(() => setRulesOpen(false), []);

  useEffect(() => {
    let active = true;
    Promise.all(templatesData.map(async (t) => [t.id, await checkFile(t.downloadUrl)])).then((entries) => {
      if (active) setFiles(Object.fromEntries(entries));
    });
    return () => {
      active = false;
    };
  }, []);

  const handleDownload = (item) => {
    if (!isLoggedIn) {
      onOpenAuthModal();
      return;
    }
    if (files[item.id] && !files[item.id].ok) {
      setNotice(`"${item.title}" has not been uploaded yet. Ask your supervisor for the current version.`);
      return;
    }
    setNotice('');
    const link = document.createElement('a');
    link.href = item.downloadUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        {notice && (
          <p className="template-notice" role="status">
            {notice}
          </p>
        )}

        <div className="template-grid">
          {templatesData.map((template) => (
            <TemplateCard
              key={template.id}
              template={{ ...template, icon: ICONS[template.id] || FileText }}
              file={files[template.id]}
              onDownload={() => handleDownload(template)}
              onOverleaf={() => handleOverleaf(template.overleafUrl)}
              onShowRules={template.id === 'pptx-slides' ? () => setRulesOpen(true) : undefined}
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
      <PresentationRulesModal isOpen={rulesOpen} onClose={closeRules} />
    </section>
  );
}
