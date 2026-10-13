import React, { useState } from 'react';
import { Mail, Lock, KeyRound } from 'lucide-react';
import '../../styles/auth/LoginForm.css';

export default function LoginForm({ role = 'student', error, onSubmit, onSwitchToRegister }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const isSupervisor = role === 'supervisor';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ identifier, password });
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      
      <div className="form-group">
        <label className="form-label">
          {isSupervisor ? 'IIUC Email' : 'Student ID or Email'}
        </label>
        <div className="form-input-wrapper">
          <Mail className="form-field-icon" />
          <input
            type="text"
            className="form-input-field"
            placeholder={isSupervisor ? 'e.g. name@iiuc.ac.bd' : 'e.g. C223205 or @ugrad.iiuc.ac.bd'}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <div className="password-label-row">
          <label className="form-label">Password</label>
          <a href="#forgot" className="forgot-link">Forgot password?</a>
        </div>
        <div className="form-input-wrapper">
          <KeyRound className="form-field-icon" />
          <input
            type="password"
            className="form-input-field"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      {error && <p className="form-error-text">{error}</p>}

      <button type="submit" className="login-submit-btn">
        <Lock className="w-3.5 h-3.5" />
        <span>Sign In as {isSupervisor ? 'Supervisor' : 'Student'}</span>
      </button>

      <div className="switch-auth-text">
        <span>Don&apos;t have an account yet? </span>
        <button
          type="button"
          className="switch-auth-link"
          onClick={onSwitchToRegister}
        >
          Register Here
        </button>
      </div>

    </form>
  );
}
