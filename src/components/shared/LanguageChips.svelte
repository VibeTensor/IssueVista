<!--
  LanguageChips Component
  Issue #153 - Language Filter Chips with Multi-Select

  Displays programming language filter chips extracted from issue labels.
  Supports multi-select with accessible keyboard navigation.

  Features:
  - Multi-select toggle (click to select/deselect)
  - Language icons from Devicon CDN
  - GitHub Linguist colors
  - ARIA listbox pattern for accessibility
  - Keyboard navigation (Tab, Space/Enter to toggle)
-->

<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import type { LanguageFrequency } from '../../lib/language-utils';
  import { getDevIconUrl } from '../../lib/language-utils';

  interface Props {
    /** Array of languages with frequency counts */
    languages: LanguageFrequency[];
    /** Set of currently selected language names (lowercase) */
    selectedLanguages: Set<string>;
    /** Callback when a language is toggled */
    onLanguageToggle: (language: string) => void;
    /** Maximum number of chips to display (default: 10) */
    maxChips?: number;
  }

  let { languages, selectedLanguages, onLanguageToggle, maxChips = 10 }: Props = $props();

  // Get displayed languages (limited by maxChips)
  let displayedLanguages = $derived(languages.slice(0, maxChips));

  // Track which icons failed to load for fallback (SvelteSet is already reactive)
  let failedIcons: Set<string> = new SvelteSet();

  /**
   * Check if a language is currently selected
   */
  function isSelected(language: string): boolean {
    return selectedLanguages.has(language);
  }

  /**
   * Handle chip click - toggle selection
   */
  function handleClick(language: string): void {
    onLanguageToggle(language);
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeyDown(event: KeyboardEvent, language: string): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      onLanguageToggle(language);
    }
  }

  /**
   * Handle icon load error - fallback to colored dot
   */
  function handleIconError(language: string): void {
    failedIcons.add(language);
  }

  /**
   * Get accessible label for a chip
   */
  function getAriaLabel(lang: LanguageFrequency): string {
    const issueText = lang.count === 1 ? 'issue' : 'issues';
    const selectedText = isSelected(lang.name) ? 'selected, ' : '';
    return `${selectedText}${lang.displayName}: ${lang.count} ${issueText}`;
  }

  /**
   * Check if we should show the icon (not failed to load)
   */
  function shouldShowIcon(language: string): boolean {
    const iconUrl = getDevIconUrl(language);
    return iconUrl !== null && !failedIcons.has(language);
  }
</script>

{#if displayedLanguages.length > 0}
  <div
    class="language-chips"
    role="listbox"
    aria-multiselectable="true"
    aria-label="Filter by programming language"
  >
    {#each displayedLanguages as lang (lang.name)}
      {@const selected = isSelected(lang.name)}
      {@const iconUrl = getDevIconUrl(lang.name)}
      <button
        type="button"
        role="option"
        aria-selected={selected}
        aria-label={getAriaLabel(lang)}
        class="language-chip"
        class:selected
        style="
          --lang-color: {lang.color};
          --lang-color-bg: {lang.color}20;
          --lang-color-border: {lang.color}60;
          --lang-color-hover: {lang.color}30;
        "
        onclick={() => handleClick(lang.name)}
        onkeydown={(e) => handleKeyDown(e, lang.name)}
      >
        <!-- Language Icon or Colored Dot -->
        <span class="chip-icon">
          {#if shouldShowIcon(lang.name) && iconUrl}
            <img
              src={iconUrl}
              alt=""
              class="lang-icon"
              width="14"
              height="14"
              loading="lazy"
              onerror={() => handleIconError(lang.name)}
            />
          {:else}
            <span class="lang-dot" style="background-color: {lang.color};"></span>
          {/if}
        </span>

        <!-- Language Name -->
        <span class="chip-label">{lang.displayName}</span>

        <!-- Count Badge -->
        <span class="chip-count" class:selected>({lang.count})</span>
      </button>
    {/each}
  </div>
{/if}

<style>
  .language-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    padding: 0.25rem 0;
  }

  .language-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 9999px;
    border: 1px solid var(--lang-color-border);
    background: var(--lang-color-bg);
    color: var(--lang-color);
    font-size: 0.6875rem;
    font-weight: 500;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      transform 0.15s ease;
    white-space: nowrap;
  }

  .language-chip:hover {
    background: var(--lang-color-hover);
    transform: scale(1.02);
  }

  .language-chip:focus-visible {
    outline: 2px solid var(--lang-color);
    outline-offset: 1px;
  }

  .language-chip:active {
    transform: scale(0.98);
  }

  /* Selected state - filled background */
  .language-chip.selected {
    background: var(--lang-color);
    border-color: var(--lang-color);
    color: white;
    box-shadow: 0 2px 6px var(--lang-color-border);
  }

  .language-chip.selected:hover {
    opacity: 0.9;
  }

  /* Icon container */
  .chip-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .lang-icon {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }

  /* Selected state icon - invert for visibility on colored background */
  .language-chip.selected .lang-icon {
    filter: brightness(0) invert(1);
  }

  .lang-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .language-chip.selected .lang-dot {
    background-color: white !important;
  }

  /* Label text */
  .chip-label {
    line-height: 1.2;
  }

  /* Count badge */
  .chip-count {
    font-size: 0.625rem;
    opacity: 0.8;
  }

  .chip-count.selected {
    opacity: 0.9;
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .language-chips {
      gap: 0.25rem;
    }

    .language-chip {
      padding: 0.2rem 0.4rem;
      font-size: 0.625rem;
    }

    .chip-icon {
      width: 12px;
      height: 12px;
    }

    .lang-icon {
      width: 12px;
      height: 12px;
    }

    .lang-dot {
      width: 6px;
      height: 6px;
    }
  }

  /* Reduce motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    .language-chip {
      transition: none;
    }

    .language-chip:hover {
      transform: none;
    }

    .language-chip:active {
      transform: none;
    }
  }
</style>
