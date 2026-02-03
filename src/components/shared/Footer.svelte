<!--
  Footer Component - Single line layout
  Left: Links | Center: IssueVista v1.2.0 by VibeTensor | Right: Share icons
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import {
    REPO_URL,
    ISSUES_URL,
    CONTRIBUTING_URL,
    COMPANY_SHORT,
    COMPANY_GITHUB,
    getTwitterShareUrl,
    getLinkedInShareUrl,
    nativeShare,
    isWebShareSupported
  } from '../../lib/footer-utils';

  const version = __APP_VERSION__;

  async function handleNativeShare() {
    try {
      await nativeShare();
    } catch {
      // User cancelled
    }
  }

  let canNativeShare = $state(false);

  onMount(() => {
    canNativeShare = isWebShareSupported();
  });
</script>

<footer class="footer" aria-label="Site footer">
  <div class="footer-row">
    <!-- Left: Navigation links -->
    <nav class="nav-left" aria-label="Footer navigation">
      <a href={REPO_URL} target="_blank" rel="noopener noreferrer" class="nav-link">
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
        GitHub
      </a>
      <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" class="nav-link">
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
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Issues
      </a>
      <a href={CONTRIBUTING_URL} target="_blank" rel="noopener noreferrer" class="nav-link">
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        Contribute
      </a>
    </nav>

    <!-- Center: Branding -->
    <div class="brand-center">
      <span class="product">IssueVista</span>
      <span class="version">v{version}</span>
      <span class="by">by</span>
      <a href={COMPANY_GITHUB} target="_blank" rel="noopener noreferrer" class="company"
        >{COMPANY_SHORT}</a
      >
    </div>

    <!-- Right: Share icons -->
    <div class="share-right">
      <span class="share-label">Share:</span>
      {#if canNativeShare}
        <button type="button" onclick={handleNativeShare} class="share-btn" aria-label="Share">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
        </button>
      {/if}
      <a
        href={getTwitterShareUrl()}
        target="_blank"
        rel="noopener noreferrer"
        class="share-btn"
        aria-label="Share on X"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
          />
        </svg>
      </a>
      <a
        href={getLinkedInShareUrl()}
        target="_blank"
        rel="noopener noreferrer"
        class="share-btn"
        aria-label="Share on LinkedIn"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
          />
        </svg>
      </a>
    </div>
  </div>
</footer>

<style>
  .footer {
    width: 100%;
    background: #0f172a;
    border-top: 1px solid rgba(71, 85, 105, 0.3);
    padding: 0.5rem 1rem;
  }

  .footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 72rem;
    margin: 0 auto;
    gap: 1rem;
  }

  /* Left: Nav links */
  .nav-left {
    display: flex;
    align-items: center;
    gap: 0.125rem;
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    color: #94a3b8;
    text-decoration: none;
    font-size: 0.6875rem;
    font-weight: 500;
    border-radius: 0.25rem;
    transition: color 0.15s ease;
  }

  .nav-link:hover {
    color: #5eead4;
  }

  .nav-icon {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }

  /* Center: Branding */
  .brand-center {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .product {
    font-size: 0.75rem;
    font-weight: 700;
    color: #5eead4;
  }

  .version {
    font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', monospace;
    font-size: 0.5625rem;
    font-weight: 600;
    color: #14b8a6;
    background: rgba(20, 184, 166, 0.15);
    padding: 0.125rem 0.3125rem;
    border-radius: 0.1875rem;
  }

  .by {
    font-size: 0.5625rem;
    color: #475569;
  }

  .company {
    font-size: 0.6875rem;
    color: #94a3b8;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.15s ease;
  }

  .company:hover {
    color: #5eead4;
  }

  /* Right: Share */
  .share-right {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .share-label {
    font-size: 0.625rem;
    color: #64748b;
    font-weight: 500;
  }

  .share-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.625rem;
    height: 1.625rem;
    color: #64748b;
    background: transparent;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: color 0.15s ease;
    padding: 0;
  }

  .share-btn:hover {
    color: #5eead4;
  }

  .share-btn svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  /* Mobile: Stack */
  @media (max-width: 640px) {
    .footer-row {
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.5rem;
    }

    .nav-left {
      order: 1;
      width: 100%;
      justify-content: center;
    }

    .brand-center {
      order: 3;
      width: 100%;
      justify-content: center;
    }

    .share-right {
      order: 2;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .nav-link,
    .share-btn,
    .company {
      transition: none;
    }
  }
</style>
