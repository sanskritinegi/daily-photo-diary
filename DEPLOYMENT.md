# Deployment Guide

This guide will help you deploy your Daily Photo Diary app and set up automatic deployments.

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/daily-photo-diary.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

3. **Automatic Updates:**
   - Every time you push to GitHub, Vercel automatically deploys
   - Just do: `git push` and changes go live!

### Option 2: Netlify

1. **Push to GitHub** (same as above)

2. **Deploy on Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/login with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Click "Deploy site"

3. **Automatic Updates:**
   - Netlify auto-deploys on every git push

### Option 3: GitHub Pages

1. **Update vite.config.js:**
   ```js
   export default defineConfig({
     plugins: [react()],
     base: '/daily-photo-diary/' // Your repo name
   })
   ```

2. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Add to package.json:**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

4. **Deploy:**
   ```bash
   npm run deploy
   ```

## Workflow for Making Changes

### Daily Workflow:

1. **Make changes locally:**
   ```bash
   npm run dev  # Test locally
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

3. **Automatic deployment:**
   - Vercel/Netlify automatically builds and deploys
   - Your changes go live in 2-5 minutes!

## Custom Domain (Optional)

### Vercel:
- Go to Project Settings → Domains
- Add your custom domain
- Follow DNS instructions

### Netlify:
- Go to Site Settings → Domain Management
- Add custom domain
- Update DNS records

## Environment Variables

If you add any API keys later:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables

## Important Notes

- **HTTPS is required** for camera/webcam access (all platforms provide this)
- **PWA works** on all platforms automatically
- **Data is stored locally** in each user's browser (IndexedDB)
- **No backend needed** - everything is client-side!

## Troubleshooting

- **Build fails?** Check that all dependencies are in `package.json`
- **404 errors?** Make sure redirect rules are set (already configured)
- **Camera not working?** Ensure site is served over HTTPS

