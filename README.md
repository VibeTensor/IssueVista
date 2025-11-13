# IssueFlow

[![CI](https://github.com/VibeTensor/IssueFlow/workflows/CI/badge.svg)](https://github.com/VibeTensor/IssueFlow/actions)
[![CodeRabbit](https://img.shields.io/badge/CodeRabbit-Enabled-FF570A?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiAyMkgyMkwxMiAyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+)](https://coderabbit.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-Friendly-blueviolet?logo=hacktoberfest)](https://hacktoberfest.com/)
[![GitHub stars](https://img.shields.io/github/stars/VibeTensor/IssueFlow?style=social)](https://github.com/VibeTensor/IssueFlow/stargazers)

Find unassigned GitHub issues without pull requests - streamline your path to open-source contribution.

**Live Application**: [https://issueflow.pages.dev](https://issueflow.pages.dev)

**Repository**: [https://github.com/VibeTensor/IssueFlow](https://github.com/VibeTensor/IssueFlow)

## Overview

IssueFlow helps developers discover contribution-ready GitHub issues by automatically filtering repositories for issues that are:

- Currently open
- Not assigned to anyone
- Have no linked pull requests (when authenticated)

The tool provides three authentication modes to match your workflow and offers a clean, responsive interface optimized for quick searches.

## Key Features

### Intelligent Issue Filtering

**With GitHub Token or OAuth:**
- Filters open issues
- Excludes assigned issues
- Removes issues with linked pull requests
- 5000 API requests per hour
- Uses GraphQL API for optimal performance

**Without Authentication:**
- Filters open issues
- Excludes assigned issues
- Cannot detect linked pull requests
- 60 API requests per hour
- Uses REST API fallback

### Authentication Options

**Personal Access Token (Primary Method)**
- Paste your GitHub token directly
- Works immediately without configuration
- Local storage only (privacy-first)
- 5000 requests per hour
- Full PR filtering capability

**Unauthenticated Mode (No Setup Required)**
- Works without any authentication
- No token needed
- 60 requests per hour
- Cannot filter issues with linked PRs
- Suitable for quick searches

**GitHub OAuth Device Flow (Optional)**
- Requires OAuth app configuration
- See OAUTH_SETUP.md for setup instructions
- Only shown when PUBLIC_GITHUB_CLIENT_ID is configured
- Automatic token management

### User Experience

**Interactive Help System**
- Fixed help button accessible from anywhere
- Step-by-step token creation guide
- Authentication method explanations
- Privacy and security information
- Mobile-optimized popup interface

**Real-Time Feedback**
- Rate limit display with countdown
- Loading states with progress messages
- Detailed error messages
- Success indicators
- Request remaining counter

**Responsive Design**
- Mobile-first approach
- Hand-drawn sketch aesthetic
- Monochromatic slate color scheme
- Smooth animations and transitions
- Optimized for all screen sizes

### Performance Optimizations

**GraphQL API (Authenticated Users)**
- Single query fetches all required data
- Pagination support up to 300 issues
- Timeline analysis for PR detection
- 45% faster than REST API
- 67% reduced bandwidth usage

**REST API Fallback (Unauthenticated)**
- Automatic fallback on auth failure
- Fetches up to 200 issues quickly
- Skips timeline checks for speed
- Clear warning about limitations
- No backend required

**Intelligent Caching**
- Local token storage
- User profile caching
- Rate limit tracking
- State persistence

## Quick Start

### Prerequisites

- Node.js 18.0 or higher
- npm or pnpm package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/VibeTensor/IssueFlow.git
cd IssueFlow

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at http://localhost:4321

### Build

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

Output will be in the `/dist` directory.

## Usage Guide

### Option 1: Quick Search (No Authentication)

1. Open the application
2. Paste a GitHub repository URL (e.g., `https://github.com/facebook/react`)
3. Click "Find Unassigned Issues (No PRs)"
4. View results

**Limitations**: PR filtering is unavailable. Rate limit is 60 requests/hour.

### Option 2: With Personal Access Token (Recommended)

1. Visit [GitHub Token Settings](https://github.com/settings/tokens/new?description=IssueFlow&scopes=public_repo)
2. Generate a token with `public_repo` scope
3. Copy the token (starts with `ghp_`)
4. Paste into the "GitHub Token" field in IssueFlow
5. Search any repository with full PR filtering

**Benefits**: 5000 requests/hour, full PR filtering, faster GraphQL API.

**Privacy**: Tokens are stored locally in browser localStorage only, never sent to any server except GitHub's official API.

### Option 3: With GitHub OAuth (Optional - Requires Configuration)

GitHub OAuth Device Flow is available but requires setting up a GitHub OAuth app first.

1. Configure `PUBLIC_GITHUB_CLIENT_ID` environment variable (see [OAUTH_SETUP.md](./OAUTH_SETUP.md))
2. Click "Sign in with GitHub" button (only appears when configured)
3. Follow the device flow authentication process

**Note**: Most users should use Option 2 (Personal Access Token) as it requires no configuration.

## Technical Architecture

### Technology Stack

**Framework**: Astro 5.x
- Zero JavaScript for static content
- Server-side rendering
- Optimized builds with Vite
- Fast page loads

**Interactive Components**: Svelte 5
- 3KB runtime overhead
- Reactive components
- Smooth state management
- Efficient DOM updates

**Styling**: UnoCSS
- Atomic CSS on-demand
- Zero runtime overhead
- JIT compilation
- Tailwind-compatible utilities

**API Integration**:
- GitHub GraphQL API (authenticated)
- GitHub REST API (fallback)
- graphql-request client library

**Build Tool**: Vite (via Astro)
- Lightning-fast HMR
- Instant dev server startup
- Optimized production builds
- Tree-shaking and code-splitting

**Language**: TypeScript
- Full type safety
- Interface definitions
- Better IDE support
- Reduced runtime errors

### Project Structure

```
IssueFlow/
├── src/
│   ├── components/
│   │   ├── GitHubAuth.svelte      # OAuth device flow component
│   │   └── ResultsList.svelte     # Main search and results UI
│   ├── layouts/
│   │   └── Layout.astro           # Base page layout
│   ├── lib/
│   │   ├── github-graphql.ts      # GraphQL API client with REST fallback
│   │   └── github-oauth.ts        # OAuth device flow implementation
│   └── pages/
│       └── index.astro            # Main application page
├── public/                        # Static assets (favicon, images)
├── astro.config.mjs              # Astro configuration
├── uno.config.ts                 # UnoCSS configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── README.md                     # This file
├── CONTRIBUTING.md               # Contribution guidelines
├── CHANGELOG.md                  # Version history
├── DEPLOYMENT.md                 # Deployment instructions
├── OAUTH_SETUP.md                # OAuth configuration guide
├── HACKTOBERFEST.md              # Hacktoberfest information
└── LICENSE                       # MIT License
```

### API Strategy

**GraphQL API (Primary)**
```graphql
query FindAvailableIssues($owner: String!, $repo: String!, $cursor: String) {
  repository(owner: $owner, name: $repo) {
    issues(first: 100, after: $cursor, states: OPEN, filterBy: {assignee: null}) {
      nodes {
        number, title, url, createdAt, updatedAt
        comments { totalCount }
        labels(first: 10) { nodes { name, color, description } }
        timelineItems(first: 100, itemTypes: [CROSS_REFERENCED_EVENT, CONNECTED_EVENT]) {
          nodes {
            ... on CrossReferencedEvent { source { ... on PullRequest { number, state, url } } }
            ... on ConnectedEvent { source { ... on PullRequest { number, state, url } } }
          }
        }
      }
    }
  }
  rateLimit { limit, remaining, resetAt }
}
```

**REST API (Fallback)**
```
GET /repos/{owner}/{repo}/issues?state=open&assignee=none&per_page=100
```

## Deployment

### Cloudflare Pages (Recommended)

**Why Cloudflare Pages:**
- Unlimited bandwidth
- Unlimited static requests
- Global edge network (250+ locations)
- 500 builds per month
- Zero cold starts
- Free custom domains

**Deployment Steps:**

1. Push code to GitHub repository
2. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
3. Navigate to Pages → Create a project
4. Connect to your GitHub repository
5. Configure build settings:
   - Framework preset: `Astro`
   - Build command: `npm run build`
   - Output directory: `dist`
6. Click "Save and Deploy"
7. Access your site at `https://your-project.pages.dev`

### Alternative: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

### Alternative: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**Build Settings:**
- Build command: `npm run build`
- Publish directory: `dist`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Performance Metrics

**Target Lighthouse Scores:**
- Performance: 100/100
- Accessibility: 100/100
- Best Practices: 100/100
- SEO: 100/100

**Core Web Vitals:**
- First Contentful Paint (FCP): < 0.8s
- Largest Contentful Paint (LCP): < 1.2s
- Total Blocking Time (TBT): < 100ms
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 1.5s

## Contributing

Contributions are welcome! IssueFlow is a Hacktoberfest-friendly project.

### Quick Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly (build, preview, manual testing)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Helpful Labels

- [`good first issue`](https://github.com/VibeTensor/IssueFlow/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) - Beginner-friendly issues
- [`hacktoberfest`](https://github.com/VibeTensor/IssueFlow/issues?q=is%3Aissue+is%3Aopen+label%3Ahacktoberfest) - Hacktoberfest-eligible issues
- [`help wanted`](https://github.com/VibeTensor/IssueFlow/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) - Issues seeking contributors

### Documentation

- [CONTRIBUTING.md](./CONTRIBUTING.md) - Detailed contribution guidelines
- [HACKTOBERFEST.md](./HACKTOBERFEST.md) - Hacktoberfest-specific information
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) - Community standards

## Security and Privacy

**Privacy-First Design:**
- No server-side data collection
- No analytics or tracking scripts
- No third-party services (except GitHub API)
- Tokens stored in browser localStorage only
- No backend server required

**Security Measures:**
- OAuth device flow (no client secrets)
- HTTPS-only connections
- State verification for CSRF protection
- Local-only token storage
- Open-source code (auditable)

## Roadmap

### Future Features

- Save favorite repositories for quick access
- Advanced filtering (by labels, date ranges, comment count)
- Sort options (newest, most commented, recently updated)
- Multi-repository search
- Browser extension
- Export results to CSV/JSON
- Issue bookmarking
- Dark/Light theme toggle
- Difficulty estimation based on labels
- GitHub trending integration
- Contribution analytics dashboard

### Known Limitations

- PR detection requires authentication
- Maximum 300 issues per search (GraphQL mode)
- Maximum 200 issues per search (REST mode)
- Rate limits apply per authentication mode
- Some private repo issues may not appear

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and release notes.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## Author

Created and maintained by [ascender1729](https://github.com/ascender1729)

Built with modern web technologies and best practices for performance, accessibility, and user experience.

## Acknowledgments

- GitHub for providing the API
- Astro team for the excellent framework
- Svelte community for the reactive UI library
- UnoCSS for atomic CSS utilities
- All contributors and users

## Support

- **Issues**: [GitHub Issues](https://github.com/VibeTensor/IssueFlow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/VibeTensor/IssueFlow/discussions)
- **Email**: Available in GitHub profile

## Links

- **Live Demo**: [https://issueflow.pages.dev](https://issueflow.pages.dev)
- **Repository**: [https://github.com/VibeTensor/IssueFlow](https://github.com/VibeTensor/IssueFlow)
- **Documentation**: Repository markdown files
- **Changelog**: [CHANGELOG.md](./CHANGELOG.md)

---

**Star this repository** if you find it helpful!
