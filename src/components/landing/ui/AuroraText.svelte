<script lang="ts">
  interface Props {
    class?: string;
    colors?: string[];
    speed?: number;
  }

  let {
    class: className = '',
    colors = ['#ef4444', '#a855f7', '#3b82f6', '#8b5cf6', '#f59e0b'],
    speed = 1,
    children
  }: Props & { children?: any } = $props();

  const gradient = `linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`;
  const duration = `${10 / speed}s`;
</script>

<span class="aurora-wrapper {className}">
  <span class="sr-only"><slot /></span>
  <span
    class="aurora-text"
    style="background-image: {gradient}; animation-duration: {duration};"
    aria-hidden="true"
  >
    <slot />
  </span>
</span>

<style>
  .aurora-wrapper {
    position: relative;
    display: inline-block;
  }

  .aurora-text {
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    background-size: 200% auto;
    animation-name: aurora;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }
</style>
