import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { StravaService } from '../services/stravaService';

const prisma = new PrismaClient();

/**
 * Initiate Strava OAuth flow
 */
export function initiateStravaAuth(req: Request, res: Response) {
  const clientId = process.env.STRAVA_CLIENT_ID;
  const redirectUri = process.env.STRAVA_REDIRECT_URI;
  const scope = 'activity:read_all,profile:read_all';

  const authUrl = `https://www.strava.com/oauth/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&approval_prompt=force&scope=${scope}`;

  res.redirect(authUrl);
}

/**
 * Handle Strava OAuth callback
 */
export async function handleStravaCallback(req: Request, res: Response) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    const clientId = process.env.STRAVA_CLIENT_ID!;
    const clientSecret = process.env.STRAVA_CLIENT_SECRET!;

    // Exchange code for tokens
    const { tokens, athlete } = await StravaService.exchangeToken(
      code,
      clientId,
      clientSecret
    );

    // Create or update user
    // Use a fallback email if Strava doesn't provide one
    const email = athlete.email || `${athlete.id}@strava.local`;

    const user = await prisma.user.upsert({
      where: { stravaId: athlete.id },
      update: {
        firstName: athlete.firstname,
        lastName: athlete.lastname,
        email,
        profilePhoto: athlete.profile,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(tokens.expires_at * 1000)
      },
      create: {
        stravaId: athlete.id,
        firstName: athlete.firstname,
        lastName: athlete.lastname,
        email,
        profilePhoto: athlete.profile,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry: new Date(tokens.expires_at * 1000)
      }
    });

    // Set session
    req.session.userId = user.id;

    // Redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/dashboard`);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(req: Request, res: Response) {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        stravaId: true,
        firstName: true,
        lastName: true,
        email: true,
        profilePhoto: true,
        ftp: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}

/**
 * Logout user
 */
export function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
}
