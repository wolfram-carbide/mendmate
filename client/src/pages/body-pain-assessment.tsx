import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  Activity,
  Clock,
  Dumbbell,
  Heart,
  Brain,
  Trash2,
  RotateCcw,
  Circle,
  Download,
  Upload,
  Loader2,
  FileText,
  History,
  Save,
  BookOpen,
  Shield,
  Share2,
  Plus,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { Logo } from '@/components/Logo';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import type { FormData, PainPoint, Assessment } from '@shared/schema';

const MUSCLES_FRONT: Record<string, { path: string; label: string; group: string }> = {
  head: { 
    path: "M180,12 C155,12 140,35 140,65 C140,90 155,108 180,112 C205,108 220,90 220,65 C220,35 205,12 180,12 Z",
    label: "Head", 
    group: "head"
  },
  neck: { 
    path: "M160,112 L200,112 L205,140 L155,140 Z",
    label: "Neck", 
    group: "neck"
  },
  leftDeltoid: { 
    path: "M155,140 L140,140 C115,140 100,160 95,185 L95,210 L120,210 L130,180 L155,165 Z",
    label: "Left Deltoid", 
    group: "shoulder"
  },
  rightDeltoid: { 
    path: "M205,140 L220,140 C245,140 260,160 265,185 L265,210 L240,210 L230,180 L205,165 Z",
    label: "Right Deltoid", 
    group: "shoulder"
  },
  leftPec: { 
    path: "M155,140 L180,140 L180,210 L130,210 L130,180 L155,165 Z",
    label: "Left Pec", 
    group: "chest"
  },
  rightPec: { 
    path: "M205,140 L180,140 L180,210 L230,210 L230,180 L205,165 Z",
    label: "Right Pec", 
    group: "chest"
  },
  leftBicep: { 
    path: "M95,210 L130,210 L125,290 L90,290 Z",
    label: "Left Bicep", 
    group: "upperArm"
  },
  rightBicep: { 
    path: "M265,210 L230,210 L235,290 L270,290 Z",
    label: "Right Bicep", 
    group: "upperArm"
  },
  leftForearm: { 
    path: "M90,290 L125,290 L120,380 L85,380 Z",
    label: "Left Forearm", 
    group: "forearm"
  },
  rightForearm: { 
    path: "M270,290 L235,290 L240,380 L275,380 Z",
    label: "Right Forearm", 
    group: "forearm"
  },
  leftHand: { 
    path: "M85,380 L120,380 L118,420 L83,420 Z",
    label: "Left Hand", 
    group: "hand"
  },
  rightHand: { 
    path: "M275,380 L240,380 L242,420 L277,420 Z",
    label: "Right Hand", 
    group: "hand"
  },
  upperAbs: { 
    path: "M145,210 L215,210 L215,260 L145,260 Z",
    label: "Upper Abs", 
    group: "abs"
  },
  leftOblique: { 
    path: "M130,210 L145,210 L145,310 L125,310 L125,250 Z",
    label: "Left Oblique", 
    group: "abs"
  },
  rightOblique: { 
    path: "M230,210 L215,210 L215,310 L235,310 L235,250 Z",
    label: "Right Oblique", 
    group: "abs"
  },
  lowerAbs: { 
    path: "M145,260 L215,260 L220,310 L140,310 Z",
    label: "Lower Abs", 
    group: "abs"
  },
  leftHipFlexor: { 
    path: "M125,310 L160,310 L155,355 L120,355 Z",
    label: "Left Hip Flexor", 
    group: "hip"
  },
  rightHipFlexor: { 
    path: "M235,310 L200,310 L205,355 L240,355 Z",
    label: "Right Hip Flexor", 
    group: "hip"
  },
  groin: { 
    path: "M160,310 L200,310 L200,355 L160,355 Z",
    label: "Groin/Adductors", 
    group: "hip"
  },
  leftQuad: { 
    path: "M120,355 L175,355 L170,480 L115,480 Z",
    label: "Left Quad", 
    group: "thigh"
  },
  rightQuad: { 
    path: "M240,355 L185,355 L190,480 L245,480 Z",
    label: "Right Quad", 
    group: "thigh"
  },
  leftKnee: { 
    path: "M115,480 L170,480 L168,520 L113,520 Z",
    label: "Left Knee", 
    group: "knee"
  },
  rightKnee: { 
    path: "M245,480 L190,480 L192,520 L247,520 Z",
    label: "Right Knee", 
    group: "knee"
  },
  leftShin: { 
    path: "M113,520 L168,520 L162,630 L107,630 Z",
    label: "Left Shin", 
    group: "lowerLeg"
  },
  rightShin: { 
    path: "M247,520 L192,520 L198,630 L253,630 Z",
    label: "Right Shin", 
    group: "lowerLeg"
  },
  leftAnkle: { 
    path: "M107,630 L162,630 L160,660 L105,660 Z",
    label: "Left Ankle", 
    group: "ankle"
  },
  rightAnkle: { 
    path: "M253,630 L198,630 L200,660 L255,660 Z",
    label: "Right Ankle", 
    group: "ankle"
  },
  leftFoot: { 
    path: "M100,660 L165,660 L170,695 L95,695 Z",
    label: "Left Foot", 
    group: "foot"
  },
  rightFoot: { 
    path: "M260,660 L195,660 L190,695 L265,695 Z",
    label: "Right Foot", 
    group: "foot"
  },
};

const MUSCLES_BACK: Record<string, { path: string; label: string; group: string }> = {
  headBack: { 
    path: "M180,12 C155,12 140,35 140,65 C140,90 155,108 180,112 C205,108 220,90 220,65 C220,35 205,12 180,12 Z",
    label: "Head", 
    group: "head"
  },
  upperTraps: { 
    path: "M155,112 L205,112 L230,140 L130,140 Z",
    label: "Upper Traps", 
    group: "neck"
  },
  leftTrap: { 
    path: "M130,140 L165,140 L165,200 L115,200 L100,170 Z",
    label: "Left Trapezius", 
    group: "upperBack"
  },
  rightTrap: { 
    path: "M230,140 L195,140 L195,200 L245,200 L260,170 Z",
    label: "Right Trapezius", 
    group: "upperBack"
  },
  leftRhomboid: { 
    path: "M165,140 L180,140 L180,200 L165,200 Z",
    label: "Left Rhomboid", 
    group: "upperBack"
  },
  rightRhomboid: { 
    path: "M195,140 L180,140 L180,200 L195,200 Z",
    label: "Right Rhomboid", 
    group: "upperBack"
  },
  leftRearDelt: { 
    path: "M130,140 L100,170 L95,210 L120,210 L115,200 Z",
    label: "Left Rear Delt", 
    group: "shoulder"
  },
  rightRearDelt: { 
    path: "M230,140 L260,170 L265,210 L240,210 L245,200 Z",
    label: "Right Rear Delt", 
    group: "shoulder"
  },
  leftTricep: { 
    path: "M95,210 L130,210 L125,290 L90,290 Z",
    label: "Left Tricep", 
    group: "upperArm"
  },
  rightTricep: { 
    path: "M265,210 L230,210 L235,290 L270,290 Z",
    label: "Right Tricep", 
    group: "upperArm"
  },
  leftForearmBack: { 
    path: "M90,290 L125,290 L120,380 L85,380 Z",
    label: "Left Forearm", 
    group: "forearm"
  },
  rightForearmBack: { 
    path: "M270,290 L235,290 L240,380 L275,380 Z",
    label: "Right Forearm", 
    group: "forearm"
  },
  leftHandBack: { 
    path: "M85,380 L120,380 L118,420 L83,420 Z",
    label: "Left Hand", 
    group: "hand"
  },
  rightHandBack: { 
    path: "M275,380 L240,380 L242,420 L277,420 Z",
    label: "Right Hand", 
    group: "hand"
  },
  leftLat: { 
    path: "M115,200 L145,200 L140,280 L120,300 L110,260 Z",
    label: "Left Lat", 
    group: "midBack"
  },
  rightLat: { 
    path: "M245,200 L215,200 L220,280 L240,300 L250,260 Z",
    label: "Right Lat", 
    group: "midBack"
  },
  spinalErectors: { 
    path: "M145,200 L215,200 L220,280 L240,300 L235,320 L125,320 L120,300 L140,280 Z",
    label: "Spinal Erectors", 
    group: "midBack"
  },
  leftLowerBack: { 
    path: "M125,320 L160,320 L155,360 L120,360 Z",
    label: "Left Lower Back", 
    group: "lowerBack"
  },
  rightLowerBack: { 
    path: "M235,320 L200,320 L205,360 L240,360 Z",
    label: "Right Lower Back", 
    group: "lowerBack"
  },
  sacrum: { 
    path: "M160,320 L200,320 L200,360 L160,360 Z",
    label: "Sacrum/SI Joint", 
    group: "lowerBack"
  },
  leftGlute: { 
    path: "M120,360 L180,360 L175,430 L115,430 Z",
    label: "Left Glute", 
    group: "glute"
  },
  rightGlute: { 
    path: "M240,360 L180,360 L185,430 L245,430 Z",
    label: "Right Glute", 
    group: "glute"
  },
  leftHamstring: { 
    path: "M115,430 L175,430 L170,520 L110,520 Z",
    label: "Left Hamstring", 
    group: "hamstring"
  },
  rightHamstring: { 
    path: "M245,430 L185,430 L190,520 L250,520 Z",
    label: "Right Hamstring", 
    group: "hamstring"
  },
  leftCalf: { 
    path: "M110,520 L170,520 L165,630 L105,630 Z",
    label: "Left Calf", 
    group: "calf"
  },
  rightCalf: { 
    path: "M250,520 L190,520 L195,630 L255,630 Z",
    label: "Right Calf", 
    group: "calf"
  },
  leftAchilles: { 
    path: "M105,630 L165,630 L162,660 L102,660 Z",
    label: "Left Achilles", 
    group: "ankle"
  },
  rightAchilles: { 
    path: "M255,630 L195,630 L198,660 L258,660 Z",
    label: "Right Achilles", 
    group: "ankle"
  },
  leftHeel: { 
    path: "M98,660 L167,660 L172,695 L93,695 Z",
    label: "Left Heel", 
    group: "foot"
  },
  rightHeel: { 
    path: "M262,660 L193,660 L188,695 L267,695 Z",
    label: "Right Heel", 
    group: "foot"
  },
};

const GROUP_COLORS: Record<string, string> = {
  head: '#e0e7ff',
  neck: '#ddd6fe',
  shoulder: '#fbcfe8',
  chest: '#fecaca',
  upperArm: '#fed7aa',
  forearm: '#fef08a',
  hand: '#d9f99d',
  abs: '#bbf7d0',
  hip: '#99f6e4',
  thigh: '#a5f3fc',
  knee: '#bae6fd',
  lowerLeg: '#c7d2fe',
  ankle: '#ddd6fe',
  foot: '#f5d0fe',
  upperBack: '#fecaca',
  midBack: '#fed7aa',
  lowerBack: '#fef08a',
  glute: '#bbf7d0',
  hamstring: '#a5f3fc',
  calf: '#bae6fd',
};

interface AnatomicalBodyProps {
  muscles: Record<string, { path: string; label: string; group: string }>;
  selectedMuscles: string[];
  onMuscleClick: (muscle: string) => void;
  paintMode: boolean;
  painPoints: PainPoint[];
  onPaint: (point: PainPoint) => void;
  brushSize: number;
  viewLabel: string;
}

function AnatomicalBody({ 
  muscles, 
  selectedMuscles, 
  onMuscleClick, 
  paintMode, 
  painPoints, 
  onPaint,
  brushSize,
  viewLabel 
}: AnatomicalBodyProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isPainting, setIsPainting] = useState(false);

  const getCoords = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * 360,
      y: ((clientY - rect.top) / rect.height) * 700
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!paintMode) return;
    e.preventDefault();
    setIsPainting(true);
    const coords = getCoords(e);
    if (coords) onPaint({ ...coords, view: viewLabel, size: brushSize });
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!paintMode || !isPainting) return;
    e.preventDefault();
    const coords = getCoords(e);
    if (coords) onPaint({ ...coords, view: viewLabel, size: brushSize });
  };

  const handleEnd = () => setIsPainting(false);

  return (
    <svg 
      ref={svgRef}
      viewBox="0 0 360 700" 
      className={`w-full h-full select-none ${paintMode ? 'cursor-crosshair' : 'cursor-pointer'}`}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      data-testid={`body-diagram-${viewLabel.toLowerCase()}`}
    >
      <defs>
        <filter id={`glow-${viewLabel}`}>
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id={`painGrad-${viewLabel}`}>
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2"/>
        </radialGradient>
      </defs>
      
      <ellipse cx="180" cy="705" rx="70" ry="8" fill="#00000008"/>
      
      {Object.entries(muscles).map(([key, muscle]) => {
        const isSelected = selectedMuscles.includes(key);
        const baseColor = GROUP_COLORS[muscle.group] || '#f3f4f6';
        
        return (
          <path
            key={key}
            d={muscle.path}
            fill={isSelected ? '#fca5a5' : baseColor}
            stroke={isSelected ? '#dc2626' : '#9ca3af'}
            strokeWidth={isSelected ? 2 : 0.5}
            className={`transition-all duration-150 ${!paintMode ? 'hover:brightness-90' : ''}`}
            onClick={(e) => {
              if (!paintMode) {
                e.stopPropagation();
                onMuscleClick(key);
              }
            }}
            filter={isSelected ? `url(#glow-${viewLabel})` : 'none'}
            style={{ opacity: paintMode ? 0.6 : 1 }}
            data-testid={`muscle-${key}`}
          >
            <title>{muscle.label}</title>
          </path>
        );
      })}
      
      {painPoints
        .filter(p => p.view === viewLabel)
        .map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={point.size || 10}
            fill={`url(#painGrad-${viewLabel})`}
            className="pointer-events-none"
          />
        ))
      }
      
      <text x="180" y="720" textAnchor="middle" className="text-[11px] fill-muted-foreground font-medium select-none">
        {viewLabel}
      </text>
    </svg>
  );
}

interface PainSliderProps {
  value: number | null;
  onChange: (value: number) => void;
  required?: boolean;
}

function PainSlider({ value, onChange, required }: PainSliderProps) {
  const colors = ['#22c55e', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#ef4444', '#dc2626', '#dc2626', '#991b1b'];
  const labels = ['Minimal', 'Mild', 'Mild', 'Moderate', 'Moderate', 'Significant', 'Significant', 'Severe', 'Severe', 'Extreme'];

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-foreground">Pain intensity</span>
        {value !== null ? (
          <span
            className="px-3 py-1 rounded-full text-white text-sm font-semibold"
            style={{ backgroundColor: colors[value - 1] }}
            data-testid="pain-level-badge"
          >
            {value}/10 — {labels[value - 1]}
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-semibold">
            Not set
          </span>
        )}
      </div>
      <div className="relative pt-1">
        <div
          className="absolute inset-0 h-2 rounded-full mt-1"
          style={{ background: 'linear-gradient(to right, #22c55e, #84cc16, #eab308, #f97316, #ef4444, #991b1b)' }}
        />
        <Slider
          value={[value ?? 5]}
          onValueChange={(v) => onChange(v[0])}
          min={1}
          max={10}
          step={1}
          className="relative"
          data-testid="pain-slider"
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}

interface ChipProps {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  testId?: string;
}

function Chip({ selected, onClick, children, testId }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
        selected
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card text-card-foreground border-border hover:border-primary/50'
      }`}
      data-testid={testId}
    >
      {children}
    </button>
  );
}

interface RequiredDotProps {
  completed: boolean;
}

function RequiredDot({ completed }: RequiredDotProps) {
  return (
    <div
      className={`w-2 h-2 rounded-full flex-shrink-0 ${
        completed ? 'bg-green-500' : 'bg-destructive'
      }`}
      title={completed ? 'Completed' : 'Required'}
    />
  );
}

interface SectionHeaderProps {
  icon: React.ReactNode;
  title: string;
  required?: boolean;
  completed?: boolean;
}

function SectionHeader({ icon, title, required, completed }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2">
      {required && <RequiredDot completed={completed || false} />}
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h3 className="text-base font-bold text-foreground uppercase tracking-wide">
        {title}
      </h3>
      {completed && (
        <Check className="w-4 h-4 text-green-500 ml-auto" />
      )}
    </div>
  );
}

interface IntakeFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
}

function IntakeForm({ formData, setFormData }: IntakeFormProps) {
  const painTypes = ['Sharp/Stabbing', 'Dull/Aching', 'Burning', 'Throbbing', 'Tight/Stiff', 'Shooting/Electric', 'Numbness/Tingling'];
  const durations = ['< 1 week', '1-4 weeks', '1-3 months', '3-6 months', '6+ months', '> 1 year'];
  const frequencies = ['Constant', 'Daily', 'Few times/week', 'Weekly', 'Occasional'];
  const causes = ['Sudden movement', 'Lifted wrong', 'Fall/Impact', 'Overuse', 'Gradual/Unknown'];
  const activities = ['Weight Training', 'Running', 'Cycling', 'Swimming', 'CrossFit/HIIT', 'Team Sports', 'Yoga/Pilates', 'Other'];
  const intensities = ['Light', 'Moderate', 'Intense'];

  // Check completion status
  const painProfileComplete = formData.painLevel !== null &&
    formData.painTypes.length > 0 &&
    formData.frequency !== '';

  const historyComplete = formData.duration !== '' &&
    formData.story.trim() !== '';

  return (
    <div className="space-y-6">
      {/* CARD 1: Pain Profile (Required) */}
      <Card className="p-6 border-l-4 border-l-primary/40">
        <div className="space-y-5">
          <SectionHeader
            icon={<Activity className="w-4 h-4 text-primary" />}
            title="Pain Profile"
            required
            completed={painProfileComplete}
          />

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <RequiredDot completed={formData.painLevel !== null} />
                <label className="block text-sm font-medium text-foreground">How bad is it right now?</label>
              </div>
              <PainSlider
                value={formData.painLevel}
                onChange={(v) => setFormData({...formData, painLevel: v})}
                required
              />
              <p className="text-xs text-muted-foreground mt-2">This helps us understand the severity</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <RequiredDot completed={formData.painTypes.length > 0} />
                <label className="block text-sm font-medium text-foreground">What does it feel like?</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {painTypes.map(type => (
                  <Chip
                    key={type}
                    selected={formData.painTypes?.includes(type)}
                    onClick={() => {
                      const types = formData.painTypes?.includes(type)
                        ? formData.painTypes.filter(t => t !== type)
                        : [...(formData.painTypes || []), type];
                      setFormData({...formData, painTypes: types});
                    }}
                    testId={`chip-pain-type-${type.toLowerCase().replace(/\//g, '-')}`}
                  >
                    {type}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <RequiredDot completed={formData.frequency !== ''} />
                <label className="block text-sm font-medium text-foreground">How often does it happen?</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {frequencies.map(freq => (
                  <Chip
                    key={freq}
                    selected={formData.frequency === freq}
                    onClick={() => setFormData({...formData, frequency: freq})}
                    testId={`chip-frequency-${freq.toLowerCase().replace(/\//g, '-')}`}
                  >
                    {freq}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* CARD 2: Injury History (Required) */}
      <Card className="p-6 border-l-4 border-l-primary/40">
        <div className="space-y-5">
          <SectionHeader
            icon={<Clock className="w-4 h-4 text-primary" />}
            title="Injury History"
            required
            completed={historyComplete}
          />

          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <RequiredDot completed={formData.duration !== ''} />
                <label className="block text-sm font-medium text-foreground">How long have you had this?</label>
              </div>
              <div className="flex flex-wrap gap-2">
                {durations.map(dur => (
                  <Chip
                    key={dur}
                    selected={formData.duration === dur}
                    onClick={() => setFormData({...formData, duration: dur})}
                    testId={`chip-duration-${dur.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {dur}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">What might have caused it?</label>
              <div className="flex flex-wrap gap-2">
                {causes.map(cause => (
                  <Chip
                    key={cause}
                    selected={formData.causes?.includes(cause)}
                    onClick={() => {
                      const c = formData.causes?.includes(cause)
                        ? formData.causes.filter(x => x !== cause)
                        : [...(formData.causes || []), cause];
                      setFormData({...formData, causes: c});
                    }}
                    testId={`chip-cause-${cause.toLowerCase().replace(/\//g, '-')}`}
                  >
                    {cause}
                  </Chip>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <RequiredDot completed={formData.story.trim() !== ''} />
                <label className="block text-sm font-medium text-foreground">Tell us more about how it happened</label>
              </div>
              <Textarea
                value={formData.story || ''}
                onChange={(e) => setFormData({...formData, story: e.target.value})}
                placeholder="Example: I was deadlifting and felt a sharp pain in my lower back on the third rep. It's been achy ever since..."
                className="resize-none min-h-[120px]"
                rows={5}
                data-testid="input-story"
              />
              <p className="text-xs text-muted-foreground mt-2">Understanding the context helps us give better guidance</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">Is it getting better or worse?</label>
              <div className="flex flex-wrap gap-2">
                {['Getting worse', 'No change', 'Slowly improving'].map(status => (
                  <Chip
                    key={status}
                    selected={formData.progress === status}
                    onClick={() => setFormData({...formData, progress: status})}
                    testId={`chip-progress-${status.toLowerCase().replace(/\s/g, '-')}`}
                  >
                    {status}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* CARD 3: Additional Context (Optional) */}
      <Card className="p-6">
        <div className="space-y-5">
          <SectionHeader
            icon={<Heart className="w-4 h-4 text-primary" />}
            title="Additional Context"
          />

          <div className="space-y-6">
            <div className="space-y-4 pb-6 border-b border-border">
              <h4 className="text-sm font-semibold text-foreground">Triggers & Relief</h4>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">What makes it worse? What helps?</label>
                <Textarea
                  value={formData.triggersAndRelief || ''}
                  onChange={(e) => setFormData({...formData, triggersAndRelief: e.target.value})}
                  placeholder="Example: Sitting for long periods makes it worse. Standing and walking around helps. Heat provides temporary relief..."
                  className="resize-none min-h-[100px]"
                  rows={4}
                  data-testid="input-triggers-relief"
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">What have you tried so far?</label>
                <Textarea
                  value={formData.triedSoFar || ''}
                  onChange={(e) => setFormData({...formData, triedSoFar: e.target.value})}
                  placeholder="Example: Ice packs for 3 days, ibuprofen, foam rolling, stretching hamstrings..."
                  className="resize-none min-h-[100px]"
                  rows={4}
                  data-testid="input-tried-so-far"
                />
              </div>
            </div>

            <div className="space-y-4 pb-6 border-b border-border">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-primary" />
                Your Activity Level
              </h4>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">What activities do you do?</label>
                <div className="flex flex-wrap gap-2">
                  {activities.map(act => (
                    <Chip
                      key={act}
                      selected={formData.activities?.includes(act)}
                      onClick={() => {
                        const a = formData.activities?.includes(act)
                          ? formData.activities.filter(x => x !== act)
                          : [...(formData.activities || []), act];
                        setFormData({...formData, activities: a});
                      }}
                      testId={`chip-activity-${act.toLowerCase().replace(/\//g, '-')}`}
                    >
                      {act}
                    </Chip>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-2">Typical intensity</label>
                <div className="flex flex-wrap gap-2">
                  {intensities.map(int => (
                    <Chip
                      key={int}
                      selected={formData.intensity === int}
                      onClick={() => setFormData({...formData, intensity: int})}
                      testId={`chip-intensity-${int.toLowerCase()}`}
                    >
                      {int}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Brain className="w-4 h-4 text-primary" />
                Your Goal
              </h4>
              <Textarea
                value={formData.goals || ''}
                onChange={(e) => setFormData({...formData, goals: e.target.value})}
                placeholder="Example: I want to get back to running 5k without pain, or be able to pick up my kids without wincing..."
                className="resize-none min-h-[100px]"
                rows={4}
                data-testid="input-goals"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

interface BrushSelectorProps {
  size: number;
  setSize: (size: number) => void;
}

function BrushSelector({ size, setSize }: BrushSelectorProps) {
  const sizes = [
    { value: 6, label: 'S' },
    { value: 12, label: 'M' },
    { value: 20, label: 'L' }
  ];

  return (
    <div className="flex items-center gap-1 bg-muted rounded-full p-1">
      {sizes.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setSize(value)}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            size === value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/80'
          }`}
          data-testid={`brush-size-${label.toLowerCase()}`}
        >
          <Circle className={`${value === 6 ? 'w-2 h-2' : value === 12 ? 'w-3 h-3' : 'w-4 h-4'}`} fill="currentColor" />
        </button>
      ))}
    </div>
  );
}

function generateMockAnalysis(selectedMuscles: string[], formData: FormData) {
  const allMuscles = { ...MUSCLES_FRONT, ...MUSCLES_BACK };
  const muscleLabels = selectedMuscles.map(m => allMuscles[m]?.label || m);

  const painLevel = formData.painLevel ?? 5; // Default to 5 if null (shouldn't happen in practice)
  const isAcute = formData.duration === '< 1 week' || formData.duration === '1-4 weeks';
  const isChronic = formData.duration === '6+ months' || formData.duration === '> 1 year';
  
  let urgency = 'moderate';
  let urgencyMessage = 'Monitor and manage with appropriate care';
  
  if (painLevel >= 8) {
    urgency = 'high';
    urgencyMessage = 'Consider consulting a healthcare professional soon';
  } else if (painLevel <= 3) {
    urgency = 'low';
    urgencyMessage = 'Self-management is typically appropriate';
  }

  const possibleConditions = [
    { 
      name: `${muscleLabels[0]} Strain`, 
      likelihood: painLevel >= 5 ? 'Likely' : 'Possible',
      description: `Overstretching or minor tearing of the ${muscleLabels[0]?.toLowerCase() || 'affected'} muscle fibers`
    },
    { 
      name: 'Muscle Tension', 
      likelihood: 'Possible',
      description: 'Chronic tightness often from posture, stress, or overuse'
    },
    {
      name: 'Referred Pain',
      likelihood: 'Consider',
      description: 'Pain may originate from a different area and radiate to this location'
    }
  ];

  const watchFor = [
    'Sharp, severe pain that stops you mid-movement',
    'Significant swelling or warmth in the area',
    'Numbness or tingling spreading to other areas',
    'Inability to bear weight or use the affected area',
    'Symptoms worsening despite rest'
  ];

  const recoveryPrinciples = [
    'Load management - gradually adjust activity levels as symptoms allow',
    'Progressive tissue adaptation - slowly increase demands over time',
    'Active recovery - gentle movement often helps more than complete rest',
    'Consistency over intensity - daily gentle care beats sporadic aggressive treatment',
    'Listen to your body - pain is information, not just something to push through'
  ];

  const avoid = [
    'Heavy lifting or high-impact activities until symptoms improve',
    'Prolonged static positions that aggravate the area',
    'Training through sharp or increasing pain',
    'Complete immobilization (some movement is usually beneficial)'
  ];

  const safeToTry = [
    'Gentle range of motion exercises within pain-free range',
    'Light walking to maintain blood flow',
    'Heat or ice application as feels comfortable',
    'Gentle stretching without forcing',
    'Low-impact activities like swimming if tolerable'
  ];

  const timeline = isChronic 
    ? 'With consistent daily attention, you should notice gradual improvement over 2-3 months. Chronic conditions respond best to steady, patient care rather than quick fixes. Small improvements compound over time.'
    : isAcute 
      ? 'Most acute issues show meaningful improvement within 2-4 weeks with proper care. You should notice gradual progress, with good and less-good days being normal. Full return to activity typically takes 4-8 weeks.'
      : 'Sub-acute conditions often respond well within 4-8 weeks of consistent management. The key is daily attention rather than expecting dramatic overnight changes.';

  const hasStory = formData.story && formData.story.trim().length > 0;
  const hasGoals = formData.goals && formData.goals.trim().length > 0;
  const hasTriggers = formData.triggersAndRelief && formData.triggersAndRelief.trim().length > 0;
  const hasProgress = formData.progress && formData.progress.trim().length > 0;
  
  const storyContext = hasStory 
    ? ` What you described - "${formData.story.slice(0, 80)}${formData.story.length > 80 ? '...' : ''}" - helps me understand the context.`
    : '';
  const goalsContext = hasGoals ? ` I hear that your goal is ${formData.goals.toLowerCase()}.` : '';
  const triggersContext = hasTriggers ? ` It is helpful to know that ${formData.triggersAndRelief.toLowerCase()}.` : '';
  const progressContext = hasProgress ? ` And I can see that ${formData.progress.toLowerCase()}.` : '';
  
  const understandingWhatsHappening = `The ${muscleLabels.join(' and ')} ${muscleLabels.length > 1 ? 'areas are' : 'area is'} part of a connected system of muscles, tendons, and joints that work together. When one area experiences stress or strain, it can affect the entire kinetic chain. Your ${formData.painTypes?.includes('Tight/Stiff') ? 'stiffness' : 'discomfort'} likely reflects your body's protective response to perceived threat or overload. This is actually your body doing its job - signaling that something needs attention.${hasTriggers ? ` The fact that certain things help or worsen your symptoms is actually useful information - it tells us about the mechanical nature of what is happening.` : ''}`;

  const reassurance = urgency === 'high' 
    ? { 
        title: 'A Silver Lining', 
        message: `While your symptoms warrant attention, the fact that you're being proactive about addressing this is excellent. Early intervention typically leads to better outcomes. Your body has remarkable healing capacity, and with the right support, most musculoskeletal conditions improve significantly. The very act of taking time to understand your pain puts you ahead of most people.`
      }
    : { 
        title: 'The Good News', 
        message: `A ${painLevel}/10 pain level with ${isAcute ? 'recent onset' : 'your current pattern'} is very common and typically highly treatable. Your proactive approach to understanding this shows excellent body awareness. Most people with similar presentations respond well to appropriate self-management and targeted interventions. You're not alone in this - these kinds of issues are something we see all the time, and they generally get better.`
      };

  const empatheticSummary = hasStory
    ? `I can see you have been dealing with this ${muscleLabels.join(' and ')} discomfort for a while now.${storyContext}${goalsContext} A ${painLevel}/10 pain level is ${painLevel >= 7 ? 'significant and I understand how frustrating that must be' : painLevel >= 4 ? 'definitely enough to affect your daily life' : 'manageable but still worth addressing'}. ${formData.frequency === 'Constant' ? 'The fact that this is constant tells me your body is really trying to get your attention here' : 'Your symptom pattern gives us useful clues about what might be going on'}.${progressContext}`
    : `I can see you are dealing with ${painLevel >= 7 ? 'significant' : painLevel >= 4 ? 'moderate' : 'mild'} discomfort in your ${muscleLabels.join(' and ')}.${goalsContext} ${formData.frequency === 'Constant' ? 'The constant nature of your symptoms' : 'Your symptom pattern'} tells us something important about ${isChronic ? 'how your body has been adapting over time' : 'what your body needs right now'}. ${isChronic ? 'While chronic issues take patience, they absolutely can improve with the right approach.' : 'The good news is that most issues like this respond well to targeted self-care.'}${progressContext}`;

  return {
    summary: empatheticSummary,
    urgency,
    understandingWhatsHappening,
    reassurance,
    possibleConditions,
    watchFor,
    recoveryPrinciples,
    avoid,
    safeToTry,
    timeline,
    resources: painLevel >= 5 ? [
      { name: 'Physical Therapist', type: 'Specialist', why: 'Can provide movement assessment and targeted exercises for your specific situation' },
      { name: 'Sports Medicine Doctor', type: 'Specialist', why: 'Helpful if symptoms persist beyond 4-6 weeks or interfere significantly with activities' }
    ] : [
      { name: 'Self-guided stretching resources', type: 'Educational', why: 'Gentle mobility work can often help with mild discomfort' }
    ]
  };
}

interface AnalysisResult {
  summary: string;
  urgency: string;
  understandingWhatsHappening: string;
  reassurance: { title: string; message: string };
  possibleConditions: Array<{ name: string; likelihood: string; description: string }>;
  watchFor: string[];
  recoveryPrinciples: string[];
  avoid: string[];
  safeToTry: string[];
  timeline: string;
  resources: Array<{ name: string; type: string; why: string }>;
}

interface AIAnalysisProps {
  formData: FormData;
  selectedMuscles: string[];
  painPoints: PainPoint[];
  onComplete: (result: AnalysisResult) => void;
  cachedAnalysis: AnalysisResult | null;
}

function AIAnalysis({ formData, selectedMuscles, painPoints, onComplete, cachedAnalysis }: AIAnalysisProps) {
  const [isLoading, setIsLoading] = useState(!cachedAnalysis);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(cachedAnalysis);
  const [error, setError] = useState<string | null>(null);
  const [expandedConditions, setExpandedConditions] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (cachedAnalysis) {
      setAnalysis(cachedAnalysis);
      setIsLoading(false);
      return;
    }

    const analyzeWithAI = async () => {
      setIsLoading(true);
      setError(null);
      
      const allMuscles = { ...MUSCLES_FRONT, ...MUSCLES_BACK };
      const muscleLabels = selectedMuscles.map(m => allMuscles[m]?.label || m);
      
      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            selectedMuscles,
            painPoints,
            formData,
            muscleLabels,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to get AI analysis');
        }
        
        const result = await response.json();
        
        // Ensure the result has all required fields with defaults
        const analysisResult: AnalysisResult = {
          summary: result.summary || '',
          urgency: result.urgency || 'moderate',
          understandingWhatsHappening: result.understandingWhatsHappening || '',
          reassurance: result.reassurance || { title: 'The Good News', message: '' },
          possibleConditions: result.possibleConditions || [],
          watchFor: result.watchFor || [],
          recoveryPrinciples: result.recoveryPrinciples || [],
          avoid: result.avoid || [],
          safeToTry: result.safeToTry || [],
          timeline: result.timeline || '',
          resources: result.resources || [],
        };
        
        setAnalysis(analysisResult);
        onComplete(analysisResult);
      } catch (err) {
        console.error('AI analysis error:', err);
        // Fallback to local analysis if AI fails
        const fallbackResult = generateMockAnalysis(selectedMuscles, formData);
        setAnalysis(fallbackResult);
        onComplete(fallbackResult);
        setError('AI analysis unavailable. Showing basic analysis.');
      } finally {
        setIsLoading(false);
      }
    };
    
    analyzeWithAI();
  }, [cachedAnalysis, selectedMuscles, painPoints, formData, onComplete]);

  if (isLoading) {
    return <AnalysisLoader />;
  }

  if (!analysis) return null;

  const toggleCondition = (index: number) => {
    setExpandedConditions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6" data-testid="analysis-results">
      {error && (
        <div className="rounded-lg p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-sm">
          {error}
        </div>
      )}

      {/* 1. Summary - Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl p-5 sm:p-6 border border-primary/20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <h4 className="font-bold text-lg text-foreground">Your Assessment</h4>
          </div>
          <p className="text-muted-foreground leading-relaxed">{analysis.summary}</p>
        </div>
      </div>

      {/* 2. Understanding What's Happening */}
      {analysis.understandingWhatsHappening && (
        <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-xl p-5 border border-amber-200/50 dark:border-amber-800/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="font-bold text-foreground">Understanding What's Happening</h4>
          </div>
          <p className="text-muted-foreground leading-relaxed">{analysis.understandingWhatsHappening}</p>
        </div>
      )}

      {/* 3. The Good News / A Silver Lining */}
      {analysis.reassurance?.message && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-xl p-5 border border-green-200/50 dark:border-green-800/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Heart className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-bold text-green-800 dark:text-green-200">{analysis.reassurance.title}</h4>
          </div>
          <p className="text-green-700 dark:text-green-300 leading-relaxed">{analysis.reassurance.message}</p>
        </div>
      )}

      {/* Section Divider */}
      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">What This Could Be</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* 4. Possible Conditions - Expandable */}
      <div className="space-y-3">
        {analysis.possibleConditions.map((c, i) => (
          <div key={i} className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <button
              onClick={() => toggleCondition(i)}
              className="w-full p-4 flex items-center justify-between text-left hover-elevate"
              data-testid={`condition-toggle-${i}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  c.likelihood === 'Likely' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                  c.likelihood === 'Possible' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {i + 1}
                </div>
                <div>
                  <span className="font-semibold text-foreground">{c.name}</span>
                  <Badge variant={c.likelihood === 'Likely' ? 'default' : 'secondary'} className="ml-2 text-xs">{c.likelihood}</Badge>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${expandedConditions.has(i) ? 'rotate-180' : ''}`} />
            </button>
            {expandedConditions.has(i) && (
              <div className="px-4 pb-4 pt-0 ml-11 border-t border-border/50 mt-0 pt-3">
                <p className="text-sm text-muted-foreground leading-relaxed">{c.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 5. Watch For - Important Warning */}
      {analysis.watchFor?.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50/50 dark:from-red-900/20 dark:to-rose-900/10 rounded-xl p-5 border border-red-200/50 dark:border-red-800/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="font-bold text-red-800 dark:text-red-200">When to Seek Help</h4>
          </div>
          <ul className="space-y-3">
            {analysis.watchFor.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-red-700 dark:text-red-300">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Section Divider */}
      <div className="flex items-center gap-4 py-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Your Recovery Plan</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* 6. Recovery Principles */}
      {analysis.recoveryPrinciples?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <h4 className="font-bold text-foreground">Recovery Principles</h4>
          </div>
          <div className="grid gap-2">
            {analysis.recoveryPrinciples.map((principle, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-card rounded-lg border">
                <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-foreground text-sm leading-relaxed">{principle}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Avoid/Modify & 8. Generally Safe - Side by side */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-rose-50/50 dark:from-red-900/15 dark:to-rose-900/10 rounded-xl p-4 border border-red-200/50 dark:border-red-800/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <X className="w-3 h-3 text-red-600 dark:text-red-400" />
            </div>
            <h4 className="font-bold text-red-800 dark:text-red-200 text-sm">Avoid/Modify</h4>
          </div>
          <ul className="space-y-2">
            {analysis.avoid?.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                <div className="w-1 h-1 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 dark:from-green-900/15 dark:to-emerald-900/10 rounded-xl p-4 border border-green-200/50 dark:border-green-800/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-bold text-green-800 dark:text-green-200 text-sm">Generally Safe</h4>
          </div>
          <ul className="space-y-2">
            {analysis.safeToTry?.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-700 dark:text-green-300">
                <div className="w-1 h-1 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 9. Expected Timeline */}
      <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-5 border border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <h4 className="font-bold text-foreground">Expected Timeline</h4>
        </div>
        <p className="text-muted-foreground leading-relaxed">{analysis.timeline}</p>
      </div>

      {/* 10. Resources */}
      {analysis.resources?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="font-bold text-foreground">Expert Resources</h4>
          </div>
          <div className="grid gap-2">
            {analysis.resources.map((r, i) => (
              <div key={i} className="p-4 bg-gradient-to-br from-purple-50 to-violet-50/50 dark:from-purple-900/15 dark:to-violet-900/10 rounded-xl border border-purple-200/50 dark:border-purple-800/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-purple-900 dark:text-purple-200">{r.name}</span>
                  <Badge variant="outline" className="text-xs border-purple-300 dark:border-purple-700">{r.type}</Badge>
                </div>
                <p className="text-sm text-purple-700 dark:text-purple-300 leading-relaxed">{r.why}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const STEPS = [
  { num: 1, label: 'Select Areas' },
  { num: 2, label: 'Mark Pain' },
  { num: 3, label: 'Details' },
  { num: 4, label: 'Analysis' },
  { num: 5, label: 'Recovery Companion' }
];

export default function BodyPainAssessment() {
  // Check if user has completed assessments and should land on Recovery Companion
  const getInitialStep = () => {
    try {
      const history = localStorage.getItem('assessmentHistory');
      if (history) {
        const assessments = JSON.parse(history);
        // If user has at least one completed assessment, start on Recovery Companion
        if (Array.isArray(assessments) && assessments.length > 0) {
          return 5;
        }
      }
    } catch {
      console.error('Failed to check assessment history');
    }
    return 1;
  };

  const [step, setStep] = useState(getInitialStep());
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [brushSize, setBrushSize] = useState(12);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [formData, setFormData] = useState<FormData>({
    painLevel: null,
    painTypes: [],
    frequency: '',
    duration: '',
    causes: [],
    story: '',
    progress: '',
    triggersAndRelief: '',
    triedSoFar: '',
    activities: [],
    intensity: '',
    goals: '',
    concernLevel: null,
    concernReason: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('painAssessment');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setSelectedMuscles(data.selectedMuscles || []);
        setPainPoints(data.painPoints || []);
        setFormData(prev => ({ ...prev, ...data.formData }));
        if (data.analysis) setAnalysisResult(data.analysis);
      } catch {
        console.error('Failed to load saved assessment');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('painAssessment', JSON.stringify({ 
      selectedMuscles, 
      painPoints, 
      formData, 
      analysis: analysisResult 
    }));
  }, [selectedMuscles, painPoints, formData, analysisResult]);

  const handleMuscleClick = (muscle: string) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
    );
  };

  const handlePaint = (point: PainPoint) => {
    setPainPoints(prev => [...prev, point]);
  };

  const reset = () => {
    setSelectedMuscles([]);
    setPainPoints([]);
    setFormData({
      painLevel: null, painTypes: [], frequency: '', duration: '', causes: [],
      story: '', progress: '', triggersAndRelief: '', triedSoFar: '', activities: [],
      intensity: '', goals: '', concernLevel: null, concernReason: ''
    });
    setAnalysisResult(null);
    setStep(1);
    setIsSaved(false);
    localStorage.removeItem('painAssessment');
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ selectedMuscles, painPoints, formData, analysis: analysisResult }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pain-assessment-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { toast } = useToast();

  const saveToHistory = () => {
    try {
      const savedHistory = localStorage.getItem('assessmentHistory');
      const history = savedHistory ? JSON.parse(savedHistory) : [];
      
      const newAssessment = {
        id: Date.now(),
        selectedMuscles,
        painPoints,
        formData,
        analysis: analysisResult,
        createdAt: new Date().toISOString(),
      };
      
      history.unshift(newAssessment);
      localStorage.setItem('assessmentHistory', JSON.stringify(history));
      
      setIsSaved(true);
      toast({
        title: "Assessment saved",
        description: "Your assessment has been saved to your history.",
      });
    } catch (error) {
      console.error('Failed to save assessment:', error);
      toast({
        title: "Error",
        description: "Failed to save assessment. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const exportPDF = async () => {
    setIsExportingPdf(true);
    try {
      const response = await fetch('/api/assessments/export-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedMuscles,
          painPoints,
          formData,
          analysis: analysisResult,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pain-assessment-${new Date().toISOString().split('T')[0]}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target?.result as string);
          setSelectedMuscles(data.selectedMuscles || []);
          setPainPoints(data.painPoints || []);
          setFormData(prev => ({ ...prev, ...data.formData }));
          if (data.analysis) setAnalysisResult(data.analysis);
        } catch { 
          alert('Invalid file format'); 
        }
      };
      reader.readAsText(file);
    }
  };

  const getMuscleLabels = () => {
    const all = { ...MUSCLES_FRONT, ...MUSCLES_BACK };
    return selectedMuscles.map(m => all[m]?.label || m);
  };

  const progressPercent = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h1 className="text-base font-bold text-foreground" data-testid="app-title">MendMate</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Your recovery companion</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => fileInputRef.current?.click()} 
              title="Import assessment"
              data-testid="button-import"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importJSON}
              className="hidden"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={exportJSON} 
              title="Export assessment"
              data-testid="button-export"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={reset} 
              title="Start over"
              data-testid="button-reset"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Link href="/history">
              <Button 
                variant="ghost" 
                size="icon" 
                title="Assessment History"
                data-testid="button-history"
              >
                <History className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="bg-card border-b">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setStep(s.num)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-sm transition-all ${
                    step === s.num
                      ? 'bg-primary text-primary-foreground'
                      : step > s.num
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-muted text-muted-foreground'
                  }`}
                  data-testid={`step-button-${s.num}`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s.num 
                      ? 'bg-white/20' 
                      : step > s.num 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted-foreground/20'
                  }`}>
                    {step > s.num ? <Check className="w-3 h-3" /> : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />}
              </div>
            ))}
          </div>
          <Progress value={progressPercent} className="mt-3 h-1" />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Where does it hurt?</h2>
              <p className="text-sm text-muted-foreground">Tap the affected muscle groups</p>
            </div>

            <Card className="p-4">
              <div className="flex justify-center gap-2 mb-4">
                {(['front', 'back'] as const).map(v => (
                  <Button
                    key={v}
                    variant={view === v ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setView(v)}
                    data-testid={`view-toggle-${v}`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </Button>
                ))}
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-[220px] h-[330px] sm:max-w-[280px] sm:h-[420px] md:max-w-[320px] md:h-[480px]">
                  <AnatomicalBody
                    muscles={view === 'front' ? MUSCLES_FRONT : MUSCLES_BACK}
                    selectedMuscles={selectedMuscles}
                    onMuscleClick={handleMuscleClick}
                    paintMode={false}
                    painPoints={[]}
                    onPaint={() => {}}
                    brushSize={12}
                    viewLabel={view === 'front' ? 'Front' : 'Back'}
                  />
                </div>
              </div>

              {selectedMuscles.length > 0 && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <div className="flex flex-wrap gap-1.5">
                    {getMuscleLabels().map((label, i) => (
                      <Badge
                        key={i}
                        variant="default"
                        className="flex items-center gap-1"
                        data-testid={`selected-muscle-${i}`}
                      >
                        {label}
                        <button 
                          onClick={() => handleMuscleClick(selectedMuscles[i])}
                          className="ml-1 hover:opacity-70"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={selectedMuscles.length === 0}
                data-testid="button-continue-step1"
              >
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Mark the exact spots</h2>
              <p className="text-sm text-muted-foreground">Paint where it hurts most</p>
            </div>

            <Card className="p-4">
              <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
                <div className="flex gap-2">
                  {(['front', 'back'] as const).map(v => (
                    <Button
                      key={v}
                      variant={view === v ? 'default' : 'secondary'}
                      size="sm"
                      onClick={() => setView(v)}
                      data-testid={`paint-view-toggle-${v}`}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </Button>
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  <BrushSelector size={brushSize} setSize={setBrushSize} />
                  {painPoints.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setPainPoints([])}
                      className="text-destructive hover:text-destructive"
                      data-testid="button-clear-paint"
                    >
                      <Trash2 className="w-3 h-3 mr-1" /> Clear
                    </Button>
                  )}
                </div>
              </div>

              <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-2 mb-4 text-xs text-amber-800 dark:text-amber-200 text-center">
                Click and drag to paint pain areas
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-[220px] h-[330px] sm:max-w-[280px] sm:h-[420px] md:max-w-[320px] md:h-[480px]">
                  <AnatomicalBody
                    muscles={view === 'front' ? MUSCLES_FRONT : MUSCLES_BACK}
                    selectedMuscles={selectedMuscles}
                    onMuscleClick={() => {}}
                    paintMode={true}
                    painPoints={painPoints}
                    onPaint={handlePaint}
                    brushSize={brushSize}
                    viewLabel={view === 'front' ? 'Front' : 'Back'}
                  />
                </div>
              </div>

              {painPoints.length > 0 && (
                <div className="mt-3 text-center text-xs text-muted-foreground">
                  {painPoints.length} point{painPoints.length !== 1 ? 's' : ''} marked
                </div>
              )}
            </Card>

            <div className="flex justify-between gap-4">
              <Button variant="secondary" onClick={() => setStep(1)} data-testid="button-back-step2">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={() => setStep(3)} data-testid="button-continue-step2">
                Continue <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Tell us more</h2>
              <p className="text-sm text-muted-foreground">A few questions to understand your injury</p>
            </div>

            <IntakeForm formData={formData} setFormData={setFormData} />

            <div className="flex justify-between gap-4">
              <Button variant="secondary" onClick={() => setStep(2)} data-testid="button-back-step3">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                onClick={() => setStep(4)}
                disabled={
                  formData.painLevel === null ||
                  formData.painTypes.length === 0 ||
                  formData.frequency === '' ||
                  formData.duration === '' ||
                  formData.story.trim() === ''
                }
                data-testid="button-continue-step3"
              >
                Get Analysis <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Your Assessment</h2>
              <p className="text-sm text-muted-foreground">Personalized analysis and recommendations</p>
            </div>

            <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                <strong>Not medical advice.</strong> Always consult a healthcare professional for proper diagnosis.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Areas', value: selectedMuscles.length },
                { label: 'Pain', value: formData.painLevel !== null ? `${formData.painLevel}/10` : 'Not set' },
                { label: 'Duration', value: formData.duration || '—' },
                { label: 'Points', value: painPoints.length }
              ].map(({ label, value }) => (
                <Card key={label} className="p-3 text-center">
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className="font-semibold text-foreground text-sm" data-testid={`stat-${label.toLowerCase()}`}>{value}</div>
                </Card>
              ))}
            </div>

            <Card className="p-5">
              <AIAnalysis
                formData={formData}
                selectedMuscles={selectedMuscles}
                painPoints={painPoints}
                onComplete={setAnalysisResult}
                cachedAnalysis={analysisResult}
              />
            </Card>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-start gap-3">
              <Share2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Share with your healthcare provider</p>
                <p className="text-xs text-muted-foreground mt-0.5">Download the PDF report to share with your physiotherapist or doctor for personalized guidance.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <Button variant="secondary" onClick={() => setStep(3)} data-testid="button-back-step4">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <div className="flex flex-wrap gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={saveToHistory}
                  disabled={isSaved || !analysisResult}
                  title={!analysisResult ? 'Wait for analysis to complete' : undefined}
                  data-testid="button-save-assessment"
                >
                  {isSaved ? (
                    <Check className="w-4 h-4 mr-1" />
                  ) : (
                    <Save className="w-4 h-4 mr-1" />
                  )}
                  {isSaved ? 'Saved' : !analysisResult ? 'Analyzing...' : 'Save to History'}
                </Button>
                <Button variant="outline" onClick={exportJSON} data-testid="button-download-json">
                  <Download className="w-4 h-4 mr-1" /> JSON
                </Button>
                <Button variant="outline" onClick={exportPDF} disabled={isExportingPdf} data-testid="button-download-pdf">
                  {isExportingPdf ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-1" />
                  )}
                  {isExportingPdf ? 'Generating...' : 'PDF'}
                </Button>
                <Button variant="default" onClick={() => setStep(5)} data-testid="button-continue-step4">
                  Recovery Companion <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">Recovery Companion</h2>
              <p className="text-sm text-muted-foreground">Track your progress and get ongoing support</p>
            </div>

            <Card className="p-5 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-3 flex-1">
                  <div>
                    <p className="font-medium text-foreground">Welcome back!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Access your assessment history and diary to continue your recovery journey, or start a new assessment to track new pain areas.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/assessment-history">
                      <Button variant="default">
                        <BookOpen className="w-4 h-4 mr-2" />
                        View Assessment History
                      </Button>
                    </Link>
                    <Button variant="outline" onClick={() => setStep(1)}>
                      <Plus className="w-4 h-4 mr-2" />
                      New Assessment
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-primary">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Pain Diary & Journal</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Document your recovery journey with daily entries. Track pain levels, workouts, and progress updates with AI-powered feedback.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Track Progress</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monitor your recovery over time. See trends in your pain levels and celebrate improvements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Get AI Guidance</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Ask questions about workouts, pain changes, or recovery concerns and get instant AI-powered insights.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {isSaved ? (
              <Card className="p-5 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Assessment Saved!</p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Your recovery companion is ready. Access your diary from Assessment History to start tracking your journey.
                      </p>
                    </div>
                    <Link href="/assessment-history">
                      <Button variant="default" className="w-full sm:w-auto">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Go to Assessment History
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-5 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="font-medium text-amber-900 dark:text-amber-100">Save Your Assessment First</p>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        To access your recovery companion and diary, please save your assessment to history.
                      </p>
                    </div>
                    <Button
                      variant="default"
                      onClick={saveToHistory}
                      disabled={!analysisResult}
                      className="w-full sm:w-auto"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save to History
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            <div className="flex justify-between gap-4">
              <Button variant="secondary" onClick={() => setStep(4)} data-testid="button-back-step5">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button variant="outline" onClick={resetAll} data-testid="button-new-assessment">
                Start New Assessment
              </Button>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-card border-t mt-8">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Educational only. Not medical advice. Consult a professional.
          </p>
        </div>
      </footer>
    </div>
  );
}
