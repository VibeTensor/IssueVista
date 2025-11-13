# Deployment Guide

## Quick Deploy to Cloudflare Pages (RECOMMENDED - Free & Fast)

### Why Cloudflare Pages?
- ✅ Unlimited bandwidth
- ✅ Unlimited static requests
- ✅ 500 builds/month
- ✅ Global CDN (fastest performance)
- ✅ Zero cold starts
- ✅ Free SSL/HTTPS
- ✅ Auto-deploy on git push

### Step-by-Step Deployment

1. **Push to GitHub** ✅ (Already done!)
   - Repository: https://github.com/VibeTensor/IssueFlow

2. **Login to Cloudflare**
   - Go to: https://dash.cloudflare.com/
   - Sign up or login (free account)

3. **Create Cloudflare Pages Project**
   - Click "Workers & Pages" in left sidebar
   - Click "Create" → "Pages" → "Connect to Git"
   - Click "Connect GitHub" and authorize Cloudflare
   - Select repository: `VibeTensor/IssueFlow`
   - Click "Begin setup"

4. **Configure Build Settings**
   ```
   Project name: issueflow (or custom name)
   Production branch: main
   Framework preset: Astro
   Build command: npm run build
   Build output directory: dist
   Root directory: lunar-light
   ```

5. **Deploy!**
   - Click "Save and Deploy"
   - Wait 2-3 minutes for first build
   - You'll get a URL like: `https://issueflow.pages.dev`

6. **Custom Domain (Optional)**
   - Go to project → Custom domains
   - Add your domain
   - Update DNS records as instructed

### Auto-Deployment
Every push to `main` branch automatically triggers a new deployment!

---

## Alternative: Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd lunar-light
   vercel
   ```

3. Follow prompts:
   - Link to existing project? No
   - Project name: git-issues-finder
   - Directory: ./
   - Build command: npm run build
   - Output directory: dist

4. Production deploy:
   ```bash
   vercel --prod
   ```

**Vercel Free Tier:**
- 100 GB bandwidth/month
- 6,000 build minutes/month
- Automatic HTTPS
- Auto-deploy on git push

---

## Alternative: Deploy to Netlify

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Build:
   ```bash
   cd lunar-light
   npm run build
   ```

3. Deploy:
   ```bash
   netlify deploy --prod
   ```

4. Follow prompts:
   - Create new site
   - Deploy path: dist

**Netlify Free Tier:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Forms & Identity features
- Auto-deploy on git push

---

## Manual Deploy (Any Static Host)

1. Build locally:
   ```bash
   cd lunar-light
   npm run build
   ```

2. Upload `/dist` folder to any static host:
   - GitHub Pages
   - Firebase Hosting
   - AWS S3 + CloudFront
   - Azure Static Web Apps
   - DigitalOcean App Platform

---

## Environment Variables

### Optional: GitHub OAuth Configuration

To enable GitHub OAuth Device Flow (recommended for best user experience):

1. **Create GitHub OAuth App** (see [OAUTH_SETUP.md](./OAUTH_SETUP.md))
   - Go to: https://github.com/settings/developers
   - Click "New OAuth App"
   - Fill in details (Homepage URL: your deployed URL)
   - Copy the Client ID

2. **Set Environment Variable on Platform**

   **Cloudflare Pages:**
   - Go to project → Settings → Environment variables
   - Click "Add variable"
   - Name: `PUBLIC_GITHUB_CLIENT_ID`
   - Value: `your_github_client_id`
   - Environment: Production
   - Click "Save" and redeploy

   **Vercel:**
   - Go to project → Settings → Environment Variables
   - Name: `PUBLIC_GITHUB_CLIENT_ID`
   - Value: `your_github_client_id`
   - Click "Save" and redeploy

   **Netlify:**
   - Go to Site settings → Environment variables
   - Click "Add a variable"
   - Key: `PUBLIC_GITHUB_CLIENT_ID`
   - Value: `your_github_client_id`
   - Click "Save" and redeploy

**Note:** OAuth is completely optional! The app works without it:
- **Without OAuth**: Users can use personal access tokens or no authentication (60 req/hour)
- **With OAuth**: Users can sign in with GitHub for better rate limits (5000 req/hour)

---

## Build Verification

Before deploying, verify locally:

```bash
# Build
npm run build

# Preview production build
npm run preview
```

Visit: http://localhost:4321

---

## Troubleshooting

### Build fails on Cloudflare/Vercel/Netlify

**Issue:** Node version mismatch

**Solution:** Add to root directory:
```bash
echo "18" > .nvmrc
```

Or set in build settings:
- Cloudflare: Environment variables → `NODE_VERSION = 18`
- Vercel: Settings → Environment Variables → `NODE_VERSION = 18`
- Netlify: Build settings → Environment → `NODE_VERSION = 18`

### Build succeeds but app doesn't work

**Issue:** Missing dependencies

**Solution:** Ensure all dependencies in package.json:
```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### GitHub API rate limit errors

**Issue:** Too many requests without token

**Solution:** Users need to add GitHub Personal Access Token in the app UI.

---

## Performance Monitoring

After deployment, test with:
- **Lighthouse**: Chrome DevTools → Lighthouse
- **WebPageTest**: https://www.webpagetest.org/
- **GTmetrix**: https://gtmetrix.com/

**Target Scores:**
- Lighthouse Performance: 95-100
- First Contentful Paint: < 1s
- Time to Interactive: < 2s

---

## Next Steps After Deployment

1. ✅ Test with real GitHub repositories
2. ✅ Share URL with open-source communities
3. ✅ Monitor Cloudflare Analytics
4. ✅ Collect user feedback
5. ✅ Iterate based on usage patterns

---

## Cost Summary

**Total Monthly Cost: $0**

All services used are 100% free:
- Cloudflare Pages: Free (unlimited bandwidth)
- GitHub: Free (public repository)
- Astro: Free (open-source)
- Svelte: Free (open-source)
- UnoCSS: Free (open-source)

Perfect for side projects and portfolios! 🚀
