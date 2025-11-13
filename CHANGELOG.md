# Changelog

All notable changes to IssueFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-10

### Added

- Initial release of IssueFlow
- GitHub issue finder with smart filtering (open, unassigned, no PRs)
- Multiple authentication options (GitHub OAuth, Personal Access Token, No Auth)
- GraphQL API support for authenticated users (5000 req/hr)
- REST API fallback for unauthenticated users (60 req/hr)
- Mobile-responsive design with hand-drawn sketch aesthetic
- Interactive help popup with step-by-step token generation guide
- Rate limit display and tracking
- Privacy-first approach (local token storage only)
- Monochromatic slate color scheme
- Support for GitHub OAuth Device Flow
- Comprehensive documentation (README, CONTRIBUTING, OAUTH_SETUP, DEPLOYMENT)
- MIT License
- Issue and PR templates for contributors

### Features

- **Smart Filtering**: Automatically filters for open, unassigned issues without pull requests
- **Authentication Options**: OAuth, Personal Token, or No Auth
- **Performance Optimized**: Built with Astro 5.x, Svelte, and UnoCSS
- **Mobile-First**: Fully responsive design tested on all devices
- **Help Guide**: Interactive popup with detailed instructions
- **Rate Limit Friendly**: Clear display of remaining requests

### Technical

- Astro 5.x for static site generation
- Svelte 5 for interactive components
- UnoCSS for atomic CSS
- GitHub GraphQL API integration
- GitHub REST API fallback
- TypeScript for type safety
- Cloudflare Pages deployment

### Documentation

- README.md with quick start guide
- CONTRIBUTING.md with contribution guidelines
- OAUTH_SETUP.md with OAuth configuration
- DEPLOYMENT.md with deployment instructions
- GitHub issue and PR templates

---

## Release Notes

### Version 1.0.0

This is the initial public release of IssueFlow, a tool designed to help developers find unassigned GitHub issues ready for contribution.

**Key Highlights:**

- Clean, intuitive interface
- Works with or without authentication
- Fast performance with GraphQL API
- Mobile-responsive design
- Privacy-focused (no server-side data storage)
- Open source under MIT License

**Live Demo:** [https://issueflow.pages.dev](https://issueflow.pages.dev)

**Repository:** [https://github.com/VibeTensor/IssueFlow](https://github.com/VibeTensor/IssueFlow)

---

## Future Roadmap

Planned features for future releases:

- [ ] Save favorite repositories
- [ ] Advanced filtering options (labels, date ranges)
- [ ] Browser extension
- [ ] Dark/Light theme toggle
- [ ] Issue bookmarking
- [ ] Multi-repository search
- [ ] GitHub trending integration
- [ ] Contribution analytics

---

For detailed information about changes in each version, see the [Git commit history](https://github.com/VibeTensor/IssueFlow/commits/master).
