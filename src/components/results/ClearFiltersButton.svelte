<!--
  ClearFiltersButton Component
  Issue #35 - Extracted from ResultsList.svelte

  Button to reset all active filters and sort options.
  Only visible when filters are active.
-->

<script lang="ts">
  interface Props {
    visible: boolean;
    onClear: () => void;
  }

  let { visible, onClear }: Props = $props();
</script>

{#if visible}
  <button
    type="button"
    onclick={onClear}
    class="clear-filters-btn text-sm font-semibold focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 rounded-md px-2 py-1 transition-colors flex items-center gap-1.5"
    style="color: var(--theme-text-muted); --tw-ring-offset-color: var(--theme-bg-primary);"
    aria-label="Clear all active filters and reset to default"
  >
    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
    Clear Filters
  </button>
{/if}

<style>
  .clear-filters-btn:hover,
  .clear-filters-btn:focus-visible {
    color: var(--theme-text-primary);
  }
</style>
