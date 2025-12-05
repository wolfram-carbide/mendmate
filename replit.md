# Body Pain Assessment Application

## Overview
An interactive body pain assessment tool that helps users track and document their pain locations, intensity, and related symptoms. The application provides personalized analysis and recommendations based on user input.

## Current State
- **Status**: MVP Complete
- **Last Updated**: December 2024

## Project Architecture

### Frontend (client/)
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: wouter
- **State Management**: React Query + localStorage for persistence

### Backend (server/)
- **Framework**: Express.js with TypeScript
- **Storage**: In-memory storage (MemStorage)
- **API**: RESTful endpoints for assessment CRUD operations

### Shared (shared/)
- **Schema**: Zod schemas for type validation
- **Types**: TypeScript interfaces for Assessment, FormData, PainPoint

## Key Features
1. **Interactive Body Diagrams** - SVG-based front and back anatomical views with clickable muscle groups
2. **Paint Mode** - Draw pain points directly on body diagrams with adjustable brush sizes
3. **Pain Assessment Form** - Comprehensive intake form with pain characteristics, history, triggers, and goals
4. **Analysis Engine** - Local analysis based on user input (no external APIs required)
5. **Export/Import** - JSON export and import for assessment data
6. **Auto-save** - Automatic localStorage persistence

## Security
- No API keys are exposed in the frontend
- All sensitive data (SESSION_SECRET, DATABASE_URL) are stored as environment secrets
- Session management uses secure cookies
- No external API calls that require authentication

## API Endpoints
- `GET /api/assessments` - List all assessments
- `GET /api/assessments/:id` - Get single assessment
- `POST /api/assessments` - Create new assessment
- `DELETE /api/assessments/:id` - Delete assessment

## Design Decisions
- Body diagrams scaled to max-w-[140px] on mobile, max-w-[160px] on desktop for comfortable interaction
- Medical-grade color coding for pain intensity (green to red gradient)
- Step-by-step wizard interface for guided assessment flow
- Dark mode support through Tailwind CSS class strategy

## User Preferences
- Clean, professional medical UI
- Responsive design for mobile and desktop
- Accessible color contrasts and clear labels
