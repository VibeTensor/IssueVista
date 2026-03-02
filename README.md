<p align="center">
  <img src="public/favicon.svg" alt="IssueVista Logo" width="120" height="120">
</p>

<h1 align="center">IssueVista</h1>

<p align="center">
  <strong>Find unassigned GitHub issues without pull requests</strong><br>
  Streamline your path to open source contribution
</p>

<p align="center">
  <a href="https://github.com/VibeTensor/IssueVista/actions"><img src="https://github.com/VibeTensor/IssueVista/workflows/CI/badge.svg" alt="CI"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://hacktoberfest.com/"><img src="https://img.shields.io/badge/Hacktoberfest-Friendly-blueviolet?logo=hacktoberfest" alt="Hacktoberfest"></a>
  <img src="https://img.shields.io/badge/version-1.2.0-blue" alt="Version 1.2.0">
</p>

<p align="center">
  <a href="https://issuevista.vibetensor.com">Live App</a> |
  <a href="https://github.com/VibeTensor/IssueVista/issues">Report Bug</a> |
  <a href="https://github.com/VibeTensor/IssueVista/issues">Request Feature</a>
</p>

---

## What is IssueVista?

IssueVista helps developers discover contribution-ready GitHub issues by filtering for:

- Open issues with no assignee
- Issues without linked pull requests (with token)
- Easy-to-start issues with zero comments

## Quick Start

```bash
git clone https://github.com/VibeTensor/IssueVista.git
cd IssueVista
npm install
npm run dev
```

Open http://localhost:4321

## Usage

### Without Token (Quick Search)

1. Paste any GitHub repo URL
2. Click "Find Issues"
3. Browse unassigned issues

**Rate limit**: 60 requests/hour

### With GitHub Token (Recommended)

1. [Generate a token](https://github.com/settings/tokens/new?description=IssueVista&scopes=public_repo) with `public_repo` scope
2. Paste token in the app
3. Get full PR filtering + 5000 requests/hour

> Tokens are stored locally in your browser only, never sent to any server except GitHub's API.

## Features

| Feature | Without Token | With Token |
|---------|:---:|:---:|
| Open issues | Yes | Yes |
| Unassigned filter | Yes | Yes |
| PR detection | No | Yes |
| Rate limit | 60/hr | 5000/hr |
| API | REST | GraphQL |

### Search and Filtering

- Advanced filter syntax with autocomplete
- Language-based filtering with tag chips
- Difficulty scoring and complexity meter for each issue
- Sort by comments, date, or relevance
- Search history with quick access to previous queries

### Issue Display

- Zero-comment highlighting for untouched issues
- Relative time display with freshness indicators ("Today", "3 days ago")
- Difficulty badges (beginner, intermediate, advanced)
- Repo stats panel with repository metadata
- Context menu with quick actions

### Export and Sharing

- Export to Markdown, CSV, or plain text
- One-click copy of issue URLs
- Bookmarks for saving interesting issues

### UI and Theming

- Multiple theme presets with live preview
- Light and dark mode support
- Animated landing page with interactive elements
- Mobile-responsive design
- Scroll to top, loading progress indicators

## Tech Stack

- **Framework**: [Astro](https://astro.build) 5.x
- **UI Components**: [Svelte](https://svelte.dev) 5 (app) + [React](https://react.dev) 19 (landing page)
- **Styling**: [UnoCSS](https://unocss.dev)
- **Animations**: [Framer Motion](https://motion.dev)
- **API**: GitHub GraphQL + REST fallback
- **Language**: TypeScript (strict mode)
- **Testing**: Vitest + Playwright
- **Hosting**: Cloudflare Pages

## Project Structure

```text
IssueVista/
├── public/                    # Static assets (favicon, images)
├── src/
│   ├── components/
│   │   ├── landing/           # Landing page (React): Hero, Features, CTA, etc.
│   │   │   └── ui/            # Animated UI primitives (aurora, orbiting circles)
│   │   ├── results/           # Issue display (Svelte): ResultsContainer, IssueCard, etc.
│   │   └── shared/            # Reusable components (Svelte): Header, Footer, ThemeSelector
│   ├── layouts/
│   │   ├── Layout.astro       # Main application layout
│   │   └── LandingLayout.astro # Landing page layout
│   ├── lib/                   # Utilities: GitHub API, filters, themes, search history
│   │   └── types/             # TypeScript type definitions
│   └── pages/
│       ├── index.astro        # Landing page
│       └── app.astro          # Application page
├── tests/                     # Unit tests (Vitest)
│   └── e2e/                   # E2E tests (Playwright)
├── eslint.config.js           # ESLint flat config
├── uno.config.ts              # UnoCSS configuration
└── tsconfig.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run format:check` | Check Prettier formatting |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run E2E tests |

## Contributing

Contributions welcome! This is a Hacktoberfest-friendly project.

1. Fork the repository
2. Create your branch (`git checkout -b feature/awesome`)
3. Commit changes (`git commit -m 'Add awesome feature'`)
4. Push to branch (`git push origin feature/awesome`)
5. Open a Pull Request

PRs get automatic preview deployments via Cloudflare Pages. Once merged to master, changes are automatically deployed to production.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

### Good First Issues

- [`good first issue`](https://github.com/VibeTensor/IssueVista/labels/good%20first%20issue)
- [`hacktoberfest`](https://github.com/VibeTensor/IssueVista/labels/hacktoberfest)
- [`help wanted`](https://github.com/VibeTensor/IssueVista/labels/help%20wanted)

## Privacy

- No analytics or tracking
- No server-side data collection
- Tokens stored in browser localStorage only
- Open source and auditable

## License

[MIT](./LICENSE)

## About

**IssueVista** is an open source project by [VibeTensor Private Limited](https://github.com/VibeTensor).

---

If you find this helpful, please star the repo!
