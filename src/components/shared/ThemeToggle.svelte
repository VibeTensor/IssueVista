<!--
  ThemeToggle Component
  Issue #180 - Add light/dark theme toggle

  A floating button that toggles between light and dark themes.
  Positioned bottom-left to not conflict with ScrollToTop (bottom-right).
  Respects user preference and persists choice to localStorage.
-->

<script lang="ts">
  import { themeState, toggleTheme, initTheme } from '../../lib/theme-store.svelte';

  // Initialize theme on component mount with cleanup
  $effect(() => {
    const cleanup = initTheme();
    return cleanup;
  });

  // Derive aria-label based on current resolved theme
  let ariaLabel = $derived(
    themeState.resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );
</script>

<button
  type="button"
  onclick={toggleTheme}
  class="theme-toggle-btn"
  aria-label={ariaLabel}
  title={ariaLabel}
>
  {#if themeState.resolved === 'dark'}
    <!-- Sun icon (shown in dark mode - click to switch to light) -->
    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  {:else}
    <!-- Moon icon (shown in light mode - click to switch to dark) -->
    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  {/if}
</button>

<style>
  .theme-toggle-btn {
    position: fixed;
    bottom: 1.25rem;
    left: 1.25rem;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    background: var(--theme-accent, oklch(0.78 0.13 291));
    color: white;
    border: none;
    border-radius: 9999px;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition:
      background 150ms ease-out,
      transform 150ms ease-out,
      box-shadow 150ms ease-out;
  }

  .theme-toggle-btn:hover {
    background: var(--theme-accent-hover, oklch(0.83 0.13 291));
    transform: translateY(-0.125rem);
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -4px rgba(0, 0, 0, 0.1);
  }

  .theme-toggle-btn:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px rgba(94, 234, 212, 0.5),
      0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .theme-toggle-btn:active {
    transform: translateY(0.0625rem);
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
    transition: transform 200ms ease-out;
  }

  .theme-toggle-btn:hover .icon {
    transform: rotate(15deg);
  }

  /* Responsive: slightly smaller on mobile */
  @media (max-width: 640px) {
    .theme-toggle-btn {
      bottom: 1rem;
      left: 1rem;
    }
  }

  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .theme-toggle-btn {
      transition: none;
    }

    .icon {
      transition: none;
    }

    .theme-toggle-btn:hover .icon {
      transform: none;
    }
  }
</style>
