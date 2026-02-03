# Troubleshooting Guide

This guide helps you diagnose and resolve common issues when using IssueVista. Each section covers specific problems with step-by-step solutions.

## Installation issues

### npm install fails with permission errors

If you encounter permission errors during installation:

**On macOS/Linux:**

```bash
sudo chown -R $(whoami) ~/.npm
npm install
```

**On Windows:**

Run your terminal as Administrator, or use:

```bash
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
npm install
```

### Node.js version mismatch

IssueVista requires Node.js 18 or higher. Check your version:

```bash
node --version
```

If your version is below 18, update Node.js using nvm:

```bash
nvm install 18
nvm use 18
```

### Dependencies fail to install

If specific packages fail to install:

1. Clear the npm cache:

```bash
npm cache clean --force
```

2. Delete node_modules and package-lock.json:

```bash
rm -rf node_modules package-lock.json
```

3. Reinstall dependencies:

```bash
npm install
```

### Build fails after fresh clone

Ensure you have all required tools installed:

```bash
node --version   # Should be 18+
npm --version    # Should be 9+
git --version    # Any recent version
```

## Development Server issues

### Port 4321 already in use

If the development server fails to start because the port is occupied:

**Find and kill the process:**

On macOS/Linux:

```bash
lsof -i :4321
kill -9 <PID>
```

On Windows:

```bash
netstat -ano | findstr :4321
taskkill /PID <PID> /F
```

**Or use a different port:**

```bash
npm run dev -- --port 3000
```

### Hot reload not working

If changes are not reflected automatically:

1. Check if your file is saved
2. Clear browser cache with Ctrl+Shift+R or Cmd+Shift+R
3. Restart the development server
4. Check for syntax errors in your code

### TypeScript errors during development

If you see TypeScript compilation errors:

1. Run the type checker to see all errors:

```bash
npx tsc --noEmit
```

2. Common fixes include adding proper type annotations, handling null or undefined values, and importing missing types.

### Styles not applying correctly

If UnoCSS styles are not working:

1. Ensure the class names are correct Tailwind syntax
2. Check if the class is being generated in the output
3. Restart the dev server to regenerate styles
4. Verify uno.config.ts includes your file patterns

## GitHub API issues

### Rate limit exceeded errors

The GitHub API limits unauthenticated requests to 60 per hour.

**Solution:** Add a Personal Access Token to increase your limit to 5,000 requests per hour.

1. Go to GitHub Settings then Developer Settings
2. Click Personal access tokens then Tokens classic
3. Generate a new token with public_repo scope
4. Paste the token in IssueVista's token field

**Check your current rate limit:**

Open browser developer tools, go to Network tab, and look for GitHub API responses. The headers show X-RateLimit-Remaining.

### Authentication failed errors

If your token is rejected:

1. Verify the token has not expired
2. Check that the token has the required scopes
3. Ensure there are no extra spaces when pasting
4. Generate a new token if the issue persists

### Repository not found

This error occurs when:

1. The repository URL is incorrect or has typos
2. The repository is private and your token lacks access
3. The repository has been deleted or renamed

**Verify the URL format:**

```
https://github.com/owner/repository
```

### No issues returned for valid repository

If a repository exists but no issues appear:

1. The repository may have no open issues
2. Your filters may be too restrictive
3. Try removing all filters and searching again
4. Check if issues are in the Discussions tab instead

### GraphQL query errors

If you see GraphQL-related errors in the console:

1. Check your network connection
2. GitHub API may be experiencing issues
3. Visit githubstatus.com to check service status
4. Try again in a few minutes

## Search and Filter issues

### Search returns no results

When searches return empty:

1. Verify the repository URL is correct
2. Remove all filters and try again
3. Check if the repository has open issues
4. Ensure you are not filtering by a non-existent label

### Filters not applying correctly

If filters seem to have no effect:

1. Check the filter syntax is correct
2. Labels are case-sensitive in some cases
3. Clear all filters and reapply them one by one
4. Refresh the page and try again

### Search history not showing

If your previous searches are not appearing:

1. Check if local storage is enabled in your browser
2. You may be in private or incognito mode
3. Your browser settings may block local storage
4. The storage may have been cleared

**Check local storage manually:**

1. Open browser developer tools with F12
2. Go to Application tab
3. Expand Local Storage in the sidebar
4. Look for IssueVista entries

### Language filter shows wrong languages

The language filter shows languages detected in repositories you have searched. If it shows unexpected languages:

1. This is normal as it reflects your search history
2. Clear your search history to reset
3. The languages update based on search results

## Display and UI issues

### Theme not persisting

If your selected theme resets after refresh:

1. Ensure local storage is enabled
2. Check you are not in private browsing mode
3. No browser extensions are blocking storage
4. Try selecting the theme again

### Layout appears broken

If the UI looks incorrect:

1. Clear your browser cache completely
2. Disable browser extensions temporarily
3. Try a different browser to isolate the issue
4. Check if your browser is up to date

### Icons or images not loading

Missing visual elements may indicate:

1. Network connectivity issues
2. Content blockers or ad blockers interfering
3. Browser extensions blocking resources
4. Try disabling extensions one by one

### Modal dialogs not closing

If popups or modals get stuck:

1. Press Escape key to close
2. Click outside the modal area
3. Refresh the page if nothing works
4. Check browser console for JavaScript errors

### Scroll position jumping

If the page scrolls unexpectedly:

1. This may occur during content loading
2. Wait for all content to load
3. Disable smooth scrolling in browser settings
4. Report the issue if it persists

## Export issues

### Export button not responding

If clicking export does nothing:

1. Wait for search results to load completely
2. Check browser console for errors
3. Try a different export format
4. Refresh the page and try again

### Downloaded file is empty

If the exported file has no content:

1. Ensure there are search results to export
2. Check that issues loaded successfully
3. Try a different export format
4. Look for browser download blocking notifications

### CSV file formatting issues

If CSV files look wrong in Excel:

1. Open Excel and use Data then From Text/CSV
2. Select comma as the delimiter
3. Choose UTF-8 encoding if prompted
4. Use Google Sheets which handles CSV better

### JSON file not valid

If JSON export produces invalid files:

1. Check if the download completed fully
2. Try exporting fewer results
3. Use a JSON validator to identify issues
4. Report the bug with reproduction steps

## Performance issues

### Application loading slowly

Slow initial load can be caused by:

1. Large bundle size on slow connections
2. Browser extensions interfering
3. Too many browser tabs open
4. Clear browser cache and reload

### Search takes too long

If searches are very slow:

1. GitHub API may be slow or rate limited
2. Repository may have many issues
3. Add filters to reduce result count
4. Check your network connection speed

### Browser becomes unresponsive

If the browser freezes:

1. Reduce the number of results displayed
2. Close other browser tabs
3. Disable browser extensions
4. Try a different browser

### Memory usage is high

High memory consumption may occur with:

1. Very large search results
2. Multiple searches without page refresh
3. Browser memory leaks from extensions
4. Refresh the page periodically

## Build and Deployment issues

### Build fails with errors

When npm run build fails:

1. Run npm run lint to check for code issues
2. Run npx tsc --noEmit for type errors
3. Check for missing dependencies
4. Review recent code changes

### Production build differs from development

If the production build behaves differently:

1. Environment variables may differ
2. Development uses hot reload features
3. Test with npm run preview locally
4. Check for development-only code paths

### Deployment fails on Cloudflare Pages

Common deployment issues:

1. Node.js version mismatch in build settings
2. Missing environment variables
3. Build command or output directory incorrect
4. Check Cloudflare build logs for details

## Debug Techniques

### Using browser developer tools

Open developer tools with F12 or right-click and select Inspect.

**Console tab:** View JavaScript errors and warnings. Look for red error messages that indicate problems.

**Network tab:** Monitor API requests and responses. Check for failed requests shown in red.

**Application tab:** Inspect local storage, session storage, and cookies. Useful for debugging storage issues.

### Checking GitHub API responses

1. Open Network tab in developer tools
2. Filter by XHR or Fetch requests
3. Look for requests to api.github.com
4. Click a request to see response details
5. Check status codes and response body

### Reading error messages

Error messages often contain helpful information:

1. Note the exact error text
2. Look for file names and line numbers
3. Search the error message online
4. Check the GitHub issues for similar reports

### Isolating the problem

To find the root cause:

1. Disable browser extensions
2. Try in incognito or private mode
3. Test in a different browser
4. Clear all site data and retry
5. Check if the issue is reproducible

### Checking local storage

To inspect stored data:

1. Open developer tools with F12
2. Go to Application tab
3. Expand Local Storage
4. Find the IssueVista domain
5. Review stored key-value pairs

## Getting help

### Reporting bugs

When reporting issues on GitHub:

1. Use the bug report template
2. Include steps to reproduce
3. Describe expected vs actual behavior
4. Add browser and OS information
5. Include console errors if any
6. Attach screenshots when helpful

### Searching existing issues

Before creating a new issue:

1. Search the repository issues
2. Check closed issues too
3. Look for similar error messages
4. Review recent discussions

### Community support

Get help from the community:

1. GitHub Discussions for questions
2. Check the FAQ documentation
3. Review existing issues and PRs
4. Be patient and respectful

### Contributing fixes

If you find and fix a bug:

1. Fork the repository
2. Create a fix branch
3. Write clear commit messages
4. Submit a pull request
5. Reference the related issue

## Quick Reference

### Common error codes

| Error | Meaning                   | Solution                    |
| ----- | ------------------------- | --------------------------- |
| 401   | Unauthorized              | Check your GitHub token     |
| 403   | Forbidden or rate limited | Add token or wait for reset |
| 404   | Not found                 | Verify repository URL       |
| 422   | Invalid request           | Check query parameters      |
| 500   | Server error              | Try again later             |

### Useful commands

```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run preview      # Preview production build
npm run lint         # Check for code issues
npm run format       # Format code with Prettier
npm test             # Run all tests
```

### Browser shortcuts

| Shortcut          | Action                       |
| ----------------- | ---------------------------- |
| F12               | Open developer tools         |
| Ctrl+Shift+R      | Hard refresh and clear cache |
| Ctrl+Shift+Delete | Clear browser data           |
| Escape            | Close modals and menus       |

### Clearing site data

To completely reset IssueVista:

1. Open browser settings
2. Find privacy or site settings
3. Search for the IssueVista domain
4. Click clear data or forget site
5. Refresh the page
