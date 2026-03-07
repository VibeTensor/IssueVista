<script lang="ts">
  import { onMount } from 'svelte';
  import AuroraText from './ui/AuroraText.svelte';
  import Section from './Section.svelte';
  import { siteConfig } from './config';

  let visible = $state(false);

  onMount(() => {
    requestAnimationFrame(() => (visible = true));
  });
</script>

<Section id="hero">
  <div class="hero-grid" class:visible>
    <div class="hero-content">
      <!-- Pill -->
      <div class="hero-pill anim-item" style="--delay: 0s;">
        <span class="pill-badge">Open Source</span>
        <span class="pill-text">Find beginner-friendly issues</span>
      </div>

      <!-- Title -->
      <h1 class="hero-title anim-item" style="--delay: 0.2s;">
        <AuroraText class="leading-normal font-bold">{siteConfig.hero.title}</AuroraText>
      </h1>

      <!-- Description -->
      <p class="hero-desc anim-item" style="--delay: 0.4s;">
        {siteConfig.hero.description}
      </p>

      <!-- CTA -->
      <div class="hero-cta anim-item" style="--delay: 0.6s;">
        <a href="/app" class="cta-primary">
          {siteConfig.hero.cta}
          <svg class="cta-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </a>
        <a href={siteConfig.repo} target="_blank" rel="noopener noreferrer" class="cta-secondary">
          View on GitHub
        </a>
      </div>
    </div>

    <!-- Visual -->
    <div class="hero-visual anim-item" style="--delay: 0.8s;">
      <div class="visual-card">
        <div class="visual-dots">
          <span class="dot dot-red"></span>
          <span class="dot dot-yellow"></span>
          <span class="dot dot-green"></span>
        </div>
        {#each [{ label: 'good first issue', color: 'oklch(0.68 0.17 145)', title: 'Add dark mode toggle' }, { label: 'help wanted', color: 'var(--theme-accent)', title: 'Fix pagination logic' }, { label: 'beginner', color: 'oklch(0.68 0.17 210)', title: 'Update README docs' }] as issue, i (i)}
          <div class="visual-issue anim-item" style="--delay: {1 + i * 0.15}s;">
            <p class="visual-issue-title">{issue.title}</p>
            <span class="visual-issue-label" style="background-color: {issue.color};"
              >{issue.label}</span
            >
          </div>
        {/each}
      </div>
    </div>
  </div>
</Section>

<style>
  .hero-grid {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    width: 100%;
    padding-top: 6rem;
    padding-bottom: 4rem;
  }

  @media (min-width: 1024px) {
    .hero-grid {
      grid-template-columns: 1fr 1fr;
      padding-top: 8rem;
      padding-bottom: 6rem;
    }
  }

  .hero-content {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }

  /* Animation */
  .anim-item {
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
      transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    transition-delay: var(--delay, 0s);
  }

  .visible .anim-item {
    opacity: 1;
    transform: translateY(0);
  }

  /* Pill */
  .hero-pill {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 9999px;
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    background-color: oklch(from var(--theme-accent) l c h / 0.15);
    border: 1px solid oklch(from var(--theme-accent) l c h / 0.3);
  }

  .pill-badge {
    border-radius: 9999px;
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: white;
    background-color: var(--theme-accent);
  }

  .pill-text {
    color: var(--theme-text-muted);
  }

  /* Title */
  .hero-title {
    padding-top: 2rem;
    font-size: 2.25rem;
    font-weight: 700;
    line-height: 1.1;
    letter-spacing: -0.025em;
  }

  @media (min-width: 640px) {
    .hero-title {
      font-size: 3rem;
    }
  }
  @media (min-width: 768px) {
    .hero-title {
      font-size: 3.75rem;
    }
  }
  @media (min-width: 1024px) {
    .hero-title {
      font-size: 4.5rem;
    }
  }

  /* Description */
  .hero-desc {
    margin-top: 1rem;
    max-width: 36rem;
    font-size: 1.125rem;
    line-height: 1.75;
    color: var(--theme-text-muted);
  }

  /* CTA buttons */
  .hero-cta {
    margin-top: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .hero-cta {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  .cta-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    color: white;
    background-color: var(--theme-accent);
    text-decoration: none;
    transition: transform 0.15s ease;
  }

  .cta-primary:hover {
    transform: scale(1.05);
  }

  .cta-arrow {
    width: 1rem;
    height: 1rem;
  }

  .cta-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--theme-border);
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    color: var(--theme-text-primary);
    text-decoration: none;
    transition: border-color 0.15s ease;
  }

  .cta-secondary:hover {
    border-color: var(--theme-accent);
  }

  /* Visual card */
  .hero-visual {
    display: none;
    align-items: center;
    justify-content: center;
  }

  @media (min-width: 1024px) {
    .hero-visual {
      display: flex;
    }
  }

  .visual-card {
    position: relative;
    width: 20rem;
    border-radius: 0.75rem;
    border: 1px solid var(--theme-border);
    padding: 1rem;
    background-color: var(--theme-bg-card);
    box-shadow: 0 4px 24px var(--theme-shadow);
  }

  .visual-dots {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid var(--theme-border);
  }

  .dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
  }

  .dot-red {
    background-color: oklch(0.68 0.15 15);
  }
  .dot-yellow {
    background-color: oklch(0.78 0.17 85);
  }
  .dot-green {
    background-color: oklch(0.68 0.17 145);
  }

  .visual-issue {
    border-radius: 0.5rem;
    border: 1px solid var(--theme-border);
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    background: var(--theme-bg-tertiary);
  }

  .visual-issue:last-child {
    margin-bottom: 0;
  }

  .visual-issue-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--theme-text-primary);
  }

  .visual-issue-label {
    display: inline-block;
    margin-top: 0.25rem;
    border-radius: 9999px;
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: white;
  }

  @media (prefers-reduced-motion: reduce) {
    .anim-item {
      opacity: 1;
      transform: none;
      transition: none;
    }
  }
</style>
