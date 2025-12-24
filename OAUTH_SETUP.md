# GitHub OAuth Setup Guide

This app now supports GitHub OAuth authentication using the **Device Flow**, which works without a backend server!

## Features

### Without Authentication

- ✅ Uses REST API (60 requests/hour)
- ✅ No setup required
- ✅ Works immediately

### With OAuth (Recommended)

- ✅ Uses GraphQL API (5000 requests/hour)
- ✅ Faster performance
- ✅ Better rate limits
- ✅ No manual token management

## How to Enable GitHub OAuth

### Step 1: Create a GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **"New OAuth App"**
3. Fill in the details:
   - **Application name**: `IssueFlow`
   - **Homepage URL**: `http://localhost:4321` (for development) or your production URL
   - **Application description**: `Find unassigned GitHub issues without PRs`
   - **Authorization callback URL**: Leave empty (not needed for device flow)
4. Click **"Register application"**
5. Copy the **Client ID** (you'll need this next)

### Step 2: Configure Your App

1. Create a `.env` file in the project root (copy from `.env.example`):

   ```bash
   cp .env.example .env
   ```

2. Add your GitHub Client ID to `.env`:

   ```
   PUBLIC_GITHUB_CLIENT_ID=your_github_client_id_here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### Step 3: Use the App

1. Open the app in your browser
2. Click **"Sign in with GitHub"**
3. You'll see a code (e.g., `ABCD-1234`)
4. Click **"Open GitHub to Authorize"**
5. Enter the code on GitHub
6. Return to the app - you're authenticated!

## How It Works

This app uses **GitHub's Device Flow OAuth**, which:

- ✅ Works entirely client-side (no backend needed)
- ✅ Doesn't expose client secrets
- ✅ Provides a secure authentication flow
- ✅ Stores tokens only in your browser's localStorage

## Alternative: Manual Token

If you prefer not to set up OAuth, you can still:

1. Generate a [Personal Access Token](https://github.com/settings/tokens/new?description=GitHub%20Issues%20Finder&scopes=public_repo)
2. Paste it in the "Personal Access Token" field
3. Or use the app without any token (limited to 60 requests/hour)

## Security Notes

- Your OAuth app's Client ID is public (safe to commit)
- No Client Secret is needed for device flow
- Tokens are stored locally in your browser only
- The app never sends your token to any server except GitHub

## Production Deployment

For production:

1. Update the **Homepage URL** in your GitHub OAuth app settings to your production domain
2. Set the `PUBLIC_GITHUB_CLIENT_ID` environment variable on your hosting platform
3. Deploy!

## Troubleshooting

**"GitHub OAuth is not configured" error**

- Make sure you've created a `.env` file with `PUBLIC_GITHUB_CLIENT_ID`
- Restart your dev server after adding the `.env` file

**Authentication times out**

- Make sure you entered the code on GitHub within the time limit
- Try signing in again to get a new code

**Rate limit issues**

- Without authentication: 60 requests/hour
- With authentication: 5000 requests/hour
- The app shows your remaining rate limit at the bottom
