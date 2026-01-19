# Code Style Guide

This guide documents the coding conventions used in IssueFlow.

## TypeScript Conventions

### Naming Conventions

| Type       | Conventions      | Example                     |
| ---------- | ---------------- | --------------------------- |
| Variables  | camelCase        | userName, issueCount        |
| Functions  | camelCase        | fetchIssue(), handleClick() |
| Interfaces | PascalCase       | interface GitHubIssue       |
| Types      | PascalCase       | type IssueState             |
| Constants  | UPPER_SNAKE_CASE | const MAX_ReTRIES =3        |
| Files      | kebab-case       | github-graphql.ts           |

### Type Annotations

- Always use explicit return types for functions
- use interface for object shapes
- Avoid any - use unknown if type is uncertain
- Enable strict mode in tsconfig.json

#Svelte 5 Component Patterns

### Using Runes

IssueFlow uses Svelte 5 runes for reactivity:

```svelte
<script lang="ts">
  // State - use $state
  let count = $state(0);

  // Derived values - use $derived
  let doubled = $derived(count * 2);

  // Side effects - use $effect
  $effect(() => {
    console.log('Count changed:', count);
  });

  //Props - use $props
  interface Props {
    title: string;
    diabled?: boolean;
  }
  let { title, diabled = false }: Props = $props();
</script>
```

### Component Structure Order

1. Script tag with lang = "ts"
2. Imports
3. Props interface
4. Props destructuring
5. State declarations
6. Derived values
7. Effects
8. Functions
9. Template
10. Style tag

## CSS/UnoCSS Guidelines

- Use UnoCSS utility classes (Tailwind-compatiable)
- Avoid inline styles
- use CSS variables for theming

## File Naming Conventions

| Type                | Convention      | Example           |
| ------------------- | --------------- | ----------------- |
| Svelte Components   | PascalCase      | SearchBar.svelte  |
| Astro Pages         | kebab-case      | index.astro       |
| TypeScript Utilites | kebab-case      | github-graphql.ts |
| Test Files          | kebab-case.test | search.test.ts    |

##Linting and Formatting

Run before every commit:

```bash
npm run lint
npm run lint:fix
npm run format
```

## Git Commit Style

Format : [TYPE] Description (#ISSUE_NUMBER)

Types:

- [FEATURE] - New functionality
- [FIX] - Bug fix
- [DOCS] - Documentation
- [CHORE] - Maintenance
- [REFACTOR] - Code restructuring
- [TEST] - Test additions
