# Transcript Management SOP

## Purpose

This document defines procedures for managing AI chat transcripts to maintain privacy and security when sharing with third parties like METR.

---

## About METR Study

### What is METR?

- **Organization**: Model Evaluation and Threat Research (METR)
- **Type**: Nonprofit AI safety research institute (Berkeley, CA)
- **Founded**: December 2023 (spun off from ARC Evals)
- **Focus**: Evaluating frontier AI models for dangerous capabilities

### What METR Collects

| Data Type             | Purpose                                 |
| --------------------- | --------------------------------------- |
| Screen recordings     | Analyze how developers interact with AI |
| Chat transcripts      | Understand AI tool usage patterns       |
| Task completion times | Measure productivity impact             |
| Code changes/PRs      | Evaluate quality of AI-assisted work    |

### How METR Uses Data

- Academic research on AI productivity
- Published papers (e.g., arxiv.org/abs/2507.09089)
- AI safety evaluations
- **NOT for training AI models** (explicit policy)

---

## What to Share vs. NOT Share

### SAFE TO SHARE (Open-Source Work Only)

| Category            | Examples                           | Why Safe                  |
| ------------------- | ---------------------------------- | ------------------------- |
| Code discussions    | "Fix this bug", "Add this feature" | Public repository work    |
| Technical questions | "How does this API work?"          | General knowledge         |
| Error debugging     | "Why is this test failing?"        | Technical, not personal   |
| Documentation       | "Update README", "Add comments"    | Public docs               |
| Git operations      | Commits, PRs, branches             | Public version control    |
| Build/test issues   | "npm run build fails"              | Technical troubleshooting |

### NEVER SHARE (Remove Before Sending)

| Category                  | Examples                                      | Risk Level |
| ------------------------- | --------------------------------------------- | ---------- |
| **Bank/Financial**        | Axis, SBI, ICICI, HDFC, account numbers, IFSC | CRITICAL   |
| **Passwords/Credentials** | API keys, tokens, passwords, PINs, OTPs       | CRITICAL   |
| **Payment Discussions**   | Salary, invoices, payments, USD/INR amounts   | HIGH       |
| **Personal Info**         | Phone, address, Aadhaar, PAN, passport        | CRITICAL   |
| **Business/Partnerships** | Cold emails, client work, NDAs, contracts     | HIGH       |
| **Internal Systems**      | VPN, intranet, admin panels, internal tools   | HIGH       |
| **Disputes/Complaints**   | Payment disputes, salary issues, complaints   | HIGH       |
| **UPI/Banking**           | UPI IDs (@ybl, @paytm), net banking           | CRITICAL   |

---

## Keyword Audit Checklist

### CRITICAL Keywords (Auto-Remove if Found)

```text
BANKS: axis, sbi, icici, kotak, hdfc, pnb, canara, yes bank, idbi,
       bank of baroda, indusind, federal, rbl, bandhan

CREDENTIALS: password, passwd, pin, otp, cvv, api_key, secret,
             token, bearer, jwt, oauth, credential

FINANCIAL: payment, salary, invoice, payroll, money, USD, INR,
           rupee, dollar, wage, compensation, billing, account number

PERSONAL: phone number, address, aadhaar, pan card, passport,
          bank account, credit card, debit card

BUSINESS: partnership, cold email, client, contract, NDA, proposal,
          deal, negotiation, confidential, proprietary

UPI: @ybl, @paytm, @oksbi, @okicici, @okaxis, @okhdfcbank,
     phonepe, gpay, bhim, razorpay
```

### Audit Command (Run Before Every Share)

```bash
cd <transcript-folder>

# Full audit scan
for f in *.jsonl; do
  echo "=== $f ==="
  grep -oci "axis\|sbi\|icici\|kotak\|hdfc\|password\|pin\|otp\|payment\|salary\|invoice\|USD\|INR\|partnership\|cold email\|client\|contract\|NDA\|phone number\|address\|bank account\|api.key\|secret\|token\|confidential\|dispute" "$f" 2>/dev/null
done
```

---

## Chat Separation Strategy

### Recommended: Use Separate Project Folders

```text
D:\Development\opensource\IssueVista\     → Open-source dev ONLY
E:\Personal\                             → Business, finance, personal
D:\Work\ClientName\                      → Client work (NDA)
```

### How Claude Code Stores Transcripts

```text
~/.claude/projects/
├── D--Development-opensource-IssueVista/    → IssueVista chats
├── E--Personal/                            → Personal chats
└── D--Work-ClientName/                     → Client chats
```

**Key Insight**: Claude Code automatically separates transcripts by the folder you run `claude` from.

### Best Practice Going Forward

| Chat Type                 | Folder to Use                         | Can Share? |
| ------------------------- | ------------------------------------- | ---------- |
| IssueVista development     | `D:\Development\opensource\IssueVista` | YES        |
| Payment/salary discussion | `E:\Personal`                         | NO         |
| Partnership outreach      | `E:\Personal`                         | NO         |
| Client work               | `D:\Work\ClientName`                  | NO         |
| Personal queries          | `E:\Personal`                         | NO         |

---

## Pre-Share Audit Procedure

### Step 1: Identify Project Folder

```bash
# Only share IssueVista transcripts
cd ~/.claude/projects/D--Development-opensource-OSS-Collection-IssueVista
```

### Step 2: Filter by Date (Last 30 Days)

```bash
THIRTY_DAYS_AGO=$(date -d "30 days ago" +%s)
for f in *.jsonl; do
  file_time=$(stat -c %Y "$f")
  if [ "$file_time" -gt "$THIRTY_DAYS_AGO" ]; then
    echo "$f"
  fi
done
```

### Step 3: Run Full Security Audit

```bash
# Check for ALL sensitive keywords
for f in *.jsonl; do
  matches=$(grep -oci "axis\|sbi\|icici\|kotak\|hdfc\|password\|pin\|payment\|salary\|invoice\|USD\|INR\|partnership\|cold email\|client\|contract\|NDA\|phone\|address\|bank\|api.key\|secret\|token\|confidential\|dispute" "$f" 2>/dev/null)
  if [ "$matches" -gt 0 ]; then
    echo "REMOVE: $f ($matches matches)"
  else
    echo "SAFE: $f"
  fi
done
```

### Step 4: Remove Flagged Files

```bash
rm -f <flagged-files>
```

### Step 5: Verify Clean

```bash
# Final check - should return nothing
grep -rl "password\|payment\|salary\|bank\|secret" *.jsonl
```

### Step 6: Create Zip

```bash
mkdir -p ~/metr-transcripts/claude-code
cp *.jsonl ~/metr-transcripts/claude-code/
cd ~
zip -r metr-transcripts-wsl.zip metr-transcripts/
```

---

## What NOT to Discuss in Development Chats

### Never Ask in IssueVista Chat:

- "Calculate my earnings for this month"
- "Draft a cold email to this company"
- "Help me with my bank transfer"
- "What's my payment status?"
- "Draft a partnership proposal"
- "Check my invoice details"
- "Help with salary negotiation"

### Safe to Ask in IssueVista Chat:

- "Fix this TypeScript error"
- "How do I implement this feature?"
- "Review this PR"
- "What's the best approach for X?"
- "Help me debug this test"
- "Update the documentation"

---

## Monthly Maintenance

### 1st of Each Month:

1. Review all transcripts in project folders
2. Run security audit on each
3. Archive old transcripts (>90 days)
4. Delete sensitive files permanently

### Archive Command:

```bash
mkdir -p ~/.claude/archives/$(date +%Y-%m)
find ~/.claude/projects/*/ -name "*.jsonl" -mtime +90 -exec mv {} ~/.claude/archives/$(date +%Y-%m)/ \;
```

---

## METR-Specific Checklist

Before sending transcripts to METR:

- [ ] Only IssueVista project folder (open source)
- [ ] Last 30 days only
- [ ] No bank names (Axis, SBI, ICICI, Kotak, HDFC)
- [ ] No passwords/credentials/API keys
- [ ] No payment/salary/invoice discussions
- [ ] No personal info (phone, address, bank accounts)
- [ ] No business/partnership discussions
- [ ] No UPI IDs or payment platforms
- [ ] No disputes or complaints
- [ ] No internal system references
- [ ] Final grep verification passed
- [ ] Zip created with proper naming

---

## All Tools Audit Status

### Data Minimization Principle (GDPR Article 5(1)(c) / ISO 27001)

**CRITICAL**: Only share data that is:

1. **Adequate** - Sufficient for the stated purpose
2. **Relevant** - Directly related to IssueVista development
3. **Limited** - Only from tools actually used for the project

### Tool-by-Tool Security Assessment

| Tool                | Location                                | Used for IssueVista? | Decision           | Reason                                                     |
| ------------------- | --------------------------------------- | ------------------- | ------------------ | ---------------------------------------------------------- |
| **Claude Code**     | `~/.claude/projects/`                   | YES                 | INCLUDE (filtered) | Only tool used for IssueVista, sensitive content removed    |
| **Gemini CLI**      | `~/.gemini/`                            | NO                  | EXCLUDE            | Not used for IssueVista + no transcripts (OAuth creds only) |
| **Codex CLI**       | `~/.codex/`                             | NO                  | EXCLUDE            | Not installed                                              |
| **Cursor**          | `%APPDATA%\Cursor\User\`                | NO                  | EXCLUDE            | Not used for IssueVista (data minimization)                 |
| **VS Code Copilot** | `%APPDATA%\Code\User\workspaceStorage\` | NO                  | EXCLUDE            | Not used for IssueVista (data minimization)                 |

### Audit Results Summary (2026-01-13) - FINAL

**Claude Code (WSL):**

- Total files in source: 162
- Files removed (sensitive): 149
- Clean files included: 13
- Size: 18 KB
- Date range: December 20, 2025 - January 13, 2026 (last 30 days)

**Removal categories:**

- Bank names (Axis, SBI, ICICI, Kotak, HDFC)
- Payment/salary/invoice discussions
- Partnership/contract/NDA references
- Personal information
- USD/INR currency discussions
- Confidential/dispute content
- API/credential references

**All Other Tools:**

- Status: EXCLUDED per Data Minimization Principle
- Reason: Not used for IssueVista project development

---

## Audit Commands by Tool

### Claude Code Audit

```bash
cd ~/.claude/projects/<PROJECT>/
for f in *.jsonl; do
  matches=$(grep -oci "axis bank\|sbi\|icici\|payment\|salary\|password\|secret" "$f")
  [ "$matches" -gt 0 ] && echo "REMOVE: $f" || echo "SAFE: $f"
done
```

### Cursor Audit (Binary DB files)

```bash
cd /c/Users/<USER>/metr-transcripts
for f in cursor-*.vscdb; do
  matches=$(strings "$f" | grep -oci "axis bank\|sbi\|payment\|salary\|password")
  [ "$matches" -gt 0 ] && echo "REMOVE: $f" || echo "SAFE: $f"
done
```

### VS Code Copilot Audit

```bash
cd /c/Users/<USER>/metr-transcripts/copilot-chats
for f in *.json; do
  # Use precise patterns to avoid false positives
  matches=$(grep -oci "axis bank\|sbi bank\|my password\|payment\|salary" "$f")
  [ "$matches" -gt 0 ] && echo "REMOVE: $f" || echo "SAFE: $f"
done
```

---

## Quick Reference

### File Locations

| Item               | Path                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| Claude transcripts | `~/.claude/projects/D--Development-opensource-OSS-Collection-IssueVista/` |
| Clean transcripts  | `~/metr-transcripts/claude-code/`                                        |
| Final submission   | `C:\Users\pavan\metr-transcripts-final.zip`                              |

### Emergency: Accidentally Shared Sensitive Info

1. Contact METR immediately ([info@metr.org](mailto:info@metr.org))
2. Request deletion of specific files
3. Rotate any exposed credentials
4. Update passwords if shared

---

## Sources

- [METR Organization](https://metr.org/)
- [METR AI Productivity Study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- [Study Paper (arXiv)](https://arxiv.org/abs/2507.09089)
- [Participant Experience](https://domenic.me/metr-ai-productivity/)

---

_Document Version: 3.0_
_Created: 2025-01-13_
_Last Updated: 2026-01-13_
_Compliance: GDPR Article 5(1)(c), ISO 27001, Data Minimization Principle_
