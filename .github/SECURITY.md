# Security Policy

## Supported Versions

The following versions of IssueVista are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Preferred Method:** Use GitHub's Security Advisory feature by clicking the "Report a vulnerability" button in the [Security tab](https://github.com/VibeTensor/IssueVista/security/advisories/new).

**Alternative Method:** Email <info@vibetensor.com> with "SECURITY" in the subject line.

### What to Include

When reporting a vulnerability, please provide:

- A clear description of the vulnerability
- Steps to reproduce the issue
- Affected versions
- Potential impact assessment
- Any suggested fixes (optional)

### What to Expect

We will acknowledge receipt of your report and keep you informed of our progress toward a fix.

## Response Timeline

| Severity | Initial Response | Fix Timeline |
| -------- | ---------------- | ------------ |
| Critical | 24 hours         | 24-72 hours  |
| High     | 48 hours         | 1-2 weeks    |
| Medium   | 7 business days  | 2-4 weeks    |
| Low      | 14 business days | Next release |

For Low severity issues, if no release is planned within 30 days, a patch release will be created.

## Scope

### In Scope

- IssueVista web application (issuevista.vibetensor.com)
- GitHub OAuth integration and token handling
- Issue filtering and export functionality
- Client-side data processing

### Out of Scope

- GitHub API vulnerabilities (report to [GitHub Security](https://github.com/security))
- Cloudflare Pages infrastructure (report to Cloudflare)
- Third-party npm dependencies (report to package maintainers)
- Social engineering attacks against users or maintainers
- Denial of service attacks
- Physical security concerns

## Security Measures

IssueVista implements the following security practices:

- **Client-side only**: No server-side data collection or storage
- **Token storage**: GitHub OAuth tokens are stored in browser localStorage for session persistence. While convenient, localStorage is accessible to JavaScript and could be vulnerable to XSS attacks. We mitigate this through Content Security Policy headers, minimal OAuth scopes, and short-lived tokens. For enhanced security, consider clearing tokens after each session.
- **Open source**: Fully auditable codebase
- **TypeScript**: Type safety to prevent common vulnerabilities
- **Regular updates**: Dependency updates via Dependabot

## Safe Harbor

We support responsible security research. If you conduct security research in good faith and in accordance with this policy:

- We will not pursue legal action against you
- We will work with you to understand and resolve the issue
- We will credit you in our security acknowledgments (if desired)

To qualify for safe harbor protection, you must:

- Act in good faith and avoid privacy violations
- Not access or modify data beyond what is necessary
- Not disrupt our services or degrade user experience
- Report vulnerabilities promptly and avoid public disclosure until resolved
- Follow our reporting guidelines above

## Questions

For general security questions, please open a [GitHub Discussion](https://github.com/VibeTensor/IssueVista/discussions) or contact <info@vibetensor.com>.

---

**IssueVista** is maintained by [VibeTensor Private Limited](https://github.com/VibeTensor).
