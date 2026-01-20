# Git Workflow Guide

This guide documents the Git workflow and branching strategy used in IssueFlow.

## Branch Naming Convention

Format: `<type>/<issue-number>-<short-description>`

### Branch Types

| Type | Use For | Example |
|------|---------|---------|
| `feature/` | New features | `feature/50-dark-mode` |
| `fix/` | Bug fixes | `fix/45-button-alignment` |
| `docs/` | Documentation | `docs/197-git-workflow` |
| `chore/` | Maintenance | `chore/52-add-labels` |
| `refactor/` | Code restructuring | `refactor/35-components` |
| `test/` | Test additions | `test/100-unit-tests` |
| `a11y/` | Accessibility | `a11y/216-export-menu` |

### Examples

```
feature/50-dark-mode
fix/45-button-alignment
docs/197-git-workflow-guide
chore/52-add-labels
refactor/35-component-architecture
```

## Commit Message Format

### Structure

```
[TYPE] Description (#ISSUE_NUMBER)
```

### Commit Types

| Type | Description | Example |
|------|-------------|---------|
| `[FEATURE]` | New functionality | `[FEATURE] Add dark mode toggle (#50)` |
| `[FIX]` | Bug fix | `[FIX] Resolve button alignment (#45)` |
| `[DOCS]` | Documentation | `[DOCS] Add Git Workflow Guide (#197)` |
| `[CHORE]` | Maintenance | `[CHORE] Update dependencies (#100)` |
| `[REFACTOR]` | Code restructuring | `[REFACTOR] Simplify search logic (#80)` |
| `[TEST]` | Test additions | `[TEST] Add unit tests (#90)` |
| `[SECURITY]` | Security fixes | `[SECURITY] Fix vulnerability (#44)` |
| `[A11Y]` | Accessibility | `[A11Y] Improve keyboard nav (#216)` |

### Guidelines

- Use present tense ("Add feature" not "Added feature")
- - Keep first line under 72 characters
- - Reference issue number with #
- - Be specific about what changed
### Good Examples

```
[FEATURE] Add dark mode toggle (#50)
[FIX] Resolve button alignment on mobile (#45)
[DOCS] Add Git Workflow Guide (#197)
[REFACTOR] Extract search logic to utility (#80)
```

### Bad Examples

```
Fixed stuff          # Too vague
updated code         # No type, no issue
[FEATURE] Add a really long description that goes on and on  # Too long
```

## Pull Request Process

### 1. Create Feature Branch

```bash
git checkout master
git pull origin master
git checkout -b <type>/<issue-number>-<description>
```

### 2. Make Changes

- Write code following the style guide
- - Test your changes locally
- - Run linting and formatting
```bash
npm run lint
npm run format
npm run build
```

### 3. Commit Changes

```bash
git add <files>
git commit -m "[TYPE] Description (#ISSUE_NUMBER)"
```

### 4. Push to Remote

```bash
git push -u origin <branch-name>
```

### 5. Create Pull Request

```bash
gh pr create --title "[TYPE] Title (#ISSUE_NUMBER)" --body "## Summary
- Change 1
- Change 2

Closes #ISSUE_NUMBER"
```

### 6. Wait for CI Checks

```bash
gh pr checks <PR_NUMBER> --watch
```

### 7. Address Review Comments

If CodeRabbit or reviewers request changes:

```bash
# Make fixes
git add <files>
git commit -m "fix: Address review comments"
git push origin <branch-name>
```

### 8. Merge PR

```bash
gh pr merge <PR_NUMBER> --merge --delete-branch
```

## Merge Strategy

### Always Use --merge

**IMPORTANT:** Always use `--merge` flag, never `--squash`.

```bash
# CORRECT
gh pr merge <PR_NUMBER> --merge --delete-branch

# WRONG - Never use
gh pr merge <PR_NUMBER> --squash --delete-branch
```

### Why --merge?

| Aspect | --merge (Required) | --squash (Forbidden) |
|--------|-------------------|---------------------|
| History | Preserves all commits | Loses commit history |
| Git graph | Shows branch pattern | Linear, no branches |
| Traceability | Can trace each change | Single combined commit |
| Rollback | Easy per-commit revert | All-or-nothing revert |

### Verify Merge Pattern

After merging, verify the git graph:

```bash
git log --oneline --graph -5
```

Expected pattern:
```
*   abc1234 Merge pull request #XX from VibeTensor/branch-name
|\
| * def5678 [TYPE] Commit message
|/
* previous-commit
```

## Common Commands Reference

### Starting New Work

```bash
git checkout master
git pull origin master
git checkout -b <type>/<issue-number>-<description>
```

### Saving Work

```bash
git add <files>
git commit -m "[TYPE] Description (#ISSUE)"
git push -u origin <branch-name>
```

### Creating PR

```bash
gh pr create --title "[TYPE] Title (#ISSUE)" --body "Description"
```

### Merging PR

```bash
gh pr merge <PR_NUMBER> --merge --delete-branch
```

### Syncing After Merge

```bash
git checkout master
git pull origin master
```

### Viewing History

```bash
git log --oneline --graph -10
```

### Checking PR Status

```bash
gh pr checks <PR_NUMBER>
gh pr view <PR_NUMBER>
```

## Handling Conflicts

### If Merge Conflicts Occur

```bash
# Fetch latest master
git fetch origin master

# Rebase your branch
git rebase origin/master

# Resolve conflicts in editor
# Then continue
git add <resolved-files>
git rebase --continue

# Push with force-with-lease
git push --force-with-lease origin <branch-name>
```

## Best Practices

1. **Pull before starting** - Always pull latest master before creating a branch
2. 2. **Small commits** - Make focused, atomic commits
3. 3. **Descriptive messages** - Write clear commit messages
4. 4. **One issue per branch** - Don't mix multiple issues
5. 5. **Keep branches short-lived** - Merge frequently
6. 6. **Never force push to master** - Only to feature branches
7. 7. **Delete merged branches** - Keep repository clean