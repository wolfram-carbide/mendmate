# Body Pain Assessment Application

## Overview
An interactive body pain assessment tool that helps users track and document their pain locations, intensity, and related symptoms. The application provides personalized analysis and recommendations based on user input.

## Current State
- **Status**: Full-Featured MVP
- **Last Updated**: December 2024

## Project Architecture

### Frontend (client/)
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: wouter (/, /history)
- **State Management**: React Query + localStorage for persistence

### Backend (server/)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL via Drizzle ORM
- **Storage**: DatabaseStorage with user-scoped assessments
- **Authentication**: Replit OAuth (OIDC)
- **API**: RESTful endpoints for assessment CRUD operations

### Shared (shared/)
- **Schema**: Drizzle ORM tables + Zod schemas for type validation
- **Types**: TypeScript interfaces for User, Assessment, FormData, PainPoint

## Key Features
1. **Interactive Body Diagrams** - SVG-based front and back anatomical views with clickable muscle groups
2. **Paint Mode** - Draw pain points directly on body diagrams with adjustable brush sizes
3. **Pain Assessment Form** - Comprehensive intake form with pain characteristics, history, triggers, and goals
4. **Analysis Engine** - Local analysis based on user input (no external APIs required)
5. **Export Options** - JSON export, PDF medical report generation via pdfmake
6. **Auto-save** - Automatic localStorage persistence during assessment
7. **User Authentication** - Replit OAuth for secure cross-device access
8. **Assessment History** - Timeline view with pain trends, statistics, and comparison
9. **PDF Reports** - Professional medical reports with pain summaries and recommendations

## Pages
- `/` - Main assessment wizard (authenticated)
- `/history` - Assessment history timeline (authenticated)
- Landing page for unauthenticated users

## Security
- Replit OAuth for user authentication
- Session cookies with secure flag in production
- User-scoped data access (users can only see their own assessments)
- All sensitive data (SESSION_SECRET, DATABASE_URL) are stored as environment secrets
- No API keys exposed in frontend

## API Endpoints
- `GET /api/auth/user` - Get current user (null if unauthenticated)
- `GET /api/assessments` - List user's assessments
- `GET /api/assessments/:id` - Get single assessment (user-scoped)
- `POST /api/assessments` - Create new assessment
- `DELETE /api/assessments/:id` - Delete assessment (user-scoped)
- `POST /api/assessments/:id/pdf` - Generate PDF for saved assessment
- `POST /api/assessments/export-pdf` - Generate PDF from request body

## Database Schema
- `users` - User profiles from Replit auth (id, email, firstName, lastName, profileImageUrl)
- `assessments` - Pain assessments linked to users (selectedMuscles, painPoints, formData, analysis)
- `sessions` - Express sessions for auth persistence

## Design Decisions
- Body diagrams scaled to max-w-[140px] on mobile, max-w-[160px] on desktop for comfortable interaction
- Medical-grade color coding for pain intensity (green to red gradient)
- Step-by-step wizard interface for guided assessment flow
- Dark mode support through Tailwind CSS class strategy
- Save button disabled until analysis completes (prevents incomplete data)
- History page shows pain trends with visual bar chart

## User Preferences
- Clean, professional medical UI
- Responsive design for mobile and desktop
- Accessible color contrasts and clear labels
