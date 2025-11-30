<p align="center">
  <img src="public/favicon.svg" alt="IssueFlow Logo" width="120" height="120">
</p>

<h1 align="center">IssueFlow</h1>

<p align="center">
  <strong>Find unassigned GitHub issues without pull requests</strong><br>
  Streamline your path to open source contribution
</p>

<p align="center">
  <a href="https://github.com/VibeTensor/IssueFlow/actions"><img src="https://github.com/VibeTensor/IssueFlow/workflows/CI/badge.svg" alt="CI"></a>
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://hacktoberfest.com/"><img src="https://img.shields.io/badge/Hacktoberfest-Friendly-blueviolet?logo=hacktoberfest" alt="Hacktoberfest"></a>
</p>

<p align="center">
  <a href="https://issueflow.pages.dev">Live App</a> |
  <a href="https://github.com/VibeTensor/IssueFlow/issues">Report Bug</a> |
  <a href="https://github.com/VibeTensor/IssueFlow/issues">Request Feature</a>
</p>

---

## What is IssueFlow?

IssueFlow helps developers discover contribution-ready GitHub issues by filtering for:

- Open issues with no assignee
- Issues without linked pull requests (with token)
- Easy-to-start issues with zero comments

## Quick Start

```bash
git clone https://github.com/VibeTensor/IssueFlow.git
cd IssueFlow
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
1. [Generate a token](https://github.com/settings/tokens/new?description=IssueFlow&scopes=public_repo) with `public_repo` scope
2. Paste token in the app
3. Get full PR filtering + 5000 requests/hour

> Tokens are stored locally in your browser only, never sent to any server except GitHub's API.

## Features

| Feature | Without Token | With Token |
|---------|--------------|------------|
| Open issues | Yes | Yes |
| Unassigned filter | Yes | Yes |
| PR detection | No | Yes |
| Rate limit | 60/hr | 5000/hr |
| API | REST | GraphQL |

**Additional features:**
- Filter by zero-comment "easy" issues
- Sort by comment count
- Export to Markdown, CSV, or plain text
- Real-time rate limit display
- Mobile-responsive design

## Tech Stack

- **Framework**: [Astro](https://astro.build) 5.x
- **UI Components**: [Svelte](https://svelte.dev) 5
- **Styling**: [UnoCSS](https://unocss.dev)
- **API**: GitHub GraphQL + REST fallback
- **Language**: TypeScript
- **Hosting**: Cloudflare Pages

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

- [`good first issue`](https://github.com/VibeTensor/IssueFlow/labels/good%20first%20issue)
- [`hacktoberfest`](https://github.com/VibeTensor/IssueFlow/labels/hacktoberfest)
- [`help wanted`](https://github.com/VibeTensor/IssueFlow/labels/help%20wanted)

## Privacy

- No analytics or tracking
- No server-side data collection
- Tokens stored in browser localStorage only
- Open source and auditable

## License

[MIT](./LICENSE)

## About

**IssueFlow** is an open source project by [VibeTensor Private Limited](https://github.com/VibeTensor).

---

If you find this helpful, please star the repo!
