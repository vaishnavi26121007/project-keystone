import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { WorkOrder } from '../../types';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaIndicator from '../../components/SlaIndicator';
import { useAuth } from '../../context/AuthContext';

export default function WorkOrderList() {
  const { hasRole } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<WorkOrder[]>('/work-orders');
        setOrders(res.data);
      } catch {
        // handled by empty state
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = orders.filter((wo) => {
    const matchesStatus = statusFilter === 'ALL' || wo.status === statusFilter;
    const matchesSearch =
      wo.title.toLowerCase().includes(search.toLowerCase()) ||
      wo.ticketNumber.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Work Orders</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0' }}>{filtered.length} of {orders.length} shown</p>
        </div>
        {hasRole('ADMIN', 'DISPATCHER', 'CLIENT') && (
          <Link to="/new-request" style={{ background: '#2563eb', color: '#fff', padding: '10px 18px', borderRadius: 8, textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
            + New Work Order
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input
          placeholder="Search by title or ticket #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 14 }}>
          <option value="ALL">All statuses</option>
          <option value="NEW">New</option>
          <option value="ASSIGNED">Assigned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CLOSED">Closed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', fontSize: 12, color: '#64748b', background: '#f8fafc' }}>
              <th style={th}>Ticket</th>
              <th style={th}>Title</th>
              <th style={th}>Client / Site</th>
              <th style={th}>Technician</th>
              <th style={th}>Status</th>
              <th style={th}>Priority</th>
              <th style={th}>SLA</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
            )}
            {!loading && filtered.map((wo) => (
              <tr key={wo.id} style={{ borderTop: '1px solid #f1f5f9', fontSize: 13 }}>
                <td style={td}>
                  <Link to={`/work-orders/${wo.id}`} style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
                    {wo.ticketNumber}
                  </Link>
                </td>
                <td style={td}>{wo.title}</td>
                <td style={td}>{wo.clientName} <br /><span style={{ color: '#94a3b8', fontSize: 12 }}>{wo.siteName}</span></td>
                <td style={td}>{wo.technicianName || <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                <td style={td}><StatusBadge status={wo.status} /></td>
                <td style={td}><PriorityBadge priority={wo.priority} /></td>
                <td style={td}><SlaIndicator slaDueAt={wo.slaDueAt} slaBreached={wo.slaBreached} status={wo.status} /></td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 20, textAlign: 'center', color: '#94a3b8' }}>No work orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

const th: React.CSSProperties = { padding: '12px 16px', fontWeight: 600 };
const td: React.CSSProperties = { padding: '12px 16px', verticalAlign: 'top' };
