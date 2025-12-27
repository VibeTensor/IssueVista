# Post-Merge Rules

## Document Version: 2.0

After every PR merge, these steps are MANDATORY. Do NOT skip any step.

**Integrated with:**

- ISO 21502:2020 Project Management Guidance
- PMI PMBOK 7th Edition Agile Practices
- See `project-management.md` for detailed PM integration

---

## Step 12: Sync Local Repository

```bash
git checkout master
git pull origin master
git log --oneline --graph -10
```

### CRITICAL: Verify Branch/Merge Pattern

Expected pattern (CORRECT - used --merge):

```text
*   abc1234 Merge pull request #XX from VibeTensor/branch-name
|\
| * def5678 commit message
|/
* previous-commit
```

Wrong pattern (INCORRECT - used --squash):

```text
* abc1234 commit message (#XX)
* previous-commit
```

If you see the wrong pattern:

- The merge was done with `--squash` instead of `--merge`
- Follow recovery steps in `merge-policy.md`

---

## Step 13: Video Recording & Uplift Tracker Data (MANDATORY)

### Actions:

1. Ask user: "Is the video recording turned off?"
2. Wait for explicit confirmation that recording has stopped
3. Once confirmed off, ask user for:
   - Video link (e.g., Loom URL)
   - Video duration (in minutes)
4. Gather all issue-related links

### Prompt Template:

```
"The PR has been merged successfully!

 Is your video recording turned off?

 Once confirmed, please provide:
 - Video link (Loom/other URL)
 - Video duration (in minutes)"
```

### Gather Links Using Commands:

```bash
# Get PR commits
gh pr view <PR_NUMBER> --json commits --jq '.commits[].oid'

# Get issue title
gh issue view <ISSUE_NUMBER> --json title --jq '.title'
```

### Provide Uplift Tracker Data (COPY-PASTE READY):

```text
----------------------------------------------------------------
UPLIFT TRACKER SUBMISSION DATA - Issue #XX
----------------------------------------------------------------

VIDEO TITLE (1 title per recording):
[Your Name] | IssueFlow Issue #XX | [Issue Title] ([duration]min)

PR/COMMIT LINKS (one per line, no prefixes, no spaces):
https://github.com/VibeTensor/IssueFlow/pull/YY
https://github.com/VibeTensor/IssueFlow/commit/<sha1>
https://github.com/VibeTensor/IssueFlow/commit/<sha2>

SCREEN RECORDING LINKS (one per line, no prefixes):
https://www.loom.com/share/xxxxx

INITIAL IMPLEMENTATION TIME: [video duration] minutes
POST REVIEW TIME: [time spent on review fixes, 0 if none] minutes
EST. TIME IF AI-DISALLOWED: [from tracker estimate] minutes
PERCEIVED EFFORT: [1-5 rating]
----------------------------------------------------------------
```

### IMPORTANT Format Rules:

- NO bullet points or dashes before links
- NO spaces before links
- Each link on its own line
- Number of video titles = Number of video recording links
- Links must be clean HTTPS URLs only

---

## Step 14: Update Uplift Tracker (MANDATORY)

### Actions:

1. Navigate to Uplift Issue Tracker
2. Find the issue in the list and click "Edit"
3. Fill in all required fields:
   - PR/Commit Links (one per line, no prefixes)
   - Screen Recording Links (one per line)
   - Initial Implementation Time (minutes to get PR up)
   - Post Review Implementation Time (minutes for review fixes)
   - Estimated Time if AI-disallowed (minutes)
   - Perceived Effort (1-5 rating)
4. Verify Progress shows "6/6 fields"
5. Click "Finish Issue" to mark complete

### Field Definitions:

| Field                       | Description                                 |
| --------------------------- | ------------------------------------------- |
| Initial Implementation Time | Time from start to PR creation              |
| Post Review Time            | Time spent on CodeRabbit/review fixes       |
| Est. if AI-disallowed       | How long without AI (typically 4-7x actual) |
| Perceived Effort            | 1=very easy, 3=average, 5=very hard         |

### Confirmation:

- Wait for user to confirm "Finish Issue" clicked
- Issue should move to "Finished Issues" section
- Verify completion status shows in tracker

---

## Step 15: Update Earnings Tracker CSV (MANDATORY)

### File Location:

`.internal/trackers/december_2025_earnings_tracker.csv`

### Sections to Update:

1. **ISSUES COMPLETED section** - Add new row:

   ```csv
   Issue#,Title,Time(min),Time(hrs),Earnings(USD),Earnings(INR),Date,Effort,PR#
   ```

2. **DECEMBER EARNINGS SUMMARY** - Update totals:
   - Total Issues Completed
   - Total Time Spent (minutes and hours)
   - Total Earned (USD and INR)

3. **PROGRESS TOWARD TARGET** - Update:
   - Earned So Far
   - Remaining to Earn
   - Percentage

4. **ISSUES DETAIL section** - Add new column with:
   - GitHub URL
   - PR URL
   - Loom Recording(s)
   - Initial Time / Review Time / Total Time
   - AI-Allowed, Est. with AI, Est. without AI
   - Status: COMPLETED

### Calculation Formulas:

```text
Time(hrs) = Time(min) / 60
Earnings(USD) = Time(hrs) x 50
Earnings(INR) = Earnings(USD) x 90
Progress % = Earned So Far / Target x 100
```

---

## Step 16: Update Loom Video Title

### Format:

```text
[Your Name] | IssueFlow Issue #XX | [Issue Title] ([total]min)
```

### Example:

```text
Pavan Kumar | IssueFlow Issue #38 | [DOCS] Update README with November 2025 features (81min)
```

---

## Step 17: Verify Project Board Status (ISO 21502)

### Actions:

The project workflow should auto-update status to "Done". Verify:

```bash
# Check issue status in project board
gh project item-list 2 --owner VibeTensor --format json | findstr <ISSUE_NUMBER>
```

**If not auto-updated**, manually update:

```bash
gh project item-edit --project-id PVT_kwDON8nFv84A6eQg --id <ITEM_ID> \
  --field-id PVTSSF_lADOCOaJzs4A6eQgzgqFXZA --single-select-option-id 8e45e91f
```

---

## Step 18: Update Lessons Learned (If Applicable)

### When to Add Entry:

Add entry to `.github/LESSONS_LEARNED.md` if ANY of these occurred:

- Unexpected technical challenge encountered
- New pattern or approach discovered
- Tool or API limitation found
- Process improvement identified
- Estimate significantly different from actual

### Entry Template:

```markdown
### LL-XXX: [Title]

**Date:** YYYY-MM-DD
**Sprint:** Sprint X
**Category:** Technical / Process / Communication / Resource
**Impact:** High / Medium / Low

#### Context

[What was the situation?]

#### What Happened

[Describe the event or outcome]

#### Root Cause

[Why did this happen?]

#### Lesson Learned

[What should be done differently?]

#### Action Items

- [ ] Action 1

#### Applicable To

[Future situations where this applies]
```

---

## Step 19: Update Risk Register (If Applicable)

### When to Update `.github/RISK_REGISTER.md`:

1. **New risk discovered** during implementation
2. **Existing risk mitigated** by this change
3. **Risk escalated** (higher probability or impact)

### Actions:

- Add new risks with full template
- Update status of mitigated risks
- Close resolved risks with closure date

---

## Step 20: Sprint Metrics Update (End of Sprint)

At the end of each sprint, capture:

1. **Velocity**: Total story points completed
2. **Commitment accuracy**: Completed / Committed
3. **Carryover**: Stories moved to next sprint
4. **Sprint goal achievement**: Yes/No

Update in `.github/SPRINT_RETROSPECTIVE.md` using the retrospective template.

---

## Post-Merge Checklist

### Git & Verification (Steps 12)

- [ ] `git pull origin master` completed
- [ ] Git graph shows branch/merge pattern (`|\  | * |/`)
- [ ] If linear pattern visible, merge was done wrong - follow recovery steps

### Video & Trackers (Steps 13-16)

- [ ] Video recording confirmed OFF (ask user)
- [ ] Video link and duration collected from user
- [ ] Complete Uplift Tracker data provided (issue URL, PR URL, commit URLs, video)
- [ ] Uplift Tracker updated with all fields (6/6 required)
- [ ] User clicked "Finish Issue" in Uplift Tracker
- [ ] Issue moved to "Finished Issues" section
- [ ] Loom video title updated with standard format
- [ ] Earnings tracker CSV updated
- [ ] Research file complete

### Project Management - ISO 21502/PMI (Steps 17-20)

- [ ] Project board status verified as "Done"
- [ ] Lessons learned added (if unexpected challenges occurred)
- [ ] Risk register updated (if new risks found or mitigated)
- [ ] Sprint metrics tracked (at end of sprint)
