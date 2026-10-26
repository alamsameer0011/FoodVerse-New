import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function AuthPanel({ onClose }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setBusy(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        setMessageType('success');
        setMessage('Welcome back. You are signed in.');
        window.setTimeout(() => onClose?.(), 650);
      } else {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        setMessageType('success');
        setMessage(data.session
          ? 'Your account is ready. Welcome to FoodVerse!'
          : 'Account created. Check your email for a confirmation link before signing in.');
        if (data.session) window.setTimeout(() => onClose?.(), 900);
      }
    } catch (error) {
      setMessageType('error');
      setMessage(error?.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose?.();
    }}>
      <section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" type="button" onClick={onClose} aria-label="Close sign in panel">×</button>
        <div className="auth-visual">
          <span className="auth-monogram">F.</span>
          <span className="eyebrow">A TABLE FOR EVERY TASTE</span>
          <h2>Come on in.<br /><em>Stay awhile.</em></h2>
          <p>Your next favourite food story starts here.</p>
          <div className="auth-visual-footer">FOODVERSE · GOOD FOOD, BEAUTIFULLY FOUND</div>
        </div>
        <div className="auth-form-side">
          <span className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'MAKE YOURSELF AT HOME'}</span>
          <h3 id="auth-title">{mode === 'login' ? 'Sign in to FoodVerse' : 'Create your account'}</h3>
          <p className="auth-subtitle">{mode === 'login'
            ? 'Your food discoveries are right where you left them.'
            : 'Save your place at the table and explore more.'}</p>

          {message && <div className={`auth-message ${messageType}`} role="status">{message}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>Email address
              <input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label>Password
              <input type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 6 characters" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
            </label>
            <button className="button button-dark button-full auth-submit" disabled={busy}>
              {busy ? 'One moment…' : mode === 'login' ? 'Sign in →' : 'Create account →'}
            </button>
          </form>

          <div className="auth-switch">
            <span>{mode === 'login' ? 'New to FoodVerse?' : 'Already have an account?'}</span>
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>
              {mode === 'login' ? 'Create an account' : 'Sign in instead'}
            </button>
          </div>
          <p className="auth-privacy">By continuing, you agree to use FoodVerse respectfully and responsibly.</p>
        </div>
      </section>
    </div>
  );
}
