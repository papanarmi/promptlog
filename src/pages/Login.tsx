"use client";

import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const fromTo = (() => {
    const from = location?.state?.from as
      | { pathname?: string; search?: string; hash?: string }
      | undefined;
    if (from && (from.pathname || from.search || from.hash)) {
      return {
        pathname: from.pathname || '/',
        search: from.search || '',
        hash: from.hash || '',
      } as const;
    }
    return '/' as const;
  })();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate(fromTo as any, { replace: true });
  };

  const onMagicLink = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    const redirectTo = `${window.location.origin}`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setInfo('Magic link sent. Check your email.');
  };

  const onResetPassword = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    const redirectTo = `${window.location.origin}/update-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    setLoading(false);
    if (error) setError(error.message);
    else setInfo('Password reset email sent. Check your inbox.');
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 24 }}>
      <form onSubmit={onSubmit} style={{ width: 340, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h1 style={{ margin: 0 }}>Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
        />
        {error && <div style={{ color: 'crimson', fontSize: 13 }}>{error}</div>}
        {info && <div style={{ color: 'seagreen', fontSize: 13 }}>{info}</div>}
        <button type="submit" disabled={loading} style={{ padding: 10, borderRadius: 6 }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <button type="button" onClick={onMagicLink} disabled={loading || !email} style={{ padding: 10, borderRadius: 6 }}>
          Send magic link
        </button>
        <button type="button" onClick={onResetPassword} disabled={loading || !email} style={{ padding: 10, borderRadius: 6 }}>
          Reset password
        </button>
        <div style={{ fontSize: 14 }}>
          No account? <Link to="/signup">Sign up</Link>
        </div>
      </form>
    </div>
  );
}
