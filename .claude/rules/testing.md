# Testing Rules

## When to Run Tests

| Phase                               | What to Run     | Purpose                           |
| ----------------------------------- | --------------- | --------------------------------- |
| After Phase 5 (Core Implementation) | Full test suite | Verify implementation works       |
| Before Phase 8 (Commit)             | Build check     | Ensure code compiles              |
| After any CodeRabbit fix            | Affected tests  | Verify fix doesn't break anything |

---

## Commands

### Build Check

```bash
npm run build
```

### Run All Tests

```bash
npm test
```

### Run Unit Tests (Vitest)

```bash
npm run test:unit
```

### Run E2E Tests (Playwright)

```bash
npm run test:e2e
```

### Run Specific Test File

```bash
npm test -- <test-file-name>
```

### Lint Check

```bash
npm run lint
```

### Type Check (TypeScript)

```bash
npx tsc --noEmit
```

### Format Check

```bash
npm run format:check
```

---

## Minimum Requirements Before PR

- [ ] `npm run build` - passes
- [ ] `npm test` - passes (or no regressions)
- [ ] `npm run lint` - 0 errors (warnings allowed)
- [ ] No console errors in browser
- [ ] Feature works as described in issue

---

## Test File Patterns

| Test Type       | File Pattern | Location     |
| --------------- | ------------ | ------------ |
| Unit Tests      | `*.test.ts`  | `tests/`     |
| E2E Tests       | `*.spec.ts`  | `tests/e2e/` |
| Component Tests | `*.test.ts`  | `tests/`     |

---

## Before Every Commit

```bash
# Quick validation
npm run build && npm run lint && npm run format:check
```

---

## CI Check Failures

If CI checks fail after pushing:

1. **Read the failure logs**:

   ```bash
   gh pr checks <PR_NUMBER> --repo VibeTensor/IssueFlow
   ```

2. **Identify the failing check** (build, lint, test, etc.)

3. **Fix locally and test**:

   ```bash
   npm run build      # For build failures
   npm run lint       # For lint failures
   npm test           # For test failures
   ```

4. **Commit fix and push**:

   ```bash
   git add .
   git commit -m "fix: Resolve CI failure - [description]"
   git push origin <branch-name>
   ```

5. **Wait for new CI run**
