import React, { useState } from 'react';
import { X, Send, Plus, Trash2, CheckCircle2, UserRound, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData, MAX_GROUP_MEMBERS } from '../../context/AppDataContext';
import '../../styles/requests/SupervisionRequestModal.css';

const emptyMember = () => ({ name: '', studentId: '', email: '' });

export default function SupervisionRequestModal({ supervisor, onClose }) {
  const { user } = useAuth();
  const { sendRequest } = useAppData();

  const [student, setStudent] = useState({
    name: user?.name || '',
    studentId: user?.studentId || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || 'CSE',
    batch: user?.batch || ''
  });
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!supervisor) return null;

  const handleStudentChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const updateMember = (index, field, value) => {
    setMembers(members.map((m, i) => (i === index ? { ...m, [field]: value } : m)));
  };

  const addMember = () => {
    if (members.length < MAX_GROUP_MEMBERS) setMembers([...members, emptyMember()]);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ignore completely empty member rows
    const filledMembers = members
      .map((m) => ({ name: m.name.trim(), studentId: m.studentId.trim(), email: m.email.trim() }))
      .filter((m) => m.name || m.studentId || m.email);

    if (filledMembers.some((m) => !m.name || !m.studentId)) {
      setError('Every group member needs a name and a student ID.');
      return;
    }

    const result = await sendRequest({
      supervisorId: supervisor.id,
      student: {
        name: student.name.trim(),
        studentId: student.studentId.trim(),
        email: student.email.trim(),
        phone: student.phone.trim(),
        department: student.department,
        batch: student.batch.trim()
      },
      topic: topic.trim(),
      description: description.trim(),
      members: filledMembers,
      message: message.trim()
    });

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    setSubmitted(true);
  };

  return (
    <div className="req-modal-backdrop">
      <div className="req-modal-box">

        {/* Header */}
        <div className="req-modal-header">
          <div className="req-header-profile">
            <div className="req-header-avatar">
              <UserRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="req-modal-title">Supervision Request</h3>
              <p className="req-modal-subtitle">
                To {supervisor.name} · {supervisor.designation}, {supervisor.department}
              </p>
            </div>
          </div>
          <button type="button" className="req-close-btn" onClick={onClose} aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="req-success">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
            <h4 className="req-success-title">Request sent!</h4>
            <p className="req-success-text">
              {supervisor.name} can now see your request. You will get a notification here as soon as
              they accept or reject it, and you can track the status on your dashboard.
            </p>
            <button type="button" className="req-submit-btn" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form className="req-modal-body" onSubmit={handleSubmit}>

            {!supervisor.hasAccount && (
              <div className="req-note-box">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  This supervisor has not activated their ThesisVerse account yet. Your request will be
                  saved and shown to them once they join.
                </span>
              </div>
            )}

            {/* Student info */}
            <div className="req-section">
              <h4 className="req-section-title">Your information (group leader)</h4>
              <div className="req-grid-two">
                <div className="form-group">
                  <label className="form-label">Full name *</label>
                  <div className="form-input-wrapper">
                    <input
                      type="text"
                      name="name"
                      className="form-input-field"
                      value={student.name}
                      onChange={handleStudentChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Student ID *</label>
                  <div className="form-input-wrapper">
                    <input
                      type="text"
                      name="studentId"
                      className="form-input-field"
                      value={student.studentId}
                      onChange={handleStudentChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <div className="form-input-wrapper">
                    <input
                      type="email"
                      name="email"
                      className="form-input-field"
                      value={student.email}
                      onChange={handleStudentChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <div className="form-input-wrapper">
                    <input
                      type="tel"
                      name="phone"
                      className="form-input-field"
                      placeholder="+8801XXXXXXXXX"
                      value={student.phone}
                      onChange={handleStudentChange}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <div className="form-input-wrapper">
                    <select
                      name="department"
                      className="form-select-field"
                      value={student.department}
                      onChange={handleStudentChange}
                    >
                      <option value="CSE">Dept. of CSE</option>
                      <option value="EEE">Dept. of EEE</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Batch / Semester</label>
                  <div className="form-input-wrapper">
                    <input
                      type="text"
                      name="batch"
                      className="form-input-field"
                      placeholder="e.g. 48th batch"
                      value={student.batch}
                      onChange={handleStudentChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Topic */}
            <div className="req-section">
              <h4 className="req-section-title">Thesis topic</h4>
              <div className="form-group">
                <label className="form-label">Topic name *</label>
                <div className="form-input-wrapper">
                  <input
                    type="text"
                    className="form-input-field"
                    placeholder="e.g. Bangla Fake News Detection using Transformers"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Short description *</label>
                <textarea
                  className="form-textarea-field"
                  rows={3}
                  placeholder="What problem will you work on and what is your rough plan?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Group members */}
            <div className="req-section">
              <div className="req-section-head">
                <h4 className="req-section-title">Group members</h4>
                <span className="form-hint-text">
                  {members.length} of {MAX_GROUP_MEMBERS} added (leave empty for an individual thesis)
                </span>
              </div>

              {members.map((member, index) => (
                <div key={index} className="req-member-row">
                  <div className="form-input-wrapper">
                    <input
                      type="text"
                      className="form-input-field"
                      placeholder="Member name"
                      value={member.name}
                      onChange={(e) => updateMember(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="form-input-wrapper">
                    <input
                      type="text"
                      className="form-input-field"
                      placeholder="Student ID"
                      value={member.studentId}
                      onChange={(e) => updateMember(index, 'studentId', e.target.value)}
                    />
                  </div>
                  <div className="form-input-wrapper">
                    <input
                      type="email"
                      className="form-input-field"
                      placeholder="Email (optional)"
                      value={member.email}
                      onChange={(e) => updateMember(index, 'email', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="req-remove-member-btn"
                    onClick={() => removeMember(index)}
                    aria-label="Remove member"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="req-add-member-btn"
                onClick={addMember}
                disabled={members.length >= MAX_GROUP_MEMBERS}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add group member</span>
              </button>
            </div>

            {/* Message */}
            <div className="req-section">
              <div className="form-group">
                <label className="form-label">Message to supervisor (optional)</label>
                <textarea
                  className="form-textarea-field"
                  rows={2}
                  placeholder="Anything else the supervisor should know?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="form-error-text">{error}</p>}

            <div className="req-actions">
              <button type="button" className="req-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="req-submit-btn">
                <Send className="w-3.5 h-3.5" />
                <span>Send Request</span>
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
}
