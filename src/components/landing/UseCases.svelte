<script lang="ts">
  import { inview } from './inview';
  import Section from './Section.svelte';
  import OrbitingCircles from './ui/OrbitingCircles.svelte';
  import { siteConfig } from './config';

  const issues = [
    { title: 'Fix typo in docs', label: 'good first issue', color: 'oklch(0.68 0.17 145)' },
    { title: 'Add unit tests', label: 'help wanted', color: 'oklch(0.72 0.16 291)' },
    { title: 'Update CI config', label: 'beginner', color: 'oklch(0.68 0.17 210)' }
  ];

  const filters = [
    'label:good-first-issue',
    'language:TypeScript',
    'NOT label:wontfix',
    'stars:>100'
  ];

  const iconPaths: Record<string, string> = {
    search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    filter:
      'M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z',
    export:
      'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  };
</script>

<Section id="use-cases" title="Use Cases" subtitle="Three ways IssueVista helps you contribute">
  <div class="use-cases-grid">
    {#each siteConfig.useCases as useCase, index (index)}
      <div class="use-case-card" use:inview>
        <div class="card-visual">
          {#if index === 0}
            <!-- Issue Discovery Card -->
            <div class="issue-list">
              {#each issues as issue, i (i)}
                <div class="issue-item" style="--delay: {i * 0.1}s;">
                  <span class="issue-title">{issue.title}</span>
                  <span class="issue-label" style="background-color: {issue.color};"
                    >{issue.label}</span
                  >
                </div>
              {/each}
            </div>
          {:else if index === 1}
            <!-- Filter Card -->
            <div class="filter-list">
              {#each filters as filter, i (i)}
                <div class="filter-item" style="--delay: {i * 0.1}s;">
                  <span class="filter-plus">+</span>
                  <span class="filter-text">{filter}</span>
                </div>
              {/each}
            </div>
          {:else}
            <!-- Cluster Card -->
            <div class="cluster-visual">
              <OrbitingCircles radius={60} duration={15} delay={0} path={false}>
                <div class="orbit-dot" style="background-color: oklch(0.78 0.13 291);"></div>
              </OrbitingCircles>
              <OrbitingCircles radius={60} duration={15} delay={5} path={false}>
                <div class="orbit-dot" style="background-color: oklch(0.68 0.17 145);"></div>
              </OrbitingCircles>
              <OrbitingCircles radius={60} duration={15} delay={10} path={false}>
                <div class="orbit-dot" style="background-color: oklch(0.68 0.17 210);"></div>
              </OrbitingCircles>
              <OrbitingCircles radius={35} duration={10} delay={0} reverse path={false}>
                <div class="orbit-dot-sm" style="background-color: oklch(0.68 0.15 15);"></div>
              </OrbitingCircles>
              <OrbitingCircles radius={35} duration={10} delay={5} reverse path={false}>
                <div class="orbit-dot-sm" style="background-color: oklch(0.68 0.17 321);"></div>
              </OrbitingCircles>
              <div class="cluster-center">D3</div>
            </div>
          {/if}
        </div>
        <div class="card-content">
          <div class="card-header">
            <svg class="card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d={iconPaths[useCase.icon] || iconPaths.search}
              />
            </svg>
            <h3 class="card-title">{useCase.title}</h3>
          </div>
          <p class="card-desc">{useCase.description}</p>
        </div>
      </div>
    {/each}
  </div>
</Section>

<style>
  .use-cases-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding-bottom: 3rem;
  }

  @media (min-width: 768px) {
    .use-cases-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .use-case-card {
    border-radius: 0.75rem;
    border: 1px solid var(--theme-border);
    overflow: hidden;
    background-color: var(--theme-bg-card, var(--theme-bg-secondary));
    transition: box-shadow 0.2s ease;
    opacity: 0;
    transform: translateY(20px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease,
      box-shadow 0.2s ease;
  }

  :global(.in-view).use-case-card {
    opacity: 1;
    transform: translateY(0);
  }

  .use-case-card:hover {
    box-shadow: 0 4px 24px var(--theme-shadow);
  }

  .card-visual {
    overflow: hidden;
    background: var(--theme-bg-tertiary);
    padding: 0.75rem;
    min-height: 12rem;
  }

  /* Issue Discovery */
  .issue-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .issue-item {
    border-radius: 0.375rem;
    border: 1px solid var(--theme-border);
    padding: 0.5rem;
    font-size: 0.75rem;
    background: var(--theme-bg-card, var(--theme-bg-secondary));
  }

  .issue-title {
    font-weight: 500;
    color: var(--theme-text-primary);
  }

  .issue-label {
    display: inline-block;
    margin-left: 0.5rem;
    border-radius: 9999px;
    padding: 0.125rem 0.375rem;
    font-size: 0.625rem;
    font-weight: 500;
    color: white;
  }

  /* Filter */
  .filter-list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    font-family: var(--font-mono, monospace);
    font-size: 0.75rem;
    padding: 0.25rem;
  }

  .filter-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .filter-plus {
    color: var(--theme-accent);
  }

  .filter-text {
    color: var(--theme-text-muted);
  }

  /* Cluster */
  .cluster-visual {
    position: relative;
    height: 12rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .orbit-dot {
    width: 0.75rem;
    height: 0.75rem;
    border-radius: 50%;
  }

  .orbit-dot-sm {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
  }

  .cluster-center {
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.625rem;
    font-weight: 700;
    background-color: var(--theme-accent);
  }

  /* Card Content */
  .card-content {
    padding: 1.25rem;
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .card-icon {
    width: 1rem;
    height: 1rem;
    color: var(--theme-accent);
    flex-shrink: 0;
  }

  .card-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--theme-text-primary);
  }

  .card-desc {
    font-size: 0.875rem;
    line-height: 1.625;
    color: var(--theme-text-muted);
  }

  @media (prefers-reduced-motion: reduce) {
    .use-case-card {
      opacity: 1;
      transform: none;
      transition: box-shadow 0.2s ease;
    }
  }
</style>
