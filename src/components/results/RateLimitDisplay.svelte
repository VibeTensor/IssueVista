<!--
  RateLimitDisplay Component
  Issue #35 - Extracted from ResultsList.svelte

  Displays GitHub API rate limit information with countdown timer.
  Shows warning styling when remaining requests are low.
-->

<script lang="ts">
  interface Props {
    remaining: number;
    resetTime: string;
  }

  let { remaining, resetTime }: Props = $props();

  // Derived state
  let isLowRemaining = $derived(remaining < 10);
  let showDisplay = $derived(remaining > 0);
</script>

{#if showDisplay}
  <div class="text-xs text-center lg:text-left">
    <span class={`${isLowRemaining ? 'text-amber-400' : 'text-slate-500'}`}>
      {remaining} requests
      {#if resetTime}
        · resets {resetTime}
      {/if}
    </span>
  </div>
{/if}
