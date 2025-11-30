<!--
  IssuesList Component
  Issue #35 - Extracted from ResultsList.svelte

  Container for displaying the list of GitHub issues with:
  - Results header with count
  - Export menu
  - Filter and sort controls
  - Issues grid
  - Success footer

  Composes: ExportMenu, FilterControls, SortControls, ClearFiltersButton, IssueCard
-->

<script lang="ts">
  import type { GitHubIssue } from '../../lib/github-graphql';
  import type { CommentSortOrder } from '../../lib/issue-utils';
  import ExportMenu from './ExportMenu.svelte';
  import FilterControls from './FilterControls.svelte';
  import SortControls from './SortControls.svelte';
  import ClearFiltersButton from './ClearFiltersButton.svelte';
  import IssueCard from './IssueCard.svelte';

  interface Props {
    issues: GitHubIssue[];
    displayedIssues: GitHubIssue[];
    repoUrl: string;
    isAuthenticated: boolean;
    showOnlyZeroComments: boolean;
    sortOrder: CommentSortOrder | 'default';
    zeroCommentCount: number;
    copiedIssueNumber: number | null;
    onFilterToggle: (enabled: boolean) => void;
    onSortChange: (order: CommentSortOrder | 'default') => void;
    onClearFilters: () => void;
    onCopyIssue: (issueNumber: number) => void;
  }

  let {
    issues,
    displayedIssues,
    repoUrl,
    isAuthenticated,
    showOnlyZeroComments,
    sortOrder,
    zeroCommentCount,
    copiedIssueNumber,
    onFilterToggle,
    onSortChange,
    onClearFilters,
    onCopyIssue
  }: Props = $props();

  // Derived state for filter announcement
  let filterAnnouncement = $derived.by(() => {
    const parts: string[] = [];
    if (showOnlyZeroComments) {
      parts.push('Showing easy issues only');
    }
    if (sortOrder !== 'default') {
      parts.push(`Sorted by ${sortOrder === 'asc' ? 'fewest' : 'most'} comments`);
    }
    if (parts.length === 0) {
      return `Showing all ${displayedIssues.length} issues`;
    }
    return `${parts.join('. ')}. ${displayedIssues.length} issues shown.`;
  });

  // Derived: are filters active?
  let hasActiveFilters = $derived(showOnlyZeroComments || sortOrder !== 'default');
</script>

<!-- Accessibility: Live region for announcing filter/sort changes to screen readers -->
<div aria-live="polite" aria-atomic="true" class="sr-only" role="status">
  {filterAnnouncement}
</div>

<!-- Results header -->
<div class="mb-8 sketch-card p-6 md:p-8 relative z-20">
  <div class="flex flex-col gap-4">
    <!-- Top row: Title and Export -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <!-- Left: Title and info -->
      <div class="text-center md:text-left">
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-2">
          {displayedIssues.length} Unassigned {displayedIssues.length === 1 ? 'Issue' : 'Issues'} Found
          {#if showOnlyZeroComments && displayedIssues.length !== issues.length}
            <span class="text-lg text-slate-400 font-normal">(filtered from {issues.length})</span>
          {/if}
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
        <ExportMenu {issues} {repoUrl} />
      </div>
    </div>

    <!-- Filter and Sort Controls -->
    <div class="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-4 border-t border-slate-700/50">
      <FilterControls
        enabled={showOnlyZeroComments}
        {zeroCommentCount}
        onToggle={onFilterToggle}
      />

      <SortControls
        {sortOrder}
        onSortChange={onSortChange}
      />

      <ClearFiltersButton
        visible={hasActiveFilters}
        onClear={onClearFilters}
      />
    </div>
  </div>
</div>

<!-- Issues grid -->
<div class="grid gap-6">
  {#each displayedIssues as issue, i (issue.number)}
    <IssueCard
      {issue}
      {copiedIssueNumber}
      onCopy={onCopyIssue}
      style={`animation-delay: ${i * 120}ms`}
    />
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
