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
  role="contentinfo"
  aria-label="Site footer"
>
  <div class="footer-content">
    <!-- Navigation Links -->
    <nav class="footer-nav" aria-label="Footer navigation">
      <ul class="footer-links">
        <li>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            class="footer-link"
            aria-label="View IssueFlow on GitHub (opens in new tab)"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>
        </li>
        <li>
          <a
            href={ISSUES_URL}
            target="_blank"
            rel="noopener noreferrer"
            class="footer-link"
            aria-label="Report an issue on GitHub (opens in new tab)"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>Report Issue</span>
          </a>
        </li>
        <li>
          <a
            href={CONTRIBUTING_URL}
            target="_blank"
            rel="noopener noreferrer"
            class="footer-link"
            aria-label="Read contributing guidelines (opens in new tab)"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
            </svg>
            <span>Contribute</span>
          </a>
        </li>
      </ul>
    </nav>

    <!-- Social Sharing - Icon only buttons -->
    <div class="footer-social" role="group" aria-label="Share on social media">
      <!-- Native Share (Mobile) -->
      {#if canNativeShare}
        <button
          type="button"
          on:click={handleNativeShare}
          class="social-icon-button"
          aria-label="Share IssueFlow"
          title="Share"
        >
          <svg class="social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
          </svg>
        </button>
      {/if}

      <!-- Twitter/X -->
      <a
        href={getTwitterShareUrl()}
        target="_blank"
        rel="noopener noreferrer"
        class="social-icon-button"
        aria-label="Share on Twitter/X (opens in new tab)"
        title="Share on X"
      >
        <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      </a>

      <!-- LinkedIn -->
      <a
        href={getLinkedInShareUrl()}
        target="_blank"
        rel="noopener noreferrer"
        class="social-icon-button"
        aria-label="Share on LinkedIn (opens in new tab)"
        title="Share on LinkedIn"
      >
        <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
    </div>

    <!-- Attribution & Version -->
    <div class="footer-bottom">
      <p class="attribution">
        Made with <span class="heart" aria-label="love">&#10084;</span> by
        <a
          href="https://github.com/VibeTensor"
          target="_blank"
          rel="noopener noreferrer"
          class="author-link"
        >
          VibeTensor
        </a>
      </p>
      <div class="version-badge">
        <span class="version-label">v</span>
        <span class="version-number">{version}</span>
      </div>
    </div>
  </div>
</footer>

<style>
  /* Footer container - matches app's sketch-card style */
  .footer-container {
    width: 100%;
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(16px);
    border-top: 2px solid rgba(148, 163, 184, 0.25);
    padding: 2rem 1rem;
    margin-top: 3rem;
    position: relative;
    box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.4);
  }

  /* Hand-drawn border effect - matches app's sketch-card::before */
  .footer-container::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: transparent;
    border: 2px solid rgba(148, 163, 184, 0.25);
    filter: url(#sketch);
    pointer-events: none;
  }

  .footer-content {
    max-width: 80rem;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
    text-align: center;
  }

  /* Navigation Links */
  .footer-nav {
    width: 100%;
  }

  .footer-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.75rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  /* Footer links - matches app's sketch-button style */
  .footer-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1rem;
    color: #e2e8f0;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.875rem;
    border-radius: 0.75rem;
    background: linear-gradient(to bottom right, #475569, #334155);
    transition: all 0.2s ease;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  /* Hand-drawn border for links - matches sketch-button::before */
  .footer-link::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: inherit;
    filter: url(#sketch-light);
    pointer-events: none;
  }

  .footer-link:hover,
  .footer-link:focus {
    color: #fff;
    background: linear-gradient(to bottom right, #64748b, #475569);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  .footer-link:focus-visible {
    outline: 2px solid #4ade80;
    outline-offset: 2px;
  }

  /* Social Sharing - compact icon buttons */
  .footer-social {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    justify-content: center;
  }

  /* Social icon buttons - circular, icon-only */
  .social-icon-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.75rem;
    text-decoration: none;
    color: #94a3b8;
    background: linear-gradient(to bottom right, #475569, #334155);
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  /* Hand-drawn border for social icon buttons */
  .social-icon-button::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: transparent;
    border: 2px solid rgba(255, 255, 255, 0.15);
    border-radius: inherit;
    filter: url(#sketch-light);
    pointer-events: none;
  }

  .social-icon-button:hover,
  .social-icon-button:focus {
    color: #fff;
    background: linear-gradient(to bottom right, #64748b, #475569);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  .social-icon-button:focus-visible {
    outline: 2px solid #4ade80;
    outline-offset: 2px;
  }

  .social-icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
  }

  /* Attribution & Version */
  .footer-bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(148, 163, 184, 0.15);
    width: 100%;
  }

  .attribution {
    color: #94a3b8;
    font-size: 0.875rem;
    margin: 0;
    font-weight: 500;
  }

  .heart {
    color: #ef4444;
    display: inline-block;
    animation: heartbeat 1.5s ease infinite;
  }

  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }

  .author-link {
    color: #e2e8f0;
    text-decoration: none;
    font-weight: 700;
    transition: all 0.2s ease;
    position: relative;
  }

  .author-link::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(to right, #4ade80, #22d3ee);
    transition: width 0.2s ease;
  }

  .author-link:hover::after,
  .author-link:focus::after {
    width: 100%;
  }

  .author-link:hover,
  .author-link:focus {
    color: #4ade80;
  }

  .author-link:focus-visible {
    outline: 2px solid #4ade80;
    outline-offset: 2px;
  }

  /* Version badge - matches app's sketch-badge style */
  .version-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    background: linear-gradient(to bottom right, #334155, #1e293b);
    border-radius: 9999px;
    font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', monospace;
    font-size: 0.75rem;
    font-weight: 700;
    color: #94a3b8;
    position: relative;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  /* Hand-drawn border for version badge */
  .version-badge::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: inherit;
    filter: url(#sketch-light);
    pointer-events: none;
  }

  .version-label {
    color: #64748b;
  }

  .version-number {
    color: #e2e8f0;
  }

  /* Icons */
  .icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
  }

  /* Responsive Design */
  @media (min-width: 640px) {
    .footer-content {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: space-between;
      text-align: left;
    }

    .footer-nav {
      width: auto;
    }

    .footer-bottom {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  @media (min-width: 768px) {
    .footer-container {
      padding: 2.5rem 2rem;
    }

    .footer-links {
      gap: 0.5rem;
    }

    .footer-link {
      padding: 0.5rem 1.25rem;
    }
  }

  /* Reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .heart {
      animation: none;
    }

    .footer-link,
    .social-icon-button,
    .author-link,
    .author-link::after {
      transition: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .footer-link,
    .social-icon-button {
      border: 2px solid white;
    }

    .version-badge {
      border: 1px solid white;
    }
  }
</style>
