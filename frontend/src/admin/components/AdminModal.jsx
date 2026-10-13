import React from 'react';
import { X } from 'lucide-react';

export default function AdminModal({ title, subtitle, onClose, children, footer, wide }) {
  return (
    <div className="adm-modal-backdrop">
      <div className={`adm-modal ${wide ? 'wide' : ''}`}>
        <div className="adm-modal-header">
          <div>
            <h3 className="adm-modal-title">{title}</h3>
            {subtitle && <p className="adm-modal-sub">{subtitle}</p>}
          </div>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="adm-modal-body">{children}</div>
        {footer && <div className="adm-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
