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

## UI/UX Design Patterns

### Color Scheme

IssueFlow uses a dark theme with the following color palette:

| Purpose    | Color             | CSS Variable/Value     |
| ---------- | ----------------- | ---------------------- |
| Background | Dark gradient     | #0f172a to #1e293b     |
| Accent     | Teal              | #14b8a6                |
| Text       | Light slate       | #e2e8f0                |
| Muted      | Slate             | #94a3b8, #64748b       |
| Border     | Transparent slate | rgba(71, 85, 105, 0.4) |

### Typography Guidelines

- Minimum font size: 11px (prefer 12-13px for body text)
- Font weights: 500 (medium), 600 (semibold), 700 (bold)
- Use uppercase with letter-spacing for labels (0.05-0.08em)
- Line height: 1.4-1.5 for body text

### Accessibility Requirements

- All interactive elements must have `:focus-visible` styles
- Use `aria-label` on icon-only buttons
- Minimum color contrast ratio: 4.5:1 for text
- Keyboard navigation support for all controls

### Animation Patterns

```css
/* Standard transitions */
transition: all 0.15s ease; /* Quick feedback */
transition: all 0.2s ease; /* Standard */
transition: all 0.3s ease; /* Smooth */

/* Hover transforms */
transform: scale(1.05); /* Subtle grow */
transform: translateX(2px); /* Subtle slide */

/* Focus states */
outline: 2px solid #14b8a6;
outline-offset: 2px;
```

### Component Visual Effects

- Use `backdrop-filter: blur(8px)` for glass effect on overlays
- Use `drop-shadow` for node glow effects in visualizations
- Use `box-shadow` for depth on cards and tooltips
- Add pulse animations for loading/processing states

## D3.js Visualization Patterns

### Force Graph Setup

```typescript
// Standard force simulation configuration
simulation = d3
  .forceSimulation<NodeType>(nodes)
  .force('charge', d3.forceManyBody().strength(-50))
  .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
  .force('collision', d3.forceCollide().radius(nodeRadius + 4));
```

### Zoom Behavior

```typescript
// Bounded zoom with smooth transitions
zoom = d3
  .zoom<SVGSVGElement, unknown>()
  .scaleExtent([0.3, 4]) // Min/max zoom levels
  .on('zoom', (event) => {
    g.attr('transform', event.transform);
  });

// Animated zoom transitions
svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
```

### Node Styling

- Use cluster color for node fill
- Add glow effect via CSS `filter: drop-shadow()`
- Increase stroke width on hover for feedback
- Support drag interactions with D3 drag behavior

## Claude Code Skills Integration

Available skills for development workflow:

| Skill           | Trigger            | Purpose                         |
| --------------- | ------------------ | ------------------------------- |
| code-review     | `/code-review`     | PR code review                  |
| feature-dev     | `/feature-dev`     | Guided feature development      |
| frontend-design | `/frontend-design` | UI/UX design and implementation |

Use `/skill-name` in Claude Code to invoke these skills for enhanced development workflow.
