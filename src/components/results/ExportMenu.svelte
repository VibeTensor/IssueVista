<!--
  ExportMenu Component
  Issue #35 - Extracted from ResultsList.svelte

  Dropdown menu for exporting issues in different formats:
  - Markdown (.md) - List with titles and links
  - Plain Text (.txt) - URLs only
  - CSV (.csv) - Spreadsheet format
-->

<script lang="ts">
  import { parseRepoUrl, type GitHubIssue } from '../../lib/github-graphql';

  interface Props {
    issues: GitHubIssue[];
    repoUrl: string;
    disabled?: boolean;
  }

  let { issues, repoUrl, disabled = false }: Props = $props();

  let showDropdown = $state(false);

  /**
   * Format issues for export in the specified format
   */
  function formatIssuesForExport(
    issuesToFormat: GitHubIssue[],
    format: 'markdown' | 'plain' | 'csv'
  ): string {
    if (issuesToFormat.length === 0) return '';

    switch (format) {
      case 'markdown':
        return issuesToFormat
          .map(
            (issue) => `- [#${issue.number} ${issue.title.replace(/[[\]]/g, '\\$&')}](${issue.url})`
          )
          .join('\n');

      case 'plain':
        return issuesToFormat.map((issue) => issue.url).join('\n');

      case 'csv': {
        const header = 'Number,Title,URL';
        const rows = issuesToFormat.map(
          (issue) =>
            `${issue.number},"${issue.title.replace(/"/g, '""').replace(/\r?\n/g, ' ')}",${issue.url}`
        );
        return [header, ...rows].join('\n');
      }

      default:
        return '';
    }
  }

  /**
   * Toggle dropdown visibility
   */
  function toggleDropdown() {
    showDropdown = !showDropdown;
  }

  /**
   * Close dropdown
   */
  function closeDropdown() {
    showDropdown = false;
  }

  /**
   * Download file with given content and filename
   */
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

  /**
   * Export issues as downloadable file
   */
  function exportIssues(format: 'markdown' | 'plain' | 'csv') {
    if (issues.length === 0) return;

    const formattedText = formatIssuesForExport(issues, format);
    showDropdown = false;

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

  // Derived state
  let isDisabled = $derived(disabled || issues.length === 0);
</script>

<div class="relative">
  <button
    type="button"
    onclick={toggleDropdown}
    disabled={isDisabled}
    class="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/60 hover:bg-slate-600/80 text-slate-300 hover:text-white rounded text-[10px] font-medium transition-colors disabled:opacity-50"
    aria-label="Export issues"
    aria-expanded={showDropdown}
    aria-haspopup="true"
  >
    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
    Export
    <svg
      class="w-2.5 h-2.5 {showDropdown ? 'rotate-180' : ''}"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
    </svg>
  </button>

  {#if showDropdown}
    <div
      class="absolute left-0 top-full mt-1 w-36 bg-slate-800 rounded shadow-lg border border-slate-700 overflow-hidden z-50"
      role="menu"
      onmouseleave={closeDropdown}
      onkeydown={(e) => e.key === 'Escape' && closeDropdown()}
    >
      <button
        type="button"
        onclick={() => exportIssues('markdown')}
        class="w-full px-2.5 py-1.5 text-left text-[10px] text-slate-300 hover:bg-slate-700 hover:text-white"
        role="menuitem"
      >
        Markdown (.md)
      </button>
      <button
        type="button"
        onclick={() => exportIssues('plain')}
        class="w-full px-2.5 py-1.5 text-left text-[10px] text-slate-300 hover:bg-slate-700 hover:text-white"
        role="menuitem"
      >
        Plain Text (.txt)
      </button>
      <button
        type="button"
        onclick={() => exportIssues('csv')}
        class="w-full px-2.5 py-1.5 text-left text-[10px] text-slate-300 hover:bg-slate-700 hover:text-white"
        role="menuitem"
      >
        CSV (.csv)
      </button>
    </div>
  {/if}
</div>
