<!--
  IssueCard Component
  Issue #35 - Extracted from ResultsList.svelte

  Displays a single GitHub issue with:
  - Issue number badge
  - Title with link
  - Created date with freshness indicator
  - Comment count
  - Labels
  - Copy and View action buttons
  - "Easy to Start" badge for zero-comment issues
-->

<script lang="ts">
  import type { GitHubIssue } from '../../lib/github-graphql';
  import { getRelativeTime, getExactDateTime, getFreshnessLevel } from '../../lib/time-utils';
  import { isZeroComment } from '../../lib/issue-utils';

  interface Props {
    issue: GitHubIssue;
    copiedIssueNumber: number | null;
    onCopy: (issueNumber: number) => void;
  }

  let { issue, copiedIssueNumber, onCopy }: Props = $props();

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

  // Derived state
  let isEasyIssue = $derived(isZeroComment(issue));
  let isCopied = $derived(copiedIssueNumber === issue.number);
  let freshnessLevel = $derived(getFreshnessLevel(issue.createdAt));
  let commentText = $derived(`${issue.comments.totalCount} ${issue.comments.totalCount === 1 ? 'comment' : 'comments'}`);
</script>

<div class="group sketch-card hover-effect {isEasyIssue ? 'zero-comment-highlight' : ''}">
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
            onclick={handleCopy}
            class="flex-1 inline-flex flex-row items-center justify-center gap-2 px-2 {isCopied ? 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600' : 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600'} text-white rounded-xl font-bold sketch-button transition-all w-full shadow-md"
            aria-label="Copy issue link for issue {issue.number}"
            title={isCopied ? 'Copied!' : 'Copy issue link'}
          >
            {#if isCopied}
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              </svg>
              <span class="font-extrabold text-xs">Copied!</span>
            {:else}
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
            <svg class="w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span class="font-extrabold text-xs">View</span>
          </a>
        </div>
      </div>

      <!-- Content below -->
      <div class="w-full">
        <!-- Easy to Start badge for zero-comment issues (Mobile) -->
        {#if isEasyIssue}
          <div class="mb-3">
            <span class="easy-start-badge" role="status" aria-label="Easy to start - this issue has no comments and is beginner-friendly">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Easy to Start!
            </span>
          </div>
        {/if}

        <h3 class="text-xl font-extrabold text-white hover:text-slate-200 transition-colors mb-4 leading-tight break-words line-clamp-2">
          <a href={issue.url} target="_blank" rel="noopener noreferrer">
            {issue.title}
          </a>
        </h3>

        <div class="flex flex-wrap items-center gap-4 mb-4">
          <div class="flex items-center gap-2 text-slate-300">
            <div class="w-9 h-9 rounded-lg bg-slate-800/70 flex items-center justify-center">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <time
              datetime={issue.createdAt}
              class="font-semibold text-sm cursor-help"
              title={getExactDateTime(issue.createdAt)}
              aria-label={`Created ${formatDate(issue.createdAt)}, ${getExactDateTime(issue.createdAt)}`}
            >
              {formatDate(issue.createdAt)}
            </time>
            {#if freshnessLevel === 'fresh'}
              <span class="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true" title="Fresh issue (less than 7 days old)"></span>
              <span class="sr-only">Fresh issue</span>
            {:else if freshnessLevel === 'moderate'}
              <span class="w-2 h-2 bg-amber-500 rounded-full" aria-hidden="true" title="Moderate age (7-30 days old)"></span>
              <span class="sr-only">Moderately old issue</span>
            {:else}
              <span class="w-2 h-2 bg-gray-400 rounded-full" aria-hidden="true" title="Stale issue (over 30 days old)"></span>
              <span class="sr-only">Stale issue</span>
            {/if}
          </div>

          <div class="flex items-center gap-2 text-slate-300">
            <div class="w-9 h-9 rounded-lg bg-slate-800/70 flex items-center justify-center">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <span class="font-semibold text-sm">{commentText}</span>
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
        <!-- Easy to Start badge for zero-comment issues (Desktop) -->
        {#if isEasyIssue}
          <div class="mb-2">
            <span class="easy-start-badge" role="status" aria-label="Easy to start - this issue has no comments and is beginner-friendly">
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              Easy to Start!
            </span>
          </div>
        {/if}

        <h3 class="text-2xl font-extrabold text-white hover:text-slate-200 transition-colors mb-3 leading-tight break-words line-clamp-2">
          <a href={issue.url} target="_blank" rel="noopener noreferrer">
            {issue.title}
          </a>
        </h3>

        <div class="flex flex-wrap items-center gap-4 mb-3">
          <div class="flex items-center gap-2 text-slate-300">
            <div class="w-9 h-9 rounded-lg bg-slate-800/70 flex items-center justify-center">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <time
              datetime={issue.createdAt}
              class="font-semibold text-sm cursor-help"
              title={getExactDateTime(issue.createdAt)}
              aria-label={`Created ${formatDate(issue.createdAt)}, ${getExactDateTime(issue.createdAt)}`}
            >
              {formatDate(issue.createdAt)}
            </time>
            {#if freshnessLevel === 'fresh'}
              <span class="w-2 h-2 bg-green-500 rounded-full" aria-hidden="true" title="Fresh issue (less than 7 days old)"></span>
              <span class="sr-only">Fresh issue</span>
            {:else if freshnessLevel === 'moderate'}
              <span class="w-2 h-2 bg-amber-500 rounded-full" aria-hidden="true" title="Moderate age (7-30 days old)"></span>
              <span class="sr-only">Moderately old issue</span>
            {:else}
              <span class="w-2 h-2 bg-gray-400 rounded-full" aria-hidden="true" title="Stale issue (over 30 days old)"></span>
              <span class="sr-only">Stale issue</span>
            {/if}
          </div>

          <div class="flex items-center gap-2 text-slate-300">
            <div class="w-9 h-9 rounded-lg bg-slate-800/70 flex items-center justify-center">
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <span class="font-semibold text-sm">{commentText}</span>
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
          onclick={handleCopy}
          class="inline-flex flex-row items-center justify-center gap-2 py-3 px-2 {isCopied ? 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600' : 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600'} text-white rounded-xl font-bold sketch-button transition-all w-full shadow-md"
          aria-label="Copy issue link for issue {issue.number}"
          title={isCopied ? 'Copied!' : 'Copy issue link'}
        >
          {#if isCopied}
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            </svg>
            <span class="font-extrabold text-xs">Copied!</span>
          {:else}
            <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
          <svg class="w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span class="font-extrabold text-xs">View</span>
        </a>
      </div>
    </div>
  </div>
</div>
