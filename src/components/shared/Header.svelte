<!--
  Header Component - Site branding header
  Left: IssueFlow branding with version and auth indicator | Right: GitHub link
  Issue #190 - Redesign header and footer branding
  Issue #187 - Add authentication state indicator
  Uses UnoCSS utility classes for styling
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { REPO_URL, COMPANY_SHORT } from '../../lib/footer-utils';
  import { GitHubOAuth } from '../../lib/github-oauth';

  const version: string = __APP_VERSION__;

  // Authentication state - Issue #187
  let isAuthenticated = $state(false);

  onMount(() => {
    isAuthenticated = GitHubOAuth.isAuthenticated();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('issueflow:auth-change', handleAuthChange);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('issueflow:auth-change', handleAuthChange);
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

<header
  class="w-full bg-slate-900 border-b border-slate-700/30 px-4 py-2 sticky top-0 z-50"
  aria-label="Site header"
>
  <div class="flex items-center justify-between max-w-6xl mx-auto gap-2 sm:gap-4">
    <!-- Left: Branding -->
    <div class="flex items-center gap-1 sm:gap-1.5">
      <span class="text-sm font-bold text-teal-300">IssueFlow</span>
      <!-- Auth state indicator - Issue #187 -->
      {#if isAuthenticated}
        <span class="group relative inline-flex items-center" role="status" aria-atomic="true">
          <span class="relative flex h-1.5 w-1.5" aria-hidden="true">
            <span
              class="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping motion-reduce:animate-none"
            ></span>
            <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </span>
          <span class="sr-only">Authenticated with GitHub</span>
          <span
            class="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2 py-1 text-[0.5625rem] text-white bg-slate-800 rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-150 pointer-events-none z-50"
            aria-hidden="true"
          >
            Authenticated with GitHub
          </span>
        </span>
      {/if}
      <span
        class="font-mono text-[0.5625rem] font-semibold text-teal-500 bg-teal-500/15 px-1 py-0.5 rounded-sm"
        >v{version}</span
      >
      <span class="text-[0.6875rem] text-slate-500 font-normal ml-1 hidden sm:inline"
        >Find your first contribution</span
      >
    </div>

    <!-- Right: GitHub link -->
    <nav class="flex items-center gap-0.5" aria-label="Header navigation">
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 text-slate-400 no-underline text-[0.625rem] sm:text-[0.6875rem] font-medium rounded hover:text-teal-300 transition-colors duration-150 motion-reduce:transition-none"
      >
        <svg
          class="w-3.5 h-3.5 shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
        GitHub
      </a>
      <a
        href="{REPO_URL}/stargazers"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 px-1.5 sm:px-2 py-1 text-slate-400 no-underline text-[0.625rem] sm:text-[0.6875rem] font-medium rounded hover:text-teal-300 transition-colors duration-150 motion-reduce:transition-none"
        aria-label="Star {COMPANY_SHORT} on GitHub"
      >
        <svg
          class="w-3 h-3 shrink-0"
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
        Star
      </a>
    </nav>
  </div>
</header>
