import React, { useState, useMemo } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import RowActions from '../components/RowActions';
import useDbVersion from '../useDbVersion';
import { listContent, saveItem, deleteItem, moveItem, resetToDefaults } from '../../services/adminApi';
import { TEMPLATE_ICONS, TEMPLATE_THEMES } from '../../utils/icons';

const KIND = 'templates';

const isValidLink = (v) => /^https?:\/\//i.test(v) || v.startsWith('/');
const todayLabel = () =>
  `Updated ${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`;

function TemplateFormModal({ item, onClose, onSaved }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    title: item?.title || '',
    description: item?.description || '',
    formatBadge: item?.formatBadge || '.DOCX',
    iconName: item?.iconName || 'FileText',
    theme: item?.theme || 'blue',
    fileSize: item?.fileSize || '',
    updatedDate: item?.updatedDate || todayLabel(),
    downloadUrl: item?.downloadUrl || '',
    hasOverleafLink: !!item?.hasOverleafLink,
    overleafUrl: item?.overleafUrl || ''
  });
  const [error, setError] = useState('');

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const downloadUrl = form.downloadUrl.trim();
    const overleafUrl = form.overleafUrl.trim();

    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    if (!downloadUrl || !isValidLink(downloadUrl)) {
      setError('Download link must start with https:// or / (for a file inside the website’s public folder).');
      return;
    }
    if (form.hasOverleafLink && !/^https?:\/\//i.test(overleafUrl)) {
      setError('Enter a valid Overleaf link starting with https://');
      return;
    }

    saveItem(KIND, {
      ...(item || {}),
      title: form.title.trim(),
      description: form.description.trim(),
      formatBadge: form.formatBadge.trim() || '.FILE',
      iconName: form.iconName,
      theme: form.theme,
      fileSize: form.fileSize.trim(),
      updatedDate: form.updatedDate.trim(),
      downloadUrl,
      hasOverleafLink: form.hasOverleafLink,
      overleafUrl: form.hasOverleafLink ? overleafUrl : ''
    });
    onSaved(isEdit ? 'Template updated' : 'Template added');
  };

  return (
    <AdminModal
      title={isEdit ? 'Edit template' : 'Add template'}
      subtitle="This appears as a card in the Download Templates Hub"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="template-form" className="adm-btn adm-btn-primary">
            {isEdit ? 'Save changes' : 'Add template'}
          </button>
        </>
      }
    >
      <form id="template-form" className="flex flex-col gap-4" onSubmit={submit}>
        <div className="adm-field">
          <label className="adm-label">Title *</label>
          <input name="title" className="adm-input" value={form.title} onChange={set} />
        </div>
        <div className="adm-field">
          <label className="adm-label">Description *</label>
          <textarea name="description" rows={2} className="adm-textarea" value={form.description} onChange={set} />
        </div>

        <div className="adm-grid-2">
          <div className="adm-field">
            <label className="adm-label">Format badge</label>
            <input name="formatBadge" className="adm-input" placeholder=".DOCX" value={form.formatBadge} onChange={set} />
          </div>
          <div className="adm-field">
            <label className="adm-label">File size</label>
            <input name="fileSize" className="adm-input" placeholder="1.4 MB" value={form.fileSize} onChange={set} />
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label">Icon</label>
          <div className="adm-icon-picker">
            {Object.entries(TEMPLATE_ICONS).map(([name, Icon]) => (
              <button
                key={name}
                type="button"
                title={name}
                className={`adm-icon-option ${form.iconName === name ? 'active' : ''}`}
                onClick={() => setForm({ ...form, iconName: name })}
              >
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label">Colour</label>
          <div className="flex gap-2.5">
            {Object.entries(TEMPLATE_THEMES).map(([key, t]) => (
              <button
                key={key}
                type="button"
                title={t.label}
                aria-label={t.label}
                className={`adm-swatch ${form.theme === key ? 'active' : ''}`}
                style={{ backgroundColor: t.swatch }}
                onClick={() => setForm({ ...form, theme: key })}
              />
            ))}
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label">Download link *</label>
          <input
            name="downloadUrl"
            className="adm-input"
            placeholder="/downloads/iiuc-thesis-template.docx  or  https://drive.google.com/..."
            value={form.downloadUrl}
            onChange={set}
          />
          <p className="adm-hint">
            Use a path like /downloads/file.docx (put the file in the website’s public/downloads folder) or a full
            https:// link such as Google Drive. Direct file upload will be added with the backend.
          </p>
        </div>

        <div className="adm-field">
          <label className="adm-label">Last updated text</label>
          <div className="flex gap-2">
            <input name="updatedDate" className="adm-input" value={form.updatedDate} onChange={set} />
            <button type="button" className="adm-btn adm-btn-secondary adm-btn-sm whitespace-nowrap" onClick={() => setForm({ ...form, updatedDate: todayLabel() })}>
              Use today
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.hasOverleafLink}
            onChange={(e) => setForm({ ...form, hasOverleafLink: e.target.checked })}
          />
          <span>Show an “Open in Overleaf” button</span>
        </label>

        {form.hasOverleafLink && (
          <div className="adm-field">
            <label className="adm-label">Overleaf link</label>
            <input name="overleafUrl" className="adm-input" placeholder="https://www.overleaf.com/..." value={form.overleafUrl} onChange={set} />
          </div>
        )}

        {error && <p className="adm-error">{error}</p>}
      </form>
    </AdminModal>
  );
}

export default function TemplatesPage({ notify }) {
  const version = useDbVersion();
  const items = useMemo(() => listContent(KIND), [version]);

  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <>
      <PageHeader
        title="Templates"
        subtitle="Manage the downloadable thesis templates shown to logged-in users."
        actions={
          <>
            <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="w-4 h-4" />
              <span>Reset to defaults</span>
            </button>
            <button type="button" className="adm-btn adm-btn-primary" onClick={() => setEditor({})}>
              <Plus className="w-4 h-4" />
              <span>Add template</span>
            </button>
          </>
        }
      />

      <div className="adm-card">
        {items.length === 0 ? (
          <p className="adm-empty">No templates yet. Click “Add template”.</p>
        ) : (
          <div className="adm-list">
            {items.map((t, i) => {
              const Icon = TEMPLATE_ICONS[t.iconName] || TEMPLATE_ICONS.FileText;
              const theme = TEMPLATE_THEMES[t.theme] || TEMPLATE_THEMES.blue;
              return (
                <div key={t.id} className="adm-list-item">
                  <div className={`adm-list-icon ${theme.iconBg}`}>
                    <Icon className={`w-5 h-5 ${theme.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="adm-list-title">{t.title}</p>
                    <p className="adm-list-desc">{t.description}</p>
                    <div className="adm-list-meta">
                      <span className="adm-chip">{t.formatBadge}</span>
                      {t.fileSize && <span className="adm-chip">{t.fileSize}</span>}
                      {t.hasOverleafLink && <span className="adm-chip">Overleaf</span>}
                      <span className="adm-chip max-w-xs truncate">{t.downloadUrl}</span>
                    </div>
                  </div>
                  <RowActions
                    onUp={() => moveItem(KIND, t.id, 'up')}
                    onDown={() => moveItem(KIND, t.id, 'down')}
                    disableUp={i === 0}
                    disableDown={i === items.length - 1}
                    onEdit={() => setEditor({ item: t })}
                    onDelete={() => setDeleting(t)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editor && (
        <TemplateFormModal
          item={editor.item}
          onClose={() => setEditor(null)}
          onSaved={(msg) => {
            setEditor(null);
            notify(msg);
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this template?"
          message={`“${deleting.title}” will be removed from the website.`}
          onConfirm={() => {
            deleteItem(KIND, deleting.id);
            setDeleting(null);
            notify('Template deleted');
          }}
          onCancel={() => setDeleting(null)}
        />
      )}

      {confirmReset && (
        <ConfirmDialog
          title="Reset templates to defaults?"
          message="All your changes to the templates will be lost and the original three templates will be restored."
          confirmLabel="Reset"
          onConfirm={() => {
            resetToDefaults(KIND);
            setConfirmReset(false);
            notify('Templates reset to defaults');
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </>
  );
}
