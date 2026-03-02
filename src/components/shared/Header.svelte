<!--
  Header Component - Glass-morphism sticky header
  Matches Magic UI landing page design
  Issue #190 - Redesign header and footer branding
  Issue #187 - Add authentication state indicator
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { REPO_URL, COMPANY_SHORT } from '../../lib/footer-utils';
  import { GitHubOAuth } from '../../lib/github-oauth';

  const version: string = __APP_VERSION__;

  let isAuthenticated = $state(false);
  let scrolled = $state(false);

  function handleScroll() {
    scrolled = window.scrollY > 20;
  }

  onMount(() => {
    isAuthenticated = GitHubOAuth.isAuthenticated();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('issuevista:auth-change', handleAuthChange);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('issuevista:auth-change', handleAuthChange);
      window.removeEventListener('scroll', handleScroll);
    }
  });

  function handleStorageChange(event: StorageEvent): void {
    if (event.key === 'github_token') {
      isAuthenticated = !!event.newValue;
    }
  }

  function handleAuthChange(): void {
    isAuthenticated = GitHubOAuth.isAuthenticated();
  }
</script>

<header class="header" class:scrolled aria-label="Site header">
  <div class="header-inner">
    <!-- Left: Branding -->
    <div class="brand">
      <a href="/" class="brand-link">
        <svg
          class="logo-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
          <path
            d="M8 12L11 15L16 9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="brand-name">IssueVista</span>
      </a>
      {#if isAuthenticated}
        <span class="group relative inline-flex items-center" role="status" aria-atomic="true">
          <span class="auth-dot-wrapper" aria-hidden="true">
            <span class="auth-dot-ping"></span>
            <span class="auth-dot"></span>
          </span>
          <span class="sr-only">Authenticated with GitHub</span>
        </span>
      {/if}
      <span class="version-badge">v{version}</span>
    </div>

    <!-- Right: Navigation -->
    <nav class="nav-right" aria-label="Header navigation">
      <a href="/" class="nav-link">Home</a>
      <a href={REPO_URL} target="_blank" rel="noopener noreferrer" class="nav-link github-link">
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
        <span class="link-text">GitHub</span>
      </a>
      <a
        href="{REPO_URL}/stargazers"
        target="_blank"
        rel="noopener noreferrer"
        class="star-btn"
        aria-label="Star {COMPANY_SHORT} on GitHub"
      >
        <svg
          class="nav-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        <span class="link-text">Star</span>
      </a>
    </nav>
  </div>
</header>

<style>
  .header {
    position: sticky;
    top: 0;
    z-index: 50;
    width: 100%;
    padding: 0.5rem 1rem;
    transition: all 0.3s ease;
    background: transparent;
    border-bottom: 1px solid transparent;
  }

  .header.scrolled {
    background: var(--theme-bg-primary, oklch(0.1648 0.0075 270.93));
    backdrop-filter: blur(12px) saturate(180%);
    -webkit-backdrop-filter: blur(12px) saturate(180%);
    border-bottom-color: var(--theme-border, oklch(0.3 0.01 264 / 0.5));
  }

  :global(html:not(.dark)) .header.scrolled {
    background: oklch(0.98 0.004 264 / 0.85);
    border-bottom-color: oklch(0.91 0.008 264 / 0.5);
  }

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 72rem;
    margin: 0 auto;
    gap: 0.5rem;
  }

  /* Brand */
  .brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .brand-link {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    text-decoration: none;
    color: inherit;
  }

  .logo-icon {
    width: 1.25rem;
    height: 1.25rem;
    color: oklch(0.78 0.13 291);
  }

  .brand-name {
    font-size: 0.9375rem;
    font-weight: 700;
    color: var(--theme-text-primary, oklch(0.95 0.004 264));
  }

  .version-badge {
    font-family: var(--font-mono, monospace);
    font-size: 0.5625rem;
    font-weight: 600;
    color: oklch(0.78 0.13 291);
    background: oklch(0.78 0.13 291 / 0.15);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
  }

  .auth-dot-wrapper {
    position: relative;
    display: flex;
    width: 0.375rem;
    height: 0.375rem;
  }

  .auth-dot-ping {
    position: absolute;
    display: inline-flex;
    width: 100%;
    height: 100%;
    border-radius: 9999px;
    background: oklch(0.68 0.17 145);
    opacity: 0.75;
    animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
  }

  .auth-dot {
    position: relative;
    display: inline-flex;
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 9999px;
    background: oklch(0.68 0.17 145);
  }

  /* Navigation */
  .nav-right {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.625rem;
    color: var(--theme-text-muted, oklch(0.52 0.01 264));
    text-decoration: none;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 0.375rem;
    transition: color 0.15s ease;
  }

  .nav-link:hover {
    color: var(--theme-text-primary, oklch(0.95 0.004 264));
  }

  .nav-icon {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }

  .star-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    color: var(--theme-text-muted, oklch(0.52 0.01 264));
    text-decoration: none;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 0.375rem;
    border: 1px solid var(--theme-border, oklch(0.3 0.01 264 / 0.5));
    transition: all 0.15s ease;
  }

  .star-btn:hover {
    color: var(--theme-text-primary, oklch(0.95 0.004 264));
    border-color: oklch(0.78 0.13 291 / 0.5);
  }

  .link-text {
    display: none;
  }

  @media (min-width: 640px) {
    .link-text {
      display: inline;
    }
  }

  @keyframes ping {
    75%,
    100% {
      transform: scale(2);
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .header {
      transition: none;
    }
    .nav-link,
    .star-btn {
      transition: none;
    }
    .auth-dot-ping {
      animation: none;
    }
  }
</style>
