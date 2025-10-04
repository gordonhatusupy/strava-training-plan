{\rtf1\ansi\ansicpg1252\cocoartf2822
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 # Strava Cycling Workout Generator - Research & Technical Specifications\
\
## Project Overview\
Build a web application that imports Strava cycling data and generates personalized weekly workouts based on:\
- Current fitness level (using training load metrics)\
- Historical performance data\
- Preferred routes and terrain\
- Recovery needs\
\
---\
\
## 1. Strava API Integration\
\
### Authentication (OAuth 2.0)\
**Process Flow:**\
1. Register application at `https://www.strava.com/settings/api`\
2. Obtain Client ID and Client Secret\
3. Redirect user to authorization URL:\
   ```\
   http://www.strava.com/oauth/authorize?client_id=[CLIENT_ID]&response_type=code&redirect_uri=[CALLBACK]&approval_prompt=force&scope=activity:read_all,profile:read_all\
   ```\
4. Exchange authorization code for tokens:\
   ```\
   POST https://www.strava.com/oauth/token\
   Body: client_id, client_secret, code, grant_type=authorization_code\
   ```\
5. Store refresh_token and access_token\
6. Access tokens expire in 6 hours; use refresh_token to get new ones\
\
**Required Scopes:**\
- `activity:read_all` - Read all activity data including private\
- `profile:read_all` - Read athlete zones and profile data\
\
**Rate Limits:**\
- 200 requests per 15 minutes\
- 2,000 requests per day\
\
### Key API Endpoints\
\
#### 1. Get Athlete Profile & Zones\
```\
GET /athlete\
GET /athlete/zones\
```\
Returns heart rate and power zones (requires `profile:read_all`)\
\
#### 2. Get Activities List\
```\
GET /athlete/activities?per_page=200&page=1\
```\
Returns summary data (missing heart rate zone details)\
\
#### 3. Get Activity Details\
```\
GET /activities/\{id\}\
```\
Returns detailed activity including:\
- Distance, moving_time, elapsed_time\
- Total elevation gain\
- Type, sport_type\
- Average and max heart rate/power\
- Map with polyline\
- Trainer flag, etc.\
\
#### 4. Get Activity Streams (Detailed Data)\
```\
GET /activities/\{id\}/streams?keys=time,latlng,altitude,heartrate,watts,cadence\
```\
Returns second-by-second data for visualization and analysis\
\
#### 5. Get Heart Rate Zone Distribution\
```\
GET /activities/\{id\}/zones\
```\
Returns time spent in each HR/power zone for the activity\
\
#### 6. Routes\
```\
GET /routes/\{id\}\
GET /routes/\{id\}/export_gpx\
GET /routes/\{id\}/export_tcx\
```\
Access saved routes with GPS data\
\
### Data Structures\
\
**Activity Summary:**\
```json\
\{\
  "id": 123456,\
  "name": "Morning Ride",\
  "distance": 24931.4,\
  "moving_time": 4500,\
  "elapsed_time": 4500,\
  "total_elevation_gain": 516,\
  "type": "Ride",\
  "sport_type": "MountainBikeRide",\
  "average_heartrate": 140.3,\
  "max_heartrate": 178,\
  "average_watts": 200,\
  "weighted_average_watts": 210,\
  "map": \{\
    "summary_polyline": "encoded_string"\
  \}\
\}\
```\
\
**Polyline Encoding:**\
- Uses Google Encoded Polyline Algorithm\
- Must be decoded to get lat/lng coordinates\
- Libraries: `@mapbox/polyline` (JS), `polyline` (Python)\
\
---\
\
## 2. Training Load Metrics & Fitness Analysis\
\
### Core Metrics\
\
#### TSS (Training Stress Score)\
**Formula:**\
```\
TSS = (duration_seconds \'d7 watts \'d7 IF) / (FTP \'d7 3600) \'d7 100\
```\
Where:\
- **IF (Intensity Factor)** = Normalized Power / FTP\
- **FTP (Functional Threshold Power)** = Highest power sustainable for ~1 hour\
- FTP can be estimated as 95% of 20-min max power test\
\
**TSS Interpretation:**\
- <150: Easy recovery ride\
- 150-300: Moderate workout\
- 300-450: Hard workout\
- 450+: Very demanding\
\
#### CTL (Chronic Training Load) - "Fitness"\
**Formula:**\
```\
CTL_today = CTL_yesterday + (TSS_today - CTL_yesterday) \'d7 (1/42)\
```\
- Exponentially weighted average of daily TSS over 42 days\
- Represents long-term fitness/training load\
- CTL of 100 = average of 100 TSS/day over past 6 weeks\
\
**Typical CTL Values:**\
- Beginner: 30-50\
- Amateur with full-time job: 100-110\
- Elite amateur: 120-130\
- Professional: 140-150\
- Post-tour professional: up to 170\
\
#### ATL (Acute Training Load) - "Fatigue"\
**Formula:**\
```\
ATL_today = ATL_yesterday + (TSS_today - ATL_yesterday) \'d7 (1/7)\
```\
- Exponentially weighted average over 7 days\
- Represents short-term fatigue\
- More volatile than CTL\
\
#### TSB (Training Stress Balance) - "Form"\
**Formula:**\
```\
TSB = CTL - ATL\
```\
- Positive TSB = Fresh/rested (good for racing)\
- Negative TSB = Fatigued (deep in training)\
\
**TSB Guidelines:**\
- -20 to -30: Intensive training phase\
- -10 to +5: Normal training\
- +5 to +15: Recovery/taper period\
- +15+: Ready to race\
\
### Progressive Training Guidelines\
\
**CTL Ramp Rate:**\
- Safe increase: 3-5 CTL points per week\
- Avoid rapid jumps to prevent overtraining\
- Monitor ATL to ensure it doesn't spike too high\
\
**Weekly TSS Targets by CTL:**\
- CTL 50: ~350-420 TSS/week\
- CTL 70: ~490-560 TSS/week\
- CTL 90: ~630-700 TSS/week\
- CTL 100: ~700-770 TSS/week\
- CTL 120: ~840-910 TSS/week\
\
**Daily TSS as % of CTL:**\
- Easy day: 50-75% of CTL\
- Moderate day: 100-125% of CTL\
- Hard day: 150-200% of CTL\
\
---\
\
## 3. Workout Generation Algorithm\
\
### Analysis Phase (Pull 8-12 weeks of data)\
\
1. **Calculate Current Fitness:**\
   - Compute CTL, ATL, TSB from historical activities\
   - Estimate FTP from best 20-min power \'d7 0.95\
   - Identify heart rate zones\
\
2. **Identify Patterns:**\
   - Average weekly volume (hours, distance)\
   - Preferred ride days/times\
   - Common routes (group by similar polylines or start locations)\
   - Terrain preferences (flat vs hilly based on elevation gain)\
   - Workout types (recovery, endurance, intervals)\
\
3. **Assess Current State:**\
   - Is TSB too negative? (Need recovery)\
   - Is CTL trending up or down?\
   - Recent injury/time off? (ATL low but CTL still elevated)\
   - Training consistency score\
\
### Workout Generation Phase\
\
**Weekly Structure (Example for CTL ~100):**\
\
```\
Monday: Recovery (50 TSS)\
- 60 min easy Zone 2\
- Flat route or trainer\
\
Tuesday: Endurance (80 TSS)\
- 90 min Zone 2-3\
- Moderate route\
\
Wednesday: Intervals (100 TSS)\
- Warmup 15 min\
- 4 \'d7 5 min @ Threshold (Zone 4)\
- 3 min recovery between\
- Cooldown 15 min\
\
Thursday: Recovery or OFF (30 TSS or 0)\
\
Friday: Tempo (90 TSS)\
- 75 min with 30 min @ tempo (Zone 3-4)\
\
Saturday: Long Endurance (120 TSS)\
- 2.5-3 hours Zone 2\
- Hilly route if available\
\
Sunday: Active Recovery or OFF (40 TSS or 0)\
\
Weekly Total: ~500-550 TSS\
```\
\
**Workout Type Distribution:**\
- 70-80% endurance/base (Zone 1-2)\
- 10-15% tempo/sweet spot (Zone 3-4)\
- 5-10% VO2max/threshold (Zone 4-5)\
- Rest of recovery\
\
**Adaptive Adjustments:**\
- If TSB < -20: Add recovery day, reduce volume\
- If recent hard week: Make current week easier\
- If CTL declining: Gradually increase weekly TSS\
- If missed workouts: Don't try to "catch up," adjust forward\
\
### Route Matching\
\
**Cluster Routes by:**\
1. Start location (lat/lng within radius)\
2. Distance (\'b120%)\
3. Elevation gain (\'b130%)\
4. Terrain type\
\
**Route Recommendation Logic:**\
- Recovery days: Flat, familiar routes\
- Endurance days: Longer routes with preferred terrain\
- Interval days: Circuits or out-and-back routes\
- Weekend long rides: Scenic/favorite routes\
\
---\
\
## 4. Technology Stack Recommendations\
\
### Backend\
**Option 1: Node.js/Express**\
- Excellent async handling for API calls\
- Easy OAuth implementation\
- NPM packages: `axios`, `express`, `passport-strava-oauth2`\
\
**Option 2: Python/Flask or FastAPI**\
- Strong data analysis libraries\
- Libraries: `requests`, `stravalib`, `pandas`, `numpy`\
- Good for TSS/CTL calculations\
\
### Frontend\
- **React** or **Vue.js**\
- Charts: **Recharts** or **Chart.js** for visualizations\
- Maps: **Leaflet** with OpenStreetMap for route display\
- Decode polylines: `@mapbox/polyline`\
\
### Database\
- **PostgreSQL** for structured data (users, activities, workouts)\
- **Redis** for caching API responses (rate limit management)\
\
### Deployment\
- **Vercel** or **Railway** for easy deployment\
- **AWS Lambda** for serverless option\
\
---\
\
## 5. Key Features to Implement\
\
### MVP (Minimum Viable Product)\
1. Strava OAuth authentication\
2. Import last 12 weeks of activities\
3. Calculate CTL, ATL, TSB, estimated FTP\
4. Display fitness chart/dashboard\
5. Generate basic weekly workout plan (text-based)\
6. Show suggested TSS for each workout\
\
### Enhanced Features\
1. Interactive workout calendar\
2. Route recommendations based on workout type\
3. Export workouts to Strava (or .fit files for Garmin)\
4. Progress tracking over time\
5. Adjustable parameters (CTL targets, training volume)\
6. Heart rate zone analysis\
7. Power zone distribution charts\
8. Peak performance predictions\
\
### Advanced Features\
1. Machine learning for workout adaptation\
2. Integration with Zwift/TrainerRoad for indoor workouts\
3. Social features (compare with friends)\
4. Custom workout builder\
5. Race-day taper planning\
6. A/B testing different training approaches\
\
---\
\
## 6. Important Considerations\
\
### Privacy & Security\
- Never store Strava passwords\
- Encrypt stored tokens\
- Allow users to revoke access\
- Comply with Strava API terms of service\
- GDPR compliance if serving EU users\
\
### Data Freshness\
- Implement webhooks to get real-time activity updates\
- Cache activity data but refresh periodically\
- Handle stale token refresh gracefully\
\
### Error Handling\
- API rate limiting (queue requests)\
- Network failures (retry logic)\
- Missing data (activities without power/HR)\
- Invalid FTP estimates\
\
### User Experience\
- Clear onboarding flow\
- Explain metrics in plain language\
- Progressive disclosure (don't overwhelm beginners)\
- Mobile-responsive design\
\
---\
\
## 7. Sample Calculation Example\
\
**Scenario:**\
- Athlete's current CTL: 95\
- Recent activities: High training week (600 TSS)\
- Current ATL: 110\
- TSB: 95 - 110 = -15 (moderately fatigued)\
\
**Generated Week:**\
```\
Target: Maintain CTL while recovering\
Weekly TSS: ~550 (allows ATL to decrease)\
\
Mon: 40 TSS recovery\
Tue: 80 TSS endurance\
Wed: 100 TSS intervals (short, not too hard)\
Thu: Rest (0)\
Fri: 70 TSS tempo\
Sat: 130 TSS long ride\
Sun: 50 TSS active recovery or rest\
\
Total: ~470 TSS\
Expected end-of-week CTL: ~93 (slight drop is okay)\
Expected ATL: ~67 (good recovery)\
Expected TSB: ~+26 (fresh!)\
```\
\
---\
\
## 8. Research Sources Summary\
\
**Strava API:**\
- OAuth 2.0 with refresh tokens (6-hour expiry)\
- Rate limits: 200/15min, 2000/day\
- Key endpoints: activities, athlete zones, streams\
- Polyline encoding for GPS data\
\
**Training Science:**\
- TSS based on duration and intensity\
- CTL (42-day average) = Fitness\
- ATL (7-day average) = Fatigue\
- TSB = CTL - ATL = Form/Readiness\
- Safe ramp: 3-5 CTL points/week\
\
**Adaptive Training (from TrainerRoad, 2PEAK, JOIN):**\
- Analyze each workout's difficulty\
- Adjust future workouts based on performance\
- Account for missed sessions\
- Balance intensity with recovery\
- Use machine learning to optimize progression\
\
---\
\
## 9. Next Steps for Development\
\
1. **Setup & Auth:**\
   - Register Strava app\
   - Implement OAuth flow\
   - Test token refresh\
\
2. **Data Import:**\
   - Fetch activities (paginated)\
   - Parse and store relevant data\
   - Handle different activity types\
\
3. **Metrics Engine:**\
   - Calculate TSS (estimate if no power)\
   - Compute CTL, ATL, TSB\
   - Estimate FTP from best efforts\
\
4. **Workout Generator:**\
   - Create basic template system\
   - Implement adaptive logic\
   - Generate weekly plan\
\
5. **UI/UX:**\
   - Dashboard with fitness chart\
   - Workout calendar view\
   - Route suggestions\
\
6. **Testing & Refinement:**\
   - Test with various fitness levels\
   - Validate TSS calculations\
   - Gather user feedback\
\
---\
\
This research document provides all the technical specifications needed to build a comprehensive Strava-integrated cycling workout generator. The next step would be to use this as a foundation for a detailed Claude Code prompt.}