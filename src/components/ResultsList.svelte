<script lang="ts">
  import { onMount } from 'svelte';
  import { GitHubAPI, parseRepoUrl, type GitHubIssue } from '../lib/github-graphql';
  import GitHubAuth from './GitHubAuth.svelte';

  let repoUrl = '';
  let githubToken = '';
  let loading = false;
  let error = '';
  let issues: GitHubIssue[] = [];
  let rateLimit = { remaining: 0, resetAt: '' };
  let isAuthenticated = false;
  let loadingMessage = 'Fetching issues...';
  let showHelpPopup = false;
  let copiedIssueNumber: number | null = null;
  let copyFeedbackTimeout: number | null = null;

  // Export functionality state
  let showExportDropdown = false;

  function toggleHelpPopup() {
    showHelpPopup = !showHelpPopup;
  }

  onMount(() => {
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) {
      githubToken = savedToken;
      isAuthenticated = true;
    }
    updateRateLimit();
  });

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

  async function updateRateLimit() {
    try {
      const api = new GitHubAPI(githubToken || undefined);
      rateLimit = await api.getRateLimit(githubToken || undefined);
    } catch (e) {
      console.error('Failed to fetch rate limit', e);
    }
  }

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

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  function getResetTime(resetAt: string): string {
    if (!resetAt) return '';
    const resetDate = new Date(resetAt);
    const now = new Date();
    const diff = resetDate.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    return minutes > 0 ? `${minutes} minutes` : 'soon';
  }

  // Copy issue URL to clipboard
  async function copyIssueUrl(issueUrl: string, issueNumber: number) {
    if (!issueUrl) return;

    try {
      await navigator.clipboard.writeText(issueUrl);
      copiedIssueNumber = issueNumber;

      // Clear previous timeout if exists
      if (copyFeedbackTimeout) {
        clearTimeout(copyFeedbackTimeout);
      }

      // Hide feedback after 2 seconds
      copyFeedbackTimeout = window.setTimeout(() => {
        copiedIssueNumber = null;
        copyFeedbackTimeout = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy issue URL:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = issueUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        copiedIssueNumber = issueNumber;

        // Clear previous timeout if exists
        if (copyFeedbackTimeout) {
          clearTimeout(copyFeedbackTimeout);
        }

        // Hide feedback after 2 seconds
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

  // Format issues for export
  function formatIssuesForExport(issuesToFormat: GitHubIssue[], format: 'markdown' | 'plain' | 'csv'): string {
    if (issuesToFormat.length === 0) return '';

    switch (format) {
      case 'markdown':
        return issuesToFormat.map(issue =>
          `- [#${issue.number} ${issue.title}](${issue.url})`
        ).join('\n');

      case 'plain':
        return issuesToFormat.map(issue => issue.url).join('\n');

      case 'csv':
        const header = 'Number,Title,URL';
        const rows = issuesToFormat.map(issue =>
          `${issue.number},"${issue.title.replace(/"/g, '""')}",${issue.url}`
        );
        return [header, ...rows].join('\n');

      default:
        return '';
    }
  }

  // Toggle export dropdown
  function toggleExportDropdown() {
    showExportDropdown = !showExportDropdown;
  }

  // Close export dropdown
  function closeExportDropdown() {
    showExportDropdown = false;
  }

  // Download file with given content and filename
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

  // Export issues as downloadable file
  function exportIssues(format: 'markdown' | 'plain' | 'csv') {
    if (issues.length === 0) return;

    const formattedText = formatIssuesForExport(issues, format);
    showExportDropdown = false;

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
</script>

<!-- SVG Filters for hand-drawn sketch effects -->
<svg width="0" height="0" style="position: absolute; pointer-events: none;">
  <defs>
    <!-- Strong sketch filter for borders -->
    <filter id="sketch" x="-50%" y="-50%" width="200%" height="200%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" result="noise" seed="3" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
    </filter>

    <!-- Light sketch for subtle elements -->
    <filter id="sketch-light" x="-50%" y="-50%" width="200%" height="200%">
      <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise" seed="5" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="1" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
</svg>

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

  <!-- Main search card -->
  <div class="sketch-card p-4 md:p-6 lg:p-8 mb-8">
    <div class="space-y-6">
      <!-- Repository URL Input -->
      <div>
        <label for="repoUrl" class="block text-base font-bold text-white mb-3">
          Repository URL
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="h-6 w-6 text-slate-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </div>
          <input
            id="repoUrl"
            type="text"
            bind:value={repoUrl}
            placeholder="https://github.com/facebook/react"
            class="sketch-input w-full pl-14 pr-4 py-4 text-base text-white rounded-lg outline-none bg-slate-800/80 placeholder-slate-500"
            on:keypress={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>
      </div>

      <!-- Token Input -->
      <div>
        <label for="token" class="block text-base font-bold text-white mb-3">
          {#if isAuthenticated}
            <span class="flex flex-col sm:flex-row sm:items-center gap-2">
              <span>GitHub Token</span>
              <span class="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-200 bg-slate-700/80 px-2.5 py-1 rounded-full sketch-badge w-fit">
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="whitespace-nowrap">Authenticated (5000 req/hr)</span>
              </span>
            </span>
          {:else}
            GitHub Token <span class="text-slate-400 text-sm font-normal">(Optional)</span>
          {/if}
        </label>
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="h-6 w-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            id="token"
            type="password"
            bind:value={githubToken}
            placeholder={isAuthenticated ? "••••••••••••••••••••" : "ghp_xxxxxxxxxxxx"}
            class="sketch-input w-full pl-14 pr-4 py-4 text-base text-white rounded-lg outline-none bg-slate-800/80 placeholder-slate-500"
          />
        </div>
        {#if !isAuthenticated}
          <p class="text-sm text-slate-400 mt-2 flex items-center gap-2">
            <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Works without token (60 req/hr). Stored locally for your privacy.</span>
          </p>
        {/if}
      </div>

      <!-- Search Button -->
      <button
        on:click={handleSearch}
        disabled={loading || !repoUrl}
        class="sketch-button w-full bg-slate-700 text-white py-5 px-8 rounded-lg font-bold text-lg hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed"
      >
        {#if loading}
          <span class="flex items-center justify-center gap-3">
            <svg class="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Searching...</span>
          </span>
        {:else}
          <span class="flex items-center justify-center gap-3">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Find Unassigned Issues (No PRs)</span>
          </span>
        {/if}
      </button>
    </div>
  </div>

  {#if rateLimit.remaining !== undefined && rateLimit.remaining > 0}
    <div class="text-center text-xs md:text-sm mb-6 px-4">
      <div class="inline-flex items-center gap-2 sketch-badge px-3 md:px-4 py-2 rounded-full bg-slate-800/80 max-w-full">
        <svg class="w-4 h-4 text-slate-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span class={`${rateLimit.remaining < 10 ? 'text-amber-400 font-semibold' : 'text-slate-300'} break-words`}>
          {rateLimit.remaining} requests remaining
          {#if rateLimit.resetAt}
            <span class="whitespace-nowrap">(resets in {getResetTime(rateLimit.resetAt)})</span>
          {/if}
        </span>
      </div>
    </div>
  {/if}

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

  {#if issues.length > 0}
    <!-- Results header -->
    <div class="mb-8 sketch-card p-6 md:p-8 relative z-20">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <!-- Left: Title and info -->
        <div class="text-center md:text-left">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2">
            {issues.length} Unassigned {issues.length === 1 ? 'Issue' : 'Issues'} Found
          </h2>
          {#if isAuthenticated}
            <p class="text-base md:text-lg text-slate-300">
              All issues are open, unassigned, and have no pull requests
            </p>
          {:else}
            <p class="text-base md:text-lg text-slate-300 mb-2">
              All issues are open and unassigned
            </p>
            <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-900/30 border border-amber-500/30 rounded-lg">
              <svg class="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span class="text-amber-300 text-xs md:text-sm font-semibold">Add a token to filter out issues with PRs</span>
            </div>
          {/if}
        </div>

        <!-- Right: Export Button -->
        <div class="relative flex justify-center md:justify-end">
          <button
            type="button"
            on:click={toggleExportDropdown}
            disabled={issues.length === 0}
            class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl font-extrabold sketch-button transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Export all issues"
            aria-expanded={showExportDropdown}
            aria-haspopup="true"
          >
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            <span class="text-sm">Export</span>
            <svg class="w-4 h-4 transition-transform {showExportDropdown ? 'rotate-180' : ''} flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Dropdown Menu -->
          {#if showExportDropdown}
            <div
              class="absolute right-0 top-full mt-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden z-50"
              role="menu"
              on:mouseleave={closeExportDropdown}
            >
              <button
                type="button"
                on:click={() => exportIssues('markdown')}
                class="w-full px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-3"
                role="menuitem"
              >
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
                </svg>
                <div>
                  <p class="font-semibold">Markdown (.md)</p>
                  <p class="text-xs text-slate-400">List with titles and links</p>
                </div>
              </button>
              <button
                type="button"
                on:click={() => exportIssues('plain')}
                class="w-full px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-3"
                role="menuitem"
              >
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                </svg>
                <div>
                  <p class="font-semibold">Plain Text (.txt)</p>
                  <p class="text-xs text-slate-400">URLs only, one per line</p>
                </div>
              </button>
              <button
                type="button"
                on:click={() => exportIssues('csv')}
                class="w-full px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-3"
                role="menuitem"
              >
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <div>
                  <p class="font-semibold">CSV (.csv)</p>
                  <p class="text-xs text-slate-400">Spreadsheet format</p>
                </div>
              </button>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Issues grid -->
    <div class="grid gap-6">
      {#each issues as issue}
        <div class="group sketch-card hover-effect">
          <!-- Card content -->
          <div class="p-5 md:p-6">
            <!-- Mobile: Vertical layout -->
            <div class="md:hidden">
              <!-- Top row: Issue badge + Action buttons -->
              <div class="flex items-stretch justify-between gap-4 mb-5">
                <!-- Issue number badge -->
                <div class="flex-shrink-0 w-[100px]">
                  <div class="issue-badge w-full h-full rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center font-black text-white shadow-lg border-2 border-slate-600/30">
                    <span class="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">Issue</span>
                    <span class="text-2xl font-black">{issue.number}</span>
                  </div>
                </div>

                <!-- Action buttons -->
                <div class="flex flex-col gap-2.5 w-[100px] flex-shrink-0">
                  <!-- Copy Link Button -->
                  <button
                    type="button"
                    on:click={() => copyIssueUrl(issue.url, issue.number)}
                    class="flex-1 inline-flex flex-row items-center justify-center gap-2 px-2 {copiedIssueNumber === issue.number ? 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600' : 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600'} text-white rounded-xl font-bold sketch-button transition-all w-full shadow-md"
                    aria-label="Copy issue link for issue {issue.number}"
                    title={copiedIssueNumber === issue.number ? 'Copied!' : 'Copy issue link'}
                  >
                    {#if copiedIssueNumber === issue.number}
                      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span class="font-extrabold text-xs">Copied!</span>
                    {:else}
                      <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                      <span class="font-extrabold text-xs">Copy</span>
                    {/if}
                  </button>

                  <!-- View Issue Button -->
                  <a
                    href={issue.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="flex-1 inline-flex flex-row items-center justify-center gap-2 px-2 bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-xl font-bold hover:from-slate-600 hover:to-slate-700 sketch-button transition-all w-full shadow-md"
                    aria-label="View issue {issue.number} on GitHub"
                  >
                    <svg class="w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <span class="font-extrabold text-xs">View</span>
                  </a>
                </div>
              </div>

              <!-- Content below -->
              <div class="w-full">
                <h3 class="text-xl font-extrabold text-white hover:text-slate-200 transition-colors mb-4 leading-tight break-words line-clamp-2">
                  <a href={issue.url} target="_blank" rel="noopener noreferrer">
                    {issue.title}
                  </a>
                </h3>

                <div class="flex flex-wrap items-center gap-4 mb-4">
                  <div class="flex items-center gap-2 text-slate-300">
                    <div class="w-9 h-9 rounded-lg bg-slate-800/70 flex items-center justify-center">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span class="font-semibold text-sm">{formatDate(issue.createdAt)}</span>
                  </div>

                  <div class="flex items-center gap-2 text-slate-300">
                    <div class="w-9 h-9 rounded-lg bg-slate-800/70 flex items-center justify-center">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <span class="font-semibold text-sm">{issue.comments.totalCount} {issue.comments.totalCount === 1 ? 'comment' : 'comments'}</span>
                  </div>
                </div>

                {#if issue.labels.nodes.length > 0}
                  <div class="flex flex-wrap gap-2">
                    {#each issue.labels.nodes.slice(0, 5) as label}
                      <span
                        class="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                        style="background-color: #{label.color}25; color: #{label.color}; border: 1.5px solid #{label.color}40;"
                      >
                        {label.name}
                      </span>
                    {/each}
                    {#if issue.labels.nodes.length > 5}
                      <span class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700/80 text-slate-300 border border-slate-600/50 shadow-sm">
                        +{issue.labels.nodes.length - 5} more
                      </span>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>

            <!-- Desktop: Horizontal layout -->
            <div class="hidden md:flex items-center gap-6">
              <!-- Issue number badge - Left -->
              <div class="flex-shrink-0 w-[110px]">
                <div class="issue-badge w-full aspect-square rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center font-black text-white shadow-lg border-2 border-slate-600/30">
                  <span class="text-xs font-bold uppercase tracking-wider opacity-60 mb-1">Issue</span>
                  <span class="text-3xl font-black">{issue.number}</span>
                </div>
              </div>

              <!-- Content - Middle (takes remaining space) -->
              <div class="flex-1 min-w-0">
                <h3 class="text-2xl font-extrabold text-white hover:text-slate-200 transition-colors mb-3 leading-tight break-words line-clamp-2">
                  <a href={issue.url} target="_blank" rel="noopener noreferrer">
                    {issue.title}
                  </a>
                </h3>

                <div class="flex flex-wrap items-center gap-4 mb-3">
                  <div class="flex items-center gap-2 text-slate-300">
                    <div class="w-9 h-9 rounded-lg bg-slate-800/70 flex items-center justify-center">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span class="font-semibold text-sm">{formatDate(issue.createdAt)}</span>
                  </div>

                  <div class="flex items-center gap-2 text-slate-300">
                    <div class="w-9 h-9 rounded-lg bg-slate-800/70 flex items-center justify-center">
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <span class="font-semibold text-sm">{issue.comments.totalCount} {issue.comments.totalCount === 1 ? 'comment' : 'comments'}</span>
                  </div>
                </div>

                {#if issue.labels.nodes.length > 0}
                  <div class="flex flex-wrap gap-2">
                    {#each issue.labels.nodes.slice(0, 5) as label}
                      <span
                        class="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm"
                        style="background-color: #{label.color}25; color: #{label.color}; border: 1.5px solid #{label.color}40;"
                      >
                        {label.name}
                      </span>
                    {/each}
                    {#if issue.labels.nodes.length > 5}
                      <span class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700/80 text-slate-300 border border-slate-600/50 shadow-sm">
                        +{issue.labels.nodes.length - 5} more
                      </span>
                    {/if}
                  </div>
                {/if}
              </div>

              <!-- Action buttons - Right -->
              <div class="flex flex-col gap-2.5 w-[110px] flex-shrink-0">
                <!-- Copy Link Button -->
                <button
                  type="button"
                  on:click={() => copyIssueUrl(issue.url, issue.number)}
                  class="inline-flex flex-row items-center justify-center gap-2 py-3 px-2 {copiedIssueNumber === issue.number ? 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600' : 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600'} text-white rounded-xl font-bold sketch-button transition-all w-full shadow-md"
                  aria-label="Copy issue link for issue {issue.number}"
                  title={copiedIssueNumber === issue.number ? 'Copied!' : 'Copy issue link'}
                >
                  {#if copiedIssueNumber === issue.number}
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span class="font-extrabold text-xs">Copied!</span>
                  {:else}
                    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    <span class="font-extrabold text-xs">Copy</span>
                  {/if}
                </button>

                <!-- View Issue Button -->
                <a
                  href={issue.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex flex-row items-center justify-center gap-2 py-3 px-2 bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-xl font-bold hover:from-slate-600 hover:to-slate-700 sketch-button transition-all w-full shadow-md"
                  aria-label="View issue {issue.number} on GitHub"
                >
                  <svg class="w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span class="font-extrabold text-xs">View</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>

    <!-- Success footer -->
    <div class="mt-10 sketch-card p-6 md:p-8">
      <div class="text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center sketch-icon">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="text-3xl font-extrabold text-white mb-2">
          Ready to Contribute
        </p>
        <p class="text-lg text-slate-300">
          Pick an issue above and make your mark on open source
        </p>
      </div>
    </div>
  {/if}
</div>

<!-- Help Button - Fixed to bottom right -->
<button
  on:click={toggleHelpPopup}
  class="help-button help-button-pulse fixed w-14 h-14 md:w-16 md:h-16 bg-slate-700 rounded-full hover:bg-slate-600 transition-all flex items-center justify-center sketch-button shadow-2xl"
  aria-label="Help"
  style="bottom: 1rem; right: 1rem; z-index: 9999;"
>
  <svg class="w-7 h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
</button>

<!-- Help Popup Modal -->
{#if showHelpPopup}
  <div
    class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4"
    on:click={toggleHelpPopup}
  >
    <div
      class="help-popup-scroll sketch-container max-w-3xl w-full max-h-[95vh] md:max-h-[90vh] overflow-y-auto rounded-t-2xl md:rounded-2xl"
      on:click|stopPropagation
    >
      <!-- Header -->
      <div class="sticky top-0 bg-slate-900/98 backdrop-blur px-4 md:px-8 py-4 md:py-6 flex items-center justify-between border-b border-slate-700 z-10">
        <div class="flex items-center gap-3 md:gap-4 min-w-0">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-slate-700 rounded-lg flex items-center justify-center sketch-icon flex-shrink-0">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 class="text-xl md:text-2xl lg:text-3xl font-extrabold text-white truncate">How It Works</h2>
        </div>
        <button
          on:click={toggleHelpPopup}
          class="w-10 h-10 rounded-lg hover:bg-slate-700/50 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="px-4 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6 bg-slate-900/95">
        <!-- Steps -->
        <div class="sketch-card p-4 md:p-6">
          <div class="flex items-start gap-3 md:gap-4">
            <div class="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white text-base md:text-lg sketch-icon-small">1</div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base md:text-lg lg:text-xl font-bold text-white mb-3 break-words">Choose Authentication (Optional)</h3>
              <p class="text-slate-300 text-xs md:text-sm mb-3 break-words">Without token: 60 req/hr · With token: 5000 req/hr</p>

              <!-- Token Generation Substeps -->
              <div class="bg-slate-800/50 rounded-lg p-3 md:p-4 space-y-3">
                <p class="text-white text-xs md:text-sm font-semibold mb-2">How to create a GitHub token:</p>

                <div class="space-y-2">
                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">1</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-300 text-xs md:text-sm break-words">
                        Click <a href="https://github.com/settings/tokens/new?description=IssueFlow&scopes=public_repo" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300 underline">this link</a> or the "Create Token" button
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">2</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-300 text-xs md:text-sm break-words">
                        Authenticate with GitHub (if not logged in)
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">3</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-300 text-xs md:text-sm break-words">
                        Scroll down and check the <span class="font-semibold text-white">"public_repo"</span> scope (should be auto-selected)
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">4</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-300 text-xs md:text-sm break-words">
                        Scroll to bottom and click <span class="font-semibold text-green-400">"Generate token"</span>
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">5</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-300 text-xs md:text-sm break-words">
                        Copy the token (starts with <code class="text-amber-300 text-xs">ghp_</code>)
                      </p>
                    </div>
                  </div>

                  <div class="flex items-start gap-2">
                    <span class="flex-shrink-0 w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">6</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-slate-300 text-xs md:text-sm break-words">
                        Paste it in the "GitHub Token" field above and save it
                      </p>
                    </div>
                  </div>
                </div>

                <div class="flex items-start gap-2 mt-3 pt-3 border-t border-slate-700">
                  <svg class="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-amber-300 text-xs break-words">
                    Save your token somewhere safe! GitHub only shows it once.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="sketch-card p-4 md:p-6">
          <div class="flex items-start gap-3 md:gap-4">
            <div class="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white text-base md:text-lg sketch-icon-small">2</div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base md:text-lg lg:text-xl font-bold text-white mb-2 break-words">Enter Repository URL</h3>
              <p class="text-slate-300 text-xs md:text-sm break-words">Format: https://github.com/owner/repository</p>
            </div>
          </div>
        </div>

        <div class="sketch-card p-4 md:p-6">
          <div class="flex items-start gap-3 md:gap-4">
            <div class="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white text-base md:text-lg sketch-icon-small">3</div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base md:text-lg lg:text-xl font-bold text-white mb-2 break-words">Find Issues</h3>
              <p class="text-slate-300 text-xs md:text-sm mb-2">Automatically filters for:</p>
              <ul class="text-slate-300 text-xs md:text-sm space-y-1 ml-4">
                <li class="flex items-start gap-2">
                  <span class="text-slate-400 flex-shrink-0">•</span>
                  <span class="break-words">Open issues</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-slate-400 flex-shrink-0">•</span>
                  <span class="break-words">Unassigned issues</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-slate-400 flex-shrink-0">•</span>
                  <span class="break-words"><strong>With token:</strong> Excludes issues with PRs</span>
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-amber-400 flex-shrink-0">⚠</span>
                  <span class="text-amber-300 text-xs break-words"><strong>Without token:</strong> PR filtering unavailable</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="sketch-card p-4 md:p-6">
          <div class="flex items-start gap-3 md:gap-4">
            <div class="flex-shrink-0 w-8 h-8 md:w-10 md:h-10 bg-slate-700 rounded-lg flex items-center justify-center font-bold text-white text-base md:text-lg sketch-icon-small">4</div>
            <div class="flex-1 min-w-0">
              <h3 class="text-base md:text-lg lg:text-xl font-bold text-white mb-2 break-words">Start Contributing</h3>
              <p class="text-slate-300 text-xs md:text-sm break-words">Click "View" on any issue to open it on GitHub</p>
            </div>
          </div>
        </div>

        <!-- Privacy Note -->
        <div class="sketch-card p-4 md:p-6 bg-slate-800/40">
          <div class="flex items-start gap-3 md:gap-4">
            <svg class="w-5 h-5 md:w-6 md:h-6 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div class="min-w-0">
              <h3 class="text-base md:text-lg font-bold text-slate-300 mb-2 break-words">Privacy & Security</h3>
              <p class="text-slate-400 text-xs md:text-sm break-words">
                Your GitHub token is stored locally in your browser only. Never sent to any server except GitHub's official API.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-slate-900/98 backdrop-blur px-4 md:px-8 py-4 md:py-6 border-t border-slate-700">
        <button
          on:click={toggleHelpPopup}
          class="w-full bg-slate-700 text-white py-3 md:py-4 px-4 md:px-6 rounded-lg font-bold text-base md:text-lg hover:bg-slate-600 sketch-button"
        >
          Got it! Let's Find Issues
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
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
  .sketch-card {
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(16px);
    border-radius: 12px;
    position: relative;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  }

  .sketch-card::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: transparent;
    border: 2px solid rgba(148, 163, 184, 0.25);
    border-radius: 14px;
    filter: url(#sketch);
    pointer-events: none;
  }

  /* Hover effect for issue cards */
  .hover-effect {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .hover-effect:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  }

  /* Sketch button */
  .sketch-button {
    position: relative;
    transition: all 0.2s ease;
  }

  .sketch-button::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: inherit;
    filter: url(#sketch-light);
    pointer-events: none;
  }

  .sketch-button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  /* Sketch input */
  .sketch-input {
    border: 2px solid rgba(148, 163, 184, 0.2);
    transition: border-color 0.2s ease;
  }

  .sketch-input:focus {
    border-color: rgba(148, 163, 184, 0.4);
  }

  /* Sketch badge */
  .sketch-badge {
    position: relative;
  }

  .sketch-badge::before {
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
  .issue-badge {
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;
  }

  .issue-badge::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: transparent;
    border: 2px solid rgba(148, 163, 184, 0.3);
    border-radius: inherit;
    filter: url(#sketch);
    pointer-events: none;
  }

  .group:hover .issue-badge {
    transform: scale(1.05) rotate(2deg);
  }

  /* Sketch icons */
  .sketch-icon {
    position: relative;
  }

  .sketch-icon::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: transparent;
    border: 2px solid rgba(148, 163, 184, 0.2);
    border-radius: inherit;
    filter: url(#sketch-light);
    pointer-events: none;
  }

  .sketch-icon-small {
    position: relative;
  }

  .sketch-icon-small::before {
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

  /* Respect user's motion preferences for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .help-button-pulse {
      animation: none;
    }
  }

  /* Ensure text wrapping on mobile */
  @media (max-width: 640px) {
    * {
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
  }

  /* Smooth transitions */
  * {
    transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
    transition-duration: 200ms;
    transition-timing-function: ease-in-out;
  }

  /* Custom scrollbar for help popup */
  /* Note: 8px width balances aesthetics with usability. Increase if user feedback indicates difficulty grabbing. */
  .help-popup-scroll {
    scrollbar-width: thin;
    scrollbar-color: rgba(100, 116, 139, 0.6) transparent;
  }

  .help-popup-scroll::-webkit-scrollbar {
    width: 8px;
  }

  .help-popup-scroll::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 10px;
  }

  .help-popup-scroll::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.6);
    border-radius: 10px;
    transition: background 0.2s ease;
  }

  .help-popup-scroll::-webkit-scrollbar-thumb:hover {
    background: rgba(148, 163, 184, 0.8);
  }

  /* Smooth scrolling */
  .help-popup-scroll {
    scroll-behavior: smooth;
  }
</style>
