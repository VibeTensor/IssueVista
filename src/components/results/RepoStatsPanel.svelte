<!--
  RepoStatsPanel Component
  Issue #147 - Repository Statistics Summary Panel

  Displays aggregated repository statistics in a collapsible panel.
  Shows stars, forks, issues, and watchers count.

  Accessibility features:
  - Collapsible with aria-expanded
  - Keyboard navigable (Enter/Space to toggle)
  - Screen reader friendly labels
-->

<script lang="ts">
  import type { RepoStats } from '../../lib/github-graphql';

  interface Props {
    stats: RepoStats | null;
    loading?: boolean;
    repoName?: string;
  }

  let { stats, loading = false, repoName = '' }: Props = $props();

  let isExpanded = $state(true);

  /**
   * Format large numbers with K/M suffix
   */
  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
  }

  function toggleExpanded() {
    isExpanded = !isExpanded;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpanded();
    }
  }
</script>

{#if stats || loading}
  <div class="stats-panel" role="region" aria-label="Repository statistics">
    <!-- Collapsible Header -->
    <button
      type="button"
      class="stats-header"
      onclick={toggleExpanded}
      onkeydown={handleKeydown}
      aria-expanded={isExpanded}
      aria-controls="stats-content"
    >
      <div class="header-left">
        <svg
          class="header-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span class="header-title">Repository Stats</span>
        {#if repoName}
          <span class="header-repo">{repoName}</span>
        {/if}
      </div>
      <svg
        class="chevron-icon {isExpanded ? 'expanded' : ''}"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Stats Content -->
    {#if isExpanded}
      <div id="stats-content" class="stats-content">
        {#if loading}
          <!-- Loading skeleton -->
          <div class="stats-grid">
            {#each Array(4) as _, i (i)}
              <div class="stat-item skeleton">
                <div class="skeleton-icon"></div>
                <div class="skeleton-text"></div>
              </div>
            {/each}
          </div>
        {:else if stats}
          <div class="stats-grid" role="group" aria-label="Repository metrics">
            <!-- Stars -->
            <div class="stat-item">
              <svg
                class="stat-icon star"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                />
              </svg>
              <div class="stat-info">
                <span class="stat-value">{formatNumber(stats.stargazersCount)}</span>
                <span class="stat-label">Stars</span>
              </div>
            </div>

            <!-- Forks -->
            <div class="stat-item">
              <svg
                class="stat-icon fork"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 3v6m0 0a3 3 0 106 0M6 9a3 3 0 006 0m0 0V3m6 6v6m0-6a3 3 0 10-6 0m6 0a3 3 0 00-6 0m0 12v-6"
                />
              </svg>
              <div class="stat-info">
                <span class="stat-value">{formatNumber(stats.forksCount)}</span>
                <span class="stat-label">Forks</span>
              </div>
            </div>

            <!-- Open Issues -->
            <div class="stat-item">
              <svg
                class="stat-icon issue"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke-width="2" />
                <circle cx="12" cy="12" r="3" fill="currentColor" />
              </svg>
              <div class="stat-info">
                <span class="stat-value">{formatNumber(stats.openIssuesCount)}</span>
                <span class="stat-label">Issues</span>
              </div>
            </div>

            <!-- Watchers -->
            <div class="stat-item">
              <svg
                class="stat-icon watcher"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <div class="stat-info">
                <span class="stat-value">{formatNumber(stats.watchersCount)}</span>
                <span class="stat-label">Watchers</span>
              </div>
            </div>
          </div>

          <!-- Language badge if available -->
          {#if stats.language}
            <div class="language-badge">
              <span class="language-dot"></span>
              <span class="language-name">{stats.language}</span>
            </div>
          {/if}
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style>
  .stats-panel {
    background: var(--theme-bg-card, rgba(30, 41, 59, 0.6));
    backdrop-filter: blur(12px);
    border-radius: 12px;
    border: 1px solid var(--theme-border, rgba(71, 85, 105, 0.4));
    margin-bottom: 1rem;
    overflow: hidden;
  }

  .stats-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--theme-text-primary, white);
    transition: background-color 0.15s ease;
  }

  .stats-header:hover {
    background: var(--theme-bg-tertiary, rgba(51, 65, 85, 0.3));
  }

  .stats-header:focus-visible {
    outline: 2px solid #14b8a6;
    outline-offset: -2px;
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .header-icon {
    width: 1rem;
    height: 1rem;
    color: var(--theme-accent, #14b8a6);
  }

  .header-title {
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .header-repo {
    font-size: 0.625rem;
    font-weight: 400;
    color: var(--theme-text-muted, rgb(148, 163, 184));
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chevron-icon {
    width: 1rem;
    height: 1rem;
    color: var(--theme-text-muted, rgb(148, 163, 184));
    transition: transform 0.2s ease;
  }

  .chevron-icon.expanded {
    transform: rotate(180deg);
  }

  .stats-content {
    padding: 0 1rem 0.75rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  @media (max-width: 640px) {
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem;
    background: var(--theme-bg-secondary, rgba(30, 41, 59, 0.5));
    border-radius: 8px;
    border: 1px solid var(--theme-border, rgba(71, 85, 105, 0.3));
  }

  .stat-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  .stat-icon.star {
    color: #fbbf24;
  }

  .stat-icon.fork {
    color: #a78bfa;
  }

  .stat-icon.issue {
    color: #34d399;
  }

  .stat-icon.watcher {
    color: #60a5fa;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .stat-value {
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--theme-text-primary, white);
    line-height: 1.2;
  }

  .stat-label {
    font-size: 0.625rem;
    color: var(--theme-text-muted, rgb(148, 163, 184));
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  /* Language badge */
  .language-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    margin-top: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: var(--theme-bg-tertiary, rgba(51, 65, 85, 0.4));
    border-radius: 9999px;
    font-size: 0.625rem;
    color: var(--theme-text-secondary, rgb(203, 213, 225));
  }

  .language-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: var(--theme-accent, #14b8a6);
  }

  /* Loading skeleton */
  .stat-item.skeleton {
    background: var(--theme-bg-secondary, rgba(30, 41, 59, 0.5));
  }

  .skeleton-icon {
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      var(--theme-bg-tertiary, rgba(51, 65, 85, 0.4)) 25%,
      var(--theme-bg-secondary, rgba(30, 41, 59, 0.6)) 50%,
      var(--theme-bg-tertiary, rgba(51, 65, 85, 0.4)) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  .skeleton-text {
    width: 2.5rem;
    height: 1.5rem;
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      var(--theme-bg-tertiary, rgba(51, 65, 85, 0.4)) 25%,
      var(--theme-bg-secondary, rgba(30, 41, 59, 0.6)) 50%,
      var(--theme-bg-tertiary, rgba(51, 65, 85, 0.4)) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .chevron-icon {
      transition: none;
    }

    .skeleton-icon,
    .skeleton-text {
      animation: none;
    }
  }
</style>
