<!--
  SearchForm Component
  Issue #35 - Extracted from ResultsList.svelte
  Issue #62 - Added search history dropdown
  Issue #162 - Updated placeholder with example repository suggestions
  Issue #188 - Load and pre-fill last searched repository
  Issue #166 - Added keyboard shortcut hint for Enter key
  Issue #121 - Added advanced search filters with FilterBuilder and FilterHelpTooltip
  Issue #177 - Added clear button (X) to search input

  Search form with repository URL input, GitHub token input,
  popular repo quick-select chips, real-time URL validation,
  search history dropdown, advanced filter builder, clear button, and keyboard shortcut hint.
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { validateRepoUrl } from '../../lib/github-graphql';
  import {
    getHistory,
    removeFromHistory,
    clearHistory,
    getLastSearchedRepo,
    clearLastSearchedRepo
  } from '../../lib/search-history';
  import { SearchHistory, FilterBuilder, FilterHelpTooltip } from '../shared';
  import { showCopiedToast } from '../../lib/toast';
  import type { ValidationState, SearchHistoryItem } from '../../lib/types/results';
  import type { FilterChip } from '../../lib/types/filters';

  interface Props {
    repoUrl: string;
    token: string;
    loading: boolean;
    isAuthenticated: boolean;
    onSearch: () => void;
    onUrlChange: (url: string) => void;
    onTokenChange: (token: string) => void;
    onShowHelp: () => void;
    /** Current filter chips for advanced search (Issue #121) */
    filterChips?: FilterChip[];
    /** Current filter query string (Issue #121) */
    filterQuery?: string;
    /** Callback when filter chips change (Issue #121) */
    onFilterChipsChange?: (chips: FilterChip[]) => void;
    /** Callback when filter query changes (Issue #121) */
    onFilterQueryChange?: (query: string) => void;
    /** Rate limit remaining requests */
    rateLimitRemaining?: number;
    /** Rate limit reset time string */
    rateLimitResetTime?: string;
  }

  let {
    repoUrl,
    token,
    loading,
    isAuthenticated,
    onSearch,
    onUrlChange,
    onTokenChange,
    onShowHelp: _onShowHelp,
    filterChips = [],
    filterQuery = '',
    onFilterChipsChange,
    onFilterQueryChange,
    rateLimitRemaining,
    rateLimitResetTime
  }: Props = $props();

  // Popular repositories for quick selection (5 top choices)
  const POPULAR_REPOS = [
    { name: 'facebook/react', label: 'React' },
    { name: 'microsoft/vscode', label: 'VS Code' },
    { name: 'vercel/next.js', label: 'Next.js' },
    { name: 'sveltejs/svelte', label: 'Svelte' },
    { name: 'tailwindlabs/tailwindcss', label: 'Tailwind' }
  ];

  // Local state for validation
  let validationState = $state<ValidationState['state']>('idle');
  let validationMessage = $state('');
  let validationTimeout: number | null = null;
  let repoUrlInput: HTMLInputElement;

  // Search history state (Issue #62)
  let showHistory = $state(false);
  let historyItems = $state<SearchHistoryItem[]>([]);
  let blurTimeout: number | null = null;

  // Copy URL state (Issue #161)
  let copied = $state(false);
  let copyTimeout: number | null = null;

  // Filter help tooltip state (Issue #121)
  let showFilterHelp = $state(false);

  /**
   * Handle repository URL input with debounced validation
   * Issue #129: Keep dropdown visible for autocomplete filtering
   */
  function handleRepoUrlInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const newUrl = target.value;
    onUrlChange(newUrl);

    // Issue #129: Keep dropdown visible while typing for autocomplete
    // The SearchHistory component handles filtering via filterText prop

    // Clear previous timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }

    // If empty, reset to idle immediately and clear saved repo (Issue #188)
    if (!newUrl.trim()) {
      validationState = 'idle';
      validationMessage = '';
      clearLastSearchedRepo();
      return;
    }

    // Debounce validation by 300ms
    validationTimeout = window.setTimeout(() => {
      const result = validateRepoUrl(newUrl);
      validationState = result.state;
      validationMessage = result.message || '';
    }, 300);
  }

  /**
   * Handle token input change
   */
  function handleTokenInput(event: Event) {
    const target = event.target as HTMLInputElement;
    onTokenChange(target.value);
  }

  /**
   * Handle Enter key in repo URL input
   */
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      onSearch();
    }
  }

  /**
   * Handle quick repo selection from chips
   * Auto-fills URL and triggers search
   */
  function handleQuickRepoSelect(repoName: string) {
    const url = `https://github.com/${repoName}`;
    onUrlChange(url);
    // Validate immediately
    const result = validateRepoUrl(url);
    validationState = result.state;
    validationMessage = result.message || '';
    // Hide history and auto-search after a brief delay
    showHistory = false;
    setTimeout(() => onSearch(), 100);
  }

  /**
   * Load search history from localStorage
   */
  function loadHistory() {
    historyItems = getHistory();
  }

  /**
   * Handle input focus - show autocomplete dropdown
   * Issue #129: Always show suggestions (history + popular) when focused
   */
  function handleInputFocus() {
    // Clear any pending blur timeout
    if (blurTimeout) {
      clearTimeout(blurTimeout);
      blurTimeout = null;
    }
    // Issue #129: Always load history and show dropdown for autocomplete
    loadHistory();
    showHistory = true;
  }

  /**
   * Handle input blur - hide history after delay
   * Delay allows clicking on history items
   */
  function handleInputBlur() {
    blurTimeout = window.setTimeout(() => {
      showHistory = false;
      blurTimeout = null;
    }, 200);
  }

  /**
   * Handle history item selection
   */
  function handleHistorySelect(item: SearchHistoryItem) {
    onUrlChange(item.fullUrl);
    // Validate immediately
    const result = validateRepoUrl(item.fullUrl);
    validationState = result.state;
    validationMessage = result.message || '';
    showHistory = false;
    // Trigger search
    setTimeout(() => onSearch(), 100);
  }

  /**
   * Handle delete single history item
   */
  function handleHistoryDelete(owner: string, repo: string) {
    removeFromHistory(owner, repo);
    loadHistory();
    // Close dropdown if no items left
    if (historyItems.length === 0) {
      showHistory = false;
    }
  }

  /**
   * Handle clear all history
   */
  function handleHistoryClear() {
    clearHistory();
    historyItems = [];
    showHistory = false;
  }

  /**
   * Handle close history dropdown
   */
  function handleHistoryClose() {
    showHistory = false;
  }

  /**
   * Copy repository URL to clipboard (Issue #161)
   */
  async function handleCopyUrl() {
    if (!repoUrl) return;

    try {
      await navigator.clipboard.writeText(repoUrl);
      handleCopySuccess();
    } catch {
      // Fallback for browsers without clipboard API or non-HTTPS contexts
      const textArea = document.createElement('textarea');
      textArea.value = repoUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        handleCopySuccess();
      } catch (e) {
        console.error('Failed to copy URL:', e);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }

  /**
   * Handle successful copy with visual feedback
   */
  function handleCopySuccess() {
    copied = true;
    showCopiedToast();
    if (copyTimeout) {
      clearTimeout(copyTimeout);
    }
    copyTimeout = window.setTimeout(() => {
      copied = false;
      copyTimeout = null;
    }, 2000);
  }

  /**
   * Clear the repository URL input (Issue #177)
   * Resets validation state and returns focus to input
   */
  function handleClearInput() {
    onUrlChange('');
    validationState = 'idle';
    validationMessage = '';
    clearLastSearchedRepo();
    // Hide history dropdown if showing
    showHistory = false;
    // Clear any pending validation timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout);
    }
    repoUrlInput?.focus();
  }

  // Auto-focus the repository URL input on mount, load last searched repo, and cleanup timeouts
  onMount(() => {
    if (repoUrlInput) {
      repoUrlInput.focus();
    }

    // Load last searched repo if input is empty (Issue #188)
    if (!repoUrl || repoUrl.trim() === '') {
      const lastRepo = getLastSearchedRepo();
      if (lastRepo) {
        onUrlChange(lastRepo);
        // Validate immediately for consistent UX
        const result = validateRepoUrl(lastRepo);
        validationState = result.state;
        validationMessage = result.message || '';
      }
    }

    return () => {
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
      if (blurTimeout) {
        clearTimeout(blurTimeout);
      }
      if (copyTimeout) {
        clearTimeout(copyTimeout);
      }
    };
  });

  // Derived: can submit form (also checks validation state)
  let canSubmit = $derived(!loading && repoUrl.trim().length > 0 && validationState !== 'invalid');
</script>

<div class="sketch-card p-3">
  <div class="space-y-2.5">
    <!-- Repository URL Input -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label for="repoUrl" class="text-xs font-medium text-slate-300"> Repository URL </label>
        <span
          id="repoUrl-hint"
          class="text-[10px] {validationState === 'valid'
            ? 'text-green-400'
            : validationState === 'invalid'
              ? 'text-red-400'
              : 'text-transparent'}"
          class:invisible={!validationMessage}
          role={validationState === 'invalid' ? 'alert' : undefined}
        >
          {validationMessage || '\u00A0'}
        </span>
      </div>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <svg class="h-3.5 w-3.5 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
            />
          </svg>
        </div>
        <input
          id="repoUrl"
          bind:this={repoUrlInput}
          type="text"
          value={repoUrl}
          placeholder="Try: facebook/react, microsoft/vscode"
          class="sketch-input w-full pl-8 pr-14 py-2 text-xs text-white rounded-md outline-none bg-slate-800/80 placeholder-slate-500 {validationState ===
          'valid'
            ? 'border-green-500/50'
            : validationState === 'invalid'
              ? 'border-red-500/50'
              : ''}"
          oninput={handleRepoUrlInput}
          onkeydown={handleKeydown}
          onfocus={handleInputFocus}
          onblur={handleInputBlur}
          aria-describedby="repoUrl-hint"
          aria-invalid={validationState === 'invalid'}
          aria-autocomplete="list"
          aria-controls="search-history-listbox"
          aria-expanded={showHistory}
          role="combobox"
          aria-haspopup="listbox"
        />
        <!-- Clear input button (Issue #177) -->
        {#if repoUrl.trim()}
          <button
            type="button"
            tabindex="-1"
            onclick={handleClearInput}
            class="absolute inset-y-0 right-7 flex items-center cursor-pointer rounded
                   focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-400
                   hover:text-slate-300 transition-colors"
            aria-label="Clear search"
            title="Clear"
          >
            <svg
              class="h-3.5 w-3.5 text-slate-400"
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
        <!-- Copy URL button (Issue #161) -->
        {#if repoUrl.trim()}
          <button
            type="button"
            onclick={handleCopyUrl}
            class="absolute inset-y-0 right-2 flex items-center cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 rounded"
            aria-label="Copy repository URL to clipboard"
            title={copied ? 'Copied!' : 'Copy URL'}
          >
            {#if copied}
              <svg
                class="h-3.5 w-3.5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            {:else}
              <svg
                class="h-3.5 w-3.5 text-slate-400 hover:text-slate-300 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            {/if}
          </button>
          <!-- Screen reader announcement for copy status -->
          <span role="status" aria-live="polite" class="sr-only">
            {copied ? 'Repository URL copied to clipboard' : ''}
          </span>
        {/if}
        <!-- Validation icons removed - validation state shown in label area above -->

        <!-- Search History Dropdown (Issue #62, Issue #129: Autocomplete) -->
        <SearchHistory
          items={historyItems}
          show={showHistory}
          filterText={repoUrl}
          onSelect={handleHistorySelect}
          onDelete={handleHistoryDelete}
          onClear={handleHistoryClear}
          onClose={handleHistoryClose}
        />
      </div>

      <!-- Quick picks - compact chips -->
      <div class="mt-1.5 flex flex-wrap gap-1">
        {#each POPULAR_REPOS as repo (repo.name)}
          <button
            type="button"
            onclick={() => handleQuickRepoSelect(repo.name)}
            disabled={loading}
            class="quick-pick-chip"
            title={repo.name}
          >
            {repo.label}
          </button>
        {/each}
      </div>
    </div>

    <!-- Token Input -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <label for="token" class="text-xs font-medium text-slate-300">
          {#if isAuthenticated}
            <span class="flex items-center gap-1.5">
              Token
              <span class="text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded"
                >5000/hr</span
              >
            </span>
          {:else}
            Token <span class="text-slate-500 text-[10px] font-normal">(optional)</span>
          {/if}
        </label>
        <!-- Rate limit display inline with token -->
        {#if rateLimitRemaining !== undefined && rateLimitRemaining > 0}
          <span class="text-[10px] {rateLimitRemaining < 10 ? 'text-amber-400' : 'text-slate-500'}">
            {rateLimitRemaining} left{#if rateLimitResetTime}
              · {rateLimitResetTime}{/if}
          </span>
        {/if}
      </div>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
          <svg
            class="h-3.5 w-3.5 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <input
          id="token"
          type="password"
          value={token}
          placeholder={isAuthenticated ? '••••••••' : 'ghp_xxxx...'}
          class="sketch-input w-full pl-8 pr-3 py-2 text-xs text-white rounded-md outline-none bg-slate-800/80 placeholder-slate-500"
          oninput={handleTokenInput}
        />
      </div>
    </div>

    <!-- Advanced Filters Section (Issue #121) -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <span class="text-xs font-medium text-slate-300 flex items-center gap-1.5">
          <svg
            class="h-3.5 w-3.5 text-slate-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Advanced Filters
          <span class="text-slate-500 text-[10px] font-normal">(optional)</span>
        </span>
        <FilterHelpTooltip bind:show={showFilterHelp} onClose={() => (showFilterHelp = false)} />
      </div>
      <FilterBuilder
        chips={filterChips}
        query={filterQuery}
        onChipsChange={onFilterChipsChange}
        onQueryChange={onFilterQueryChange}
        disabled={loading}
      />
    </div>

    <!-- Search Button - Compact Brand Primary Action -->
    <button
      onclick={onSearch}
      disabled={!canSubmit}
      class="w-full py-1.5 px-3 rounded-md font-medium text-xs transition-all {canSubmit
        ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-500/20'
        : 'bg-slate-800 text-slate-600 cursor-not-allowed'}"
    >
      <span class="flex items-center justify-center gap-1.5">
        {#if loading}
          <svg class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Searching...
        {:else}
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Find Issues
        {/if}
      </span>
    </button>

    <!-- Keyboard shortcut hint (Issue #166) -->
    <div
      class="hidden md:flex justify-center items-center gap-1 mt-2 text-[0.625rem] text-slate-500"
    >
      Press <kbd
        class="inline-flex items-center justify-center px-1.5 py-0.5 bg-slate-700/40 border border-slate-600/30 rounded text-[0.5625rem] text-slate-400"
        >Enter</kbd
      > to search
    </div>
  </div>
</div>

<style>
  .quick-pick-chip {
    padding: 0.125rem 0.375rem;
    font-size: 0.5625rem;
    font-weight: 500;
    color: #94a3b8;
    background: rgba(51, 65, 85, 0.4);
    border: 1px solid rgba(71, 85, 105, 0.3);
    border-radius: 3px;
    transition: all 0.1s ease;
    cursor: pointer;
  }

  .quick-pick-chip:hover:not(:disabled) {
    color: #e2e8f0;
    background: rgba(71, 85, 105, 0.5);
    border-color: rgba(100, 116, 139, 0.5);
  }

  .quick-pick-chip:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
