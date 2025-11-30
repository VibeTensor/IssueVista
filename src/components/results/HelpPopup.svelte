<!--
  HelpPopup Component
  Issue #35 - Extracted from ResultsList.svelte

  Modal overlay displaying how-to guide for using IssueFlow.
  Includes step-by-step instructions for GitHub token creation.
-->

<script lang="ts">
  interface Props {
    show: boolean;
    onClose: () => void;
  }

  let { show, onClose }: Props = $props();
  let closeButtonRef: HTMLButtonElement | null = $state(null);

  /**
   * Handle keyboard events on backdrop - close on Escape
   */
  function handleBackdropKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  // Focus management: focus close button when dialog opens
  $effect(() => {
    if (show && closeButtonRef) {
      // Small delay to ensure element is rendered
      requestAnimationFrame(() => {
        closeButtonRef?.focus();
      });
    }
  });
</script>

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
        <div class="sticky top-0 bg-slate-900/98 backdrop-blur px-3 py-2.5 flex items-center justify-between border-b border-slate-700/50 z-10">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-teal-500 to-teal-600 shadow-sm shadow-teal-500/20">
              <svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 id="help-dialog-title" class="text-base font-bold text-white truncate">How It Works</h2>
          </div>
          <button
            bind:this={closeButtonRef}
            onclick={onClose}
            class="w-8 h-8 rounded-md hover:bg-slate-700/50 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <svg class="w-5 h-5 text-slate-400 hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="px-3 py-2 space-y-2 bg-slate-900/95">
          <!-- Step 1: Authentication -->
          <div class="sketch-card p-2.5">
            <div class="flex items-start gap-2">
              <div class="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-teal-500 to-teal-600 rounded flex items-center justify-center font-bold text-white text-xs shadow-sm shadow-teal-500/20">1</div>
              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-bold text-white mb-1">Authentication (Optional)</h3>
                <p class="text-slate-400 text-[11px] mb-1.5">Without token: 60 req/hr · With token: 5000 req/hr</p>

                <!-- Token Generation - Collapsed -->
                <details class="bg-slate-800/40 rounded p-2">
                  <summary class="text-[11px] text-teal-400 cursor-pointer hover:text-teal-300">How to create a token →</summary>
                  <ol class="mt-1.5 space-y-1 text-[11px] text-slate-300 list-decimal list-inside">
                    <li>Click <a href="https://github.com/settings/tokens/new?description=IssueFlow&scopes=public_repo" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">this link</a></li>
                    <li>Check <span class="text-white">"public_repo"</span> scope</li>
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
              <div class="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-teal-500 to-teal-600 rounded flex items-center justify-center font-bold text-white text-xs shadow-sm shadow-teal-500/20">2</div>
              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-bold text-white">Enter Repository URL</h3>
                <p class="text-slate-400 text-[11px]">https://github.com/owner/repo</p>
              </div>
            </div>
          </div>

          <!-- Step 3: Find Issues -->
          <div class="sketch-card p-2.5">
            <div class="flex items-start gap-2">
              <div class="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-teal-500 to-teal-600 rounded flex items-center justify-center font-bold text-white text-xs shadow-sm shadow-teal-500/20">3</div>
              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-bold text-white">Find Issues</h3>
                <p class="text-slate-400 text-[11px]">Filters: open, unassigned, no linked PRs</p>
              </div>
            </div>
          </div>

          <!-- Step 4: Start Contributing -->
          <div class="sketch-card p-2.5">
            <div class="flex items-start gap-2">
              <div class="flex-shrink-0 w-5 h-5 bg-gradient-to-br from-teal-500 to-teal-600 rounded flex items-center justify-center font-bold text-white text-xs shadow-sm shadow-teal-500/20">4</div>
              <div class="flex-1 min-w-0">
                <h3 class="text-xs font-bold text-white">Start Contributing</h3>
                <p class="text-slate-400 text-[11px]">Click "View" to open on GitHub</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-slate-900/98 backdrop-blur px-3 py-2.5 border-t border-slate-700/50">
          <button
            onclick={onClose}
            class="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-2 px-4 rounded font-semibold text-xs hover:from-teal-400 hover:to-teal-500 shadow-sm shadow-teal-500/25 transition-all duration-200"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Custom scrollbar for help popup - inset from edges */
  .help-popup-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 116, 139, 0.3) transparent;
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
    background: rgba(100, 116, 139, 0.4);
    border-radius: 100px;
    /* Create inset effect - transparent border clips the thumb */
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  .help-popup-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.6);
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
