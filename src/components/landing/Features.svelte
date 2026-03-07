<script lang="ts">
  import Section from './Section.svelte';
  import { siteConfig } from './config';

  const iconPaths: Record<string, string> = {
    graphql: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    filter:
      'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    badge:
      'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    palette:
      'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    export:
      'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    history: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  };
</script>

<Section id="features" title="Features" subtitle="Everything you need to find your first issue">
  <div class="features-grid">
    {#each siteConfig.features as feature, i (i)}
      <div class="feature-card">
        <div class="feature-icon">
          <svg class="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d={iconPaths[feature.icon] || iconPaths.graphql}
            />
          </svg>
        </div>
        <h3 class="feature-name">{feature.name}</h3>
        <p class="feature-desc">{feature.description}</p>
      </div>
    {/each}
  </div>
</Section>

<style>
  .features-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1px;
    background-color: var(--theme-border);
  }

  @media (min-width: 768px) {
    .features-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .features-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .feature-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    padding: 1.5rem;
    text-align: center;
    background-color: var(--theme-bg-primary);
    transition: background-color 0.15s ease;
  }

  .feature-icon {
    display: flex;
    width: 2.5rem;
    height: 2.5rem;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    color: white;
    background: linear-gradient(to bottom, var(--theme-accent), var(--theme-accent-hover));
  }

  .icon-svg {
    width: 1.25rem;
    height: 1.25rem;
  }

  .feature-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--theme-text-primary);
  }

  .feature-desc {
    font-size: 0.875rem;
    line-height: 1.625;
    color: var(--theme-text-muted);
  }
</style>
