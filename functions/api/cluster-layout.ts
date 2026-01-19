/**
 * Cloudflare Pages Function: Cluster Layout API
 * Issue #154 - Server-side cluster layout computation for low-end devices
 *
 * Endpoint: POST /api/cluster-layout
 * Free tier: 100,000 requests/day
 */

// Cloudflare Pages Function types (inline to avoid type conflicts)
interface EventContext {
  request: Request;
  env: Record<string, unknown>;
  params: Record<string, string>;
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

type PagesFunction = (context: EventContext) => Promise<Response> | Response;

interface GitHubIssueMinimal {
  number: number;
  title: string;
  url: string;
  labels?: {
    nodes?: Array<{
      name: string;
      color: string;
    }>;
  };
  comments?: {
    totalCount: number;
  };
}

interface ClusterNode {
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

interface Cluster {
  name: string;
  color: string;
  count: number;
  x: number;
  y: number;
}

interface ClusterLayoutResponse {
  clusters: Cluster[];
  nodes: ClusterNode[];
  meta: {
    totalIssues: number;
    processedIssues: number;
    computeTimeMs: number;
  };
}

interface RequestBody {
  issues: GitHubIssueMinimal[];
  width?: number;
  height?: number;
  maxNodes?: number;
}

const UNCATEGORIZED_COLOR = '6b7280';
const UNCATEGORIZED_NAME = 'uncategorized';
const DEFAULT_WIDTH = 800;
const DEFAULT_HEIGHT = 600;
const DEFAULT_MAX_NODES = 30;

/**
 * Get primary label from issue
 */
function getPrimaryLabel(issue: GitHubIssueMinimal): { name: string; color: string } | null {
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
 * Calculate node radius based on comment count
 */
function getNodeRadius(commentCount: number): number {
  const baseRadius = 6;
  return baseRadius + Math.min(commentCount, 5) * 0.4;
}

/**
 * Compute cluster layout server-side
 */
function computeClusterLayout(
  issues: GitHubIssueMinimal[],
  width: number,
  height: number,
  maxNodes: number
): ClusterLayoutResponse {
  const startTime = Date.now();

  // Limit issues for performance
  const limitedIssues = issues.slice(0, maxNodes);

  // Group issues by primary label
  const clusterMap: Record<string, { color: string; count: number; issues: GitHubIssueMinimal[] }> =
    {};

  for (const issue of limitedIssues) {
    const primaryLabel = getPrimaryLabel(issue);
    const clusterName = primaryLabel?.name || UNCATEGORIZED_NAME;
    const clusterColor = primaryLabel?.color || UNCATEGORIZED_COLOR;

    if (!clusterMap[clusterName]) {
      clusterMap[clusterName] = { color: clusterColor, count: 0, issues: [] };
    }
    clusterMap[clusterName].count++;
    clusterMap[clusterName].issues.push(issue);
  }

  // Sort clusters by count and calculate positions
  const clusterEntries = Object.entries(clusterMap).sort((a, b) => b[1].count - a[1].count);

  const centerX = width / 2;
  const centerY = height / 2;
  const clusterRadius = Math.min(width, height) * 0.3;

  const clusters: Cluster[] = clusterEntries.map(([name, data], index) => {
    const angle = (2 * Math.PI * index) / clusterEntries.length - Math.PI / 2;
    return {
      name,
      color: data.color,
      count: data.count,
      x: centerX + clusterRadius * Math.cos(angle),
      y: centerY + clusterRadius * Math.sin(angle)
    };
  });

  // Create cluster position lookup
  const clusterPositions: Record<string, { x: number; y: number }> = {};
  for (const cluster of clusters) {
    clusterPositions[cluster.name] = { x: cluster.x, y: cluster.y };
  }

  // Position nodes in circle pattern around their cluster center
  const nodes: ClusterNode[] = [];

  for (const [clusterName, data] of clusterEntries) {
    const center = clusterPositions[clusterName];
    const nodeCount = data.issues.length;
    const nodeRadius = 20 + nodeCount * 4;

    data.issues.forEach((issue, i) => {
      const commentCount = issue.comments?.totalCount ?? 0;
      let x: number, y: number;

      if (nodeCount === 1) {
        x = center.x;
        y = center.y;
      } else {
        const angle = (i / nodeCount) * 2 * Math.PI;
        x = center.x + nodeRadius * Math.cos(angle);
        y = center.y + nodeRadius * Math.sin(angle);
      }

      nodes.push({
        id: String(issue.number),
        cluster: clusterName,
        color: data.color,
        x,
        y,
        radius: getNodeRadius(commentCount),
        issue: {
          number: issue.number,
          title: issue.title,
          url: issue.url,
          commentCount
        }
      });
    });
  }

  return {
    clusters,
    nodes,
    meta: {
      totalIssues: issues.length,
      processedIssues: limitedIssues.length,
      computeTimeMs: Date.now() - startTime
    }
  };
}

/**
 * Cloudflare Pages Function handler
 */
export const onRequestPost: PagesFunction = async (context) => {
  try {
    const body = (await context.request.json()) as RequestBody;

    if (!body.issues || !Array.isArray(body.issues)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid issues array' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const width = body.width ?? DEFAULT_WIDTH;
    const height = body.height ?? DEFAULT_HEIGHT;
    const maxNodes = body.maxNodes ?? DEFAULT_MAX_NODES;

    const layout = computeClusterLayout(body.issues, width, height, maxNodes);

    return new Response(JSON.stringify(layout), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60' // Cache for 1 minute
      }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to compute layout', details: String(error) }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
};

/**
 * Handle CORS preflight requests
 */
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
};
