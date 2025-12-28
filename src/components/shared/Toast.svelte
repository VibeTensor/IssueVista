<!--
  Toast Component
  Issue #174 - Add toast notification after copy action

  Displays toast notifications with fade animation.
  Accessible with aria-live region for screen readers.
  Respects prefers-reduced-motion user preference.
-->

<script lang="ts">
  import { toasts, removeToast, type Toast } from '../../lib/toast';

  // Track timeouts for cleanup - using plain Map to avoid reactivity loops
  // SvelteMap would cause infinite $effect re-runs (read → write → re-trigger)
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  const timeouts = new Map<string, number>();

  /**
   * Set up auto-dismiss timer for a toast
   */
  function scheduleRemoval(toast: Toast) {
    // Skip if already scheduled
    if (timeouts.has(toast.id)) {
      return;
    }

    // Set timeout for auto-dismiss
    const timeoutId = window.setTimeout(() => {
      removeToast(toast.id);
      timeouts.delete(toast.id);
    }, toast.duration);

    timeouts.set(toast.id, timeoutId);
  }

  // Schedule removal for each toast when store updates
  $effect(() => {
    // Read toasts from store (this is the only reactive dependency)
    const currentToasts = $toasts;

    // Schedule removal for new toasts (non-reactive Map operations)
    currentToasts.forEach((toast) => {
      scheduleRemoval(toast);
    });
  });

  // Cleanup timeouts on component destroy
  $effect(() => {
    return () => {
      timeouts.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeouts.clear();
    };
  });
</script>

<!--
  aria-live="polite" ensures screen readers announce toasts without interrupting
  role="status" indicates advisory information
  Pre-rendered empty container for live region registration
-->
<div class="toast-container" aria-live="polite" role="status">
  {#each $toasts as toast (toast.id)}
    <div class="toast toast-{toast.type}">
      {#if toast.type === 'success'}
        <!-- Checkmark icon for success -->
        <svg
          class="toast-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M5 13l4 4L19 7"
          />
        </svg>
      {:else if toast.type === 'error'}
        <!-- X icon for error -->
        <svg
          class="toast-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      {:else}
        <!-- Info icon for info -->
        <svg
          class="toast-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      {/if}
      <span class="toast-message">{toast.message}</span>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 5rem;
    right: 1.25rem;
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    pointer-events: none;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    color: white;
    font-weight: 500;
    font-size: 0.875rem;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -4px rgba(0, 0, 0, 0.1);
    pointer-events: auto;
    animation: fadeIn 0.3s ease-out forwards;
  }

  .toast-success {
    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
  }

  .toast-error {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  }

  .toast-info {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }

  .toast-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  .toast-message {
    white-space: nowrap;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(0.5rem);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Responsive: adjust position on mobile */
  @media (max-width: 640px) {
    .toast-container {
      right: 1rem;
      left: 1rem;
      bottom: 4.5rem;
    }

    .toast {
      justify-content: center;
    }

    .toast-message {
      white-space: normal;
      text-align: center;
    }
  }

  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .toast {
      animation: none;
    }
  }
</style>
