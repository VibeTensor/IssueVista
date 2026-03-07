<script lang="ts">
  interface Props {
    mainCircleSize?: number;
    mainCircleOpacity?: number;
    numCircles?: number;
    class?: string;
  }

  let {
    mainCircleSize = 210,
    mainCircleOpacity = 0.24,
    numCircles = 8,
    class: className = ''
  }: Props = $props();

  let circles = $derived(
    Array.from({ length: numCircles }, (_, i) => ({
      size: mainCircleSize + i * 70,
      opacity: mainCircleOpacity - i * 0.03,
      borderStyle: i === numCircles - 1 ? 'dashed' : 'solid',
      borderOpacity: (5 + i * 5) / 100,
      delay: `${i * 0.06}s`
    }))
  );
</script>

<div
  class="ripple-container {className}"
  style="mask-image: linear-gradient(to bottom, white, transparent);"
>
  {#each circles as circle, i (i)}
    <div
      class="ripple-circle"
      style="
        width: {circle.size}px;
        height: {circle.size}px;
        opacity: {circle.opacity};
        border-style: {circle.borderStyle};
        border-width: 1px;
        border-color: var(--theme-text-muted, oklch(0.52 0.01 264 / {circle.borderOpacity}));
        background-color: var(--theme-text-muted, oklch(0.52 0.01 264 / 0.03));
        animation-delay: {circle.delay};
      "
    ></div>
  {/each}
</div>

<style>
  .ripple-container {
    pointer-events: none;
    user-select: none;
    position: absolute;
    inset: 0;
  }

  .ripple-circle {
    position: absolute;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(1);
    animation: ripple 2s ease infinite;
  }
</style>
