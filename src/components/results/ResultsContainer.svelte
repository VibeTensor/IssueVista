<!--
  ResultsContainer Component
  Issue #35 - Main orchestrator extracted from ResultsList.svelte
  Issue #122 - Smart search result sorting with relevance score
  Issue #163 - Updated results header to show "Found X available issues"
  Issue #172 - Added loading skeleton cards during search

  Responsibilities:
  - State management (issues, loading, error, filters, sorting)
  - API calls coordination
  - Event handling from child components
  - Layout composition
  - Sort preference persistence to localStorage

  Composes: SearchForm, RateLimitDisplay, IssuesList, HelpPopup, SVGFilters, IssueCardSkeleton
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { GitHubAPI, parseRepoUrl, type GitHubIssue } from '../../lib/github-graphql';
  import {
    countZeroCommentIssues,
    isZeroComment,
    sortIssues,
    getDefaultDirection,
    aggregateLabelFrequencies
  } from '../../lib/issue-utils';
  import type { SortOption, SortDirection } from '../../lib/types/sorting';
  import { SORT_OPTION_LABELS, DEFAULT_SORT_PREFERENCES } from '../../lib/types/sorting';
  import { getSortPreferences, setSortPreferences } from '../../lib/sort-preferences';
  import { showCopiedToast } from '../../lib/toast';
  import {
    readStateFromUrl,
    updateUrlWithState,
    copyShareableUrl,
    hasUrlState,
    type SearchState
  } from '../../lib/url-state';
  import GitHubAuth from '../GitHubAuth.svelte';
  import { SVGFilters, EmptyState, LoadingProgress, CancelConfirmModal, TagCloud } from '../shared';
  import { detectEmptyStateVariant } from '../../lib/empty-state-utils';
  import {
    type ProgressState,
    toCancelledState,
    createInitialState,
    GRAPHQL_MAX_PAGES,
    REST_MAX_PAGES
  } from '../../lib/loading-progress-utils';
  import { addToHistory, setLastSearchedRepo } from '../../lib/search-history';
  import { SearchForm, HelpPopup, IssueCard, IssueCardSkeleton } from './index';

  // Core state
  let repoUrl = $state('');
  let githubToken = $state('');
  let loading = $state(false);
  let error = $state('');
  let issues = $state<GitHubIssue[]>([]);
  let hasSearched = $state(false);

  // Progress tracking state (Issue #23)
  let progressState = $state<ProgressState | null>(null);
  let abortController = $state<AbortController | null>(null);
  let showCancelModal = $state(false);
  let searchStartTime = $state<number | null>(null);

  // Rate limit state
  let rateLimit = $state({ remaining: 0, resetAt: '' });
  let isAuthenticated = $state(false);

  // UI state
  let showHelpPopup = $state(false);
  let copiedIssueNumber = $state<number | null>(null);
  let copyFeedbackTimeout: number | null = null;

  // Filter state
  let showOnlyZeroComments = $state(false);
  let labelFilter = $state<string | null>(null);

  // Sort state (Issue #122)
  let sortBy = $state<SortOption>(DEFAULT_SORT_PREFERENCES.sortBy);
  let sortDirection = $state<SortDirection>(DEFAULT_SORT_PREFERENCES.direction);
  let sortDropdownOpen = $state(false);

  // Labels expansion state
  let showAllLabels = $state(false);
  const COLLAPSED_LABEL_COUNT = 6;

  // URL state tracking (Issue #140)
  let urlStateInitialized = $state(false);
  let isUpdatingFromUrl = $state(false);

  // Derived: filtered and sorted issues (Issue #122, #137)
  let displayedIssues = $derived.by(() => {
    let result = issues;

    // Apply zero-comment filter
    if (showOnlyZeroComments) {
      result = result.filter(isZeroComment);
    }

    // Apply label filter (Issue #137)
    if (labelFilter) {
      result = result.filter((issue) =>
        issue.labels?.nodes?.some((label) => label.name === labelFilter)
      );
    }

    // Apply sorting (Issue #122)
    result = sortIssues(result, sortBy, sortDirection);

    return result;
  });

  // Derived: count of zero-comment issues
  let zeroCommentCount = $derived(countZeroCommentIssues(issues));

  // Derived: aggregated label frequencies for tag cloud (Issue #137)
  let aggregatedLabels = $derived(aggregateLabelFrequencies(displayedIssues));

  // Derived: detect which empty state variant to show (if any)
  let emptyStateVariant = $derived(
    detectEmptyStateVariant({
      hasSearched,
      isLoading: loading,
      error: error || null,
      resultsCount: issues.length
    })
  );

  // Initialize on mount
  onMount(() => {
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      githubToken = savedToken;
      isAuthenticated = true;
    }
    updateRateLimit();

    // Load sort preferences from localStorage (Issue #122)
    const savedPrefs = getSortPreferences();
    sortBy = savedPrefs.sortBy;
    sortDirection = savedPrefs.direction;
  });

  // Cleanup on component destroy
  onDestroy(() => {
    if (copyFeedbackTimeout) {
      clearTimeout(copyFeedbackTimeout);
    }
    // Abort any in-progress search
    abortController?.abort();
  });

  // Issue #140: Read URL state on mount and restore filters
  $effect(() => {
    // Only run once on initial mount
    if (urlStateInitialized) return;

    if (hasUrlState()) {
      isUpdatingFromUrl = true;
      const urlState = readStateFromUrl();

      // Apply URL state to component state
      if (urlState.repoUrl) {
        repoUrl = urlState.repoUrl;
      }
      if (urlState.labelFilter !== undefined) {
        labelFilter = urlState.labelFilter;
      }
      if (urlState.sortBy !== undefined) {
        sortBy = urlState.sortBy;
      }
      if (urlState.sortDirection !== undefined) {
        sortDirection = urlState.sortDirection;
      }
      if (urlState.showOnlyZeroComments !== undefined) {
        showOnlyZeroComments = urlState.showOnlyZeroComments;
      }

      // Auto-trigger search if repo URL is present
      if (urlState.repoUrl) {
        // Use setTimeout to ensure state is fully applied before search
        setTimeout(() => {
          handleSearch();
          isUpdatingFromUrl = false;
        }, 0);
      } else {
        isUpdatingFromUrl = false;
      }
    }

    urlStateInitialized = true;
  });

  // Issue #140: Update URL when filter/sort state changes (after initial load)
  $effect(() => {
    // Skip during URL initialization to prevent loops
    if (!urlStateInitialized || isUpdatingFromUrl) return;

    // Only update URL if we have searched (have a repo URL)
    if (!repoUrl || !hasSearched) return;

    // Build current state and update URL
    const currentState: SearchState = {
      repoUrl,
      labelFilter,
      sortBy,
      sortDirection,
      showOnlyZeroComments
    };

    updateUrlWithState(currentState);
  });

  // Handle authentication changes
  function handleAuthChange(token: string | null) {
    if (token) {
      githubToken = token;
      isAuthenticated = true;
      updateRateLimit();
    } else {
      githubToken = '';
      isAuthenticated = false;
      rateLimit = { remaining: 0, resetAt: '' };
    }
  }

  // Update rate limit from API
  async function updateRateLimit() {
    try {
      const api = new GitHubAPI(githubToken || undefined);
      rateLimit = await api.getRateLimit(githubToken || undefined);
    } catch (e) {
      console.error('Failed to fetch rate limit', e);
    }
  }

  // Handle search (Issue #23 - with progress tracking and cancel support)
  async function handleSearch() {
    // Abort any previous search
    abortController?.abort();

    // Reset state
    error = '';
    issues = [];
    loading = true;
    hasSearched = true;
    showCancelModal = false;

    // Create new AbortController
    abortController = new AbortController();
    searchStartTime = Date.now();

    // Save token if provided
    if (githubToken) {
      localStorage.setItem('github_token', githubToken);
      isAuthenticated = true;
    } else {
      isAuthenticated = false;
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      error = 'Invalid repository. Use owner/repo (e.g., facebook/react) or full GitHub URL';
      loading = false;
      progressState = null;
      return;
    }

    // Initialize progress state
    const maxPages = githubToken ? GRAPHQL_MAX_PAGES : REST_MAX_PAGES;
    progressState = createInitialState({
      maxPages,
      isAuthenticated: !!githubToken
    });

    // Progress callback
    const onProgress = (state: ProgressState) => {
      progressState = state;
    };

    try {
      const api = new GitHubAPI(githubToken || undefined);
      const result = await api.fetchAvailableIssues(
        parsed.owner,
        parsed.repo,
        onProgress,
        abortController.signal
      );
      issues = result.issues;
      rateLimit = result.rateLimit;

      // Add to search history (Issue #62)
      addToHistory(parsed.owner, parsed.repo, repoUrl, result.issues.length);

      // Save last searched repo (Issue #188)
      setLastSearchedRepo(repoUrl);
    } catch (e: any) {
      // Handle abort separately
      if (e.name === 'AbortError' || abortController?.signal.aborted) {
        // User cancelled - partial results may be in issues from API
        console.log('[UI] Search cancelled by user');
      } else {
        error = e.message || 'Failed to fetch issues';
      }
    } finally {
      loading = false;
      abortController = null;
      searchStartTime = null;
      // Keep progressState for potential cancelled state display
    }
  }

  // Handle URL change
  function handleUrlChange(url: string) {
    repoUrl = url;
  }

  // Handle token change
  function handleTokenChange(token: string) {
    githubToken = token;
  }

  // Handle filter toggle
  function handleFilterToggle(enabled: boolean) {
    showOnlyZeroComments = enabled;
  }

  // Handle tag cloud label click (Issue #137)
  function handleTagClick(labelName: string) {
    // Toggle filter - if already filtering by this label, clear it
    if (labelFilter === labelName) {
      labelFilter = null;
    } else {
      labelFilter = labelName;
    }
  }

  // Handle sort option change (Issue #122)
  function handleSortOptionChange(option: SortOption) {
    sortBy = option;
    // Set default direction for the selected option
    sortDirection = getDefaultDirection(option);
    // Persist to localStorage
    setSortPreferences({ sortBy, direction: sortDirection });
  }

  // Handle sort direction toggle (Issue #122)
  function handleSortDirectionToggle() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    // Persist to localStorage
    setSortPreferences({ sortBy, direction: sortDirection });
  }

  // Handle clear filters
  function handleClearFilters() {
    showOnlyZeroComments = false;
    labelFilter = null;
    sortBy = DEFAULT_SORT_PREFERENCES.sortBy;
    sortDirection = DEFAULT_SORT_PREFERENCES.direction;
    setSortPreferences(DEFAULT_SORT_PREFERENCES);
  }

  // Handle share URL copy (Issue #140)
  async function handleShareUrl() {
    const currentState: SearchState = {
      repoUrl,
      labelFilter,
      sortBy,
      sortDirection,
      showOnlyZeroComments
    };

    const success = await copyShareableUrl(currentState);
    if (success) {
      showCopiedToast();
    }
  }

  // Handle EmptyState primary action based on variant
  function handleEmptyStatePrimaryAction() {
    if (emptyStateVariant === 'error' || emptyStateVariant === 'rate-limited') {
      // Retry search
      handleSearch();
    } else if (emptyStateVariant === 'no-results') {
      // Clear filters
      handleClearFilters();
    }
    // Note: 'initial' state no longer has primary action (quick picks are in SearchForm)
  }

  // Handle copy issue URL
  async function handleCopyIssue(issueNumber: number) {
    const issue = issues.find((i) => i.number === issueNumber);
    if (!issue?.url) return;

    try {
      await navigator.clipboard.writeText(issue.url);
      copiedIssueNumber = issueNumber;
      showCopiedToast();

      if (copyFeedbackTimeout) {
        clearTimeout(copyFeedbackTimeout);
      }

      copyFeedbackTimeout = window.setTimeout(() => {
        copiedIssueNumber = null;
        copyFeedbackTimeout = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy issue URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = issue.url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        copiedIssueNumber = issueNumber;

        if (copyFeedbackTimeout) {
          clearTimeout(copyFeedbackTimeout);
        }

        copyFeedbackTimeout = window.setTimeout(() => {
          copiedIssueNumber = null;
          copyFeedbackTimeout = null;
        }, 2000);
      } catch (e) {
        console.error('Fallback copy failed:', e);
      }
      document.body.removeChild(textArea);
    }
  }

  // Toggle help popup
  function toggleHelpPopup() {
    showHelpPopup = !showHelpPopup;
  }

  // Cancel handlers (Issue #23)
  function handleCancelRequest() {
    showCancelModal = true;
  }

  function handleCancelContinue() {
    showCancelModal = false;
  }

  function handleCancelConfirm() {
    showCancelModal = false;

    // Abort the fetch
    abortController?.abort();

    // Update progress state to cancelled
    if (progressState) {
      progressState = toCancelledState(progressState);
    }

    // Loading will be set to false in handleSearch's finally block
    // Issues array will contain partial results from API
  }

  // Export issues
  function exportIssues(format: 'markdown' | 'plain' | 'csv') {
    if (issues.length === 0) return;

    let content = '';
    const timestamp = new Date().toISOString().split('T')[0];
    const parsed = parseRepoUrl(repoUrl);
    const repoName = parsed ? `${parsed.owner}-${parsed.repo}` : 'issues';

    switch (format) {
      case 'markdown':
        content = issues
          .map(
            (issue) =>
              `- [#${issue.number} ${issue.title.replaceAll('[', '\\[').replaceAll(']', '\\]')}](${issue.url})`
          )
          .join('\n');
        downloadFile(content, `${repoName}-issues-${timestamp}.md`, 'text/markdown');
        break;
      case 'plain':
        content = issues.map((issue) => issue.url).join('\n');
        downloadFile(content, `${repoName}-issues-${timestamp}.txt`, 'text/plain');
        break;
      case 'csv': {
        const header = 'Number,Title,URL';
        const rows = issues.map(
          (issue) =>
            `${issue.number},"${issue.title.replace(/"/g, '""').replace(/\r?\n/g, ' ')}",${issue.url}`
        );
        content = [header, ...rows].join('\n');
        downloadFile(content, `${repoName}-issues-${timestamp}.csv`, 'text/csv');
        break;
      }
    }
  }

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

  // Get reset time for rate limit display
  function getResetTime(resetAt: string): string {
    if (!resetAt) return '';
    const resetDate = new Date(resetAt);
    const now = new Date();
    const diff = resetDate.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    return minutes > 0 ? `${minutes} minutes` : 'soon';
  }
</script>

<!-- SVG Filters for hand-drawn sketch effects -->
<SVGFilters />

<!-- Split Layout: Sidebar + Main Content -->
<div class="flex flex-col lg:flex-row min-h-screen">
  <!-- LEFT SIDEBAR - Sticky on desktop -->
  <aside
    class="sidebar-panel lg:w-[300px] xl:w-[320px] lg:flex-shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto"
  >
    <div class="p-3 lg:p-4 space-y-3">
      <!-- Brand Header - Using favicon design -->
      <div class="brand-header text-center py-3">
        <!-- Logo - Issues flowing through pipeline (matches favicon.svg) -->
        <div class="logo-mark inline-flex items-center justify-center mb-2">
          <svg
            class="w-14 h-14 lg:w-16 lg:h-16"
            viewBox="0 0 128 128"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <!-- Background circle -->
            <circle cx="64" cy="64" r="56" fill="#0d9488" />
            <!-- Flowing S-curve path -->
            <path
              d="M 20 64 Q 44 30, 64 64 Q 84 98, 108 64"
              stroke="#ffffff"
              stroke-width="6"
              fill="none"
              stroke-linecap="round"
            />
            <!-- Three issue nodes -->
            <circle cx="32" cy="50" r="10" fill="#ffffff" />
            <circle cx="64" cy="64" r="12" fill="#ffffff" />
            <circle cx="96" cy="78" r="10" fill="#ffffff" />
            <!-- Checkmarks inside -->
            <path
              d="M 27 50 L 30 53 L 37 46"
              stroke="#0d9488"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M 58 64 L 62 68 L 70 58"
              stroke="#0d9488"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M 91 78 L 94 81 L 101 74"
              stroke="#0d9488"
              stroke-width="3"
              fill="none"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
        <!-- Brand Text -->
        <h1 class="text-xl lg:text-2xl font-bold tracking-tight leading-none text-white">
          IssueFlow
        </h1>
        <p class="text-[10px] lg:text-xs text-slate-500 mt-1">Find your next contribution</p>
      </div>

      <!-- Search Form -->
      <SearchForm
        {repoUrl}
        token={githubToken}
        {loading}
        {isAuthenticated}
        onSearch={handleSearch}
        onUrlChange={handleUrlChange}
        onTokenChange={handleTokenChange}
        onShowHelp={toggleHelpPopup}
        rateLimitRemaining={rateLimit.remaining}
        rateLimitResetTime={getResetTime(rateLimit.resetAt)}
      />

      <!-- Auth prompt - Compact token generation guide -->
      {#if import.meta.env.PUBLIC_GITHUB_CLIENT_ID}
        <GitHubAuth onAuthChange={handleAuthChange} />
      {:else if !isAuthenticated}
        <div
          class="auth-prompt p-2 bg-gradient-to-r from-amber-500/10 to-teal-500/10 border border-amber-500/30 rounded-md"
        >
          <div class="flex items-center gap-2">
            <svg
              class="w-3.5 h-3.5 text-amber-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span class="text-[10px] text-slate-400">60/hr</span>
            <a
              href="https://github.com/settings/tokens/new?description=IssueFlow&scopes=public_repo"
              target="_blank"
              rel="noopener noreferrer"
              class="ml-auto inline-flex items-center gap-1 px-2 py-1 bg-teal-600 hover:bg-teal-500 text-white text-[9px] font-medium rounded transition-colors"
            >
              <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
              Get 5000/hr
            </a>
          </div>
        </div>
      {/if}

      <!-- Filter/Sort Controls - Polished card design -->
      {#if issues.length > 0 && !emptyStateVariant}
        <div class="filter-card">
          <!-- Easy issues toggle - Featured at top -->
          <button
            type="button"
            onclick={() => handleFilterToggle(!showOnlyZeroComments)}
            class="filter-toggle {showOnlyZeroComments ? 'active' : ''}"
            aria-pressed={showOnlyZeroComments}
          >
            <div class="flex items-center gap-2">
              <div class="toggle-checkbox {showOnlyZeroComments ? 'checked' : ''}">
                {#if showOnlyZeroComments}
                  <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                {/if}
              </div>
              <span class="text-xs font-medium">Easy to Start</span>
            </div>
            <span class="toggle-count {showOnlyZeroComments ? 'active' : ''}"
              >{zeroCommentCount}</span
            >
          </button>

          <!-- Divider -->
          <div class="filter-divider"></div>

          <!-- Tag Cloud with Show More - Issue #137 -->
          {#if aggregatedLabels.length > 0}
            <div class="filter-section">
              <div class="filter-section-header">
                <span class="filter-label">Labels</span>
                <div class="flex items-center gap-2">
                  {#if labelFilter}
                    <button
                      type="button"
                      onclick={() => (labelFilter = null)}
                      class="filter-action-btn text-amber-400 hover:text-amber-300"
                    >
                      Clear
                    </button>
                  {/if}
                  {#if aggregatedLabels.length > COLLAPSED_LABEL_COUNT}
                    <button
                      type="button"
                      onclick={() => (showAllLabels = !showAllLabels)}
                      class="filter-action-btn text-teal-400 hover:text-teal-300"
                    >
                      {showAllLabels
                        ? 'Show less'
                        : `+${aggregatedLabels.length - COLLAPSED_LABEL_COUNT} more`}
                    </button>
                  {/if}
                </div>
              </div>
              <TagCloud
                labels={aggregatedLabels}
                onTagClick={handleTagClick}
                maxTags={showAllLabels ? 30 : COLLAPSED_LABEL_COUNT}
              />
            </div>
          {/if}

          <!-- Divider -->
          <div class="filter-divider"></div>

          <!-- Sort & Export Row -->
          <div class="filter-section">
            <!-- Sort Row -->
            <div class="control-row">
              <span class="filter-label">Sort</span>
              <div class="control-group">
                <!-- Custom Sort Dropdown -->
                <div class="relative flex-1">
                  <button
                    type="button"
                    onclick={() => (sortDropdownOpen = !sortDropdownOpen)}
                    onblur={() => setTimeout(() => (sortDropdownOpen = false), 150)}
                    class="dropdown-trigger"
                    aria-haspopup="listbox"
                    aria-expanded={sortDropdownOpen}
                    aria-label="Sort by: {SORT_OPTION_LABELS[sortBy]}"
                  >
                    <span>{SORT_OPTION_LABELS[sortBy]}</span>
                    <svg
                      class="w-3 h-3 text-slate-400 transition-transform {sortDropdownOpen
                        ? 'rotate-180'
                        : ''}"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <!-- Dropdown Menu -->
                  {#if sortDropdownOpen}
                    <div class="dropdown-menu" role="listbox">
                      {#each Object.entries(SORT_OPTION_LABELS) as [value, label] (value)}
                        <button
                          type="button"
                          role="option"
                          aria-selected={sortBy === value}
                          onclick={() => {
                            handleSortOptionChange(value as SortOption);
                            sortDropdownOpen = false;
                          }}
                          class="dropdown-option {sortBy === value ? 'selected' : ''}"
                        >
                          {label}
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>
                <!-- Direction Toggle Button -->
                <button
                  type="button"
                  onclick={handleSortDirectionToggle}
                  class="icon-btn"
                  aria-label="Toggle sort direction: currently {sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'}"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                    />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Export Row -->
            <div class="control-row mt-2">
              <span class="filter-label">Export</span>
              <div class="export-buttons">
                <button
                  type="button"
                  onclick={() => exportIssues('markdown')}
                  class="export-btn"
                  title="Export as Markdown"
                >
                  MD
                </button>
                <button
                  type="button"
                  onclick={() => exportIssues('plain')}
                  class="export-btn"
                  title="Export as Plain Text"
                >
                  TXT
                </button>
                <button
                  type="button"
                  onclick={() => exportIssues('csv')}
                  class="export-btn"
                  title="Export as CSV"
                >
                  CSV
                </button>
              </div>
            </div>

            <!-- Share URL Row (Issue #140) -->
            <div class="control-row mt-2">
              <span class="filter-label">Share</span>
              <button
                type="button"
                onclick={handleShareUrl}
                class="share-btn"
                aria-label="Copy shareable URL to clipboard"
                title="Copy shareable URL with current filters"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
                Copy URL
              </button>
            </div>
          </div>

          <!-- Reset filters -->
          {#if showOnlyZeroComments || labelFilter || sortBy !== DEFAULT_SORT_PREFERENCES.sortBy || sortDirection !== DEFAULT_SORT_PREFERENCES.direction}
            <div class="filter-divider"></div>
            <button type="button" onclick={handleClearFilters} class="reset-btn">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset all filters
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </aside>

  <!-- RIGHT MAIN PANEL -->
  <main class="flex-1 min-w-0 p-3 lg:p-4 lg:overflow-y-auto pb-20">
    <!-- Loading State - centered in right panel (Issue #23, #172) -->
    {#if loading && progressState}
      <div class="loading-container" aria-busy="true" aria-label="Loading issues">
        <div class="flex flex-col items-center justify-center mb-4">
          <LoadingProgress
            {progressState}
            onCancelRequest={handleCancelRequest}
            startTime={searchStartTime ?? undefined}
          />
        </div>
        <!-- Skeleton cards for visual content preview (Issue #172) -->
        <div class="grid grid-cols-1 gap-2">
          <IssueCardSkeleton count={4} showLabels={true} />
        </div>
      </div>
    {:else if loading}
      <!-- Fallback spinner if progressState not yet initialized -->
      <div class="loading-container" aria-busy="true" aria-label="Initializing search">
        <div class="flex flex-col items-center justify-center mb-4">
          <div class="relative w-12 h-12 mb-4">
            <div class="animate-spin rounded-full h-12 w-12 border-2 border-slate-700"></div>
            <div
              class="animate-spin rounded-full h-12 w-12 border-2 border-teal-500 border-t-transparent absolute top-0 left-0"
            ></div>
          </div>
          <p class="text-slate-300 text-sm font-medium">Initializing...</p>
        </div>
        <!-- Skeleton cards for visual content preview (Issue #172) -->
        <div class="grid grid-cols-1 gap-2">
          <IssueCardSkeleton count={4} showLabels={true} />
        </div>
      </div>
    {/if}

    <!-- Empty states -->
    {#if emptyStateVariant && !loading}
      <div class="flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
        <div class="max-w-sm">
          <EmptyState
            variant={emptyStateVariant}
            onPrimaryAction={handleEmptyStatePrimaryAction}
            customDescription={emptyStateVariant === 'error' ? error : undefined}
          />
        </div>
      </div>
    {/if}

    <!-- Issues List -->
    {#if issues.length > 0 && !emptyStateVariant && !loading}
      <div class="flex items-center justify-between mb-3">
        <div>
          <h2 class="text-base lg:text-lg font-bold text-white">
            Found {displayedIssues.length} available
            {displayedIssues.length === 1 ? 'issue' : 'issues'}
            {#if showOnlyZeroComments && displayedIssues.length !== issues.length}
              <span class="text-xs text-slate-500 font-normal">of {issues.length}</span>
            {/if}
          </h2>
          <p class="text-[10px] text-slate-500">
            {#if isAuthenticated}Open, unassigned, no PRs{:else}Open & unassigned{/if}
          </p>
        </div>
      </div>

      <div aria-live="polite" aria-atomic="true" class="sr-only" role="status">
        Found {displayedIssues.length} available {displayedIssues.length === 1
          ? 'issue'
          : 'issues'}{showOnlyZeroComments ? ', filtered to easy issues' : ''}{labelFilter
          ? `, filtered by label: ${labelFilter}`
          : ''}, sorted by {SORT_OPTION_LABELS[sortBy]}
        {sortDirection === 'asc' ? 'ascending' : 'descending'}
      </div>

      <div class="space-y-2">
        {#each displayedIssues as issue (issue.number)}
          <IssueCard {issue} {copiedIssueNumber} onCopy={handleCopyIssue} />
        {/each}
      </div>

      <div class="mt-6 text-center py-3">
        <p class="text-[10px] text-slate-500">Pick an issue and start contributing!</p>
      </div>
    {/if}
  </main>
</div>

<!-- Help Button (fixed position) - Brand styled circular FAB -->
<button
  type="button"
  onclick={toggleHelpPopup}
  class="help-button"
  aria-label="How it works - Show help guide"
  aria-expanded={showHelpPopup}
  title="How it works?"
>
  <svg class="help-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
</button>

<!-- Help Popup -->
<HelpPopup show={showHelpPopup} onClose={toggleHelpPopup} />

<!-- Cancel Confirmation Modal (Issue #23) -->
<CancelConfirmModal
  show={showCancelModal}
  issuesLoaded={progressState?.issuesFound ?? 0}
  onContinue={handleCancelContinue}
  onConfirm={handleCancelConfirm}
/>

<style>
  /* Global body styles */
  :global(body) {
    font-family:
      -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell',
      sans-serif;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
    background-attachment: fixed;
    min-height: 100vh;
  }

  /* Sidebar panel - clean background, no overlay */
  .sidebar-panel {
    background: #0f172a;
  }

  @media (min-width: 1024px) {
    .sidebar-panel {
      border-right: 1px solid rgba(71, 85, 105, 0.3);
    }
  }

  /* Sketch card - hand-drawn borders */
  :global(.sketch-card) {
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(16px);
    border-radius: 12px;
    position: relative;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  }

  :global(.sketch-card)::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: transparent;
    border: 2px solid rgba(148, 163, 184, 0.25);
    border-radius: inherit;
    filter: url(#sketch);
    pointer-events: none;
  }

  /* Keyframe Animations */
  @keyframes badge-pulse {
    0%,
    100% {
      box-shadow:
        0 2px 8px rgba(34, 197, 94, 0.4),
        0 0 0 0 rgba(34, 197, 94, 0.4);
    }
    50% {
      box-shadow:
        0 2px 8px rgba(34, 197, 94, 0.4),
        0 0 0 6px rgba(34, 197, 94, 0);
    }
  }

  @keyframes card-glow {
    0%,
    100% {
      box-shadow:
        0 0 20px rgba(34, 197, 94, 0.2),
        0 8px 30px rgba(0, 0, 0, 0.4);
    }
    50% {
      box-shadow:
        0 0 30px rgba(34, 197, 94, 0.35),
        0 8px 30px rgba(0, 0, 0, 0.4);
    }
  }

  /* Zero-comment issue highlight - green glow with animation */
  :global(.zero-comment-highlight) {
    border: 2px solid rgba(34, 197, 94, 0.5);
    background: rgba(34, 197, 94, 0.08);
    box-shadow:
      0 0 20px rgba(34, 197, 94, 0.2),
      0 8px 30px rgba(0, 0, 0, 0.4);
    animation: card-glow 3s ease-in-out infinite;
  }

  :global(.zero-comment-highlight)::before {
    border-color: rgba(34, 197, 94, 0.4);
  }

  /* Easy to Start badge with pulse animation */
  :global(.easy-start-badge) {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.875rem;
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4);
    animation: badge-pulse 2s ease-in-out infinite;
  }

  /* Filter toggle styles */
  :global(.filter-toggle-container) {
    padding: 0.5rem 1rem;
    background: rgba(51, 65, 85, 0.5);
    border-radius: 0.75rem;
    border: 1px solid rgba(71, 85, 105, 0.5);
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;
  }

  :global(.filter-toggle-container):hover {
    background: rgba(51, 65, 85, 0.7);
    border-color: rgba(71, 85, 105, 0.8);
  }

  :global(.toggle-track) {
    position: relative;
    transition: background-color 0.2s ease;
  }

  :global(.toggle-knob) {
    pointer-events: none;
    transition: transform 0.2s ease;
  }

  /* Sketch control - hand-drawn style for buttons/controls */
  :global(.sketch-control) {
    position: relative;
    border-radius: 8px;
    border: 1px solid;
  }

  :global(.sketch-control)::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.15);
    border-radius: inherit;
    filter: url(#sketch-light);
    pointer-events: none;
  }

  /* Hover effect for issue cards */
  :global(.hover-effect) {
    transform-origin: center center;
    transition:
      transform 0.2s ease,
      box-shadow 0.2s ease,
      border-color 0.2s ease,
      background 0.2s ease;
  }

  :global(.hover-effect):hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow:
      0 12px 40px rgba(0, 0, 0, 0.6),
      0 0 20px rgba(20, 184, 166, 0.15);
    border-color: rgba(20, 184, 166, 0.3);
  }

  /* Card flip animation - Issue #125 */
  :global(.card-flip-container) {
    perspective: 1000px;
    position: relative;
  }

  /* Ensure flipped card appears above other cards */
  :global(.card-flip-container:has(.flipped)) {
    z-index: 20;
  }

  :global(.card-flip-inner) {
    position: relative;
    width: 100%;
    transition: transform 0.6s ease-in-out;
    transform-style: preserve-3d;
    /* GPU optimization: will-change applied only during potential interaction */
  }

  :global(.card-flip-container:hover) :global(.card-flip-inner),
  :global(.card-flip-container:focus-within) :global(.card-flip-inner) {
    will-change: transform;
  }

  :global(.card-flip-inner.flipped) {
    transform: rotateY(180deg);
  }

  :global(.card-front),
  :global(.card-back) {
    width: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }

  :global(.card-front) {
    position: relative;
  }

  :global(.card-back) {
    position: absolute;
    top: 0;
    left: 0;
    transform: rotateY(180deg);
  }

  /* Flip button base styling */
  :global(.flip-button) {
    position: absolute;
    right: 0.5rem;
    padding: 0.375rem;
    border-radius: 9999px;
    background: rgba(51, 65, 85, 0.8);
    color: rgb(148, 163, 184);
    border: none;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;
    z-index: 10;
  }

  /* Front flip button - at bottom to avoid Copy/View buttons overlap */
  :global(.flip-button-front) {
    bottom: 0.5rem;
  }

  /* Back flip button - at top since back card has different layout */
  :global(.flip-button-back) {
    top: 0.5rem;
  }

  :global(.flip-button):hover {
    background: rgb(71, 85, 105);
    color: white;
  }

  :global(.flip-button):active {
    transform: scale(0.95);
  }

  :global(.flip-button):focus-visible {
    outline: 2px solid #14b8a6;
    outline-offset: 2px;
  }

  /* Flip button pressed state indicator */
  :global(.flip-button[aria-pressed='true']) {
    background: rgb(20, 184, 166);
    color: white;
  }

  /* Sketch button */
  :global(.sketch-button) {
    position: relative;
    transition: all 0.2s ease;
  }

  :global(.sketch-button)::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: inherit;
    filter: url(#sketch-light);
    pointer-events: none;
  }

  :global(.sketch-button):hover:not(:disabled) {
    transform: translateY(-1px);
  }

  /* Sketch input */
  :global(.sketch-input) {
    border: 2px solid rgba(148, 163, 184, 0.2);
    transition: border-color 0.2s ease;
  }

  :global(.sketch-input):focus {
    border-color: rgba(148, 163, 184, 0.4);
  }

  /* Sketch badge */
  :global(.sketch-badge) {
    position: relative;
  }

  :global(.sketch-badge)::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: inherit;
    filter: url(#sketch-light);
    pointer-events: none;
  }

  /* Issue badge - hand-drawn */
  :global(.issue-badge) {
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;
  }

  :global(.issue-badge)::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: transparent;
    border: 2px solid rgba(148, 163, 184, 0.3);
    border-radius: inherit;
    filter: url(#sketch);
    pointer-events: none;
  }

  :global(.group):hover :global(.issue-badge) {
    transform: scale(1.05) rotate(2deg);
  }

  /* Sketch icons */
  :global(.sketch-icon) {
    position: relative;
  }

  :global(.sketch-icon)::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: transparent;
    border: 2px solid rgba(148, 163, 184, 0.2);
    border-radius: inherit;
    filter: url(#sketch-light);
    pointer-events: none;
  }

  :global(.sketch-icon-small) {
    position: relative;
  }

  :global(.sketch-icon-small)::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.15);
    border-radius: inherit;
    filter: url(#sketch-light);
    pointer-events: none;
  }

  /* Brand header styling */
  .brand-header {
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(71, 85, 105, 0.2);
    margin-bottom: 0.5rem;
  }

  .logo-mark {
    position: relative;
  }

  .logo-mark svg {
    filter: drop-shadow(0 4px 12px rgba(13, 148, 136, 0.4));
  }

  /* ====== FILTER CARD COMPONENT STYLES ====== */

  /* Main filter card container */
  .filter-card {
    background: rgba(30, 41, 59, 0.6);
    backdrop-filter: blur(12px);
    border-radius: 12px;
    border: 1px solid rgba(71, 85, 105, 0.4);
    padding: 0.75rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  /* Easy to Start toggle button */
  .filter-toggle {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.625rem 0.75rem;
    border-radius: 8px;
    border: 1px solid rgba(71, 85, 105, 0.4);
    background: rgba(51, 65, 85, 0.3);
    color: rgb(203, 213, 225);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .filter-toggle:hover {
    background: rgba(51, 65, 85, 0.5);
    border-color: rgba(71, 85, 105, 0.6);
  }

  .filter-toggle.active {
    background: rgba(34, 197, 94, 0.15);
    border-color: rgba(34, 197, 94, 0.4);
    color: rgb(134, 239, 172);
  }

  /* Checkbox inside toggle */
  .toggle-checkbox {
    width: 1rem;
    height: 1rem;
    border-radius: 4px;
    border: 2px solid rgba(100, 116, 139, 0.5);
    background: rgba(30, 41, 59, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.15s ease;
  }

  .toggle-checkbox.checked {
    background: rgb(34, 197, 94);
    border-color: rgb(34, 197, 94);
  }

  /* Count badge in toggle */
  .toggle-count {
    font-size: 0.625rem;
    font-weight: 700;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    background: rgba(51, 65, 85, 0.6);
    color: rgb(148, 163, 184);
  }

  .toggle-count.active {
    background: rgba(34, 197, 94, 0.25);
    color: rgb(134, 239, 172);
  }

  /* Divider between sections */
  .filter-divider {
    height: 1px;
    background: rgba(71, 85, 105, 0.3);
    margin: 0.625rem 0;
  }

  /* Filter section container */
  .filter-section {
    padding: 0.25rem 0;
  }

  /* Section header with label and actions */
  .filter-section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  /* Label text */
  .filter-label {
    font-size: 0.625rem;
    font-weight: 600;
    color: rgb(148, 163, 184);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Action buttons (Clear, +X more) */
  .filter-action-btn {
    font-size: 0.625rem;
    font-weight: 500;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  /* Control row (Sort, Export) */
  .control-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* Control group (dropdown + buttons) */
  .control-group {
    flex: 1;
    display: flex;
    gap: 0.375rem;
  }

  /* Dropdown trigger button */
  .dropdown-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.375rem 0.5rem;
    font-size: 0.625rem;
    font-weight: 500;
    color: rgb(226, 232, 240);
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .dropdown-trigger:hover {
    background: rgba(51, 65, 85, 0.6);
    border-color: rgba(100, 116, 139, 0.5);
  }

  /* Dropdown menu */
  .dropdown-menu {
    position: absolute;
    z-index: 50;
    margin-top: 0.25rem;
    width: 100%;
    background: rgb(30, 41, 59);
    border: 1px solid rgba(71, 85, 105, 0.6);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    overflow: hidden;
  }

  /* Dropdown option */
  .dropdown-option {
    width: 100%;
    padding: 0.5rem 0.625rem;
    font-size: 0.625rem;
    font-weight: 500;
    text-align: left;
    color: rgb(203, 213, 225);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: all 0.1s ease;
  }

  .dropdown-option:hover {
    background: rgba(51, 65, 85, 0.8);
    color: white;
  }

  .dropdown-option.selected {
    background: rgba(20, 184, 166, 0.3);
    color: rgb(94, 234, 212);
  }

  /* Icon button (sort direction) */
  .icon-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.375rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 6px;
    color: rgb(148, 163, 184);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .icon-btn:hover {
    background: rgba(51, 65, 85, 0.6);
    color: white;
    border-color: rgba(100, 116, 139, 0.5);
  }

  /* Export buttons container */
  .export-buttons {
    flex: 1;
    display: flex;
    gap: 0.25rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.4);
    border-radius: 6px;
    padding: 0.125rem;
  }

  /* Export button */
  .export-btn {
    flex: 1;
    padding: 0.25rem 0.375rem;
    font-size: 0.5625rem;
    font-weight: 600;
    color: rgb(148, 163, 184);
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .export-btn:hover {
    background: rgba(51, 65, 85, 0.6);
    color: white;
  }

  /* Share button (Issue #140) */
  .share-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.625rem;
    font-weight: 600;
    color: rgb(148, 163, 184);
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(71, 85, 105, 0.4);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .share-btn:hover {
    background: rgba(20, 184, 166, 0.2);
    border-color: rgba(20, 184, 166, 0.4);
    color: rgb(94, 234, 212);
  }

  .share-btn:active {
    transform: scale(0.98);
  }

  .share-btn:focus-visible {
    outline: 2px solid #14b8a6;
    outline-offset: 2px;
  }

  /* Reset button */
  .reset-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.375rem;
    width: 100%;
    padding: 0.5rem;
    font-size: 0.625rem;
    font-weight: 500;
    color: rgb(251, 191, 36);
    background: transparent;
    border: none;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .reset-btn:hover {
    color: rgb(252, 211, 77);
  }

  /* ====== END FILTER CARD STYLES ====== */

  @media (prefers-reduced-motion: no-preference) {
    .logo-mark svg circle:nth-child(3),
    .logo-mark svg circle:nth-child(4),
    .logo-mark svg circle:nth-child(5) {
      animation: logo-pulse 3s ease-in-out infinite;
    }

    .logo-mark svg circle:nth-child(4) {
      animation-delay: 0.3s;
    }

    .logo-mark svg circle:nth-child(5) {
      animation-delay: 0.6s;
    }

    @keyframes logo-pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }
  }

  /* Help button - Brand styled circular FAB (compact) */
  /* Positioned above footer (footer ~70px height) */
  .help-button {
    position: fixed !important;
    bottom: 5rem !important; /* Above footer */
    right: 1rem !important;
    z-index: 40 !important;

    /* Circular button - compact size */
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 50%;
    cursor: pointer;

    /* Brand teal gradient */
    background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
    color: white;

    /* Shadow glow - subtle */
    box-shadow: 0 3px 12px rgba(20, 184, 166, 0.35);

    /* Transitions */
    transition: all 0.2s ease;

    /* Pulse animation */
    animation: help-glow 3s ease-in-out infinite;
  }

  .help-button:hover {
    background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
    box-shadow: 0 4px 16px rgba(20, 184, 166, 0.45);
    transform: translateY(-1px);
  }

  .help-button:active {
    background: linear-gradient(135deg, #0f766e 0%, #115e59 100%);
    box-shadow: 0 2px 10px rgba(20, 184, 166, 0.3);
    transform: translateY(0) scale(0.98);
  }

  .help-button:focus-visible {
    outline: 2px solid #14b8a6;
    outline-offset: 2px;
  }

  /* Icon styling - compact */
  .help-icon {
    width: 18px;
    height: 18px;
  }

  /* Pulse glow animation - subtle */
  @keyframes help-glow {
    0%,
    100% {
      box-shadow: 0 3px 12px rgba(20, 184, 166, 0.35);
    }
    50% {
      box-shadow: 0 3px 16px rgba(20, 184, 166, 0.5);
    }
  }

  /* Tablet and up: Larger position offset */
  @media (min-width: 768px) {
    .help-button {
      bottom: 5.5rem !important; /* Above footer */
      right: 1.5rem !important;
    }
  }

  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .help-button {
      animation: none;
      transition: none;
    }

    .help-button:hover {
      transform: none;
    }

    .help-button:active {
      transform: none;
    }
  }

  /* Ensure text wrapping on mobile */
  @media (max-width: 640px) {
    :global(*) {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
  }

  /* Smooth transitions */
  :global(*) {
    transition-property:
      background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
    transition-duration: 200ms;
    transition-timing-function: ease-in-out;
  }

  /* Accessibility: Respect user's motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .logo-mark svg circle,
    :global(.easy-start-badge),
    :global(.zero-comment-highlight),
    :global(.animate-pulse) {
      animation: none;
    }

    :global(.toggle-track),
    :global(.toggle-knob),
    :global(.filter-toggle-container),
    :global(.hover-effect),
    :global(.sort-dropdown),
    :global(.card-flip-inner),
    :global(.flip-button) {
      transition: none;
    }

    /* Disable scale on hover, keep shadow only */
    :global(.hover-effect):hover {
      transform: translateY(-2px);
    }

    /* Instant flip without animation */
    :global(.card-flip-inner.flipped) {
      transform: rotateY(180deg);
    }
  }

  /* Accessibility: Enhanced focus indicators for keyboard navigation */
  :global(.sketch-button):focus-visible,
  :global(.sketch-input):focus-visible,
  :global(a):focus-visible {
    outline: 2px solid #14b8a6;
    outline-offset: 2px;
  }

  /* Ensure focus is visible on dark backgrounds */
  :global(:focus-visible) {
    outline: 2px solid #14b8a6;
    outline-offset: 2px;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    :global(.easy-start-badge) {
      background: #22c55e;
      border: 2px solid white;
    }

    :global(.zero-comment-highlight) {
      border-width: 3px;
    }
  }

  /* Custom scrollbar styling - theme-matched */
  :global(*) {
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 116, 139, 0.4) transparent;
  }

  :global(*::-webkit-scrollbar) {
    width: 6px;
    height: 6px;
  }

  :global(*::-webkit-scrollbar-track) {
    background: transparent;
    border-radius: 3px;
  }

  :global(*::-webkit-scrollbar-thumb) {
    background: rgba(100, 116, 139, 0.4);
    border-radius: 3px;
  }

  :global(*::-webkit-scrollbar-thumb:hover) {
    background: rgba(100, 116, 139, 0.6);
  }

  :global(*::-webkit-scrollbar-corner) {
    background: transparent;
  }
</style>
