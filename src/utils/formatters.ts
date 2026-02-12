/**
 * DODO App - Formatter Utilities
 * Common formatting functions for UI display
 */

import { DiscountType } from '../types/database.types';

/**
 * Format discount value based on type
 * @param type - 'percentage' or 'fixed'
 * @param value - Discount value
 * @returns Formatted string (e.g., "25%" or "₪50")
 */
export function formatDiscount(type: DiscountType, value: number): string {
  if (type === 'percentage') {
    return `${value}%`;
  }
  return `₪${value}`;
}

/**
 * Format discount with label for display
 * @param type - 'percentage' or 'fixed'
 * @param value - Discount value
 * @returns Formatted string with "הנחה" (e.g., "25% הנחה")
 */
export function formatDiscountWithLabel(type: DiscountType, value: number): string {
  const formattedValue = formatDiscount(type, value);
  return `${formattedValue} הנחה`;
}

/**
 * Format date to Hebrew locale format (DD/MM/YYYY)
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format date with time
 * @param dateString - ISO date string
 * @returns Formatted date and time string
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Check if a date has expired
 * @param dateString - ISO date string
 * @returns True if date is in the past
 */
export function isExpired(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
}

/**
 * Get days until expiration
 * @param dateString - ISO date string
 * @returns Number of days (negative if expired)
 */
export function getDaysUntilExpiration(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Format expiration date with "פג תוקף" label
 * @param dateString - ISO date string
 * @returns Formatted string (e.g., "פג תוקף: 31/12/2024")
 */
export function formatExpiration(dateString: string): string {
  return `פג תוקף: ${formatDate(dateString)}`;
}

/**
 * Truncate string with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}
