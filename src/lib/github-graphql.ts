import { GraphQLClient } from 'graphql-request';

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

export interface GitHubIssue {
  number: number;
  title: string;
  url: string;
  createdAt: string;
  updatedAt: string;
  comments: { totalCount: number };
  labels: {
    nodes: Array<{
      name: string;
      color: string;
      description: string | null;
    }>;
  };
  timelineItems: {
    nodes: Array<{
      source?: {
        number?: number;
        state?: string;
        url?: string;
      };
    }>;
  };
}

export interface IssuesResponse {
  repository: {
    issues: {
      pageInfo: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
      totalCount: number;
      nodes: GitHubIssue[];
    };
  };
  rateLimit: {
    limit: number;
    remaining: number;
    resetAt: string;
  };
}

const QUERY = `
query FindAvailableIssues($owner: String!, $repo: String!, $cursor: String) {
  repository(owner: $owner, name: $repo) {
    issues(
      first: 100
      after: $cursor
      states: OPEN
      filterBy: {assignee: null}
      orderBy: {field: CREATED_AT, direction: DESC}
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
      nodes {
        number
        title
        url
        createdAt
        updatedAt
        comments { totalCount }
        labels(first: 10) {
          nodes {
            name
            color
            description
          }
        }
        timelineItems(first: 100, itemTypes: [CROSS_REFERENCED_EVENT, CONNECTED_EVENT]) {
          nodes {
            ... on CrossReferencedEvent {
              source {
                ... on PullRequest {
                  number
                  state
                  url
                }
              }
            }
            ... on ConnectedEvent {
              source {
                ... on PullRequest {
                  number
                  state
                  url
                }
              }
            }
          }
        }
      }
    }
  }
  rateLimit {
    limit
    remaining
    resetAt
  }
}
`;

export class GitHubAPI {
  private client: GraphQLClient;
  private token?: string;

  constructor(token?: string) {
    this.token = token;
    this.client = new GraphQLClient(GITHUB_GRAPHQL_ENDPOINT, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }

  async fetchAvailableIssues(owner: string, repo: string): Promise<{ issues: GitHubIssue[]; rateLimit: { remaining: number; resetAt: string } }> {
    // If no token, use REST API fallback
    if (!this.token) {
      console.log('[OK] No token provided, using REST API (60 requests/hour)');
      const issues = await this.fetchIssuesViaREST(owner, repo);
      return { issues, rateLimit: { remaining: 60, resetAt: new Date().toISOString() } };
    }

    console.log('[AUTH] Token provided, attempting GraphQL API (5000 requests/hour)');

    let allIssues: GitHubIssue[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;
    let lastRateLimit = { remaining: 0, resetAt: '' };

    try {
      // Limit to 3 pages (300 issues) for faster loading
      let pageCount = 0;
      const maxPages = 3;

      while (hasNextPage && pageCount < maxPages) {
        const data = await this.client.request<IssuesResponse>(QUERY, {
          owner,
          repo,
          cursor
        });

        const { issues } = data.repository;

        // Store rate limit from response
        lastRateLimit = data.rateLimit;

        // Filter out issues that have linked PRs
        const issuesWithoutPRs = issues.nodes.filter(issue => {
          const hasPR = issue.timelineItems.nodes.some(item => item.source?.number);
          return !hasPR;
        });

        allIssues = [...allIssues, ...issuesWithoutPRs];

        hasNextPage = issues.pageInfo.hasNextPage;
        cursor = issues.pageInfo.endCursor;
        pageCount++;

        console.log(`[PAGE] Fetched page ${pageCount}/${maxPages}, found ${issuesWithoutPRs.length} issues (${allIssues.length} total)`);
      }

      console.log(`[OK] GraphQL: Found ${allIssues.length} unassigned issues without PRs`);
      console.log(`[RATE] Rate limit: ${lastRateLimit.remaining} requests remaining`);
      return { issues: allIssues, rateLimit: lastRateLimit };
    } catch (error: any) {
      // Handle authentication errors - try REST API fallback
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('[WARN] GraphQL authentication failed (403), falling back to REST API...');
        const issues = await this.fetchIssuesViaREST(owner, repo);
        return { issues, rateLimit: { remaining: 60, resetAt: new Date().toISOString() } };
      }

      if (error.response?.errors) {
        const errorMsg = error.response.errors[0]?.message || 'GitHub API error';
        throw new Error(errorMsg);
      }

      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  }

  // REST API fallback for unauthenticated access (optimized - no timeline checks)
  private async fetchIssuesViaREST(owner: string, repo: string): Promise<GitHubIssue[]> {
    console.log(`[REST] Fetching issues from ${owner}/${repo} via REST API (Fast mode - skipping PR checks)...`);
    const allIssues: GitHubIssue[] = [];
    let page = 1;
    const perPage = 100;

    try {
      // Only fetch first 2 pages (200 issues) for speed
      while (page <= 2) {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=${perPage}&page=${page}&assignee=none`,
          {
            headers: this.token ? { Authorization: `Bearer ${this.token}` } : {}
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Repository not found. Please check the URL.');
          }
          if (response.status === 403) {
            const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
            const rateLimitReset = response.headers.get('x-ratelimit-reset');

            if (rateLimitRemaining === '0') {
              const resetTime = rateLimitReset
                ? new Date(parseInt(rateLimitReset) * 1000).toLocaleTimeString()
                : 'soon';
              throw new Error(
                `GitHub API rate limit exceeded. ` +
                `Without authentication, you have 60 requests per hour. ` +
                `Rate limit resets at ${resetTime}. ` +
                `Sign in with GitHub or add a personal access token for 5000 requests/hour.`
              );
            }
            throw new Error('GitHub API access denied (403). Please try authenticating with GitHub or using a personal access token.');
          }
          throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }

        const issues = await response.json();

        if (issues.length === 0) break;

        // Filter out pull requests (they come as issues in REST API)
        const actualIssues = issues.filter((issue: any) => !issue.pull_request);

        // Convert REST format - Skip slow timeline checks for speed
        for (const issue of actualIssues) {
          allIssues.push({
            number: issue.number,
            title: issue.title,
            url: issue.html_url,
            createdAt: issue.created_at,
            updatedAt: issue.updated_at,
            comments: { totalCount: issue.comments },
            labels: {
              nodes: issue.labels.map((label: any) => ({
                name: label.name,
                color: label.color,
                description: label.description
              }))
            },
            timelineItems: { nodes: [] }
          });
        }

        if (issues.length < perPage) break;
        page++;
      }

      console.log(`[OK] REST API: Found ${allIssues.length} unassigned issues (Note: PR filtering only available with token)`);
      return allIssues;
    } catch (error: any) {
      throw new Error(`Failed to fetch issues via REST API: ${error.message}`);
    }
  }

  async getRateLimit(token?: string): Promise<{ remaining: number; resetAt: string }> {
    const client = new GraphQLClient(GITHUB_GRAPHQL_ENDPOINT, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    try {
      const data = await client.request<{ rateLimit: { remaining: number; resetAt: string } }>(`
        query {
          rateLimit {
            remaining
            resetAt
          }
        }
      `);
      return data.rateLimit;
    } catch {
      return { remaining: 0, resetAt: new Date().toISOString() };
    }
  }
}

export function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  const regex = /github\.com\/([^\/]+)\/([^\/]+)/;
  const match = url.match(regex);

  if (!match) return null;

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, '')
  };
}

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  state: 'idle' | 'valid' | 'invalid';
  owner?: string;
  repo?: string;
  message?: string;
}

// Real-time URL validation function
export function validateRepoUrl(url: string): ValidationResult {
  // Empty or whitespace only - idle state
  if (!url || url.trim() === '') {
    return {
      isValid: false,
      state: 'idle',
      message: undefined
    };
  }

  const trimmedUrl = url.trim();

  // Use existing parseRepoUrl
  const parsed = parseRepoUrl(trimmedUrl);

  if (parsed) {
    return {
      isValid: true,
      state: 'valid',
      owner: parsed.owner,
      repo: parsed.repo,
      message: `Valid: ${parsed.owner}/${parsed.repo}`
    };
  }

  // Invalid URL
  return {
    isValid: false,
    state: 'invalid',
    message: 'Enter a valid GitHub URL (e.g., https://github.com/owner/repo)'
  };
}
