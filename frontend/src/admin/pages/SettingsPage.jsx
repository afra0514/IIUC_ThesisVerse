
import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import { updateAdminAccount } from '../../services/adminApi';

export default function SettingsPage({ admin, onAdminChange, notify }) {
  const [name, setName] = useState(admin.name);
  const [email, setEmail] = useState(admin.email);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (newPassword && newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    const result = updateAdminAccount(admin.id, { name, email, currentPassword, newPassword });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onAdminChange(result.admin);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    notify('Admin account updated');
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Your admin account. Change the default password after the first login." />

      <form className="adm-card p-6 flex flex-col gap-4 max-w-2xl" onSubmit={handleSubmit}>
        <div className="adm-grid-2">
          <div className="adm-field">
            <label className="adm-label">Name</label>
            <input className="adm-input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="adm-field">
            <label className="adm-label">Admin email</label>
            <input type="email" className="adm-input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>

        <p className="adm-section-title">Change password (optional)</p>
        <div className="adm-grid-2">
          <div className="adm-field adm-span-2">
            <label className="adm-label">Current password</label>
            <input type="password" className="adm-input" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="adm-field">
            <label className="adm-label">New password</label>
            <input type="password" className="adm-input" autoComplete="new-password" placeholder="At least 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="adm-field">
            <label className="adm-label">Confirm new password</label>
            <input type="password" className="adm-input" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>

        {error && <p className="adm-error">{error}</p>}

        <div>
          <button type="submit" className="adm-btn adm-btn-primary">Save changes</button>
        </div>
      </form>
    </>
  );
}
