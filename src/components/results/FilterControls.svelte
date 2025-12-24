<!--
  FilterControls Component
  Issue #35 - Extracted from ResultsList.svelte

  Toggle for filtering to show only "Easy Issues" (zero comments).
  Displays count badge when easy issues are available.
-->

<script lang="ts">
  interface Props {
    enabled: boolean;
    zeroCommentCount: number;
    onToggle: (enabled: boolean) => void;
  }

  let { enabled, zeroCommentCount, onToggle }: Props = $props();

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    onToggle(target.checked);
  }
</script>

<label
  class="filter-toggle-container flex items-center gap-3 cursor-pointer select-none"
  id="easy-issues-toggle-label"
>
  <div class="relative">
    <input
      type="checkbox"
      checked={enabled}
      onchange={handleChange}
      class="sr-only peer"
      id="easy-issues-toggle"
      aria-describedby="easy-issues-description"
      role="switch"
      aria-checked={enabled}
    />
    <div
      class="toggle-track w-11 h-6 bg-slate-700 rounded-full peer-checked:bg-green-500 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-green-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-900"
      aria-hidden="true"
    ></div>
    <div
      class="toggle-knob absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"
      aria-hidden="true"
    ></div>
  </div>
  <span class="text-sm font-semibold text-slate-200">
    Easy Issues Only
    {#if zeroCommentCount > 0}
      <span
        class="ml-1.5 px-2 py-0.5 text-xs font-bold bg-green-500 text-white rounded-full"
        aria-label="{zeroCommentCount} easy issues available"
      >
        {zeroCommentCount}
      </span>
    {/if}
  </span>
</label>
<span id="easy-issues-description" class="sr-only"
  >Filter to show only issues with zero comments, which are easier for new contributors</span
>

<style>
  /* Filter toggle styles */
  .filter-toggle-container {
    padding: 0.5rem 1rem;
    background: rgba(51, 65, 85, 0.5);
    border-radius: 0.75rem;
    border: 1px solid rgba(71, 85, 105, 0.5);
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;
  }

  .filter-toggle-container:hover {
    background: rgba(51, 65, 85, 0.7);
    border-color: rgba(71, 85, 105, 0.8);
  }

  .toggle-track {
    position: relative;
    transition: background-color 0.2s ease;
  }

  .toggle-knob {
    pointer-events: none;
    transition: transform 0.2s ease;
  }

  /* Accessibility: Respect user's motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .toggle-track,
    .toggle-knob,
    .filter-toggle-container {
      transition: none;
    }
  }
</style>
