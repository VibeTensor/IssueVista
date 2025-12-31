# Changelog

All notable changes to IssueFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Search Autocomplete** (#129): Intelligent suggestions while typing
  - Combines search history with popular repository suggestions
  - Prefix-based filtering with case-insensitive matching
  - Text highlighting for matching portions
  - History items ranked by recency (clock icon)
  - Popular repos shown with trending icon (fire)
  - Screen reader announcements via aria-live region
  - "No matches" empty state with helpful hint
  - Full keyboard navigation (arrow keys, Enter, Escape)
  - WAI-ARIA combobox pattern for accessibility

- **Infinite Scroll** (#131): Seamless pagination for large result sets
  - IntersectionObserver-based scroll detection with 200px preload
  - Cursor-based pagination for GraphQL API
  - REST API fallback with page-based pagination
  - Skeleton loading cards during fetch
  - Error retry mechanism with retry button
  - Debounce protection to prevent duplicate API calls
  - Dynamic footer showing progress (X of Y issues)

- **Toast Notification System** (#174): Visual feedback for copy actions
  - Brief "Copied to clipboard!" toast notification
  - 2-second auto-dismiss with fade animation
  - Accessible with aria-live region (WCAG 2.1 4.1.3 compliant)
  - prefers-reduced-motion support
  - Teal gradient styling matching brand design

## [1.1.0] - 2025-11-30

### Added

- **Empty State System** (#30): Comprehensive empty state with context-aware illustrations
  - 5 variants: initial, no-results, error, rate-limited, success
  - Custom SVG illustrations matching sketch-style design
  - Animated floating illustrations with CSS animations
  - WCAG 2.1 accessible with ARIA live regions
  - prefers-reduced-motion support

- **Footer Component** (#21): Professional footer with links and social sharing
  - Version display synced with package.json
  - Social sharing buttons (Twitter, LinkedIn, copy link)
  - VibeTensor Private Limited attribution
  - External links with proper accessibility attributes

- **Zero-Comment Highlighting** (#20): Visual indicators for issues with no comments
  - Green badge for zero-comment issues (great for first-timers)
  - Filter toggle to show only zero-comment issues
  - Sort option by comment count

- **Smart Relative Time Display** (#17): Human-friendly date formatting
  - Relative time display (Today, Yesterday, X days ago)
  - Freshness indicators (green/amber/gray dots)
  - Tooltip with exact date on hover
  - Screen reader accessible

- **Auto-Focus & URL Validation** (#16): Improved search UX
  - Auto-focus on repository URL input on page load
  - Real-time URL validation with debouncing
  - Visual feedback (green checkmark/red warning)
  - Accessible error messages

- **Export Issues Feature** (#10): Download issue links
  - Export to Markdown format
  - Export to JSON format
  - Export to plain text
  - Copy all links to clipboard

- **Copy Issue Link Button** (#14): One-click copy for individual issues
  - Copy button on each issue card
  - Visual feedback on copy success
  - Keyboard accessible

- **Help Button Animation** (#2): Improved discoverability for new users
  - Pulse animation on help button
  - Pure CSS implementation for performance
  - Animation pauses on hover
  - prefers-reduced-motion support

### Changed

- **Brand Redesign**: New IssueFlow identity
  - New logo: Issues flowing through pipeline (S-curve with three nodes)
  - Monochromatic teal color palette (#0d9488, #14b8a6)
  - Updated favicon and Open Graph image
  - Streamlined documentation

- **Component Architecture** (#35): Improved code organization
  - Decomposed ResultsList.svelte into modular components
  - SearchForm, IssueCard, ExportMenu, FilterControls separated
  - Better maintainability and testability

### Technical

- 403 unit tests covering all utility functions
- 54+ E2E tests for browser-based validation
- Improved test coverage for edge cases
- Updated .gitignore for cleaner repository

---

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

**Live Demo:** [https://issueflow.vibetensor.com](https://issueflow.vibetensor.com)

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
- [ ] Keyboard shortcuts
- [ ] Offline support (PWA)
- [ ] Issue difficulty estimation

---

For detailed information about changes in each version, see the [Git commit history](https://github.com/VibeTensor/IssueFlow/commits/master).

[1.1.0]: https://github.com/VibeTensor/IssueFlow/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/VibeTensor/IssueFlow/releases/tag/v1.0.0
