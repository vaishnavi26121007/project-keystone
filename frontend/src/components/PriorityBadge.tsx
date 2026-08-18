import React from 'react';
import { Priority } from '../types';

const COLORS: Record<Priority, string> = {
  LOW: '#16a34a',
  MEDIUM: '#2563eb',
  HIGH: '#d97706',
  CRITICAL: '#dc2626'
};

export default function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      style={{
        color: COLORS[priority],
        fontWeight: 700,
        fontSize: '12px',
        letterSpacing: '0.03em'
      }}
    >
      ● {priority}
    </span>
  );
}
