/**
 * Longpress Svelte Action
 * Issue #139 - Quick Actions Context Menu
 *
 * Provides long-press detection for touch devices.
 * iOS doesn't fire contextmenu events, so we use touch events instead.
 * Dispatches a custom 'longpress' event after the specified duration.
 */

/**
 * Options for the longpress action
 */
export interface LongpressOptions {
  /** Duration in milliseconds before triggering longpress (default: 500) */
  duration?: number;
  /** Whether longpress is enabled (default: true) */
  enabled?: boolean;
}

/**
 * Default longpress duration in milliseconds
 */
const DEFAULT_DURATION = 500;

/**
 * Movement threshold in pixels - if touch moves more than this, cancel longpress
 */
const MOVE_THRESHOLD = 10;

/**
 * Svelte action for detecting long press on touch devices
 *
 * @param node - The HTML element to attach the action to
 * @param options - Configuration options for the longpress behavior
 * @returns Action methods for destroy and update
 *
 * @example
 * <div use:longpress={{ duration: 600 }} onlongpress={handleLongpress}>
 *   Long press me
 * </div>
 */
export function longpress(
  node: HTMLElement,
  options: LongpressOptions = {}
): { destroy: () => void; update: (options: LongpressOptions) => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let duration = options.duration ?? DEFAULT_DURATION;
  let enabled = options.enabled ?? true;
  let startX = 0;
  let startY = 0;

  /**
   * Clear any active timer
   */
  function clearTimer(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  /**
   * Handle touch start - begin timer
   */
  function handleTouchStart(event: TouchEvent): void {
    if (!enabled) return;

    // Store initial touch position
    const touch = event.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;

    clearTimer();
    timer = setTimeout(() => {
      // Dispatch custom longpress event with touch coordinates
      const customEvent = new CustomEvent('longpress', {
        bubbles: true,
        cancelable: true,
        detail: {
          clientX: startX,
          clientY: startY
        }
      });
      node.dispatchEvent(customEvent);
    }, duration);
  }

  /**
   * Handle touch end - clear timer
   */
  function handleTouchEnd(): void {
    clearTimer();
  }

  /**
   * Handle touch move - cancel if moved too far
   */
  function handleTouchMove(event: TouchEvent): void {
    if (timer === null) return;

    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - startX);
    const deltaY = Math.abs(touch.clientY - startY);

    // Cancel if finger moved too much
    if (deltaX > MOVE_THRESHOLD || deltaY > MOVE_THRESHOLD) {
      clearTimer();
    }
  }

  /**
   * Handle touch cancel - clear timer
   */
  function handleTouchCancel(): void {
    clearTimer();
  }

  // Attach event listeners
  node.addEventListener('touchstart', handleTouchStart, { passive: true });
  node.addEventListener('touchend', handleTouchEnd, { passive: true });
  node.addEventListener('touchmove', handleTouchMove, { passive: true });
  node.addEventListener('touchcancel', handleTouchCancel, { passive: true });

  return {
    /**
     * Clean up event listeners when element is destroyed
     */
    destroy(): void {
      clearTimer();
      node.removeEventListener('touchstart', handleTouchStart);
      node.removeEventListener('touchend', handleTouchEnd);
      node.removeEventListener('touchmove', handleTouchMove);
      node.removeEventListener('touchcancel', handleTouchCancel);
    },

    /**
     * Update options when they change
     */
    update(newOptions: LongpressOptions): void {
      duration = newOptions.duration ?? DEFAULT_DURATION;
      enabled = newOptions.enabled ?? true;

      // If disabled mid-press, clear the timer
      if (!enabled) {
        clearTimer();
      }
    }
  };
}
