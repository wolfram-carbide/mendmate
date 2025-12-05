# Body Pain Assessment Application - Design Guidelines

## Design Approach
**System Selected**: Material Design with healthcare adaptations - prioritizing clarity, accessibility, and professional medical aesthetics for a utility-focused health tracking application.

## Core Design Principles
1. **Medical Professionalism**: Clean, trustworthy interface that feels clinical yet approachable
2. **Precision First**: Enable accurate pain location and intensity reporting
3. **Visual Clarity**: High contrast, clear labels, obvious interactive elements
4. **Data Integrity**: Clear visual feedback for all actions and saved states

## Typography System
- **Primary Font**: Inter or Roboto (Google Fonts)
- **Headings**: 600 weight, sizes: text-2xl (h1), text-xl (h2), text-lg (h3)
- **Body Text**: 400 weight, text-base for primary content
- **Labels**: 500 weight, text-sm for form labels and UI labels
- **Data/Numbers**: 600 weight for pain scores and metrics

## Layout & Spacing
**Spacing Scale**: Use Tailwind units 2, 4, 6, and 8 consistently
- Component padding: p-4 to p-6
- Section spacing: space-y-6 for vertical rhythm
- Form field gaps: gap-4
- Button spacing: px-6 py-3

**Critical Body Diagram Sizing**:
- Maximum diagram container: max-w-sm (384px) per view
- Side-by-side front/back views on desktop: grid-cols-2 with gap-8
- Mobile: stack vertically with max-w-xs (320px) for easy thumb reach
- SVG viewBox optimization: Maintain aspect ratio but constrain container size
- Diagram should occupy approximately 40-50% of viewport height maximum

## Component Architecture

### Primary Components
**Body Diagram Panel**
- Two-column layout (front/back) on desktop, stacked on mobile
- Clear "FRONT" / "BACK" labels above each diagram
- Subtle border (border-gray-300) around each diagram container
- Background: white with slight shadow (shadow-sm)

**Control Panel**
- Positioned above or beside diagrams (responsive)
- Toggle buttons for Paint Mode with clear active state
- Brush size selector: Radio buttons with visual size indicators
- Clear All button: Destructive styling (red accent)

**Pain Assessment Form**
- Single column, full-width fields
- Clear section headers (text-lg, font-semibold)
- Pain slider: Full-width with numbered markers (0-10)
- Color-coded gradient: green (0-3) → yellow (4-6) → red (7-10)
- Dropdown selects: border-gray-300, focus:border-blue-500

**Assessment History**
- Card-based layout with temporal grouping
- Each card shows: timestamp, affected areas, pain level
- Quick actions: View, Edit, Delete icons
- Empty state: Friendly illustration or icon with helpful text

### Interactive Elements
**Muscle Selection**
- Hover state: Subtle brightness increase (brightness-95)
- Selected state: Red fill (#fca5a5) with red border (#dc2626)
- Transition: transition-all duration-150
- Group color coding maintained when not selected

**Paint Mode**
- Cursor change to crosshair when active
- Semi-transparent muscle overlay (opacity-60) during painting
- Red gradient pain dots (radial gradient from solid to transparent)
- Touch-optimized for mobile (no hover conflicts)

**Buttons**
- Primary: bg-blue-600 hover:bg-blue-700 text-white
- Secondary: bg-gray-200 hover:bg-gray-300 text-gray-900
- Destructive: bg-red-600 hover:bg-red-700 text-white
- All buttons: rounded-lg px-6 py-3 font-medium transition-colors

## Color Palette
**Functional Colors**:
- Pain intensity: Green (#22c55e) → Yellow (#eab308) → Red (#ef4444) → Dark Red (#991b1b)
- Muscle groups: Maintain existing pastel color coding per GROUP_COLORS
- Selected state: Red (#dc2626) for consistency with pain theme

**UI Colors**:
- Background: bg-gray-50 for page, white for cards/panels
- Borders: border-gray-300 for containers, border-gray-200 for subtle dividers
- Text: text-gray-900 (primary), text-gray-600 (secondary), text-gray-400 (disabled)
- Interactive blue: bg-blue-600 for primary actions

## Security Implementation Notes
- Environment variables for any API integrations (REACT_APP_ prefix)
- No hardcoded keys in frontend code
- Session storage for temporary data only
- Clear privacy messaging if data is stored

## Accessibility Requirements
- All interactive muscle areas have proper title attributes
- Form fields with associated labels (label + htmlFor)
- Pain slider with ARIA labels for screen readers
- Keyboard navigation support for all interactive elements
- Focus visible states (focus:ring-2 focus:ring-blue-500)

## Responsive Behavior
**Desktop (lg+)**:
- Two-column body diagram display
- Form positioned in right panel or below diagrams
- History sidebar or bottom section

**Tablet (md)**:
- Diagrams side-by-side if space permits, otherwise stacked
- Full-width form sections

**Mobile (base)**:
- All elements stack vertically
- Diagrams max-w-xs for easy interaction
- Touch-optimized paint mode
- Sticky action buttons at bottom

## Critical UX Enhancements
1. **Visual Feedback**: Loading states, success confirmations, error messages with AlertCircle icon
2. **Progress Indication**: Multi-step form shows current step clearly
3. **Data Persistence**: Auto-save indicators, manual save confirmation
4. **Clear Actions**: Every interactive element has obvious affordance
5. **Undo/Reset**: Easy recovery from mistakes (undo paint, reset form)

This medical application prioritizes functional clarity over aesthetic flourish - every design decision supports accurate pain reporting and data collection.