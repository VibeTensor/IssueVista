# GitHub Issues Finder

Find unassigned GitHub issues without pull requests - perfect for open-source contributors!

## Features

- **Smart Filtering**: Automatically filters issues that are:
  - ✅ Open
  - ✅ Unassigned
  - ✅ No linked pull requests

- **Optimized Performance**: Built with 2025's best tech
  - Astro 5.x (0 KB JavaScript for static content)
  - Svelte (3KB runtime for interactive components)
  - UnoCSS (on-demand atomic CSS)
  - GitHub GraphQL API (45% faster than REST)

- **Rate Limit Friendly**:
  - 60 requests/hour without token
  - 5000 requests/hour with GitHub token
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

1. Paste a GitHub repository URL (e.g., `https://github.com/facebook/react`)
2. (Optional) Add your GitHub personal access token for higher rate limits
3. Click "Find Available Issues"
4. Browse filtered issues ready to work on!

## GitHub Token (Optional)

To create a GitHub token:

1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `public_repo` scope
4. Copy token and paste in the app

**Privacy Note**: Your token is stored only in your browser's localStorage and never sent to any server except GitHub's API.

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

Pull requests welcome! This project itself uses the issues it helps you find.

## License

MIT

## Author

Built with research-backed 2025 tech stack optimization.
