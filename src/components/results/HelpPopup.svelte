<!--
  HelpPopup Component
  Issue #35 - Extracted from ResultsList.svelte

  Modal overlay displaying how-to guide for using IssueVista.
  Includes step-by-step instructions for GitHub token creation.
-->

<script lang="ts">
  interface Props {
    show: boolean;
    onClose: () => void;
  }

  let { show, onClose }: Props = $props();
  let closeButtonRef: HTMLButtonElement | null = $state(null);
  let ctaButtonRef: HTMLButtonElement | null = $state(null);

  /**
   * Handle keyboard events on backdrop - close on Escape, trap focus on Tab
   */
  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }

    // Focus trap: Tab cycles between close button and CTA button
    if (event.key === 'Tab' && closeButtonRef && ctaButtonRef) {
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        // Shift+Tab: if on first element, go to last
        if (activeElement === closeButtonRef) {
          event.preventDefault();
          ctaButtonRef.focus();
        }
      } else {
        // Tab: if on last element, go to first
        if (activeElement === ctaButtonRef) {
          event.preventDefault();
          closeButtonRef.focus();
        }
      }
    }
  }

  // Focus management: focus close button when dialog opens
  $effect(() => {
    if (show && closeButtonRef) {
      // Small delay to ensure element is rendered
      requestAnimationFrame(() => {
        closeButtonRef.focus();
      });
    }
  });

  /**
   * Global keydown handler for ESC key - works regardless of focus location
   * Note: svelte:window must be at top level, not inside blocks, so we check show here
   */
  function handleGlobalKeydown(event: KeyboardEvent) {
    if (show && event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    }
  }
</script>

<!-- Global ESC key handler - closes modal from anywhere when visible -->
<svelte:window onkeydown={handleGlobalKeydown} />

{#if show}
  <!-- Backdrop -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
    onclick={onClose}
    onkeydown={handleBackdropKeydown}
  >
    <!-- Outer wrapper: dialog container with proper accessibility -->
    <div
      class="help-popup-wrapper sketch-container max-w-md w-full max-h-[85vh] md:max-h-[75vh] rounded-xl overflow-hidden m-4"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-dialog-title"
    >
      <!-- Inner scrollable container - only scroll when needed -->
      <div class="help-popup-scroll h-full max-h-[85vh] md:max-h-[75vh] overflow-y-auto">
        <!-- Header -->
        <div
          class="help-popup-header sticky top-0 backdrop-blur px-3 py-2.5 flex items-center justify-between z-10"
        >
          <div class="flex items-center gap-2 min-w-0">
            <div
              class="help-popup-step-badge w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm"
            >
              <svg
                class="help-popup-icon-white w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 id="help-dialog-title" class="help-popup-text-primary text-base font-bold truncate">
              How It Works
            </h2>
          </div>
          <button
            bind:this={closeButtonRef}
            onclick={onClose}
            class="help-popup-close-btn w-8 h-8 rounded-md flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg
              class="help-popup-icon-muted w-5 h-5 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="help-popup-content px-3 py-2 space-y-2">
          <!-- Step 1: Authentication -->
          <div class="sketch-card p-2.5">
            <div class="flex items-start gap-2">
              <div
                class="help-popup-step-badge flex-shrink-0 w-5 h-5 rounded flex items-center justify-center font-bold text-xs shadow-sm"
              >
                1
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="help-popup-text-primary text-xs font-bold mb-1">
                  Authentication (Optional)
                </h3>
                <p class="help-popup-text-muted text-[11px] mb-1.5">
                  Without token: 60 req/hr · With token: 5000 req/hr
                </p>

                <!-- Token Generation - Collapsed -->
                <details class="help-popup-details rounded p-2">
                  <summary class="help-popup-link text-[11px] cursor-pointer"
                    >How to create a token →</summary
                  >
                  <ol
                    class="mt-1.5 space-y-1 text-[11px] help-popup-text-secondary list-decimal list-inside"
                  >
                    <li>
                      Click <a
                        href="https://github.com/settings/tokens/new?description=IssueVista&scopes=public_repo"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="help-popup-link underline">this link</a
                      >
                    </li>
                    <li>Check <span class="help-popup-text-primary">"public_repo"</span> scope</li>
                    <li>Click <span class="text-green-400">"Generate token"</span></li>
                    <li>Copy & paste in the field above</li>
                  </ol>
                </details>
              </div>
            </div>
          </div>

          <!-- Step 2: Enter Repository URL -->
          <div class="sketch-card p-2.5">
            <div class="flex items-start gap-2">
              <div
                class="help-popup-step-badge flex-shrink-0 w-5 h-5 rounded flex items-center justify-center font-bold text-xs shadow-sm"
              >
                2
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="help-popup-text-primary text-xs font-bold">Enter Repository URL</h3>
                <p class="help-popup-text-muted text-[11px]">https://github.com/owner/repo</p>
              </div>
            </div>
          </div>

          <!-- Step 3: Find Issues -->
          <div class="sketch-card p-2.5">
            <div class="flex items-start gap-2">
              <div
                class="help-popup-step-badge flex-shrink-0 w-5 h-5 rounded flex items-center justify-center font-bold text-xs shadow-sm"
              >
                3
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="help-popup-text-primary text-xs font-bold">Find Issues</h3>
                <p class="help-popup-text-muted text-[11px]">
                  Filters: open, unassigned, no linked PRs
                </p>
              </div>
            </div>
          </div>

          <!-- Step 4: Start Contributing -->
          <div class="sketch-card p-2.5">
            <div class="flex items-start gap-2">
              <div
                class="help-popup-step-badge flex-shrink-0 w-5 h-5 rounded flex items-center justify-center font-bold text-xs shadow-sm"
              >
                4
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="help-popup-text-primary text-xs font-bold">Start Contributing</h3>
                <p class="help-popup-text-muted text-[11px]">Click "View" to open on GitHub</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="help-popup-footer sticky bottom-0 backdrop-blur px-3 py-2.5">
          <button
            bind:this={ctaButtonRef}
            onclick={onClose}
            class="help-popup-cta-btn w-full py-2 px-4 rounded font-semibold text-xs transition-all duration-200"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Theme-aware color classes */

  .help-popup-header {
    background: var(--theme-bg-primary);
    border-bottom: 1px solid var(--theme-border);
  }

  .help-popup-content {
    background: var(--theme-bg-primary);
  }

  .help-popup-footer {
    background: var(--theme-bg-primary);
    border-top: 1px solid var(--theme-border);
  }

  .help-popup-text-primary {
    color: var(--theme-text-primary);
  }

  .help-popup-text-secondary {
    color: var(--theme-text-secondary);
  }

  .help-popup-text-muted {
    color: var(--theme-text-muted);
  }

  .help-popup-step-badge {
    background: var(--theme-accent);
    color: var(--theme-text-primary);
  }

  .help-popup-close-btn:hover {
    background: var(--theme-bg-tertiary);
  }

  .help-popup-icon-muted {
    color: var(--theme-text-muted);
  }

  .help-popup-icon-muted:hover {
    color: var(--theme-text-primary);
  }

  .help-popup-icon-white {
    color: var(--theme-text-primary);
  }

  .help-popup-details {
    background: var(--theme-bg-secondary);
  }

  .help-popup-link {
    color: var(--theme-accent);
  }

  .help-popup-link:hover {
    color: var(--theme-accent-hover);
  }

  .help-popup-cta-btn {
    background: var(--theme-accent);
    color: var(--theme-text-primary);
  }

  .help-popup-cta-btn:hover {
    background: var(--theme-accent-hover);
  }

  /* Custom scrollbar for help popup - inset from edges */
  .help-popup-scroll {
    scrollbar-width: thin;
    scrollbar-color: var(--theme-border) transparent;
    /* Add padding to keep scrollbar inside rounded area */
    padding-right: 4px;
  }

  .help-popup-scroll::-webkit-scrollbar {
    width: 8px;
  }

  .help-popup-scroll::-webkit-scrollbar-track {
    background: transparent;
    /* Inset from top and bottom to stay within rounded corners */
    margin: 12px 4px;
    border-radius: 100px;
  }

  .help-popup-scroll::-webkit-scrollbar-thumb {
    background: var(--theme-border);
    border-radius: 100px;
    /* Create inset effect - transparent border clips the thumb */
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  .help-popup-scroll::-webkit-scrollbar-thumb:hover {
    background: var(--theme-text-muted);
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  /* Scrollbar corner (where horizontal and vertical meet) */
  .help-popup-scroll::-webkit-scrollbar-corner {
    background: transparent;
  }

  /* Smooth scrolling */
  .help-popup-scroll {
    scroll-behavior: smooth;
  }
</style>
