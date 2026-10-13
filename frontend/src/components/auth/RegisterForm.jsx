import React, { useState } from 'react';
import { User, Mail, KeyRound, Building2, Briefcase, Link2 } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { deptCode } from '../../utils/format';
import '../../styles/auth/RegisterForm.css';

const DESIGNATIONS = [
  'Professor',
  'Associate Professor',
  'Assistant Professor',
  'Senior Lecturer',
  'Lecturer'
];

export default function RegisterForm({ role = 'student', error, onSubmit, onSwitchToLogin }) {
  const isSupervisor = role === 'supervisor';
  const { supervisors } = useAppData();

  const unclaimedProfiles = supervisors.filter((s) => !s.custom && !s.hasAccount);

  const [formData, setFormData] = useState({
    fullName: '',
    studentId: '',
    email: '',
    department: 'CSE',
    designation: 'Lecturer',
    profileChoice: 'new',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileChoice = (e) => {
    const value = e.target.value;
    const profile = unclaimedProfiles.find((s) => String(s.id) === value);
    if (profile) {
      setFormData({
        ...formData,
        profileChoice: value,
        fullName: profile.name,
        designation: profile.designation,
        department: deptCode(profile.department)
      });
    } else {
      setFormData({ ...formData, profileChoice: 'new' });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ ...formData });
    }
  };

  const designationOptions = DESIGNATIONS.includes(formData.designation)
    ? DESIGNATIONS
    : [formData.designation, ...DESIGNATIONS];

  return (
    <form className="register-form" onSubmit={handleSubmit}>

      {isSupervisor && (
        <div className="form-group">
          <label className="form-label">Faculty Directory Profile</label>
          <div className="form-input-wrapper">
            <Link2 className="form-field-icon" />
            <select
              name="profileChoice"
              className="form-select-field"
              value={formData.profileChoice}
              onChange={handleProfileChoice}
            >
              <option value="new">My name is not listed — create a new profile</option>
              {unclaimedProfiles.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name} ({s.designation})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <div className="form-input-wrapper">
          <User className="form-field-icon" />
          <input
            type="text"
            name="fullName"
            className="form-input-field"
            placeholder={isSupervisor ? 'e.g. Dr. Mohammad Mahmudul Hasan' : 'e.g. Sumaiya Mahin Tahmina'}
            value={formData.fullName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row-two-col">
        
        {isSupervisor ? (
          <div className="form-group">
            <label className="form-label">Designation</label>
            <div className="form-input-wrapper">
              <Briefcase className="form-field-icon" />
              <select
                name="designation"
                className="form-select-field"
                value={formData.designation}
                onChange={handleChange}
              >
                {designationOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label">Student ID</label>
            <div className="form-input-wrapper">
              <input
                type="text"
                name="studentId"
                className="form-input-field"
                placeholder="e.g. C201000"
                value={formData.studentId}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Department</label>
          <div className="form-input-wrapper">
            <Building2 className="form-field-icon" />
            <select
              name="department"
              className="form-select-field"
              value={formData.department}
              onChange={handleChange}
            >
              <option value="CSE">Dept. of CSE</option>
              <option value="EEE">Dept. of EEE</option>
            </select>
          </div>
        </div>

      </div>

      {/* IIUC Email */}
      <div className="form-group">
        <label className="form-label">
          {isSupervisor ? 'IIUC Faculty Email' : 'IIUC Student Email'}
        </label>
        <div className="form-input-wrapper">
          <Mail className="form-field-icon" />
          <input
            type="email"
            name="email"
            className="form-input-field"
            placeholder={isSupervisor ? 'name@iiuc.ac.bd' : 'c223205@ugrad.iiuc.ac.bd'}
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Create Password</label>
        <div className="form-input-wrapper">
          <KeyRound className="form-field-icon" />
          <input
            type="password"
            name="password"
            className="form-input-field"
            placeholder="Minimum 6 characters"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
          />
        </div>
      </div>

      {error && <p className="form-error-text">{error}</p>}

      <button type="submit" className="register-submit-btn">
        <span>Create {isSupervisor ? 'Supervisor' : 'Student'} Account</span>
      </button>

      <div className="switch-auth-text">
        <span>Already registered? </span>
        <button
          type="button"
          className="switch-auth-link"
          onClick={onSwitchToLogin}
        >
          Sign In
        </button>
      </div>

    </form>
  );
}
