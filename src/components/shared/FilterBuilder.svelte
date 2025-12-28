<!--
  FilterBuilder Component
  Issue #121 - Advanced Search Filters with Boolean Operators

  Visual filter builder with chip-based interface for creating search filters.
  Supports bidirectional sync between chips and query string.
-->

<script lang="ts">
  import {
    type FilterChip,
    type FilterType,
    FILTER_TYPE_LABELS,
    generateChipId
  } from '../../lib/types/filters';
  import { parseFilterQuery, chipsToQuery } from '../../lib/filter-parser';

  interface Props {
    /** Current filter chips */
    chips?: FilterChip[];
    /** Callback when chips change */
    onChipsChange?: (chips: FilterChip[]) => void;
    /** Current filter query string */
    query?: string;
    /** Callback when query changes */
    onQueryChange?: (query: string) => void;
    /** Whether the component is disabled */
    disabled?: boolean;
  }

  let {
    chips = $bindable([]),
    onChipsChange,
    query = $bindable(''),
    onQueryChange,
    disabled = false
  }: Props = $props();

  // Local state
  let showAddMenu = $state(false);
  let selectedFilterType = $state<FilterType | null>(null);
  let filterValueInput = $state('');
  let isNegated = $state(false);
  let valueInputRef = $state<HTMLInputElement | null>(null);

  // Filter types for the dropdown
  const filterTypes: FilterType[] = ['label', 'author', 'state', 'is', 'assignee'];

  // Sync chips to query when chips change externally
  $effect(() => {
    const newQuery = chipsToQuery(chips);
    if (newQuery !== query) {
      query = newQuery;
      onQueryChange?.(newQuery);
    }
  });

  /**
   * Add a new filter chip
   */
  function addChip(): void {
    if (!selectedFilterType || !filterValueInput.trim()) return;

    const value = filterValueInput.trim();
    const displayLabel = isNegated
      ? `NOT ${selectedFilterType}:${value}`
      : `${selectedFilterType}:${value}`;

    const newChip: FilterChip = {
      id: generateChipId(),
      filterType: selectedFilterType,
      value,
      negated: isNegated,
      displayLabel
    };

    chips = [...chips, newChip];
    onChipsChange?.(chips);

    // Update query string
    const newQuery = chipsToQuery(chips);
    query = newQuery;
    onQueryChange?.(newQuery);

    // Reset input state
    resetAddForm();
  }

  /**
   * Remove a filter chip by ID
   */
  function removeChip(chipId: string): void {
    chips = chips.filter((c) => c.id !== chipId);
    onChipsChange?.(chips);

    // Update query string
    const newQuery = chipsToQuery(chips);
    query = newQuery;
    onQueryChange?.(newQuery);
  }

  /**
   * Handle filter type selection from dropdown
   */
  function selectFilterType(type: FilterType): void {
    selectedFilterType = type;
    // Focus the value input after selection
    setTimeout(() => {
      valueInputRef?.focus();
    }, 0);
  }

  /**
   * Reset the add filter form
   */
  function resetAddForm(): void {
    showAddMenu = false;
    selectedFilterType = null;
    filterValueInput = '';
    isNegated = false;
  }

  /**
   * Handle keyboard navigation in the add menu
   */
  function handleAddMenuKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      resetAddForm();
    } else if (event.key === 'Enter' && selectedFilterType && filterValueInput.trim()) {
      event.preventDefault();
      addChip();
    }
  }

  /**
   * Parse query string and update chips
   * @internal Reserved for future use when query input is added
   */
  function _syncFromQuery(queryString: string): void {
    const result = parseFilterQuery(queryString);
    if (result.success && result.chips.length > 0) {
      chips = result.chips;
      onChipsChange?.(chips);
    }
  }
</script>

<div class="filter-builder flex flex-wrap items-center gap-2">
  <!-- Existing filter chips -->
  <div role="list" class="contents" aria-label="Active filters">
    {#each chips as chip (chip.id)}
      <div
        class="filter-chip group flex items-center gap-1 px-2 py-1 rounded-md text-sm
               {chip.negated
          ? 'bg-red-900/30 border border-red-700/50 text-red-300'
          : 'bg-slate-700/50 border border-slate-600 text-slate-300'}
               hover:bg-slate-600/50 transition-colors"
        role="listitem"
      >
        <span class="chip-label">{chip.displayLabel}</span>
        <button
          type="button"
          class="chip-remove ml-1 p-0.5 rounded hover:bg-slate-500/50
                 focus:outline-none focus:ring-1 focus:ring-teal-500
                 opacity-60 group-hover:opacity-100 transition-opacity"
          onclick={() => removeChip(chip.id)}
          aria-label="Remove filter: {chip.displayLabel}"
          {disabled}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-3.5 w-3.5"
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
          <span class="sr-only">Remove filter</span>
        </button>
      </div>
    {/each}
  </div>

  <!-- Add filter button -->
  <div>
    <button
      type="button"
      class="add-filter-btn flex items-center gap-1 px-2 py-1 rounded-md text-sm
             bg-slate-800/50 border border-slate-600 border-dashed
             text-slate-400 hover:text-slate-300 hover:border-slate-500
             focus:outline-none focus:ring-1 focus:ring-teal-500
             transition-colors"
      onclick={(e) => {
        e.stopPropagation();
        showAddMenu = true;
      }}
      {disabled}
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
          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span>Add Filter</span>
    </button>
  </div>
</div>

<!-- Add filter modal - rendered at document body level for proper centering -->
{#if showAddMenu}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onclick={resetAddForm}
    onkeydown={handleAddMenuKeydown}
  >
    <div
      class="add-filter-menu flex flex-wrap items-center gap-2 p-3 rounded-lg
             bg-slate-800 border border-slate-600 shadow-2xl shadow-black/50
             max-w-md w-full"
      role="dialog"
      aria-modal="true"
      aria-label="Add filter"
      onclick={(e) => e.stopPropagation()}
    >
      <!-- Negation toggle -->
      <button
        type="button"
        class="negate-btn px-2 py-1 rounded text-xs font-medium flex-shrink-0
             {isNegated
          ? 'bg-red-900/50 text-red-300 border border-red-700'
          : 'bg-slate-700 text-slate-400 border border-slate-600'}
             hover:bg-slate-600 focus:outline-none focus:ring-1 focus:ring-teal-500
             transition-colors"
        onclick={() => (isNegated = !isNegated)}
        aria-pressed={isNegated}
        title="Toggle NOT operator"
      >
        NOT
      </button>

      <!-- Filter type dropdown -->
      {#if !selectedFilterType}
        <div class="filter-type-select flex flex-wrap gap-1">
          {#each filterTypes as type (type)}
            <button
              type="button"
              class="type-btn px-2 py-1 rounded text-xs
                   bg-slate-700 text-slate-300 border border-slate-600
                   hover:bg-slate-600 hover:text-white
                   focus:outline-none focus:ring-1 focus:ring-teal-500
                   transition-colors"
              onclick={() => selectFilterType(type)}
            >
              {FILTER_TYPE_LABELS[type]}
            </button>
          {/each}
        </div>
      {:else}
        <!-- Selected type and value input -->
        <span
          class="selected-type px-2 py-1 rounded text-xs font-medium flex-shrink-0
               bg-teal-900/50 text-teal-300 border border-teal-700"
        >
          {FILTER_TYPE_LABELS[selectedFilterType]}:
        </span>

        <input
          bind:this={valueInputRef}
          bind:value={filterValueInput}
          type="text"
          class="value-input px-2 py-1 rounded text-sm w-28 sm:w-32 min-w-0
               bg-slate-900 text-white border border-slate-600
               focus:outline-none focus:ring-1 focus:ring-teal-500
               placeholder:text-slate-500"
          placeholder={selectedFilterType === 'state'
            ? 'open or closed'
            : selectedFilterType === 'is'
              ? 'open, closed, issue, pr'
              : 'Enter value...'}
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addChip();
            }
          }}
        />

        <button
          type="button"
          class="confirm-btn px-2 py-1 rounded text-xs flex-shrink-0
               bg-teal-600 text-white
               hover:bg-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-400
               transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onclick={addChip}
          disabled={!filterValueInput.trim()}
        >
          Add
        </button>
      {/if}

      <!-- Cancel button -->
      <button
        type="button"
        class="cancel-btn p-1 rounded text-slate-400 flex-shrink-0
             hover:text-slate-300 hover:bg-slate-700
             focus:outline-none focus:ring-1 focus:ring-teal-500
             transition-colors"
        onclick={resetAddForm}
        aria-label="Cancel"
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
  </div>
{/if}
