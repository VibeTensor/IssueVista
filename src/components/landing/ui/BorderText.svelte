<script lang="ts">
  interface Props {
    text: string;
    class?: string;
  }

  let { text, class: className = '' }: Props = $props();
</script>

<div
  class="border-text {className}"
  style="-webkit-text-stroke: 1px var(--theme-text-muted, oklch(0.52 0.01 264 / 0.3)); color: transparent; line-height: 0.85;"
>
  {text}
</div>

<style>
  .border-text {
    position: relative;
    user-select: none;
  }
</style>
