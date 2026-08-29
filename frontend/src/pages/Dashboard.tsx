import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { DashboardStats, WorkOrder } from '../types';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { Link } from 'react-router-dom';

const PIE_COLORS = ['#2563eb', '#d97706', '#16a34a', '#334155', '#dc2626', '#9333ea', '#64748b'];

export default function Dashboard() {
const { user, hasRole } = useAuth();
const [stats, setStats] = useState<DashboardStats | null>(null);
const [myOrders, setMyOrders] = useState<WorkOrder[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
const load = async () => {
try {
if (hasRole('ADMIN', 'DISPATCHER')) {
const res = await api.get<DashboardStats>('/dashboard/stats');
setStats(res.data);
} else if (hasRole('CLIENT')) {
// client sees their own org's work orders - clientId assumed via server-side lookup in real deployment
const res = await api.get<WorkOrder[]>('/work-orders');
setMyOrders(res.data);
} else if (hasRole('TECHNICIAN')) {
const res = await api.get<WorkOrder[]>('/work-orders');
setMyOrders(res.data);
}
} catch {
// non-fatal for dashboard view
} finally {
setLoading(false);
}
};
load();
}, []);

return (
<Layout>
<h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Welcome back, {user?.fullName.split(' ')[0]}</h1>
<p style={{ color: '#64748b', marginBottom: 28 }}>Here's what's happening across your operations today.</p>

{loading && <div>Loading...</div>}  

  {!loading && hasRole('ADMIN', 'DISPATCHER') && stats && (  
    <>  
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 32 }}>  
        <StatCard label="Open" value={stats.totalOpen} color="#2563eb" />  
        <StatCard label="In Progress" value={stats.totalInProgress} color="#d97706" />  
        <StatCard label="Completed" value={stats.totalCompleted} color="#16a34a" />  
        <StatCard label="Closed" value={stats.totalClosed} color="#334155" />  
        <StatCard label="SLA Overdue" value={stats.totalOverdue} color="#dc2626" />  
      </div>  

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>  
        <Panel title="Work Orders by Status">  
          <ResponsiveContainer width="100%" height={280}>  
            <BarChart data={Object.entries(stats.byStatus).map(([k, v]) => ({ name: k.replace('_', ' '), count: v }))}>  
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />  
              <YAxis allowDecimals={false} />  
              <Tooltip />  
              <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />  
            </BarChart>  
          </ResponsiveContainer>  
        </Panel>  

        <Panel title="Work Orders by Priority">  
          <ResponsiveContainer width="100%" height={280}>  
            <PieChart>  
              <Pie  
                data={Object.entries(stats.byPriority).map(([k, v]) => ({ name: k, value: v }))}  
                dataKey="value"  
                nameKey="name"  
                cx="50%"  
                cy="50%"  
                outerRadius={90}  
                label  
              >  
                {Object.entries(stats.byPriority).map((_, idx) => (  
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />  
                ))}  
              </Pie>  
              <Legend />  
              <Tooltip />  
            </PieChart>  
          </ResponsiveContainer>  
        </Panel>  
      </div>  
    </>  
  )}  

  {!loading && hasRole('TECHNICIAN', 'CLIENT') && (  
    <Panel title={hasRole('TECHNICIAN') ? 'Recent Work Orders' : 'Your Service Requests'}>  
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>  
        <thead>  
          <tr style={{ textAlign: 'left', fontSize: 12, color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>  
            <th style={{ padding: '8px 0' }}>Ticket</th>  
            <th>Title</th>  
            <th>Status</th>  
            <th>Priority</th>  
          </tr>  
        </thead>  
        <tbody>  
          {myOrders.slice(0, 8).map((wo) => (  
            <tr key={wo.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>  
              <td style={{ padding: '10px 0' }}>  
                <Link to={`/work-orders/${wo.id}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>  
                  {wo.ticketNumber}  
                </Link>  
              </td>  
              <td>{wo.title}</td>  
              <td><StatusBadge status={wo.status} /></td>  
              <td><PriorityBadge priority={wo.priority} /></td>  
            </tr>  
          ))}  
          {myOrders.length === 0 && (  
            <tr><td colSpan={4} style={{ padding: '16px 0', color: '#94a3b8' }}>No work orders yet.</td></tr>  
          )}  
        </tbody>  
      </table>  
    </Panel>  
  )}  
</Layout>

);
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
return (
<div style={{ background: '#fff', borderRadius: 10, padding: '18px 16px', border: '1px solid #e2e8f0' }}>
<div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{label}</div>
<div style={{ fontSize: 26, fontWeight: 800, color }}>{value}</div>
</div>
);
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
return (
<div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e2e8f0' }}>
<div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>{title}</div>
{children}
</div>
);
}