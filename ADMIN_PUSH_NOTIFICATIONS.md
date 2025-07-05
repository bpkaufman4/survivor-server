# Admin Push Notification Interface

## Overview

The admin push notification interface allows administrators to send test push notifications to specific users and see detailed delivery results.

## Features

### User Selection
- **View All Users**: List all registered users with their names, emails, and verification status
- **Multi-Select**: Choose specific users to send notifications to
- **Select All/Deselect All**: Quickly toggle all users
- **Admin Badge**: Clearly identify admin users
- **Verification Status**: See which users have verified emails

### Notification Composition
- **Title**: Required field (max 100 characters)
- **Body**: Required field (max 300 characters)  
- **Click URL**: Optional custom URL for notification clicks (defaults to "/")
- **Character Counters**: Real-time character counting for title and body
- **Preview**: Live preview of how the notification will appear

### Delivery Results
- **Summary Statistics**: Total users targeted, devices reached, devices failed
- **Detailed Results**: Per-user breakdown showing:
  - User name and email
  - Number of devices reached/failed
  - Success/failure status
- **Error Handling**: Clear error messages for failed deliveries

### FCM Token Debugging
- **View User Tokens**: See all FCM tokens registered for any user
- **Device Information**: View device details for each token
- **Token Status**: Check which tokens are active/inactive

## API Endpoints

### GET /api/user/admin
Returns list of all users for admin selection interface.

**Authentication**: Admin JWT token required

**Response**:
```json
{
  "status": "success",
  "users": [
    {
      "userId": "uuid",
      "name": "John Doe", 
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "emailVerified": true,
      "isAdmin": false
    }
  ]
}
```

### POST /api/user/admin-test-push
Sends push notifications to specified users.

**Authentication**: Admin JWT token required

**Request Body**:
```json
{
  "userIds": ["uuid1", "uuid2"],
  "notification": {
    "title": "Test Notification",
    "body": "This is a test message"
  },
  "data": {
    "url": "/custom-page"
  }
}
```

**Response**:
```json
{
  "status": "success",
  "message": "Admin test notification sent to 2 users",
  "summary": {
    "usersTargeted": 2,
    "totalDevicesReached": 5,
    "totalDevicesFailed": 1
  },
  "results": [
    {
      "userId": "uuid1",
      "userName": "John Doe",
      "email": "john@example.com", 
      "success": true,
      "devicesReached": 3,
      "devicesFailed": 0,
      "error": null
    }
  ]
}
```

## Access

The admin push notification interface is available at:
```
/admin-push-notifications
```

Only users with `isAdmin: true` can access this interface.

## Navigation

The interface is integrated into the existing admin navigation sidebar and can be accessed from any admin page.

## Security

- Admin authentication required
- User data is filtered to only include non-sensitive information
- All push notification data includes admin attribution
- Failed delivery attempts are logged and reported
