import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Download,
  Library,
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import AdminLogin from './AdminLogin';
import Overview from './pages/Overview';
import UsersPage from './pages/UsersPage';
import GuidelinesPage from './pages/GuidelinesPage';
import TemplatesPage from './pages/TemplatesPage';
import JournalsPage from './pages/JournalsPage';
import SettingsPage from './pages/SettingsPage';
import { getAdminSession, adminLogout } from '../services/adminApi';

const NAV = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'guidelines', label: 'Thesis Guidelines', icon: BookOpen },
  { key: 'templates', label: 'Templates', icon: Download },
  { key: 'journals', label: 'Journal Guide', icon: Library },
  { key: 'settings', label: 'Settings', icon: Settings }
];

const pageFromHash = () => {
  const key = window.location.hash.replace('#', '');
  return NAV.some((n) => n.key === key) ? key : 'overview';
};

export default function AdminApp() {
  const [admin, setAdmin] = useState(() => getAdminSession());
  const [page, setPage] = useState(pageFromHash);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const onHash = () => setPage(pageFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  if (!admin) {
    return <AdminLogin onLogin={setAdmin} />;
  }

  const go = (key) => {
    window.location.hash = key;
    setPage(key);
  };

  const logout = () => {
    adminLogout();
    setAdmin(null);
  };

  const pageProps = { notify: setToast };

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-brand">
          <div className="adm-brand-icon">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="adm-brand-title">ThesisVerse Admin</p>
            <p className="adm-brand-sub">IIUC control panel</p>
          </div>
          <div className="md:hidden ml-auto">
            <button type="button" className="adm-btn adm-btn-secondary adm-btn-sm" onClick={logout}>
              Logout
            </button>
          </div>
        </div>

        <nav className="adm-nav">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              className={`adm-nav-btn ${page === key ? 'active' : ''}`}
              onClick={() => go(key)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <div className="min-w-0">
            <p className="adm-user-name">{admin.name}</p>
            <p className="adm-user-email">{admin.email}</p>
          </div>
          <button type="button" className="adm-btn adm-btn-secondary adm-btn-sm" onClick={logout}>
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="adm-main">
        {page === 'overview' && <Overview onNavigate={go} />}
        {page === 'users' && <UsersPage {...pageProps} />}
        {page === 'guidelines' && <GuidelinesPage {...pageProps} />}
        {page === 'templates' && <TemplatesPage {...pageProps} />}
        {page === 'journals' && <JournalsPage {...pageProps} />}
        {page === 'settings' && <SettingsPage admin={admin} onAdminChange={setAdmin} {...pageProps} />}
      </main>

      {toast && <div className="adm-toast">{toast}</div>}
    </div>
  );
}
