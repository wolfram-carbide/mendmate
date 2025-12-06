# MendMate - Your Recovery Companion

## Overview
MendMate is an interactive pain assessment tool that helps users track and document their pain locations, intensity, and related symptoms. The application provides AI-powered analysis and personalized recommendations using Claude.

## Current State
- **Status**: Full-Featured MVP (No Authentication Required)
- **Last Updated**: December 2024

## Project Architecture

### Frontend (client/)
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: wouter (/, /history)
- **State Management**: localStorage for persistence (no auth required)

### Backend (server/)
- **Framework**: Express.js with TypeScript
- **AI Integration**: Anthropic Claude via Replit AI Integrations
- **PDF Generation**: pdfmake for medical report exports
- **API**: RESTful endpoints for AI analysis and PDF export

### Shared (shared/)
- **Schema**: Zod schemas for type validation
- **Types**: TypeScript interfaces for FormData, PainPoint, Assessment

## Key Features
1. **Interactive Body Diagrams** - SVG-based front and back anatomical views with clickable muscle groups (scaled 220px mobile, 280px sm, 320px md for easy interaction)
2. **Paint Mode** - Draw pain points directly on body diagrams with adjustable brush sizes
3. **Pain Assessment Form** - Comprehensive intake form with pain characteristics, history, triggers, and goals
4. **AI Analysis** - Claude-powered analysis with detailed recommendations (uses Replit AI Integrations)
5. **Animated Analysis Loader** - Rotating health facts with progress indicators during AI analysis (framer-motion)
6. **Enhanced Results UI** - Gradient hero sections, section dividers, expandable condition cards, icon-prefixed headers
7. **Export Options** - JSON export, PDF medical report generation via pdfmake with sharing callout
8. **Auto-save** - Automatic localStorage persistence during assessment
9. **Assessment History** - Timeline view with pain trends, statistics, and comparison
10. **PDF Reports** - Professional medical reports with pain summaries and recommendations

## Pages
- `/` - Main assessment wizard (works immediately, no login required)
- `/history` - Assessment history timeline (reads from localStorage)

## Data Storage
- All assessments stored in browser localStorage under key 'assessmentHistory'
- No database required for user data - works offline after initial load
- Data persists in the same browser but not across devices

## API Endpoints (No Authentication Required)
- `POST /api/analyze` - AI-powered pain analysis using Claude
- `POST /api/assessments/export-pdf` - Generate PDF report from assessment data

## Design Theme: Warm Professional Medical
- Soft cream/ivory backgrounds for comfort
- Warm gray text tones for readability
- Muted earth/sage accent colors
- Softer borders and subtle shadows
- Medical-grade color coding for pain intensity (green to red gradient)

## Design Decisions
- Body diagrams scaled to max-w-[220px] on mobile, max-w-[280px] on sm, max-w-[320px] on md for comfortable interaction
- Step-by-step wizard interface for guided assessment flow
- Dark mode support through Tailwind CSS class strategy
- Save button disabled until analysis completes (prevents incomplete data)
- History page shows pain trends with visual bar chart
- No authentication required - immediate access for all users

## User Preferences
- Clean, professional medical UI with warm, approachable aesthetic
- Responsive design for mobile and desktop
- Accessible color contrasts and clear labels
- Works immediately without any login or signup
