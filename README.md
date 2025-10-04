# Strava Training Plan Generator

A modern web application that connects to Strava, analyzes cycling fitness data, and generates personalized weekly workout plans. Features a Whoop-inspired dark UI focused on data visualization and premium aesthetics.

## Features

- 🔐 Strava OAuth authentication
- 📊 Fitness metrics dashboard (CTL, ATL, TSB)
- 🚴‍♂️ Automatic activity sync and TSS calculation
- 📅 AI-generated weekly workout plans
- 📈 Historical fitness tracking with beautiful charts
- 🎨 Whoop-inspired dark UI design
- 📱 Mobile-first responsive design

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite
- Tailwind CSS
- Recharts
- Lucide React icons
- React Router
- Zustand (state management)

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Passport.js (Strava OAuth)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Strava API application ([Create one here](https://www.strava.com/settings/api))

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd strava-training-plan
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your:
- Database connection string
- Strava API credentials
- Session secret

4. Set up the database
```bash
cd server
npx prisma generate
npx prisma migrate dev
```

5. Start the development servers
```bash
npm run dev
```

This starts both:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Project Structure

```
/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── utils/        # Helper functions
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx
│   └── package.json
├── server/               # Express backend
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Business logic
│   │   ├── services/     # External services (Strava API)
│   │   ├── models/       # Database models
│   │   ├── utils/        # Calculations (TSS, CTL, etc.)
│   │   └── index.ts
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
└── package.json
```

## Strava OAuth Setup

1. Go to https://www.strava.com/settings/api
2. Create a new application
3. Set Authorization Callback Domain to `localhost` (for development)
4. Copy Client ID and Client Secret to `.env`

## Deployment

### Deploy to Vercel (Recommended)

This app is configured for easy deployment to Vercel:

1. **Push to GitHub** (if not done already):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/strava-training-plan.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Add environment variables (see `DEPLOY.md` for details)
   - Click "Deploy"

3. **Set up database** using Vercel Postgres or external provider

📖 **Full deployment guide**: See [DEPLOY.md](./DEPLOY.md) for detailed instructions

### Alternative Deployment Options
- **Railway**: Full-stack with database
- **Render**: Free tier available
- **DigitalOcean**: App Platform

## License

MIT
