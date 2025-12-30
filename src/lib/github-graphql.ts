import { GraphQLClient } from 'graphql-request';
import type { ProgressCallback, ProgressState } from './loading-progress-utils';
import {
  GRAPHQL_MAX_PAGES,
  REST_MAX_PAGES,
  createInitialState,
  toAuthenticatingState,
  toFetchingState,
  toProcessingState,
  toCompleteState
} from './loading-progress-utils';

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

export interface GitHubIssue {
  number: number;
  title: string;
  url: string;
  body: string;
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
  /** Reaction data for relevance scoring (Issue #122) */
  reactionGroups?: Array<{
    content: string;
    reactors: {
      totalCount: number;
    };
  }>;
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

/**
 * Response type for single-page fetch (Issue #131 - Infinite Scroll)
 * Used by fetchIssuesPage for incremental loading
 */
export interface PagedIssuesResponse {
  issues: GitHubIssue[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string | null;
  };
  rateLimit: {
    remaining: number;
    resetAt: string;
  };
  /**
   * Total count of issues. Note: For REST API, this is only the current page count
   * and may not reflect the actual total.
   */
  totalCount: number;
  /** Whether totalCount is accurate (true for GraphQL, false for REST fallback) */
  totalCountAccurate: boolean;
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
        body
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
        reactionGroups {
          content
          reactors {
            totalCount
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

  async fetchAvailableIssues(
    owner: string,
    repo: string,
    onProgress?: ProgressCallback,
    signal?: AbortSignal
  ): Promise<{ issues: GitHubIssue[]; rateLimit: { remaining: number; resetAt: string } }> {
    // If no token, use REST API fallback
    if (!this.token) {
      console.log('[OK] No token provided, using REST API (60 requests/hour)');
      const issues = await this.fetchIssuesViaREST(owner, repo, onProgress, signal);
      return { issues, rateLimit: { remaining: 60, resetAt: new Date().toISOString() } };
    }

    console.log('[AUTH] Token provided, attempting GraphQL API (5000 requests/hour)');

    let allIssues: GitHubIssue[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;
    let lastRateLimit = { remaining: 0, resetAt: new Date().toISOString() };

    // Initialize progress state
    const maxPages = GRAPHQL_MAX_PAGES;
    let progressState = createInitialState({
      maxPages,
      isAuthenticated: true
    });

    // Report authenticating phase
    onProgress?.(toAuthenticatingState(progressState));

    try {
      // Limit to 3 pages (300 issues) for faster loading
      let pageCount = 0;

      while (hasNextPage && pageCount < maxPages) {
        // Check if cancelled
        if (signal?.aborted) {
          console.log('[CANCELLED] Fetch aborted by user');
          break;
        }

        // Report fetching progress BEFORE fetch
        progressState = toFetchingState(progressState, pageCount + 1, allIssues.length);
        onProgress?.(progressState);

        const data: IssuesResponse = await this.client.request<IssuesResponse>({
          document: QUERY,
          variables: { owner, repo, cursor },
          signal
        });

        const issues = data.repository.issues;

        // Store rate limit from response
        lastRateLimit = data.rateLimit;

        // Filter out issues that have linked PRs
        const issuesWithoutPRs = issues.nodes.filter((issue) => {
          const hasPR = issue.timelineItems.nodes.some((item) => item.source?.number);
          return !hasPR;
        });

        allIssues = [...allIssues, ...issuesWithoutPRs];

        hasNextPage = issues.pageInfo.hasNextPage;
        cursor = issues.pageInfo.endCursor;
        pageCount++;

        console.log(
          `[PAGE] Fetched page ${pageCount}/${maxPages}, found ${issuesWithoutPRs.length} issues (${allIssues.length} total)`
        );
      }

      // Report processing phase
      progressState = toProcessingState(progressState, allIssues.length);
      onProgress?.(progressState);

      console.log(`[OK] GraphQL: Found ${allIssues.length} unassigned issues without PRs`);
      console.log(`[RATE] Rate limit: ${lastRateLimit.remaining} requests remaining`);

      // Report complete
      progressState = toCompleteState(progressState, allIssues.length);
      onProgress?.(progressState);

      return { issues: allIssues, rateLimit: lastRateLimit };
    } catch (error: any) {
      // Check if aborted
      if (error.name === 'AbortError' || signal?.aborted) {
        console.log('[CANCELLED] Fetch was aborted');
        // Return partial results (per user preference)
        return { issues: allIssues, rateLimit: lastRateLimit };
      }
      // Handle authentication errors - try REST API fallback
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('[WARN] GraphQL authentication failed (403), falling back to REST API...');
        const issues = await this.fetchIssuesViaREST(owner, repo, onProgress, signal);
        return { issues, rateLimit: { remaining: 60, resetAt: new Date().toISOString() } };
      }

      if (error.response?.errors) {
        const errorMsg = error.response.errors[0]?.message || 'GitHub API error';
        throw new Error(errorMsg);
      }

      throw new Error(`Failed to fetch issues: ${error.message}`);
    }
  }

  /**
   * Fetch a single page of issues (Issue #131 - Infinite Scroll)
   * Returns issues with pagination info for incremental loading
   *
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param cursor - Cursor for pagination (null for first page)
   * @param signal - AbortSignal for cancellation
   * @returns Single page of issues with pagination info
   */
  async fetchIssuesPage(
    owner: string,
    repo: string,
    cursor?: string | null,
    signal?: AbortSignal
  ): Promise<PagedIssuesResponse> {
    // If no token, use REST API fallback
    if (!this.token) {
      console.log('[OK] No token provided, using REST API for page fetch');
      return this.fetchIssuesPageViaREST(owner, repo, cursor, signal);
    }

    console.log(
      `[PAGE] Fetching issues page${cursor ? ' (cursor: ' + cursor.substring(0, 10) + '...)' : ' (first page)'}`
    );

    try {
      // Check if cancelled before fetch
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const data: IssuesResponse = await this.client.request<IssuesResponse>({
        document: QUERY,
        variables: { owner, repo, cursor: cursor || null },
        signal
      });

      const issues = data.repository.issues;

      // Filter out issues that have linked PRs
      const issuesWithoutPRs = issues.nodes.filter((issue) => {
        const hasPR = issue.timelineItems.nodes.some((item) => item.source?.number);
        return !hasPR;
      });

      console.log(
        `[PAGE] Fetched ${issuesWithoutPRs.length} issues (${issues.totalCount} total in repo), hasNextPage: ${issues.pageInfo.hasNextPage}`
      );

      return {
        issues: issuesWithoutPRs,
        pageInfo: {
          hasNextPage: issues.pageInfo.hasNextPage,
          endCursor: issues.pageInfo.endCursor
        },
        rateLimit: {
          remaining: data.rateLimit.remaining,
          resetAt: data.rateLimit.resetAt
        },
        totalCount: issues.totalCount,
        totalCountAccurate: true
      };
    } catch (error: any) {
      // Check if aborted
      if (error.name === 'AbortError' || signal?.aborted) {
        console.log('[CANCELLED] Page fetch was aborted');
        throw error; // Re-throw abort errors
      }

      // Handle authentication errors - try REST API fallback
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('[WARN] GraphQL authentication failed, falling back to REST API...');
        return this.fetchIssuesPageViaREST(owner, repo, cursor, signal);
      }

      if (error.response?.errors) {
        const errorMsg = error.response.errors[0]?.message || 'GitHub API error';
        throw new Error(errorMsg);
      }

      throw new Error(`Failed to fetch issues page: ${error.message}`);
    }
  }

  /**
   * Fetch a single page of issues via REST API (Issue #131 - Infinite Scroll)
   * Fallback for unauthenticated access
   */
  private async fetchIssuesPageViaREST(
    owner: string,
    repo: string,
    cursor?: string | null,
    signal?: AbortSignal
  ): Promise<PagedIssuesResponse> {
    // For REST API, cursor is the page number encoded as string
    // First page: cursor is null/undefined, subsequent: cursor is page number
    let page = 1;
    if (cursor) {
      const parsed = parseInt(cursor, 10);
      // Validate it's a valid page number (REST cursors are numeric strings)
      // GraphQL cursors are base64 and would parse to NaN
      page = Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
    }
    const perPage = 100;

    console.log(`[REST] Fetching page ${page} from ${owner}/${repo}`);

    try {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=${perPage}&page=${page}&assignee=none`,
        {
          signal,
          headers: this.token ? { Authorization: `Bearer ${this.token}` } : {}
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Repository not found. Please check the URL.');
        }
        if (response.status === 403) {
          const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
          if (rateLimitRemaining === '0') {
            throw new Error('GitHub API rate limit exceeded. Sign in for 5000 requests/hour.');
          }
          throw new Error('GitHub API access denied (403).');
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const rawIssues = await response.json();

      // Filter out pull requests (they come as issues in REST API)
      const actualIssues = rawIssues.filter((issue: any) => !issue.pull_request);

      // Convert REST format to GitHubIssue format
      const issues: GitHubIssue[] = actualIssues.map((issue: any) => ({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        body: issue.body || '',
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
      }));

      // REST API doesn't give us total count easily, estimate based on results
      const hasNextPage = rawIssues.length === perPage;
      const nextCursor = hasNextPage ? String(page + 1) : null;

      console.log(`[REST] Fetched ${issues.length} issues, hasNextPage: ${hasNextPage}`);

      return {
        issues,
        pageInfo: {
          hasNextPage,
          endCursor: nextCursor
        },
        rateLimit: {
          remaining: parseInt(response.headers.get('x-ratelimit-remaining') || '60', 10),
          resetAt: new Date().toISOString()
        },
        totalCount: issues.length, // REST doesn't provide total easily
        totalCountAccurate: false
      };
    } catch (error: any) {
      if (error.name === 'AbortError' || signal?.aborted) {
        throw error;
      }
      throw new Error(`Failed to fetch issues page via REST: ${error.message}`);
    }
  }

  // REST API fallback for unauthenticated access (optimized - no timeline checks)
  private async fetchIssuesViaREST(
    owner: string,
    repo: string,
    onProgress?: ProgressCallback,
    signal?: AbortSignal
  ): Promise<GitHubIssue[]> {
    console.log(
      `[REST] Fetching issues from ${owner}/${repo} via REST API (Fast mode - skipping PR checks)...`
    );
    const allIssues: GitHubIssue[] = [];
    let page = 1;
    const perPage = 100;
    const maxPages = REST_MAX_PAGES;

    // Initialize progress state for REST API
    let progressState = createInitialState({
      maxPages,
      isAuthenticated: !!this.token
    });

    try {
      // Only fetch first 2 pages (200 issues) for speed
      while (page <= maxPages) {
        // Check if cancelled
        if (signal?.aborted) {
          console.log('[CANCELLED] REST fetch aborted by user');
          break;
        }

        // Report progress
        progressState = toFetchingState(progressState, page, allIssues.length);
        onProgress?.(progressState);

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=${perPage}&page=${page}&assignee=none`,
          {
            signal,
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
            throw new Error(
              'GitHub API access denied (403). Please try authenticating with GitHub or using a personal access token.'
            );
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
            body: issue.body || '',
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

      // Report processing phase
      progressState = toProcessingState(progressState, allIssues.length);
      onProgress?.(progressState);

      console.log(
        `[OK] REST API: Found ${allIssues.length} unassigned issues (Note: PR filtering only available with token)`
      );

      // Report complete
      progressState = toCompleteState(progressState, allIssues.length);
      onProgress?.(progressState);

      return allIssues;
    } catch (error: any) {
      // Check if aborted
      if (error.name === 'AbortError' || signal?.aborted) {
        console.log('[CANCELLED] REST fetch was aborted');
        // Return partial results (per user preference)
        return allIssues;
      }
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
  const trimmed = url.trim();

  // First try full GitHub URL format: github.com/owner/repo
  const urlRegex = /github\.com\/([^/]+)\/([^/]+)/;
  const urlMatch = trimmed.match(urlRegex);

  if (urlMatch) {
    return {
      owner: urlMatch[1],
      repo: urlMatch[2].replace(/\.git$/, '')
    };
  }

  // Then try shorthand format: owner/repo (e.g., facebook/react)
  // Must have exactly one slash, no spaces, and valid characters
  const shorthandRegex = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)\/([a-zA-Z0-9._-]+)$/;
  const shorthandMatch = trimmed.match(shorthandRegex);

  if (shorthandMatch) {
    return {
      owner: shorthandMatch[1],
      repo: shorthandMatch[2].replace(/\.git$/, '')
    };
  }

  return null;
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
    message: 'Enter owner/repo (e.g., facebook/react) or full GitHub URL'
  };
}
