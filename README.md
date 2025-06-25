# React Survivor - Backend API

A sophisticated Node.js backend API demonstrating advanced server-side development skills through a comprehensive fantasy league platform featuring real-time WebSocket communication, complex data modeling, and enterprise-level architecture.

## 🎯 Technical Highlights

### **Advanced Node.js Development**
- **Express.js Framework**: RESTful API architecture with middleware-based request handling
- **Real-time Communication**: WebSocket server implementation with connection pooling and event broadcasting
- **Database Architecture**: Sequelize ORM with complex relational models and migrations
- **Authentication & Security**: JWT implementation with role-based access control and secure route protection

### **Enterprise-level Backend Features**
- **Scalable WebSocket Architecture**: Multi-room real-time communication with automatic cleanup and connection management
- **Complex Business Logic**: Draft timer systems, auto-pick functionality, and game state management
- **Data Integrity**: Comprehensive validation, error handling, and transaction management
- **Performance Optimization**: Database query optimization, connection pooling, and efficient data serialization

### **Production-Ready Infrastructure**
- **Environment Configuration**: Flexible deployment configuration with environment-specific settings
- **Error Handling**: Comprehensive error boundaries with detailed logging and user-friendly responses
- **Security Best Practices**: Input sanitization, SQL injection prevention, and secure authentication flows
- **Database Management**: Migration system, seeding capabilities, and data relationship management

## 🏆 Core Backend Features

### 🚀 Real-time Draft System
- **WebSocket Server**: Custom WebSocket implementation supporting multiple concurrent draft rooms
- **Timer Management**: Precision server-side timers with automatic pick execution and state synchronization
- **Connection Pooling**: Efficient client connection management with automatic cleanup and reconnection handling
- **Event Broadcasting**: Targeted message delivery to specific leagues and users with real-time state updates
- **Draft State Management**: Complex draft progression logic with validation and conflict resolution

### 📊 Database Architecture & API Design
- **Relational Data Modeling**: 15+ interconnected models representing complex fantasy league relationships
- **RESTful API Design**: Comprehensive CRUD operations with standardized response formats
- **Query Optimization**: Efficient database queries with eager loading and relationship management
- **Data Validation**: Multi-layer validation using Sequelize validators and custom business logic

### 🔐 Authentication & Authorization
- **JWT Implementation**: Secure token-based authentication with automatic refresh capabilities
- **Role-based Access Control**: Granular permission system distinguishing users, team owners, and administrators
- **Middleware Architecture**: Reusable authentication and authorization middleware for route protection
- **Session Management**: Stateless authentication with secure token handling and validation

### 📈 Business Logic Implementation
- **Draft Management**: Complex draft order generation, pick validation, and auto-pick functionality
- **Scoring Systems**: Automated player scoring based on episode events and performance metrics
- **Survey Management**: Temporal survey states with automatic locking and result aggregation
- **League Administration**: Multi-tenant league management with isolated data and permissions

## 📈 Technical Architecture & Skills Demonstrated

### **Backend Engineering Excellence**
- **Node.js Ecosystem**: Express.js, Sequelize ORM, JWT, WebSocket implementation
- **Database Design**: Complex relational modeling with PostgreSQL/MySQL compatibility
- **API Architecture**: RESTful design principles with consistent response structures
- **Middleware Development**: Custom middleware for authentication, logging, and error handling

### **Real-time System Development**
- **WebSocket Architecture**: Custom WebSocket server with room-based communication
- **Event-driven Programming**: Asynchronous event handling with proper error propagation
- **Connection Management**: Client lifecycle management with cleanup and resource optimization
- **State Synchronization**: Multi-client state coordination with conflict resolution

### **Database & Data Management**
- **ORM Proficiency**: Advanced Sequelize usage with custom associations and validators
- **Query Optimization**: Efficient database queries with proper indexing and eager loading
- **Data Integrity**: Transaction management and referential integrity enforcement

### **Security & Authentication**
- **JWT Security**: Secure token implementation with proper signing and validation
- **Authorization Logic**: Role-based permissions with resource-level access control
- **Secure Communication**: HTTPS enforcement and secure WebSocket connections

### **DevOps & Production Readiness**
- **Environment Management**: Configuration system supporting multiple deployment environments
- **Error Handling**: Comprehensive error logging with detailed stack traces and user notifications
- **Scalability Considerations**: Stateless design enabling horizontal scaling

## 📁 Project Structure

```
server/
├── config/
│   └── connection.js        # Database connection configuration
├── controller/              # Route handlers and business logic
│   ├── index.js            # Main router configuration
│   └── api/                # API endpoint implementations
│       ├── adminNote/      # Admin communication endpoints
│       ├── draft/          # Draft management API
│       ├── episode/        # Episode management
│       ├── league/         # League operations
│       ├── login/          # Authentication endpoints
│       ├── player/         # Player management
│       ├── survey/         # Survey system API
│       ├── team/           # Team management
│       ├── tribe/          # Tribe management
│       └── user/           # User profile management
├── data/                   # Seed data for development
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
│   └── User.js             # User account management
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

## 📈 Project Scope & Complexity

This backend demonstrates enterprise-level development skills through:

- **Microservice Architecture**: Modular controller design supporting independent feature development
- **Real-time Infrastructure**: WebSocket server handling concurrent connections across multiple draft rooms
- **Complex Data Relationships**: 15+ interconnected models with sophisticated association management
- **Business Logic Implementation**: Fantasy league rules, draft mechanics, and scoring algorithms
- **Production Scalability**: Stateless design with database optimization and connection pooling

**Lines of Code**: 5,000+ lines of production-quality Node.js code
**API Endpoints**: 40+ RESTful endpoints with comprehensive CRUD operations
**WebSocket Events**: 10+ real-time event types with complex state management
**Database Models**: 15+ Sequelize models with advanced relationships and validations
**Middleware Functions**: 8+ custom middleware for authentication, validation, and error handling

## 🔧 API Endpoints Overview

### Authentication & User Management
- `POST /api/login` - User authentication with JWT token generation
- `GET /api/login/check` - Token validation and refresh
- `GET /api/user/me` - User profile retrieval
- `PUT /api/user/profile` - Profile updates with validation

### League & Team Management
- `GET /api/league/:id` - League details with team standings
- `GET /api/team/myTeams` - User's teams across multiple leagues
- `GET /api/team/myTeam/:leagueId` - Detailed team roster and statistics
- `POST /api/team/create` - Team creation with validation

### Draft System
- `GET /api/draft/:leagueId` - Draft configuration and current state
- `POST /api/draft/start` - Draft initialization with timer setup
- `WebSocket: pick` - Real-time draft pick processing
- `WebSocket: join` - Draft room connection management

### Survey & Polling
- `GET /api/survey/latest/:leagueId` - Current survey with lockdown status
- `POST /api/survey/submit` - Survey response submission
- `GET /api/survey/results` - Aggregated survey results

### Administrative Functions
- `GET /api/player/admin` - Player database management
- `POST /api/episode/create` - Episode creation and management
- `GET /api/league/admin` - League administration panel
- `POST /api/adminNote/create` - Admin communication system

## 🚀 Real-time WebSocket Events

### Connection Management
- `join` - Client connection to league-specific rooms
- `disconnect` - Automatic cleanup and resource management
- `heartbeat` - Connection health monitoring

### Draft Events
- `pick-made` - Real-time draft pick broadcasting
- `draft-timer-started` - Timer synchronization across clients
- `auto-pick-made` - Automatic pick execution and notification
- `draft-complete` - Draft completion status updates

### State Synchronization
- `league-update` - Real-time league data updates
- `standings-update` - Live standings and scoring updates
- `survey-lockdown` - Survey state changes during episodes

## 🔒 Security Implementation

### Authentication Security
- **JWT Signing**: Secure token generation with environment-specific secrets
- **Token Expiration**: Automatic token expiration with refresh capabilities
- **Route Protection**: Middleware-based authentication for protected endpoints

### Input Validation & Sanitization
- **Sequelize Validation**: Model-level validation with custom validators
- **Request Sanitization**: Input cleaning and SQL injection prevention
- **Business Logic Validation**: Multi-layer validation for draft picks and user actions

### Authorization & Permissions
- **Role-based Access**: User, team owner, and admin permission levels
- **Resource Protection**: Team ownership validation for pick operations
- **Admin Functions**: Secure administrative endpoint protection

## 🚀 Deployment & Configuration

### Environment Configuration
```javascript
// Environment-specific settings
NODE_ENV=production
JWT_SECRET=your-secure-secret
DB_HOST=your-database-host
DB_NAME=your-database-name
CURRENT_SEASON=47
```

## 📊 Dependencies & Technologies

### Core Backend Stack
- **Express.js**: Web application framework with middleware architecture
- **Sequelize**: Object-Relational Mapping with PostgreSQL/MySQL support
- **jsonwebtoken**: JWT authentication implementation
- **ws**: WebSocket server for real-time communication
- **cors**: Cross-origin resource sharing configuration

### Development & Testing
- **nodemon**: Development server with automatic restart
- **dotenv**: Environment variable management

## 🐛 Error Handling & Monitoring

### Comprehensive Error Management
- **Try-Catch Blocks**: Proper error boundaries throughout the application
- **User-Friendly Responses**: Structured error responses with appropriate HTTP status codes
- **Graceful Degradation**: Fallback mechanisms for non-critical failures

## 📄 License

**Proprietary Software - All Rights Reserved**

Copyright (c) 2025 Brian Kaufman. All rights reserved.

This software and its source code are proprietary and confidential. No part of this software may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the copyright owner, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.

**Restrictions:**
- No modification, adaptation, or derivative works are permitted without explicit written consent
- No redistribution, sublicensing, or sale of this software is permitted
- Source code access does not grant any rights to modify or distribute
- All modifications and updates must be performed exclusively by the copyright owner

For permission requests or licensing inquiries, contact the copyright owner.

---

For frontend documentation, please refer to the UI documentation.
