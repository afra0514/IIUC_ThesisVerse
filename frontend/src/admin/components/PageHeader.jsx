import React from 'react';

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="adm-page-header">
      <div>
        <h1 className="adm-page-title">{title}</h1>
        {subtitle && <p className="adm-page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="adm-header-actions">{actions}</div>}
    </div>
  );
}
