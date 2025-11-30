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
  <div class="p-2.5 md:p-3">
    <!-- Mobile layout -->
    <div class="md:hidden">
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-1.5">
          <span class="px-2 py-0.5 rounded bg-slate-700/80 text-white font-bold text-xs">#{issue.number}</span>
          {#if isEasyIssue}
            <span class="text-[10px] text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded font-medium">Easy</span>
          {/if}
        </div>
        <div class="flex items-center gap-1.5">
          <button type="button" onclick={handleCopy} class="p-1.5 {isCopied ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'} text-white rounded transition-colors" aria-label="Copy link" title={isCopied ? 'Copied!' : 'Copy'}>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {#if isCopied}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
              {:else}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              {/if}
            </svg>
          </button>
          <a href={issue.url} target="_blank" rel="noopener noreferrer" class="p-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded transition-colors" aria-label="View on GitHub">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
      <h3 class="text-sm font-semibold text-white hover:text-slate-200 mb-1.5 leading-snug line-clamp-2">
        <a href={issue.url} target="_blank" rel="noopener noreferrer">{issue.title}</a>
      </h3>
      <div class="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 mb-1.5">
        <span class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <time datetime={issue.createdAt} title={getExactDateTime(issue.createdAt)}>{formatDate(issue.createdAt)}</time>
          <span class="w-1.5 h-1.5 rounded-full {freshnessLevel === 'fresh' ? 'bg-green-500' : freshnessLevel === 'moderate' ? 'bg-amber-500' : 'bg-gray-400'}"></span>
        </span>
        <span class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
          {issue.comments.totalCount}
        </span>
      </div>
      {#if issue.labels.nodes.length > 0}
        <div class="flex flex-wrap gap-1">
          {#each issue.labels.nodes.slice(0, 3) as label}
            <span class="px-1.5 py-0.5 rounded text-[9px] font-medium" style="background-color: #{label.color}15; color: #{label.color};">{label.name}</span>
          {/each}
          {#if issue.labels.nodes.length > 3}
            <span class="px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-700/50 text-slate-400">+{issue.labels.nodes.length - 3}</span>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Desktop layout -->
    <div class="hidden md:flex items-start gap-3">
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="px-2 py-0.5 rounded bg-slate-700/80 text-white font-bold text-xs">#{issue.number}</span>
          {#if isEasyIssue}
            <span class="text-[10px] text-green-400 bg-green-500/15 px-1.5 py-0.5 rounded font-medium">Easy to Start</span>
          {/if}
        </div>
        <h3 class="text-sm font-semibold text-white hover:text-slate-200 mb-1.5 leading-snug line-clamp-2">
          <a href={issue.url} target="_blank" rel="noopener noreferrer">{issue.title}</a>
        </h3>
        <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-1.5">
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <time datetime={issue.createdAt} class="cursor-help" title={getExactDateTime(issue.createdAt)}>{formatDate(issue.createdAt)}</time>
            <span class="w-1.5 h-1.5 rounded-full {freshnessLevel === 'fresh' ? 'bg-green-500' : freshnessLevel === 'moderate' ? 'bg-amber-500' : 'bg-gray-400'}"></span>
          </span>
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
            {commentText}
          </span>
        </div>
        {#if issue.labels.nodes.length > 0}
          <div class="flex flex-wrap gap-1">
            {#each issue.labels.nodes.slice(0, 4) as label}
              <span class="px-1.5 py-0.5 rounded text-[10px] font-medium" style="background-color: #{label.color}15; color: #{label.color};">{label.name}</span>
            {/each}
            {#if issue.labels.nodes.length > 4}
              <span class="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700/50 text-slate-400">+{issue.labels.nodes.length - 4}</span>
            {/if}
          </div>
        {/if}
      </div>
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <button type="button" onclick={handleCopy} class="inline-flex items-center gap-1 px-2 py-1.5 {isCopied ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'} text-white rounded text-xs font-medium transition-colors" title={isCopied ? 'Copied!' : 'Copy link'}>
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {#if isCopied}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/>
            {:else}
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            {/if}
          </svg>
          {isCopied ? '✓' : 'Copy'}
        </button>
        <a href={issue.url} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-medium transition-colors">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View
        </a>
      </div>
    </div>
  </div>
</div>
