# Deployment

IssueFlow is hosted on Cloudflare Pages with automatic deployments.

## How It Works

- **Pull Requests**: Get automatic preview deployments
- **Merge to master**: Automatically deploys to production at [issueflow.pages.dev](https://issueflow.pages.dev)

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Build Settings (Cloudflare Pages)

```
Framework preset: Astro
Build command: npm run build
Build output directory: dist
Node.js version: 18
```

## Environment Variables (Optional)

To enable GitHub OAuth Device Flow:

1. Create a GitHub OAuth App at https://github.com/settings/developers
2. Set `PUBLIC_GITHUB_CLIENT_ID` in Cloudflare Pages environment variables

**Note:** OAuth is optional. The app works without it using personal access tokens.
