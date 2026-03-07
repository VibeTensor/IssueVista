<!--
  Footer Component - Modern minimal footer
  Matches Magic UI landing page design
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
  <div class="footer-inner">
    <!-- Top row: brand + social -->
    <div class="footer-top">
      <div class="footer-brand">
        <svg
          class="logo-icon"
          viewBox="0 0 128 128"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="64" cy="64" r="56" fill="oklch(0.78 0.13 291)" />
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
            stroke="oklch(0.78 0.13 291)"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M 58 64 L 62 68 L 70 58"
            stroke="oklch(0.78 0.13 291)"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M 91 78 L 94 81 L 101 74"
            stroke="oklch(0.78 0.13 291)"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="brand-name">IssueVista</span>
        <span class="version-badge">v{version}</span>
        <span class="by-text">by</span>
        <a href={COMPANY_GITHUB} target="_blank" rel="noopener noreferrer" class="company-link"
          >{COMPANY_SHORT}</a
        >
      </div>

      <div class="footer-social">
        {#if canNativeShare}
          <button type="button" onclick={handleNativeShare} class="social-btn" aria-label="Share">
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
          class="social-btn"
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
          class="social-btn"
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

    <!-- Bottom row: links -->
    <div class="footer-bottom">
      <nav class="footer-links" aria-label="Footer navigation">
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" class="footer-link">GitHub</a>
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" class="footer-link">Issues</a
        >
        <a href={CONTRIBUTING_URL} target="_blank" rel="noopener noreferrer" class="footer-link"
          >Contribute</a
        >
        <a href="/" class="footer-link">Home</a>
      </nav>
      <p class="footer-copy">Built by VibeTensor Private Limited</p>
    </div>
  </div>
</footer>

<style>
  .footer {
    width: 100%;
    border-top: 1px solid var(--theme-border);
    padding: 1rem 1rem;
    margin-top: 2rem;
  }

  .footer-inner {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 72rem;
    margin: 0 auto;
  }

  /* Top row */
  .footer-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .logo-icon {
    width: 1rem;
    height: 1rem;
    color: var(--theme-accent);
  }

  .brand-name {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--theme-text-primary);
  }

  .version-badge {
    font-family: var(--font-mono, monospace);
    font-size: 0.5625rem;
    font-weight: 600;
    color: var(--theme-accent);
    background: oklch(from var(--theme-accent) l c h / 0.12);
    padding: 0.0625rem 0.3125rem;
    border-radius: 0.1875rem;
  }

  .by-text {
    font-size: 0.5625rem;
    color: var(--theme-text-muted);
  }

  .company-link {
    font-size: 0.6875rem;
    color: var(--theme-text-muted);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.15s ease;
  }

  .company-link:hover {
    color: var(--theme-text-primary);
  }

  /* Social */
  .footer-social {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .social-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    color: var(--theme-text-muted);
    background: transparent;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: color 0.15s ease;
    padding: 0;
  }

  .social-btn:hover {
    color: var(--theme-text-primary);
  }

  .social-btn svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  /* Bottom row */
  .footer-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .footer-link {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    color: var(--theme-text-muted);
    text-decoration: none;
    font-size: 0.6875rem;
    font-weight: 500;
    border-radius: 0.25rem;
    transition: color 0.15s ease;
  }

  .footer-link:hover {
    color: var(--theme-text-primary);
  }

  .footer-copy {
    font-size: 0.625rem;
    color: var(--theme-text-muted);
  }

  /* Mobile */
  @media (max-width: 640px) {
    .footer-top {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .footer-bottom {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .social-btn,
    .footer-link,
    .company-link {
      transition: none;
    }
  }
</style>
