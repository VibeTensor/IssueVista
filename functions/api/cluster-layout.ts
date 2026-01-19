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
const MAX_NODES_LIMIT = 200;
const MIN_SIZE = 200;
const MAX_SIZE = 2000;
const MAX_INPUT_ISSUES = 500;

// Allowed origins for CORS (restrict to prevent abuse)
const ALLOWED_ORIGINS = [
  'https://issueflow.vibetensor.com',
  'https://issueflow.pages.dev',
  'http://localhost:4321',
  'http://localhost:3000'
];

/**
 * Get CORS headers for the given request origin
 */
function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

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
  const corsHeaders = getCorsHeaders(context.request);

  // Parse JSON with explicit error handling
  let body: RequestBody;
  try {
    body = (await context.request.json()) as RequestBody;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }

  try {
    if (!body.issues || !Array.isArray(body.issues)) {
      return new Response(JSON.stringify({ error: 'Missing or invalid issues array' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    // Validate input array length to prevent abuse
    if (body.issues.length > MAX_INPUT_ISSUES) {
      return new Response(
        JSON.stringify({
          error: `Too many issues: ${body.issues.length}. Maximum allowed: ${MAX_INPUT_ISSUES}`
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            ...corsHeaders
          }
        }
      );
    }

    // Validate and clamp dimensions to prevent excessive processing
    const width = Number.isFinite(body.width)
      ? Math.min(Math.max(body.width!, MIN_SIZE), MAX_SIZE)
      : DEFAULT_WIDTH;
    const height = Number.isFinite(body.height)
      ? Math.min(Math.max(body.height!, MIN_SIZE), MAX_SIZE)
      : DEFAULT_HEIGHT;
    const maxNodes = Number.isFinite(body.maxNodes)
      ? Math.min(Math.max(body.maxNodes!, 1), MAX_NODES_LIMIT)
      : DEFAULT_MAX_NODES;

    const layout = computeClusterLayout(body.issues, width, height, maxNodes);

    return new Response(JSON.stringify(layout), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
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
          ...corsHeaders
        }
      }
    );
  }
};

/**
 * Handle CORS preflight requests
 */
export const onRequestOptions: PagesFunction = async (context) => {
  const corsHeaders = getCorsHeaders(context.request);
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400'
    }
  });
};
