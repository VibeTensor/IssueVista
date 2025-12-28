<!--
  FilterHelpTooltip Component
  Issue #121 - Advanced Search Filters with Boolean Operators

  Accessible help popover for filter syntax with examples.
  WCAG 1.4.13 compliant: dismissible (Escape), hoverable, persistent.
-->

<script lang="ts">
  interface Props {
    /** Whether the tooltip is visible */
    show?: boolean;
    /** Callback to close the tooltip */
    onClose?: () => void;
  }

  let { show = $bindable(false), onClose }: Props = $props();

  let tooltipRef = $state<HTMLDivElement | null>(null);
  let triggerRef = $state<HTMLButtonElement | null>(null);

  // Unique ID for aria-describedby
  const tooltipId = `filter-help-${Math.random().toString(36).substring(2, 9)}`;

  /**
   * Toggle tooltip visibility
   */
  function toggleTooltip(): void {
    show = !show;
    if (!show) {
      onClose?.();
    }
  }

  /**
   * Close the tooltip
   */
  function closeTooltip(): void {
    show = false;
    onClose?.();
    // Return focus to trigger
    triggerRef?.focus();
  }

  /**
   * Handle keyboard events for accessibility
   */
  function handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && show) {
      event.preventDefault();
      closeTooltip();
    }
  }

  /**
   * Handle click outside to close
   */
  function handleClickOutside(event: MouseEvent): void {
    const target = event.target as Node;
    if (tooltipRef && triggerRef && !tooltipRef.contains(target) && !triggerRef.contains(target)) {
      closeTooltip();
    }
  }

  // Add global event listeners when tooltip is shown
  $effect(() => {
    if (show) {
      document.addEventListener('keydown', handleKeydown);
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  });
</script>

<!-- Trigger button -->
<button
  bind:this={triggerRef}
  type="button"
  class="help-trigger flex items-center justify-center w-6 h-6 rounded-full
         text-slate-400 hover:text-slate-300 hover:bg-slate-700/50
         focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1 focus:ring-offset-slate-900
         transition-colors"
  onclick={toggleTooltip}
  aria-describedby={show ? tooltipId : undefined}
  aria-expanded={show}
  aria-label="Filter syntax help"
  title="Filter syntax help"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="h-4 w-4"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fill-rule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
      clip-rule="evenodd"
    />
  </svg>
</button>

<!-- Modal dialog - rendered at document body level for proper centering -->
{#if show}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onclick={closeTooltip}
    onkeydown={handleKeydown}
  >
    <div
      bind:this={tooltipRef}
      id={tooltipId}
      role="dialog"
      aria-modal="true"
      aria-labelledby="filter-help-title"
      class="help-modal w-full max-w-sm p-4 rounded-xl
               bg-slate-800 border border-slate-600 shadow-2xl shadow-black/50
               text-sm text-slate-300"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Header -->
      <div class="flex items-center justify-between mb-3">
        <h3 id="filter-help-title" class="font-semibold text-white">Filter Syntax Help</h3>
        <button
          type="button"
          class="close-btn p-1 rounded hover:bg-slate-700
                   focus:outline-none focus:ring-1 focus:ring-teal-500
                   text-slate-400 hover:text-slate-300 transition-colors"
          onclick={closeTooltip}
          aria-label="Close help"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>

      <!-- Operators section -->
      <div class="operators mb-4">
        <h4 class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Operators</h4>
        <div class="space-y-1.5">
          <div class="flex items-start gap-2">
            <code class="px-1.5 py-0.5 rounded bg-slate-700 text-teal-400 text-xs font-mono"
              >AND</code
            >
            <span class="text-slate-400">Space between filters</span>
          </div>
          <div class="flex items-start gap-2">
            <code class="px-1.5 py-0.5 rounded bg-slate-700 text-teal-400 text-xs font-mono"
              >OR</code
            >
            <span class="text-slate-400">Comma between filters</span>
          </div>
          <div class="flex items-start gap-2">
            <code class="px-1.5 py-0.5 rounded bg-slate-700 text-teal-400 text-xs font-mono"
              >NOT</code
            >
            <span class="text-slate-400">Dash prefix (-)</span>
          </div>
        </div>
      </div>

      <!-- Examples section -->
      <div class="examples mb-4">
        <h4 class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Examples</h4>
        <div class="space-y-2">
          <div>
            <code class="block px-2 py-1 rounded bg-slate-900/50 text-xs font-mono text-slate-300">
              label:bug label:help-wanted
            </code>
            <p class="text-xs text-slate-500 mt-0.5">Issues with both labels</p>
          </div>
          <div>
            <code class="block px-2 py-1 rounded bg-slate-900/50 text-xs font-mono text-slate-300">
              label:bug,good-first-issue
            </code>
            <p class="text-xs text-slate-500 mt-0.5">Issues with either label</p>
          </div>
          <div>
            <code class="block px-2 py-1 rounded bg-slate-900/50 text-xs font-mono text-slate-300">
              -author:dependabot
            </code>
            <p class="text-xs text-slate-500 mt-0.5">Exclude bot authors</p>
          </div>
        </div>
      </div>

      <!-- Filter types section -->
      <div class="filter-types mb-3">
        <h4 class="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
          Filter Types
        </h4>
        <div class="flex flex-wrap gap-1">
          {#each ['label', 'author', 'state', 'is', 'assignee'] as filterType (filterType)}
            <code class="px-1.5 py-0.5 rounded bg-slate-700 text-xs font-mono text-slate-300">
              {filterType}:
            </code>
          {/each}
        </div>
      </div>

      <!-- Footer with link -->
      <div class="footer pt-3 border-t border-slate-700">
        <a
          href="https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 transition-colors"
        >
          <span>GitHub Search Docs</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3 w-3"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"
            />
            <path
              d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"
            />
          </svg>
        </a>
      </div>

      <!-- Keyboard hint -->
      <p class="text-xs text-slate-500 mt-2">
        Press <kbd class="px-1 py-0.5 rounded bg-slate-700 text-slate-400 font-mono">Esc</kbd> to close
      </p>
    </div>
  </div>
{/if}
