import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get user profile
 */
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.session.userId!;

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
        createdAt: true,
        _count: {
          select: {
            activities: true,
            workouts: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

/**
 * Update user settings
 */
export async function updateSettings(req: Request, res: Response) {
  try {
    const userId = req.session.userId!;
    const { ftp } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(ftp && { ftp: parseInt(ftp) })
      },
      select: {
        id: true,
        ftp: true
      }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}
