<!--
  CopyButton Component
  Issue #35 - Extracted from ResultsList.svelte

  A reusable copy-to-clipboard button with visual feedback.
  Shows a checkmark icon when content has been copied.
-->

<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    text: string;
    label?: string;
    ariaLabel?: string;
    copied?: boolean;
    onCopy?: () => void;
    class?: string;
  }

  let {
    text,
    label = 'Copy',
    ariaLabel = 'Copy to clipboard',
    copied = false,
    onCopy,
    class: className = ''
  }: Props = $props();

  let internalCopied = $state(false);
  let copyTimeout: number | null = null;

  // Cleanup timeout on component unmount
  onMount(() => {
    return () => {
      if (copyTimeout) {
        window.clearTimeout(copyTimeout);
      }
    };
  });

  // Use external copied state if provided, otherwise use internal
  let showCopied = $derived(copied || internalCopied);

  /**
   * Copy text to clipboard with fallback for older browsers
   */
  async function handleCopy() {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      handleCopySuccess();
    } catch (err) {
      // Fallback for browsers without clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();

      try {
        document.execCommand('copy');
        handleCopySuccess();
      } catch (e) {
        console.error('Failed to copy text:', e);
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }

  function handleCopySuccess() {
    internalCopied = true;
    onCopy?.();

    // Clear previous timeout if exists
    if (copyTimeout) {
      window.clearTimeout(copyTimeout);
    }

    // Reset after 2 seconds
    copyTimeout = window.setTimeout(() => {
      internalCopied = false;
      copyTimeout = null;
    }, 2000);
  }
</script>

<button
  type="button"
  onclick={handleCopy}
  class="inline-flex flex-row items-center justify-center gap-2 {showCopied
    ? 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600'
    : 'bg-gradient-to-br from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600'} text-white rounded-xl font-bold sketch-button transition-all shadow-md {className}"
  aria-label={ariaLabel}
  title={showCopied ? 'Copied!' : label}
>
  {#if showCopied}
    <!-- Checkmark icon -->
    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
    </svg>
    <span class="truncate">Copied!</span>
  {:else}
    <!-- Link icon -->
    <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
      />
    </svg>
    <span class="truncate">{label}</span>
  {/if}
</button>
