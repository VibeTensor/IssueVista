<!--
  IssueCard Component
  Issue #35 - Extracted from ResultsList.svelte
  Issue #125 - Added flip animation to show issue details
  Issue #181 - Added "Good First Issue" badge for beginner-friendly issues

  Displays a single GitHub issue with:
  - Issue number badge
  - Title with link
  - Created date with freshness indicator
  - Comment count
  - Labels
  - Copy and View action buttons
  - "Easy to Start" badge for zero-comment issues
  - "Good First Issue" badge for issues with good-first-issue label
  - Flip animation to reveal issue body preview
-->

<script lang="ts">
  import type { GitHubIssue } from '../../lib/github-graphql';
  import { getRelativeTime, getExactDateTime, getFreshnessLevel } from '../../lib/time-utils';
  import { isZeroComment, getBodyPreview, hasBody } from '../../lib/issue-utils';

  interface Props {
    issue: GitHubIssue;
    copiedIssueNumber: number | null;
    onCopy: (issueNumber: number) => void;
  }

  let { issue, copiedIssueNumber, onCopy }: Props = $props();

  // Flip state for card animation - Issue #125
  let isFlipped = $state(false);

  /**
   * Format a date string as relative time for display
   */
  function formatDate(dateString: string): string {
    return getRelativeTime(dateString);
  }

  /**
   * Handle copy button click
   */
  function handleCopy() {
    onCopy(issue.number);
  }

  /**
   * Toggle flip state
   */
  function toggleFlip() {
    isFlipped = !isFlipped;
  }

  /**
   * Check if issue has a "good first issue" label (Issue #181)
   * Handles variations: "good first issue", "good-first-issue", etc.
   */
  function hasGoodFirstIssueLabel(): boolean {
    if (!issue.labels?.nodes) return false;
    return issue.labels.nodes.some((label) => {
      const normalized = label.name.toLowerCase().replace(/[\s-]/g, '');
      return normalized === 'goodfirstissue';
    });
  }

  // Derived state
  let isEasyIssue = $derived(isZeroComment(issue));
  let isGoodFirstIssue = $derived(hasGoodFirstIssueLabel());
  let isCopied = $derived(copiedIssueNumber === issue.number);
  let freshnessLevel = $derived(getFreshnessLevel(issue.createdAt));
  let commentText = $derived(
    `${issue.comments.totalCount} ${issue.comments.totalCount === 1 ? 'comment' : 'comments'}`
  );
  let bodyPreview = $derived(getBodyPreview(issue, 180));
  let issueHasBody = $derived(hasBody(issue));

  // Accessibility: screen reader announcement for flip state
  let flipAnnouncement = $derived(
    isFlipped ? `Issue ${issue.number} showing details` : `Issue ${issue.number} showing summary`
  );
</script>

<!-- Screen reader announcement for flip state - Issue #125 -->
{#if issueHasBody}
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    {flipAnnouncement}
  </div>
{/if}

<!-- Flip container wrapper - Issue #125 -->
<div class="card-flip-container">
  <div class="card-flip-inner {isFlipped ? 'flipped' : ''}">
    <!-- Front of card (original content) -->
    <div
      class="card-front group sketch-card hover-effect {isEasyIssue
        ? 'zero-comment-highlight'
        : ''}"
    >
      <!-- Flip button on front - positioned at bottom to avoid Copy/View buttons -->
      {#if issueHasBody}
        <button
          type="button"
          class="flip-button flip-button-front"
          onclick={toggleFlip}
          aria-label={isFlipped ? 'Show issue front' : 'Show issue details'}
          aria-pressed={isFlipped}
          title="Flip to see details"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      {/if}

      <div class="p-2.5 md:p-3">
        <!-- Mobile layout -->
        <div class="md:hidden">
          <div class="flex items-center justify-between gap-2 mb-2">
            <div class="flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded bg-slate-700/80 text-white font-bold text-xs"
                >#{issue.number}</span
              >
              {#if isEasyIssue}
                <span
                  class="text-[10px] text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded font-medium"
                  >Easy</span
                >
              {/if}
              {#if isGoodFirstIssue}
                <span
                  class="text-[10px] text-white bg-emerald-600 px-1.5 py-0.5 rounded-full font-medium"
                  title="Great for first-time contributors">Beginner</span
                >
              {/if}
            </div>
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                onclick={handleCopy}
                class="p-1.5 {isCopied
                  ? 'bg-green-600'
                  : 'bg-slate-700 hover:bg-slate-600'} text-white rounded transition-colors"
                aria-label="Copy link"
                title={isCopied ? 'Copied!' : 'Copy'}
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {#if isCopied}
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  {:else}
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  {/if}
                </svg>
              </button>
              <a
                href={issue.url}
                target="_blank"
                rel="noopener noreferrer"
                class="p-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded transition-colors"
                aria-label="View on GitHub"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>
          <h3
            class="text-sm font-semibold text-white hover:text-slate-200 mb-1.5 leading-snug line-clamp-2"
          >
            <a href={issue.url} target="_blank" rel="noopener noreferrer">{issue.title}</a>
          </h3>
          <div class="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mb-1.5">
            <span class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                /></svg
              >
              <time datetime={issue.createdAt} title={getExactDateTime(issue.createdAt)}
                >{formatDate(issue.createdAt)}</time
              >
              <span
                class="w-1.5 h-1.5 rounded-full {freshnessLevel === 'fresh'
                  ? 'bg-green-500'
                  : freshnessLevel === 'moderate'
                    ? 'bg-amber-500'
                    : 'bg-gray-400'}"
              ></span>
            </span>
            <span class="flex items-center gap-1">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                ><path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                /></svg
              >
              {issue.comments.totalCount}
            </span>
          </div>
          {#if issue.labels.nodes.length > 0}
            <div class="flex flex-wrap gap-1">
              {#each issue.labels.nodes.slice(0, 3) as label (label.name)}
                <span
                  class="px-1.5 py-0.5 rounded text-[9px] font-medium"
                  style="background-color: #{label.color}15; color: #{label.color};"
                  >{label.name}</span
                >
              {/each}
              {#if issue.labels.nodes.length > 3}
                <span
                  class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-700/50 text-slate-400"
                  >+{issue.labels.nodes.length - 3}</span
                >
              {/if}
            </div>
          {/if}
        </div>

        <!-- Desktop layout -->
        <div class="hidden md:flex items-start gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="px-2 py-0.5 rounded bg-slate-700/80 text-white font-bold text-xs"
                >#{issue.number}</span
              >
              {#if isEasyIssue}
                <span
                  class="text-[10px] text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded font-medium"
                  >Easy to Start</span
                >
              {/if}
              {#if isGoodFirstIssue}
                <span
                  class="text-[10px] text-white bg-emerald-600 px-1.5 py-0.5 rounded-full font-medium"
                  title="Great for first-time contributors">Good First Issue</span
                >
              {/if}
            </div>
            <h3
              class="text-sm font-semibold text-white hover:text-slate-200 mb-1.5 leading-snug line-clamp-2"
            >
              <a href={issue.url} target="_blank" rel="noopener noreferrer">{issue.title}</a>
            </h3>
            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-1.5">
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  /></svg
                >
                <time
                  datetime={issue.createdAt}
                  class="cursor-help"
                  title={getExactDateTime(issue.createdAt)}>{formatDate(issue.createdAt)}</time
                >
                <span
                  class="w-1.5 h-1.5 rounded-full {freshnessLevel === 'fresh'
                    ? 'bg-green-500'
                    : freshnessLevel === 'moderate'
                      ? 'bg-amber-500'
                      : 'bg-gray-400'}"
                ></span>
              </span>
              <span class="flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  ><path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  /></svg
                >
                {commentText}
              </span>
            </div>
            {#if issue.labels.nodes.length > 0}
              <div class="flex flex-wrap gap-1">
                {#each issue.labels.nodes.slice(0, 4) as label (label.name)}
                  <span
                    class="px-1.5 py-0.5 rounded text-[10px] font-medium"
                    style="background-color: #{label.color}15; color: #{label.color};"
                    >{label.name}</span
                  >
                {/each}
                {#if issue.labels.nodes.length > 4}
                  <span
                    class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700/50 text-slate-400"
                    >+{issue.labels.nodes.length - 4}</span
                  >
                {/if}
              </div>
            {/if}
          </div>
          <div class="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onclick={handleCopy}
              class="inline-flex items-center gap-1 px-2 py-1.5 {isCopied
                ? 'bg-green-600'
                : 'bg-slate-700 hover:bg-slate-600'} text-white rounded text-xs font-medium transition-colors"
              title={isCopied ? 'Copied!' : 'Copy link'}
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {#if isCopied}
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2.5"
                    d="M5 13l4 4L19 7"
                  />
                {:else}
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                {/if}
              </svg>
              {isCopied ? '✓' : 'Copy'}
            </button>
            <a
              href={issue.url}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 px-2 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-medium transition-colors"
            >
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              View
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Back of card (issue details) - Issue #125 -->
    <div class="card-back sketch-card {isEasyIssue ? 'zero-comment-highlight' : ''}">
      <!-- Flip button on back - positioned at top -->
      <button
        type="button"
        class="flip-button flip-button-back"
        onclick={toggleFlip}
        aria-label="Show issue front"
        aria-pressed={isFlipped}
        title="Flip back"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      <div class="p-3 h-full flex flex-col">
        <!-- Header with issue number -->
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-0.5 rounded bg-slate-700/80 text-white font-bold text-xs"
            >#{issue.number}</span
          >
          <span class="text-xs text-slate-400">Details</span>
        </div>

        <!-- Body preview -->
        <div class="flex-1 min-h-0 mb-3">
          <p class="text-sm text-slate-300 leading-relaxed line-clamp-5">
            {bodyPreview}
          </p>
        </div>

        <!-- Footer with action -->
        <div class="flex items-center justify-between pt-2 border-t border-slate-700/50">
          <span class="text-xs text-slate-500">
            {commentText}
          </span>
          <a
            href={issue.url}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1 px-2 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-medium transition-colors"
          >
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Read Full Issue
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
