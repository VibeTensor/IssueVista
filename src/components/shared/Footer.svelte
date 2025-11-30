<!--
  Footer Component
  Issue #21 - Comprehensive footer with links, version, and social sharing

  Features:
  - GitHub repository link
  - Report issue link
  - Contributing guide link
  - Social sharing buttons (Twitter/X, LinkedIn)
  - Version display from package.json
  - "Made with love" attribution
  - Responsive design
  - Keyboard accessible (WCAG 2.1.1 compliant)
  - Matches app's sketch/hand-drawn design system
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import {
    REPO_URL,
    ISSUES_URL,
    CONTRIBUTING_URL,
    COMPANY_NAME,
    COMPANY_GITHUB,
    COMPANY_EMAIL,
    COMPANY_COUNTRY,
    getTwitterShareUrl,
    getLinkedInShareUrl,
    nativeShare,
    isWebShareSupported
  } from '../../lib/footer-utils';

  // Version from Vite define
  const version = __APP_VERSION__;

  /**
   * Handle native sharing via Web Share API (mobile-first)
   */
  async function handleNativeShare() {
    try {
      await nativeShare();
    } catch {
      // User cancelled or error - fail silently
    }
  }

  // Check if Web Share API is available
  let canNativeShare = $state(false);

  onMount(() => {
    canNativeShare = isWebShareSupported();
  });
</script>

<footer
  class="footer-container"
  aria-label="Site footer"
>
  <div class="footer-content">
    <!-- All in one row - Links, Social, Attribution -->
    <div class="footer-row">
      <!-- Quick Links -->
      <div class="footer-links">
        <a href={REPO_URL} target="_blank" rel="noopener noreferrer" class="footer-link" title="GitHub">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </a>
        <a href={ISSUES_URL} target="_blank" rel="noopener noreferrer" class="footer-link" title="Report Issue">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </a>
        <a href={CONTRIBUTING_URL} target="_blank" rel="noopener noreferrer" class="footer-link" title="Contribute">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </a>
      </div>

      <!-- Divider -->
      <span class="footer-divider">·</span>

      <!-- Social -->
      <div class="footer-social">
        {#if canNativeShare}
          <button type="button" onclick={handleNativeShare} class="footer-link" title="Share">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
            </svg>
          </button>
        {/if}
        <a href={getTwitterShareUrl()} target="_blank" rel="noopener noreferrer" class="footer-link" title="Share on X">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
        <a href={getLinkedInShareUrl()} target="_blank" rel="noopener noreferrer" class="footer-link" title="Share on LinkedIn">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>
      </div>

      <!-- Divider -->
      <span class="footer-divider">·</span>

      <!-- Attribution & Version -->
      <div class="footer-meta">
        <span class="version-badge">v{version}</span>
      </div>
    </div>

    <!-- Company Attribution - Indian Compliance -->
    <div class="company-attribution">
      <p class="company-line">
        A product of <a href={COMPANY_GITHUB} target="_blank" rel="noopener noreferrer" class="company-link">{COMPANY_NAME}</a>
        <span class="company-country">({COMPANY_COUNTRY})</span>
      </p>
      <p class="company-contact">
        <a href="mailto:{COMPANY_EMAIL}" class="contact-link">{COMPANY_EMAIL}</a>
      </p>
    </div>
  </div>
</footer>

<style>
  /* Footer container - compact single row */
  .footer-container {
    width: 100%;
    background: rgba(15, 23, 42, 0.8);
    border-top: 1px solid rgba(71, 85, 105, 0.3);
    padding: 0.75rem 1rem;
    margin-top: 1rem;
  }

  .footer-content {
    max-width: 80rem;
    margin: 0 auto;
  }

  .footer-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .footer-links,
  .footer-social {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .footer-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    color: #64748b;
    text-decoration: none;
    border-radius: 0.375rem;
    transition: all 0.15s ease;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .footer-link:hover {
    color: #5eead4;
    background: rgba(13, 148, 136, 0.15);
  }

  .footer-divider {
    color: #475569;
    font-size: 0.75rem;
  }

  .footer-meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .version-badge {
    font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', monospace;
    font-size: 0.625rem;
    font-weight: 600;
    color: #5eead4;
    background: rgba(13, 148, 136, 0.15);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
  }

  /* Company Attribution - Indian Compliance */
  .company-attribution {
    text-align: center;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid rgba(71, 85, 105, 0.2);
  }

  .company-line {
    font-size: 0.625rem;
    color: #64748b;
    margin: 0 0 0.25rem 0;
  }

  .company-link {
    color: #94a3b8;
    text-decoration: none;
    font-weight: 500;
  }

  .company-link:hover {
    color: #5eead4;
  }

  .company-country {
    color: #475569;
    font-size: 0.5625rem;
  }

  .company-contact {
    font-size: 0.5625rem;
    color: #475569;
    margin: 0;
  }

  .contact-link {
    color: #475569;
    text-decoration: none;
  }

  .contact-link:hover {
    color: #5eead4;
  }

  /* Responsive */
  @media (max-width: 480px) {
    .footer-row {
      gap: 0.5rem;
    }

    .footer-divider {
      display: none;
    }
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    .footer-link {
      transition: none;
    }
  }
</style>
