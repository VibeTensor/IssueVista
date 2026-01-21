# Frequently Asked Questions

This document answers common questions about IssueFlow, from getting started to advanced usage and contributing.

## Getting Started

### What is IssueFlow?

IssueFlow is a GitHub issue discovery tool designed to help developers find beginner-friendly issues across open source projects. It provides a streamlined interface for searching, filtering, and exploring GitHub issues, making it easier for newcomers to find their first contribution opportunities.

### How do I install IssueFlow locally?

To run IssueFlow locally, follow these steps:

1. Clone the repository: `git clone https://github.com/VibeTensor/IssueFlow.git`
2. Navigate to the project directory: `cd IssueFlow`
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`
5. Open your browser to `http://localhost:4321`

### What are the system requirements?

IssueFlow requires the following:

- Node.js version 18 or higher
- npm version 9 or higher
- A modern web browser (Chrome, Firefox, Safari, or Edge)
- Git for version control

### Do I need a GitHub account to use IssueFlow?

No, you do not need a GitHub account for basic searches. However, providing a GitHub Personal Access Token increases your API rate limit from 60 to 5,000 requests per hour, which is recommended for extensive searching.

### How do I get a GitHub Personal Access Token?

To create a Personal Access Token:

1. Go to GitHub Settings
2. Click on Developer Settings
3. Select Personal access tokens, then Tokens (classic)
4. Click Generate new token
5. Give it a descriptive name like "IssueFlow"
6. Select the `public_repo` scope (minimum required)
7. Click Generate token
8. Copy the token and paste it into IssueFlow's token field

Note: Keep your token secure and never share it publicly.

## Features

### What filters are available for searching issues?

IssueFlow provides several filtering options:

- **Label**: Filter by issue labels such as bug, enhancement, documentation, good first issue, and help wanted
- **Language**: Filter by programming language used in the repository
- **State**: Filter by issue state (open or closed)
- **Author**: Filter by the username who created the issue

### How does the search history feature work?

IssueFlow automatically saves your recent searches to browser local storage. Up to 10 recent searches are stored. You can access your search history by clicking on the search input field or pressing the down arrow key when the input is focused. Select any previous search to quickly repeat it.

### What export formats are supported?

You can export your search results in three formats:

- **JSON**: Machine-readable format ideal for programmatic processing and integration with other tools
- **CSV**: Spreadsheet-compatible format perfect for data analysis in Excel or Google Sheets
- **Markdown**: Formatted text suitable for documentation, reports, or sharing in GitHub discussions

### How do I change the theme?

Click the theme button in the header to open the theme selector. Use arrow keys or click to browse available themes. Press Enter or click to apply your selection. Your theme preference is saved to local storage and persists across sessions.

### What is the Topic Cluster Visualization?

The Topic Cluster Visualization groups issues by their primary label in an interactive force-directed graph. Features include:

- Zoom in and out using buttons or mouse scroll
- Pan by dragging the background
- Click cluster labels to focus on specific groups
- Hover over nodes to see issue details
- Drag nodes to reposition them

## Technical Questions

### What technology stack does IssueFlow use?

IssueFlow is built with modern web technologies:

- **Astro 5**: Static site generator with island architecture
- **Svelte 5**: Reactive UI framework using runes ($state, $derived, $effect)
- **TypeScript**: Type-safe JavaScript with strict mode enabled
- **UnoCSS**: Atomic CSS framework compatible with Tailwind classes
- **Vitest**: Unit testing framework
- **Playwright**: End-to-end testing framework

### How does IssueFlow interact with the GitHub API?

IssueFlow uses the GitHub GraphQL API (v4) for efficient data fetching. GraphQL allows requesting exactly the data needed in a single query, reducing bandwidth and improving performance compared to the REST API.

### What is the rate limit for GitHub API requests?

Without authentication, you are limited to 60 requests per hour. With a Personal Access Token, the limit increases to 5,000 requests per hour. IssueFlow displays your remaining rate limit in the interface.

### Does IssueFlow store any data on external servers?

No, IssueFlow is a client-side application. All data processing happens in your browser. Search history and preferences are stored in your browser's local storage. No data is sent to external servers other than GitHub's API.

### How do I run the tests?

IssueFlow includes both unit and end-to-end tests:

- Run all tests: `npm test`
- Run unit tests only: `npm run test:unit`
- Run E2E tests: `npm run test:e2e`
- Run tests with coverage: `npm run test:coverage`

### How do I build for production?

To create a production build:

1. Run the build command: `npm run build`
2. The output will be in the `dist/` directory
3. Preview the build locally: `npm run preview`

## Contribution Questions

### How can I contribute to IssueFlow?

We welcome contributions of all kinds:

1. Fork the repository on GitHub
2. Create a feature branch from master
3. Make your changes following our coding standards
4. Write tests for new functionality
5. Ensure all tests pass and linting is clean
6. Submit a pull request with a clear description

### What are the coding standards?

IssueFlow follows these coding standards:

- Use TypeScript with strict mode
- Follow ESLint rules (run `npm run lint`)
- Format code with Prettier (run `npm run format`)
- Use Svelte 5 runes for state management
- Write meaningful commit messages following the format: `[TYPE] Description (#ISSUE_NUMBER)`

### How do I report a bug?

To report a bug:

1. Check existing issues to avoid duplicates
2. Create a new issue using the bug report template
3. Include steps to reproduce the problem
4. Describe the expected vs actual behavior
5. Add screenshots if applicable
6. Mention your browser and operating system

### How do I request a new feature?

To request a feature:

1. Check existing issues and discussions
2. Create a new issue using the feature request template
3. Describe the problem you want to solve
4. Explain your proposed solution
5. Consider alternative approaches
6. Discuss potential impact on existing features

### What labels should I look for as a new contributor?

Look for issues with these labels:

- **good first issue**: Ideal for newcomers, usually well-documented and scoped
- **help wanted**: The maintainers are actively seeking help
- **documentation**: Often easier to start with, no code changes required
- **bug**: Fixing bugs is a great way to learn the codebase

### How long does it take for PRs to be reviewed?

Pull requests are typically reviewed within 24-48 hours. CodeRabbit provides automated review immediately after PR creation. Address any feedback promptly to speed up the merge process.

### Can I work on multiple issues at once?

Yes, but we recommend focusing on one issue at a time to ensure quality. Create separate branches for each issue using the naming convention: `<type>/<issue-number>-<short-description>`.

## Troubleshooting

### Why am I getting a rate limit error?

You have exceeded the GitHub API rate limit. Solutions:

- Add a Personal Access Token to increase your limit to 5,000 requests per hour
- Wait for the rate limit to reset (usually within an hour)
- Reduce the frequency of your searches

### Why are my search results empty?

Empty results can occur when:

- The repository URL is incorrect or the repository does not exist
- The repository has no open issues matching your filters
- Your filters are too restrictive; try removing some filters
- The repository is private and your token lacks access

### Why is the application loading slowly?

Slow loading can be caused by:

- Large repositories with many issues
- Slow network connection
- GitHub API response times
- Try searching smaller repositories or adding filters to reduce results

### How do I clear my search history?

Search history is stored in browser local storage. To clear it:

- Open browser developer tools (F12)
- Go to the Application tab
- Find Local Storage in the sidebar
- Delete the IssueFlow entries

Alternatively, clearing your browser's site data will remove all stored preferences.

### The theme is not saving between sessions

Theme preferences require local storage access. Ensure:

- Your browser allows local storage for this site
- You are not in private or incognito mode
- No browser extensions are blocking storage

## Additional Resources

### Where can I find more documentation?

Additional documentation is available in the `docs/` directory of the repository:

- CODE_STYLE_GUIDE.md: Coding standards and conventions
- GIT_WORKFLOW_GUIDE.md: Git branching and commit guidelines
- KEYBOARD_SHORTCUTS.md: Complete keyboard navigation reference
- PR_REVIEW_CHECKLIST.md: Pull request review guidelines

### How do I contact the maintainers?

You can reach the maintainers through:

- GitHub Issues: For bugs and feature requests
- GitHub Discussions: For questions and community conversations
- Pull Request comments: For code-related discussions

### Is IssueFlow open source?

Yes, IssueFlow is fully open source under the MIT License. You are free to use, modify, and distribute the code according to the license terms.
