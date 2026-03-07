<script lang="ts">
  import BorderText from './ui/BorderText.svelte';
  import { siteConfig } from './config';
</script>

<footer class="footer">
  <div class="footer-inner">
    <div class="footer-top">
      <div class="footer-brand">
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
      </div>

      <div class="social-links">
        {#each siteConfig.footer.socialLinks as link (link.name)}
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            class="social-link"
            aria-label={link.name}
          >
            {#if link.icon === 'github'}
              <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                />
              </svg>
            {:else}
              <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                />
              </svg>
            {/if}
          </a>
        {/each}
      </div>
    </div>

    <div class="footer-bottom">
      <nav class="footer-links" aria-label="Footer navigation">
        {#each siteConfig.footer.links as link (link.text)}
          <a
            href={link.url}
            class="footer-link"
            target={link.url.startsWith('http') ? '_blank' : undefined}
            rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
          >
            {link.text}
          </a>
        {/each}
      </nav>
      <p class="footer-copy">{siteConfig.footer.bottomText}</p>
    </div>

    <BorderText text={siteConfig.footer.brandText} class="footer-brand-text" />
  </div>
</footer>

<style>
  .footer {
    margin: 0 auto;
    max-width: 1000px;
    padding: 2rem 1rem;
  }

  .footer-inner {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .footer-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .logo-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  .brand-name {
    font-size: 1.125rem;
    font-weight: 700;
    color: var(--theme-text-primary);
  }

  .social-links {
    display: flex;
    gap: 0.75rem;
  }

  .social-link {
    color: var(--theme-text-muted);
    transition: color 0.15s ease;
  }

  .social-link:hover {
    color: var(--theme-text-primary);
  }

  .social-link svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .footer-bottom {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (min-width: 768px) {
    .footer-bottom {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }

  .footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 1.25rem;
  }

  .footer-link {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--theme-text-muted);
    text-decoration: none;
    transition: color 0.15s ease;
  }

  .footer-link:hover {
    color: var(--theme-text-primary);
  }

  .footer-copy {
    font-size: 0.875rem;
    color: var(--theme-text-muted);
  }

  :global(.footer-brand-text) {
    font-size: clamp(3rem, 15vw, 10rem);
    overflow: hidden;
    font-family: var(--font-mono, monospace);
    letter-spacing: -0.05em;
    font-weight: 500;
  }

  @media (prefers-reduced-motion: reduce) {
    .social-link,
    .footer-link {
      transition: none;
    }
  }
</style>
