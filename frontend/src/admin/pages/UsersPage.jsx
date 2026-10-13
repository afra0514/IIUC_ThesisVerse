import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import RowActions from '../components/RowActions';
import useDbVersion from '../useDbVersion';
import { listUsers, listUnclaimedProfiles, createUser, updateUser, deleteUser } from '../../services/adminApi';
import { deptCode, formatDateTime } from '../../utils/format';

const DESIGNATIONS = [
  'Professor',
  'Professor & Dean',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer'
];

/* ------------------------------------------------------------------ */
/* Create / edit form                                                  */
/* ------------------------------------------------------------------ */
function UserFormModal({ mode, user, onClose, onSaved }) {
  const isEdit = mode === 'edit';
  const profile = user?.profile || {};
  const unclaimed = useMemo(() => (isEdit ? [] : listUnclaimedProfiles()), [isEdit]);

  const [form, setForm] = useState({
    role: user?.role || 'student',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || profile.phone || '',
    department: user?.department || 'CSE',
    password: '',
    // student
    studentId: user?.studentId || '',
    batch: user?.batch || '',
    // supervisor
    designation: user?.designation || profile.designation || 'Lecturer',
    profileChoice: 'new',
    papers: profile.papers ?? 0,
    openSlots: profile.openSlots ?? 3,
    tags: (profile.tags || []).join(', '),
    bio: profile.bio || '',
    scholar: profile.scholar || '',
    researchgate: profile.researchgate || '',
    linkedin: profile.linkedin || ''
  });
  const [error, setError] = useState('');

  const isSupervisor = form.role === 'supervisor';

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // choosing a directory profile pre-fills its details
  const chooseProfile = (e) => {
    const value = e.target.value;
    const p = unclaimed.find((s) => String(s.id) === value);
    if (p) {
      setForm({
        ...form,
        profileChoice: value,
        name: p.name,
        email: p.email || form.email,
        phone: p.phone || '',
        department: deptCode(p.department),
        designation: p.designation,
        papers: p.papers ?? 0,
        openSlots: p.openSlots ?? 0,
        tags: (p.tags || []).join(', '),
        bio: p.bio || '',
        scholar: p.scholar || '',
        researchgate: p.researchgate || '',
        linkedin: p.linkedin || ''
      });
    } else {
      setForm({ ...form, profileChoice: 'new' });
    }
  };

  const submit = (e) => {
    e.preventDefault();
    setError('');
    const result = isEdit ? updateUser(user.id, form) : createUser(form);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved(isEdit ? 'User updated' : 'User created');
  };

  return (
    <AdminModal
      wide
      title={isEdit ? `Edit ${user.role}` : 'Add new user'}
      subtitle={isEdit ? user.email : 'Create a student or supervisor account'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="adm-btn adm-btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="user-form" className="adm-btn adm-btn-primary">
            {isEdit ? 'Save changes' : 'Create user'}
          </button>
        </>
      }
    >
      <form id="user-form" className="flex flex-col gap-4" onSubmit={submit}>

        {!isEdit && (
          <div className="adm-field">
            <label className="adm-label">Role</label>
            <select name="role" className="adm-input" value={form.role} onChange={set}>
              <option value="student">Student</option>
              <option value="supervisor">Supervisor</option>
            </select>
          </div>
        )}

        {!isEdit && isSupervisor && (
          <div className="adm-field">
            <label className="adm-label">Link to a directory profile</label>
            <select className="adm-input" value={form.profileChoice} onChange={chooseProfile}>
              <option value="new">Create a new profile</option>
              {unclaimed.map((s) => (
                <option key={s.id} value={String(s.id)}>{s.name} ({s.designation})</option>
              ))}
            </select>
            <p className="adm-hint">Existing directory entries that have no account yet.</p>
          </div>
        )}

        <div className="adm-grid-2">
          <div className="adm-field">
            <label className="adm-label">Full name *</label>
            <input name="name" className="adm-input" value={form.name} onChange={set} required />
          </div>
          <div className="adm-field">
            <label className="adm-label">Email *</label>
            <input type="email" name="email" className="adm-input" value={form.email} onChange={set} required />
          </div>

          {isSupervisor ? (
            <div className="adm-field">
              <label className="adm-label">Designation</label>
              <select name="designation" className="adm-input" value={form.designation} onChange={set}>
                {(DESIGNATIONS.includes(form.designation) ? DESIGNATIONS : [form.designation, ...DESIGNATIONS]).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="adm-field">
              <label className="adm-label">Student ID *</label>
              <input name="studentId" className="adm-input" value={form.studentId} onChange={set} required />
            </div>
          )}

          <div className="adm-field">
            <label className="adm-label">Department</label>
            <select name="department" className="adm-input" value={form.department} onChange={set}>
              <option value="CSE">Dept. of CSE</option>
              <option value="EEE">Dept. of EEE</option>
            </select>
          </div>

          <div className="adm-field">
            <label className="adm-label">Phone</label>
            <input name="phone" className="adm-input" placeholder="+8801XXXXXXXXX" value={form.phone} onChange={set} />
          </div>

          {!isSupervisor && (
            <div className="adm-field">
              <label className="adm-label">Batch / Semester</label>
              <input name="batch" className="adm-input" value={form.batch} onChange={set} />
            </div>
          )}

          <div className="adm-field adm-span-2">
            <label className="adm-label">{isEdit ? 'Reset password (leave blank to keep the current one)' : 'Password *'}</label>
            <input
              type="text"
              name="password"
              className="adm-input"
              autoComplete="new-password"
              placeholder="At least 6 characters"
              value={form.password}
              onChange={set}
              required={!isEdit}
            />
          </div>
        </div>

        {isSupervisor && (
          <>
            <p className="adm-section-title">Directory profile (visible to students)</p>
            <div className="adm-field">
              <label className="adm-label">Biography</label>
              <textarea name="bio" rows={3} className="adm-textarea" value={form.bio} onChange={set} />
            </div>
            <div className="adm-field">
              <label className="adm-label">Research domains</label>
              <input name="tags" className="adm-input" placeholder="Machine Learning, NLP, IoT" value={form.tags} onChange={set} />
              <p className="adm-hint">Separate with commas.</p>
            </div>
            <div className="adm-grid-2">
              <div className="adm-field">
                <label className="adm-label">Publications</label>
                <input type="number" min="0" name="papers" className="adm-input" value={form.papers} onChange={set} />
              </div>
              <div className="adm-field">
                <label className="adm-label">Total supervision slots</label>
                <input type="number" min="0" name="openSlots" className="adm-input" value={form.openSlots} onChange={set} />
              </div>
              <div className="adm-field">
                <label className="adm-label">Google Scholar URL</label>
                <input type="url" name="scholar" className="adm-input" value={form.scholar} onChange={set} />
              </div>
              <div className="adm-field">
                <label className="adm-label">ResearchGate URL</label>
                <input type="url" name="researchgate" className="adm-input" value={form.researchgate} onChange={set} />
              </div>
              <div className="adm-field adm-span-2">
                <label className="adm-label">LinkedIn URL</label>
                <input type="url" name="linkedin" className="adm-input" value={form.linkedin} onChange={set} />
              </div>
            </div>
          </>
        )}

        {error && <p className="adm-error">{error}</p>}
      </form>
    </AdminModal>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
export default function UsersPage({ notify }) {
  const version = useDbVersion();
  const users = useMemo(() => listUsers(), [version]);

  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [editor, setEditor] = useState(null); // { mode: 'create' } | { mode: 'edit', user }
  const [deleting, setDeleting] = useState(null);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.studentId || '').toLowerCase().includes(q);
    return matchQuery && (roleFilter === 'all' || u.role === roleFilter);
  });

  const confirmDelete = () => {
    const result = deleteUser(deleting.id);
    notify(result.ok ? 'User deleted' : result.error);
    setDeleting(null);
  };

  return (
    <>
      <PageHeader
        title="Users"
        subtitle={`${users.length} registered user${users.length === 1 ? '' : 's'} (students and supervisors).`}
        actions={
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => setEditor({ mode: 'create' })}>
            <Plus className="w-4 h-4" />
            <span>Add user</span>
          </button>
        }
      />

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              className="adm-input adm-input-with-icon"
              placeholder="Search by name, email or student ID"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="sm:w-44 shrink-0">
            <select className="adm-input" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="all">All roles</option>
              <option value="student">Students</option>
              <option value="supervisor">Supervisors</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="adm-empty">
            {users.length === 0 ? 'No users yet. Add one, or wait for people to register on the website.' : 'No users match your search.'}
          </p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>ID / Designation</th>
                  <th>Email</th>
                  <th>Dept.</th>
                  <th>Joined</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id}>
                    <td className="font-semibold text-slate-900">{u.name}</td>
                    <td><span className={`adm-badge ${u.role}`}>{u.role}</span></td>
                    <td>{u.role === 'student' ? u.studentId : u.designation}</td>
                    <td>{u.email}</td>
                    <td>{u.department}</td>
                    <td className="whitespace-nowrap">{formatDateTime(u.createdAt)}</td>
                    <td>
                      <RowActions
                        onEdit={() => setEditor({ mode: 'edit', user: u })}
                        onDelete={() => setDeleting(u)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editor && (
        <UserFormModal
          mode={editor.mode}
          user={editor.user}
          onClose={() => setEditor(null)}
          onSaved={(msg) => {
            setEditor(null);
            notify(msg);
          }}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title={`Delete ${deleting.name}?`}
          message={
            deleting.role === 'student'
              ? 'This permanently deletes the student account together with all their supervision requests and notifications.'
              : 'This permanently deletes the supervisor account and their notifications. If the directory profile was created for this account, it is removed with all requests sent to it.'
          }
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </>
  );
}
