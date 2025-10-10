# IssueFlow

[![CI](https://github.com/ascender1729/IssueFlow/workflows/CI/badge.svg)](https://github.com/ascender1729/IssueFlow/actions)
[![CodeRabbit](https://img.shields.io/badge/CodeRabbit-Enabled-FF570A?logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMiAyMkgyMkwxMiAyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+)](https://coderabbit.ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-Friendly-blueviolet?logo=hacktoberfest)](https://hacktoberfest.com/)
[![GitHub stars](https://img.shields.io/github/stars/ascender1729/IssueFlow?style=social)](https://github.com/ascender1729/IssueFlow/stargazers)

Find unassigned open GitHub issues without pull requests - your gateway to open-source contribution!

**Live Demo**: [https://issueflow.pages.dev](https://issueflow.pages.dev)

**Repository**: [https://github.com/ascender1729/IssueFlow](https://github.com/ascender1729/IssueFlow)

## Features

### Smart Filtering

Automatically filters issues that are:
- Open
- Unassigned
- No linked pull requests

### Multiple Authentication Options

- **GitHub OAuth** - Sign in with GitHub (Device Flow, no backend needed)
- **Personal Access Token** - Manual token input
- **No Auth** - Use without signing in (REST API fallback)

### Optimized Performance

Built with modern web technologies:
- Astro 5.x - Zero KB JavaScript for static content
- Svelte - 3KB runtime for interactive components
- UnoCSS - On-demand atomic CSS
- GitHub GraphQL API - 45% faster than REST

### Rate Limit Friendly

- 60 requests/hour without token (REST API)
- 5000 requests/hour with GitHub OAuth or token (GraphQL API)
- Token stored locally only (privacy-first)

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:4321

### Build for Production

```bash
npm run build
```

Output in `/dist` folder.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Option 1: With GitHub OAuth (Recommended)

1. Click "Sign in with GitHub"
2. Copy the code shown
3. Authorize the app on GitHub
4. Paste a repository URL and start searching

**Setup**: See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for OAuth configuration instructions.

### Option 2: With Personal Access Token

1. Create a [GitHub token](https://github.com/settings/tokens/new?description=IssueFlow&scopes=public_repo) (select `public_repo` scope)
2. Paste the token in the app
3. Paste a repository URL and start searching

### Option 3: Without Authentication

1. Paste a repository URL and click "Find Available Issues"
2. Works immediately with 60 requests/hour limit

**Privacy Note**: All authentication is handled locally in your browser. Tokens are never sent to any server except GitHub's API.

## Deployment

### Cloudflare Pages (Recommended)

1. Push code to GitHub
2. Login to Cloudflare Dashboard
3. Pages → Create a project → Connect to Git
4. Build settings:
   - Framework: Astro
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy!

### Alternative: Vercel

```bash
npm install -g vercel
vercel
```

### Alternative: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## Tech Stack

- **Framework**: Astro 5.x
- **Interactive Components**: Svelte
- **Styling**: UnoCSS
- **API Client**: graphql-request
- **Build Tool**: Vite (via Astro)
- **Language**: TypeScript

## Performance

- Lighthouse Score: 100/100 (target)
- First Contentful Paint: < 0.8s
- Largest Contentful Paint: < 1.2s
- Total Blocking Time: < 100ms

## Contributing

Contributions are welcome! This project participates in **Hacktoberfest**.

### Hacktoberfest

IssueFlow is a Hacktoberfest-friendly project! We welcome contributions during Hacktoberfest and year-round.

- See [HACKTOBERFEST.md](./HACKTOBERFEST.md) for Hacktoberfest-specific guidelines
- Check issues labeled [`hacktoberfest`](https://github.com/ascender1729/IssueFlow/issues?q=is%3Aissue+is%3Aopen+label%3Ahacktoberfest)
- Look for [`good first issue`](https://github.com/ascender1729/IssueFlow/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) for beginner-friendly tasks

### How to Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## License

MIT

## Author

Created and maintained by [ascender1729](https://github.com/ascender1729)

Built with modern web technologies and best practices.
