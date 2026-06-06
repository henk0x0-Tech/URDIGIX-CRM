import React from 'react';
import Badge from '../ui/Badge';

export interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase().replace('_', ' ');

  const getVariant = (): 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (normalized) {
      case 'ACTIVE':
      case 'COMPLETED':
      case 'PAID':
      case 'SUCCESS':
      case 'ONLINE':
        return 'success';
      case 'PLANNING':
      case 'PENDING':
      case 'ON HOLD':
      case 'PROSPECT':
      case 'AWAY':
      case 'TODO':
        return 'warning';
      case 'BLOCKED':
      case 'CANCELLED':
      case 'FAILED':
      case 'OVERDUE':
      case 'TERMINATED':
      case 'DANGER':
        return 'danger';
      case 'IN PROGRESS':
      case 'SENT':
      case 'VIEWED':
      case 'PARTIALLY PAID':
      case 'IN REVIEW':
        return 'info';
      default:
        return 'default';
    }
  };

  return <Badge variant={getVariant()}>{normalized}</Badge>;
};

export default StatusBadge;
