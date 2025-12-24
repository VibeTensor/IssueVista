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

<!-- Results header - Compact -->
<div class="mb-6 sketch-card p-4 md:p-5 relative z-20">
  <div class="flex flex-col gap-3">
    <!-- Top row: Title and Export -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <!-- Left: Title and info -->
      <div class="text-center md:text-left">
        <h2 class="text-xl md:text-2xl font-bold text-white">
          {displayedIssues.length}
          {displayedIssues.length === 1 ? 'Issue' : 'Issues'} Found
          {#if showOnlyZeroComments && displayedIssues.length !== issues.length}
            <span class="text-sm text-slate-400 font-normal ml-1">(from {issues.length})</span>
          {/if}
        </h2>
        <p class="text-xs text-slate-400 mt-0.5">
          {#if isAuthenticated}
            Open, unassigned, no pull requests
          {:else}
            Open and unassigned · <span class="text-amber-400">Add token to filter PRs</span>
          {/if}
        </p>
      </div>

      <!-- Right: Export Button -->
      <div class="relative flex justify-center md:justify-end">
        <ExportMenu {issues} {repoUrl} />
      </div>
    </div>

    <!-- Filter and Sort Controls -->
    <div
      class="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-3 border-t border-slate-700/50"
    >
      <FilterControls enabled={showOnlyZeroComments} {zeroCommentCount} onToggle={onFilterToggle} />

      <SortControls {sortOrder} {onSortChange} />

      <ClearFiltersButton visible={hasActiveFilters} onClear={onClearFilters} />
    </div>
  </div>
</div>

<!-- Issues grid -->
<div class="grid gap-4">
  {#each displayedIssues as issue (issue.number)}
    <IssueCard {issue} {copiedIssueNumber} onCopy={onCopyIssue} />
  {/each}
</div>

<!-- Success footer - Compact -->
<div class="mt-6 text-center py-6">
  <p class="text-sm text-slate-400">Pick an issue and start contributing!</p>
</div>
