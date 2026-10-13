import React from 'react';
import ReactDOM from 'react-dom/client';
import AdminApp from './AdminApp';
import '../styles/index.css';
import '../styles/admin/Admin.css';

ReactDOM.createRoot(document.getElementById('admin-root')).render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);
