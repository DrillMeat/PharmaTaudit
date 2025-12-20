# Vercel Deployment Guide

## How to Connect Supabase to Vercel

Your Supabase database connects to Vercel through **HTTP REST API calls** - no direct database connection is needed. The API functions in the `/api` folder automatically connect to Supabase when deployed.

## Step-by-Step Deployment

### Option 1: Deploy via Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy your project**:
   ```bash
   cd "/Users/moskovojtim/Audit PharmaT"
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Confirm project settings
   - Deploy!

### Option 2: Deploy via GitHub

1. **Push your code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Go to Vercel Dashboard**:
   - Visit https://vercel.com/dashboard
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect settings
   - Click "Deploy"

### Option 3: Deploy via Vercel Dashboard (Drag & Drop)

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Drag and drop your project folder
4. Click "Deploy"

## Verify Deployment

After deployment, test your API:

1. **Test connection endpoint**:
   ```
   https://your-project.vercel.app/api/test-connection
   ```

2. **Test login endpoint** (via your app):
   - Open your deployed site
   - Try logging in
   - Check browser console for errors

## Important Notes

### Supabase Connection
- ✅ **Already configured**: Your API files have Supabase credentials hardcoded
- ✅ **No additional setup needed**: The REST API calls work automatically
- ⚠️ **Make sure**: Your Supabase project is **active** (not paused)

### If Supabase Project is Paused
1. Go to https://supabase.com/dashboard/project/xsrppkeysfjkxkbpfbog
2. Click "Restore" or "Resume" if you see a paused status
3. Wait 1-2 minutes for it to restart
4. Test again

### Environment Variables (Optional - for better security)

If you want to use environment variables instead of hardcoded credentials:

1. **In Vercel Dashboard**:
   - Go to your project → Settings → Environment Variables
   - Add:
     - `SUPABASE_URL` = `https://xsrppkeysfjkxkbpfbog.supabase.co`
     - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

2. **Update API files** to use:
   ```javascript
   const SUPABASE_URL = process.env.SUPABASE_URL || 'https://xsrppkeysfjkxkbpfbog.supabase.co';
   const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'your-key';
   ```

## Troubleshooting

### API returns 404
- Make sure `/api` folder is in the root directory
- Check that `vercel.json` is configured correctly
- Redeploy the project

### API returns 503/502
- Your Supabase project is likely paused
- Restore it in Supabase dashboard

### Connection timeout
- Check Supabase project status
- Verify Supabase URL is correct
- Check network connectivity

## Local Testing

Test locally before deploying:

```bash
# Install Vercel CLI
npm install -g vercel

# Run local dev server
vercel dev
```

Then visit `http://localhost:3000` and test your API endpoints.

