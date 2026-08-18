import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Client, Site, Asset, Priority } from '../../types';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';

export default function NewServiceRequest() {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const [clients, setClients] = useState<Client[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

  const [clientId, setClientId] = useState('');
  const [siteId, setSiteId] = useState('');
  const [assetId, setAssetId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hasRole('ADMIN', 'DISPATCHER')) {
      api.get<Client[]>('/clients').then((res) => setClients(res.data)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (clientId) {
      api.get<Site[]>(`/sites/client/${clientId}`).then((res) => setSites(res.data)).catch(() => {});
    } else {
      setSites([]);
    }
    setSiteId('');
  }, [clientId]);

  useEffect(() => {
    if (siteId) {
      api.get<Asset[]>(`/assets/site/${siteId}`).then((res) => setAssets(res.data)).catch(() => {});
    } else {
      setAssets([]);
    }
    setAssetId('');
  }, [siteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (hasRole('ADMIN', 'DISPATCHER') && !clientId) {
      setError('Please select a client.');
      return;
    }
    if (!siteId) {
      setError('Please select a site.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/work-orders', {
        title,
        description,
        clientId: hasRole('ADMIN', 'DISPATCHER') ? Number(clientId) : undefined,
        siteId: Number(siteId),
        assetId: assetId ? Number(assetId) : undefined,
        priority
      });
      navigate(`/work-orders/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>New Service Request</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Submit a new maintenance or repair request.</p>

      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 24, maxWidth: 560 }}>
        {hasRole('ADMIN', 'DISPATCHER') && (
          <>
            <label style={label}>Client</label>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)} style={input} required>
              <option value="">Select client...</option>
              {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </select>
          </>
        )}

        <label style={label}>Site</label>
        <select value={siteId} onChange={(e) => setSiteId(e.target.value)} style={input} required disabled={hasRole('ADMIN', 'DISPATCHER') && !clientId}>
          <option value="">Select site...</option>
          {sites.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <label style={label}>Asset (optional)</label>
        <select value={assetId} onChange={(e) => setAssetId(e.target.value)} style={input} disabled={!siteId}>
          <option value="">Not tied to a specific asset</option>
          {assets.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>

        <label style={label}>Title</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={input} placeholder="Brief summary of the issue" required />

        <label style={label}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...input, minHeight: 100, resize: 'vertical' }} placeholder="Describe the issue in detail..." />

        <label style={label}>Priority</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} style={input}>
          <option value="LOW">Low — response within 72h</option>
          <option value="MEDIUM">Medium — response within 24h</option>
          <option value="HIGH">High — response within 8h</option>
          <option value="CRITICAL">Critical — response within 2h</option>
        </select>

        {error && <div style={{ color: '#dc2626', fontSize: 13, marginTop: 12 }}>{error}</div>}

        <button type="submit" disabled={loading} style={{ marginTop: 20, background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '11px 20px', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </Layout>
  );
}

const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, marginTop: 14, color: '#334155' };
const input: React.CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14, boxSizing: 'border-box' };
