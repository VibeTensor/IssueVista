<!--
  Header Component - Site branding header
  Left: IssueFlow branding with version | Right: GitHub link
  Issue #190 - Redesign header and footer branding
-->

<script lang="ts">
  import { REPO_URL, COMPANY_SHORT } from '../../lib/footer-utils';

  const version = __APP_VERSION__;
</script>

<header class="header" aria-label="Site header">
  <div class="header-row">
    <!-- Left: Branding -->
    <div class="brand-left">
      <span class="product">IssueFlow</span>
      <span class="version">v{version}</span>
      <span class="tagline">Find your first contribution</span>
    </div>

    <!-- Right: GitHub link -->
    <nav class="nav-right" aria-label="Header navigation">
      <a href={REPO_URL} target="_blank" rel="noopener noreferrer" class="nav-link">
        <svg class="nav-icon" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
        GitHub
      </a>
      <a
        href="{REPO_URL}/stargazers"
        target="_blank"
        rel="noopener noreferrer"
        class="nav-link star-link"
        aria-label="Star {COMPANY_SHORT} on GitHub"
      >
        <svg
          class="nav-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
        Star
      </a>
    </nav>
  </div>
</header>

<style>
  .header {
    width: 100%;
    background: #0f172a;
    border-bottom: 1px solid rgba(71, 85, 105, 0.3);
    padding: 0.5rem 1rem;
    position: sticky;
    top: 0;
    z-index: 50;
  }

  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 72rem;
    margin: 0 auto;
    gap: 1rem;
  }

  /* Left: Branding */
  .brand-left {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .product {
    font-size: 0.875rem;
    font-weight: 700;
    color: #5eead4;
  }

  .version {
    font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', monospace;
    font-size: 0.5625rem;
    font-weight: 600;
    color: #14b8a6;
    background: rgba(20, 184, 166, 0.15);
    padding: 0.125rem 0.3125rem;
    border-radius: 0.1875rem;
  }

  .tagline {
    font-size: 0.6875rem;
    color: #64748b;
    font-weight: 400;
    margin-left: 0.25rem;
  }

  /* Right: Navigation */
  .nav-right {
    display: flex;
    align-items: center;
    gap: 0.125rem;
  }

  .nav-link {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    color: #94a3b8;
    text-decoration: none;
    font-size: 0.6875rem;
    font-weight: 500;
    border-radius: 0.25rem;
    transition: color 0.15s ease;
  }

  .nav-link:hover {
    color: #5eead4;
  }

  .nav-icon {
    width: 0.875rem;
    height: 0.875rem;
    flex-shrink: 0;
  }

  .star-link .nav-icon {
    width: 0.75rem;
    height: 0.75rem;
  }

  /* Mobile: Adjust spacing */
  @media (max-width: 640px) {
    .header-row {
      gap: 0.5rem;
    }

    .tagline {
      display: none;
    }

    .brand-left {
      gap: 0.25rem;
    }

    .nav-right {
      gap: 0;
    }

    .nav-link {
      padding: 0.25rem 0.375rem;
      font-size: 0.625rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .nav-link {
      transition: none;
    }
  }
</style>
