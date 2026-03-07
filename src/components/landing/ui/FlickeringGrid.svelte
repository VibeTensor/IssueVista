<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    squareSize?: number;
    gridGap?: number;
    flickerChance?: number;
    color?: string;
    class?: string;
    maxOpacity?: number;
  }

  let {
    squareSize = 4,
    gridGap = 6,
    flickerChance = 0.3,
    color = 'rgb(0, 0, 0)',
    class: className = '',
    maxOpacity = 0.3
  }: Props = $props();

  let containerEl: HTMLDivElement;
  let canvasEl: HTMLCanvasElement;
  let animationId: number;

  onMount(() => {
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;

    // Parse color to rgba base
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = tempCanvas.height = 1;
    const tempCtx = tempCanvas.getContext('2d');
    let rgbaBase = 'rgba(0, 0, 0,';
    if (tempCtx) {
      tempCtx.fillStyle = color;
      tempCtx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(tempCtx.getImageData(0, 0, 1, 1).data);
      rgbaBase = `rgba(${r}, ${g}, ${b},`;
    }

    let cols = 0;
    let rows = 0;
    let squares: Float32Array;
    let dpr = 1;

    function setup() {
      const w = containerEl.clientWidth;
      const h = containerEl.clientHeight;
      dpr = window.devicePixelRatio || 1;
      canvasEl.width = w * dpr;
      canvasEl.height = h * dpr;
      canvasEl.style.width = `${w}px`;
      canvasEl.style.height = `${h}px`;
      cols = Math.floor(w / (squareSize + gridGap));
      rows = Math.floor(h / (squareSize + gridGap));
      squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }
    }

    setup();

    let lastTime = 0;
    function animate(time: number) {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * dt) {
          squares[i] = Math.random() * maxOpacity;
        }
      }

      ctx!.clearRect(0, 0, canvasEl.width, canvasEl.height);
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const opacity = squares[i * rows + j];
          ctx!.fillStyle = `${rgbaBase}${opacity})`;
          ctx!.fillRect(
            i * (squareSize + gridGap) * dpr,
            j * (squareSize + gridGap) * dpr,
            squareSize * dpr,
            squareSize * dpr
          );
        }
      }
      animationId = requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(() => setup());
    resizeObserver.observe(containerEl);

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  });

  onDestroy(() => {
    if (animationId) cancelAnimationFrame(animationId);
  });
</script>

<div bind:this={containerEl} class="flickering-grid {className}">
  <canvas bind:this={canvasEl} class="pointer-events-none"></canvas>
</div>

<style>
  .flickering-grid {
    width: 100%;
    height: 100%;
  }
</style>
