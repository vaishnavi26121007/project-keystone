import React from 'react';

export default function SlaIndicator({ slaDueAt, slaBreached, status }: { slaDueAt: string; slaBreached: boolean; status: string }) {
  const isTerminal = status === 'CLOSED' || status === 'CANCELLED' || status === 'COMPLETED';
  const due = new Date(slaDueAt);
  const now = new Date();
  const hoursLeft = (due.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (slaBreached) {
    return <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '12px' }}>⚠ SLA breached</span>;
  }
  if (isTerminal) {
    return <span style={{ color: '#16a34a', fontSize: '12px' }}>✓ Met SLA</span>;
  }
  if (hoursLeft < 0) {
    return <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '12px' }}>⚠ Overdue</span>;
  }
  if (hoursLeft < 4) {
    return <span style={{ color: '#d97706', fontWeight: 600, fontSize: '12px' }}>⏱ {hoursLeft.toFixed(1)}h left</span>;
  }
  return <span style={{ color: '#64748b', fontSize: '12px' }}>Due {due.toLocaleString()}</span>;
}
