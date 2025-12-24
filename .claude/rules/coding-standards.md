# Coding Standards Rules

## Svelte 5 Components

### Runes (REQUIRED)

```svelte
<script lang="ts">
  // State
  let count = $state(0);

  // Derived
  let doubled = $derived(count * 2);

  // Effects
  $effect(() => {
    console.log('Count changed:', count);
  });

  // Props
  interface Props {
    title: string;
    disabled?: boolean;
  }
  let { title, disabled = false }: Props = $props();
</script>
```

### Component Structure

```svelte
<!--
  ComponentName
  Brief description of what this component does
-->

<script lang="ts">
  // 1. Imports
  // 2. Interface for Props
  // 3. Props destructuring
  // 4. State ($state)
  // 5. Derived ($derived)
  // 6. Effects ($effect)
  // 7. Functions
</script>

<!-- Template -->

<style>
  /* Scoped styles if needed */
</style>
```

## TypeScript

### Strict Mode

- `noImplicitAny`: true
- `strictNullChecks`: true
- All functions must have return types
- All parameters must have types

### Naming Conventions

| Type       | Convention  | Example                 |
| ---------- | ----------- | ----------------------- |
| Variables  | camelCase   | `userName`              |
| Functions  | camelCase   | `fetchIssues()`         |
| Interfaces | PascalCase  | `interface GitHubIssue` |
| Types      | PascalCase  | `type IssueState`       |
| Constants  | UPPER_SNAKE | `const MAX_RETRIES`     |
| Files      | kebab-case  | `github-graphql.ts`     |

## ESLint Rules

### Zero Errors Required

```bash
npm run lint  # Must show: 0 errors
```

### Warnings Allowed (for gradual adoption)

- `@typescript-eslint/no-unused-vars` (warn)
- `@typescript-eslint/no-explicit-any` (warn)

### Auto-fix Before Commit

```bash
npm run lint:fix
npm run format
```

## Prettier Configuration

Matches `.editorconfig`:
| Setting | Value |
|---------|-------|
| tabWidth | 2 |
| useTabs | false |
| semi | true |
| singleQuote | true |
| trailingComma | none |
| printWidth | 100 |
| endOfLine | lf |

## Git Conventions

### Branch Naming

```
<type>/<issue-number>-<short-description>

Examples:
feature/50-dark-mode
fix/45-button-alignment
chore/52-add-labels
docs/38-update-readme
```

### Commit Messages

```
[TYPE] Description (#ISSUE_NUMBER)

Types: [FEATURE], [FIX], [CHORE], [DOCS], [REFACTOR], [TEST]

Examples:
[FEATURE] Add dark mode toggle (#50)
[FIX] Resolve button alignment on mobile (#45)

For review fixes:
fix: Address CodeRabbit review - description
```

### Plain Text Standard

- NO emojis in commits, PRs, or code comments
- NO decorative unicode symbols
- Standard ASCII text only

## Testing

### Unit Tests (Vitest)

- File pattern: `tests/*.test.ts`
- Run: `npm run test:unit`

### E2E Tests (Playwright)

- File pattern: `tests/e2e/*.spec.ts`
- Run: `npm run test:e2e`

### Before PR

```bash
npm run build       # Must pass
npm run lint        # 0 errors
npm run format:check # All files formatted
npm run test:unit   # Tests pass
```

## Accessibility

- All buttons must have `aria-label`
- All images must have `alt` text
- Interactive elements must be keyboard accessible
- Use semantic HTML elements
