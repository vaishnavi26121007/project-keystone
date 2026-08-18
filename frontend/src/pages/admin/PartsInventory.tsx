import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Part } from '../../types';
import Layout from '../../components/Layout';

export default function PartsInventory() {
  const [parts, setParts] = useState<Part[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', sku: '', unitCost: '', quantityInStock: '', reorderThreshold: '5' });
  const [loading, setLoading] = useState(true);

  const load = () => api.get<Part[]>('/parts').then((res) => { setParts(res.data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/parts', {
      name: form.name,
      sku: form.sku,
      unitCost: Number(form.unitCost),
      quantityInStock: Number(form.quantityInStock),
      reorderThreshold: Number(form.reorderThreshold)
    });
    setForm({ name: '', sku: '', unitCost: '', quantityInStock: '', reorderThreshold: '5' });
    setShowForm(false);
    load();
  };

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Parts Inventory</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>Track stock levels used across work orders.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={btnPrimary}>{showForm ? 'Cancel' : '+ Add Part'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, marginBottom: 20, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10, alignItems: 'end' }}>
          <div><label style={label}>Name</label><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={input} /></div>
          <div><label style={label}>SKU</label><input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} style={input} /></div>
          <div><label style={label}>Unit Cost ($)</label><input required type="number" step="0.01" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} style={input} /></div>
          <div><label style={label}>Qty in Stock</label><input required type="number" value={form.quantityInStock} onChange={(e) => setForm({ ...form, quantityInStock: e.target.value })} style={input} /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><label style={label}>Reorder At</label><input type="number" value={form.reorderThreshold} onChange={(e) => setForm({ ...form, reorderThreshold: e.target.value })} style={input} /></div>
            <button type="submit" style={{ ...btnPrimary, height: 38 }}>Save</button>
          </div>
        </form>
      )}

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 12, color: '#64748b', background: '#f8fafc' }}>
              <th style={th}>Name</th><th style={th}>SKU</th><th style={th}>Unit Cost</th><th style={th}>In Stock</th><th style={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>}
            {!loading && parts.map((p) => {
              const low = p.quantityInStock <= p.reorderThreshold;
              return (
                <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9', fontSize: 13 }}>
                  <td style={td}>{p.name}</td>
                  <td style={td}>{p.sku || '—'}</td>
                  <td style={td}>${p.unitCost.toFixed(2)}</td>
                  <td style={td}>{p.quantityInStock}</td>
                  <td style={td}>
                    {low
                      ? <span style={{ color: '#dc2626', fontWeight: 600 }}>⚠ Reorder soon</span>
                      : <span style={{ color: '#16a34a' }}>✓ In stock</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

const th: React.CSSProperties = { padding: '12px 16px', fontWeight: 600 };
const td: React.CSSProperties = { padding: '12px 16px' };
const label: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#64748b' };
const input: React.CSSProperties = { width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' };
const btnPrimary: React.CSSProperties = { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 16px', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
