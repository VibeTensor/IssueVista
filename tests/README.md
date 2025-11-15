# IssueFlow Test Suite

Comprehensive test suite for the IssueFlow application, covering unit tests and end-to-end (E2E) tests.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)

---

## Overview

This test suite ensures the quality and reliability of the IssueFlow application, with a focus on:

- **Unit Tests**: Testing individual components and functions in isolation
- **E2E Tests**: Testing complete user workflows in real browsers
- **Visual Tests**: Verifying animations, styles, and responsive behavior
- **Accessibility Tests**: Ensuring WCAG compliance and keyboard navigation

### Technologies Used

- **Vitest**: Fast unit test framework with native ES modules support
- **Playwright**: Modern E2E testing framework supporting multiple browsers
- **Happy-DOM**: Lightweight DOM implementation for unit tests

---

## Test Structure

```
tests/
├── README.md                          # This file
├── setup.ts                           # Global test setup and custom matchers
├── help-button-animation.test.ts      # Unit tests for help button animation
└── e2e/
    └── help-button-animation.spec.ts  # E2E tests for help button animation
```

---

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm or pnpm

### Installation

Testing dependencies are already included in `package.json`. If you need to reinstall:

```bash
npm install
```

### Playwright Setup

For E2E tests, you'll need to install Playwright browsers:

```bash
npx playwright install
```

---

## Running Tests

### All Tests

Run both unit and E2E tests:

```bash
npm run test:all
```

### Unit Tests

Run unit tests with Vitest:

```bash
# Run once
npm run test:unit

# Watch mode (re-runs on file changes)
npm test

# With UI (visual test runner)
npm run test:ui

# With coverage report
npm run test:coverage
```

### E2E Tests

Run end-to-end tests with Playwright:

```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

### Running Specific Tests

```bash
# Run specific unit test file
npx vitest run tests/help-button-animation.test.ts

# Run specific E2E test file
npx playwright test tests/e2e/help-button-animation.spec.ts

# Run specific test by name
npx vitest run -t "should have pulse animation class"
```

---

## Test Coverage

### Help Button Animation Tests (Issue #2)

#### Unit Tests (`help-button-animation.test.ts`)

**CSS Animation Setup** (4 tests)
- Verifies `help-button-pulse` class is applied
- Checks positioning classes
- Validates ARIA labels
- Confirms button element type

**Animation Properties** (4 tests)
- Animation property definition
- 2-second duration
- ease-in-out timing function
- Infinite iteration

**Keyframes Animation** (4 tests)
- pulse-scale keyframes definition
- Scale transformation (1 to 1.05)
- Box-shadow animation
- Keyframe percentages (0%, 50%, 100%)

**Hover Behavior** (2 tests)
- Animation pauses on hover
- Uses `animation-play-state: paused` (not `animation: none`)

**Button Positioning** (4 tests)
- Fixed positioning
- Bottom-right placement
- High z-index
- Circular border-radius

**Performance Considerations** (2 tests)
- Uses hardware-accelerated transform
- Pure CSS animation (no JavaScript)

**Responsive Design** (1 test)
- Responsive sizing classes (mobile and desktop)

**User Experience** (3 tests)
- Button is clickable (not disabled)
- Proper ARIA label for accessibility
- Visible content

**Integration with Existing Styles** (4 tests)
- Maintains sketch-button class
- Maintains shadow-2xl class
- Maintains transition-all class
- Maintains hover background class

**Total Unit Tests: 28**

#### E2E Tests (`help-button-animation.spec.ts`)

**Visual Presence** (2 tests)
- Button displays in bottom-right corner
- Question mark icon is visible

**Animation Presence** (4 tests)
- help-button-pulse class applied
- Active CSS animation
- 2-second duration
- Infinite iteration count

**Hover Interaction** (3 tests)
- Animation pauses on hover
- Animation resumes when hover ends
- Background color changes on hover

**Click Functionality** (3 tests)
- Opens help popup on click
- Closes popup with close button
- Maintains animation after popup interaction

**Mobile Responsiveness** (3 tests)
- Visible on mobile devices
- Appropriate size on mobile
- Animation works on mobile

**Accessibility** (3 tests)
- Proper ARIA label
- Keyboard accessible
- Sufficient color contrast

**Performance** (2 tests)
- No layout shifts during animation
- Uses CSS transform (hardware accelerated)

**Total E2E Tests: 24**

**Grand Total: 52 tests**

---

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';

describe('My Component', () => {
  it('should render correctly', () => {
    // Arrange
    const element = document.createElement('div');

    // Act
    element.textContent = 'Hello';

    // Assert
    expect(element.textContent).toBe('Hello');
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should display homepage', async ({ page }) => {
  // Navigate
  await page.goto('/');

  // Interact
  const button = page.locator('button[aria-label="Help"]');

  // Assert
  await expect(button).toBeVisible();
});
```

### Custom Matchers

Custom matchers are defined in `tests/setup.ts`:

```typescript
// Usage example
expect(element).toHaveAnimation('pulse-scale');
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:unit

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: playwright-report/
```

---

## Debugging Tests

### Unit Tests

```bash
# Run tests in watch mode with verbose output
npm test -- --reporter=verbose

# Run specific test file
npm test -- tests/help-button-animation.test.ts

# Debug with Node inspector
node --inspect-brk ./node_modules/vitest/vitest.mjs run
```

### E2E Tests

```bash
# Run with headed browser (see what's happening)
npm run test:e2e:headed

# Run with UI mode (step through tests)
npm run test:e2e:ui

# Debug specific test
npx playwright test --debug tests/e2e/help-button-animation.spec.ts

# Generate trace for failed tests
npx playwright test --trace on
```

---

## Coverage Reports

Generate and view coverage reports:

```bash
# Generate coverage
npm run test:coverage

# Open coverage report in browser
open coverage/index.html  # macOS
start coverage/index.html # Windows
xdg-open coverage/index.html # Linux
```

---

## Test Best Practices

1. **Arrange-Act-Assert Pattern**
   ```typescript
   it('should do something', () => {
     // Arrange: Set up test data
     const input = 'test';

     // Act: Perform the action
     const result = doSomething(input);

     // Assert: Verify the result
     expect(result).toBe('expected');
   });
   ```

2. **Descriptive Test Names**
   - Good: `should pause animation on hover`
   - Bad: `test hover`

3. **Test Independence**
   - Each test should be able to run independently
   - Use `beforeEach` to reset state

4. **Avoid Testing Implementation Details**
   - Test user-visible behavior
   - Don't test internal variables or functions

5. **Use Proper Selectors**
   - Prefer `getByRole`, `getByLabel` over `getByClass`
   - Use `aria-label` and `data-testid` attributes

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://testing-library.com/docs/)
- [Accessibility Testing](https://www.w3.org/WAI/test-evaluate/)

---

## Contributing

When adding new features:

1. Write tests first (TDD approach)
2. Ensure all tests pass before committing
3. Maintain test coverage above 80%
4. Update this README if adding new test patterns

---

## License

Tests are part of the IssueFlow project and follow the same MIT license.
