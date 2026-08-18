import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Client, Site } from '../../types';
import Layout from '../../components/Layout';

export default function ClientsAndSites() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [showNewClient, setShowNewClient] = useState(false);
  const [showNewSite, setShowNewSite] = useState(false);

  const [newClient, setNewClient] = useState({ companyName: '', contactEmail: '', contactPhone: '', billingAddress: '', slaTier: 'STANDARD' });
  const [newSite, setNewSite] = useState({ name: '', address: '', city: '', state: '', postalCode: '' });

  const loadClients = async () => {
  try {
    const res = await api.get('/clients');

    const data = Array.isArray(res.data)
      ? res.data
      : res.data.content || res.data.data || [];

    setClients(data);
  } catch (error) {
    console.error('Failed to load clients:', error);
    setClients([]);
  }
};

  useEffect(() => { loadClients(); }, []);

  useEffect(() => {
    if (selectedClient) {
      api.get<Site[]>(`/sites/client/${selectedClient.id}`).then((res) => setSites(res.data));
    }
  }, [selectedClient]);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/clients', newClient);
    setNewClient({ companyName: '', contactEmail: '', contactPhone: '', billingAddress: '', slaTier: 'STANDARD' });
    setShowNewClient(false);
    loadClients();
  };

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    await api.post('/sites', { ...newSite, client: { id: selectedClient.id } });
    setNewSite({ name: '', address: '', city: '', state: '', postalCode: '' });
    setShowNewSite(false);
    const res = await api.get<Site[]>(`/sites/client/${selectedClient.id}`);
    setSites(res.data);
  };

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Clients &amp; Sites</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Manage customer organizations and their facility locations.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24 }}>
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Clients</div>
            <button onClick={() => setShowNewClient(!showNewClient)} style={btnLink}>{showNewClient ? 'Cancel' : '+ Add client'}</button>
          </div>

          {showNewClient && (
            <form onSubmit={handleCreateClient} style={{ marginBottom: 14, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
              <input required placeholder="Company name" value={newClient.companyName} onChange={(e) => setNewClient({ ...newClient, companyName: e.target.value })} style={input} />
              <input placeholder="Contact email" value={newClient.contactEmail} onChange={(e) => setNewClient({ ...newClient, contactEmail: e.target.value })} style={input} />
              <input placeholder="Contact phone" value={newClient.contactPhone} onChange={(e) => setNewClient({ ...newClient, contactPhone: e.target.value })} style={input} />
              <select value={newClient.slaTier} onChange={(e) => setNewClient({ ...newClient, slaTier: e.target.value })} style={input}>
                <option value="STANDARD">Standard</option>
                <option value="PREMIUM">Premium</option>
                <option value="ENTERPRISE">Enterprise</option>
              </select>
              <button type="submit" style={{ ...btnPrimary, marginTop: 6 }}>Create</button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedClient(c)}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: 8,
                  border: selectedClient?.id === c.id ? '1px solid #2563eb' : '1px solid #e2e8f0',
                  background: selectedClient?.id === c.id ? '#eff6ff' : '#fff',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 13 }}>{c.companyName}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>{c.slaTier} tier</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>
              {selectedClient ? `Sites — ${selectedClient.companyName}` : 'Select a client to view sites'}
            </div>
            {selectedClient && <button onClick={() => setShowNewSite(!showNewSite)} style={btnLink}>{showNewSite ? 'Cancel' : '+ Add site'}</button>}
          </div>

          {showNewSite && selectedClient && (
            <form onSubmit={handleCreateSite} style={{ marginBottom: 14, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
              <input required placeholder="Site name" value={newSite.name} onChange={(e) => setNewSite({ ...newSite, name: e.target.value })} style={input} />
              <input required placeholder="Address" value={newSite.address} onChange={(e) => setNewSite({ ...newSite, address: e.target.value })} style={input} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="City" value={newSite.city} onChange={(e) => setNewSite({ ...newSite, city: e.target.value })} style={input} />
                <input placeholder="State" value={newSite.state} onChange={(e) => setNewSite({ ...newSite, state: e.target.value })} style={input} />
              </div>
              <input placeholder="Postal code" value={newSite.postalCode} onChange={(e) => setNewSite({ ...newSite, postalCode: e.target.value })} style={input} />
              <button type="submit" style={{ ...btnPrimary, marginTop: 6 }}>Create</button>
            </form>
          )}

          {selectedClient && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {sites.map((s) => (
                <div key={s.id} style={{ padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{s.address}{s.city ? `, ${s.city}` : ''}{s.state ? `, ${s.state}` : ''}</div>
                </div>
              ))}
              {sites.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13 }}>No sites yet.</div>}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

const input: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, marginBottom: 8, boxSizing: 'border-box' };
const btnPrimary: React.CSSProperties = { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
const btnLink: React.CSSProperties = { background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
