import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, KeyRound } from 'lucide-react';
import { adminLogin } from '../services/adminApi';

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockLeft, setLockLeft] = useState(0);

  useEffect(() => {
    if (lockLeft <= 0) return undefined;
    const t = setTimeout(() => setLockLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [lockLeft]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockLeft > 0) return;

    const result = await adminLogin(email, password);
    if (result.ok) {
      onLogin(result.admin);
      return;
    }

    const next = attempts + 1;
    setAttempts(next);
    setPassword('');
    if (next >= MAX_ATTEMPTS) {
      setAttempts(0);
      setLockLeft(LOCK_SECONDS);
      setError(`Too many failed attempts. Try again in ${LOCK_SECONDS} seconds.`);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="adm-login-wrap">
      <form className="adm-login-card" onSubmit={handleSubmit}>
        <div className="adm-login-logo">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="adm-login-title">Admin</h1>
         </div>

        <div className="adm-field">
          <label className="adm-label" htmlFor="adm-email">Admin email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="adm-email"
              type="email"
              className="adm-input adm-input-with-icon"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="adm-field">
          <label className="adm-label" htmlFor="adm-password">Password</label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="adm-password"
              type="password"
              className="adm-input adm-input-with-icon"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        {error && (
          <p className="adm-error">
            {lockLeft > 0 ? `Too many failed attempts. Try again in ${lockLeft}s.` : error}
          </p>
        )}

        <button type="submit" className="adm-btn adm-btn-primary w-full" disabled={lockLeft > 0}>
          Sign in
        </button>
      </form>
    </div>
  );
}
