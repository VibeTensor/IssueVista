<!--
  SearchHistory Component
  Issue #62 - Search history dropdown with localStorage persistence
  Issue #129 - Intelligent autocomplete with filtering and popular repos

  Displays search suggestions combining history with popular repos:
  - Click to re-search a repository
  - Delete individual items
  - Clear all history
  - Navigate with keyboard (arrow keys, Enter, Escape)
  - Filter suggestions while typing (prefix match)
  - Highlight matching text in suggestions
-->

<script lang="ts">
  /* eslint-disable svelte/no-at-html-tags */
  import type { SearchHistoryItem } from '../../lib/types/results';
  import { formatRelativeTime, downloadExport } from '../../lib/search-history';
  import {
    type AutocompleteSuggestion,
    rankSuggestions,
    highlightMatch
  } from '../../lib/autocomplete-utils';

  interface Props {
    items: SearchHistoryItem[];
    show: boolean;
    onSelect: (item: SearchHistoryItem) => void;
    onDelete: (owner: string, repo: string) => void;
    onClear: () => void;
    onClose: () => void;
    /** Text to filter suggestions by (Issue #129) */
    filterText?: string;
  }

  let { items, show, onSelect, onDelete, onClear, onClose, filterText = '' }: Props = $props();

  /**
   * Filtered and ranked suggestions combining history with popular repos
   * Uses $derived for reactive updates when items or filterText change
   */
  let filteredSuggestions = $derived<AutocompleteSuggestion[]>(rankSuggestions(items, filterText));

  /**
   * Check if we have any suggestions to show (history or popular)
   */
  let hasSuggestions = $derived(filteredSuggestions.length > 0);

  /**
   * Determine if we're in "zero state" (no filter text, showing all history)
   */
  let isZeroState = $derived(!filterText || filterText.trim() === '');

  // Keyboard navigation state
  let selectedIndex = $state(-1);
  let listElement: HTMLUListElement | null = null;

  // Reset selection when suggestions change or dropdown opens/closes
  $effect(() => {
    if (show || filteredSuggestions) {
      selectedIndex = -1;
    }
  });

  /**
   * Handle keyboard navigation
   */
  function handleKeydown(event: KeyboardEvent) {
    if (!show || !hasSuggestions) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, filteredSuggestions.length - 1);
        scrollToSelected();
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        scrollToSelected();
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSuggestionSelect(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
  }

  /**
   * Handle selection of a suggestion (converts AutocompleteSuggestion to SearchHistoryItem format)
   */
  function handleSuggestionSelect(suggestion: AutocompleteSuggestion) {
    // Convert suggestion to SearchHistoryItem format for compatibility
    const item: SearchHistoryItem = {
      owner: suggestion.owner,
      repo: suggestion.repo,
      fullUrl: suggestion.fullUrl,
      lastSearched: suggestion.lastSearched || new Date().toISOString(),
      searchCount: suggestion.searchCount || 1,
      issueCount: suggestion.issueCount
    };
    onSelect(item);
  }

  /**
   * Scroll to keep selected item visible
   */
  function scrollToSelected() {
    if (listElement && selectedIndex >= 0) {
      const selectedElement = listElement.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }

  /**
   * Handle delete button click
   */
  function handleDelete(event: MouseEvent, item: SearchHistoryItem) {
    event.stopPropagation();
    onDelete(item.owner, item.repo);
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<!-- Screen reader live region for announcing results count (Issue #129) -->
<div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
  {#if show && filterText && filterText.trim().length > 0}
    {#if hasSuggestions}
      {filteredSuggestions.length} suggestion{filteredSuggestions.length === 1 ? '' : 's'} available
    {:else}
      No matching repositories found
    {/if}
  {/if}
</div>

{#if show && hasSuggestions}
  <div
    class="search-history-dropdown"
    role="listbox"
    aria-label="Search suggestions"
    id="search-history-listbox"
  >
    <!-- Header -->
    <div class="dropdown-header">
      <span class="header-title">{isZeroState ? 'Recent Searches' : 'Suggestions'}</span>
      <div class="header-actions">
        {#if isZeroState && items.length > 0}
          <div class="export-group" role="group" aria-label="Export search history">
            <button
              type="button"
              class="export-btn"
              onclick={() => downloadExport('json')}
              aria-label="Export search history as JSON"
            >
              JSON
            </button>
            <button
              type="button"
              class="export-btn"
              onclick={() => downloadExport('csv')}
              aria-label="Export search history as CSV"
            >
              CSV
            </button>
          </div>
          <button
            type="button"
            class="clear-all-btn"
            onclick={onClear}
            aria-label="Clear all search history"
          >
            Clear all
          </button>
        {/if}
      </div>
    </div>

    <!-- Suggestion Items -->
    <ul class="history-list" bind:this={listElement}>
      {#each filteredSuggestions as suggestion, index (suggestion.displayName)}
        <li
          class="history-item"
          class:selected={index === selectedIndex}
          onmouseenter={() => (selectedIndex = index)}
          role="option"
          aria-selected={index === selectedIndex}
        >
          <button
            type="button"
            class="item-content"
            onclick={() => handleSuggestionSelect(suggestion)}
          >
            <!-- Icon based on suggestion type -->
            {#if suggestion.type === 'history'}
              <!-- Clock icon for history items -->
              <svg
                class="type-icon history-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            {:else}
              <!-- Fire/trending icon for popular items -->
              <svg
                class="type-icon popular-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
                />
              </svg>
            {/if}

            <div class="item-details">
              <!-- Safe: highlightMatch() escapes HTML before inserting <mark> tags -->
              <span class="repo-name"
                >{@html highlightMatch(suggestion.displayName, filterText)}</span
              >
              <span class="item-meta">
                {#if suggestion.type === 'history' && suggestion.lastSearched}
                  <span class="time">{formatRelativeTime(suggestion.lastSearched)}</span>
                  {#if suggestion.issueCount !== undefined}
                    <span class="separator">-</span>
                    <span class="issue-count">{suggestion.issueCount} issues</span>
                  {/if}
                  {#if suggestion.searchCount && suggestion.searchCount > 1}
                    <span class="separator">-</span>
                    <span class="search-count">{suggestion.searchCount}x</span>
                  {/if}
                {:else}
                  <span class="popular-label">Popular</span>
                {/if}
              </span>
            </div>
          </button>

          <!-- Delete button (only for history items) -->
          {#if suggestion.type === 'history'}
            <button
              type="button"
              class="delete-btn"
              onclick={(e) => {
                e.stopPropagation();
                onDelete(suggestion.owner, suggestion.repo);
              }}
              aria-label="Remove {suggestion.displayName} from history"
            >
              <svg
                class="delete-icon"
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
          {/if}
        </li>
      {/each}
    </ul>

    <!-- Keyboard hint -->
    <div class="keyboard-hint">
      <kbd>↑</kbd><kbd>↓</kbd> to navigate
      <kbd>Enter</kbd> to select
      <kbd>Esc</kbd> to close
    </div>
  </div>
{:else if show && !hasSuggestions && filterText && filterText.trim().length > 0}
  <!-- No matches empty state (Issue #129) -->
  <div class="search-history-dropdown no-matches" role="status">
    <div class="no-matches-content">
      <svg
        class="no-matches-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      <span class="no-matches-text">No matching repositories</span>
      <span class="no-matches-hint">Try a different search term</span>
    </div>
  </div>
{/if}

<style>
  .search-history-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 0.25rem;
    background: rgba(30, 41, 59, 0.98);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    z-index: 50;
    overflow: hidden;
  }

  .dropdown-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
    background: rgba(51, 65, 85, 0.3);
  }

  .header-title {
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94a3b8;
  }

  .header-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .export-group {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    padding-right: 0.5rem;
    border-right: 1px solid rgba(71, 85, 105, 0.3);
  }

  .export-btn {
    font-size: 0.5625rem;
    font-weight: 500;
    color: #14b8a6;
    background: transparent;
    border: 1px solid rgba(20, 184, 166, 0.3);
    cursor: pointer;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    transition: all 0.15s ease;
  }

  .export-btn:hover {
    color: #2dd4bf;
    background: rgba(20, 184, 166, 0.1);
    border-color: rgba(20, 184, 166, 0.5);
  }

  .clear-all-btn {
    font-size: 0.625rem;
    font-weight: 500;
    color: #f87171;
    background: transparent;
    border: none;
    cursor: pointer;
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    transition: all 0.15s ease;
  }

  .clear-all-btn:hover {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }

  .history-list {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 240px;
    overflow-y: auto;
  }

  .history-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0;
    background: transparent;
    transition: background-color 0.15s ease;
  }

  .history-item:hover,
  .history-item.selected {
    background: rgba(51, 65, 85, 0.5);
  }

  .item-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex: 1;
    min-width: 0;
    padding: 0.5rem 0.75rem;
    padding-right: 0.25rem;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
  }

  .github-icon {
    width: 1rem;
    height: 1rem;
    color: #64748b;
    flex-shrink: 0;
  }

  .item-details {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    min-width: 0;
  }

  .repo-name {
    font-size: 0.75rem;
    font-weight: 500;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-meta {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.625rem;
    color: #64748b;
  }

  .separator {
    color: #475569;
  }

  .time {
    color: #64748b;
  }

  .issue-count {
    color: #14b8a6;
  }

  .search-count {
    color: #94a3b8;
  }

  .delete-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    opacity: 0;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .history-item:hover .delete-btn,
  .history-item.selected .delete-btn {
    opacity: 1;
  }

  .delete-btn:hover {
    background: rgba(239, 68, 68, 0.2);
  }

  .delete-icon {
    width: 0.75rem;
    height: 0.75rem;
    color: #94a3b8;
  }

  .delete-btn:hover .delete-icon {
    color: #f87171;
  }

  .keyboard-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.375rem;
    border-top: 1px solid rgba(71, 85, 105, 0.3);
    background: rgba(51, 65, 85, 0.2);
    font-size: 0.5625rem;
    color: #64748b;
  }

  .keyboard-hint kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 1rem;
    padding: 0.125rem 0.25rem;
    background: rgba(71, 85, 105, 0.4);
    border: 1px solid rgba(100, 116, 139, 0.3);
    border-radius: 0.1875rem;
    font-family: inherit;
    font-size: 0.5rem;
    color: #94a3b8;
  }

  /* Scrollbar styling */
  .history-list::-webkit-scrollbar {
    width: 4px;
  }

  .history-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .history-list::-webkit-scrollbar-thumb {
    background: rgba(71, 85, 105, 0.5);
    border-radius: 2px;
  }

  .history-list::-webkit-scrollbar-thumb:hover {
    background: rgba(100, 116, 139, 0.6);
  }

  /* Type icons for suggestions (Issue #129) */
  .type-icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  .history-icon {
    color: #64748b;
  }

  .popular-icon {
    color: #f59e0b;
  }

  .popular-label {
    color: #f59e0b;
    font-weight: 500;
  }

  /* Autocomplete highlight styling (Issue #129) */
  :global(.autocomplete-highlight) {
    background-color: rgba(20, 184, 166, 0.3);
    border-radius: 2px;
    padding: 0 1px;
    color: #2dd4bf;
  }

  /* No matches empty state (Issue #129) */
  .no-matches {
    padding: 1rem;
  }

  .no-matches-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    text-align: center;
  }

  .no-matches-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: #475569;
  }

  .no-matches-text {
    font-size: 0.75rem;
    font-weight: 500;
    color: #94a3b8;
  }

  .no-matches-hint {
    font-size: 0.625rem;
    color: #64748b;
  }

  /* Screen reader only utility (Issue #129) */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
