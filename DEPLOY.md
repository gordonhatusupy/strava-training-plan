# Deployment Guide - Vercel

This guide will help you deploy the Strava Training Plan app to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. GitHub repository with your code pushed
3. Strava API credentials (Client ID and Secret)

## Step 1: Push to GitHub

If you haven't already:

```bash
# Create a new repository on GitHub at https://github.com/new
# Then run:
git remote add origin https://github.com/YOUR_USERNAME/strava-training-plan.git
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `strava-training-plan` repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist`

5. Add Environment Variables (click "Environment Variables"):
   ```
   DATABASE_URL=your_postgres_database_url
   SESSION_SECRET=your_random_secret_here
   STRAVA_CLIENT_ID=your_strava_client_id
   STRAVA_CLIENT_SECRET=your_strava_client_secret
   STRAVA_REDIRECT_URI=https://your-app.vercel.app/auth/callback
   CLIENT_URL=https://your-app.vercel.app
   ```

6. Click "Deploy"

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts and add environment variables when asked
```

## Step 3: Set Up Database

### Using Vercel Postgres (Recommended)

1. In your Vercel project dashboard, go to "Storage"
2. Click "Create Database" → "Postgres"
3. Follow the setup wizard
4. Copy the `DATABASE_URL` to your environment variables
5. Run migrations:
   ```bash
   # Set the DATABASE_URL locally
   export DATABASE_URL="your_vercel_postgres_url"

   # Run migrations
   npx prisma migrate deploy
   ```

### Alternative: Using External Database

You can use:
- **Supabase** (https://supabase.com) - Free tier with PostgreSQL
- **Railway** (https://railway.app) - Free tier PostgreSQL
- **Neon** (https://neon.tech) - Serverless PostgreSQL

## Step 4: Update Strava Redirect URI

1. Go to https://www.strava.com/settings/api
2. Update "Authorization Callback Domain" to your Vercel domain:
   ```
   your-app.vercel.app
   ```

## Step 5: Verify Deployment

1. Visit your deployed app URL (e.g., https://your-app.vercel.app)
2. Click "Connect with Strava"
3. Authorize the app
4. Verify that you can sync activities and view metrics

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `SESSION_SECRET` | Random secret for sessions | `your-random-secret-here` |
| `STRAVA_CLIENT_ID` | From Strava API settings | `12345` |
| `STRAVA_CLIENT_SECRET` | From Strava API settings | `abc123...` |
| `STRAVA_REDIRECT_URI` | OAuth callback URL | `https://your-app.vercel.app/auth/callback` |
| `CLIENT_URL` | Frontend URL | `https://your-app.vercel.app` |

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript has no errors: `npm run build` locally

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel
- Run migrations: `npx prisma migrate deploy`

### Strava OAuth Not Working
- Verify redirect URI matches exactly in Strava settings
- Check `STRAVA_REDIRECT_URI` environment variable
- Ensure all Strava credentials are correct

### API Routes Not Working
- Check `vercel.json` configuration
- Verify routes in Vercel dashboard under "Deployments" → "Functions"

## Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Update DNS records as instructed
4. Update `STRAVA_REDIRECT_URI` and `CLIENT_URL` environment variables
5. Update Strava API callback domain

## Updates & Redeployment

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push
```

Your app will redeploy automatically!
