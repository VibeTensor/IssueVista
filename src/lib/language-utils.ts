/**
 * Language Utilities for Issue #153
 * Extracts programming languages from issue labels and provides styling helpers
 *
 * Uses GitHub Linguist colors for consistent language representation
 * Icons from Devicon CDN: https://devicon.dev/
 */

import type { GitHubIssue } from './github-graphql';

/**
 * Represents a programming language with frequency count for filtering
 */
export interface LanguageFrequency {
  /** Language name (normalized to lowercase for matching) */
  name: string;
  /** Display name (original casing from labels) */
  displayName: string;
  /** Number of issues with this language label */
  count: number;
  /** Language color from GitHub Linguist */
  color: string;
}

/**
 * GitHub Linguist language colors
 * Source: https://github.com/github-linguist/linguist/blob/main/lib/linguist/languages.yml
 */
export const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#f1e05a',
  typescript: '#3178c6',
  python: '#3572A5',
  java: '#b07219',
  go: '#00ADD8',
  golang: '#00ADD8',
  rust: '#dea584',
  ruby: '#701516',
  'c++': '#f34b7d',
  cpp: '#f34b7d',
  'c#': '#178600',
  csharp: '#178600',
  c: '#555555',
  php: '#4F5D95',
  swift: '#F05138',
  kotlin: '#A97BFF',
  scala: '#c22d40',
  html: '#e34c26',
  css: '#563d7c',
  scss: '#c6538c',
  sass: '#a53b70',
  shell: '#89e051',
  bash: '#89e051',
  powershell: '#012456',
  vue: '#41b883',
  'vue.js': '#41b883',
  react: '#61dafb',
  angular: '#dd0031',
  svelte: '#ff3e00',
  dart: '#00B4AB',
  flutter: '#02569B',
  elixir: '#6e4a7e',
  erlang: '#B83998',
  haskell: '#5e5086',
  clojure: '#db5855',
  lua: '#000080',
  perl: '#0298c3',
  r: '#198CE7',
  julia: '#a270ba',
  sql: '#e38c00',
  graphql: '#e10098',
  dockerfile: '#384d54',
  docker: '#384d54',
  yaml: '#cb171e',
  json: '#292929',
  markdown: '#083fa1',
  terraform: '#5c4ee5',
  kubernetes: '#326ce5',
  aws: '#FF9900',
  azure: '#0078D4',
  gcp: '#4285F4',
  node: '#339933',
  'node.js': '#339933',
  nodejs: '#339933',
  deno: '#000000',
  bun: '#fbf0df',
  nextjs: '#000000',
  'next.js': '#000000',
  nuxt: '#00DC82',
  'nuxt.js': '#00DC82',
  astro: '#ff5d01',
  tailwind: '#38bdf8',
  tailwindcss: '#38bdf8'
};

/**
 * Set of known programming language names (lowercase)
 * Used to identify if a label represents a programming language
 */
export const KNOWN_LANGUAGES = new Set<string>(Object.keys(LANGUAGE_COLORS));

/**
 * Mapping from language name to Devicon icon name
 * Some languages have different names in Devicon
 */
const DEVICON_NAME_MAP: Record<string, string> = {
  'c++': 'cplusplus',
  cpp: 'cplusplus',
  'c#': 'csharp',
  'vue.js': 'vuejs',
  'node.js': 'nodejs',
  'next.js': 'nextjs',
  'nuxt.js': 'nuxtjs',
  golang: 'go',
  tailwindcss: 'tailwindcss'
};

/**
 * Get the Devicon CDN URL for a programming language icon
 *
 * @param language - Language name (case-insensitive)
 * @returns URL to the language icon SVG, or null if not available
 */
export function getDevIconUrl(language: string): string | null {
  const normalized = language.toLowerCase().trim();
  const deviconName = DEVICON_NAME_MAP[normalized] || normalized;

  // Devicon doesn't have icons for all languages
  const unsupportedLanguages = new Set([
    'graphql',
    'sql',
    'markdown',
    'yaml',
    'json',
    'terraform',
    'kubernetes',
    'aws',
    'azure',
    'gcp',
    'bun',
    'astro',
    'tailwind',
    'tailwindcss'
  ]);

  if (unsupportedLanguages.has(normalized)) {
    return null;
  }

  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${deviconName}/${deviconName}-original.svg`;
}

/**
 * Get the color for a programming language
 *
 * @param language - Language name (case-insensitive)
 * @returns Hex color code, or default gray if unknown
 */
export function getLanguageColor(language: string): string {
  const normalized = language.toLowerCase().trim();
  return LANGUAGE_COLORS[normalized] || '#6b7280';
}

/**
 * Check if a label name represents a known programming language
 *
 * @param labelName - Label name to check
 * @returns true if the label is a known programming language
 */
export function isLanguageLabel(labelName: string): boolean {
  const normalized = labelName.toLowerCase().trim();
  return KNOWN_LANGUAGES.has(normalized);
}

/**
 * Extract programming languages from issue labels and aggregate by frequency
 * Returns languages sorted by frequency (most common first)
 *
 * @param issues - Array of GitHub issues
 * @returns Array of languages with frequency counts, sorted by count descending
 */
export function extractLanguagesFromIssues(issues: GitHubIssue[]): LanguageFrequency[] {
  if (!issues || !Array.isArray(issues)) {
    return [];
  }

  const languageMap = new Map<string, { displayName: string; count: number }>();

  for (const issue of issues) {
    if (!issue?.labels?.nodes) {
      continue;
    }

    for (const label of issue.labels.nodes) {
      if (!label?.name) {
        continue;
      }

      const normalized = label.name.toLowerCase().trim();

      // Only include known programming languages
      if (!isLanguageLabel(normalized)) {
        continue;
      }

      const existing = languageMap.get(normalized);
      if (existing) {
        existing.count++;
      } else {
        languageMap.set(normalized, {
          displayName: label.name,
          count: 1
        });
      }
    }
  }

  return Array.from(languageMap.entries())
    .map(([name, data]) => ({
      name,
      displayName: data.displayName,
      count: data.count,
      color: getLanguageColor(name)
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Filter issues by selected programming languages
 * An issue matches if it has at least one label matching any selected language
 *
 * @param issues - Array of GitHub issues
 * @param selectedLanguages - Set of selected language names (lowercase)
 * @returns Filtered array of issues
 */
export function filterIssuesByLanguages(
  issues: GitHubIssue[],
  selectedLanguages: Set<string>
): GitHubIssue[] {
  if (!issues || !Array.isArray(issues) || selectedLanguages.size === 0) {
    return issues || [];
  }

  return issues.filter((issue) => {
    if (!issue?.labels?.nodes) {
      return false;
    }

    return issue.labels.nodes.some((label) => {
      if (!label?.name) {
        return false;
      }
      return selectedLanguages.has(label.name.toLowerCase().trim());
    });
  });
}
