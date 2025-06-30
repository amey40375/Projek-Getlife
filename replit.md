# replit.md

## Overview

This is a full-stack web application built with React (frontend) and Express.js (backend), featuring a service marketplace platform called "GetLife". The application supports multiple user roles (user, mitra/service provider, admin) with authentication, service booking, real-time chat, and administrative features.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React Context API for authentication, TanStack Query for server state
- **Animations**: Framer Motion for smooth transitions and animations
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Authentication**: Custom implementation using Supabase client integration
- **Session Storage**: PostgreSQL-based session storage with connect-pg-simple
- **Build System**: ESBuild for production bundling

### Project Structure
```
├── client/          # Frontend React application
├── server/          # Backend Express.js application
├── shared/          # Shared TypeScript schemas and types
├── migrations/      # Database migration files
└── dist/           # Production build output
```

## Key Components

### Authentication System
- Multi-role authentication (user, mitra, admin)
- Supabase integration for user management
- Context-based authentication state management
- Protected routes and role-based access control
- Document verification system for service providers

### Database Schema
- **Users/Profiles**: User accounts with role-based permissions
- **Services**: Service catalog with pricing and descriptions
- **Orders**: Booking system with status tracking
- **Chat Messages**: Real-time messaging between users and service providers
- **Banners**: Promotional content management
- **Vouchers**: Discount and promotional voucher system
- **Mitra Verifications**: Document verification for service providers

### User Interface Components
- **Splash Screen**: Animated loading screen with progress indicator
- **Dashboard System**: Role-specific dashboards (User, Mitra, Admin)
- **Service Booking**: Complete booking flow with scheduling and payments
- **Chat System**: Modal-based messaging interface
- **Settings**: User preferences and account management

## Data Flow

### Authentication Flow
1. User registration/login through AuthPage component
2. Supabase handles authentication and session management
3. Profile data fetched and stored in AuthContext
4. Role-based routing to appropriate dashboard

### Service Booking Flow
1. Users browse available services from ServiceBooking component
2. Service selection with date/time scheduling
3. Payment method selection (balance/external)
4. Order creation and mitra notification
5. Status tracking through order lifecycle

### Admin Management Flow
1. Admin dashboard provides verification management
2. Mitra document verification with approval/rejection
3. System-wide statistics and user management
4. Banner and voucher content management

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database operations
- **@supabase/supabase-js**: Authentication and user management
- **@tanstack/react-query**: Server state management
- **framer-motion**: Animation library
- **@radix-ui/***: Accessible UI component primitives

### Development Tools
- **TypeScript**: Type safety across the stack
- **Vite**: Frontend build tool and dev server
- **ESBuild**: Backend bundling for production
- **Tailwind CSS**: Utility-first CSS framework
- **Drizzle Kit**: Database schema management and migrations

## Deployment Strategy

### Build Process
- Frontend builds to `dist/public` directory
- Backend bundles to `dist/index.js` with ESBuild
- Shared schemas compiled for both environments
- Static assets served from Express in production

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Supabase integration via client-side environment variables
- Development mode detection for debugging features
- Production optimizations for both frontend and backend

### Development Workflow
- `npm run dev`: Starts development server with hot reload
- `npm run build`: Creates production build
- `npm run start`: Runs production server
- `npm run db:push`: Applies database schema changes

The application follows a modern full-stack architecture with clear separation of concerns, type safety throughout, and scalable patterns for a service marketplace platform.

## Changelog
```
Changelog:
- June 30, 2025. Initial setup
- June 30, 2025. Successfully migrated from Lovable to Replit with Supabase authentication
- June 30, 2025. Implemented role-based authentication with automatic redirects (admin→/admin-dashboard, mitra→/mitra-dashboard, user→/user-dashboard)
- June 30, 2025. Configured Supabase client with provided credentials for authentication
```

## User Preferences
```
Preferred communication style: Simple, everyday language.
```