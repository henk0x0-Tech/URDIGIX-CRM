/**
 * Format a number as Indian Rupee currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'iso' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    case 'long':
      return d.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    case 'iso':
      return d.toISOString().split('T')[0] ?? d.toISOString();
    default:
      return d.toLocaleDateString('en-IN');
  }
}

/**
 * Get a color based on status string
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    // General
    ACTIVE: '#22c55e',
    INACTIVE: '#6b7280',
    BLOCKED: '#ef4444',
    PROSPECT: '#3b82f6',

    // Project
    PLANNING: '#8b5cf6',
    IN_PROGRESS: '#f59e0b',
    ON_HOLD: '#f97316',
    COMPLETED: '#22c55e',
    CANCELLED: '#ef4444',
    ARCHIVED: '#6b7280',

    // Task
    TODO: '#6b7280',
    IN_REVIEW: '#8b5cf6',

    // Invoice
    DRAFT: '#6b7280',
    SENT: '#3b82f6',
    VIEWED: '#8b5cf6',
    PARTIALLY_PAID: '#f59e0b',
    PAID: '#22c55e',
    OVERDUE: '#ef4444',
    REFUNDED: '#f97316',

    // Payment
    PENDING: '#f59e0b',
    FAILED: '#ef4444',

    // Employee
    ON_LEAVE: '#f59e0b',
    RESIGNED: '#6b7280',
    TERMINATED: '#ef4444',
    PROBATION: '#8b5cf6',
  };

  return colorMap[status] ?? '#6b7280';
}

/**
 * Generate a prefixed ID string (e.g., INV-00001)
 */
export function generateId(prefix: string, sequence: number, padLength: number = 5): string {
  return `${prefix}-${String(sequence).padStart(padLength, '0')}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Calculate percentage with optional decimal places
 */
export function calculatePercentage(value: number, total: number, decimals: number = 1): number {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(decimals));
}
