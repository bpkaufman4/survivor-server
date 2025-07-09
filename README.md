# React Survivor - Enterprise Backend API

> **A sophisticated Node.js backend API featuring enterprise-grade architecture, real-time communication systems, and advanced notification infrastructure.**

**🌐 Powers: [fantasy-survivor.net](https://fantasy-survivor.net)**

---

## 🚀 **Technical Excellence**

This production-ready, enterprise-scale backend showcases mastery of:

- **Advanced Node.js architecture** with Express.js and enterprise patterns
- **Real-time WebSocket systems** for multi-user collaboration
- **Multi-channel notification infrastructure** using Mailgun and Firebase FCM
- **Complex business logic** implementation with automated workflows
- **Enterprise security patterns** and robust authentication systems
- **Scalable database architecture** with optimized query performance

**Technologies:** Node.js, Express.js, Sequelize ORM, WebSockets, JWT, Mailgun, Firebase FCM, PostgreSQL

---

## � **Enterprise Features & Technical Achievements**

### 🔥 **Real-Time WebSocket Architecture**
**Challenge**: Build a scalable real-time system supporting multiple concurrent draft sessions
**Solution**: 
- Custom WebSocket server with room-based communication
- Event-driven message handling with automatic cleanup
- Connection pooling and state synchronization across clients

### 📧 **Advanced Notification Infrastructure**
**Challenge**: Implement reliable multi-channel notification delivery at enterprise scale
**Solution**:
- **Mailgun Integration**: Template-based email system with variable substitution
- **Firebase FCM Push Notifications**: Cross-platform delivery with user targeting
- **Automated Job System**: Cron-based scheduling for reminders and notifications
- **User Preference Engine**: Granular notification controls with database persistence

### 🔐 **Enterprise Authentication & Security**
**Challenge**: Secure multi-tenant system with granular access control
**Solution**:
- JWT-based stateless authentication
- Role-based permission system (User/Admin/League Owner)
- Middleware-driven route protection and validation
- SQL injection prevention with parameterized queries

### ⚡ **High-Performance Database Architecture**
**Challenge**: Optimize complex relational queries for real-time performance
**Solution**:
- Sequelize ORM with optimized eager loading
- Database indexing and query optimization
- 15+ interconnected models with sophisticated relationships

### 🤖 **Automated Job Processing System**
**Challenge**: Implement reliable background job processing for time-sensitive operations
**Solution**:
- **Draft Management Jobs**: Automated draft progression and timeout handling
- **Survey Reminder System**: Scheduled email notifications before episode deadlines
- **Push Notification Dispatcher**: Targeted message delivery based on user events
- **Cron-based Scheduling**: Reliable job execution with error handling and retries

---

## 🏗️ **Advanced Technical Architecture**

### **Backend Excellence**
```javascript
// Advanced Node.js patterns demonstrated:
- Middleware-driven request pipeline with composable functions
- Event-driven WebSocket architecture with room management
- Repository pattern with Sequelize ORM abstraction
- Dependency injection for testable, modular components
- Error boundary middleware with comprehensive logging
```

### **Real-Time System Design**
```javascript
// WebSocket architecture:
- Multi-room communication with isolated state
- Event broadcasting with targeted message delivery
- Connection lifecycle management with automatic cleanup
- Real-time draft progression with conflict resolution
```

### **Notification System Architecture**
```javascript
// Multi-channel notification flow:
Job Scheduler → Event Triggers → Preference Check → Delivery
├── Mailgun API → Template Engine → SMTP Delivery
└── Firebase FCM → Push Service → Device Targeting
```

### **Automated Job System**
```javascript
// Background job processing:
Cron Scheduler → Job Queue → Worker Processes → Result Handling
├── Draft Management → Timer Progression → Auto-pick Logic
├── Survey Reminders → Email Templates → Delivery Tracking
└── Push Notifications → User Targeting → Device Registration
```

## 🎯 **Core Backend Features**

### � **Real-Time Draft System**
- **WebSocket Server**: Multi-room draft communication with state synchronization
- **Timer Management**: Precision server-side timers with automatic progression
- **Auto-pick Logic**: Intelligent fallback for timeout scenarios
- **Connection Management**: Efficient client lifecycle with automatic cleanup

### 📧 **Enterprise Notification System**
- **Mailgun Integration**: Professional email delivery with template engine
- **Firebase FCM**: Cross-platform push notifications with device targeting
- **User Preferences**: Granular notification controls with database persistence
- **Delivery Tracking**: Comprehensive logging and error handling

### 🤖 **Automated Job Processing**
- **Draft Management Jobs**: Automated draft progression and timeout handling
- **Survey Reminder System**: Scheduled notifications before episode deadlines
- **Push Notification Dispatcher**: Event-driven message delivery
- **Cron Scheduling**: Reliable background task execution

### 🔐 **Authentication & Authorization**
- **JWT Implementation**: Secure stateless authentication with refresh capabilities
- **Role-based Access Control**: Granular permissions (User/Admin/League Owner)
- **Middleware Security**: Request validation and route protection
- **Session Management**: Secure token handling with expiration logic

### � **Database Architecture**
- **15+ Sequelize Models**: Complex relational data with sophisticated associations
- **Query Optimization**: Efficient eager loading and database indexing
- **Transaction Management**: ACID compliance with rollback capabilities
- **Data Validation**: Multi-layer validation with custom business rules

---

## � **Advanced Integration Systems**

### 📧 **Mailgun Email Infrastructure**
```javascript
// Enterprise email capabilities:
✅ Template-based email system with dynamic variable substitution
✅ Transactional email delivery with tracking and analytics
✅ Survey reminders with episode-specific timing
✅ Admin notifications with rich HTML formatting
✅ Password reset flows with secure token handling
✅ Delivery status tracking and error handling
```

### 🔔 **Firebase Cloud Messaging**
```javascript
// Push notification system:
✅ Cross-platform push delivery (Web, iOS, Android)
✅ User device registration and token management
✅ Event-driven notifications (draft picks, survey reminders)
✅ User preference-based targeting and filtering
✅ Rich notification content with custom actions
✅ Delivery analytics and error tracking
```

### 🤖 **Automated Job Processing**
```javascript
// Background job capabilities:
✅ Cron-based scheduling with flexible timing patterns
✅ Draft management automation with timer progression
✅ Survey reminder system with episode-aware scheduling
✅ Push notification dispatching with user targeting
✅ Error handling and retry logic for failed jobs
✅ Job status tracking and performance monitoring
```

### 🌐 **RESTful API Architecture**
```javascript
// Professional API design:
✅ Comprehensive CRUD operations with standardized response formats
✅ Request validation and sanitization middleware
✅ Rate limiting and security headers
✅ API versioning and backward compatibility
✅ Comprehensive documentation and testing
```

---

## 🔒 **Security & Data Protection**

### **Authentication & Authorization**
- JWT-based stateless authentication with refresh token rotation
- Role-based access control (RBAC) with granular permissions
- Password hashing with bcrypt and salt rounds
- Route protection with middleware-based authentication
- Resource-level ownership validation (team/league access)

### **Data Protection & Input Validation**
- Input sanitization and XSS prevention
- SQL injection prevention with parameterized queries
- Sequelize model-level validation with custom validators
- Multi-layer validation for draft picks and user actions
- Environment variable security for sensitive data
- Secure database connections with SSL/TLS
- CORS configuration for cross-origin security

## 📁 Project Structure

```
server/
├── config/
│   └── connection.js        # Database connection configuration
├── controller/              # Route handlers and business logic
│   ├── index.js            # Main router configuration
│   └── api/                # API endpoint implementations
│       ├── admin/          # Admin panel endpoints
│       ├── adminNote/      # Admin communication endpoints
│       ├── draft/          # Draft management API
│       ├── episode/        # Episode management
│       ├── episodeStatistic/ # Episode performance tracking
│       ├── jobs/           # Background job management endpoints
│       ├── league/         # League operations
│       ├── login/          # Authentication endpoints
│       ├── player/         # Player management
│       ├── players/        # Player listing endpoints
│       ├── statistic/      # Statistics management
│       ├── survey/         # Survey system API
│       ├── team/           # Team management
│       ├── tribe/          # Tribe management
│       ├── uploadImage/    # Image upload handling
│       └── user/           # User profile management
├── data/                   # Seed data for development
├── helpers/                # Utility functions
│   ├── emailUtils.js       # Email formatting and utilities
│   └── pushNotifications.js # Push notification service integration
├── jobs/                   # Background job definitions
│   ├── draftManagementJob.js # Automated draft progression
│   ├── index.js            # Job scheduler and management
│   └── surveyReminderJob.js # Survey deadline notifications
├── mail/                   # Email template system
│   ├── adminNote.js        # Admin communication emails
│   ├── emailVerification.js # Account verification emails
│   ├── index.js            # Email service configuration
│   ├── notificationEmail.js # General notification templates
│   ├── passwordReset.js    # Password reset flow
│   └── surveyReminder.js   # Survey deadline reminders
├── models/                 # Sequelize model definitions
│   ├── AdminNote.js        # Admin communication model
│   ├── AnswerOption.js     # Survey answer options
│   ├── Draft.js            # Draft configuration and state
│   ├── DraftOrder.js       # Draft pick order management
│   ├── DraftPick.js        # Individual draft picks
│   ├── Episode.js          # Survivor episode data
│   ├── EpisodeStatistic.js # Player performance tracking
│   ├── League.js           # League configuration
│   ├── Player.js           # Survivor contestant data
│   ├── PlayerTeam.js       # Team roster management
│   ├── Question.js         # Survey questions
│   ├── Statistic.js        # Performance metrics
│   ├── Survey.js           # Survey configuration
│   ├── Team.js             # Fantasy team data
│   ├── TeamAnswer.js       # Survey responses
│   ├── TeamSurvey.js       # Survey participation tracking
│   ├── Tribe.js            # Survivor tribe data
│   ├── User.js             # User account management
│   └── UserFcmToken.js     # Push notification device tokens
├── seeders/                # Database seeding utilities
├── websocket-handlers/     # WebSocket event processors
│   ├── draft-chat.js       # Draft communication
│   ├── helpers.js          # WebSocket utility functions
│   ├── join.js             # Room joining logic
│   ├── pick.js             # Draft pick processing
│   ├── start-timer.js      # Timer initialization
│   └── stop-timer.js       # Timer cleanup
├── cloudflare/             # CDN and deployment configuration
├── package.json            # Dependencies and scripts
├── seedDb.js               # Database initialization script
├── server.js               # Main server entry point
└── websocket.js            # WebSocket server implementation
```

## 🔧 API Endpoints Overview

### Authentication & User Management
- `POST /api/login` - User authentication with JWT token generation
- `GET /api/login/check` - Token validation and session verification
- `GET /api/login/checkAdmin` - Admin role validation
- `GET /api/user/me` - User profile retrieval with preferences
- `POST /api/user/register` - New user account creation
- `POST /api/user/forgot-password` - Password reset initiation
- `POST /api/user/reset-password` - Password reset completion

### League & Team Management
- `GET /api/league/:leagueId` - League details with team standings
- `GET /api/league` - All leagues for current user
- `POST /api/league/join` - Join existing league
- `POST /api/league/add` - Create new league
- `GET /api/team/myTeams` - User's teams across multiple leagues
- `GET /api/team/myTeam/:leagueId` - Detailed team roster and statistics

### Draft System
- `GET /api/draft/:leagueId` - Draft configuration and current state
- `POST /api/draft/start` - Draft initialization with timer setup
- `WebSocket: pick` - Real-time draft pick processing
- `WebSocket: join` - Draft room connection management

### Survey & Polling System
- `GET /api/survey/latest/:leagueId` - Current survey with lockdown status
- `POST /api/survey/submit` - Survey response submission
- `POST /api/survey` - Create new survey (admin)
- `DELETE /api/survey/:surveyId` - Delete survey

### Background Job Management
- `GET /api/jobs/status` - Job scheduler status and active jobs
- `POST /api/jobs/trigger/:jobName` - Manually trigger specific job
- `POST /api/jobs/start` - Start job scheduler
- `POST /api/jobs/stop` - Stop job scheduler

## 🚀 Real-time WebSocket Events

### Connection & Draft Events
- `join` - Client connection to league-specific rooms
- `pick-made` - Real-time draft pick broadcasting
- `draft-timer-started` - Timer synchronization across clients
- `auto-pick-made` - Automatic pick execution and notification
- `draft-complete` - Draft completion status updates
- `draft-chat` - Real-time chat during draft sessions

### State Synchronization
- `league-update` - Real-time league data updates
- `standings-update` - Live standings and scoring updates
- `survey-lockdown` - Survey state changes during episodes
- `disconnect` - Automatic cleanup and resource management

##  Dependencies & Technologies

### Core Backend Stack
- **Express.js**: Web application framework with middleware architecture
- **Sequelize**: Object-Relational Mapping with PostgreSQL/MySQL support
- **jsonwebtoken**: JWT authentication implementation
- **ws**: WebSocket server for real-time communication
- **Mailgun**: Enterprise email delivery service
- **Firebase FCM**: Cross-platform push notification service

## 🐛 Error Handling & Monitoring

### Comprehensive Error Management
- **Try-Catch Blocks**: Proper error boundaries throughout the application
- **User-Friendly Responses**: Structured error responses with appropriate HTTP status codes
- **Graceful Degradation**: Fallback mechanisms for non-critical failures

---

## © **Copyright**

**Copyright © 2025 Brian Kaufman. All Rights Reserved.**

This software is proprietary and confidential. All rights reserved. No part of this software may be reproduced, distributed, or transmitted in any form or by any means without the prior written permission of the author.
