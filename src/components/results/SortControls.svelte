<!--
  SortControls Component
  Issue #35 - Extracted from ResultsList.svelte

  Dropdown for sorting issues by comment count.
  Options: Default Order, Fewest Comments, Most Comments
-->

<script lang="ts">
  import type { CommentSortOrder } from '../../lib/issue-utils';

  interface Props {
    sortOrder: CommentSortOrder | 'default';
    onSortChange: (order: CommentSortOrder | 'default') => void;
  }

  let { sortOrder, onSortChange }: Props = $props();

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    onSortChange(target.value as CommentSortOrder | 'default');
  }
</script>

<div class="flex items-center gap-2" role="group" aria-labelledby="sort-label">
  <label for="sort-comments" id="sort-label" class="text-sm font-semibold text-slate-400"
    >Sort:</label
  >
  <select
    id="sort-comments"
    value={sortOrder}
    onchange={handleChange}
    class="sort-dropdown bg-slate-800 border border-slate-600 text-white text-sm font-semibold rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 outline-none cursor-pointer"
    aria-describedby="sort-description"
  >
    <option value="default">Default Order</option>
    <option value="asc">Fewest Comments</option>
    <option value="desc">Most Comments</option>
  </select>
  <span id="sort-description" class="sr-only">Sort issues by number of comments</span>
</div>

<style>
  /* Sort dropdown styles */
  .sort-dropdown {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }

  .sort-dropdown option {
    background: #1e293b;
    color: white;
  }

  /* Accessibility: Respect user's motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .sort-dropdown {
      transition: none;
    }
  }
</style>
