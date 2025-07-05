# Push Notification Deduplication Prevention

## Problem

Desktop browsers and operating systems often deduplicate push notifications that have the same `tag` value. This means when multiple notifications with the same tag are sent in quick succession, only the most recent one is displayed, and previous notifications are replaced.

This was causing issues where:
- Multiple test notifications would only show the last one
- Survey reminders sent to different devices would replace each other
- Users would miss important notifications

## Solution

We've implemented a unique tag generation system that prevents notification deduplication while maintaining meaningful categorization.

### Backend Changes

**File: `server/helpers/pushNotifications.js`**

1. **Unique Tag Generation**: Each notification now gets a unique tag combining:
   - Notification type (e.g., 'survey', 'draft', 'admin_note')
   - Current timestamp
   - Random string
   
   Example: `survey_1703123456789_a7b9c2d1e`

2. **Additional Data**: Each notification includes:
   - `timestamp`: When the notification was created
   - `notificationId`: The unique tag for tracking

```javascript
const timestamp = Date.now();
const uniqueTag = `${data.type || 'general'}_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;
```

### Frontend Changes

**File: `ui/public/firebase-messaging-sw.js`**

1. **Service Worker Updates**:
   - Uses unique tags from backend or generates them if missing
   - Added `renotify: true` to force showing notifications
   - Added `silent: false` to ensure notifications make sound

**File: `ui/src/components/FCMInitializer.jsx`**

1. **Foreground Message Handling**:
   - Generates unique tags for foreground notifications
   - Improved click handling with proper navigation
   - Added `renotify: true` for consistency

### Key Features

1. **Unique Tags**: Every notification gets a unique identifier
2. **Deduplication Prevention**: Multiple notifications will all be displayed
3. **Type Preservation**: Notification type is still available in the data
4. **Click Handling**: Proper navigation based on notification type
5. **Cross-Platform Consistency**: Works the same on all devices

## Testing

The notification system can be tested using the built-in API endpoint:

### Test Push Notification
```bash
# Send a test notification via the API endpoint
curl -X POST http://localhost:3001/api/user/test-push \
  -H "Authorization: <your-jwt-token>" \
  -H "Content-Type: application/json"
```

This will send a test notification to all of the user's registered devices to verify the deduplication prevention is working correctly.

## League Linking for Survey Notifications

### Feature Overview

Survey reminder notifications now intelligently link to specific league pages instead of the generic surveys page, providing a better user experience.

### How It Works

1. **Team-League Association**: When sending survey reminders, the system looks up the user's teams and their associated leagues
2. **Smart URL Generation**: If the user has teams in leagues, the notification links to `/league/{leagueId}` for the first league found
3. **Fallback Behavior**: If no leagues are found, the notification falls back to `/surveys`

### Implementation Details

**Backend (Survey Reminder Job)**:
- Fetches teams with `leagueId` included
- Passes the first available `leagueId` to the notification system
- Maintains backward compatibility for users without teams

**Frontend (Notification Handling)**:
- Prioritizes the `url` field from notification data over hardcoded type mappings
- Maintains fallback behavior for notifications without specific URLs

### Benefits

1. **Context-Aware**: Users are taken directly to where they can complete surveys
2. **Reduced Navigation**: No need to navigate from surveys page to league page
3. **Better UX**: More intuitive workflow for survey completion
4. **Backward Compatible**: Still works for users without teams/leagues

## Benefits

1. **Reliability**: Users receive all notifications sent to them
2. **Better UX**: No missed important notifications
3. **Debug-Friendly**: Each notification is unique and trackable
4. **Scalable**: Works with multiple devices per user

## Technical Notes

### Tag Format
```
{type}_{timestamp}_{randomString}
```
- `type`: survey, draft, admin_note, league, general, etc.
- `timestamp`: Unix timestamp in milliseconds
- `randomString`: 9-character random alphanumeric string

### Notification Data Structure
```javascript
{
  title: "Notification Title",
  body: "Notification body text",
  data: {
    type: "survey",
    url: "/surveys",
    timestamp: "1703123456789",
    notificationId: "survey_1703123456789_a7b9c2d1e",
    // ... other custom data
  }
}
```

### Browser Compatibility

- **Chrome**: Full support for unique tags and renotify
- **Firefox**: Full support for unique tags and renotify
- **Safari**: Limited support, but unique tags still work
- **Edge**: Full support for unique tags and renotify

## Monitoring

To monitor notification delivery:

1. Check browser developer console for service worker logs
2. Check server logs for send success/failure rates
3. Use the test script to verify end-to-end functionality
4. Monitor user feedback for missed notifications

## Future Enhancements

1. **Notification Grouping**: Group related notifications visually while keeping unique tags
2. **Priority Handling**: Different tag formats for different priority levels
3. **Cleanup**: Remove old notification data after a certain time
4. **Analytics**: Track notification open rates and effectiveness
