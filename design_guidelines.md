# MendMate - Design Guidelines

## Design Approach
**System Selected**: Warm Professional Medical Design - A sophisticated, calming healthcare aesthetic with cream/warm gray palette, muted earth tones, and refined typography that conveys trust and professionalism.

## Core Design Principles
1. **Warm Professionalism**: Inviting yet clinical interface that feels trustworthy and caring
2. **Visual Calm**: Soft shadows, subtle borders, warm neutral tones reduce anxiety
3. **Precision & Clarity**: High contrast text, clear interactive elements, obvious feedback
4. **Medical Grade**: Professional enough for clinical use, approachable for patients

## Color Palette

### Primary Theme Colors
**Primary (Teal)**: `hsl(175 45% 38%)` - Calming, medical, trustworthy
- Used for: Primary buttons, active states, links, focus rings
- Foreground: White for maximum contrast

**Background Tones** (Light Mode):
- Page background: Warm cream `hsl(30 30% 98%)`
- Card background: Slightly warmer `hsl(30 25% 97%)`
- Muted/secondary: Warm gray `hsl(30 15% 92%)`

**Background Tones** (Dark Mode):
- Page background: Warm charcoal `hsl(20 15% 10%)`
- Card background: Slightly lighter `hsl(20 12% 12%)`
- Muted/secondary: Warm dark gray `hsl(20 10% 16%)`

**Text Colors**:
- Primary text: Warm dark `hsl(20 15% 18%)` (light) / `hsl(30 15% 92%)` (dark)
- Muted text: `hsl(20 10% 45%)` (light) / `hsl(30 10% 55%)` (dark)

### Functional Colors
**Pain Intensity Gradient**:
- Low (1-3): Green `hsl(140 40% 40%)`
- Moderate (4-6): Amber/Orange `hsl(25 60% 50%)`
- High (7-10): Red `hsl(0 65% 48%)`

**Status Colors**:
- Success: `hsl(140 40% 40%)`
- Warning: `hsl(45 70% 50%)`
- Error/Destructive: `hsl(0 65% 48%)`

## Typography System
- **Primary Font**: Inter (system-ui fallback)
- **Headings**: 600 weight, tracking-normal
- **Body Text**: 400 weight, generous line-height (1.6)
- **Labels**: 500 weight, text-sm
- **Data/Numbers**: 600 weight for emphasis

## Spacing & Layout
**Border Radius**: Slightly smaller for refined look - `0.375rem` (6px)

**Spacing Scale** (use consistently):
- Micro: 2-4 (tight elements)
- Small: 4-6 (form fields, buttons)
- Medium: 6-8 (section gaps)
- Large: 8-12 (major sections)

**Shadows**: Subtle, warm-tinted shadows using `hsl(20 15% 18%)` base

## Component Styling

### Cards
- Background: `bg-card` (warm cream)
- Border: Subtle `border-card-border`
- Shadow: Minimal, warm-tinted
- Padding: p-4 to p-6

### Buttons
- Primary: Teal background, white text, subtle shadow
- Secondary: Warm gray background
- Ghost: Transparent with warm hover state
- All: Refined border-radius, smooth transitions

### Form Elements
- Input borders: Warm gray `border-input`
- Focus state: Teal ring `ring-primary`
- Labels: Warm dark text, 500 weight

### Body Diagrams
- Container: Soft shadow, warm border
- Background: Slightly elevated card tone
- Muscle hover: Gentle brightness shift
- Selected state: Primary teal with opacity

## Interactive States
- Hover: Subtle elevation using `--elevate-1`
- Active: Slightly more pronounced `--elevate-2`
- Focus: Teal ring (`ring-primary`)
- Disabled: Reduced opacity (0.5)

## Accessibility
- Color contrast: WCAG AA minimum
- Focus indicators: Always visible teal ring
- Touch targets: Minimum 44px
- Labels: Associated with all form controls

## Responsive Design
- Mobile-first approach
- Diagrams scale appropriately (max-w constraints)
- Stacked layouts on mobile
- Touch-optimized interactions

## Design Notes
This warm professional palette was chosen to:
1. Reduce patient anxiety with calming earth tones
2. Maintain clinical credibility with professional appearance
3. Support dark mode for extended use sessions
4. Create visual hierarchy through subtle contrast differences
5. Feel modern yet timeless - avoiding trendy colors that may date quickly
