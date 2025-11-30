<!--
  EmptyState Component
  Issue #30 - Comprehensive empty state system with illustrations and suggestions

  Features:
  - Context-aware messaging (initial, no-results, error, rate-limited, success)
  - Sketch-style design matching app aesthetic
  - SVG illustrations for each variant
  - Primary and secondary action buttons
  - WCAG 2.1 accessible (ARIA live regions, keyboard navigation)
  - Responsive design (mobile-first)
  - Respects prefers-reduced-motion
-->

<script lang="ts">
  import {
    type EmptyStateVariant,
    type EmptyStateConfig,
    getEmptyStateConfig
  } from '../../lib/empty-state-utils';

  // Re-export type for consumers
  export type { EmptyStateVariant };

  /**
   * Props Interface
   */
  interface Props {
    /** The type of empty state to display */
    variant: EmptyStateVariant;
    /** Override the default title */
    customTitle?: string;
    /** Override the default description */
    customDescription?: string;
    /** Handler for primary action button click */
    onPrimaryAction?: () => void;
    /** Override primary button label */
    primaryActionLabel?: string;
    /** Override secondary action label */
    secondaryActionLabel?: string;
    /** URL for secondary action (opens in new tab) */
    secondaryActionHref?: string;
    /** Whether to show the illustration (default: true) */
    showIllustration?: boolean;
  }

  let {
    variant,
    customTitle,
    customDescription,
    onPrimaryAction,
    primaryActionLabel,
    secondaryActionLabel,
    secondaryActionHref,
    showIllustration = true
  }: Props = $props();

  // Get config for current variant using utility function
  const config = $derived(getEmptyStateConfig(variant));

  // Computed values with fallbacks to config defaults
  const title = $derived(customTitle || config.title);
  const description = $derived(customDescription || config.description);
  const primaryLabel = $derived(primaryActionLabel || config.primaryActionLabel);
  const secondaryLabel = $derived(secondaryActionLabel || config.secondaryActionLabel);
  const secondaryHref = $derived(secondaryActionHref || config.secondaryActionHref);

  // Determine if we should show actions
  const showPrimaryAction = $derived(!!onPrimaryAction && !!primaryLabel);
  const showSecondaryAction = $derived(!!secondaryLabel && !!secondaryHref);
</script>

<!-- Main container with ARIA live region for screen reader announcements -->
<div
  class="empty-state-container"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  <!-- Illustration (decorative, hidden from screen readers) -->
  {#if showIllustration}
    <div class="illustration" aria-hidden="true">
      {#if variant === 'initial'}
        <!-- Magnifying glass with code brackets -->
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="30" stroke="currentColor" stroke-width="3" class="sketch-stroke"/>
          <line x1="72" y1="72" x2="95" y2="95" stroke="currentColor" stroke-width="4" stroke-linecap="round" class="sketch-stroke"/>
          <text x="38" y="56" font-family="monospace" font-size="18" fill="currentColor" class="code-text">{'{ }'}</text>
        </svg>
      {:else if variant === 'no-results'}
        <!-- Empty folder -->
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 35 L20 90 L100 90 L100 35 L65 35 L55 25 L20 25 Z" stroke="currentColor" stroke-width="3" fill="none" class="sketch-stroke"/>
          <line x1="40" y1="60" x2="80" y2="60" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="sketch-stroke"/>
          <line x1="50" y1="72" x2="70" y2="72" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="sketch-stroke"/>
        </svg>
      {:else if variant === 'error'}
        <!-- Warning triangle -->
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 20 L105 95 L15 95 Z" stroke="currentColor" stroke-width="3" fill="none" class="sketch-stroke"/>
          <line x1="60" y1="45" x2="60" y2="65" stroke="currentColor" stroke-width="4" stroke-linecap="round" class="sketch-stroke"/>
          <circle cx="60" cy="78" r="3" fill="currentColor"/>
        </svg>
      {:else if variant === 'rate-limited'}
        <!-- Clock / hourglass -->
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="40" stroke="currentColor" stroke-width="3" fill="none" class="sketch-stroke"/>
          <line x1="60" y1="35" x2="60" y2="60" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="sketch-stroke"/>
          <line x1="60" y1="60" x2="78" y2="70" stroke="currentColor" stroke-width="3" stroke-linecap="round" class="sketch-stroke"/>
          <circle cx="60" cy="60" r="4" fill="currentColor"/>
        </svg>
      {:else if variant === 'success'}
        <!-- Checkmark with celebration -->
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="60" cy="60" r="40" stroke="currentColor" stroke-width="3" fill="none" class="sketch-stroke"/>
          <path d="M40 60 L55 75 L85 45" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" class="sketch-stroke success-check"/>
          <!-- Celebration dots -->
          <circle cx="25" cy="30" r="3" fill="currentColor" class="celebration-dot"/>
          <circle cx="95" cy="35" r="2" fill="currentColor" class="celebration-dot"/>
          <circle cx="20" cy="80" r="2" fill="currentColor" class="celebration-dot"/>
          <circle cx="100" cy="75" r="3" fill="currentColor" class="celebration-dot"/>
        </svg>
      {/if}
    </div>
  {/if}

  <!-- Title -->
  <h2 class="empty-state-title">{title}</h2>

  <!-- Description -->
  <p class="empty-state-description">{description}</p>

  <!-- Actions -->
  {#if showPrimaryAction || showSecondaryAction}
    <div class="empty-state-actions">
      {#if showPrimaryAction}
        <button
          type="button"
          class="primary-action"
          onclick={onPrimaryAction}
        >
          {primaryLabel}
        </button>
      {/if}

      {#if showSecondaryAction}
        <a
          href={secondaryHref}
          target="_blank"
          rel="noopener noreferrer"
          class="secondary-action"
        >
          {secondaryLabel}
          <svg class="external-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clip-rule="evenodd"/>
            <path fill-rule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clip-rule="evenodd"/>
          </svg>
        </a>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* Container - Compact */
  .empty-state-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 1rem;
    margin: 0 auto;
    max-width: 100%;
    position: relative;
    border-radius: 0.5rem;
    background: rgba(51, 65, 85, 0.15);
    backdrop-filter: blur(4px);
  }

  .empty-state-container::before {
    content: '';
    position: absolute;
    inset: -1px;
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.2);
    border-radius: inherit;
    pointer-events: none;
  }

  /* Illustration - Very small */
  .illustration {
    width: 40px;
    height: 40px;
    margin-bottom: 0.75rem;
    color: #475569;
  }

  .illustration svg {
    width: 100%;
    height: 100%;
  }

  .sketch-stroke {
    filter: url(#sketch);
  }

  .code-text {
    font-weight: 600;
  }

  .success-check {
    color: #4ade80;
    stroke: #4ade80;
  }

  .celebration-dot {
    opacity: 0.5;
  }

  /* Title */
  .empty-state-title {
    font-size: 0.8125rem;
    font-weight: 600;
    color: #94a3b8;
    margin: 0 0 0.25rem 0;
    line-height: 1.3;
  }

  /* Description */
  .empty-state-description {
    font-size: 0.6875rem;
    color: #64748b;
    margin: 0;
    line-height: 1.4;
    max-width: 220px;
  }

  /* Actions */
  .empty-state-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  /* Primary Action */
  .primary-action {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.6875rem;
    font-weight: 600;
    color: #e2e8f0;
    background: #475569;
    border: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  .primary-action::before {
    display: none;
  }

  .primary-action:hover,
  .primary-action:focus {
    background: #64748b;
  }

  .primary-action:focus-visible {
    outline: 2px solid #14b8a6;
    outline-offset: 2px;
  }

  /* Secondary Action */
  .secondary-action {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    color: #64748b;
    text-decoration: none;
  }

  .secondary-action:hover {
    color: #94a3b8;
  }

  .external-icon {
    width: 0.625rem;
    height: 0.625rem;
    opacity: 0.6;
  }

  /* No animations by default for cleaner look */
  @media (prefers-reduced-motion: no-preference) {
    .illustration {
      animation: float 4s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
  }

  /* Tablet */
  @media (min-width: 768px) {
    .empty-state-container {
      padding: 1.25rem;
      max-width: 280px;
    }

    .illustration {
      width: 48px;
      height: 48px;
    }

    .empty-state-title {
      font-size: 0.875rem;
    }

    .empty-state-description {
      font-size: 0.75rem;
      max-width: 240px;
    }
  }
</style>
