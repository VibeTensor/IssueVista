/**
 * Unit tests for clustering-utils.ts
 * Issue #154 - Topic Cluster Visualization
 */

import { describe, it, expect } from 'vitest';
import {
  clusterIssuesByLabel,
  getPrimaryLabel,
  calculateClusterPositions,
  getNodesInCluster,
  getNodesBoundingBox,
  getClusterByName
} from '../src/lib/clustering-utils';
import type { GitHubIssue } from '../src/lib/github-graphql';

// Mock issue factory
function createMockIssue(
  number: number,
  labels: Array<{ name: string; color: string }> = []
): GitHubIssue {
  return {
    number,
    title: `Issue ${number}`,
    url: `https://github.com/test/repo/issues/${number}`,
    body: `Body of issue ${number}`,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    comments: { totalCount: 0 },
    labels: {
      nodes: labels.map((l) => ({ ...l, description: null }))
    },
    timelineItems: { nodes: [] }
  };
}

describe('clustering-utils', () => {
  describe('getPrimaryLabel', () => {
    it('returns null for issue with no labels', () => {
      const issue = createMockIssue(1, []);
      expect(getPrimaryLabel(issue)).toBeNull();
    });

    it('returns first label as primary label', () => {
      const issue = createMockIssue(1, [
        { name: 'bug', color: 'ff0000' },
        { name: 'enhancement', color: '00ff00' }
      ]);
      const primary = getPrimaryLabel(issue);
      expect(primary).toEqual({ name: 'bug', color: 'ff0000' });
    });

    it('handles issue with undefined labels', () => {
      const issue = { number: 1 } as GitHubIssue;
      expect(getPrimaryLabel(issue)).toBeNull();
    });
  });

  describe('clusterIssuesByLabel', () => {
    it('returns empty data for empty array', () => {
      const result = clusterIssuesByLabel([]);
      expect(result.clusters).toHaveLength(0);
      expect(result.nodes).toHaveLength(0);
    });

    it('groups issues by primary label', () => {
      const issues = [
        createMockIssue(1, [{ name: 'bug', color: 'ff0000' }]),
        createMockIssue(2, [{ name: 'bug', color: 'ff0000' }]),
        createMockIssue(3, [{ name: 'enhancement', color: '00ff00' }])
      ];

      const result = clusterIssuesByLabel(issues);

      expect(result.clusters).toHaveLength(2);
      expect(result.nodes).toHaveLength(3);

      const bugCluster = result.clusters.find((c) => c.name === 'bug');
      expect(bugCluster?.count).toBe(2);

      const enhancementCluster = result.clusters.find((c) => c.name === 'enhancement');
      expect(enhancementCluster?.count).toBe(1);
    });

    it('puts unlabeled issues in uncategorized cluster', () => {
      const issues = [createMockIssue(1, []), createMockIssue(2, [])];

      const result = clusterIssuesByLabel(issues);

      expect(result.clusters).toHaveLength(1);
      expect(result.clusters[0].name).toBe('uncategorized');
      expect(result.clusters[0].count).toBe(2);
    });

    it('sorts clusters by count descending', () => {
      const issues = [
        createMockIssue(1, [{ name: 'a', color: '000000' }]),
        createMockIssue(2, [{ name: 'b', color: '111111' }]),
        createMockIssue(3, [{ name: 'b', color: '111111' }]),
        createMockIssue(4, [{ name: 'b', color: '111111' }])
      ];

      const result = clusterIssuesByLabel(issues);

      expect(result.clusters[0].name).toBe('b');
      expect(result.clusters[0].count).toBe(3);
      expect(result.clusters[1].name).toBe('a');
      expect(result.clusters[1].count).toBe(1);
    });
  });

  describe('calculateClusterPositions', () => {
    it('returns empty array for no clusters', () => {
      const result = calculateClusterPositions([], 800, 600);
      expect(result).toHaveLength(0);
    });

    it('positions clusters in circular layout', () => {
      const clusters = [
        { name: 'a', color: '000000', count: 1 },
        { name: 'b', color: '111111', count: 2 }
      ];

      const result = calculateClusterPositions(clusters, 800, 600);

      expect(result).toHaveLength(2);
      expect(result[0].x).toBeDefined();
      expect(result[0].y).toBeDefined();
      expect(result[1].x).toBeDefined();
      expect(result[1].y).toBeDefined();
    });

    it('centers clusters around viewport center', () => {
      const clusters = [{ name: 'a', color: '000000', count: 1 }];

      const result = calculateClusterPositions(clusters, 800, 600);

      // Single cluster should be at top of circle (angle = -PI/2)
      expect(result[0].x).toBeCloseTo(400, 0); // center x
      expect(result[0].y).toBeLessThan(300); // above center
    });
  });

  describe('getNodesInCluster', () => {
    it('filters nodes by cluster name', () => {
      const nodes = [
        { id: '1', cluster: 'bug', color: 'ff0000', issue: createMockIssue(1) },
        { id: '2', cluster: 'bug', color: 'ff0000', issue: createMockIssue(2) },
        { id: '3', cluster: 'enhancement', color: '00ff00', issue: createMockIssue(3) }
      ];

      const bugNodes = getNodesInCluster(nodes, 'bug');
      expect(bugNodes).toHaveLength(2);

      const enhancementNodes = getNodesInCluster(nodes, 'enhancement');
      expect(enhancementNodes).toHaveLength(1);
    });

    it('returns empty array for non-existent cluster', () => {
      const nodes = [{ id: '1', cluster: 'bug', color: 'ff0000', issue: createMockIssue(1) }];

      const result = getNodesInCluster(nodes, 'nonexistent');
      expect(result).toHaveLength(0);
    });
  });

  describe('getNodesBoundingBox', () => {
    it('returns zero dimensions for empty array', () => {
      const result = getNodesBoundingBox([]);
      expect(result).toEqual({ x: 0, y: 0, width: 0, height: 0 });
    });

    it('calculates bounding box with default padding of 50', () => {
      const nodes = [
        { id: '1', cluster: 'a', color: '000', issue: createMockIssue(1), x: 100, y: 100 },
        { id: '2', cluster: 'a', color: '000', issue: createMockIssue(2), x: 200, y: 200 }
      ];

      // Test default padding (should be 50)
      const result = getNodesBoundingBox(nodes);

      expect(result.x).toBe(50); // 100 - 50 padding
      expect(result.y).toBe(50); // 100 - 50 padding
      expect(result.width).toBe(200); // (200 + 50) - (100 - 50)
      expect(result.height).toBe(200);
    });

    it('calculates bounding box with custom padding', () => {
      const nodes = [
        { id: '1', cluster: 'a', color: '000', issue: createMockIssue(1), x: 100, y: 100 },
        { id: '2', cluster: 'a', color: '000', issue: createMockIssue(2), x: 200, y: 200 }
      ];

      const result = getNodesBoundingBox(nodes, 20);

      expect(result.x).toBe(80); // 100 - 20 padding
      expect(result.y).toBe(80); // 100 - 20 padding
      expect(result.width).toBe(140); // (200 + 20) - (100 - 20)
      expect(result.height).toBe(140);
    });
  });

  describe('getClusterByName', () => {
    it('finds cluster by name', () => {
      const clusters = [
        { name: 'bug', color: 'ff0000', count: 5 },
        { name: 'enhancement', color: '00ff00', count: 3 },
        { name: 'documentation', color: '0000ff', count: 1 }
      ];

      const result = getClusterByName(clusters, 'enhancement');
      expect(result).toEqual({ name: 'enhancement', color: '00ff00', count: 3 });
    });

    it('returns undefined for non-existent cluster', () => {
      const clusters = [
        { name: 'bug', color: 'ff0000', count: 5 },
        { name: 'enhancement', color: '00ff00', count: 3 }
      ];

      const result = getClusterByName(clusters, 'nonexistent');
      expect(result).toBeUndefined();
    });

    it('returns undefined for empty array', () => {
      const result = getClusterByName([], 'bug');
      expect(result).toBeUndefined();
    });
  });
});
