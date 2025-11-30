<!--
  ResultsContainer Component
  Issue #35 - Main orchestrator extracted from ResultsList.svelte

  Responsibilities:
  - State management (issues, loading, error, filters)
  - API calls coordination
  - Event handling from child components
  - Layout composition

  Composes: SearchForm, RateLimitDisplay, IssuesList, HelpPopup, SVGFilters
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { GitHubAPI, parseRepoUrl, type GitHubIssue } from '../../lib/github-graphql';
  import { countZeroCommentIssues, sortByComments, isZeroComment, type CommentSortOrder } from '../../lib/issue-utils';
  import GitHubAuth from '../GitHubAuth.svelte';
  import { SVGFilters, EmptyState } from '../shared';
  import {
    detectEmptyStateVariant,
    isRateLimitError,
    type EmptyStateVariant
  } from '../../lib/empty-state-utils';
  import {
    SearchForm,
    RateLimitDisplay,
    HelpPopup,
    IssueCard
  } from './index';

  // Core state
  let repoUrl = $state('');
  let githubToken = $state('');
  let loading = $state(false);
  let error = $state('');
  let issues = $state<GitHubIssue[]>([]);
  let loadingMessage = $state('Fetching issues...');
  let hasSearched = $state(false);

  // Rate limit state
  let rateLimit = $state({ remaining: 0, resetAt: '' });
  let isAuthenticated = $state(false);

  // UI state
  let showHelpPopup = $state(false);
  let copiedIssueNumber = $state<number | null>(null);
  let copyFeedbackTimeout: number | null = null;

  // Filter state
  let showOnlyZeroComments = $state(false);
  let sortOrder = $state<CommentSortOrder | 'default'>('default');

  // Derived: filtered and sorted issues
  let displayedIssues = $derived.by(() => {
    let result = issues;

    // Apply zero-comment filter
    if (showOnlyZeroComments) {
      result = result.filter(isZeroComment);
    }

    // Apply sort by comments
    if (sortOrder !== 'default') {
      result = sortByComments(result, sortOrder);
    }

    return result;
  });

  // Derived: count of zero-comment issues
  let zeroCommentCount = $derived(countZeroCommentIssues(issues));

  // Derived: detect which empty state variant to show (if any)
  let emptyStateVariant = $derived(detectEmptyStateVariant({
    hasSearched,
    isLoading: loading,
    error: error || null,
    resultsCount: issues.length
  }));

  // Initialize on mount
  onMount(() => {
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      githubToken = savedToken;
      isAuthenticated = true;
    }
    updateRateLimit();
  });

  // Cleanup timeout on component destroy
  onDestroy(() => {
    if (copyFeedbackTimeout) {
      clearTimeout(copyFeedbackTimeout);
    }
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

  // Handle search
  async function handleSearch() {
    error = '';
    issues = [];
    loading = true;
    loadingMessage = 'Initializing...';
    hasSearched = true;

    if (githubToken) {
      localStorage.setItem('github_token', githubToken);
      isAuthenticated = true;
    } else {
      isAuthenticated = false;
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      error = 'Invalid GitHub repository URL. Format: https://github.com/owner/repo';
      loading = false;
      return;
    }

    try {
      loadingMessage = `Fetching issues from ${parsed.owner}/${parsed.repo}...`;
      const api = new GitHubAPI(githubToken || undefined);
      const result = await api.fetchAvailableIssues(parsed.owner, parsed.repo);
      issues = result.issues;
      rateLimit = result.rateLimit;
      // Note: Empty results (issues.length === 0) are handled by EmptyState component
    } catch (e: any) {
      error = e.message || 'Failed to fetch issues';
    } finally {
      loading = false;
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

  // Handle sort change
  function handleSortChange(order: CommentSortOrder | 'default') {
    sortOrder = order;
  }

  // Handle clear filters
  function handleClearFilters() {
    showOnlyZeroComments = false;
    sortOrder = 'default';
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
    const issue = issues.find(i => i.number === issueNumber);
    if (!issue?.url) return;

    try {
      await navigator.clipboard.writeText(issue.url);
      copiedIssueNumber = issueNumber;

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

  // Export issues
  function exportIssues(format: 'markdown' | 'plain' | 'csv') {
    if (issues.length === 0) return;

    let content = '';
    const timestamp = new Date().toISOString().split('T')[0];
    const parsed = parseRepoUrl(repoUrl);
    const repoName = parsed ? `${parsed.owner}-${parsed.repo}` : 'issues';

    switch (format) {
      case 'markdown':
        content = issues.map(issue =>
          `- [#${issue.number} ${issue.title.replace(/[\[\]]/g, '\\$&')}](${issue.url})`
        ).join('\n');
        downloadFile(content, `${repoName}-issues-${timestamp}.md`, 'text/markdown');
        break;
      case 'plain':
        content = issues.map(issue => issue.url).join('\n');
        downloadFile(content, `${repoName}-issues-${timestamp}.txt`, 'text/plain');
        break;
      case 'csv':
        const header = 'Number,Title,URL';
        const rows = issues.map(issue =>
          `${issue.number},"${issue.title.replace(/"/g, '""').replace(/\r?\n/g, ' ')}",${issue.url}`
        );
        content = [header, ...rows].join('\n');
        downloadFile(content, `${repoName}-issues-${timestamp}.csv`, 'text/csv');
        break;
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
  <aside class="sidebar-panel lg:w-[300px] xl:w-[320px] lg:flex-shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto">
    <div class="p-3 lg:p-4 space-y-3">
      <!-- Brand Header - Using favicon design -->
      <div class="brand-header text-center py-3">
        <!-- Logo - Issues flowing through pipeline (matches favicon.svg) -->
        <div class="logo-mark inline-flex items-center justify-center mb-2">
          <svg class="w-14 h-14 lg:w-16 lg:h-16" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Background circle -->
            <circle cx="64" cy="64" r="56" fill="#0d9488"/>
            <!-- Flowing S-curve path -->
            <path d="M 20 64 Q 44 30, 64 64 Q 84 98, 108 64" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round"/>
            <!-- Three issue nodes -->
            <circle cx="32" cy="50" r="10" fill="#ffffff"/>
            <circle cx="64" cy="64" r="12" fill="#ffffff"/>
            <circle cx="96" cy="78" r="10" fill="#ffffff"/>
            <!-- Checkmarks inside -->
            <path d="M 27 50 L 30 53 L 37 46" stroke="#0d9488" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M 58 64 L 62 68 L 70 58" stroke="#0d9488" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M 91 78 L 94 81 L 101 74" stroke="#0d9488" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
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
      />

      <!-- Auth prompt - User-friendly token generation guide -->
      {#if import.meta.env.PUBLIC_GITHUB_CLIENT_ID}
        <GitHubAuth onAuthChange={handleAuthChange} />
      {:else if !isAuthenticated}
        <div class="auth-prompt p-2.5 bg-gradient-to-r from-amber-500/10 to-teal-500/10 border border-amber-500/30 rounded-lg">
          <div class="flex items-start gap-2">
            <svg class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div class="flex-1 min-w-0">
              <p class="text-[11px] text-slate-300 font-medium mb-1">Boost your rate limit</p>
              <p class="text-[10px] text-slate-400 mb-2">Without token: <span class="text-slate-300">60 requests/hr</span></p>
              <a
                href="https://github.com/settings/tokens/new?description=IssueFlow&scopes=public_repo"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-[10px] font-semibold rounded transition-colors"
              >
                <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                Generate Token (5000/hr)
              </a>
            </div>
          </div>
        </div>
      {/if}

      <!-- Rate Limit -->
      {#if rateLimit.remaining !== undefined && rateLimit.remaining > 0}
        <RateLimitDisplay remaining={rateLimit.remaining} resetTime={getResetTime(rateLimit.resetAt)} />
      {/if}

      <!-- Filter/Sort Controls - Compact inline design -->
      {#if issues.length > 0 && !emptyStateVariant}
        <div class="filters-card p-2.5 space-y-2.5">
          <!-- Easy issues toggle -->
          <button
            type="button"
            onclick={() => handleFilterToggle(!showOnlyZeroComments)}
            class="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-all {showOnlyZeroComments ? 'bg-emerald-500/20 border border-emerald-500/40' : 'bg-slate-700/40 border border-slate-600/30 hover:bg-slate-700/60'}"
            aria-pressed={showOnlyZeroComments}
          >
            <div class="flex items-center gap-1.5">
              <div class="w-4 h-4 rounded flex items-center justify-center {showOnlyZeroComments ? 'bg-emerald-500' : 'bg-slate-600'}">
                <svg class="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span class="text-[10px] font-medium {showOnlyZeroComments ? 'text-emerald-300' : 'text-slate-300'}">Easy to Start</span>
            </div>
            <span class="text-[9px] font-bold px-1 py-0.5 rounded {showOnlyZeroComments ? 'bg-emerald-500/30 text-emerald-300' : 'bg-slate-600/50 text-slate-400'}">{zeroCommentCount}</span>
          </button>

          <!-- Sort - Vertical layout with clear labels -->
          <div class="space-y-1.5">
            <span class="text-[10px] text-slate-300 font-medium">Sort by Comments</span>
            <div class="flex rounded bg-slate-800/60 p-0.5 border border-slate-700/40">
              <button type="button" onclick={() => handleSortChange('default')} class="flex-1 px-2 py-1.5 text-[10px] font-medium rounded transition-all {sortOrder === 'default' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}">Default</button>
              <button type="button" onclick={() => handleSortChange('asc')} class="flex-1 px-2 py-1.5 text-[10px] font-medium rounded transition-all {sortOrder === 'asc' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}">Fewest</button>
              <button type="button" onclick={() => handleSortChange('desc')} class="flex-1 px-2 py-1.5 text-[10px] font-medium rounded transition-all {sortOrder === 'desc' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}">Most</button>
            </div>
          </div>

          <!-- Export - Vertical layout with clear labels -->
          <div class="space-y-1.5">
            <span class="text-[10px] text-slate-300 font-medium">Export As</span>
            <div class="flex rounded bg-slate-800/60 p-0.5 border border-slate-700/40">
              <button type="button" onclick={() => exportIssues('markdown')} class="flex-1 px-2 py-1.5 text-[10px] font-medium rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">Markdown</button>
              <button type="button" onclick={() => exportIssues('plain')} class="flex-1 px-2 py-1.5 text-[10px] font-medium rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">Text</button>
              <button type="button" onclick={() => exportIssues('csv')} class="flex-1 px-2 py-1.5 text-[10px] font-medium rounded text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all">CSV</button>
            </div>
          </div>

          {#if showOnlyZeroComments || sortOrder !== 'default'}
            <button type="button" onclick={handleClearFilters} class="text-[9px] text-amber-400 hover:text-amber-300 font-medium">Reset filters</button>
          {/if}
        </div>
      {/if}

    </div>
  </aside>

  <!-- RIGHT MAIN PANEL -->
  <main class="flex-1 min-w-0 p-3 lg:p-4 lg:overflow-y-auto">
    <!-- Loading State - centered in right panel -->
    {#if loading}
      <div class="flex flex-col items-center justify-center min-h-[300px] lg:min-h-[400px]">
        <div class="relative w-12 h-12 mb-4">
          <div class="animate-spin rounded-full h-12 w-12 border-2 border-slate-700"></div>
          <div class="animate-spin rounded-full h-12 w-12 border-2 border-teal-500 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <p class="text-slate-300 text-sm font-medium">{loadingMessage}</p>
      </div>
    {/if}

    <!-- Empty states -->
    {#if emptyStateVariant && !loading}
      <div class="flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
        <div class="max-w-sm">
          <EmptyState variant={emptyStateVariant} onPrimaryAction={handleEmptyStatePrimaryAction} customDescription={emptyStateVariant === 'error' ? error : undefined} />
        </div>
      </div>
    {/if}

    <!-- Issues List -->
    {#if issues.length > 0 && !emptyStateVariant && !loading}
      <div class="flex items-center justify-between mb-3">
        <div>
          <h2 class="text-base lg:text-lg font-bold text-white">
            {displayedIssues.length} {displayedIssues.length === 1 ? 'Issue' : 'Issues'}
            {#if showOnlyZeroComments && displayedIssues.length !== issues.length}
              <span class="text-xs text-slate-500 font-normal">of {issues.length}</span>
            {/if}
          </h2>
          <p class="text-[10px] text-slate-500">{#if isAuthenticated}Open, unassigned, no PRs{:else}Open & unassigned{/if}</p>
        </div>
      </div>

      <div aria-live="polite" aria-atomic="true" class="sr-only" role="status">
        Showing {displayedIssues.length} issues{showOnlyZeroComments ? ', filtered to easy issues' : ''}{sortOrder !== 'default' ? `, sorted by ${sortOrder === 'asc' ? 'fewest' : 'most'} comments` : ''}
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

<!-- Help Button (fixed position) -->
<button
  type="button"
  onclick={toggleHelpPopup}
  class="help-button sketch-card w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700/80"
  aria-label="Show help"
  aria-expanded={showHelpPopup}
>
  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
</button>

<!-- Help Popup -->
<HelpPopup
  show={showHelpPopup}
  onClose={toggleHelpPopup}
/>

<style>
  /* Global body styles */
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
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
    0%, 100% {
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4), 0 0 0 0 rgba(34, 197, 94, 0.4);
    }
    50% {
      box-shadow: 0 2px 8px rgba(34, 197, 94, 0.4), 0 0 0 6px rgba(34, 197, 94, 0);
    }
  }

  @keyframes card-glow {
    0%, 100% {
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.2), 0 8px 30px rgba(0, 0, 0, 0.4);
    }
    50% {
      box-shadow: 0 0 30px rgba(34, 197, 94, 0.35), 0 8px 30px rgba(0, 0, 0, 0.4);
    }
  }

  /* Zero-comment issue highlight - green glow with animation */
  :global(.zero-comment-highlight) {
    border: 2px solid rgba(34, 197, 94, 0.5);
    background: rgba(34, 197, 94, 0.08);
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.2), 0 8px 30px rgba(0, 0, 0, 0.4);
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
    transition: background-color 0.2s ease, border-color 0.2s ease;
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

  /* Sort dropdown styles */
  :global(.sort-dropdown) {
    appearance: none;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
  }

  :global(.sort-dropdown) option {
    background: #1e293b;
    color: white;
  }

  /* Hover effect for issue cards */
  :global(.hover-effect) {
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  }

  :global(.hover-effect):hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
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

  /* Filters card styling */
  .filters-card {
    background: rgba(30, 41, 59, 0.5);
    backdrop-filter: blur(8px);
    border-radius: 10px;
    border: 1px solid rgba(71, 85, 105, 0.3);
    overflow: hidden;
  }

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
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
  }

  /* Help button fixed positioning */
  .help-button {
    position: fixed !important;
    bottom: 1rem !important;
    right: 1rem !important;
    z-index: 9999 !important;
    border-radius: 9999px !important;
  }

  @media (min-width: 768px) {
    .help-button {
      bottom: 2rem !important;
      right: 2rem !important;
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
    transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
    transition-duration: 200ms;
    transition-timing-function: ease-in-out;
  }

  /* Accessibility: Respect user's motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .logo-mark svg circle,
    :global(.easy-start-badge),
    :global(.zero-comment-highlight) {
      animation: none;
    }

    :global(.toggle-track),
    :global(.toggle-knob),
    :global(.filter-toggle-container),
    :global(.hover-effect),
    :global(.sort-dropdown) {
      transition: none;
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
</style>
