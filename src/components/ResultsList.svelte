<script lang="ts">
  import { onMount } from 'svelte';
  import { GitHubAPI, parseRepoUrl, type GitHubIssue } from '../lib/github-graphql';

  let repoUrl = '';
  let githubToken = '';
  let loading = false;
  let error = '';
  let issues: GitHubIssue[] = [];
  let rateLimit = { remaining: 0, resetAt: '' };

  onMount(() => {
    // Load token from localStorage
    const savedToken = localStorage.getItem('github_token');
    if (savedToken) githubToken = savedToken;

    // Check rate limit on mount
    updateRateLimit();
  });

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

    // Save token to localStorage
    if (githubToken) {
      localStorage.setItem('github_token', githubToken);
    }

    const parsed = parseRepoUrl(repoUrl);
    if (!parsed) {
      error = 'Invalid GitHub repository URL. Format: https://github.com/owner/repo';
      loading = false;
      return;
    }

    try {
      const api = new GitHubAPI(githubToken || undefined);
      issues = await api.fetchAvailableIssues(parsed.owner, parsed.repo);
      await updateRateLimit();

      if (issues.length === 0) {
        error = 'No unassigned issues without PRs found! 🎉';
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
</script>

<div class="max-w-6xl mx-auto px-4 py-8">
  <div class="text-center mb-8">
    <h1 class="text-4xl font-bold text-dark mb-2">GitHub Issues Finder</h1>
    <p class="text-secondary text-lg">Find unassigned issues without pull requests</p>
  </div>

  <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
    <div class="mb-4">
      <label for="repoUrl" class="block text-sm font-medium text-dark mb-2">
        GitHub Repository URL
      </label>
      <input
        id="repoUrl"
        type="text"
        bind:value={repoUrl}
        placeholder="https://github.com/facebook/react"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
        on:keypress={(e) => e.key === 'Enter' && handleSearch()}
      />
    </div>

    <div class="mb-4">
      <label for="token" class="block text-sm font-medium text-dark mb-2">
        GitHub Token (Optional - for higher rate limits)
      </label>
      <input
        id="token"
        type="password"
        bind:value={githubToken}
        placeholder="ghp_xxxxxxxxxxxx"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
      />
      <p class="text-xs text-secondary mt-1">
        Increases rate limit from 60 to 5000 requests/hour. Stored locally only.
      </p>
    </div>

    <button
      on:click={handleSearch}
      disabled={loading || !repoUrl}
      class="w-full bg-primary text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? 'Searching...' : 'Find Available Issues'}
    </button>
  </div>

  {#if rateLimit.remaining !== undefined}
    <div class="text-center text-sm text-secondary mb-4">
      Rate Limit: {rateLimit.remaining} requests remaining
      {#if rateLimit.resetAt}
        (resets in {getResetTime(rateLimit.resetAt)})
      {/if}
    </div>
  {/if}

  {#if loading}
    <div class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
      <p class="text-secondary">Fetching issues...</p>
    </div>
  {/if}

  {#if error}
    <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
      {error}
    </div>
  {/if}

  {#if issues.length > 0}
    <div class="mb-4">
      <h2 class="text-2xl font-bold text-dark mb-2">
        Available Issues
        <span class="text-primary">({issues.length})</span>
      </h2>
    </div>

    <div class="space-y-4">
      {#each issues as issue}
        <div class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-5 border border-gray-200">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-lg font-semibold text-dark hover:text-primary transition-colors"
              >
                #{issue.number} - {issue.title}
              </a>

              <div class="flex items-center gap-4 mt-2 text-sm text-secondary">
                <span>Opened: {formatDate(issue.createdAt)}</span>
                <span>💬 {issue.comments.totalCount} comments</span>
              </div>

              {#if issue.labels.nodes.length > 0}
                <div class="flex flex-wrap gap-2 mt-3">
                  {#each issue.labels.nodes as label}
                    <span
                      class="px-2 py-1 rounded-full text-xs font-medium"
                      style="background-color: #{label.color}20; color: #{label.color};"
                    >
                      {label.name}
                    </span>
                  {/each}
                </div>
              {/if}
            </div>

            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              class="ml-4 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              View Issue →
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }
</style>
