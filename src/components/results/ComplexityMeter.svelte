<!--
  ComplexityMeter Component
  Issue #152 - Visual Issue Complexity Meter

  Displays a visual progress bar showing issue complexity based on:
  - Labels (40%): Presence of difficulty-indicating labels
  - Comments (30%): Lower comment count = easier
  - Body Length (30%): Shorter body = simpler scope

  Visual:
  - Linear progress bar with gradient (green → amber → red)
  - Tooltip with breakdown on hover
  - WCAG 2.1 accessible with progressbar role
-->

<script lang="ts">
  import type { GitHubIssue } from '../../lib/github-graphql';
  import { calculateDifficulty } from '../../lib/difficulty-utils';

  interface Props {
    /** GitHub issue to calculate complexity for */
    issue: GitHubIssue;
    /** Whether to show tooltip with explanation (default: true) */
    showTooltip?: boolean;
  }

  let { issue, showTooltip = true }: Props = $props();

  // Calculate complexity using $derived for reactivity
  let difficultyResult = $derived(calculateDifficulty(issue));

  // Generate detailed tooltip text
  let tooltipText = $derived.by(() => {
    const { score, level } = difficultyResult;
    const levelCapitalized = level.charAt(0).toUpperCase() + level.slice(1);
    return `Complexity: ${score}% (${levelCapitalized}) - Based on labels, comments, and body length`;
  });

  // Determine gradient color based on score
  let gradientClass = $derived.by(() => {
    const { score } = difficultyResult;
    if (score <= 33) {
      // Easy: Green gradient
      return 'from-green-500 to-green-400';
    }
    if (score <= 66) {
      // Medium: Amber gradient
      return 'from-amber-500 to-amber-400';
    }
    // Hard: Red gradient
    return 'from-red-500 to-red-400';
  });

  // Background color for track (unfilled portion)
  let trackClass = $derived('bg-slate-700/50');
</script>

<div
  class="complexity-meter w-full"
  role="progressbar"
  aria-valuenow={difficultyResult.score}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Issue complexity: {difficultyResult.score}%"
  title={showTooltip ? tooltipText : undefined}
>
  <!-- Track (background) -->
  <div class="h-1.5 rounded-full {trackClass} overflow-hidden">
    <!-- Fill (progress) -->
    <div
      class="h-full rounded-full bg-gradient-to-r {gradientClass} transition-all duration-300"
      style="width: {difficultyResult.score}%"
    ></div>
  </div>
</div>
