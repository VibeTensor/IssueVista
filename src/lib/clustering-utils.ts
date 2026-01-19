/**
 * Clustering Utilities for Issue #154
 * Topic cluster visualization - groups issues by primary label
 *
 * Provides data structures and algorithms for D3 force graph clustering
 */

import type { GitHubIssue } from './github-graphql';

/**
 * Represents a node in the cluster visualization
 */
export interface ClusterNode {
  /** Unique identifier (issue number as string) */
  id: string;
  /** Full issue data */
  issue: GitHubIssue;
  /** Cluster name (primary label or 'uncategorized') */
  cluster: string;
  /** Cluster color (hex without #) */
  color: string;
  /** D3 x position (set by simulation) */
  x?: number;
  /** D3 y position (set by simulation) */
  y?: number;
  /** D3 x velocity */
  vx?: number;
  /** D3 y velocity */
  vy?: number;
  /** Fixed x position (for dragging) */
  fx?: number | null;
  /** Fixed y position (for dragging) */
  fy?: number | null;
}

/**
 * Represents a cluster (group of related issues)
 */
export interface Cluster {
  /** Cluster name (label name or 'uncategorized') */
  name: string;
  /** Cluster color (hex without #) */
  color: string;
  /** Number of issues in this cluster */
  count: number;
  /** Cluster center x position */
  x?: number;
  /** Cluster center y position */
  y?: number;
}

/**
 * Complete cluster data for visualization
 */
export interface ClusterData {
  /** All clusters */
  clusters: Cluster[];
  /** All nodes (issues) */
  nodes: ClusterNode[];
}

/** Default color for uncategorized issues */
const UNCATEGORIZED_COLOR = '6b7280';

/** Default cluster name for issues without labels */
const UNCATEGORIZED_NAME = 'uncategorized';

/**
 * Get the primary label from an issue (first label)
 * Used to determine which cluster an issue belongs to
 *
 * @param issue - GitHub issue object
 * @returns Primary label object or null if no labels
 */
export function getPrimaryLabel(issue: GitHubIssue): { name: string; color: string } | null {
  if (!issue?.labels?.nodes?.length) {
    return null;
  }
  const label = issue.labels.nodes[0];
  return {
    name: label.name,
    color: label.color || UNCATEGORIZED_COLOR
  };
}

/**
 * Group issues into clusters based on their primary label
 *
 * @param issues - Array of GitHub issues
 * @returns ClusterData with clusters and nodes
 */
export function clusterIssuesByLabel(issues: GitHubIssue[]): ClusterData {
  if (!issues || !Array.isArray(issues) || issues.length === 0) {
    return { clusters: [], nodes: [] };
  }

  const clusterMap = new Map<string, { color: string; count: number }>();
  const nodes: ClusterNode[] = [];

  // Process each issue
  for (const issue of issues) {
    const primaryLabel = getPrimaryLabel(issue);
    const clusterName = primaryLabel?.name || UNCATEGORIZED_NAME;
    const clusterColor = primaryLabel?.color || UNCATEGORIZED_COLOR;

    // Update cluster map
    const existing = clusterMap.get(clusterName);
    if (existing) {
      existing.count++;
    } else {
      clusterMap.set(clusterName, { color: clusterColor, count: 1 });
    }

    // Create node
    nodes.push({
      id: String(issue.number),
      issue,
      cluster: clusterName,
      color: clusterColor
    });
  }

  // Convert cluster map to array, sorted by count
  const clusters: Cluster[] = Array.from(clusterMap.entries())
    .map(([name, data]) => ({
      name,
      color: data.color,
      count: data.count
    }))
    .sort((a, b) => b.count - a.count);

  return { clusters, nodes };
}

/**
 * Calculate cluster center positions in a circular layout
 * Distributes clusters evenly around the center of the viewport
 *
 * @param clusters - Array of clusters
 * @param width - Viewport width
 * @param height - Viewport height
 * @returns Clusters with x, y positions set
 */
export function calculateClusterPositions(
  clusters: Cluster[],
  width: number,
  height: number
): Cluster[] {
  if (clusters.length === 0) return [];

  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.3;

  return clusters.map((cluster, index) => {
    const angle = (2 * Math.PI * index) / clusters.length - Math.PI / 2;
    return {
      ...cluster,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  });
}

/**
 * Get cluster by name
 *
 * @param clusters - Array of clusters
 * @param name - Cluster name to find
 * @returns Cluster or undefined
 */
export function getClusterByName(clusters: Cluster[], name: string): Cluster | undefined {
  return clusters.find((c) => c.name === name);
}

/**
 * Get nodes belonging to a specific cluster
 *
 * @param nodes - Array of cluster nodes
 * @param clusterName - Cluster name to filter by
 * @returns Filtered nodes
 */
export function getNodesInCluster(nodes: ClusterNode[], clusterName: string): ClusterNode[] {
  return nodes.filter((n) => n.cluster === clusterName);
}

/**
 * Calculate bounding box for a set of nodes
 * Useful for zoom-to-fit functionality
 *
 * @param nodes - Array of nodes with x, y positions
 * @param padding - Padding around the bounding box
 * @returns Bounding box { x, y, width, height }
 */
export function getNodesBoundingBox(
  nodes: ClusterNode[],
  padding: number = 50
): { x: number; y: number; width: number; height: number } {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const xs = nodes.map((n) => n.x ?? 0);
  const ys = nodes.map((n) => n.y ?? 0);

  const minX = Math.min(...xs) - padding;
  const maxX = Math.max(...xs) + padding;
  const minY = Math.min(...ys) - padding;
  const maxY = Math.max(...ys) + padding;

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}
