<script lang="ts">
  import { inview } from './inview';
  import Section from './Section.svelte';
</script>

<Section id="cta">
  <div class="cta-section" use:inview>
    <h2 class="cta-title">Ready to find your first open source issue?</h2>
    <p class="cta-desc">No signup needed. Just pick a repo and start exploring.</p>
    <div class="cta-action">
      <a href="/app" class="cta-btn">
        Start Searching
        <svg class="cta-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </a>
    </div>
  </div>
</Section>

<style>
  .cta-section {
    padding: 5rem 0;
    text-align: center;
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease;
  }

  :global(.in-view).cta-section {
    opacity: 1;
    transform: translateY(0);
  }

  .cta-title {
    font-size: 1.875rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--theme-text-primary);
  }

  @media (min-width: 640px) {
    .cta-title {
      font-size: 2.25rem;
    }
  }

  .cta-desc {
    margin-top: 1rem;
    margin-left: auto;
    margin-right: auto;
    max-width: 32rem;
    font-size: 1.125rem;
    color: var(--theme-text-muted);
    line-height: 1.625;
  }

  .cta-action {
    margin-top: 2rem;
  }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.5rem;
    padding: 0.875rem 2rem;
    font-size: 1rem;
    font-weight: 500;
    color: white;
    background-color: var(--theme-accent);
    text-decoration: none;
    transition: transform 0.15s ease;
  }

  .cta-btn:hover {
    transform: scale(1.05);
  }

  .cta-arrow {
    width: 1rem;
    height: 1rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .cta-section {
      opacity: 1;
      transform: none;
      transition: none;
    }
    .cta-btn {
      transition: none;
    }
  }
</style>
