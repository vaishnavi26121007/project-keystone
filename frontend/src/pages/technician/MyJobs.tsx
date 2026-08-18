import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { WorkOrder, Technician } from '../../types';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaIndicator from '../../components/SlaIndicator';
import { useAuth } from '../../context/AuthContext';

export default function MyJobs() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const techRes = await api.get<Technician>(`/technicians/by-user/${user?.userId}`);
        const woRes = await api.get<WorkOrder[]>(`/work-orders/technician/${techRes.data.id}`);
        setOrders(woRes.data);
      } catch {
        // no technician profile yet, or no jobs
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  const active = orders.filter((o) => !['CLOSED', 'CANCELLED'].includes(o.status));
  const past = orders.filter((o) => ['CLOSED', 'CANCELLED'].includes(o.status));

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>My Jobs</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Work orders assigned to you.</p>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <SectionTitle>Active ({active.length})</SectionTitle>
          <JobGrid orders={active} />

          <SectionTitle>Completed / Closed ({past.length})</SectionTitle>
          <JobGrid orders={past} />
        </>
      )}
    </Layout>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontWeight: 700, fontSize: 14, margin: '20px 0 10px' }}>{children}</div>;
}

function JobGrid({ orders }: { orders: WorkOrder[] }) {
  if (orders.length === 0) return <div style={{ color: '#94a3b8', fontSize: 13 }}>None</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
      {orders.map((wo) => (
        <Link key={wo.id} to={`/work-orders/${wo.id}`} style={{ display: 'block', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, textDecoration: 'none', color: '#0f172a' }}>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{wo.ticketNumber}</div>
          <div style={{ fontWeight: 600, fontSize: 14, margin: '4px 0 8px' }}>{wo.title}</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <StatusBadge status={wo.status} />
            <PriorityBadge priority={wo.priority} />
          </div>
          <div style={{ fontSize: 12, color: '#64748b' }}>{wo.siteName}</div>
          <div style={{ marginTop: 8 }}>
            <SlaIndicator slaDueAt={wo.slaDueAt} slaBreached={wo.slaBreached} status={wo.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
