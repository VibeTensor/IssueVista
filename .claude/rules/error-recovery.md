# Error Recovery Rules

## CI Check Failures

If CI checks fail:

### Step 1: Read the failure logs

```bash
gh pr checks <PR_NUMBER> --repo VibeTensor/IssueVista
```

### Step 2: Identify the failing check

- Build failure
- Lint failure
- Test failure
- Type check failure

### Step 3: Fix locally and test

```bash
npm run build      # For build failures
npm run lint       # For lint failures
npm test           # For test failures
npx tsc --noEmit   # For type failures
```

### Step 4: Commit fix and push

```bash
git add .
git commit -m "fix: Resolve CI failure - [description]"
git push origin <branch-name>
```

### Step 5: Wait for new CI run

---

## Merge Conflicts

If merge conflicts occur:

### Step 1: Fetch latest master

```bash
git fetch origin master
```

### Step 2: Rebase your branch

```bash
git rebase origin/master
```

### Step 3: Resolve conflicts in each file

- Open conflicting files
- Choose correct changes
- Remove conflict markers (`<<<<`, `====`, `>>>>`)

### Step 4: Continue rebase

```bash
git add <resolved-files>
git rebase --continue
```

### Step 5: Force push (only for your feature branch)

```bash
git push --force-with-lease origin <branch-name>
```

---

## Rollback After Merge

If something breaks after merge:

### Step 1: Create revert commit

```bash
git revert <merge-commit-sha>
```

### Step 2: Push revert

```bash
git push origin master
```

### Step 3: Create new issue for proper fix

### Step 4: Never force-push to master

---

## Abandoned Approach

If current approach isn't working:

### Step 1: Document what was tried and why it failed

### Step 2: Stash or commit current work

```bash
git stash save "Attempt 1: [approach description]"
```

### Step 3: Research alternative approaches

### Step 4: Discuss with user before proceeding

### Step 5: Start fresh if needed

```bash
git checkout -- .  # Discard uncommitted changes
```

---

## Accidental Squash Merge Recovery

If you accidentally used `--squash` instead of `--merge`:

### Step 1: Revert the squash commit

```bash
git revert <squash-commit-sha>
git push origin master
```

### Step 2: Recreate the branch from before squash

### Step 3: Create new PR

```bash
gh pr create --title "[TYPE] Description (#ISSUE_NUMBER)" --body "..."
```

### Step 4: Merge correctly with --merge

```bash
gh pr merge <NEW_PR_NUMBER> --merge --delete-branch
```

---

## Common Error Scenarios

### ESLint Errors

```bash
# Auto-fix what can be fixed
npm run lint:fix

# Check remaining issues
npm run lint
```

### Prettier Formatting Issues

```bash
# Auto-format all files
npm run format

# Check formatting
npm run format:check
```

### TypeScript Errors

```bash
# Check types without emitting
npx tsc --noEmit

# Common fixes:
# - Add missing type annotations
# - Fix null/undefined checks
# - Update interface definitions
```

### Build Errors

```bash
# Clean build
rm -rf dist/ .astro/
npm run build

# Check for:
# - Missing imports
# - Syntax errors
# - Circular dependencies
```

---

## When to Ask User for Help

- Merge conflicts affecting files you didn't touch
- CI failures that persist after 2 fix attempts
- CodeRabbit comments you don't understand
- Architectural decisions with multiple valid options
- Breaking changes that affect other parts of the codebase
