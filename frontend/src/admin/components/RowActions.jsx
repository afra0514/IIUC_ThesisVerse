import React from 'react';
import { Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export default function RowActions({ onEdit, onDelete, onUp, onDown, disableUp, disableDown }) {
  return (
    <div className="adm-row-actions">
      {onUp && (
        <button type="button" className="adm-icon-btn" onClick={onUp} disabled={disableUp} title="Move up" aria-label="Move up">
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
      {onDown && (
        <button type="button" className="adm-icon-btn" onClick={onDown} disabled={disableDown} title="Move down" aria-label="Move down">
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
      <button type="button" className="adm-icon-btn" onClick={onEdit} title="Edit" aria-label="Edit">
        <Pencil className="w-4 h-4" />
      </button>
      <button type="button" className="adm-icon-btn danger" onClick={onDelete} title="Delete" aria-label="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
