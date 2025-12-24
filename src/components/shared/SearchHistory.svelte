<!--
  SearchHistory Component
  Issue #62 - Search history dropdown with localStorage persistence

  Displays recent search history items with ability to:
  - Click to re-search a repository
  - Delete individual items
  - Clear all history
  - Navigate with keyboard (arrow keys, Enter, Escape)
-->

<script lang="ts">
  import type { SearchHistoryItem } from '../../lib/types/results';
  import { formatRelativeTime } from '../../lib/search-history';

  interface Props {
    items: SearchHistoryItem[];
    show: boolean;
    onSelect: (item: SearchHistoryItem) => void;
    onDelete: (owner: string, repo: string) => void;
    onClear: () => void;
    onClose: () => void;
  }

  let { items, show, onSelect, onDelete, onClear, onClose }: Props = $props();

  // Keyboard navigation state
  let selectedIndex = $state(-1);
  let listElement: HTMLUListElement | null = null;

  // Reset selection when items change or dropdown opens/closes
  $effect(() => {
    if (show) {
      selectedIndex = -1;
    }
  });

  /**
   * Handle keyboard navigation
   */
  function handleKeydown(event: KeyboardEvent) {
    if (!show || items.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
        scrollToSelected();
        break;
      case 'ArrowUp':
        event.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, 0);
        scrollToSelected();
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < items.length) {
          onSelect(items[selectedIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
    }
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

{#if show && items.length > 0}
  <div class="search-history-dropdown" role="listbox" aria-label="Recent searches">
    <!-- Header -->
    <div class="dropdown-header">
      <span class="header-title">Recent Searches</span>
      <button
        type="button"
        class="clear-all-btn"
        onclick={onClear}
        aria-label="Clear all search history"
      >
        Clear all
      </button>
    </div>

    <!-- History Items -->
    <ul class="history-list" bind:this={listElement}>
      {#each items as item, index (item.owner + '/' + item.repo)}
        <li
          class="history-item"
          class:selected={index === selectedIndex}
          onmouseenter={() => (selectedIndex = index)}
          role="option"
          aria-selected={index === selectedIndex}
        >
          <button type="button" class="item-content" onclick={() => onSelect(item)}>
            <!-- GitHub icon -->
            <svg class="github-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
              />
            </svg>

            <div class="item-details">
              <span class="repo-name">{item.owner}/{item.repo}</span>
              <span class="item-meta">
                <span class="time">{formatRelativeTime(item.lastSearched)}</span>
                {#if item.issueCount !== undefined}
                  <span class="separator">-</span>
                  <span class="issue-count">{item.issueCount} issues</span>
                {/if}
                {#if item.searchCount > 1}
                  <span class="separator">-</span>
                  <span class="search-count">{item.searchCount}x</span>
                {/if}
              </span>
            </div>
          </button>

          <!-- Delete button -->
          <button
            type="button"
            class="delete-btn"
            onclick={(e) => handleDelete(e, item)}
            aria-label="Remove {item.owner}/{item.repo} from history"
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
</style>
