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
  function formatIssuesForExport(issuesToFormat: GitHubIssue[], format: 'markdown' | 'plain' | 'csv'): string {
    if (issuesToFormat.length === 0) return '';

    switch (format) {
      case 'markdown':
        return issuesToFormat.map(issue =>
          `- [#${issue.number} ${issue.title.replace(/[\[\]]/g, '\\$&')}](${issue.url})`
        ).join('\n');

      case 'plain':
        return issuesToFormat.map(issue => issue.url).join('\n');

      case 'csv': {
        const header = 'Number,Title,URL';
        const rows = issuesToFormat.map(issue =>
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
    class="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white rounded-xl font-extrabold sketch-button transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    aria-label="Export all issues"
    aria-expanded={showDropdown}
    aria-haspopup="true"
  >
    <!-- Download icon -->
    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
    </svg>
    <span class="text-sm">Export</span>
    <!-- Chevron icon -->
    <svg class="w-4 h-4 transition-transform {showDropdown ? 'rotate-180' : ''} flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
    </svg>
  </button>

  <!-- Dropdown Menu -->
  {#if showDropdown}
    <div
      class="absolute right-0 top-full mt-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden z-50"
      role="menu"
      onmouseleave={closeDropdown}
      onkeydown={(e) => e.key === 'Escape' && closeDropdown()}
    >
      <!-- Markdown option -->
      <button
        type="button"
        onclick={() => exportIssues('markdown')}
        class="w-full px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-3"
        role="menuitem"
      >
        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"/>
        </svg>
        <div>
          <p class="font-semibold">Markdown (.md)</p>
          <p class="text-xs text-slate-400">List with titles and links</p>
        </div>
      </button>

      <!-- Plain Text option -->
      <button
        type="button"
        onclick={() => exportIssues('plain')}
        class="w-full px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-3"
        role="menuitem"
      >
        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
        </svg>
        <div>
          <p class="font-semibold">Plain Text (.txt)</p>
          <p class="text-xs text-slate-400">URLs only, one per line</p>
        </div>
      </button>

      <!-- CSV option -->
      <button
        type="button"
        onclick={() => exportIssues('csv')}
        class="w-full px-4 py-3 text-left text-white hover:bg-slate-700 transition-colors flex items-center gap-3"
        role="menuitem"
      >
        <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
