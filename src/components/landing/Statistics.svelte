<script lang="ts">
  import { inview } from './inview';
  import Section from './Section.svelte';
  import BorderText from './ui/BorderText.svelte';
  import { siteConfig } from './config';
</script>

<Section id="statistics">
  <div class="stats-container" use:inview>
    <div class="stats-row">
      {#each siteConfig.stats as stat, i (i)}
        <div class="stat-item" style="--delay: {i * 0.15}s;">
          <span class="stat-value">{stat.value}</span>
          <span class="stat-label">{stat.label}</span>
        </div>
      {/each}
    </div>
    <div class="brand-text-wrapper">
      <BorderText text="ISSUEVISTA" class="brand-text" />
    </div>
  </div>
</Section>

<style>
  .stats-container {
    position: relative;
    overflow: hidden;
    border-radius: 1rem;
    padding: 4rem 2rem;
    text-align: center;
    background: radial-gradient(
      ellipse at center,
      oklch(from var(--theme-accent) l c h / 0.1),
      transparent 70%
    );
  }

  .stats-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3rem;
  }

  @media (min-width: 768px) {
    .stats-row {
      flex-direction: row;
      gap: 5rem;
    }
  }

  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-size: 3rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--theme-accent);
  }

  @media (min-width: 768px) {
    .stat-value {
      font-size: 3.75rem;
    }
  }

  .stat-label {
    margin-top: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--theme-text-muted);
  }

  .brand-text-wrapper {
    margin-top: 3rem;
  }

  :global(.brand-text) {
    font-size: clamp(2rem, 10vw, 6rem);
    font-family: var(--font-mono, monospace);
    letter-spacing: -0.05em;
    font-weight: 500;
  }
</style>
