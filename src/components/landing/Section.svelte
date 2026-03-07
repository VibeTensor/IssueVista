<script lang="ts">
  import FlickeringGrid from './ui/FlickeringGrid.svelte';

  interface Props {
    id?: string;
    title?: string;
    subtitle?: string;
    description?: string;
    class?: string;
  }

  let { id, title, subtitle, description, class: className = '' }: Props = $props();
</script>

<section {id}>
  <div class="section-inner {className}">
    {#if title || subtitle || description}
      <div class="section-header">
        {#if title}
          <h2 class="section-label">{title}</h2>
        {/if}
        {#if subtitle}
          <h3 class="section-title">{subtitle}</h3>
        {/if}
        {#if description}
          <p class="section-desc">{description}</p>
        {/if}
        <div class="section-gradient"></div>
        <FlickeringGrid
          squareSize={4}
          gridGap={4}
          color="#6B7280"
          maxOpacity={0.15}
          flickerChance={0.1}
          class="section-grid"
        />
      </div>
    {/if}
    <slot />
  </div>
</section>

<style>
  .section-inner {
    position: relative;
    margin: 0 auto;
    width: 100%;
    max-width: 1000px;
    padding: 0 1rem;
  }

  .section-header {
    position: relative;
    margin: 0 auto;
    overflow: hidden;
    padding: 2rem 0 3rem;
    text-align: center;
  }

  @media (min-width: 768px) {
    .section-header {
      padding: 3rem 0 4rem;
    }
  }

  .section-label {
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--theme-text-muted);
  }

  .section-title {
    margin-top: 1rem;
    max-width: 42rem;
    margin-left: auto;
    margin-right: auto;
    font-size: 1.875rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--theme-text-primary);
  }

  @media (min-width: 640px) {
    .section-title {
      font-size: 2.25rem;
    }
  }

  @media (min-width: 768px) {
    .section-title {
      font-size: 3rem;
    }
  }

  .section-desc {
    margin-top: 1.5rem;
    max-width: 42rem;
    margin-left: auto;
    margin-right: auto;
    font-size: 1.125rem;
    line-height: 2;
    color: var(--theme-text-muted);
  }

  .section-gradient {
    pointer-events: none;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(to top, var(--theme-bg-primary) 50%, transparent);
    z-index: -10;
  }

  :global(.section-grid) {
    z-index: -20;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
</style>
