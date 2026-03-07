<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { siteConfig } from './config';

  const navLinks = [
    { text: 'Features', href: '#features' },
    { text: 'Use Cases', href: '#use-cases' },
    { text: 'Community', href: '#community' }
  ];

  let scrolled = $state(false);
  let mobileOpen = $state(false);

  function handleScroll() {
    scrolled = window.scrollY > 20;
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('scroll', handleScroll);
    }
  });
</script>

<header class="header" class:scrolled>
  <nav class="nav-inner">
    <a href="/" class="brand-link">
      <svg class="logo-icon" viewBox="0 0 128 128" fill="none" aria-hidden="true">
        <circle cx="64" cy="64" r="56" fill="var(--theme-accent)" />
        <path
          d="M 20 64 Q 44 30, 64 64 Q 84 98, 108 64"
          stroke="white"
          stroke-width="6"
          fill="none"
          stroke-linecap="round"
        />
        <circle cx="32" cy="50" r="10" fill="white" />
        <circle cx="64" cy="64" r="12" fill="white" />
        <circle cx="96" cy="78" r="10" fill="white" />
        <path
          d="M 27 50 L 30 53 L 37 46"
          stroke="var(--theme-accent)"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M 58 64 L 62 68 L 70 58"
          stroke="var(--theme-accent)"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M 91 78 L 94 81 L 101 74"
          stroke="var(--theme-accent)"
          stroke-width="3"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="brand-name">{siteConfig.name}</span>
    </a>

    <div class="nav-links">
      {#each navLinks as link (link.text)}
        <a href={link.href} class="nav-link">{link.text}</a>
      {/each}
      <a
        href={siteConfig.repo}
        target="_blank"
        rel="noopener noreferrer"
        class="nav-link"
        aria-label="GitHub"
      >
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
      </a>
      <a href="/app" class="cta-btn">Start Searching</a>
    </div>

    <button
      class="mobile-toggle"
      onclick={() => (mobileOpen = !mobileOpen)}
      aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
    >
      {#if mobileOpen}
        <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      {:else}
        <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      {/if}
    </button>
  </nav>

  {#if mobileOpen}
    <div class="mobile-menu">
      {#each navLinks as link (link.text)}
        <a href={link.href} class="mobile-link" onclick={() => (mobileOpen = false)}>{link.text}</a>
      {/each}
      <a href="/app" class="cta-btn mobile-cta">Start Searching</a>
    </div>
  {/if}
</header>

<style>
  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    transition: all 0.3s ease;
    background: transparent;
    border-bottom: 1px solid transparent;
  }

  .header.scrolled {
    background: var(--theme-bg-primary);
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border-bottom-color: var(--theme-border);
  }

  .nav-inner {
    position: relative;
    margin: 0 auto;
    display: flex;
    max-width: 1000px;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
  }

  .brand-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: inherit;
    z-index: 10;
  }

  .logo-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: var(--theme-accent);
  }

  .brand-name {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--theme-text-primary);
  }

  .nav-links {
    display: none;
    align-items: center;
    gap: 1.5rem;
  }

  @media (min-width: 768px) {
    .nav-links {
      display: flex;
    }
  }

  .nav-link {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--theme-text-muted);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .nav-link:hover {
    color: var(--theme-text-primary);
  }

  .nav-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    border-radius: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: white;
    background-color: var(--theme-accent);
    text-decoration: none;
    transition: background-color 0.15s ease;
  }

  .cta-btn:hover {
    background-color: var(--theme-accent-hover);
  }

  .mobile-toggle {
    display: flex;
    z-index: 10;
    color: var(--theme-text-primary);
    background: none;
    border: none;
    cursor: pointer;
  }

  @media (min-width: 768px) {
    .mobile-toggle {
      display: none;
    }
  }

  .toggle-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .mobile-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    border-bottom: 1px solid var(--theme-border);
    padding: 1rem;
    background: var(--theme-bg-primary);
    backdrop-filter: blur(12px);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  @media (min-width: 768px) {
    .mobile-menu {
      display: none;
    }
  }

  .mobile-link {
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem 0;
    color: var(--theme-text-muted);
    text-decoration: none;
  }

  .mobile-cta {
    text-align: center;
  }

  @media (prefers-reduced-motion: reduce) {
    .header {
      transition: none;
    }
  }
</style>
