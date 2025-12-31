<!--
  ThemeSelector Component
  Issue #142 - Enhanced Dark Mode with Custom Themes

  A floating button that expands into a popover panel for selecting
  theme presets. Replaces the simple ThemeToggle with full preset support.
  Positioned bottom-left to avoid conflict with ScrollToTop (bottom-right).
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import {
    themeState,
    setPreset,
    initTheme,
    getAvailablePresets,
    type ThemePreset
  } from '../../lib/theme-store.svelte';

  // Panel open state
  let isOpen = $state(false);
  let panelRef: HTMLDivElement | null = $state(null);
  let triggerRef: HTMLButtonElement | null = $state(null);

  // Get available presets for display
  const presets = getAvailablePresets();

  // Initialize theme on mount
  $effect(() => {
    const cleanup = initTheme();
    return cleanup;
  });

  // Close panel when clicking outside
  function handleClickOutside(event: MouseEvent): void {
    if (
      isOpen &&
      panelRef &&
      triggerRef &&
      !panelRef.contains(event.target as Node) &&
      !triggerRef.contains(event.target as Node)
    ) {
      isOpen = false;
    }
  }

  // Handle keyboard navigation
  function handleKeyDown(event: KeyboardEvent): void {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      isOpen = false;
      triggerRef?.focus();
      return;
    }

    // Arrow key navigation within preset grid
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      const buttons = panelRef?.querySelectorAll<HTMLButtonElement>('[data-preset]');
      if (!buttons) return;

      const currentIndex = Array.from(buttons).findIndex((btn) => btn === document.activeElement);
      if (currentIndex === -1) return;

      let newIndex = currentIndex;
      const cols = 2; // 2 columns in the grid

      switch (event.key) {
        case 'ArrowRight':
          newIndex = (currentIndex + 1) % buttons.length;
          break;
        case 'ArrowLeft':
          newIndex = (currentIndex - 1 + buttons.length) % buttons.length;
          break;
        case 'ArrowDown':
          newIndex = (currentIndex + cols) % buttons.length;
          break;
        case 'ArrowUp':
          newIndex = (currentIndex - cols + buttons.length) % buttons.length;
          break;
      }

      buttons[newIndex]?.focus();
    }
  }

  // Toggle panel
  function togglePanel(): void {
    isOpen = !isOpen;
    if (isOpen) {
      // Focus active preset or first preset after panel renders
      setTimeout(() => {
        const buttons = panelRef?.querySelectorAll<HTMLButtonElement>('[data-preset]');
        if (buttons && buttons.length > 0) {
          const activeButton = panelRef?.querySelector<HTMLButtonElement>(
            `[data-preset="${themeState.preset}"]`
          );
          (activeButton || buttons[0]).focus();
        }
      }, 0);
    }
  }

  // Select a preset
  function selectPreset(preset: ThemePreset): void {
    setPreset(preset);
    isOpen = false;
    triggerRef?.focus();
  }

  // Get icon for current theme
  function getCurrentIcon(): string {
    const preset = themeState.preset;
    if (preset === 'system') {
      return themeState.resolved === 'dark' ? 'moon' : 'sun';
    }
    const config = presets.find((p) => p.id === preset);
    return config?.icon ?? 'moon';
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  });
</script>

<!-- Floating trigger button -->
<button
  bind:this={triggerRef}
  type="button"
  onclick={togglePanel}
  class="theme-trigger"
  aria-label="Open theme selector"
  aria-expanded={isOpen}
  aria-haspopup="dialog"
>
  {#if getCurrentIcon() === 'sun'}
    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  {:else if getCurrentIcon() === 'moon'}
    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  {:else if getCurrentIcon() === 'star'}
    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
      />
    </svg>
  {:else if getCurrentIcon() === 'wave'}
    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
      />
    </svg>
  {:else if getCurrentIcon() === 'tree'}
    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
      />
    </svg>
  {:else}
    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  {/if}
</button>

<!-- Popover panel -->
{#if isOpen}
  <div
    bind:this={panelRef}
    class="theme-panel"
    role="dialog"
    aria-label="Theme selector"
    aria-modal="false"
  >
    <div class="panel-header">
      <span class="panel-title">Theme</span>
      <button
        type="button"
        class="close-btn"
        onclick={() => (isOpen = false)}
        aria-label="Close theme selector"
      >
        <svg class="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <div class="preset-grid" role="radiogroup" aria-label="Theme presets">
      {#each presets as preset (preset.id)}
        <button
          type="button"
          class="preset-btn"
          class:active={themeState.preset === preset.id}
          data-preset={preset.id}
          role="radio"
          aria-checked={themeState.preset === preset.id}
          tabindex={themeState.preset === preset.id ? 0 : -1}
          onclick={() => selectPreset(preset.id)}
        >
          <span class="preset-icon" style="--accent: {preset.colors.accent}">
            {#if preset.icon === 'sun'}
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            {:else if preset.icon === 'moon'}
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            {:else if preset.icon === 'star'}
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            {:else if preset.icon === 'wave'}
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
            {:else if preset.icon === 'tree'}
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            {:else if preset.icon === 'sunset'}
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8zm-9 9h18"
                />
              </svg>
            {:else}
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            {/if}
          </span>
          <span class="preset-name">{preset.name}</span>
        </button>
      {/each}
    </div>

    <div class="system-toggle">
      <label class="toggle-label">
        <input
          type="checkbox"
          checked={themeState.preset === 'system'}
          onchange={() => selectPreset('system')}
        />
        <span class="toggle-text">Use system preference</span>
      </label>
    </div>
  </div>
{/if}

<style>
  .theme-trigger {
    position: fixed;
    bottom: 1.25rem;
    left: 1.25rem;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    background: linear-gradient(
      135deg,
      var(--theme-accent, #0d9488) 0%,
      var(--theme-accent-hover, #0f766e) 100%
    );
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

  .theme-trigger:hover {
    transform: translateY(-0.125rem);
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -4px rgba(0, 0, 0, 0.1);
  }

  .theme-trigger:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px rgba(94, 234, 212, 0.5),
      0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .theme-panel {
    position: fixed;
    bottom: 5rem;
    left: 1.25rem;
    z-index: 51;
    width: 16rem;
    background: var(--theme-bg-secondary);
    border: 1px solid var(--theme-border);
    border-radius: 0.75rem;
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 8px 10px -6px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--theme-border);
  }

  .panel-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--theme-text-primary);
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    color: var(--theme-text-muted);
    cursor: pointer;
    transition: color 150ms ease-out;
  }

  .close-btn:hover {
    color: var(--theme-text-primary);
  }

  .close-icon {
    width: 1rem;
    height: 1rem;
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding: 0.75rem;
  }

  .preset-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 0.625rem;
    background: var(--theme-bg-tertiary);
    border: 2px solid transparent;
    border-radius: 0.5rem;
    cursor: pointer;
    transition:
      border-color 150ms ease-out,
      background-color 150ms ease-out;
  }

  .preset-btn:hover {
    background: var(--theme-bg-primary);
  }

  .preset-btn:focus-visible {
    outline: none;
    border-color: var(--theme-accent);
  }

  .preset-btn.active {
    border-color: var(--theme-accent);
    background: var(--theme-bg-primary);
  }

  .preset-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    color: var(--accent, var(--theme-accent));
  }

  .preset-icon svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .preset-name {
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--theme-text-secondary);
  }

  .system-toggle {
    padding: 0.75rem 1rem;
    border-top: 1px solid var(--theme-border);
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .toggle-label input[type='checkbox'] {
    width: 1rem;
    height: 1rem;
    accent-color: var(--theme-accent);
  }

  .toggle-text {
    font-size: 0.75rem;
    color: var(--theme-text-muted);
  }

  /* Responsive adjustments */
  @media (max-width: 640px) {
    .theme-trigger {
      bottom: 1rem;
      left: 1rem;
    }

    .theme-panel {
      bottom: 4.5rem;
      left: 1rem;
      width: 14rem;
    }
  }

  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .theme-trigger,
    .preset-btn,
    .close-btn {
      transition: none;
    }
  }
</style>
