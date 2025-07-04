# Background Jobs System

This directory contains the modular background jobs system for Fantasy Survivor.

## Overview

The jobs system uses `node-cron` to schedule and run background tasks automatically. It's designed to be modular and easily extensible.

## Structure

```
jobs/
├── index.js              # Main job scheduler and management
├── surveyReminderJob.js   # Survey reminder job implementation
├── weeklyStatsJob.js      # Example weekly stats job (disabled by default)
└── README.md             # This file
```

## Current Jobs

### Survey Reminder Job
- **Schedule**: Daily at 9:00 AM UTC (`0 9 * * *`)
- **Purpose**: Sends reminder emails to team owners who haven't completed surveys for episodes airing the next day
- **Email Requirements**: Only sends to users with verified emails and poll reminders enabled
- **Email Template**: Uses Mailgun's `surveyreminder` template with the following variables:
  - `firstName`: User's first name (defaults to "Team Owner")
  - `lastName`: User's last name (can be empty)
  - `teamName`: Name of the team that needs to complete the survey
  - `episodeTitle`: Title of the episode airing tomorrow
  - `airDate`: Formatted air date (e.g., "Wednesday, December 4, 2024")
  - `surveyUrl`: Link to the survey page (defaults to `/survey`)

## Adding New Jobs

To add a new background job:

1. **Create the job file** (e.g., `myNewJob.js`):
```javascript
class MyNewJob {
  async execute() {
    try {
      console.log('Running my new job...');
      
      // Your job logic here
      
      return { success: true, message: 'Job completed' };
    } catch (error) {
      console.error('Error in my new job:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new MyNewJob();
```

2. **Add to jobs/index.js**:
```javascript
// Import the job
const myNewJob = require('./myNewJob');

// Add to initializeJobs function
const myNewTask = cron.schedule('0 12 * * 1', () => {
  console.log('Running my new job...');
  myNewJob.execute();
}, {
  scheduled: false
});

activeJobs.set('myNewJob', {
  task: myNewTask,
  schedule: '0 12 * * 1', // Monday at noon
  description: 'Description of what this job does'
});

// Add to triggerJob function
case 'myNewJob':
  return await myNewJob.execute();
```

## Cron Schedule Examples

- `0 9 * * *` - Daily at 9:00 AM
- `0 10 * * 0` - Every Sunday at 10:00 AM
- `0 */6 * * *` - Every 6 hours
- `0 0 1 * *` - First day of every month at midnight
- `30 8 * * 1-5` - Monday to Friday at 8:30 AM

## Management

### Admin Interface
Access the background jobs admin interface at `/admin-jobs` (requires admin privileges).

### API Endpoints
- `GET /api/jobs/status` - Get status of all jobs
- `POST /api/jobs/trigger/:jobName` - Manually trigger a specific job
- `POST /api/jobs/start` - Start all jobs
- `POST /api/jobs/stop` - Stop all jobs

### Manual Testing
You can manually trigger jobs for testing:
```bash
curl -X POST http://localhost:3001/api/jobs/trigger/surveyReminder \
  -H "authorization: YOUR_ADMIN_JWT_TOKEN"
```

## Email Integration

Jobs that send emails should:
1. Check if user has verified email (`emailVerified: true`)
2. Respect user email preferences (`emailPreferences`)
3. Use the `sendEmail` helper from `../helpers/emailUtils`
4. Log success/failure appropriately

## Best Practices

1. **Error Handling**: Always wrap job logic in try-catch blocks
2. **Logging**: Use console.log for normal operations, console.error for errors
3. **Email Preferences**: Always check user preferences before sending emails
4. **Return Values**: Return consistent success/error objects
5. **Testing**: Use the admin interface to test jobs manually
6. **Performance**: For jobs that process many records, consider batching

## Troubleshooting

- **Jobs not running**: Check if they're started via admin interface or server logs
- **Email not sending**: Verify email configuration and user preferences
- **Database errors**: Check model associations and Sequelize queries
- **Timezone issues**: Server runs in UTC, adjust schedules accordingly

## Environment Variables

Jobs may use these environment variables:
- `FRONTEND_URL` - Base URL for frontend links in emails
- `JWT_SECRET` - For API authentication
- Email configuration variables (see email utilities)
