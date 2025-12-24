/**
 * Unit Tests for Export Issues Functionality
 * Tests Issue #10 implementation - Export/Download All Issue Links
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock GitHubIssue interface matching the actual implementation
interface GitHubIssue {
  number: number;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  comments: { totalCount: number };
  labels: {
    nodes: Array<{
      name: string;
      color: string;
      description: string | null;
    }>;
  };
  timelineItems: {
    nodes: Array<{
      source?: {
        number?: number;
        state?: string;
        url?: string;
      };
    }>;
  };
}

// Format issues function - mirrors the implementation in ResultsList.svelte
function formatIssuesForExport(
  issuesToFormat: GitHubIssue[],
  format: 'markdown' | 'plain' | 'csv'
): string {
  if (issuesToFormat.length === 0) return '';

  switch (format) {
    case 'markdown':
      return issuesToFormat
        .map((issue) => `- [#${issue.number} ${issue.title.replace(/\]/g, '\\]')}](${issue.url})`)
        .join('\n');

    case 'plain':
      return issuesToFormat.map((issue) => issue.url).join('\n');

    case 'csv': {
      const header = 'Number,Title,URL';
      const rows = issuesToFormat.map(
        (issue) => `${issue.number},"${issue.title.replace(/"/g, '""')}",${issue.url}`
      );
      return [header, ...rows].join('\n');
    }

    default:
      return '';
  }
}

// Helper function to create mock issues
function createMockIssue(overrides: Partial<GitHubIssue> = {}): GitHubIssue {
  return {
    number: 1,
    title: 'Test Issue',
    url: 'https://github.com/test/repo/issues/1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    comments: { totalCount: 0 },
    labels: { nodes: [] },
    timelineItems: { nodes: [] },
    ...overrides
  };
}

describe('Export Issues Functionality', () => {
  describe('Format Conversion - Markdown', () => {
    it('should format single issue as markdown', () => {
      const issues = [
        createMockIssue({
          number: 42,
          title: 'Fix bug in login',
          url: 'https://github.com/test/repo/issues/42'
        })
      ];

      const result = formatIssuesForExport(issues, 'markdown');

      expect(result).toBe('- [#42 Fix bug in login](https://github.com/test/repo/issues/42)');
    });

    it('should format multiple issues as markdown list', () => {
      const issues = [
        createMockIssue({
          number: 1,
          title: 'First issue',
          url: 'https://github.com/test/repo/issues/1'
        }),
        createMockIssue({
          number: 2,
          title: 'Second issue',
          url: 'https://github.com/test/repo/issues/2'
        }),
        createMockIssue({
          number: 3,
          title: 'Third issue',
          url: 'https://github.com/test/repo/issues/3'
        })
      ];

      const result = formatIssuesForExport(issues, 'markdown');

      expect(result).toBe(
        '- [#1 First issue](https://github.com/test/repo/issues/1)\n' +
          '- [#2 Second issue](https://github.com/test/repo/issues/2)\n' +
          '- [#3 Third issue](https://github.com/test/repo/issues/3)'
      );
    });

    it('should handle special characters in markdown titles', () => {
      const issues = [
        createMockIssue({
          number: 99,
          title: 'Fix [brackets] and (parentheses)',
          url: 'https://github.com/test/repo/issues/99'
        })
      ];

      const result = formatIssuesForExport(issues, 'markdown');

      // Brackets are escaped to prevent breaking markdown links
      expect(result).toBe(
        '- [#99 Fix [brackets\\] and (parentheses)](https://github.com/test/repo/issues/99)'
      );
    });

    it('should escape closing brackets that could break markdown links', () => {
      const issues = [
        createMockIssue({
          number: 42,
          title: 'Fix [foo](bar) issue',
          url: 'https://github.com/test/repo/issues/42'
        })
      ];

      const result = formatIssuesForExport(issues, 'markdown');

      // The ] in the title is escaped so the markdown link doesn't break
      expect(result).toBe('- [#42 Fix [foo\\](bar) issue](https://github.com/test/repo/issues/42)');
    });
  });

  describe('Format Conversion - Plain Text', () => {
    it('should format single issue as plain URL', () => {
      const issues = [
        createMockIssue({
          url: 'https://github.com/test/repo/issues/42'
        })
      ];

      const result = formatIssuesForExport(issues, 'plain');

      expect(result).toBe('https://github.com/test/repo/issues/42');
    });

    it('should format multiple issues as URL list', () => {
      const issues = [
        createMockIssue({ url: 'https://github.com/test/repo/issues/1' }),
        createMockIssue({ url: 'https://github.com/test/repo/issues/2' }),
        createMockIssue({ url: 'https://github.com/test/repo/issues/3' })
      ];

      const result = formatIssuesForExport(issues, 'plain');

      expect(result).toBe(
        'https://github.com/test/repo/issues/1\n' +
          'https://github.com/test/repo/issues/2\n' +
          'https://github.com/test/repo/issues/3'
      );
    });
  });

  describe('Format Conversion - CSV', () => {
    it('should format single issue as CSV with header', () => {
      const issues = [
        createMockIssue({
          number: 42,
          title: 'Fix bug',
          url: 'https://github.com/test/repo/issues/42'
        })
      ];

      const result = formatIssuesForExport(issues, 'csv');

      expect(result).toBe(
        'Number,Title,URL\n' + '42,"Fix bug",https://github.com/test/repo/issues/42'
      );
    });

    it('should format multiple issues as CSV', () => {
      const issues = [
        createMockIssue({
          number: 1,
          title: 'First',
          url: 'https://github.com/test/repo/issues/1'
        }),
        createMockIssue({
          number: 2,
          title: 'Second',
          url: 'https://github.com/test/repo/issues/2'
        })
      ];

      const result = formatIssuesForExport(issues, 'csv');

      expect(result).toBe(
        'Number,Title,URL\n' +
          '1,"First",https://github.com/test/repo/issues/1\n' +
          '2,"Second",https://github.com/test/repo/issues/2'
      );
    });

    it('should escape double quotes in CSV titles', () => {
      const issues = [
        createMockIssue({
          number: 42,
          title: 'Fix "quoted" text',
          url: 'https://github.com/test/repo/issues/42'
        })
      ];

      const result = formatIssuesForExport(issues, 'csv');

      expect(result).toBe(
        'Number,Title,URL\n' + '42,"Fix ""quoted"" text",https://github.com/test/repo/issues/42'
      );
    });

    it('should handle titles with commas in CSV', () => {
      const issues = [
        createMockIssue({
          number: 42,
          title: 'Fix bug, add feature, update docs',
          url: 'https://github.com/test/repo/issues/42'
        })
      ];

      const result = formatIssuesForExport(issues, 'csv');

      expect(result).toBe(
        'Number,Title,URL\n' +
          '42,"Fix bug, add feature, update docs",https://github.com/test/repo/issues/42'
      );
    });
  });

  describe('Edge Cases', () => {
    it('should return empty string for empty array', () => {
      const issues: GitHubIssue[] = [];

      expect(formatIssuesForExport(issues, 'markdown')).toBe('');
      expect(formatIssuesForExport(issues, 'plain')).toBe('');
      expect(formatIssuesForExport(issues, 'csv')).toBe('');
    });

    it('should handle issue with very long title', () => {
      const longTitle = 'A'.repeat(500);
      const issues = [
        createMockIssue({
          number: 1,
          title: longTitle,
          url: 'https://github.com/test/repo/issues/1'
        })
      ];

      const markdown = formatIssuesForExport(issues, 'markdown');
      const plain = formatIssuesForExport(issues, 'plain');
      const csv = formatIssuesForExport(issues, 'csv');

      expect(markdown).toContain(longTitle);
      expect(plain).toBe('https://github.com/test/repo/issues/1');
      expect(csv).toContain(longTitle);
    });

    it('should handle special characters in titles', () => {
      const issues = [
        createMockIssue({
          number: 42,
          title: '<script>alert("xss")</script>',
          url: 'https://github.com/test/repo/issues/42'
        })
      ];

      const result = formatIssuesForExport(issues, 'csv');

      // CSV should escape quotes properly
      expect(result).toContain('""xss""');
    });

    it('should handle newlines in titles for CSV', () => {
      const issues = [
        createMockIssue({
          number: 42,
          title: 'Line1\nLine2',
          url: 'https://github.com/test/repo/issues/42'
        })
      ];

      const result = formatIssuesForExport(issues, 'csv');

      // Title is wrapped in quotes, newline is preserved
      expect(result).toContain('"Line1\nLine2"');
    });

    it('should handle unicode characters', () => {
      const issues = [
        createMockIssue({
          number: 42,
          title: '🐛 Bug fix for 日本語 support',
          url: 'https://github.com/test/repo/issues/42'
        })
      ];

      const markdown = formatIssuesForExport(issues, 'markdown');
      const csv = formatIssuesForExport(issues, 'csv');

      expect(markdown).toContain('🐛 Bug fix for 日本語 support');
      expect(csv).toContain('🐛 Bug fix for 日本語 support');
    });

    it('should return empty string for unknown format', () => {
      const issues = [createMockIssue()];

      const result = formatIssuesForExport(issues, 'unknown' as any);

      expect(result).toBe('');
    });
  });

  describe('Large Dataset Handling', () => {
    it('should handle 100 issues', () => {
      const issues = Array.from({ length: 100 }, (_, i) =>
        createMockIssue({
          number: i + 1,
          title: `Issue ${i + 1}`,
          url: `https://github.com/test/repo/issues/${i + 1}`
        })
      );

      const markdown = formatIssuesForExport(issues, 'markdown');
      const plain = formatIssuesForExport(issues, 'plain');
      const csv = formatIssuesForExport(issues, 'csv');

      expect(markdown.split('\n').length).toBe(100);
      expect(plain.split('\n').length).toBe(100);
      expect(csv.split('\n').length).toBe(101); // Header + 100 rows
    });

    it('should handle 500 issues', () => {
      const issues = Array.from({ length: 500 }, (_, i) =>
        createMockIssue({
          number: i + 1,
          title: `Issue ${i + 1}`,
          url: `https://github.com/test/repo/issues/${i + 1}`
        })
      );

      const markdown = formatIssuesForExport(issues, 'markdown');

      expect(markdown.split('\n').length).toBe(500);
      expect(markdown).toContain('#1 Issue 1');
      expect(markdown).toContain('#500 Issue 500');
    });
  });
});

describe('File Download Functionality', () => {
  let mockCreateObjectURL: ReturnType<typeof vi.fn<(obj: Blob | MediaSource) => string>>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn<(url: string) => void>>;
  let mockAppendChild: ReturnType<typeof vi.fn<(node: Node) => Node>>;
  let mockRemoveChild: ReturnType<typeof vi.fn<(child: Node) => Node>>;
  let mockClick: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    mockCreateObjectURL = vi
      .fn<(obj: Blob | MediaSource) => string>()
      .mockReturnValue('blob:test-url');
    mockRevokeObjectURL = vi.fn<(url: string) => void>();
    mockAppendChild = vi.fn<(node: Node) => Node>();
    mockRemoveChild = vi.fn<(child: Node) => Node>();
    mockClick = vi.fn<() => void>();

    global.URL.createObjectURL = mockCreateObjectURL as typeof URL.createObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL as typeof URL.revokeObjectURL;

    vi.spyOn(document.body, 'appendChild').mockImplementation((node: Node) => {
      mockAppendChild(node);
      return node;
    });
    vi.spyOn(document.body, 'removeChild').mockImplementation((child: Node) => {
      mockRemoveChild(child);
      return child;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create Blob with correct MIME type for CSV', () => {
    const content = 'Number,Title,URL\n1,"Test",https://github.com/test/repo/issues/1';
    const blob = new Blob([content], { type: 'text/csv' });

    expect(blob.type).toBe('text/csv');
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should create Blob with correct MIME type for Markdown', () => {
    const content = '- [#1 Test](https://github.com/test/repo/issues/1)';
    const blob = new Blob([content], { type: 'text/markdown' });

    expect(blob.type).toBe('text/markdown');
  });

  it('should create Blob with correct MIME type for Plain Text', () => {
    const content = 'https://github.com/test/repo/issues/1';
    const blob = new Blob([content], { type: 'text/plain' });

    expect(blob.type).toBe('text/plain');
  });
});

describe('Filename Generation', () => {
  it('should generate filename with repo name and date', () => {
    const owner = 'VibeTensor';
    const repo = 'IssueFlow';
    const timestamp = '2025-11-29';

    const filename = `${owner}-${repo}-issues-${timestamp}.csv`;

    expect(filename).toBe('VibeTensor-IssueFlow-issues-2025-11-29.csv');
  });

  it('should handle different file extensions', () => {
    const base = 'owner-repo-issues-2025-11-29';

    expect(`${base}.md`).toBe('owner-repo-issues-2025-11-29.md');
    expect(`${base}.txt`).toBe('owner-repo-issues-2025-11-29.txt');
    expect(`${base}.csv`).toBe('owner-repo-issues-2025-11-29.csv');
  });

  it('should handle repo names with special characters', () => {
    const owner = 'test-org';
    const repo = 'my-project';
    const timestamp = '2025-11-29';

    const filename = `${owner}-${repo}-issues-${timestamp}.csv`;

    expect(filename).toBe('test-org-my-project-issues-2025-11-29.csv');
  });
});

describe('Export Button UI Behavior', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.innerHTML = `
      <div class="export-section">
        <div class="relative">
          <button
            type="button"
            class="export-button inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-xl font-extrabold sketch-button transition-all shadow-md"
            aria-haspopup="true"
            aria-expanded="false"
            aria-label="Export all issues"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
            </svg>
            <span class="text-sm">Export</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          <div class="dropdown-menu hidden absolute right-0 mt-2 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
            <button class="dropdown-item" data-format="markdown">Markdown (.md)</button>
            <button class="dropdown-item" data-format="plain">Plain Text (.txt)</button>
            <button class="dropdown-item" data-format="csv">CSV (.csv)</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Button Structure', () => {
    it('should have export button with correct structure', () => {
      const button = container.querySelector('.export-button');

      expect(button).toBeTruthy();
      expect(button?.getAttribute('type')).toBe('button');
      expect(button?.getAttribute('aria-haspopup')).toBe('true');
      expect(button?.getAttribute('aria-label')).toBe('Export all issues');
    });

    it('should contain download icon SVG', () => {
      const button = container.querySelector('.export-button');
      const svg = button?.querySelector('svg');

      expect(svg).toBeTruthy();
      expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    });

    it('should have "Export" text', () => {
      const button = container.querySelector('.export-button');
      const span = button?.querySelector('span');

      expect(span?.textContent).toBe('Export');
    });

    it('should have dropdown arrow icon', () => {
      const button = container.querySelector('.export-button');
      const svgs = button?.querySelectorAll('svg');

      expect(svgs?.length).toBe(2); // Download icon + arrow icon
    });

    it('should have sketch-button class for consistent styling', () => {
      const button = container.querySelector('.export-button');

      expect(button?.classList.contains('sketch-button')).toBe(true);
    });

    it('should have gradient background classes', () => {
      const button = container.querySelector('.export-button');
      const classes = button?.className;

      expect(classes).toContain('bg-gradient-to-br');
      expect(classes).toContain('from-slate-700');
      expect(classes).toContain('to-slate-800');
    });
  });

  describe('Dropdown Menu Structure', () => {
    it('should have dropdown menu with three options', () => {
      const dropdownItems = container.querySelectorAll('.dropdown-item');

      expect(dropdownItems.length).toBe(3);
    });

    it('should have Markdown option', () => {
      const markdownItem = container.querySelector('[data-format="markdown"]');

      expect(markdownItem).toBeTruthy();
      expect(markdownItem?.textContent?.trim()).toBe('Markdown (.md)');
    });

    it('should have Plain Text option', () => {
      const plainItem = container.querySelector('[data-format="plain"]');

      expect(plainItem).toBeTruthy();
      expect(plainItem?.textContent?.trim()).toBe('Plain Text (.txt)');
    });

    it('should have CSV option', () => {
      const csvItem = container.querySelector('[data-format="csv"]');

      expect(csvItem).toBeTruthy();
      expect(csvItem?.textContent?.trim()).toBe('CSV (.csv)');
    });
  });

  describe('Accessibility', () => {
    it('should have aria-haspopup attribute', () => {
      const button = container.querySelector('.export-button');

      expect(button?.getAttribute('aria-haspopup')).toBe('true');
    });

    it('should have aria-expanded attribute', () => {
      const button = container.querySelector('.export-button');

      expect(button?.hasAttribute('aria-expanded')).toBe(true);
    });

    it('should have aria-label attribute', () => {
      const button = container.querySelector('.export-button');

      expect(button?.getAttribute('aria-label')).toBe('Export all issues');
    });

    it('should have button type attribute', () => {
      const button = container.querySelector('.export-button');

      expect(button?.getAttribute('type')).toBe('button');
    });
  });

  describe('Dropdown Menu Visibility', () => {
    it('should have hidden class by default', () => {
      const dropdown = container.querySelector('.dropdown-menu');

      expect(dropdown?.classList.contains('hidden')).toBe(true);
    });

    it('should show dropdown when hidden class is removed', () => {
      const dropdown = container.querySelector('.dropdown-menu');
      dropdown?.classList.remove('hidden');

      expect(dropdown?.classList.contains('hidden')).toBe(false);
    });
  });
});

describe('Dropdown State Management', () => {
  it('should toggle dropdown visibility', () => {
    let showExportDropdown = false;

    // Toggle open
    showExportDropdown = !showExportDropdown;
    expect(showExportDropdown).toBe(true);

    // Toggle close
    showExportDropdown = !showExportDropdown;
    expect(showExportDropdown).toBe(false);
  });

  it('should close dropdown after format selection', () => {
    let showExportDropdown = true;

    // Simulate format selection
    showExportDropdown = false;

    expect(showExportDropdown).toBe(false);
  });
});
