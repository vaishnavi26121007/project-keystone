import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { WorkOrder, Technician } from '../../types';
import Layout from '../../components/Layout';
import PriorityBadge from '../../components/PriorityBadge';
import SlaIndicator from '../../components/SlaIndicator';

const COLUMNS: { status: string; label: string }[] = [
  { status: 'NEW', label: 'New / Unassigned' },
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'ON_HOLD', label: 'On Hold' },
  { status: 'COMPLETED', label: 'Completed' }
];

export default function DispatchBoard() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [woRes, techRes] = await Promise.all([
        api.get<WorkOrder[]>('/work-orders'),
        api.get<Technician[]>('/technicians')
      ]);
      setOrders(woRes.data);
      setTechnicians(techRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Layout>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Dispatch Board</h1>
      <p style={{ color: '#64748b', marginBottom: 20 }}>
        {technicians.filter((t) => t.availability === 'AVAILABLE').length} technicians available ·{' '}
        {technicians.filter((t) => t.availability === 'ON_JOB').length} on job
      </p>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`, gap: 14 }}>
          {COLUMNS.map((col) => {
            const items = orders.filter((o) => o.status === col.status);
            return (
              <div key={col.status} style={{ background: '#f1f5f9', borderRadius: 10, padding: 12, minHeight: 300 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                  <span>{col.label}</span>
                  <span style={{ color: '#94a3b8' }}>{items.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((wo) => (
                    <Link
                      key={wo.id}
                      to={`/work-orders/${wo.id}`}
                      style={{
                        display: 'block',
                        background: '#fff',
                        borderRadius: 8,
                        padding: '10px 12px',
                        border: '1px solid #e2e8f0',
                        textDecoration: 'none',
                        color: '#0f172a'
                      }}
                    >
                      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>{wo.ticketNumber}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{wo.title}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <PriorityBadge priority={wo.priority} />
                      </div>
                      <div style={{ marginTop: 6 }}>
                        <SlaIndicator slaDueAt={wo.slaDueAt} slaBreached={wo.slaBreached} status={wo.status} />
                      </div>
                      {wo.technicianName && (
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>👤 {wo.technicianName}</div>
                      )}
                    </Link>
                  ))}
                  {items.length === 0 && <div style={{ fontSize: 12, color: '#cbd5e1', textAlign: 'center', padding: '20px 0' }}>Empty</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}
