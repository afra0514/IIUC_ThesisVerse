import React, { useMemo } from 'react';
import { GraduationCap, UserRound, Send, BookOpen, Download, Library } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import useDbVersion from '../useDbVersion';
import { getStats, listUsers } from '../../services/adminApi';
import { formatDateTime } from '../../utils/format';

export default function Overview({ onNavigate }) {
  const version = useDbVersion();
  const stats = useMemo(() => getStats(), [version]);
  const recent = useMemo(() => listUsers().slice(0, 6), [version]);

  const cards = [
    { label: 'Students', value: stats.students, icon: GraduationCap, color: 'text-blue-600', go: 'users' },
    { label: 'Supervisors', value: stats.supervisors, icon: UserRound, color: 'text-emerald-600', go: 'users' },
    {
      label: 'Supervision requests',
      value: stats.requests.total,
      icon: Send,
      color: 'text-amber-600',
      note: `${stats.requests.pending} pending · ${stats.requests.accepted} accepted · ${stats.requests.rejected} rejected`
    },
    { label: 'Thesis guidelines', value: stats.guidelines, icon: BookOpen, color: 'text-violet-600', go: 'guidelines' },
    { label: 'Templates', value: stats.templates, icon: Download, color: 'text-orange-600', go: 'templates' },
    { label: 'Journal portals', value: stats.journals, icon: Library, color: 'text-red-600', go: 'journals' }
  ];

  return (
    <>
      <PageHeader title="Overview" subtitle="A quick look at everything on ThesisVerse." />

      <div className="adm-stats-grid">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="adm-stat-card">
              <Icon className={`w-5 h-5 ${c.color}`} />
              <span className="adm-stat-value">{c.value}</span>
              <span className="adm-stat-label">{c.label}</span>
              {c.note && <span className="adm-hint">{c.note}</span>}
              {c.go && (
                <button
                  type="button"
                  className="adm-hint text-emerald-700 font-semibold bg-transparent border-0 p-0 text-left cursor-pointer"
                  onClick={() => onNavigate(c.go)}
                >
                  Manage →
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="adm-card">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900">Recently registered users</h2>
        </div>
        {recent.length === 0 ? (
          <p className="adm-empty">No users have registered yet.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((u) => (
                  <tr key={u.id}>
                    <td className="font-semibold text-slate-900">{u.name}</td>
                    <td><span className={`adm-badge ${u.role}`}>{u.role}</span></td>
                    <td>{u.email}</td>
                    <td className="whitespace-nowrap">{formatDateTime(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
