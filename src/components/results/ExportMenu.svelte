<!--
  ExportMenu Component
  Issue #35 - Extracted from ResultsList.svelte
  Issue #216 - Accessibility improvements (WCAG 2.1 AA)

  Dropdown menu for exporting issues in different formats:
  - Markdown (.md) - List with titles and links
  - Plain Text (.txt) - URLs only
  - CSV (.csv) - Spreadsheet format

  Accessibility features:
  - Full keyboard navigation (Arrow keys, Home, End, Escape, Tab)
  - Focus management (focus first item on open, return focus on close)
  - Click-outside-to-close
  - ARIA attributes for screen readers
  - Visual focus indicators
-->

<script lang="ts">
  import { parseRepoUrl, type GitHubIssue } from '../../lib/github-graphql';

  interface Props {
    issues: GitHubIssue[];
    repoUrl: string;
    disabled?: boolean;
  }

  let { issues, repoUrl, disabled = false }: Props = $props();

  // Dropdown state
  let showDropdown = $state(false);

  // Focus management state
  let focusedIndex = $state(0);
  let triggerButtonRef: HTMLButtonElement | null = $state(null);
  let menuRef: HTMLDivElement | null = $state(null);

  // Menu items configuration for keyboard navigation
  // Each item has a unique elementId for aria-activedescendant
  const menuItems: Array<{ id: 'markdown' | 'plain' | 'csv'; label: string; elementId: string }> = [
    { id: 'markdown', label: 'Markdown (.md)', elementId: 'export-menu-item-markdown' },
    { id: 'plain', label: 'Plain Text (.txt)', elementId: 'export-menu-item-plain' },
    { id: 'csv', label: 'CSV (.csv)', elementId: 'export-menu-item-csv' }
  ];

  // Derived: current focused item's element ID for aria-activedescendant
  let activeDescendantId = $derived(menuItems[focusedIndex]?.elementId ?? '');

  /**
   * Format issues for export in the specified format
   */
  function formatIssuesForExport(
    issuesToFormat: GitHubIssue[],
    format: 'markdown' | 'plain' | 'csv'
  ): string {
    if (issuesToFormat.length === 0) return '';

    switch (format) {
      case 'markdown':
        return issuesToFormat
          .map(
            (issue) =>
              `- [#${issue.number} ${issue.title.replaceAll('[', '\\[').replaceAll(']', '\\]')}](${issue.url})`
          )
          .join('\n');

      case 'plain':
        return issuesToFormat.map((issue) => issue.url).join('\n');

      case 'csv': {
        const header = 'Number,Title,URL';
        const rows = issuesToFormat.map(
          (issue) =>
            `${issue.number},"${issue.title.replace(/"/g, '""').replace(/\r?\n/g, ' ')}",${issue.url}`
        );
        return [header, ...rows].join('\n');
      }

      default:
        return '';
    }
  }

  /**
   * Open dropdown and set up focus management
   */
  function openDropdown() {
    showDropdown = true;
    focusedIndex = 0;
  }

  /**
   * Close dropdown and optionally return focus to trigger button
   * @param returnFocus - Whether to return focus to the trigger button
   */
  function closeDropdown(returnFocus: boolean = true) {
    showDropdown = false;
    if (returnFocus && triggerButtonRef) {
      triggerButtonRef.focus();
    }
  }

  /**
   * Handle keyboard navigation on the trigger button
   */
  function handleTriggerKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
        event.preventDefault();
        if (!showDropdown) {
          openDropdown();
        }
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (showDropdown) {
          closeDropdown(true);
        } else {
          openDropdown();
        }
        break;
    }
  }

  /**
   * Handle keyboard navigation within the menu
   */
  function handleMenuKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusedIndex = (focusedIndex + 1) % menuItems.length;
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusedIndex = (focusedIndex - 1 + menuItems.length) % menuItems.length;
        break;
      case 'Home':
        event.preventDefault();
        focusedIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        focusedIndex = menuItems.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        exportIssues(menuItems[focusedIndex].id);
        break;
      case 'Escape':
        event.preventDefault();
        closeDropdown(true);
        break;
      case 'Tab':
        // Allow Tab to close menu and move focus naturally
        closeDropdown(false);
        break;
    }
  }

  /**
   * Click-outside handler using $effect
   */
  $effect(() => {
    if (!showDropdown) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef &&
        triggerButtonRef &&
        !menuRef.contains(target) &&
        !triggerButtonRef.contains(target)
      ) {
        closeDropdown(false);
      }
    }

    // Use setTimeout to avoid immediate close from the triggering click
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  });

  /**
   * Focus management: focus menu when dropdown opens
   */
  $effect(() => {
    if (showDropdown && menuRef) {
      // Use requestAnimationFrame to ensure DOM is updated before focusing
      requestAnimationFrame(() => {
        menuRef?.focus();
      });
    }
  });

  /**
   * Download file with given content and filename
   */
  function downloadFile(content: string, filename: string, mimeType: string) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Export issues as downloadable file
   */
  function exportIssues(format: 'markdown' | 'plain' | 'csv') {
    if (issues.length === 0) return;

    const formattedText = formatIssuesForExport(issues, format);
    closeDropdown(true);

    // Generate filename with repo name and timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const parsed = parseRepoUrl(repoUrl);
    const repoName = parsed ? `${parsed.owner}-${parsed.repo}` : 'issues';

    switch (format) {
      case 'markdown':
        downloadFile(formattedText, `${repoName}-issues-${timestamp}.md`, 'text/markdown');
        break;
      case 'plain':
        downloadFile(formattedText, `${repoName}-issues-${timestamp}.txt`, 'text/plain');
        break;
      case 'csv':
        downloadFile(formattedText, `${repoName}-issues-${timestamp}.csv`, 'text/csv');
        break;
    }
  }

  // Derived state
  let isDisabled = $derived(disabled || issues.length === 0);
</script>

<div class="relative">
  <button
    bind:this={triggerButtonRef}
    type="button"
    onclick={() => (showDropdown ? closeDropdown(true) : openDropdown())}
    onkeydown={handleTriggerKeyDown}
    disabled={isDisabled}
    class="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/60 hover:bg-slate-600/80 text-slate-300 hover:text-white rounded text-[10px] font-medium transition-colors disabled:opacity-50"
    aria-label="Export issues"
    aria-expanded={showDropdown}
    aria-haspopup="menu"
  >
    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
    Export
    <svg
      class="chevron-icon w-2.5 h-2.5 transition-transform {showDropdown ? 'rotate-180' : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if showDropdown}
    <div
      bind:this={menuRef}
      class="export-menu absolute left-0 top-full mt-1 w-36 bg-slate-800 rounded shadow-lg border border-slate-700 overflow-hidden z-50"
      role="menu"
      aria-label="Export formats"
      aria-activedescendant={activeDescendantId}
      tabindex="-1"
      onkeydown={handleMenuKeyDown}
    >
      {#each menuItems as item, index (item.id)}
        <button
          id={item.elementId}
          type="button"
          onclick={() => exportIssues(item.id)}
          onmouseenter={() => (focusedIndex = index)}
          class="menu-item w-full px-2.5 py-1.5 text-left text-[10px] text-slate-300 hover:bg-slate-700 hover:text-white"
          class:focused={focusedIndex === index}
          role="menuitem"
          tabindex="-1"
        >
          {item.label}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .menu-item {
    transition: background-color 150ms ease;
  }

  .menu-item.focused {
    background-color: rgb(51 65 85); /* slate-700 */
    color: white;
  }

  .export-menu:focus {
    outline: 2px solid transparent; /* Remove default but keep space */
    box-shadow: 0 0 0 1px rgb(100 116 139 / 0.5); /* subtle slate ring */
  }

  /* Reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .menu-item {
      transition: none;
    }

    .chevron-icon {
      transition: none !important;
    }
  }
</style>
