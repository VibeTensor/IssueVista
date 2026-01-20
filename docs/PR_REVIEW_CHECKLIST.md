# Pull Request Review Checklist

This checklist helps reviewers ensure consistent and thorough PR reviews.

## Before Starting Review

- [ ] Read the linked issue to understand the context
- [ ] Check if PR description clearly explains the changes
- [ ] Verify PR is targeting the correct branch (usually `master`)

## Code Quality Checklist

### Code Structure

- [ ] Code follows project naming conventions
- [ ] Functions and variables have descriptive names
- [ ] No unnecessary code duplication
- [ ] Code is modular and maintainable
- [ ] No commented-out code left behind

### TypeScript/JavaScript

- [ ] Proper type annotations understand- [ ] No `any` types without justification
- [ ] Error handling is appropriate
- [ ] No console.log statements left in production code- [ ] Async/await used correctly

### Svelte Components

- [ ] Uses Svelte 5 runes ($state, $derived, $effect)
- [ ] Props interface defined with TypeScript- [ ] Component structure follows project conventions- [ ] Reactive statements are efficient
- [ ] No memory leaks (cleanup in $effect if needed)

### Styling

- [ ] Uses UnoCSS/Tailwind utility classes
- [ ] Follows project color scheme
- [ ] Responsive design considered
- [ ] No inline styles unless necessary

## Testing Requirements

### Unit Tests

- [ ] New functions have corresponding Tests- [ ] Edge cases are covered
- [ ] Tests are descriptive and readable
- [ ] All existing tests still pass

### Manual Testing

- [ ] Feature works as described in the issue- [ ] No regressions in related functionality
- [ ] Works in different browsers (if applicable)
- [ ] Works on mobile viewport (if applicable)

## Documentation Requirements

### Code Documentation

- [ ] Complex logic has explanatory comments
- [ ] Public functions have JSDoc comments (if applicable)
- [ ] README updated (if new feature)

### PR Documentation

- [ ] PR description explains what and why
- [ ] Breaking changes are clearly noted
- [ ] Screenshots included for UI changes

## Performance Considerations

- [ ] No unnecessary re-renders
- [ ] Large lists use virtualization (if applicable)
- [ ] Images are optimized
- [ ] No blocking operations on main thread
- [ ] Bundle size impact considered

## Security Checklist

- [ ] No sensitive data exposed (API keys, tokens)
- [ ] User input is sanitized
- [ ] No XSS vulnerabilities
- [ ] Dependencies are from trusted sources

## Accessibility

- [ ] Interactive elements are keyboard accessible
- [ ] ARIA labels used where needed- [ ] Color contrast meets WCAG standards
- [ ] Focus states are visible

## Final Checklist

- [ ] Build passes (`npm run build`)
- [ ] Lint passes (`npm run lint`)
- [ ] Format check passes (`npm run format:check`)
- [ ] All CI checks are green
- [ ] Commit messages follow conventions

## Review Decision

After completing the checklist:

| Decision            | When to Use                     |
| ------------------- | ------------------------------- |
| **Approve**         | All checks pass, code is ready  |
| **Request Changes** | Issues found that must be fixed |
| **Comment**         | Minor suggestions, not blocking |

## Common Review comments

### Good Examples

```
"Consider extracting this logic into a utility function for reusability."
"This could cause a memory leak - add cleanup in $effect."
"Nice refactor! Much cleaner than before."
```

### Avoid

```
"This is wrong." (Not constructive)
"Why did you do it this way?" (Sounds accusatory)
```

### Better Alternatives

```
"This approach might cause X issue. Consider Y instead because..."
"I'm curious about the reasoning here - could you explain?"
```
