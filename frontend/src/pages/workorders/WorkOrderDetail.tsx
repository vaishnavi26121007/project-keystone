import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/axios';
import { WorkOrder, WorkOrderNote, Technician, TimeLogEntry, WorkOrderPartUsage, Part } from '../../types';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import SlaIndicator from '../../components/SlaIndicator';
import { useAuth } from '../../context/AuthContext';

const NEXT_STATUSES: Record<string, string[]> = {
  NEW: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
  ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
  COMPLETED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: []
};

export default function WorkOrderDetail() {
  const { id } = useParams();
  const { hasRole, user } = useAuth();
  const [wo, setWo] = useState<WorkOrder | null>(null);
  const [notes, setNotes] = useState<WorkOrderNote[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [newNote, setNewNote] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Time tracking
  const [myTechnicianId, setMyTechnicianId] = useState<number | null>(null);
  const [timeLogs, setTimeLogs] = useState<TimeLogEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimeLogEntry | null>(null);
  const [timerDescription, setTimerDescription] = useState('');

  // Parts usage
  const [partsUsed, setPartsUsed] = useState<WorkOrderPartUsage[]>([]);
  const [partsCatalog, setPartsCatalog] = useState<Part[]>([]);
  const [selectedPart, setSelectedPart] = useState('');
  const [partQty, setPartQty] = useState('1');

  const canTrackWork = hasRole('ADMIN', 'DISPATCHER', 'TECHNICIAN');

  const load = async () => {
    setLoading(true);
    try {
      const [woRes, notesRes] = await Promise.all([
        api.get<WorkOrder>(`/work-orders/${id}`),
        api.get<WorkOrderNote[]>(`/work-orders/${id}/notes`)
      ]);
      setWo(woRes.data);
      setNotes(notesRes.data);

      if (hasRole('ADMIN', 'DISPATCHER')) {
        const techRes = await api.get<Technician[]>('/technicians/available');
        setTechnicians(techRes.data);
      }

      if (canTrackWork) {
        const [timeLogsRes, partsRes, catalogRes] = await Promise.all([
          api.get<TimeLogEntry[]>(`/work-orders/${id}/timelogs`),
          api.get<WorkOrderPartUsage[]>(`/work-orders/${id}/parts`),
          api.get<Part[]>('/parts')
        ]);
        setTimeLogs(timeLogsRes.data);
        setPartsUsed(partsRes.data);
        setPartsCatalog(catalogRes.data);
      }

      if (hasRole('TECHNICIAN') && user) {
        try {
          const techRes = await api.get<Technician>(`/technicians/by-user/${user.userId}`);
          setMyTechnicianId(techRes.data.id);
          const activeRes = await api.get<TimeLogEntry>(`/work-orders/${id}/timer/active/${techRes.data.id}`);
          setActiveTimer(activeRes.status === 204 ? null : activeRes.data);
        } catch {
          setMyTechnicianId(null);
          setActiveTimer(null);
        }
      }
    } catch {
      setMessage('Failed to load work order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAssign = async () => {
    if (!selectedTech) return;
    try {
      await api.patch(`/work-orders/${id}/assign`, { technicianId: Number(selectedTech) });
      setMessage('Technician assigned.');
      load();
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to assign technician.');
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await api.patch(`/work-orders/${id}/status`, { status, note: statusNote || undefined });
      setStatusNote('');
      setMessage(`Status updated to ${status}.`);
      load();
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      await api.post(`/work-orders/${id}/notes`, { content: newNote });
      setNewNote('');
      load();
    } catch {
      setMessage('Failed to add note.');
    }
  };

  const handleStartTimer = async () => {
    if (!myTechnicianId) return;
    try {
      await api.post(`/work-orders/${id}/timer/start/${myTechnicianId}`, { workDescription: timerDescription || undefined });
      setTimerDescription('');
      setMessage('Timer started.');
      load();
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to start timer.');
    }
  };

  const handleStopTimer = async () => {
    if (!activeTimer) return;
    try {
      await api.post(`/work-orders/timer/${activeTimer.id}/stop`);
      setMessage('Timer stopped.');
      load();
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to stop timer.');
    }
  };

  const handleAddPart = async () => {
    if (!selectedPart || !partQty) return;
    try {
      await api.post(`/work-orders/${id}/parts`, { partId: Number(selectedPart), quantity: Number(partQty) });
      setSelectedPart('');
      setPartQty('1');
      setMessage('Part usage logged.');
      load();
    } catch (e: any) {
      setMessage(e.response?.data?.message || 'Failed to add part.');
    }
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;
  if (!wo) return <Layout><div>Work order not found.</div></Layout>;

  const nextOptions = NEXT_STATUSES[wo.status] || [];

  return (
    <Layout>
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{wo.ticketNumber}</h1>
          <StatusBadge status={wo.status} />
          <PriorityBadge priority={wo.priority} />
        </div>
        <p style={{ color: '#64748b', marginTop: 6 }}>{wo.title}</p>
      </div>

      {message && (
        <div style={{ background: '#eff6ff', color: '#1d4ed8', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Panel title="Details">
            <Row label="Description" value={wo.description || '—'} />
            <Row label="Client" value={wo.clientName || '—'} />
            <Row label="Site" value={wo.siteName || '—'} />
            <Row label="Asset" value={wo.assetName || '—'} />
            <Row label="Technician" value={wo.technicianName || 'Unassigned'} />
            <Row label="Created" value={new Date(wo.createdAt).toLocaleString()} />
            <Row label="SLA" value={<SlaIndicator slaDueAt={wo.slaDueAt} slaBreached={wo.slaBreached} status={wo.status} />} />
          </Panel>

          <Panel title="Activity & Notes">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 260, overflowY: 'auto', marginBottom: 12 }}>
              {notes.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13 }}>No activity yet.</div>}
              {notes.map((n) => (
                <div key={n.id} style={{ borderLeft: '3px solid #e2e8f0', paddingLeft: 10 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    {n.author?.fullName} · {new Date(n.createdAt).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 13 }}>{n.content}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13 }}
              />
              <button onClick={handleAddNote} style={btnSecondary}>Post</button>
            </div>
          </Panel>

          {canTrackWork && (
            <Panel title="Time Logged">
              {hasRole('TECHNICIAN') && myTechnicianId && (
                <div style={{ marginBottom: 14, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                  {activeTimer ? (
                    <>
                      <div style={{ fontSize: 13, marginBottom: 8, color: '#d97706', fontWeight: 600 }}>
                        ⏱ Timer running since {new Date(activeTimer.startTime).toLocaleTimeString()}
                        {activeTimer.workDescription ? ` — ${activeTimer.workDescription}` : ''}
                      </div>
                      <button onClick={handleStopTimer} style={{ ...btnPrimary, background: '#dc2626' }}>Stop Timer</button>
                    </>
                  ) : (
                    <>
                      <input
                        value={timerDescription}
                        onChange={(e) => setTimerDescription(e.target.value)}
                        placeholder="What are you working on? (optional)"
                        style={{ ...selectStyle, marginBottom: 8 }}
                      />
                      <button onClick={handleStartTimer} style={btnPrimary}>Start Timer</button>
                    </>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {timeLogs.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13 }}>No time logged yet.</div>}
                {timeLogs.map((t) => (
                  <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px solid #f1f5f9', paddingBottom: 6 }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{t.technicianName}</div>
                      <div style={{ color: '#94a3b8', fontSize: 12 }}>{t.workDescription || '—'}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {t.running
                        ? <span style={{ color: '#d97706', fontWeight: 600 }}>Running</span>
                        : <span>{t.durationMinutes?.toFixed(0)} min</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {canTrackWork && (
            <Panel title="Parts Used">
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <select value={selectedPart} onChange={(e) => setSelectedPart(e.target.value)} style={{ ...selectStyle, flex: 2 }}>
                  <option value="">Select part...</option>
                  {partsCatalog.map((p) => (
                    <option key={p.id} value={p.id} disabled={p.quantityInStock === 0}>
                      {p.name} ({p.quantityInStock} in stock)
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={partQty}
                  onChange={(e) => setPartQty(e.target.value)}
                  style={{ ...selectStyle, flex: 1 }}
                />
                <button onClick={handleAddPart} style={btnSecondary}>Add</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {partsUsed.length === 0 && <div style={{ color: '#94a3b8', fontSize: 13 }}>No parts used yet.</div>}
                {partsUsed.map((p) => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>{p.partName} × {p.quantityUsed}</span>
                    <span style={{ fontWeight: 600 }}>${p.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {hasRole('ADMIN', 'DISPATCHER') && wo.status === 'NEW' && (
            <Panel title="Dispatch">
              <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)} style={selectStyle}>
                <option value="">Select technician...</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.user.fullName} ({t.specialization})</option>
                ))}
              </select>
              <button onClick={handleAssign} style={{ ...btnPrimary, marginTop: 10, width: '100%' }}>Assign Technician</button>
            </Panel>
          )}

          {(hasRole('ADMIN', 'DISPATCHER', 'TECHNICIAN')) && nextOptions.length > 0 && (
            <Panel title="Update Status">
              <input
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Optional note..."
                style={{ ...selectStyle, marginBottom: 10 }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {nextOptions.map((s) => (
                  <button key={s} onClick={() => handleStatusChange(s)} style={btnSecondary}>
                    Mark as {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </Panel>
          )}

          <Panel title="Ticket Info">
            <Row label="Ticket #" value={wo.ticketNumber} />
            <Row label="Created" value={new Date(wo.createdAt).toLocaleDateString()} />
            {wo.completedAt && <Row label="Completed" value={new Date(wo.completedAt).toLocaleDateString()} />}
          </Panel>
        </div>
      </div>
    </Layout>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: 20, border: '1px solid #e2e8f0' }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
      <span style={{ color: '#64748b' }}>{label}</span>
      <span style={{ fontWeight: 500, textAlign: 'right', maxWidth: '65%' }}>{value}</span>
    </div>
  );
}

const selectStyle: React.CSSProperties = { width: '100%', padding: '9px 10px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: 13, boxSizing: 'border-box' };
const btnPrimary: React.CSSProperties = { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, padding: '9px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
const btnSecondary: React.CSSProperties = { background: '#f1f5f9', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: 6, padding: '9px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
