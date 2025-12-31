<!--
  RateLimitDisplay Component
  Issue #35 - Extracted from ResultsList.svelte
  Issue #215 - Added accessibility features (WCAG 2.1 compliant)

  Displays GitHub API rate limit information with countdown timer.
  Shows warning styling when remaining requests are low.

  Accessibility features:
  - role="status" for semantic live region (implicit aria-live="polite" and aria-atomic="true")
  - aria-label for descriptive context
  - Screen reader warning when rate limit is low
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
  <div
    role="status"
    aria-label="GitHub API rate limit status"
    class="text-xs text-center lg:text-left"
  >
    <span class={`${isLowRemaining ? 'text-amber-400' : 'text-slate-500'}`}>
      {remaining} requests
      {#if resetTime}
        · resets {resetTime}
      {/if}
    </span>
    <!-- Screen reader announcement for low rate limit warning -->
    {#if isLowRemaining}
      <span class="sr-only">Warning: API rate limit is low.</span>
    {/if}
  </div>
{/if}
