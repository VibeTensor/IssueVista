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
  import { SVGFilters } from '../shared';
  import {
    SearchForm,
    RateLimitDisplay,
    IssuesList,
    HelpPopup,
    ExportMenu
  } from './index';

  // Core state
  let repoUrl = $state('');
  let githubToken = $state('');
  let loading = $state(false);
  let error = $state('');
  let issues = $state<GitHubIssue[]>([]);
  let loadingMessage = $state('Fetching issues...');

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

      if (issues.length === 0) {
        error = 'No unassigned issues found. Try another repository or all issues may have PRs.';
      }
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

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  <!-- Header -->
  <div class="text-center mb-8 md:mb-12">
    <div class="sketch-container inline-block px-6 py-6 md:px-12 md:py-8 max-w-full">
      <h1 class="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-2 sketch-title break-words">
        IssueFlow
      </h1>
      <p class="text-slate-300 text-base md:text-lg lg:text-xl mb-2 md:mb-3 break-words px-2">
        Find Unassigned Issues with No PRs
      </p>
      <p class="text-slate-400 text-xs md:text-sm lg:text-base break-words px-2">
        Discover open-source contribution opportunities · Start contributing today
      </p>
    </div>
  </div>

  <!-- Auth prompt -->
  {#if import.meta.env.PUBLIC_GITHUB_CLIENT_ID}
    <div class="mb-8">
      <GitHubAuth onAuthChange={handleAuthChange} />
    </div>
  {:else if !isAuthenticated}
    <div class="mb-8 sketch-card p-4 md:p-6">
      <div class="flex flex-col md:flex-row items-start gap-4 md:gap-5">
        <div class="flex-shrink-0">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-700 flex items-center justify-center sketch-icon">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
        <div class="flex-1 min-w-0 w-full">
          <h3 class="text-lg md:text-xl font-bold text-white mb-2 break-words">Unlock Full Speed</h3>
          <p class="text-sm md:text-base text-slate-300 mb-4 leading-relaxed break-words">
            <span class="font-semibold text-slate-400">Without token:</span> 60 requests/hour ·
            <span class="font-semibold text-slate-200">With token:</span> 5000 requests/hour (83x faster)
          </p>
          <a
            href="https://github.com/settings/tokens/new?description=IssueFlow&scopes=public_repo"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 font-semibold sketch-button text-sm md:text-base w-full md:w-auto"
          >
            <svg class="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span class="truncate">Create Token in 30 Seconds</span>
          </a>
          <p class="text-xs md:text-sm text-slate-400 mt-3 flex items-start gap-2 break-words">
            <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Select "public_repo" scope and paste token below</span>
          </p>
        </div>
      </div>
    </div>
  {/if}

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

  <!-- Rate Limit Display -->
  {#if rateLimit.remaining !== undefined && rateLimit.remaining > 0}
    <RateLimitDisplay
      remaining={rateLimit.remaining}
      resetTime={getResetTime(rateLimit.resetAt)}
    />
  {/if}

  <!-- Loading State -->
  {#if loading}
    <div class="sketch-card p-8 md:p-12 flex flex-col items-center justify-center text-center">
      <div class="relative mb-6 w-16 h-16 mx-auto">
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-slate-700"></div>
        <div class="animate-spin rounded-full h-16 w-16 border-4 border-slate-400 border-t-transparent absolute top-0 left-0"></div>
      </div>
      <p class="text-white font-semibold mb-2 text-base md:text-lg px-4">{loadingMessage}</p>
      <p class="text-xs md:text-sm text-slate-400 px-4">This may take a few seconds...</p>
      <div class="mt-4 flex gap-2 items-center justify-center">
        <div class="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
        <div class="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
        <div class="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
      </div>
    </div>
  {/if}

  <!-- Error State -->
  {#if error}
    <div class="sketch-card px-6 py-4 mb-4 bg-red-950/30">
      <div class="flex items-center gap-3">
        <svg class="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-red-300">{error}</span>
      </div>
    </div>
  {/if}

  <!-- Issues List -->
  {#if issues.length > 0}
    <IssuesList
      {issues}
      {displayedIssues}
      {repoUrl}
      {isAuthenticated}
      {showOnlyZeroComments}
      {sortOrder}
      {zeroCommentCount}
      {copiedIssueNumber}
      onFilterToggle={handleFilterToggle}
      onSortChange={handleSortChange}
      onClearFilters={handleClearFilters}
      onCopyIssue={handleCopyIssue}
    />
  {/if}
</div>

<!-- Help Button (fixed position) -->
<button
  type="button"
  onclick={toggleHelpPopup}
  class="help-button sketch-card w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg hover:bg-slate-700/80 help-button-pulse"
  aria-label="Show help"
  aria-expanded={showHelpPopup}
>
  <svg class="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  /* Sketch container - hand-drawn look */
  .sketch-container {
    background: rgba(30, 41, 59, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 16px;
    position: relative;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  }

  .sketch-container::before {
    content: '';
    position: absolute;
    inset: -3px;
    background: transparent;
    border: 3px solid rgba(148, 163, 184, 0.3);
    border-radius: 18px;
    filter: url(#sketch);
    pointer-events: none;
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

  /* Title underline sketch */
  .sketch-title {
    position: relative;
    padding-bottom: 8px;
  }

  .sketch-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 10%;
    right: 10%;
    height: 3px;
    background: rgba(148, 163, 184, 0.4);
    filter: url(#sketch-light);
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

  /* Help button pulse animation */
  @keyframes pulse-scale {
    0%, 100% {
      transform: scale(1);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 10px 50px rgba(148, 163, 184, 0.4);
    }
  }

  .help-button-pulse {
    animation: pulse-scale 2s ease-in-out infinite;
  }

  .help-button-pulse:hover {
    animation-play-state: paused;
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
    .help-button-pulse,
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
    outline: 2px solid #4ade80;
    outline-offset: 2px;
  }

  /* Ensure focus is visible on dark backgrounds */
  :global(:focus-visible) {
    outline: 2px solid #4ade80;
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
