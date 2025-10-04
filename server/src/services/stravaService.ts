import axios from 'axios';
import { StravaActivity, StravaAthlete, StravaTokens } from '../types';

const STRAVA_API_BASE = 'https://www.strava.com/api/v3';

export class StravaService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Get authenticated athlete profile
   */
  async getAthlete(): Promise<StravaAthlete> {
    const response = await axios.get(`${STRAVA_API_BASE}/athlete`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });
    return response.data;
  }

  /**
   * Get athlete's activities
   * @param page Page number (default 1)
   * @param perPage Activities per page (default 30, max 200)
   * @param after Unix timestamp to get activities after
   */
  async getActivities(
    page: number = 1,
    perPage: number = 200,
    after?: number
  ): Promise<StravaActivity[]> {
    const params: any = { page, per_page: perPage };
    if (after) {
      params.after = after;
    }

    const response = await axios.get(`${STRAVA_API_BASE}/athlete/activities`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      params
    });

    return response.data;
  }

  /**
   * Get detailed activity by ID
   */
  async getActivity(activityId: number): Promise<StravaActivity> {
    const response = await axios.get(
      `${STRAVA_API_BASE}/activities/${activityId}`,
      {
        headers: { Authorization: `Bearer ${this.accessToken}` }
      }
    );
    return response.data;
  }

  /**
   * Get activities from the last N days
   */
  async getRecentActivities(days: number = 90): Promise<StravaActivity[]> {
    const after = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60;
    let allActivities: StravaActivity[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const activities = await this.getActivities(page, 200, after);
      allActivities = allActivities.concat(activities);

      // If we got less than 200, we've reached the end
      if (activities.length < 200) {
        hasMore = false;
      } else {
        page++;
      }

      // Rate limiting: sleep briefly between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Filter to only cycling activities
    return allActivities.filter(
      a => a.type === 'Ride' || a.sport_type === 'Ride'
    );
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string
  ): Promise<StravaTokens> {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    });

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      expires_at: response.data.expires_at
    };
  }

  /**
   * Exchange authorization code for tokens
   */
  static async exchangeToken(
    code: string,
    clientId: string,
    clientSecret: string
  ): Promise<{ tokens: StravaTokens; athlete: StravaAthlete }> {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code'
    });

    return {
      tokens: {
        access_token: response.data.access_token,
        refresh_token: response.data.refresh_token,
        expires_at: response.data.expires_at
      },
      athlete: response.data.athlete
    };
  }
}
