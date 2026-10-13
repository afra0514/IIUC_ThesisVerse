import React from 'react';
import AdminModal from './AdminModal';

export default function ConfirmDialog({ title, message, confirmLabel = 'Delete', danger = true, onConfirm, onCancel }) {
  return (
    <AdminModal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button type="button" className="adm-btn adm-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={`adm-btn ${danger ? 'adm-btn-danger' : 'adm-btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
    </AdminModal>
  );
}
