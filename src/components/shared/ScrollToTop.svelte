<!--
  ScrollToTop Component
  Issue #178 - Add scroll-to-top button

  A floating button that appears after scrolling down the page.
  Provides smooth scroll to top with accessibility support.
  Respects prefers-reduced-motion user preference.
-->

<script lang="ts">
  interface Props {
    /** Scroll distance in pixels before button appears */
    threshold?: number;
  }

  let { threshold = 400 }: Props = $props();

  let scrollY = $state(0);
  let visible = $derived(scrollY > threshold);

  /**
   * Scroll to top of page with smooth animation.
   * Uses instant scroll if user prefers reduced motion.
   */
  function scrollToTop() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'instant' : 'smooth'
    });
  }
</script>

<svelte:window bind:scrollY />

<button
  type="button"
  onclick={scrollToTop}
  class="scroll-to-top-btn"
  class:visible
  aria-label="Scroll to top"
  title="Scroll to top"
>
  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7" />
  </svg>
</button>

<style>
  .scroll-to-top-btn {
    position: fixed;
    bottom: 1.25rem;
    right: 1.25rem;
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    background: var(--theme-accent, oklch(0.78 0.13 291));
    color: white;
    border: none;
    border-radius: 9999px;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -2px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transform: translateY(0.625rem);
    transition:
      opacity 300ms ease-out,
      visibility 0ms ease-out 300ms,
      transform 300ms ease-out,
      background 150ms ease-out,
      box-shadow 150ms ease-out;
  }

  .scroll-to-top-btn.visible {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
    transition:
      opacity 300ms ease-out,
      visibility 0ms ease-out 0ms,
      transform 300ms ease-out,
      background 150ms ease-out,
      box-shadow 150ms ease-out;
  }

  .scroll-to-top-btn.visible:hover {
    background: var(--theme-accent-hover, oklch(0.83 0.13 291));
    transform: translateY(-0.125rem);
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -4px rgba(0, 0, 0, 0.1);
  }

  .scroll-to-top-btn:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 3px rgba(94, 234, 212, 0.5),
      0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .scroll-to-top-btn:active {
    transform: translateY(0.0625rem);
  }

  .scroll-to-top-btn.visible:active {
    transform: translateY(0.0625rem);
  }

  /* Responsive: slightly smaller on mobile */
  @media (max-width: 640px) {
    .scroll-to-top-btn {
      bottom: 1rem;
      right: 1rem;
    }
  }

  /* Respect reduced motion preference */
  @media (prefers-reduced-motion: reduce) {
    .scroll-to-top-btn {
      transition: none;
    }

    .scroll-to-top-btn.visible {
      transition: none;
    }
  }
</style>
