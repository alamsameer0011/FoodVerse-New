
import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function AuthPanel({ onClose }) {
  const [isSignup, setIsSignup] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.session) {
          setMessage('Account created successfully! You are signed in.');
        } else {
          setMessage(
            'Signup successful! Please check your email to confirm your account.'
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        setMessage('Login successful!');
      }
    } catch (error) {
      setMessage(error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.panel}>
        <button
          type="button"
          onClick={onClose}
          style={styles.close}
          aria-label="Close"
        >
          ×
        </button>

        <h2 style={styles.heading}>
          {isSignup ? 'Create your FoodVerse account' : 'Welcome back!'}
        </h2>

        <p style={styles.subtitle}>
          {isSignup
            ? 'Sign up to get started with FoodVerse.'
            : 'Log in to your FoodVerse account.'}
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label} htmlFor="auth-email">Email</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="email"
            required
            style={styles.input}
          />

          <label style={styles.label} htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            minLength={6}
            required
            style={styles.input}
          />

          <button type="submit" disabled={loading} style={styles.submit}>
            {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>

        {message && (
          <p role="status" style={styles.message}>{message}</p>
        )}

        <p style={styles.switchText}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage('');
            }}
            style={styles.switchButton}
          >
            {isSignup ? 'Log In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(0, 0, 0, 0.55)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  panel: {
    position: 'relative',
    width: '100%',
    maxWidth: 420,
    boxSizing: 'border-box',
    background: '#ffffff',
    borderRadius: 16,
    padding: 28,
    color: '#24352b',
    boxShadow: '0 15px 50px rgba(0,0,0,0.2)',
  },
  close: {
    position: 'absolute',
    top: 10,
    right: 14,
    border: 0,
    background: 'transparent',
    fontSize: 28,
    cursor: 'pointer',
    color: '#526157',
  },
  heading: {
    margin: '8px 0',
    fontSize: 24,
    color: '#246b45',
  },
  subtitle: {
    color: '#68756c',
    marginBottom: 22,
  },
  label: {
    display: 'block',
    fontWeight: 600,
    margin: '12px 0 6px',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: 12,
    border: '1px solid #ccd7ce',
    borderRadius: 8,
    fontSize: 16,
  },
  submit: {
    width: '100%',
    marginTop: 20,
    padding: 13,
    background: '#287747',
    color: '#ffffff',
    border: 0,
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
  },
  message: {
    padding: 10,
    background: '#f0f7f1',
    borderRadius: 8,
    overflowWrap: 'anywhere',
  },
  switchText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
  },
  switchButton: {
    background: 'none',
    border: 0,
    color: '#287747',
    fontWeight: 700,
    cursor: 'pointer',
  },
};
