<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    class?: string;
    children?: Snippet;
    reverse?: boolean;
    duration?: number;
    delay?: number;
    radius?: number;
    path?: boolean;
  }

  let {
    class: className = '',
    children,
    reverse = false,
    duration = 20,
    delay = 10,
    radius = 50,
    path = true
  }: Props = $props();
</script>

{#if path}
  <svg xmlns="http://www.w3.org/2000/svg" class="orbit-path">
    <circle
      cx="50%"
      cy="50%"
      r={radius}
      fill="none"
      stroke="var(--theme-text-muted, oklch(0.52 0.01 264 / 0.2))"
      stroke-width="1"
    />
  </svg>
{/if}
<div
  class="orbit-item {className}"
  style="
    --radius: {radius};
    animation: orbit {duration}s linear infinite {reverse ? 'reverse' : 'normal'};
    animation-delay: {-delay}s;
  "
>
  {#if children}
    {@render children()}
  {/if}
</div>

<style>
  .orbit-path {
    pointer-events: none;
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .orbit-item {
    position: absolute;
    display: flex;
    width: 2rem;
    height: 2rem;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1px solid var(--theme-border, oklch(0.82 0.008 264 / 0.2));
    background: var(--theme-bg-primary, oklch(0.98 0.004 264 / 0.05));
  }
</style>
