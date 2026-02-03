# SOP Workflow Rules - Complete Implementation Guide

## Document Version: 4.0

This is the authoritative workflow for implementing GitHub issues. Every issue MUST follow these phases. DO NOT skip or combine phases.

**Integrated with:**

- ISO 21502:2020 Project Management Guidance
- PMI PMBOK 7th Edition Agile Practices
- Claude Code Plugins & Skills System
- See `project-management.md` for detailed PM integration

---

## Claude Code Tools & Plugins Reference

### Built-in Tools (Always Available)

| Tool           | Purpose                                               | When to Use                        |
| -------------- | ----------------------------------------------------- | ---------------------------------- |
| **WebSearch**  | Search the internet for documentation, best practices | Research phases, finding solutions |
| **WebFetch**   | Fetch and extract content from specific URLs          | Deep-diving into documentation     |
| **Task**       | Launch specialized agents (Explore, Plan, etc.)       | Codebase exploration, architecture |
| **Glob/Grep**  | Find files and search code                            | Locating files and patterns        |
| **Read/Write** | Read and write files                                  | Code implementation                |
| **Edit**       | Edit existing files                                   | Code modifications                 |
| **Bash**       | Execute shell commands                                | Git, npm, build commands           |

### MCP Tools (Context-Dependent)

| Tool                    | Purpose                              | When to Use                    |
| ----------------------- | ------------------------------------ | ------------------------------ |
| **getDiagnostics**      | Check IDE for TypeScript/lint errors | Before committing, after edits |
| **executeCode**         | Run Python in Jupyter kernel         | Data analysis, quick tests     |
| **ms365-outlook/gmail** | Email integration                    | Communication tasks            |

### Claude Code Skills (Available in This Project)

The following skills are available and should be used when applicable:

| Skill                               | Trigger            | Purpose                                            | When to Use                   |
| ----------------------------------- | ------------------ | -------------------------------------------------- | ----------------------------- |
| **code-review:code-review**         | `/code-review`     | Code review for pull requests                      | After creating PR, for review |
| **feature-dev:feature-dev**         | `/feature-dev`     | Guided feature development with architecture focus | Starting new features         |
| **frontend-design:frontend-design** | `/frontend-design` | Create production-grade frontend interfaces        | Building UI components, pages |

**How to Use Skills:**

1. **Slash Command**: Type `/skill-name` to invoke directly
2. **Automatic**: Skills auto-invoke based on task context
3. **Skill Tool**: Use `Skill` tool with skill name parameter

**Example Usage:**

```bash
# For PR code review
/code-review

# For feature development with architecture
/feature-dev

# For frontend UI work
/frontend-design
```

### Claude Code Plugins (Custom Extensions)

Plugins extend Claude Code with:

- **Slash Commands**: Custom commands (e.g., `/my-plugin:hello`)
- **Agent Skills**: Auto-invoked capabilities based on task context
- **Hooks**: Event handlers for tool calls
- **MCP/LSP Servers**: External tool integrations

**To create custom plugins:**

```bash
claude --plugin-dir ./my-plugin
```

## Auto-Continue Rule (LIMITED APPLICATION)

**IMPORTANT:** The auto-continue rule ONLY applies to non-blocking tasks, NOT user approvals.

**For non-approval tasks:** If the user does not respond for more than 7 minutes:

1. Continue with research, web searches, documentation
2. Keep working on the current phase

**For user approvals (BLOCKING):** You MUST wait for explicit user approval. NO auto-continue for phase approvals. See "Mandatory User Approval Gate" section below.

## Pre-Implementation Phase (Steps 0-4)

### Step 0: Project Management Pre-Checks (MANDATORY)

See `project-management.md` for detailed commands.

#### 0A. Verify Issue in Project Board

```bash
gh issue view <ISSUE_NUMBER> --json projectItems --jq '.projectItems'
```

**Required Fields Must Be Set:**

- [ ] Status = "Todo"
- [ ] Sprint assigned (current or planned)
- [ ] Priority (P0-P3)
- [ ] Epic (feature category)
- [ ] Story Points (1, 3, 5, 8, or 13)

#### 0B. Check Sprint Alignment

```bash
gh api repos/VibeTensor/IssueVista/milestones --jq '.[] | select(.state=="open") | {title, due_on}'
```

- [ ] Issue milestone matches current sprint
- [ ] Priority aligns with sprint goals

#### 0C. Risk Assessment (Complex Issues Only)

For issues with Story Points >= 8:

- Check `.github/RISK_REGISTER.md` for related risks
- Note mitigation strategies in research file

#### 0D. Update Status to "In Progress"

```bash
gh project item-edit --project-id PVT_kwDON8nFv84A6eQg --id <ITEM_ID> \
  --field-id PVTSSF_lADOCOaJzs4A6eQgzgqFXZA --single-select-option-id f75ad846
```

---

### Step 1: Read Issue Description

```bash
gh issue view <ISSUE_NUMBER> --repo VibeTensor/IssueVista
```

Actions:

- Read the full issue description
- Identify acceptance criteria
- Note specific requirements or constraints
- Identify related issues or dependencies

### Step 2: Read CodeRabbit Comments on Issue Thread

```bash
gh api repos/VibeTensor/IssueVista/issues/<ISSUE_NUMBER>/comments \
  --jq '.[] | {user: .user.login, body: .body}'
```

Actions:

- Check for CodeRabbit's automated analysis
- Note suggestions and implementation recommendations
- Identify related issues suggested
- Document all findings in `issue_XX_research.txt`

### Step 3: Research Using Claude Tools & Web Search (5-10 Searches)

**Use ALL available research tools:**

#### 3A. Claude Built-in Tools (MANDATORY)

- **WebSearch**: Search for documentation, best practices, similar implementations
- **WebFetch**: Fetch specific documentation pages, API references, tutorials
- **Task (Explore agent)**: Explore codebase patterns and similar implementations
- **getDiagnostics (IDE)**: Check for existing code issues before implementing

#### 3B. Web Search Categories (5-10 searches):

- Official documentation (1-2 searches)
- Best practices guides (1-2 searches)
- Similar implementations (1-2 searches)
- Security considerations (1 search)
- Performance optimizations (1 search)
- Edge cases/pitfalls (1 search as needed)

#### 3C. WebFetch for Documentation

When you find relevant URLs, use WebFetch to extract key information:

```text
Examples:
- WebFetch official API docs for detailed method signatures
- WebFetch library documentation for configuration options
- WebFetch tutorial pages for implementation patterns
```

Create research file immediately: `.internal/research/issue_XX_research.txt`

### Step 4: Create 9-Phase Implementation Plan (MANDATORY)

CRITICAL: You MUST create a 9-phase plan for EVERY issue. This is NON-NEGOTIABLE.

```text
Phase 1: Setup & Branch Creation
Phase 2: Research & Audit Existing Code
Phase 3: Identify Affected Files/Components
Phase 4: Design Implementation Approach
Phase 5: Core Implementation
Phase 6: Additional Features/Automation (if needed)
Phase 7: Update Documentation
Phase 8: Commit & Push
Phase 9: Create PR & Review
```

FAILURE TO CREATE 9-PHASE PLAN = IMPLEMENTATION REJECTED

## Implementation Phase (9 Phases)

### For Each Phase, Follow A-D Cycle:

#### A. Pre-Phase: Mandatory Research (Claude Tools + Web Search)

CRITICAL: This step is NON-NEGOTIABLE. Research MUST be performed before EVERY phase using ALL available tools.

**Research Tools to Use:**

| Tool           | When to Use                                         | Example                                       |
| -------------- | --------------------------------------------------- | --------------------------------------------- |
| WebSearch      | Find documentation, best practices, patterns        | "D3.js force graph Svelte 5 integration 2026" |
| WebFetch       | Extract detailed info from specific URLs            | Fetch d3js.org API docs for zoom behavior     |
| Task/Explore   | Find similar code patterns in current codebase      | "How are other visualizations implemented?"   |
| getDiagnostics | Check existing TypeScript/lint issues before coding | Check IDE for pre-existing errors             |
| Read           | Study existing code files for patterns              | Read similar components for conventions       |

**Search Requirements by Complexity (MINIMUM 5 PER PHASE):**

| Complexity        | Searches Per Phase | Total (9 Phases) | Example Issues               |
| ----------------- | ------------------ | ---------------- | ---------------------------- |
| Simple (1-3 SP)   | 5 searches minimum | 45 total minimum | Single file, docs, labels    |
| Medium (5 SP)     | 5-7 searches       | 45-63 total      | New component, multi-file    |
| Complex (8-13 SP) | 7-10 searches      | 63-90 total      | Major features, architecture |

**CRITICAL: No phase may have fewer than 5 research actions (WebSearch + WebFetch + Explore combined).**

**Before EVERY Phase:**

1. Identify what information you need for the phase
2. Use appropriate Claude tools:
   - **WebSearch**: For broad discovery and finding relevant resources
   - **WebFetch**: For deep-diving into specific documentation URLs
   - **Task (Explore)**: For finding patterns in the codebase
   - **getDiagnostics**: For checking IDE-level issues
3. Document ALL research in `issue_XX_research.txt`:
   - Tool used (WebSearch/WebFetch/Explore/getDiagnostics)
   - Query or URL used
   - Key insights extracted

**Research Categories Per Phase:**

| Phase                    | Required Research Topics                        | Tools to Use              |
| ------------------------ | ----------------------------------------------- | ------------------------- |
| Phase 1 (Setup)          | Git branching, naming conventions               | WebSearch, Read           |
| Phase 2 (Research)       | Existing patterns in codebase                   | Explore, Read, WebSearch  |
| Phase 3 (Identify Files) | File structure patterns, component organization | Explore, Glob, WebSearch  |
| Phase 4 (Design)         | Architecture patterns, best practices           | WebSearch, WebFetch       |
| Phase 5 (Core)           | Implementation patterns, edge cases, security   | WebSearch, WebFetch, Read |
| Phase 6 (Additional)     | Testing patterns, automation                    | WebSearch, getDiagnostics |
| Phase 7 (Docs)           | Documentation standards, examples               | WebSearch, WebFetch       |
| Phase 8 (Commit)         | Commit message conventions                      | Read (git log), WebSearch |
| Phase 9 (PR)             | PR best practices, review process               | WebSearch                 |

**Thorough Thinking Requirement:**

- Analyze all resources critically
- Compare different approaches found
- Identify consensus patterns
- Note conflicts or trade-offs
- Document rationale for final decision

**FAILURE TO PERFORM RESEARCH = PHASE NOT COMPLETE**

#### B. Execute Phase

- Follow coding standards (see `coding-standards.md`)
- Write clean, maintainable code
- Avoid over-engineering
- Keep changes focused on issue requirements

#### C. Document Phase Findings

Update research document with:

- Phase number and title
- Web searches performed
- Commands used
- Issues encountered and solutions
- Files modified

#### C2. Mid-Implementation PM Check (After Phase 5 Only)

After completing Phase 5 (Core Implementation):

1. **Verify estimate accuracy:**
   - Still on track for original story point estimate?
   - If > 50% over estimate, consider splitting issue

2. **Risk check:**
   - Any new risks identified?
   - Update `.github/RISK_REGISTER.md` if needed

3. **Scope change detection:**
   - If scope expanded, document in research file
   - Update story points if estimate was significantly wrong

#### D. Post-Phase: User Confirmation

After completing each phase:

- Present summary of changes made
- Show relevant code snippets or file changes
- Ask user to visually review the changes
- Wait for explicit confirmation: "Proceed to next phase"

**NO AUTO-CONTINUE FOR APPROVALS.** You MUST wait for user approval before proceeding.

Example prompt:

```
"Phase X complete. Changes made:
 - [List of changes]
 Research document updated.
 Web searches performed: [list 5+ searches]
 Project board updated: Yes

 Please review and reply 'approved' to proceed to Phase X+1."
```

---

## MANDATORY USER APPROVAL GATE (After Every Phase)

**BLOCKING REQUIREMENT:** You MUST get explicit user approval before proceeding to the next phase.

### Approval Request Format:

1. Present complete summary of phase work
2. List ALL web searches performed (minimum 5) with findings
3. Show all files modified with code snippets
4. Show research document updates
5. Confirm project board was updated
6. ASK: "Please review Phase X. Reply 'approved' or provide feedback."
7. WAIT for user response (NO auto-continue)

### If User Provides Feedback:

- Address ALL feedback points
- Re-present for approval
- Repeat until user says "approved"

**VIOLATION OF APPROVAL GATE = RESTART FROM PHASE 1**

---

## Mandatory Phase Cooldown (10 Minutes Minimum)

After completing each phase AND receiving user approval:

1. Record phase completion timestamp
2. WAIT minimum 10 minutes before starting next phase
3. Use cooldown time for:
   - Reviewing phase outputs
   - Updating project board
   - Preparing for next phase web searches
   - Updating research documentation

### Cooldown Format in Research Document:

```
Phase X Completed: YYYY-MM-DD HH:MM
User Approval Received: YYYY-MM-DD HH:MM
Cooldown Started: YYYY-MM-DD HH:MM
Next Phase Started: YYYY-MM-DD HH:MM (must be >= 10 min after approval)
```

**NO EXCEPTIONS to the 10-minute cooldown rule.**

---

## Project Board Phase Tracking (ISO 21502 Compliance)

Update GitHub Project board at EACH phase transition:

| Phase   | Status Field Value | Notes Field Update                       |
| ------- | ------------------ | ---------------------------------------- |
| Phase 1 | In Progress        | "Phase 1/9: Branch created"              |
| Phase 2 | In Progress        | "Phase 2/9: Code audit complete"         |
| Phase 3 | In Progress        | "Phase 3/9: Files identified"            |
| Phase 4 | In Progress        | "Phase 4/9: Design complete"             |
| Phase 5 | In Progress        | "Phase 5/9: Core implementation done"    |
| Phase 6 | In Progress        | "Phase 6/9: Additional features done"    |
| Phase 7 | In Progress        | "Phase 7/9: Documentation updated"       |
| Phase 8 | In Progress        | "Phase 8/9: Committed and pushed"        |
| Phase 9 | In Review          | "Phase 9/9: PR created, awaiting review" |

### Command Template:

```bash
gh api graphql -f query='
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "PVT_kwDODnRjuc4BLSUM"
    itemId: "<ITEM_ID>"
    fieldId: "<NOTES_FIELD_ID>"
    value: { text: "Phase X/9: [description]" }
  }) { projectV2Item { id } }
}'
```

**FAILURE TO UPDATE PROJECT BOARD = SOP VIOLATION**

---

## Research Document Format (ISO 21502:2020 / PMI PMBOK Compliant)

File: `.internal/research/issue_XX_research.txt`

### Required Document Structure:

```
================================================================================
ISSUE #XX RESEARCH DOCUMENT
================================================================================
Title: [Issue Title]
Type: [FEATURE|FIX|CHORE|DOCS|REFACTOR|TEST]
Author: @ascender1729
Created: YYYY-MM-DD HH:MM
Last Updated: YYYY-MM-DD HH:MM

================================================================================
1. PROJECT MANAGEMENT CONTEXT (ISO 21502:2020 Section 5.2)
================================================================================

1.1 Stakeholder Analysis:
    - Primary: @ascender1729 (Developer/Maintainer)
    - Secondary: [Other stakeholders if any]

1.2 Risk Assessment:
    - Technical Risks: [List]
    - Schedule Risks: [List]
    - Mitigation Strategies: [List]

1.3 Resource Allocation:
    - Estimated Story Points: X
    - Estimated Duration: X hours
    - Actual Duration: X hours (updated post-completion)

================================================================================
2. PHASE EXECUTION LOG (PMI PMBOK 7th Edition - Agile Practices)
================================================================================

PHASE 1: Setup & Branch Creation
---------------------------------
Started: YYYY-MM-DD HH:MM
Completed: YYYY-MM-DD HH:MM
Duration: XX minutes

Research Actions (Minimum 5 - using WebSearch, WebFetch, Explore, getDiagnostics):
1. Tool: [WebSearch/WebFetch/Explore/getDiagnostics/Read]
   Query/URL: "[exact query or URL]"
   Finding: [key insight]

2. Tool: [WebSearch/WebFetch/Explore/getDiagnostics/Read]
   Query/URL: "[exact query or URL]"
   Finding: [key insight]

[Continue for all 5+ research actions]

Implementation Summary:
- Actions taken: [list]
- Files created/modified: [list]
- Commands executed: [list]

User Approval:
- Requested: YYYY-MM-DD HH:MM
- Approved: YYYY-MM-DD HH:MM
- Feedback: [if any]

Project Board Updated: Yes/No
Cooldown Period: [10 minutes observed]
Next Phase Start: YYYY-MM-DD HH:MM

[REPEAT STRUCTURE FOR ALL 9 PHASES]

================================================================================
3. QUALITY METRICS (ISO 21502:2020 Section 6.3)
================================================================================

- Total Research Actions: XX (Minimum 45 for 9 phases)
  - WebSearch: XX
  - WebFetch: XX
  - Task/Explore: XX
  - getDiagnostics: XX
  - Read (code study): XX
- All Phases Completed: Yes/No
- User Approvals Received: X/9
- Cooldowns Observed: X/9
- Build Status: Pass/Fail
- Lint Status: 0 errors, X warnings
- Test Status: Pass/Fail

================================================================================
4. LESSONS LEARNED (PMI PMBOK - Retrospective)
================================================================================

What Went Well:
- [List items]

What Could Be Improved:
- [List items]

Action Items for Future Issues:
- [List items]

================================================================================
```

---

## SOP Violation Policy

### Automatic Restart Required If:

1. Web searches < 5 per phase
2. User approval skipped for any phase
3. Research document not updated after phase
4. 9-phase plan not created before implementation
5. Phase steps executed out of order
6. Phase cooldown not observed (< 10 minutes between phases)
7. Project board not updated at phase transitions

### Violation Detection:

- Self-check at each phase completion
- User can flag violations at any time
- Research document audit reveals missing entries

### Restart Procedure:

1. **Acknowledge violation explicitly** to user:

   ```text
   "I deviated from SOP by [specific violation].
   Reverting changes and restarting from Step 0."
   ```

2. **Revert all uncommitted changes:**

   ```bash
   git checkout -- .
   ```

3. **Delete feature branch if created:**

   ```bash
   git checkout master
   git branch -D <branch-name>
   ```

4. **Return to master branch:**

   ```bash
   git checkout master
   git pull origin master
   ```

5. **Restart from Step 0** (PM Pre-Checks)

### Partial Restart (Minor Violations):

For minor violations (e.g., only 4 searches instead of 5):

1. Acknowledge the specific violation
2. Complete the missing requirement immediately
3. Continue from current phase (no full restart)
4. Document the violation and correction in research file

### SOP Violation Log:

Track all violations in research document:

```
================================================================================
SOP VIOLATIONS (If Any)
================================================================================
Violation 1:
- Phase: X
- Type: [Web searches | Approval | Documentation | Cooldown | Board]
- Description: [What was missing]
- Corrective Action: [What was done to fix]
- Timestamp: YYYY-MM-DD HH:MM
```

**ZERO TOLERANCE for skipping user approvals.** This always requires full restart.

---

## Post-Implementation Phase (Steps 5-6)

### Step 5: Final Confirmation Check

Before creating PR, verify:

- [ ] All 9 phases completed
- [ ] All user confirmations received
- [ ] Code follows repository standards
- [ ] No security vulnerabilities introduced
- [ ] Documentation updated (if required)
- [ ] All files properly staged

Commands:

```bash
git status
git diff --staged
```

Ask user: "All phases complete. Ready to create PR? Please confirm."

### Step 6: Create Pull Request

```bash
# Stage and commit
git add <files>
git commit -m "[TYPE] Description (#ISSUE_NUMBER)"

# Push branch
git push -u origin <branch-name>

# Create PR
gh pr create --title "[TYPE] Title (#ISSUE_NUMBER)" --body "$(cat <<'EOF'
## Summary
- [Bullet points of changes]

## Test Plan
- [ ] Test item 1
- [ ] Test item 2

Closes #ISSUE_NUMBER
EOF
)"
```

## PR Review Phase (Steps 7-11)

### Step 7: Wait for CI Checks

```bash
gh pr checks <PR_NUMBER> --repo VibeTensor/IssueVista --watch
```

Do NOT proceed until all checks pass.

### Step 8: Handle CodeRabbit Review

See `coderabbit.md` for detailed review handling.

### Step 9: Iterate Until CodeRabbit Satisfied

Repeat cycle:

1. Implement fixes based on feedback
2. Commit: `git commit -m "fix: Address CodeRabbit review - [description]"`
3. Push: `git push origin <branch-name>`
4. Wait for new CI checks
5. Check for new review
6. Repeat until: "Actionable comments: 0"

### Step 10: User Final Confirmation

Before merging, confirm with user:

- Show final PR state
- Show all checks passed
- Show CodeRabbit approval
- Ask: "Ready to merge?"

### Step 11: Merge PR

See `merge-policy.md` for mandatory merge requirements.

```bash
gh pr merge <PR_NUMBER> --merge --delete-branch
```

## Post-Merge Phase (Steps 12-16)

See `post-merge.md` for complete post-merge workflow.

### Step 12: Sync Local Repository

```bash
git checkout master
git pull origin master
git log --oneline --graph -10
```

### Step 13: Video Recording & Uplift Tracker Data

- Confirm video recording is turned off
- Collect video link and duration
- Provide complete Uplift Tracker data

### Step 14: Update Uplift Tracker

- Fill all 6 required fields
- Click "Finish Issue"

### Step 15: Update Earnings Tracker CSV

File: `.internal/trackers/december_2025_earnings_tracker.csv`

### Step 16: Create Research Document

Document all learnings, commands used, and statistics.

## Complexity Assessment

| Complexity | Phases | Time     | Examples                     |
| ---------- | ------ | -------- | ---------------------------- |
| Simple     | 1-3    | ~30min   | Docs, labels, single file    |
| Medium     | 5-7    | ~60min   | New component, multi-file    |
| Complex    | 9      | ~120+min | Major features, architecture |

## Quick Reference Checklists

### Pre-Implementation (PM + Technical)

**Project Management (Step 0):**

- [ ] Verify issue in project board with all fields set
- [ ] Check sprint alignment and milestone
- [ ] Risk assessment (for complex issues)
- [ ] Update status to "In Progress"

**Technical (Steps 1-4):**

- [ ] Read issue description
- [ ] Read ALL CodeRabbit issue thread comments
- [ ] Document suggestions in research file
- [ ] Research using Claude tools (WebSearch, WebFetch, Explore, getDiagnostics)
- [ ] Web search (5-10 searches total)
- [ ] Create 9-phase plan
- [ ] Start video recording
- [ ] Start time tracking

### Each Phase

- [ ] Research (minimum 5 actions using WebSearch/WebFetch/Explore/getDiagnostics/Read)
- [ ] Implement
- [ ] Document in research file (tool used, query, finding)
- [ ] Update project board with phase progress
- [ ] User approval received (BLOCKING - no auto-continue)
- [ ] 10-minute cooldown observed before next phase

### Pre-PR

- [ ] All 9 phases complete
- [ ] `npm run build` passes
- [ ] `npm test` passes
- [ ] User final confirmation

### PR Review

- [ ] CI checks pass
- [ ] All CodeRabbit comments addressed
- [ ] "Actionable comments: 0"
- [ ] User merge confirmation
- [ ] Merged with `--merge` (NEVER `--squash`)

### Post-Merge

**Git & Video:**

- [ ] Local repo synced
- [ ] Git graph verified (branch/merge pattern)
- [ ] Video recording confirmed off

**Trackers:**

- [ ] Uplift Tracker updated (6/6 fields)
- [ ] Earnings tracker CSV updated
- [ ] Research file complete

**Project Management (ISO 21502/PMI):**

- [ ] Project board status = "Done" (auto-updated via workflow)
- [ ] Lessons learned added (if applicable) - `.github/LESSONS_LEARNED.md`
- [ ] Risk register updated (if new risks found) - `.github/RISK_REGISTER.md`
- [ ] Sprint metrics tracked (velocity, completion)
