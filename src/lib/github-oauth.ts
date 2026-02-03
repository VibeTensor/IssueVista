// GitHub OAuth configuration
const GITHUB_CLIENT_ID = import.meta.env.PUBLIC_GITHUB_CLIENT_ID || '';
const REDIRECT_URI = typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '';

export interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  email: string | null;
}

export class GitHubOAuth {
  /**
   * Initiates the GitHub OAuth flow
   */
  static login(): void {
    if (!GITHUB_CLIENT_ID) {
      console.error('GitHub Client ID not configured');
      alert(
        'GitHub OAuth is not configured. Please set PUBLIC_GITHUB_CLIENT_ID in your .env file.'
      );
      return;
    }

    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: 'public_repo read:user user:email',
      state: this.generateState()
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params}`;
  }

  /**
   * Handle OAuth callback and exchange code for token
   */
  static async handleCallback(code: string, state: string): Promise<string> {
    // Verify state to prevent CSRF attacks
    const savedState = localStorage.getItem('github_oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter');
    }
    localStorage.removeItem('github_oauth_state');

    // For client-side OAuth, we need a backend proxy to exchange the code
    // Since we don't have a backend, we'll use GitHub's device flow instead
    // Or use a service like https://github.com/prose/gatekeeper
    throw new Error('Token exchange requires a backend server. Please use manual token for now.');
  }

  /**
   * Get the currently authenticated user
   */
  static async getUser(token: string): Promise<GitHubUser> {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  }

  /**
   * Logout the user
   */
  static logout(): void {
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
    this.dispatchAuthChange();
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('github_token');
  }

  /**
   * Get stored token
   */
  static getToken(): string | null {
    return localStorage.getItem('github_token');
  }

  /**
   * Get stored user info
   */
  static getStoredUser(): GitHubUser | null {
    const userStr = localStorage.getItem('github_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Save token and user info
   */
  static async saveAuth(token: string): Promise<void> {
    localStorage.setItem('github_token', token);
    this.dispatchAuthChange();

    try {
      const user = await this.getUser(token);
      localStorage.setItem('github_user', JSON.stringify(user));
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    }
  }

  /**
   * Generate random state for CSRF protection
   */
  private static generateState(): string {
    const state = Math.random().toString(36).substring(7);
    localStorage.setItem('github_oauth_state', state);
    return state;
  }

  /**
   * Dispatch custom event for same-tab auth state changes
   * Used by Header component to update auth indicator - Issue #187
   */
  private static dispatchAuthChange(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('issuevista:auth-change'));
    }
  }

  /**
   * Use GitHub Device Flow for authentication (no backend required)
   */
  static async loginWithDeviceFlow(): Promise<{ user_code: string; verification_uri: string }> {
    if (!GITHUB_CLIENT_ID) {
      throw new Error('GitHub Client ID not configured');
    }

    const response = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        scope: 'public_repo read:user user:email'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to initiate device flow');
    }

    const data = await response.json();
    return {
      user_code: data.user_code,
      verification_uri: data.verification_uri
    };
  }

  /**
   * Poll for device flow completion
   */
  static async pollDeviceFlow(deviceCode: string, interval: number = 5000): Promise<string> {
    if (!GITHUB_CLIENT_ID) {
      throw new Error('GitHub Client ID not configured');
    }

    while (true) {
      await new Promise((resolve) => setTimeout(resolve, interval));

      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          device_code: deviceCode,
          grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
        })
      });

      const data = await response.json();

      if (data.access_token) {
        await this.saveAuth(data.access_token);
        return data.access_token;
      }

      if (data.error === 'authorization_pending') {
        continue; // Keep polling
      }

      throw new Error(data.error_description || data.error);
    }
  }
}
