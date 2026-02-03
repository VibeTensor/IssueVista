/**
 * Unit Tests for URL Validation Functionality
 * Tests Issue #16 implementation - validateRepoUrl function
 */

import { describe, it, expect } from 'vitest';
import { validateRepoUrl, parseRepoUrl } from '../src/lib/github-graphql';

describe('validateRepoUrl', () => {
  describe('Valid URLs', () => {
    it('should validate full HTTPS URL', () => {
      const result = validateRepoUrl('https://github.com/facebook/react');
      expect(result.isValid).toBe(true);
      expect(result.state).toBe('valid');
      expect(result.owner).toBe('facebook');
      expect(result.repo).toBe('react');
    });

    it('should validate URL with www', () => {
      const result = validateRepoUrl('https://www.github.com/microsoft/vscode');
      expect(result.isValid).toBe(true);
      expect(result.state).toBe('valid');
    });

    it('should validate URL with trailing slash', () => {
      const result = validateRepoUrl('https://github.com/sveltejs/svelte/');
      expect(result.isValid).toBe(true);
      expect(result.state).toBe('valid');
      expect(result.owner).toBe('sveltejs');
      expect(result.repo).toBe('svelte');
    });

    it('should strip .git suffix from repo name', () => {
      const result = validateRepoUrl('https://github.com/torvalds/linux.git');
      expect(result.isValid).toBe(true);
      expect(result.repo).toBe('linux');
    });

    it('should handle HTTP URL', () => {
      const result = validateRepoUrl('http://github.com/nodejs/node');
      expect(result.isValid).toBe(true);
      expect(result.owner).toBe('nodejs');
      expect(result.repo).toBe('node');
    });

    it('should validate URL with hyphens in owner/repo', () => {
      const result = validateRepoUrl('https://github.com/open-source-org/my-cool-project');
      expect(result.isValid).toBe(true);
      expect(result.owner).toBe('open-source-org');
      expect(result.repo).toBe('my-cool-project');
    });

    it('should validate URL with underscores', () => {
      const result = validateRepoUrl('https://github.com/user_name/repo_name');
      expect(result.isValid).toBe(true);
      expect(result.owner).toBe('user_name');
      expect(result.repo).toBe('repo_name');
    });

    it('should validate URL with numbers', () => {
      const result = validateRepoUrl('https://github.com/user123/project456');
      expect(result.isValid).toBe(true);
      expect(result.owner).toBe('user123');
      expect(result.repo).toBe('project456');
    });

    it('should validate URL with mixed case', () => {
      const result = validateRepoUrl('https://github.com/VibeTensor/IssueVista');
      expect(result.isValid).toBe(true);
      expect(result.owner).toBe('VibeTensor');
      expect(result.repo).toBe('IssueVista');
    });
  });

  describe('Invalid URLs', () => {
    it('should reject GitLab URL', () => {
      const result = validateRepoUrl('https://gitlab.com/user/repo');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('invalid');
    });

    it('should reject Bitbucket URL', () => {
      const result = validateRepoUrl('https://bitbucket.org/user/repo');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('invalid');
    });

    it('should reject random website', () => {
      const result = validateRepoUrl('https://example.com/user/repo');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('invalid');
    });

    it('should reject URL with only owner', () => {
      const result = validateRepoUrl('https://github.com/facebook');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('invalid');
    });

    it('should reject GitHub home page', () => {
      const result = validateRepoUrl('https://github.com');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('invalid');
    });

    it('should reject random text', () => {
      const result = validateRepoUrl('not a url at all');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('invalid');
    });

    it('should reject malformed URL', () => {
      const result = validateRepoUrl('github/facebook/react');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('invalid');
    });
  });

  describe('Idle State (Empty Input)', () => {
    it('should return idle for empty string', () => {
      const result = validateRepoUrl('');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('idle');
      expect(result.message).toBeUndefined();
    });

    it('should return idle for whitespace only', () => {
      const result = validateRepoUrl('   ');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('idle');
    });

    it('should return idle for tabs and newlines', () => {
      const result = validateRepoUrl('\t\n  ');
      expect(result.isValid).toBe(false);
      expect(result.state).toBe('idle');
    });
  });

  describe('Messages', () => {
    it('should show owner/repo in message for valid URL', () => {
      const result = validateRepoUrl('https://github.com/facebook/react');
      expect(result.message).toContain('facebook/react');
      expect(result.message).toContain('Valid');
    });

    it('should show error hint for invalid URL', () => {
      const result = validateRepoUrl('invalid-url');
      expect(result.message).toBeDefined();
      expect(result.message).toContain('GitHub URL');
    });

    it('should have no message for idle state', () => {
      const result = validateRepoUrl('');
      expect(result.message).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should trim whitespace from valid URL', () => {
      const result = validateRepoUrl('  https://github.com/facebook/react  ');
      expect(result.isValid).toBe(true);
      expect(result.owner).toBe('facebook');
      expect(result.repo).toBe('react');
    });

    it('should handle URL with extra path segments', () => {
      const result = validateRepoUrl('https://github.com/facebook/react/issues/123');
      expect(result.isValid).toBe(true);
      expect(result.owner).toBe('facebook');
      // repo might include extra path, depends on regex
    });

    it('should handle URL with query parameters', () => {
      const result = validateRepoUrl('https://github.com/facebook/react?tab=readme');
      expect(result.isValid).toBe(true);
      expect(result.owner).toBe('facebook');
    });
  });
});

describe('parseRepoUrl', () => {
  it('should parse valid URL correctly', () => {
    const result = parseRepoUrl('https://github.com/facebook/react');
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });

  it('should return null for invalid URL', () => {
    const result = parseRepoUrl('not a valid url');
    expect(result).toBeNull();
  });

  it('should strip .git suffix', () => {
    const result = parseRepoUrl('https://github.com/user/repo.git');
    expect(result?.repo).toBe('repo');
  });

  it('should handle URL without protocol', () => {
    const result = parseRepoUrl('github.com/user/repo');
    expect(result).toEqual({ owner: 'user', repo: 'repo' });
  });

  it('should return null for non-GitHub URLs', () => {
    const result = parseRepoUrl('https://gitlab.com/user/repo');
    expect(result).toBeNull();
  });
});
