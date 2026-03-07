<!--
  CancelConfirmModal Component
  Issue #23 - Loading progress with cancel confirmation

  Features:
  - Confirmation dialog before cancelling search
  - Shows count of issues loaded so far
  - Continue (safer default) and Cancel buttons
  - Focus trap and keyboard navigation
  - WCAG 2.1 accessible (role="dialog", aria attributes)
  - Escape key closes modal (treats as Continue)
  - Click outside closes modal (treats as Continue)
  - Respects prefers-reduced-motion
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  /**
   * Props Interface
   */
  interface Props {
    /** Whether modal is visible */
    show: boolean;
    /** Number of issues loaded so far */
    issuesLoaded: number;
    /** Callback when user confirms cancel */
    onConfirm: () => void;
    /** Callback when user chooses to continue */
    onContinue: () => void;
  }

  let { show, issuesLoaded, onConfirm, onContinue }: Props = $props();

  // Reference to the continue button for auto-focus
  let continueButtonRef: HTMLButtonElement | null = null;

  // Handle keyboard events
  function handleKeydown(event: KeyboardEvent) {
    if (!show) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      onContinue(); // Escape = Continue (safer default)
    }

    // Focus trap: Tab cycles between Continue and Cancel buttons
    if (event.key === 'Tab') {
      const focusableElements = document.querySelectorAll('.cancel-modal button:not([disabled])');
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift+Tab: going backwards
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: going forwards
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }
  }

  // Handle click outside modal
  function handleBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      onContinue(); // Click outside = Continue (safer default)
    }
  }

  // Focus the continue button when modal opens
  $effect(() => {
    if (show && continueButtonRef) {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        continueButtonRef?.focus();
      });
    }
  });

  // Add/remove global keydown listener
  onMount(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeydown);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeydown);
    }
  });
</script>

{#if show}
  <!-- Modal Backdrop -->
  <div class="modal-backdrop" onclick={handleBackdropClick} role="presentation">
    <!-- Modal Dialog -->
    <div
      class="cancel-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
      aria-describedby="cancel-modal-description"
    >
      <!-- Warning Icon -->
      <div class="modal-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <!-- Title -->
      <h2 id="cancel-modal-title" class="modal-title">Cancel Search?</h2>

      <!-- Issues Count Info Box -->
      <div class="issues-info">
        <svg class="info-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fill-rule="evenodd"
            d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"
            clip-rule="evenodd"
          />
        </svg>
        <span>
          <strong>{issuesLoaded}</strong> issue{issuesLoaded !== 1 ? 's' : ''} loaded so far
        </span>
      </div>

      <!-- Description -->
      <p id="cancel-modal-description" class="modal-description">
        {#if issuesLoaded > 0}
          You can view these partial results or continue loading more issues.
        {:else}
          No issues have been loaded yet. Continue loading to find available issues.
        {/if}
      </p>

      <!-- Action Buttons -->
      <div class="modal-actions">
        <button
          type="button"
          class="btn-continue"
          onclick={onContinue}
          bind:this={continueButtonRef}
        >
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clip-rule="evenodd"
            />
          </svg>
          Continue Loading
        </button>

        <button type="button" class="btn-cancel" onclick={onConfirm}>
          <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          {issuesLoaded > 0 ? 'Yes, Show Results' : 'Yes, Cancel'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Modal Backdrop */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    animation: backdrop-fade-in 0.2s ease-out;
  }

  @keyframes backdrop-fade-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Modal Dialog */
  .cancel-modal {
    background: var(--theme-bg-card);
    backdrop-filter: blur(16px);
    border-radius: 16px;
    padding: 1.5rem;
    max-width: 360px;
    width: 100%;
    position: relative;
    box-shadow: 0 20px 60px var(--theme-shadow);
    animation: modal-enter 0.2s ease-out;
  }

  .cancel-modal::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: transparent;
    border: 2px solid var(--theme-border);
    border-radius: inherit;
    filter: url(#sketch);
    pointer-events: none;
  }

  @keyframes modal-enter {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* Warning Icon */
  .modal-icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 1rem;
    padding: 0.75rem;
    background: rgba(251, 191, 36, 0.15);
    border-radius: 50%;
    color: #fbbf24;
  }

  .modal-icon svg {
    width: 100%;
    height: 100%;
  }

  /* Title */
  .modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--theme-text-primary);
    text-align: center;
    margin: 0 0 1rem 0;
  }

  /* Issues Info Box */
  .issues-info {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: var(--theme-bg-tertiary);
    border-radius: 8px;
    margin-bottom: 1rem;
    font-size: 0.875rem;
    color: var(--theme-text-muted);
  }

  .issues-info strong {
    color: var(--theme-text-primary);
    font-weight: 700;
  }

  .info-icon {
    width: 1.125rem;
    height: 1.125rem;
    color: var(--theme-accent);
    flex-shrink: 0;
  }

  /* Description */
  .modal-description {
    font-size: 0.875rem;
    color: var(--theme-text-muted);
    text-align: center;
    line-height: 1.5;
    margin: 0 0 1.25rem 0;
  }

  /* Action Buttons */
  .modal-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .btn-continue,
  .btn-cancel {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 600;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 100%;
  }

  .btn-icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
  }

  /* Continue Button (primary, safer default) */
  .btn-continue {
    color: white;
    background: var(--theme-accent);
    border: none;
  }

  .btn-continue:hover {
    background: var(--theme-accent-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px var(--theme-shadow);
  }

  .btn-continue:focus-visible {
    outline: 2px solid var(--theme-accent);
    outline-offset: 2px;
  }

  /* Cancel Button (secondary, destructive action) */
  .btn-cancel {
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
  }

  .btn-cancel:hover {
    background: rgba(251, 191, 36, 0.2);
    border-color: rgba(251, 191, 36, 0.5);
  }

  .btn-cancel:focus-visible {
    outline: 2px solid #fbbf24;
    outline-offset: 2px;
  }

  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .modal-backdrop {
      animation: none;
    }

    .cancel-modal {
      animation: none;
    }

    .btn-continue,
    .btn-cancel {
      transition: none;
    }

    .btn-continue:hover {
      transform: none;
    }
  }

  /* Tablet+ */
  @media (min-width: 768px) {
    .cancel-modal {
      padding: 2rem;
      max-width: 400px;
    }

    .modal-title {
      font-size: 1.375rem;
    }

    .modal-actions {
      flex-direction: row;
    }

    .btn-continue,
    .btn-cancel {
      flex: 1;
    }
  }
</style>
