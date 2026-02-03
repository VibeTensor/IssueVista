# CodeRabbit Review Rules

## CRITICAL: Two Review Points (BOTH MANDATORY)

CodeRabbit provides automated analysis at TWO points. You MUST check and address ALL comments at BOTH points.

---

## 1. Issue Thread Comments (Pre-Implementation)

**When**: Before starting implementation (Pre-Implementation Phase, Step 2)

**Command**:

```bash
gh api repos/VibeTensor/IssueVista/issues/<ISSUE_NUMBER>/comments \
  --jq '.[] | select(.user.login | contains("coderabbit")) | .body'
```

**What to Check**:

- Related Issues suggested by CodeRabbit
- Suggested Assignees
- Implementation plan suggestions
- Any warnings or considerations raised
- Links to similar issues or patterns

**Actions Required**:

- Document all suggestions in `issue_XX_research.txt`
- Consider related issues for context
- Follow any implementation recommendations
- Note any potential conflicts with other issues

---

## 2. PR Thread Comments (Post-Implementation)

**When**: After creating PR and CodeRabbit review completes (PR Review Phase, Step 8)

**Commands**:

```bash
# Get overall review status and summary
gh api repos/VibeTensor/IssueVista/pulls/<PR_NUMBER>/reviews \
  --jq '.[] | select(.user.login | contains("coderabbit")) | {state: .state, body: .body}'

# Get file-level inline comments (CRITICAL - DO NOT SKIP)
gh api repos/VibeTensor/IssueVista/pulls/<PR_NUMBER>/comments \
  --jq '.[] | select(.user.login | contains("coderabbit")) | {path: .path, line: .line, body: .body}'
```

---

## Comment Severity Handling

| Severity     | Icon   | Required?        | Action                      |
| ------------ | ------ | ---------------- | --------------------------- |
| **Critical** | Red    | YES - MUST FIX   | Fix before merge, blocks PR |
| **Minor**    | Yellow | YES - SHOULD FIX | Affects code quality        |
| **Nitpick**  | Blue   | RECOMMENDED      | Improve readability         |

---

## Actions Required for Each Comment

1. **Read the full comment** including:
   - The issue description
   - The proposed fix (if provided)
   - The AI agent prompt (for automated implementation)

2. **Implement the suggested fix**

3. **Commit with descriptive message**:

   ```bash
   git commit -m "fix: Address CodeRabbit review - [description]"
   ```

4. **Push and wait for new review**

---

## Iteration Process Flowchart

```
+---------------------------------------------+
| 1. Push code to PR                          |
+---------------------------------------------+
                    |
                    v
+---------------------------------------------+
| 2. Wait for CI checks                       |
+---------------------------------------------+
                    |
                    v
+---------------------------------------------+
| 3. Read ALL CodeRabbit comments             |
|    - Review summary (via /reviews API)      |
|    - Inline file comments (via /comments)   |
+---------------------------------------------+
                    |
                    v
+---------------------------------------------+
| 4. Fix ALL actionable comments              |
|    - Critical: MUST fix                     |
|    - Minor: SHOULD fix                      |
|    - Nitpick: Recommended                   |
+---------------------------------------------+
                    |
                    v
+---------------------------------------------+
| 5. Commit fix:                              |
|    git commit -m "fix: Address              |
|    CodeRabbit review - [description]"       |
+---------------------------------------------+
                    |
                    v
+---------------------------------------------+
| 6. Push and wait for new review             |
+---------------------------------------------+
                    |
                    v
        +-------------------+
        | Actionable = 0?   |
        +-------------------+
           |           |
          NO          YES
           |           |
           v           v
    [Go to step 3]  [Ready to merge]
```

---

## Common Mistakes to Avoid

1. **Only checking if "all checks passed"** without reading comments
2. **Ignoring file-level inline comments** (these contain specific fixes!)
3. **Skipping "nitpick" suggestions** that improve readability
4. **Not checking issue thread comments** before starting implementation
5. **Merging before "Actionable comments: 0"**

---

## Pre-Merge Checks (from CodeRabbit Summary)

All 5 must pass:

- [ ] Title check
- [ ] Description check
- [ ] Linked Issues check
- [ ] Out of Scope Changes check
- [ ] Docstring Coverage (>80%)

---

## Why This Is Mandatory

- CodeRabbit catches issues humans miss
- File-level comments contain specific fixes with line numbers
- Ignoring comments leads to technical debt
- Implementing suggestions improves code quality
- Full review coverage ensures production-ready code
