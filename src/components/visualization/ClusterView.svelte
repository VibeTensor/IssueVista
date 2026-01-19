<!--
  ClusterView Component
  Issue #154 - Topic Cluster Visualization

  Displays issues as a force-directed graph grouped by label clusters.
  Features:
  - Server-side layout computation (Cloudflare Workers) for low-end devices
  - Client-side fallback for offline/error cases
  - Zoom and pan controls
  - Click cluster to focus
  - Hover for issue details
-->

<script lang="ts">
  import { onDestroy } from 'svelte';
  import * as d3 from 'd3';
  import type { GitHubIssue } from '../../lib/github-graphql';
  import {
    clusterIssuesByLabel,
    calculateClusterPositions,
    getNodesInCluster,
    getNodesBoundingBox,
    type ClusterNode,
    type ClusterData
  } from '../../lib/clustering-utils';

  // Server-side API response types
  interface ServerCluster {
    name: string;
    color: string;
    count: number;
    x: number;
    y: number;
  }

  interface ServerClusterNode {
    id: string;
    cluster: string;
    color: string;
    x: number;
    y: number;
    radius: number;
    issue: {
      number: number;
      title: string;
      url: string;
      commentCount: number;
    };
  }

  interface ServerLayoutResponse {
    clusters: ServerCluster[];
    nodes: ServerClusterNode[];
    meta: {
      totalIssues: number;
      processedIssues: number;
      computeTimeMs: number;
    };
  }

  interface Props {
    /** Array of issues to visualize */
    issues: GitHubIssue[];
    /** Container width (default: 800) */
    width?: number;
    /** Container height (default: 600) */
    height?: number;
    /** Callback when a node is clicked */
    onNodeClick?: (issue: GitHubIssue) => void;
    /** Use server-side layout computation (default: true) */
    useServerLayout?: boolean;
  }

  let { issues, width = 800, height = 600, onNodeClick, useServerLayout = true }: Props = $props();

  // DOM references
  let svgElement: SVGSVGElement;
  let containerElement: HTMLDivElement;

  // D3 selections and simulation
  let svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  let g: d3.Selection<SVGGElement, unknown, null, undefined>;
  let simulation: d3.Simulation<ClusterNode, undefined>;
  let zoom: d3.ZoomBehavior<SVGSVGElement, unknown>;

  // State
  let clusterData = $state<ClusterData>({ clusters: [], nodes: [] });
  let hoveredNode = $state<ClusterNode | null>(null);
  let selectedCluster = $state<string | null>(null);
  let isLoading = $state(false);
  let loadingMessage = $state('');
  let tooltipPosition = $state({ x: 0, y: 0 });
  let serverLayoutUsed = $state(false);

  // Derived: clusters with positions
  let positionedClusters = $derived(calculateClusterPositions(clusterData.clusters, width, height));

  // Debounce timer for $effect
  let initDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  let abortController: AbortController | null = null;

  // Node radius based on comment count
  function getNodeRadius(node: ClusterNode): number {
    const baseRadius = 6;
    const comments = node.issue.comments?.totalCount ?? 0;
    return baseRadius + Math.min(comments, 5) * 0.4;
  }

  /**
   * Fetch layout from server-side Cloudflare Worker
   */
  async function fetchServerLayout(): Promise<ServerLayoutResponse | null> {
    try {
      abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController?.abort(), 5000); // 5s timeout

      const response = await fetch('/api/cluster-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issues: issues.map((i) => ({
            number: i.number,
            title: i.title,
            url: i.url,
            labels: i.labels,
            comments: i.comments
          })),
          width,
          height,
          maxNodes: 30
        }),
        signal: abortController.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('Server layout API returned error:', response.status);
        return null;
      }

      return await response.json();
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        console.warn('Server layout request timed out, using client-side fallback');
      } else {
        console.warn('Server layout fetch failed:', error);
      }
      return null;
    }
  }

  /**
   * Convert server response to ClusterData format
   */
  function serverResponseToClusterData(
    response: ServerLayoutResponse,
    originalIssues: GitHubIssue[]
  ): ClusterData {
    // Create issue lookup map
    const issueMap = new Map(originalIssues.map((i) => [i.number, i]));

    // Convert server nodes to ClusterNode format
    const nodes: ClusterNode[] = response.nodes.map((serverNode) => {
      const originalIssue = issueMap.get(serverNode.issue.number);
      return {
        id: serverNode.id,
        cluster: serverNode.cluster,
        color: serverNode.color,
        x: serverNode.x,
        y: serverNode.y,
        issue:
          originalIssue ||
          ({
            number: serverNode.issue.number,
            title: serverNode.issue.title,
            url: serverNode.issue.url,
            comments: { totalCount: serverNode.issue.commentCount }
          } as GitHubIssue)
      };
    });

    return {
      clusters: response.clusters,
      nodes
    };
  }

  /**
   * Client-side layout computation (fallback)
   */
  function computeClientSideLayout(): void {
    // Limit nodes for performance (max 30 issues in visualization)
    const maxNodes = 30;
    const limitedIssues = issues.length > maxNodes ? issues.slice(0, maxNodes) : issues;

    // Process issues into cluster data
    clusterData = clusterIssuesByLabel(limitedIssues);

    if (clusterData.nodes.length === 0) return;

    // Get cluster positions
    const clusters = calculateClusterPositions(clusterData.clusters, width, height);
    const clusterMap = new Map(clusters.map((c) => [c.name, c]));

    // Position nodes in circle pattern around their cluster center
    const nodesPerCluster: Record<string, ClusterNode[]> = {};
    for (const node of clusterData.nodes) {
      const existing = nodesPerCluster[node.cluster] ?? [];
      existing.push(node);
      nodesPerCluster[node.cluster] = existing;
    }

    for (const [clusterName, clusterNodes] of Object.entries(nodesPerCluster)) {
      const center = clusterMap.get(clusterName);
      if (!center) continue;

      const cx = center.x!;
      const cy = center.y!;
      const nodeCount = clusterNodes.length;
      const radius = 20 + nodeCount * 4;

      clusterNodes.forEach((node, i) => {
        if (nodeCount === 1) {
          node.x = cx;
          node.y = cy;
        } else {
          const angle = (i / nodeCount) * 2 * Math.PI;
          node.x = cx + radius * Math.cos(angle);
          node.y = cy + radius * Math.sin(angle);
        }
      });
    }
  }

  /**
   * Initialize visualization (tries server-side first, then falls back to client)
   */
  async function initializeVisualization() {
    if (!svgElement || issues.length === 0) return;

    // Stop any existing simulation before reinitializing
    if (simulation) {
      simulation.stop();
    }

    // Cancel any pending server request
    if (abortController) {
      abortController.abort();
    }

    isLoading = true;
    serverLayoutUsed = false;

    // Try server-side layout first (faster for low-end devices)
    if (useServerLayout) {
      loadingMessage = 'Computing layout...';
      const serverResponse = await fetchServerLayout();

      if (serverResponse && serverResponse.nodes.length > 0) {
        clusterData = serverResponseToClusterData(serverResponse, issues);
        serverLayoutUsed = true;
        console.log(`Server layout computed in ${serverResponse.meta.computeTimeMs}ms`);
      }
    }

    // Fallback to client-side if server failed or disabled
    if (!serverLayoutUsed) {
      loadingMessage = 'Rendering...';
      computeClientSideLayout();
    }

    isLoading = false;
    loadingMessage = '';

    if (clusterData.nodes.length === 0) return;

    // Render the visualization
    renderVisualization();
  }

  /**
   * Render the D3 visualization with pre-computed positions
   */
  function renderVisualization() {
    // Clear previous content
    d3.select(svgElement).selectAll('*').remove();

    // Setup SVG
    svg = d3.select(svgElement);

    // Create zoom behavior
    zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Create main group for zoom/pan
    g = svg.append('g');

    // Get cluster positions for labels
    const clusters = serverLayoutUsed
      ? clusterData.clusters
      : calculateClusterPositions(clusterData.clusters, width, height);

    // Draw cluster labels
    const clusterLabels = g
      .selectAll('.cluster-label')
      .data(clusters)
      .join('g')
      .attr('class', 'cluster-label')
      .attr('transform', (d) => `translate(${d.x}, ${d.y! - 60})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        focusOnCluster(d.name);
      });

    clusterLabels
      .append('rect')
      .attr('x', -40)
      .attr('y', -12)
      .attr('width', 80)
      .attr('height', 24)
      .attr('rx', 12)
      .attr('fill', (d) => `#${d.color}40`)
      .attr('stroke', (d) => `#${d.color}`)
      .attr('stroke-width', 1.5);

    clusterLabels
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', (d) => `#${d.color}`)
      .attr('font-size', '11px')
      .attr('font-weight', '600')
      .text((d) => (d.name.length > 10 ? d.name.slice(0, 10) + '...' : d.name));

    clusterLabels
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.8em')
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .text((d) => `${d.count} issue${d.count !== 1 ? 's' : ''}`);

    // Draw nodes with pre-computed positions and accessibility attributes
    g.selectAll('.node')
      .data(clusterData.nodes)
      .join('circle')
      .attr('class', 'node')
      .attr('cx', (d) => d.x ?? 0)
      .attr('cy', (d) => d.y ?? 0)
      .attr('r', (d) => getNodeRadius(d))
      .attr('fill', (d) => `#${d.color}`)
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .attr('role', 'img')
      .attr('aria-label', (d) => `Issue ${d.issue.number}: ${d.issue.title}, cluster: ${d.cluster}`)
      .attr('tabindex', 0)
      .style('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        hoveredNode = d;
        // Use pointer coordinates for proper positioning with zoom/pan
        const [px, py] = d3.pointer(event, svgElement);
        tooltipPosition = {
          x: Math.min(px + 20, width - 200),
          y: Math.max(py - 80, 20)
        };
        d3.select(event.target).attr('stroke', '#fff').attr('stroke-width', 3);
      })
      .on('mouseleave', (event) => {
        hoveredNode = null;
        d3.select(event.target).attr('stroke', '#1e293b').attr('stroke-width', 2);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onNodeClick) {
          onNodeClick(d.issue);
        }
      });

    // Click on background to reset zoom
    svg.on('click', () => {
      selectedCluster = null;
      resetZoom();
    });
  }

  // Focus on a specific cluster
  function focusOnCluster(clusterName: string) {
    selectedCluster = clusterName;
    const nodesInCluster = getNodesInCluster(clusterData.nodes, clusterName);

    if (nodesInCluster.length === 0) return;

    const bounds = getNodesBoundingBox(nodesInCluster, 80);

    // Calculate zoom transform to fit cluster
    const scale = Math.min((0.9 * width) / bounds.width, (0.9 * height) / bounds.height, 2);
    const centerX = bounds.x + bounds.width / 2;
    const centerY = bounds.y + bounds.height / 2;

    svg
      .transition()
      .duration(750)
      .call(
        zoom.transform,
        d3.zoomIdentity
          .translate(width / 2, height / 2)
          .scale(scale)
          .translate(-centerX, -centerY)
      );
  }

  // Reset zoom to initial state
  function resetZoom() {
    svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
  }

  // Zoom controls
  function zoomIn() {
    svg.transition().duration(300).call(zoom.scaleBy, 1.5);
  }

  function zoomOut() {
    svg.transition().duration(300).call(zoom.scaleBy, 0.67);
  }

  // Reinitialize when issues or dimensions change (debounced to prevent rapid reinits)
  $effect(() => {
    if (issues && issues.length > 0 && svgElement && width && height) {
      // Clear any pending initialization
      if (initDebounceTimer) {
        clearTimeout(initDebounceTimer);
      }
      // Debounce initialization by 100ms
      initDebounceTimer = setTimeout(() => {
        initializeVisualization();
      }, 100);
    }
  });

  // Cleanup on destroy
  onDestroy(() => {
    if (initDebounceTimer) {
      clearTimeout(initDebounceTimer);
    }
    if (simulation) {
      simulation.stop();
    }
    if (abortController) {
      abortController.abort();
    }
  });
</script>

<div class="cluster-view-container" bind:this={containerElement}>
  <!-- Zoom Controls -->
  <div class="zoom-controls">
    <button type="button" onclick={zoomIn} aria-label="Zoom in" title="Zoom in">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
      </svg>
    </button>
    <button type="button" onclick={zoomOut} aria-label="Zoom out" title="Zoom out">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35M8 11h6" />
      </svg>
    </button>
    <button type="button" onclick={resetZoom} aria-label="Reset zoom" title="Reset view">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    </button>
  </div>

  <!-- Cluster Legend -->
  <div class="cluster-legend">
    <div class="legend-title">Clusters</div>
    {#each positionedClusters as cluster (cluster.name)}
      <button
        type="button"
        class="legend-item"
        class:selected={selectedCluster === cluster.name}
        onclick={() => focusOnCluster(cluster.name)}
      >
        <span class="legend-color" style="background-color: #{cluster.color}"></span>
        <span class="legend-name">{cluster.name}</span>
        <span class="legend-count">{cluster.count}</span>
      </button>
    {/each}
  </div>

  <!-- SVG Canvas -->
  <svg bind:this={svgElement} {width} {height} viewBox="0 0 {width} {height}" class="cluster-svg">
  </svg>

  <!-- Loading Indicator (ARIA live region for accessibility) -->
  <div class="loading-indicator" role="status" aria-live="polite" aria-atomic="true">
    {#if isLoading}
      <span class="pulse-dot" aria-hidden="true"></span>
      <span>{loadingMessage || 'Loading...'}</span>
    {/if}
  </div>

  <!-- Tooltip (Dynamic Position) -->
  {#if hoveredNode}
    <div class="tooltip" style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px;">
      <div class="tooltip-title">#{hoveredNode.issue.number}</div>
      <div class="tooltip-body">{hoveredNode.issue.title}</div>
      <div class="tooltip-meta">
        <span class="tooltip-label" style="color: #{hoveredNode.color}">{hoveredNode.cluster}</span>
        <span class="tooltip-comments">{hoveredNode.issue.comments?.totalCount ?? 0} comments</span>
      </div>
    </div>
  {/if}
</div>

<style>
  .cluster-view-container {
    position: relative;
    width: 100%;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    border-radius: 12px;
    border: 1px solid rgba(71, 85, 105, 0.4);
    overflow: hidden;
  }

  .cluster-svg {
    display: block;
    width: 100%;
    height: auto;
  }

  /* Node styling - no transitions for performance */
  .cluster-svg :global(.node) {
    /* No transitions - critical for performance */
  }

  /* Loading Indicator (ARIA live region - always rendered for accessibility) */
  .loading-indicator {
    position: absolute;
    bottom: 12px;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(20, 184, 166, 0.3);
    border-radius: 20px;
    font-size: 12px;
    color: #94a3b8;
    z-index: 10;
  }

  .loading-indicator:empty {
    display: none;
  }

  .pulse-dot {
    width: 8px;
    height: 8px;
    background: #14b8a6;
    border-radius: 50%;
    animation: pulse 1.5s infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 0.4;
      transform: scale(0.8);
    }
    50% {
      opacity: 1;
      transform: scale(1.2);
    }
  }

  /* Zoom Controls */
  .zoom-controls {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    z-index: 10;
  }

  .zoom-controls button {
    width: 36px;
    height: 36px;
    padding: 8px;
    background: rgba(30, 41, 59, 0.9);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 8px;
    color: #94a3b8;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .zoom-controls button:hover {
    background: rgba(51, 65, 85, 0.9);
    color: white;
    border-color: rgba(100, 116, 139, 0.6);
    transform: scale(1.05);
  }

  .zoom-controls button:focus-visible {
    outline: 2px solid #14b8a6;
    outline-offset: 2px;
  }

  .zoom-controls button:active {
    transform: scale(0.95);
  }

  .zoom-controls button svg {
    width: 100%;
    height: 100%;
  }

  /* Cluster Legend */
  .cluster-legend {
    position: absolute;
    top: 12px;
    left: 12px;
    background: rgba(15, 23, 42, 0.98);
    border: 1px solid rgba(71, 85, 105, 0.4);
    border-radius: 10px;
    padding: 10px;
    max-height: 220px;
    overflow-y: auto;
    z-index: 10;
    min-width: 150px;
  }

  .legend-title {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 8px;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .legend-item:hover {
    background: rgba(51, 65, 85, 0.5);
    transform: translateX(2px);
  }

  .legend-item:focus-visible {
    outline: 2px solid #14b8a6;
    outline-offset: 2px;
  }

  .legend-item.selected {
    background: rgba(20, 184, 166, 0.2);
    border-color: rgba(20, 184, 166, 0.4);
  }

  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-name {
    flex: 1;
    font-size: 12px;
    color: #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }

  .legend-count {
    font-size: 11px;
    color: #94a3b8;
    background: rgba(51, 65, 85, 0.6);
    padding: 2px 7px;
    border-radius: 9999px;
    font-weight: 600;
  }

  /* Tooltip */
  .tooltip {
    position: absolute;
    background: rgba(15, 23, 42, 0.98);
    border: 1px solid rgba(71, 85, 105, 0.5);
    border-radius: 10px;
    padding: 12px 14px;
    max-width: 260px;
    z-index: 20;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .tooltip-title {
    font-size: 13px;
    font-weight: 700;
    color: #14b8a6;
    margin-bottom: 6px;
  }

  .tooltip-body {
    font-size: 13px;
    color: #e2e8f0;
    line-height: 1.5;
    margin-bottom: 8px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .tooltip-meta {
    display: flex;
    gap: 10px;
    font-size: 11px;
    color: #94a3b8;
  }

  .tooltip-label {
    font-weight: 600;
  }

  .tooltip-comments {
    opacity: 0.8;
  }

  /* Scrollbar for legend */
  .cluster-legend::-webkit-scrollbar {
    width: 4px;
  }

  .cluster-legend::-webkit-scrollbar-track {
    background: transparent;
  }

  .cluster-legend::-webkit-scrollbar-thumb {
    background: rgba(100, 116, 139, 0.4);
    border-radius: 2px;
  }

  /* Mobile adjustments */
  @media (max-width: 640px) {
    .cluster-legend {
      max-width: 120px;
      font-size: 10px;
    }

    .zoom-controls button {
      width: 28px;
      height: 28px;
    }

    .tooltip {
      max-width: 200px;
    }
  }
</style>
