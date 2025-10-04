# Setup Guide

This guide will walk you through setting up the Strava Training Plan application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **PostgreSQL** database (local or hosted)
- **Strava API Application** ([Create one here](https://www.strava.com/settings/api))

## Step 1: Clone and Install Dependencies

```bash
# Navigate to project directory
cd strava-training-plan

# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Return to root
cd ..
```

## Step 2: Set Up Strava OAuth Application

1. Go to https://www.strava.com/settings/api
2. Create a new application
3. Fill in the details:
   - **Application Name**: Strava Training Plan (or your choice)
   - **Category**: Training
   - **Website**: http://localhost:5173 (for development)
   - **Authorization Callback Domain**: `localhost`
4. Save and note your **Client ID** and **Client Secret**

## Step 3: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

```bash
# Create a new database
createdb strava_training_plan

# Or using psql
psql postgres
CREATE DATABASE strava_training_plan;
\q
```

### Option B: Hosted Database (Railway, Supabase, etc.)

Create a PostgreSQL database on your preferred platform and get the connection string.

## Step 4: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your actual values:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/strava_training_plan?schema=public"

# Server
PORT=3001
NODE_ENV=development

# Strava OAuth
STRAVA_CLIENT_ID=your_actual_client_id
STRAVA_CLIENT_SECRET=your_actual_client_secret
STRAVA_REDIRECT_URI=http://localhost:3001/auth/strava/callback

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Session Secret (generate a random string)
SESSION_SECRET=your_random_secret_at_least_32_characters_long
```

### Generate a Secure Session Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use any random string generator
```

## Step 5: Set Up Database Schema

```bash
cd server

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

## Step 6: Start Development Servers

### Option A: Start Both Servers Simultaneously (Recommended)

From the root directory:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend server on http://localhost:5173

### Option B: Start Servers Separately

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## Step 7: First Time Setup

1. Open your browser and go to http://localhost:5173
2. Click "Connect with Strava"
3. Authorize the application
4. You'll be redirected to the dashboard
5. Click "Sync" to import your activities from Strava
6. Wait for the sync to complete (may take a minute for 90 days of data)
7. Your fitness metrics will be calculated automatically
8. Navigate to "Workouts" to generate your first training plan

## Troubleshooting

### Database Connection Issues

If you see database connection errors:

```bash
# Verify PostgreSQL is running
psql -U postgres -c "SELECT version();"

# Check your DATABASE_URL is correct
cd server
npx prisma db pull
```

### Strava OAuth Errors

- **Invalid Redirect URI**: Make sure your Strava app's "Authorization Callback Domain" is set to `localhost`
- **Unauthorized**: Verify your Client ID and Client Secret in `.env`
- **Scope Issues**: The app requests `activity:read_all,profile:read_all` - make sure you approve both

### Port Already in Use

If port 3001 or 5173 is already in use:

```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# Or change the port in .env and vite.config.ts
```

### TypeScript Errors

```bash
# Rebuild TypeScript
cd server
npm run build

cd ../client
npm run build
```

## Production Deployment

### Backend (Railway, Render, Heroku)

1. Set environment variables on your platform
2. Set `NODE_ENV=production`
3. Update `STRAVA_REDIRECT_URI` to your production URL
4. Update Strava app settings with production callback domain
5. Deploy using platform-specific instructions

### Frontend (Vercel, Netlify)

1. Build the client: `cd client && npm run build`
2. Deploy the `dist` folder
3. Set `VITE_API_BASE` environment variable to your backend URL

### Database

1. Use a managed PostgreSQL service (Railway, Supabase, etc.)
2. Run migrations: `cd server && npx prisma migrate deploy`

## Next Steps

- Customize the workout generator algorithm
- Add more detailed activity analysis
- Implement route recommendations
- Export workouts to .fit files
- Add social features

## Support

For issues or questions:
- GitHub Issues: https://github.com/your-repo/issues
- Strava API Docs: https://developers.strava.com/docs/reference/

---

**Enjoy your personalized training plans!** 🚴‍♂️
