<script lang="ts">
  import { onMount } from 'svelte';
  import { GitHubOAuth, type GitHubUser } from '../lib/github-oauth';

  export let onAuthChange: (token: string | null) => void = () => {};

  let user: GitHubUser | null = null;
  let showDeviceFlow = false;
  let userCode = '';
  let verificationUri = '';
  let polling = false;

  onMount(() => {
    // Check if user is already authenticated
    const token = GitHubOAuth.getToken();
    if (token) {
      user = GitHubOAuth.getStoredUser();
      onAuthChange(token);
    }
  });

  async function handleDeviceFlow() {
    try {
      showDeviceFlow = true;
      const result = await GitHubOAuth.loginWithDeviceFlow();
      userCode = result.user_code;
      verificationUri = result.verification_uri;

      // Open verification URL in new tab
      window.open(verificationUri, '_blank');

      // Start polling for completion
      polling = true;
      const deviceCode = userCode; // Store before it might change

      try {
        const token = await GitHubOAuth.pollDeviceFlow(deviceCode);
        user = GitHubOAuth.getStoredUser();
        showDeviceFlow = false;
        polling = false;
        onAuthChange(token);
      } catch (error: any) {
        alert(`Authentication failed: ${error.message}`);
        showDeviceFlow = false;
        polling = false;
      }
    } catch (error: any) {
      alert(`Failed to start authentication: ${error.message}`);
      showDeviceFlow = false;
    }
  }

  function handleLogout() {
    GitHubOAuth.logout();
    user = null;
    onAuthChange(null);
  }

  function copyCode() {
    navigator.clipboard.writeText(userCode);
  }
</script>

<div class="github-auth">
  {#if user}
    <!-- Authenticated state -->
    <div class="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
      <img src={user.avatar_url} alt={user.login} class="w-10 h-10 rounded-full" />
      <div class="flex-1">
        <p class="font-semibold text-dark">{user.name || user.login}</p>
        <p class="text-xs text-secondary">Authenticated with GitHub</p>
      </div>
      <button
        on:click={handleLogout}
        class="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
      >
        Sign Out
      </button>
    </div>
  {:else if showDeviceFlow}
    <!-- Device flow in progress -->
    <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 class="font-semibold text-dark mb-2">Authenticate with GitHub</h3>
      <p class="text-sm text-secondary mb-3">
        {#if polling}
          Waiting for authentication... You can close the GitHub tab once you've authorized the app.
        {:else}
          Copy the code below and click "Open GitHub" to complete authentication:
        {/if}
      </p>

      <div class="flex items-center gap-2 mb-3">
        <code class="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-lg font-mono font-bold text-center">
          {userCode}
        </code>
        <button
          on:click={copyCode}
          class="px-3 py-2 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          title="Copy code"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      <a
        href={verificationUri}
        target="_blank"
        rel="noopener noreferrer"
        class="block w-full text-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Open GitHub to Authorize
      </a>

      {#if polling}
        <div class="flex items-center justify-center gap-2 mt-3">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <span class="text-sm text-secondary">Waiting for authorization...</span>
        </div>
      {/if}

      <button
        on:click={() => { showDeviceFlow = false; polling = false; }}
        class="w-full mt-2 px-3 py-1 text-sm text-secondary hover:text-dark transition-colors"
      >
        Cancel
      </button>
    </div>
  {:else}
    <!-- Not authenticated -->
    <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <p class="text-sm font-medium text-dark">Sign in with GitHub</p>
          <p class="text-xs text-secondary">Get 5000 requests/hour and faster searches</p>
        </div>
        <button
          on:click={handleDeviceFlow}
          class="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          Sign In
        </button>
      </div>
    </div>
  {/if}
</div>
