/**
 * Toast Store
 * Issue #174 - Add toast notification after copy action
 *
 * Provides a global toast notification system using Svelte writable store.
 * Toasts auto-dismiss after a configurable duration.
 */

import { writable } from 'svelte/store';

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'info' | 'error';

/**
 * Toast notification data structure
 */
export interface Toast {
  /** Unique identifier for the toast */
  id: string;
  /** Message to display */
  message: string;
  /** Type of toast (affects styling) */
  type: ToastType;
  /** Duration in milliseconds before auto-dismiss */
  duration: number;
}

/**
 * Default toast duration in milliseconds
 */
const DEFAULT_DURATION = 2000;

/**
 * Generate a unique ID for each toast
 * Uses crypto.randomUUID if available, falls back to timestamp + random
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Writable store containing array of active toasts
 */
export const toasts = writable<Toast[]>([]);

/**
 * Add a new toast notification
 * @param message - Text to display in the toast
 * @param type - Toast type ('success', 'info', 'error')
 * @param duration - Time in ms before auto-dismiss (default: 2000)
 * @returns The ID of the created toast
 */
export function addToast(
  message: string,
  type: ToastType = 'success',
  duration: number = DEFAULT_DURATION
): string {
  const id = generateId();

  const toast: Toast = {
    id,
    message,
    type,
    duration
  };

  toasts.update((all) => [...all, toast]);

  return id;
}

/**
 * Remove a toast by its ID
 * @param id - The toast ID to remove
 */
export function removeToast(id: string): void {
  toasts.update((all) => all.filter((t) => t.id !== id));
}

/**
 * Convenience function to show a "Copied!" toast
 * Used by copy button components across the application
 */
export function showCopiedToast(): void {
  addToast('Copied to clipboard!', 'success', DEFAULT_DURATION);
}
