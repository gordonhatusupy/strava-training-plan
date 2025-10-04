import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { StravaService } from '../services/stravaService';
import { calculateTSS, estimateFTP } from '../utils/calculations';

const prisma = new PrismaClient();

/**
 * Get user's activities from database
 */
export async function getActivities(req: Request, res: Response) {
  try {
    const userId = req.session.userId!;
    const limit = parseInt(req.query.limit as string) || 50;

    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' },
      take: limit
    });

    res.json(activities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
}

/**
 * Sync activities from Strava
 */
export async function syncActivities(req: Request, res: Response) {
  try {
    const userId = req.session.userId!;
    const days = parseInt(req.query.days as string) || 90;

    // Get user with fresh token
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if token needs refresh
    let accessToken = user.accessToken;
    if (new Date() >= user.tokenExpiry) {
      const tokens = await StravaService.refreshAccessToken(
        user.refreshToken,
        process.env.STRAVA_CLIENT_ID!,
        process.env.STRAVA_CLIENT_SECRET!
      );

      // Update tokens in database
      await prisma.user.update({
        where: { id: userId },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiry: new Date(tokens.expires_at * 1000)
        }
      });

      accessToken = tokens.access_token;
    }

    // Fetch activities from Strava
    const stravaService = new StravaService(accessToken);
    const stravaActivities = await stravaService.getRecentActivities(days);

    // Get user's FTP (or estimate it)
    let ftp = user.ftp || 200;

    // Store activities in database
    let syncedCount = 0;
    for (const activity of stravaActivities) {
      const calculatedTSS = calculateTSS(activity, ftp);

      await prisma.activity.upsert({
        where: { id: activity.id },
        update: {
          name: activity.name,
          distance: activity.distance,
          movingTime: activity.moving_time,
          elapsedTime: activity.elapsed_time,
          totalElevationGain: activity.total_elevation_gain,
          type: activity.type,
          sportType: activity.sport_type,
          startDate: new Date(activity.start_date),
          averageHeartrate: activity.average_heartrate,
          maxHeartrate: activity.max_heartrate,
          averageWatts: activity.average_watts,
          weightedAverageWatts: activity.weighted_average_watts,
          kilojoules: activity.kilojoules,
          hasHeartrate: activity.has_heartrate,
          deviceWatts: activity.device_watts || false,
          calculatedTSS
        },
        create: {
          id: activity.id,
          userId,
          name: activity.name,
          distance: activity.distance,
          movingTime: activity.moving_time,
          elapsedTime: activity.elapsed_time,
          totalElevationGain: activity.total_elevation_gain,
          type: activity.type,
          sportType: activity.sport_type,
          startDate: new Date(activity.start_date),
          averageHeartrate: activity.average_heartrate,
          maxHeartrate: activity.max_heartrate,
          averageWatts: activity.average_watts,
          weightedAverageWatts: activity.weighted_average_watts,
          kilojoules: activity.kilojoules,
          hasHeartrate: activity.has_heartrate,
          deviceWatts: activity.device_watts || false,
          calculatedTSS
        }
      });

      syncedCount++;
    }

    // If we have power data, estimate FTP
    const allActivities = await prisma.activity.findMany({
      where: { userId }
    });

    const estimatedFTP = estimateFTP(allActivities);
    if (estimatedFTP > 100 && !user.ftp) {
      await prisma.user.update({
        where: { id: userId },
        data: { ftp: estimatedFTP }
      });
    }

    res.json({
      message: 'Activities synced successfully',
      syncedCount,
      estimatedFTP: estimatedFTP > 100 ? estimatedFTP : null
    });
  } catch (error) {
    console.error('Sync activities error:', error);
    res.status(500).json({ error: 'Failed to sync activities' });
  }
}

/**
 * Get specific activity by ID
 */
export async function getActivity(req: Request, res: Response) {
  try {
    const userId = req.session.userId!;
    const activityId = parseInt(req.params.id);

    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        userId
      }
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
}
