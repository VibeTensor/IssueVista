<script lang="ts">
  import { inview } from './inview';
  import Section from './Section.svelte';
  import Ripple from './ui/Ripple.svelte';
  import { siteConfig } from './config';

  const avatarLetters = ['P', 'K', 'D', 'V', 'T'];
</script>

<Section id="community" title="Community" subtitle="Built in the open, for everyone">
  <div class="community-card" use:inview>
    <Ripple mainCircleSize={180} numCircles={6} mainCircleOpacity={0.15} />

    <div class="community-content">
      <div class="avatar-row">
        {#each avatarLetters as letter, i (i)}
          <div
            class="avatar"
            style="background-color: oklch({0.58 + i * 0.04} 0.13 {200 + i * 30});"
          >
            {letter}
          </div>
        {/each}
      </div>

      <p class="community-desc">
        IssueVista is open source and community-driven. Star us on GitHub to show your support.
      </p>

      <a href={siteConfig.repo} target="_blank" rel="noopener noreferrer" class="github-btn">
        <svg class="gh-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
        Star on GitHub
      </a>
    </div>
  </div>
</Section>

<style>
  .community-card {
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    border: 1px solid var(--theme-border);
    padding: 5rem 2rem;
    text-align: center;
    background-color: var(--theme-bg-card);
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease;
  }

  :global(.in-view).community-card {
    opacity: 1;
    transform: translateY(0);
  }

  .community-content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
  }

  .avatar-row {
    display: flex;
    margin-left: -0.75rem;
  }

  .avatar {
    display: flex;
    width: 2.5rem;
    height: 2.5rem;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 2px solid var(--theme-bg-primary);
    font-size: 0.875rem;
    font-weight: 700;
    color: white;
    margin-left: -0.375rem;
  }

  .avatar:first-child {
    margin-left: 0;
  }

  .community-desc {
    max-width: 28rem;
    color: var(--theme-text-muted);
    line-height: 1.625;
  }

  .github-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.5rem;
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: white;
    background-color: var(--theme-accent);
    text-decoration: none;
    transition: transform 0.15s ease;
  }

  .github-btn:hover {
    transform: scale(1.05);
  }

  .gh-icon {
    width: 1rem;
    height: 1rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .community-card {
      opacity: 1;
      transform: none;
      transition: none;
    }
    .github-btn {
      transition: none;
    }
  }
</style>
