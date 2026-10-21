
import React, { useState, useMemo } from 'react';
import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import RowActions from '../components/RowActions';
import useDbVersion from '../useDbVersion';
import { listContent, saveItem, deleteItem, moveItem, resetToDefaults } from '../../services/adminApi';
import { GUIDELINE_ICONS } from '../../utils/icons';

const KIND = 'guidelines';

function GuidelineFormModal({ item, onClose, onSaved }) {
  const isEdit = !!item;

  const [form, setForm] = useState({
    title: item?.title || '',
    description: item?.description || '',
    iconName: item?.iconName || 'BookOpen',
    tags: (item?.tags || []).join(', '),
    subtitle: item?.details?.subtitle || '',
    stages: (item?.details?.stages || []).map((s) => ({
      title: s.title,
      pointsText: (s.points || []).join('\n')
    }))
  });
  const [error, setError] = useState('');

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const updateStage = (i, field, value) =>
    setForm({ ...form, stages: form.stages.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)) });

  const addStage = () => setForm({ ...form, stages: [...form.stages, { title: '', pointsText: '' }] });

  const removeStage = (i) => setForm({ ...form, stages: form.stages.filter((_, idx) => idx !== i) });

  const moveStage = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= form.stages.length) return;
    const stages = [...form.stages];
    [stages[i], stages[j]] = [stages[j], stages[i]];
    setForm({ ...form, stages });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and short description are required.');
      return;
    }

    const stages = form.stages
      .map((s) => ({
        title: s.title.trim(),
        points: s.pointsText.split('\n').map((p) => p.trim()).filter(Boolean)
      }))
      .filter((s) => s.title);

    saveItem(KIND, {
      ...(item || {}),
      title: form.title.trim(),
      description: form.description.trim(),
      iconName: form.iconName,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      details: { subtitle: form.subtitle.trim(), stages }
    });
    onSaved(isEdit ? 'Guideline updated' : 'Guideline added');
  };

  return (
    <AdminModal
      wide
      title={isEdit ? 'Edit guideline' : 'Add guideline'}
      subtitle="This appears as a card in the Thesis & Defense Guidelines section"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="guideline-form" className="adm-btn adm-btn-primary">
            {isEdit ? 'Save changes' : 'Add guideline'}
          </button>
        </>
      }
    >
      <form id="guideline-form" className="flex flex-col gap-4" onSubmit={submit}>
        <div className="adm-field">
          <label className="adm-label">Title *</label>
          <input name="title" className="adm-input" value={form.title} onChange={set} />
        </div>

        <div className="adm-field">
          <label className="adm-label">Short description (shown on the card) *</label>
          <textarea name="description" rows={2} className="adm-textarea" value={form.description} onChange={set} />
        </div>

        <div className="adm-field">
          <label className="adm-label">Card icon</label>
          <div className="adm-icon-picker">
            {Object.entries(GUIDELINE_ICONS).map(([name, Icon]) => (
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
          <label className="adm-label">Tags (shown on the card)</label>
          <input name="tags" className="adm-input" placeholder="Survey recent literature, Build a gap matrix" value={form.tags} onChange={set} />
          <p className="adm-hint">Separate with commas.</p>
        </div>

        <p className="adm-section-title">Full guideline (opens when a student clicks the card)</p>

        <div className="adm-field">
          <label className="adm-label">Subtitle</label>
          <input name="subtitle" className="adm-input" value={form.subtitle} onChange={set} />
        </div>

        {form.stages.map((stage, i) => (
          <div key={i} className="adm-stage-box">
            <div className="adm-stage-head">
              <input
                className="adm-input"
                placeholder={`Section ${i + 1} title`}
                value={stage.title}
                onChange={(e) => updateStage(i, 'title', e.target.value)}
              />
              <button type="button" className="adm-icon-btn" onClick={() => moveStage(i, -1)} disabled={i === 0} title="Move up">↑</button>
              <button type="button" className="adm-icon-btn" onClick={() => moveStage(i, 1)} disabled={i === form.stages.length - 1} title="Move down">↓</button>
              <button type="button" className="adm-icon-btn danger" onClick={() => removeStage(i)} title="Remove section">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={4}
              className="adm-textarea"
              placeholder="One point per line"
              value={stage.pointsText}
              onChange={(e) => updateStage(i, 'pointsText', e.target.value)}
            />
          </div>
        ))}

        <button type="button" className="adm-dashed-btn" onClick={addStage}>
          <Plus className="w-3.5 h-3.5" />
          <span>Add section</span>
        </button>

        {error && <p className="adm-error">{error}</p>}
      </form>
    </AdminModal>
  );
}

export default function GuidelinesPage({ notify }) {
  const version = useDbVersion();
  const items = useMemo(() => listContent(KIND), [version]);

  const [editor, setEditor] = useState(null); // { item? }
  const [deleting, setDeleting] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <>
      <PageHeader
        title="Thesis & Defense Guidelines"
        subtitle="Add, edit, reorder or remove the guideline cards shown to logged-in students."
        actions={
          <>
            <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="w-4 h-4" />
              <span>Reset to defaults</span>
            </button>
            <button type="button" className="adm-btn adm-btn-primary" onClick={() => setEditor({})}>
              <Plus className="w-4 h-4" />
              <span>Add guideline</span>
            </button>
          </>
        }
      />

      <div className="adm-card">
        {items.length === 0 ? (
          <p className="adm-empty">No guidelines yet. Click “Add guideline”.</p>
        ) : (
          <div className="adm-list">
            {items.map((g, i) => {
              const Icon = GUIDELINE_ICONS[g.iconName] || GUIDELINE_ICONS.BookOpen;
              return (
                <div key={g.id} className="adm-list-item">
                  <div className="adm-list-icon bg-[#0F172A]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="adm-list-title">{g.title}</p>
                    <p className="adm-list-desc">{g.description}</p>
                    <div className="adm-list-meta">
                      <span className="adm-chip">{(g.details?.stages || []).length} section(s)</span>
                      {(g.tags || []).slice(0, 4).map((t) => (
                        <span key={t} className="adm-chip">{t}</span>
                      ))}
                    </div>
                  </div>
                  <RowActions
                    onUp={() => moveItem(KIND, g.id, 'up')}
                    onDown={() => moveItem(KIND, g.id, 'down')}
                    disableUp={i === 0}
                    disableDown={i === items.length - 1}
                    onEdit={() => setEditor({ item: g })}
                    onDelete={() => setDeleting(g)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editor && (
        <GuidelineFormModal
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
          title="Delete this guideline?"
          message={`“${deleting.title}” will be removed from the website.`}
          onConfirm={() => {
            deleteItem(KIND, deleting.id);
            setDeleting(null);
            notify('Guideline deleted');
          }}
          onCancel={() => setDeleting(null)}
        />
      )}

      {confirmReset && (
        <ConfirmDialog
          title="Reset guidelines to defaults?"
          message="All your changes to the guidelines will be lost and the original four guidelines will be restored."
          confirmLabel="Reset"
          onConfirm={() => {
            resetToDefaults(KIND);
            setConfirmReset(false);
            notify('Guidelines reset to defaults');
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
    </>
  );
}
