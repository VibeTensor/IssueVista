/**
 * Svelte action that triggers a callback when element enters viewport.
 * Replaces framer-motion's whileInView.
 */
export function inview(node: HTMLElement, options?: { threshold?: number; once?: boolean }) {
  const threshold = options?.threshold ?? 0.1;
  const once = options?.once ?? true;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        node.classList.add('in-view');
        if (once) observer.disconnect();
      } else if (!once) {
        node.classList.remove('in-view');
      }
    },
    { threshold }
  );

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}
