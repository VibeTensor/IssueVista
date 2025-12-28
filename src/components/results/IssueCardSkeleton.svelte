<!--
  IssueCardSkeleton Component
  Issue #125 - Interactive Issue Preview Card with Animations

  Loading skeleton placeholder that matches IssueCard layout.
  Uses Tailwind's animate-pulse for shimmer effect.
  Respects prefers-reduced-motion via CSS in ResultsContainer.
-->

<script lang="ts">
  interface Props {
    /** Number of skeleton cards to render */
    count?: number;
    /** Whether to show label placeholders */
    showLabels?: boolean;
  }

  let { count = 1, showLabels = true }: Props = $props();

  // Generate array for iteration
  const skeletons = $derived(Array.from({ length: count }, (_, i) => i));
</script>

{#each skeletons as index (index)}
  <div
    class="skeleton-card sketch-card animate-pulse p-2.5 md:p-3"
    aria-hidden="true"
    role="presentation"
  >
    <!-- Mobile layout skeleton -->
    <div class="md:hidden">
      <!-- Header row: badge + buttons -->
      <div class="flex items-center justify-between gap-2 mb-2">
        <div class="flex items-center gap-1.5">
          <!-- Issue number badge -->
          <div class="h-5 w-10 bg-slate-700 rounded"></div>
        </div>
        <div class="flex items-center gap-1.5">
          <!-- Copy button -->
          <div class="h-7 w-7 bg-slate-700 rounded"></div>
          <!-- View button -->
          <div class="h-7 w-7 bg-slate-700 rounded"></div>
        </div>
      </div>

      <!-- Title (2 lines) -->
      <div class="h-4 bg-slate-700 rounded w-full mb-1.5"></div>
      <div class="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>

      <!-- Metadata row -->
      <div class="flex flex-wrap items-center gap-2 mb-1.5">
        <div class="h-3 w-20 bg-slate-700 rounded"></div>
        <div class="h-3 w-8 bg-slate-700 rounded"></div>
      </div>

      <!-- Labels -->
      {#if showLabels}
        <div class="flex flex-wrap gap-1">
          <div class="h-4 w-12 bg-slate-700 rounded"></div>
          <div class="h-4 w-16 bg-slate-700 rounded"></div>
          <div class="h-4 w-10 bg-slate-700 rounded"></div>
        </div>
      {/if}
    </div>

    <!-- Desktop layout skeleton -->
    <div class="hidden md:flex items-start gap-3">
      <div class="flex-1 min-w-0">
        <!-- Badge row -->
        <div class="flex items-center gap-2 mb-1.5">
          <div class="h-5 w-12 bg-slate-700 rounded"></div>
        </div>

        <!-- Title (2 lines) -->
        <div class="h-4 bg-slate-700 rounded w-full mb-1.5"></div>
        <div class="h-4 bg-slate-700 rounded w-2/3 mb-2"></div>

        <!-- Metadata row -->
        <div class="flex flex-wrap items-center gap-3 mb-1.5">
          <div class="h-3 w-24 bg-slate-700 rounded"></div>
          <div class="h-3 w-16 bg-slate-700 rounded"></div>
        </div>

        <!-- Labels -->
        {#if showLabels}
          <div class="flex flex-wrap gap-1">
            <div class="h-4 w-14 bg-slate-700 rounded"></div>
            <div class="h-4 w-20 bg-slate-700 rounded"></div>
            <div class="h-4 w-12 bg-slate-700 rounded"></div>
            <div class="h-4 w-16 bg-slate-700 rounded"></div>
          </div>
        {/if}
      </div>

      <!-- Action buttons -->
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <div class="h-8 w-16 bg-slate-700 rounded"></div>
        <div class="h-8 w-14 bg-slate-700 rounded"></div>
      </div>
    </div>
  </div>
{/each}
