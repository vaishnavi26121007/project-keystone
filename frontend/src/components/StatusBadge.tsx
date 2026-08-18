import React from 'react';
import { WorkOrderStatus } from '../types';

const COLORS: Record<WorkOrderStatus, string> = {
  NEW: '#64748b',
  ASSIGNED: '#2563eb',
  IN_PROGRESS: '#d97706',
  ON_HOLD: '#9333ea',
  COMPLETED: '#16a34a',
  CLOSED: '#334155',
  CANCELLED: '#dc2626'
};

export default function StatusBadge({ status }: { status: WorkOrderStatus }) {
  return (
    <span
      style={{
        backgroundColor: COLORS[status] + '20',
        color: COLORS[status],
        border: `1px solid ${COLORS[status]}55`,
        borderRadius: '999px',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap'
      }}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
