<!--
  LoadingProgress Component
  Issue #23 - Loading progress with status messages and cancel option

  Features:
  - Prominent progress bar with percentage display
  - Real-time status messages (page count, issues found)
  - Estimated time remaining
  - Cancel button with confirmation flow
  - WCAG 2.1 accessible (role="progressbar", aria attributes)
  - Respects prefers-reduced-motion
  - Matches sketch-card design aesthetic
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import {
    type ProgressState,
    calculateProgress,
    getStatusMessage,
    getDetailedStatus,
    canCancel,
    getProgressColor,
    estimateRemainingTime
  } from '../../lib/loading-progress-utils';

  /**
   * Props Interface
   */
  interface Props {
    /** Progress state from loading-progress-utils */
    progressState: ProgressState;
    /** Callback when user clicks cancel button */
    onCancelRequest?: () => void;
    /** Start time for estimated remaining calculation (Date.now()) */
    startTime?: number;
  }

  let {
    progressState,
    onCancelRequest,
    startTime
  }: Props = $props();

  // Track elapsed time for estimated remaining calculation
  let elapsedMs = $state(0);
  let intervalId: number | null = null;

  // Derived values using utility functions
  const progress = $derived(calculateProgress(progressState));
  const statusMessage = $derived(getStatusMessage(progressState));
  const detailedStatus = $derived(getDetailedStatus(progressState));
  const showCancel = $derived(canCancel(progressState));
  const progressColor = $derived(getProgressColor(progressState.phase));
  const estimatedTime = $derived(
    startTime && elapsedMs > 1000
      ? estimateRemainingTime(progress, elapsedMs)
      : null
  );

  // Format progress for display
  const progressDisplay = $derived(Math.round(progress));

  // Determine if currently fetching (for pulse animation)
  const isFetching = $derived(progressState.phase === 'fetching');

  // Update elapsed time every 500ms
  onMount(() => {
    if (typeof window !== 'undefined' && startTime) {
      elapsedMs = Date.now() - startTime;
      intervalId = window.setInterval(() => {
        elapsedMs = Date.now() - (startTime ?? Date.now());
      }, 500);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined' && intervalId !== null) {
      clearInterval(intervalId);
    }
  });

  // Handle cancel button click
  function handleCancelClick() {
    onCancelRequest?.();
  }
</script>

<!-- Main container with ARIA live region -->
<div
  class="loading-progress-container"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  <!-- Progress Bar Section -->
  <div
    class="progress-wrapper"
    role="progressbar"
    aria-valuenow={progressDisplay}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-label={`Loading progress: ${progressDisplay}%`}
  >
    <div class="progress-track">
      <div
        class="progress-fill {progressColor} {isFetching ? 'fetching' : ''}"
        style="width: {progress}%"
      ></div>
    </div>
    <span class="progress-percentage">{progressDisplay}%</span>
  </div>

  <!-- Status Message -->
  <p class="status-message">{statusMessage}</p>

  <!-- Detail Row (issues found + estimated time) -->
  {#if progressState.issuesFound > 0 || estimatedTime}
    <div class="detail-row">
      {#if progressState.issuesFound > 0}
        <span class="issues-count">
          <svg class="icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z" clip-rule="evenodd"/>
          </svg>
          {progressState.issuesFound} issue{progressState.issuesFound !== 1 ? 's' : ''} found
        </span>
      {/if}
      {#if progressState.issuesFound > 0 && estimatedTime}
        <span class="separator" aria-hidden="true">•</span>
      {/if}
      {#if estimatedTime}
        <span class="estimated-time">
          <svg class="icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
          </svg>
          {estimatedTime}
        </span>
      {/if}
    </div>
  {/if}

  <!-- Cancel Button -->
  {#if showCancel && onCancelRequest}
    <button
      type="button"
      class="cancel-button"
      onclick={handleCancelClick}
      aria-label="Cancel search"
    >
      <svg class="icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
      Cancel Search
    </button>
  {/if}
</div>

<style>
  /* Container */
  .loading-progress-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1.5rem;
    margin: 0 auto;
    max-width: 400px;
    width: 100%;
    background: rgba(30, 41, 59, 0.7);
    backdrop-filter: blur(16px);
    border-radius: 12px;
    position: relative;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
  }

  .loading-progress-container::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: transparent;
    border: 2px solid rgba(148, 163, 184, 0.25);
    border-radius: inherit;
    filter: url(#sketch);
    pointer-events: none;
  }

  /* Progress Bar Wrapper */
  .progress-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  /* Progress Track */
  .progress-track {
    flex: 1;
    height: 12px;
    background: rgba(71, 85, 105, 0.5);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
  }

  /* Progress Fill */
  .progress-fill {
    height: 100%;
    border-radius: 6px;
    transition: width 0.3s ease-out;
    position: relative;
  }

  /* Progress Fill Colors (from getProgressColor) */
  .progress-fill.bg-teal-500 {
    background: linear-gradient(90deg, #14b8a6 0%, #0d9488 100%);
  }

  .progress-fill.bg-emerald-500 {
    background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  }

  .progress-fill.bg-amber-500 {
    background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
  }

  .progress-fill.bg-red-500 {
    background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
  }

  /* Pulse animation during fetching */
  .progress-fill.fetching {
    animation: progress-pulse 1.5s ease-in-out infinite;
  }

  @keyframes progress-pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  /* Shimmer effect on progress bar */
  .progress-fill::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.15) 50%,
      transparent 100%
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  /* Progress Percentage */
  .progress-percentage {
    font-size: 0.875rem;
    font-weight: 700;
    color: #e2e8f0;
    min-width: 3rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  /* Status Message */
  .status-message {
    font-size: 0.9375rem;
    font-weight: 600;
    color: #f1f5f9;
    margin: 0 0 0.75rem 0;
    line-height: 1.4;
  }

  /* Detail Row */
  .detail-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
    padding: 0.5rem 0.75rem;
    background: rgba(51, 65, 85, 0.4);
    border-radius: 6px;
    margin-bottom: 1rem;
  }

  .issues-count,
  .estimated-time {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: #94a3b8;
  }

  .separator {
    color: #475569;
  }

  .icon {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }

  /* Cancel Button */
  .cancel-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-button:hover {
    background: rgba(251, 191, 36, 0.2);
    border-color: rgba(251, 191, 36, 0.5);
  }

  .cancel-button:focus-visible {
    outline: 2px solid #fbbf24;
    outline-offset: 2px;
  }

  .cancel-button .icon {
    width: 1rem;
    height: 1rem;
  }

  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .progress-fill {
      transition: none;
    }

    .progress-fill.fetching {
      animation: none;
    }

    .progress-fill::after {
      animation: none;
      display: none;
    }
  }

  /* Tablet+ */
  @media (min-width: 768px) {
    .loading-progress-container {
      padding: 2rem;
      max-width: 450px;
    }

    .progress-track {
      height: 14px;
    }

    .status-message {
      font-size: 1rem;
    }

    .detail-row {
      padding: 0.625rem 1rem;
    }

    .issues-count,
    .estimated-time {
      font-size: 0.8125rem;
    }
  }
</style>
