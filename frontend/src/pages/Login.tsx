import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dispatch');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={{ marginBottom: 24, textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 24 }}>KEYSTONE</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Field Service Management Platform</div>
        </div>

        <label style={styles.label}>Email</label>
        <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label style={styles.label}>Password</label>
        <input style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          No account? <Link to="/register">Register here</Link>
        </div>

        <div style={styles.demoBox}>
          <strong>Demo logins</strong> (password: Password123!)
          <div>admin@keystone.dev · dispatcher@keystone.dev</div>
          <div>tech@keystone.dev · client@keystone.dev</div>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' },
  card: { width: 380, background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, marginTop: 14, color: '#334155' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' },
  button: { width: '100%', marginTop: 20, padding: '11px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  error: { color: '#dc2626', fontSize: 13, marginTop: 12 },
  demoBox: { marginTop: 20, padding: 12, background: '#f1f5f9', borderRadius: 8, fontSize: 11, color: '#475569', lineHeight: 1.6 }
};
