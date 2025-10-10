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
    rateLimit: {
      limit: number;
      remaining: number;
      resetAt: string;
    };
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
    rateLimit {
      limit
      remaining
      resetAt
    }
  }
}
`;

export class GitHubAPI {
  private client: GraphQLClient;

  constructor(token?: string) {
    this.client = new GraphQLClient(GITHUB_GRAPHQL_ENDPOINT, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
  }

  async fetchAvailableIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    let allIssues: GitHubIssue[] = [];
    let hasNextPage = true;
    let cursor: string | null = null;

    try {
      while (hasNextPage) {
        const data = await this.client.request<IssuesResponse>(QUERY, {
          owner,
          repo,
          cursor
        });

        const { issues } = data.repository;

        // Filter out issues that have linked PRs
        const issuesWithoutPRs = issues.nodes.filter(issue => {
          const hasPR = issue.timelineItems.nodes.some(item => item.source?.number);
          return !hasPR;
        });

        allIssues = [...allIssues, ...issuesWithoutPRs];

        hasNextPage = issues.pageInfo.hasNextPage;
        cursor = issues.pageInfo.endCursor;

        // Limit to prevent excessive API calls (max 500 issues)
        if (allIssues.length >= 500) break;
      }

      return allIssues;
    } catch (error: any) {
      if (error.response?.errors) {
        const errorMsg = error.response.errors[0]?.message || 'GitHub API error';
        throw new Error(errorMsg);
      }
      throw new Error(`Failed to fetch issues: ${error.message}`);
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
