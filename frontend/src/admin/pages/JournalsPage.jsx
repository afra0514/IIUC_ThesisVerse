import React, { useState, useMemo } from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import RowActions from '../components/RowActions';
import useDbVersion from '../useDbVersion';
import { listContent, saveItem, deleteItem, moveItem, resetToDefaults } from '../../services/adminApi';

const KIND = 'journals';
const HEX = /^#[0-9a-fA-F]{6}$/;

function JournalFormModal({ item, onClose, onSaved }) {
  const isEdit = !!item;
  const [form, setForm] = useState({
    name: item?.name || '',
    shortCode: item?.shortCode || '',
    color: item?.color || '#0F172A',
    tierBadge: item?.tierBadge || '',
    tierColor: item?.tierColor || 'emerald',
    description: item?.description || '',
    searchUrl: item?.searchUrl || ''
  });
  const [error, setError] = useState('');

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    const searchUrl = form.searchUrl.trim();

    if (!form.name.trim() || !form.description.trim()) {
      setError('Name and description are required.');
      return;
    }
    if (!/^https?:\/\//i.test(searchUrl)) {
      setError('Search link must start with https://');
      return;
    }
    if (!HEX.test(form.color)) {
      setError('Brand colour must be a hex value like #00629B.');
      return;
    }

    saveItem(KIND, {
      ...(item || {}),
      name: form.name.trim(),
      shortCode: form.shortCode.trim() || form.name.trim().slice(0, 3),
      color: form.color,
      tierBadge: form.tierBadge.trim(),
      tierColor: form.tierColor,
      description: form.description.trim(),
      searchUrl
    });
    onSaved(isEdit ? 'Journal updated' : 'Journal added');
  };

  return (
    <AdminModal
      title={isEdit ? 'Edit journal portal' : 'Add journal portal'}
      subtitle="This appears as a card in Journals & Paper Discovery"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="journal-form" className="adm-btn adm-btn-primary">
            {isEdit ? 'Save changes' : 'Add journal'}
          </button>
        </>
      }
    >
      <form id="journal-form" className="flex flex-col gap-4" onSubmit={submit}>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label className="adm-label">Name *</label>
            <input name="name" className="adm-input" value={form.name} onChange={set} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Short code (on the logo box)</label>
            <input name="shortCode" maxLength={4} className="adm-input" placeholder="IEEE" value={form.shortCode} onChange={set} />
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label">Description *</label>
          <textarea name="description" rows={2} className="adm-textarea" value={form.description} onChange={set} />
        </div>

        <div className="adm-grid-2">
          <div className="adm-field">
            <label className="adm-label">Tier / indexing badge</label>
            <input name="tierBadge" className="adm-input" placeholder="Scopus · Q1–Q2" value={form.tierBadge} onChange={set} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Badge style</label>
            <select name="tierColor" className="adm-input" value={form.tierColor} onChange={set}>
              <option value="emerald">Green (peer-reviewed / indexed)</option>
              <option value="slate">Grey (preprint / unverified)</option>
            </select>
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label">Brand colour</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="w-11 h-10 p-0.5 rounded-lg border border-slate-300 bg-white cursor-pointer"
              value={HEX.test(form.color) ? form.color : '#0F172A'}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
            <input name="color" className="adm-input" style={{ maxWidth: "9rem" }} value={form.color} onChange={set} />
            <div
              className="w-11 h-11 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: HEX.test(form.color) ? form.color : '#0F172A' }}
            >
              {form.shortCode || 'Abc'}
            </div>
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label">Search link *</label>
          <input
            name="searchUrl"
            className="adm-input"
            placeholder="https://scholar.google.com/scholar?q="
            value={form.searchUrl}
            onChange={set}
          />
          <p className="adm-hint">
            If the link ends with “=” (like …?q=), the student’s hero-search keyword is added to it automatically.
          </p>
        </div>

        {error && <p className="adm-error">{error}</p>}
      </form>
    </AdminModal>
  );
}

export default function JournalsPage({ notify }) {
  const version = useDbVersion();
  const items = useMemo(() => listContent(KIND), [version]);

  const [editor, setEditor] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <>
      <PageHeader
        title="Journal Guide"
        subtitle="Manage the journal and paper-discovery portals shown to logged-in users."
        actions={
          <>
            <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="w-4 h-4" />
              <span>Reset to defaults</span>
            </button>
            <button type="button" className="adm-btn adm-btn-primary" onClick={() => setEditor({})}>
              <Plus className="w-4 h-4" />
              <span>Add journal</span>
            </button>
          </>
        }
      />

      <div className="adm-card">
        {items.length === 0 ? (
          <p className="adm-empty">No journal portals yet. Click “Add journal”.</p>
        ) : (
          <div className="adm-list">
            {items.map((j, i) => (
              <div key={j.id} className="adm-list-item">
                <div className="adm-list-icon text-xs font-bold" style={{ backgroundColor: j.color || '#0F172A' }}>
                  {j.shortCode}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="adm-list-title">{j.name}</p>
                  <p className="adm-list-desc">{j.description}</p>
                  <div className="adm-list-meta">
                    {j.tierBadge && <span className="adm-chip">{j.tierBadge}</span>}
                    <span className="adm-chip max-w-xs truncate">{j.searchUrl}</span>
                  </div>
                </div>
                <RowActions
                  onUp={() => moveItem(KIND, j.id, 'up')}
                  onDown={() => moveItem(KIND, j.id, 'down')}
                  disableUp={i === 0}
                  disableDown={i === items.length - 1}
                  onEdit={() => setEditor({ item: j })}
                  onDelete={() => setDeleting(j)}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {editor && (
        <JournalFormModal
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
          title="Delete this journal portal?"
          message={`“${deleting.name}” will be removed from the website.`}
          onConfirm={() => {
            deleteItem(KIND, deleting.id);
            setDeleting(null);
            notify('Journal deleted');
          }}
          onCancel={() => setDeleting(null)}
        />
      )}

      {confirmReset && (
        <ConfirmDialog
          title="Reset journals to defaults?"
          message="All your changes to the journal portals will be lost and the original six portals will be restored."
          confirmLabel="Reset"
          onConfirm={() => {
            resetToDefaults(KIND);
            setConfirmReset(false);
            notify('Journals reset to defaults');
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </>
  );
}
