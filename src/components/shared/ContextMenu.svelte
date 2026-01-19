<!--
  ContextMenu Component
  Issue #139 - Quick Actions Context Menu

  A floating context menu for issue cards with quick actions:
  - Copy Link: Copy issue URL to clipboard
  - Open in New Tab: Open issue in new browser tab
  - Bookmark: Toggle bookmark state for the issue

  Supports:
  - Right-click trigger (desktop)
  - Long-press trigger (touch devices)
  - Keyboard navigation (Arrow keys, Enter, Escape)
  - Viewport edge detection to prevent clipping
-->

<script lang="ts">
  import type { GitHubIssue } from '../../lib/github-graphql';
  import { isBookmarked, toggleBookmark } from '../../lib/bookmarks-store';

  interface Props {
    /** X coordinate for menu positioning */
    x: number;
    /** Y coordinate for menu positioning */
    y: number;
    /** The issue to perform actions on */
    issue: GitHubIssue;
    /** Callback to close the menu */
    onClose: () => void;
  }

  let { x, y, issue, onClose }: Props = $props();

  // Menu element reference for positioning calculations
  let menuRef: HTMLDivElement | null = $state(null);

  // Track bookmark state reactively
  let bookmarked = $state(isBookmarked(issue.url));

  // Adjusted position to keep menu in viewport
  let adjustedX = $state(x);
  let adjustedY = $state(y);

  // Track focused menu item index for keyboard navigation
  let focusedIndex = $state(0);

  // Menu items configuration
  const menuItems = [
    { id: 'copy', label: 'Copy Link', icon: 'link' },
    { id: 'open', label: 'Open in New Tab', icon: 'external' },
    { id: 'bookmark', label: bookmarked ? 'Remove Bookmark' : 'Add Bookmark', icon: 'star' }
  ];

  /**
   * Calculate adjusted position to keep menu within viewport
   */
  $effect(() => {
    if (menuRef) {
      const rect = menuRef.getBoundingClientRect();
      const padding = 8;

      // Adjust X if menu would overflow right edge
      if (x + rect.width > window.innerWidth - padding) {
        adjustedX = Math.max(padding, window.innerWidth - rect.width - padding);
      } else {
        adjustedX = x;
      }

      // Adjust Y if menu would overflow bottom edge
      if (y + rect.height > window.innerHeight - padding) {
        adjustedY = Math.max(padding, window.innerHeight - rect.height - padding);
      } else {
        adjustedY = y;
      }
    }
  });

  /**
   * Handle click outside to close menu
   * Also handles contextmenu events to close when right-clicking elsewhere
   */
  $effect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef && !menuRef.contains(event.target as Node)) {
        onClose();
      }
    }

    // Use setTimeout to avoid immediate close from the triggering click
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('contextmenu', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('contextmenu', handleClickOutside);
    };
  });

  /**
   * Handle keyboard navigation
   */
  function handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
      case 'ArrowDown':
        event.preventDefault();
        focusedIndex = (focusedIndex + 1) % menuItems.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusedIndex = (focusedIndex - 1 + menuItems.length) % menuItems.length;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleAction(menuItems[focusedIndex].id);
        break;
      case 'Tab':
        // Allow Tab to close menu and move focus naturally
        onClose();
        break;
    }
  }

  /**
   * Copy issue URL to clipboard
   */
  async function copyLink() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(issue.url);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = issue.url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('[ContextMenu] Failed to copy link:', error);
    }
    onClose();
  }

  /**
   * Open issue in new tab
   */
  function openInNewTab() {
    // Use noopener,noreferrer for security
    window.open(issue.url, '_blank', 'noopener,noreferrer');
    onClose();
  }

  /**
   * Toggle bookmark state
   */
  function handleBookmark() {
    bookmarked = toggleBookmark(issue.url);
    onClose();
  }

  /**
   * Handle menu item action
   */
  function handleAction(actionId: string) {
    switch (actionId) {
      case 'copy':
        copyLink();
        break;
      case 'open':
        openInNewTab();
        break;
      case 'bookmark':
        handleBookmark();
        break;
    }
  }

  /**
   * Focus menu on mount
   */
  $effect(() => {
    if (menuRef) {
      menuRef.focus();
    }
  });
</script>

<!-- Global escape key handler -->
<svelte:window onkeydown={handleKeyDown} />

<!-- Context menu overlay -->
<div
  bind:this={menuRef}
  class="context-menu"
  style="left: {adjustedX}px; top: {adjustedY}px;"
  role="menu"
  aria-label="Issue actions for #{issue.number}"
  tabindex="-1"
>
  {#each menuItems as item, index (item.id)}
    <button
      type="button"
      class="menu-item {focusedIndex === index ? 'focused' : ''}"
      role="menuitem"
      tabindex="-1"
      onclick={() => handleAction(item.id)}
      onmouseenter={() => (focusedIndex = index)}
    >
      <span class="menu-icon">
        {#if item.icon === 'link'}
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        {:else if item.icon === 'external'}
          <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        {:else if item.icon === 'star'}
          <svg
            class="icon {bookmarked ? 'bookmarked' : ''}"
            fill={bookmarked ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        {/if}
      </span>
      <span class="menu-label">
        {item.id === 'bookmark' ? (bookmarked ? 'Remove Bookmark' : 'Add Bookmark') : item.label}
      </span>
    </button>
  {/each}
</div>

<style>
  .context-menu {
    position: fixed;
    z-index: 50;
    min-width: 160px;
    padding: 0.25rem;
    background: rgba(30, 41, 59, 0.95);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 0.5rem;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.3),
      0 4px 6px -4px rgba(0, 0, 0, 0.2);
    outline: none;
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    color: #e2e8f0;
    font-size: 0.75rem;
    font-weight: 500;
    text-align: left;
    cursor: pointer;
    transition: background-color 150ms ease;
  }

  .menu-item:hover,
  .menu-item.focused {
    background: rgba(71, 85, 105, 0.5);
    color: #fff;
  }

  .menu-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  .icon {
    width: 1rem;
    height: 1rem;
  }

  .icon.bookmarked {
    color: #fbbf24;
  }

  .menu-label {
    flex: 1;
  }

  /* Light mode overrides */
  :global(html:not(.dark)) .context-menu {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(203, 213, 225, 0.8);
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -4px rgba(0, 0, 0, 0.1);
  }

  :global(html:not(.dark)) .menu-item {
    color: #334155;
  }

  :global(html:not(.dark)) .menu-item:hover,
  :global(html:not(.dark)) .menu-item.focused {
    background: rgba(226, 232, 240, 0.8);
    color: #0f172a;
  }

  /* Reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .menu-item {
      transition: none;
    }
  }
</style>
