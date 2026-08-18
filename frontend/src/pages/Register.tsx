import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'CLIENT' as Role,
    clientId: '',
    specialization: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: form.role,
        clientId: form.clientId ? Number(form.clientId) : undefined,
        specialization: form.specialization || undefined
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 22 }}>Create account</div>
          <div style={{ fontSize: 13, color: '#64748b' }}>Project KEYSTONE</div>
        </div>

        <label style={styles.label}>Full name</label>
        <input style={styles.input} value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} required />

        <label style={styles.label}>Email</label>
        <input style={styles.input} type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />

        <label style={styles.label}>Password</label>
        <input style={styles.input} type="password" value={form.password} onChange={(e) => handleChange('password', e.target.value)} required />

        <label style={styles.label}>Phone</label>
        <input style={styles.input} value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />

        <label style={styles.label}>Role</label>
        <select style={styles.input} value={form.role} onChange={(e) => handleChange('role', e.target.value)}>
          <option value="CLIENT">Client (customer portal)</option>
          <option value="TECHNICIAN">Technician</option>
          <option value="DISPATCHER">Dispatcher</option>
          <option value="ADMIN">Admin</option>
        </select>

        {form.role === 'CLIENT' && (
          <>
            <label style={styles.label}>Client Organization ID</label>
            <input style={styles.input} value={form.clientId} onChange={(e) => handleChange('clientId', e.target.value)} placeholder="e.g. 1 (from your onboarding email)" />
          </>
        )}

        {form.role === 'TECHNICIAN' && (
          <>
            <label style={styles.label}>Specialization</label>
            <input style={styles.input} value={form.specialization} onChange={(e) => handleChange('specialization', e.target.value)} placeholder="e.g. HVAC, Electrical" />
          </>
        )}

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Creating account...' : 'Create account'}
        </button>

        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', padding: '20px 0' },
  card: { width: 400, background: '#fff', borderRadius: 12, padding: 32, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, marginTop: 14, color: '#334155' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' },
  button: { width: '100%', marginTop: 20, padding: '11px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  error: { color: '#dc2626', fontSize: 13, marginTop: 12 }
};
