# College Placement Portal

## Overview

A comprehensive web-based placement portal designed to connect students with career opportunities through an intuitive platform. The application serves two primary user types: students who can browse and apply for jobs/internships, and recruiters who can post opportunities and manage applications. Built with modern web technologies, the platform provides a seamless experience for career matching and application tracking.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 15 with App Router for server-side rendering and optimal performance
- **UI Components**: shadcn/ui component library built on Radix UI primitives for accessibility and consistency
- **Styling**: Tailwind CSS 4 with custom design system and dark mode support via next-themes
- **Type Safety**: Full TypeScript implementation with Zod schema validation for forms
- **State Management**: Zustand for client-side state with TanStack Query for server state management
- **Forms**: React Hook Form with Zod resolvers for performant form handling and validation

### Backend Architecture
- **Runtime**: Custom Node.js server combining Next.js with Socket.IO for real-time capabilities
- **API Design**: RESTful API routes using Next.js App Router API handlers
- **Authentication**: NextAuth.js with credentials provider supporting role-based access (student/recruiter)
- **Real-time Communication**: Socket.IO integration for live updates and notifications
- **Session Management**: Server-side session handling with role-based route protection

### Database Design
- **Primary Database**: MongoDB with native driver integration
- **Schema Design**: 
  - Students collection with academic and profile information
  - Recruiters collection with company details
  - Jobs collection with requirements and posting details
  - Applications collection linking students to job opportunities
- **Data Relationships**: ObjectId references between collections for normalized data structure
- **Fallback Support**: Prisma ORM configured as secondary option for potential database migration

### Authentication & Authorization
- **Authentication Method**: Credentials-based authentication through NextAuth.js
- **User Types**: Dual role system (student/recruiter) with distinct access patterns
- **Session Strategy**: Server-side session validation with user type enforcement
- **Route Protection**: API route guards based on user roles and authentication status

### Real-time Features
- **WebSocket Integration**: Socket.IO server for live communication
- **Echo Functionality**: Demonstration real-time messaging system
- **Event Handling**: Structured socket event management for scalable real-time features

## External Dependencies

### Core Framework Dependencies
- **Next.js 15**: React framework with App Router and server components
- **React 18**: Component library with modern hooks and concurrent features
- **TypeScript**: Static type checking and enhanced developer experience

### UI and Styling
- **@radix-ui**: Comprehensive suite of accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **Lucide React**: Modern icon library for consistent iconography
- **Framer Motion**: Animation library for enhanced user interactions

### Database and Backend
- **MongoDB**: Document database with native Node.js driver
- **Prisma**: ORM for potential database operations and migrations
- **NextAuth.js**: Authentication library with session management
- **Socket.IO**: Real-time bidirectional communication

### Development Tools
- **Zod**: Schema validation library for type-safe data handling
- **React Hook Form**: Performant form library with validation
- **TanStack Query**: Data fetching and caching solution
- **Axios**: HTTP client for API requests

### Hosting Environment
- **Replit Integration**: Configured for Replit hosting with custom server setup
- **Environment Variables**: MongoDB URI and authentication secrets required
- **Port Configuration**: Flexible port assignment for various hosting environments