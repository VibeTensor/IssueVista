# Contributing to IssueFlow

Thank you for your interest in contributing to IssueFlow! This document provides guidelines and instructions for contributing to this project.

**Repository**: [https://github.com/VibeTensor/IssueFlow](https://github.com/VibeTensor/IssueFlow)

**Live Demo**: [https://issueflow.vibetensor.com](https://issueflow.vibetensor.com)

---

## Hacktoberfest Participants

IssueFlow participates in Hacktoberfest! If you're contributing during Hacktoberfest, please see our [Hacktoberfest Guide](./HACKTOBERFEST.md) for specific information about:

- How to participate
- Issue labels and what they mean
- Quality guidelines for PRs
- What counts as spam
- Quick start guide

**Looking for Hacktoberfest issues?** Check issues labeled [`hacktoberfest`](https://github.com/VibeTensor/IssueFlow/issues?q=is%3Aissue+is%3Aopen+label%3Ahacktoberfest) or [`good first issue`](https://github.com/VibeTensor/IssueFlow/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Reporting Bugs](#reporting-bugs)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project follows a Code of Conduct that all contributors are expected to adhere to. Please be respectful and constructive in all interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally
3. Create a new branch for your contribution
4. Make your changes
5. Push to your fork
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or pnpm package manager
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/IssueFlow.git
cd IssueFlow

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:4321`

### Project Structure

```
IssueFlow/
├── src/
│   ├── components/     # Svelte components
│   ├── layouts/        # Astro layouts
│   ├── lib/           # Utility functions and API clients
│   ├── pages/         # Astro pages
│   └── env.d.ts       # TypeScript definitions
├── public/            # Static assets
├── astro.config.mjs   # Astro configuration
├── package.json       # Dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

1. **Bug fixes** - Fix issues in the codebase
2. **Features** - Add new functionality
3. **Documentation** - Improve or add documentation
4. **Performance** - Optimize existing code
5. **Accessibility** - Improve accessibility
6. **Tests** - Add or improve test coverage
7. **UI/UX** - Enhance user interface and experience

### Finding Work

- Check the [Issues](https://github.com/VibeTensor/IssueFlow/issues) page
- Look for issues labeled `good first issue` or `help wanted`
- Comment on an issue to express interest before starting work
- Ask questions if anything is unclear

## Pull Request Process

1. **Create a branch**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes**
   - Write clear, concise commit messages
   - Follow the coding guidelines
   - Add tests if applicable
   - Update documentation as needed

3. **Test your changes**

   ```bash
   npm run build
   npm run preview
   ```

4. **Commit your changes**

   ```bash
   git add .
   git commit -m "Description of changes"
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template
   - Submit for review

### Pull Request Guidelines

- **Title**: Use a clear, descriptive title
- **Description**: Explain what changes you made and why
- **Screenshots**: Include screenshots for UI changes
- **Testing**: Describe how you tested your changes
- **Breaking Changes**: Clearly document any breaking changes
- **Issue Reference**: Link to related issues using `Fixes #123` or `Closes #123`

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?

Describe your testing process

## Screenshots (if applicable)

Add screenshots here

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes locally
```

## Coding Guidelines

### TypeScript

- Use TypeScript for type safety
- Define proper interfaces and types
- Avoid using `any` type when possible
- Use meaningful variable and function names

### Svelte Components

- Keep components small and focused
- Use reactive statements (`$:`) appropriately
- Follow Svelte best practices
- Use proper event handling

### Styling

- Use UnoCSS utility classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Use the existing design tokens

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Use meaningful variable names
- Write self-documenting code
- Add comments for complex logic

### Example

```typescript
// Good
interface GitHubIssue {
  number: number;
  title: string;
  url: string;
}

function fetchIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
  // Implementation
}

// Avoid
function getData(a: any, b: any): any {
  // Implementation
}
```

## Testing

### Manual Testing

Before submitting a PR, test your changes:

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Preview production build**

   ```bash
   npm run preview
   ```

3. **Test on different devices**
   - Desktop browsers (Chrome, Firefox, Safari)
   - Mobile devices (iOS Safari, Chrome Mobile)
   - Different screen sizes

4. **Test key functionality**
   - Search for issues in various repositories
   - Test with and without authentication
   - Verify rate limit display
   - Check help popup on mobile and desktop

### What to Test

- All new features work as expected
- No regression in existing features
- Mobile responsiveness
- Accessibility (keyboard navigation, screen readers)
- Error handling
- Edge cases

## Reporting Bugs

### Before Reporting

1. Check if the bug has already been reported
2. Verify the bug exists in the latest version
3. Collect relevant information

### Bug Report Template

```markdown
## Bug Description

Clear description of the bug

## Steps to Reproduce

1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior

What you expected to happen

## Actual Behavior

What actually happened

## Screenshots

Add screenshots if applicable

## Environment

- OS: [e.g., Windows 11, macOS 14]
- Browser: [e.g., Chrome 120, Safari 17]
- Version: [e.g., 1.0.0]

## Additional Context

Any other relevant information
```

## Feature Requests

We welcome feature requests! Please provide:

1. **Clear description** of the feature
2. **Use case** - Why is this feature needed?
3. **Proposed solution** - How would it work?
4. **Alternatives** - What alternatives have you considered?
5. **Additional context** - Screenshots, mockups, examples

### Feature Request Template

```markdown
## Feature Description

Clear description of the feature

## Problem Statement

What problem does this solve?

## Proposed Solution

How should this feature work?

## Alternatives Considered

What other solutions did you consider?

## Additional Context

Mockups, examples, references
```

## Questions?

If you have questions:

1. Check existing documentation (README.md, OAUTH_SETUP.md, DEPLOYMENT.md)
2. Search existing issues and discussions
3. Open a new issue with the `question` label
4. Be specific and provide context

## License

By contributing to IssueFlow, you agree that your contributions will be licensed under the MIT License.

## About

IssueFlow is developed and maintained by **VibeTensor Private Limited**, an Indian technology company.

- **Company**: [VibeTensor Private Limited](https://github.com/VibeTensor)
- **Location**: India
- **Contact**: info@vibetensor.com

## Recognition

Contributors will be recognized in the project. Thank you for helping make IssueFlow better!

---

**Happy Contributing!**
