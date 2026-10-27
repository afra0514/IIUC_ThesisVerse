import React, { useState } from 'react';
import { X, UserRound, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { deptLabel, deptCode } from '../../utils/format';
import '../../styles/profile/ProfileSettingsModal.css';

const DESIGNATIONS = [
  'Professor',
  'Professor & Dean',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer'
];

export default function ProfileSettingsModal({ onClose }) {
  const { user, updateProfile } = useAuth();
  const { supervisors } = useAppData();

  const isSupervisor = user?.role === 'supervisor';
  const profile = isSupervisor
    ? supervisors.find((s) => String(s.id) === String(user.supervisorId))
    : null;

  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: (isSupervisor ? profile?.phone : user?.phone) || '',
    department: isSupervisor ? deptCode(profile?.department) : user?.department || 'CSE',
    studentId: user?.studentId || '',
    batch: user?.batch || '',
    designation: profile?.designation || user?.designation || 'Lecturer',
    papers: profile?.papers ?? 0,
    openSlots: profile?.openSlots ?? 0,
    bio: profile?.bio || '',
    tags: (profile?.tags || []).join(', '),
    scholar: profile?.scholar || '',
    researchgate: profile?.researchgate || '',
    linkedin: profile?.linkedin || '',
    currentPassword: '',
    newPassword: ''
  });
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    let result;
    if (isSupervisor) {
      result = await updateProfile({
        account: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          department: form.department,
          designation: form.designation
        },
        supervisorProfile: {
          designation: form.designation,
          department: deptLabel(form.department),
          phone: form.phone.trim(),
          papers: Math.max(0, Number(form.papers) || 0),
          openSlots: Math.max(0, Number(form.openSlots) || 0),
          bio: form.bio.trim(),
          tags: form.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          scholar: form.scholar.trim(),
          researchgate: form.researchgate.trim(),
          linkedin: form.linkedin.trim()
        },
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
    } else {
      result = await updateProfile({
        account: {
          name: form.name,
          studentId: form.studentId,
          email: form.email,
          phone: form.phone.trim(),
          department: form.department,
          batch: form.batch.trim()
        },
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
    }

    if (!result.ok) {
      setError(result.error);
      setSaved(false);
      return;
    }
    setForm({ ...form, currentPassword: '', newPassword: '' });
    setSaved(true);
  };

  return (
    <div className="profile-modal-backdrop">
      <div className="profile-modal-box">

        <div className="profile-modal-header">
          <div className="profile-header-main">
            <div className="profile-avatar-circle">
              <UserRound className="w-7 h-7" />
            </div>
            <div>
              <h3 className="profile-modal-title">Profile Settings</h3>
              <p className="profile-modal-subtitle">
                {isSupervisor ? 'Supervisor account' : 'Student account'} · {user.email}
              </p>
            </div>
          </div>
          <button type="button" className="profile-close-btn" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="profile-modal-body" onSubmit={handleSubmit}>

          <div className="profile-section">
            <h4 className="profile-section-title">Basic information</h4>
            <div className="profile-grid-two">
              <div className="form-group">
                <label className="form-label">Full name</label>
                <div className="form-input-wrapper">
                  <input type="text" name="name" className="form-input-field" value={form.name} onChange={handleChange} required />
                </div>
              </div>

              {isSupervisor ? (
                <div className="form-group">
                  <label className="form-label">Designation</label>
                  <div className="form-input-wrapper">
                    <select name="designation" className="form-select-field" value={form.designation} onChange={handleChange}>
                      {(DESIGNATIONS.includes(form.designation) ? DESIGNATIONS : [form.designation, ...DESIGNATIONS]).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Student ID</label>
                  <div className="form-input-wrapper">
                    <input type="text" name="studentId" className="form-input-field" value={form.studentId} onChange={handleChange} required />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="form-input-wrapper">
                  <input type="email" name="email" className="form-input-field" value={form.email} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone</label>
                <div className="form-input-wrapper">
                  <input type="tel" name="phone" className="form-input-field" placeholder="+8801XXXXXXXXX" value={form.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <div className="form-input-wrapper">
                  <select name="department" className="form-select-field" value={form.department} onChange={handleChange}>
                    <option value="CSE">Dept. of CSE</option>
                    <option value="EEE">Dept. of EEE</option>
                  </select>
                </div>
              </div>

              {!isSupervisor && (
                <div className="form-group">
                  <label className="form-label">Batch / Semester</label>
                  <div className="form-input-wrapper">
                    <input type="text" name="batch" className="form-input-field" placeholder="e.g. 48th batch" value={form.batch} onChange={handleChange} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Supervisor-only: directory profile */}
          {isSupervisor && (
            <div className="profile-section">
              <h4 className="profile-section-title">Directory profile (visible to students)</h4>

              <div className="form-group">
                <label className="form-label">Biography &amp; focus area</label>
                <textarea
                  name="bio"
                  className="form-textarea-field"
                  rows={3}
                  value={form.bio}
                  onChange={handleChange}
                  placeholder="Tell students about your research and what kind of thesis topics you supervise."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Research domains</label>
                <div className="form-input-wrapper">
                  <input
                    type="text"
                    name="tags"
                    className="form-input-field"
                    placeholder="e.g. Machine Learning, NLP, IoT"
                    value={form.tags}
                    onChange={handleChange}
                  />
                </div>
                <p className="form-hint-text">Separate domains with commas.</p>
              </div>

              <div className="profile-grid-two">
                <div className="form-group">
                  <label className="form-label">Publications</label>
                  <div className="form-input-wrapper">
                    <input type="number" min="0" name="papers" className="form-input-field" value={form.papers} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Total supervision slots</label>
                  <div className="form-input-wrapper">
                    <input type="number" min="0" name="openSlots" className="form-input-field" value={form.openSlots} onChange={handleChange} />
                  </div>
                  <p className="form-hint-text">Accepted groups reduce the open slots shown to students.</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Google Scholar URL</label>
                  <div className="form-input-wrapper">
                    <input type="url" name="scholar" className="form-input-field" placeholder="https://scholar.google.com/..." value={form.scholar} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">ResearchGate URL</label>
                  <div className="form-input-wrapper">
                    <input type="url" name="researchgate" className="form-input-field" placeholder="https://researchgate.net/..." value={form.researchgate} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-group profile-span-two">
                  <label className="form-label">LinkedIn URL</label>
                  <div className="form-input-wrapper">
                    <input type="url" name="linkedin" className="form-input-field" placeholder="https://linkedin.com/in/..." value={form.linkedin} onChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="profile-section">
            <h4 className="profile-section-title">Change password (optional)</h4>
            <div className="profile-grid-two">
              <div className="form-group">
                <label className="form-label">Current password</label>
                <div className="form-input-wrapper">
                  <input type="password" name="currentPassword" className="form-input-field" autoComplete="current-password" value={form.currentPassword} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">New password</label>
                <div className="form-input-wrapper">
                  <input type="password" name="newPassword" className="form-input-field" autoComplete="new-password" placeholder="Minimum 6 characters" value={form.newPassword} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          {error && <p className="form-error-text">{error}</p>}
          {saved && <p className="profile-success-text">Profile updated successfully.</p>}

          <div className="profile-actions">
            <button type="button" className="profile-cancel-btn" onClick={onClose}>Close</button>
            <button type="submit" className="profile-save-btn">
              <Save className="w-3.5 h-3.5" />
              <span>Save changes</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
