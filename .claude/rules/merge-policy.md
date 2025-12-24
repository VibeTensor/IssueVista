# Merge Policy Rules

## MANDATORY: Always Use --merge

```bash
# CORRECT - Always use this
gh pr merge <PR_NUMBER> --merge --delete-branch

# WRONG - Never use these
gh pr merge <PR_NUMBER> --squash --delete-branch  # FORBIDDEN
gh pr merge <PR_NUMBER> --rebase --delete-branch  # FORBIDDEN
```

---

## Why --merge is Required

| Aspect              | --merge (REQUIRED)       | --squash (FORBIDDEN)         |
| ------------------- | ------------------------ | ---------------------------- |
| Git graph           | Shows branch pattern     | Linear (no branches visible) |
| History             | Complete commit history  | Single squashed commit       |
| Traceability        | Can trace each commit    | Loses individual commits     |
| Repository standard | Matches existing pattern | Violates conventions         |

---

## Visual Verification

After every merge, verify the git graph:

```bash
git log --oneline --graph -5
```

### CORRECT Pattern (--merge used):

```
*   abc1234 Merge pull request #XX from VibeTensor/branch-name
|\
| * def5678 fix: Address review comments
| * ghi9012 feat: Initial implementation
|/
* previous-commit
```

### WRONG Pattern (--squash used - VIOLATION):

```
* abc1234 [TYPE] Description (#XX)
* previous-commit
```

---

## Pre-Merge Checklist

- [ ] All CI checks passed
- [ ] CodeRabbit approved (0 actionable comments)
- [ ] User confirmed ready to merge
- [ ] Command uses `--merge` flag
- [ ] Command includes `--delete-branch` flag

---

## Recovery from Accidental Squash

If you accidentally used `--squash`:

### Step 1: Revert the squash commit

```bash
git revert <squash-commit-sha>
git push origin master
```

### Step 2: Identify the original commits

Find the commits that were squashed (from PR history or reflog).

### Step 3: Recreate the branch

```bash
git checkout -b <type>/<issue-number>-<description>-v2
# Cherry-pick or recreate the original commits
git push -u origin <branch-name>
```

### Step 4: Create new PR

```bash
gh pr create --title "[TYPE] Description (#ISSUE_NUMBER)" --body "..."
```

### Step 5: Merge correctly

```bash
gh pr merge <NEW_PR_NUMBER> --merge --delete-branch
```

---

## Merge Verification Commands

```bash
# Check if PR was merged correctly
gh pr view <PR_NUMBER> --json state,mergedAt,mergeCommit

# View the merge commit
git log --oneline --graph -10

# Verify issue is closed
gh issue view <ISSUE_NUMBER> --json state
```

---

## Why This Policy Exists

1. **Preserves complete commit history** - Every change is traceable
2. **Shows branch/merge pattern in git graph** - Visual traceability
3. **Allows easy identification of feature branches** - Clear development flow
4. **Matches existing repository merge patterns** - Consistency
5. **Enables easy rollback** - Each commit can be individually reverted
