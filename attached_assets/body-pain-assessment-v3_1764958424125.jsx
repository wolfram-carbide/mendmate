import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronLeft, X, Check, AlertCircle, Activity, Clock, Dumbbell, Heart, Brain, Trash2, RotateCcw, Circle } from 'lucide-react';

// Continuous anatomical muscle paths - Front View
const MUSCLES_FRONT = {
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
  
  // Shoulders - continuous with chest
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
  
  // Chest - continuous
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
  
  // Arms - continuous
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
  
  // Core - continuous block
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
  
  // Hip/Groin - continuous
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
  
  // Thighs - continuous
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
  
  // Knees
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
  
  // Lower Legs
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
  
  // Ankles & Feet
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

// Continuous anatomical muscle paths - Back View (matching your screenshot style)
const MUSCLES_BACK = {
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
  
  // Upper back - continuous block like your screenshot
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
  
  // Rear delts & triceps - continuous
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
  
  // Lats & mid back - continuous
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
  
  // Lower back - continuous
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
  
  // Glutes - continuous
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
  
  // Hamstrings - continuous
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
  
  // Calves - continuous
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
  
  // Achilles & heels
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

// Muscle group colors
const GROUP_COLORS = {
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

// Body SVG Component
const AnatomicalBody = ({ 
  muscles, 
  selectedMuscles, 
  onMuscleClick, 
  paintMode, 
  painPoints, 
  onPaint,
  brushSize,
  viewLabel 
}) => {
  const svgRef = useRef(null);
  const [isPainting, setIsPainting] = useState(false);

  const getCoords = (e) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * 360,
      y: ((clientY - rect.top) / rect.height) * 700
    };
  };

  const handleStart = (e) => {
    if (!paintMode) return;
    e.preventDefault();
    setIsPainting(true);
    const coords = getCoords(e);
    if (coords) onPaint({ ...coords, view: viewLabel, size: brushSize });
  };

  const handleMove = (e) => {
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
      className={`w-full h-full ${paintMode ? 'cursor-crosshair' : 'cursor-pointer'}`}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
    >
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
        <radialGradient id="painGrad">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2"/>
        </radialGradient>
      </defs>
      
      {/* Body shadow */}
      <ellipse cx="180" cy="705" rx="70" ry="8" fill="#00000008"/>
      
      {/* Muscles */}
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
            className={`transition-all duration-150 ${!paintMode ? 'hover:brightness-95' : ''}`}
            onClick={(e) => {
              if (!paintMode) {
                e.stopPropagation();
                onMuscleClick(key);
              }
            }}
            filter={isSelected ? 'url(#glow)' : 'none'}
            style={{ opacity: paintMode ? 0.6 : 1 }}
          >
            <title>{muscle.label}</title>
          </path>
        );
      })}
      
      {/* Pain points */}
      {painPoints
        .filter(p => p.view === viewLabel)
        .map((point, i) => (
          <circle
            key={i}
            cx={point.x}
            cy={point.y}
            r={point.size || 10}
            fill="url(#painGrad)"
            className="pointer-events-none"
          />
        ))
      }
      
      {/* View label */}
      <text x="180" y="715" textAnchor="middle" className="text-[10px] fill-gray-400 font-medium select-none">
        {viewLabel}
      </text>
    </svg>
  );
};

// Pain Level Slider
const PainSlider = ({ value, onChange }) => {
  const colors = ['#22c55e', '#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444', '#ef4444', '#dc2626', '#dc2626', '#991b1b'];
  const labels = ['Minimal', 'Mild', 'Mild', 'Moderate', 'Moderate', 'Significant', 'Significant', 'Severe', 'Severe', 'Extreme'];
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">Pain intensity</span>
        <span className="px-3 py-1 rounded-full text-white text-sm font-semibold" style={{ backgroundColor: colors[value - 1] }}>
          {value}/10 — {labels[value - 1]}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #22c55e, #eab308, #ef4444)` }}
      />
    </div>
  );
};

// Streamlined Intake Form
const IntakeForm = ({ formData, setFormData }) => {
  const painTypes = ['Sharp/Stabbing', 'Dull/Aching', 'Burning', 'Throbbing', 'Tight/Stiff', 'Shooting/Electric', 'Numbness/Tingling'];
  const durations = ['< 1 week', '1-4 weeks', '1-3 months', '3-6 months', '6+ months', '> 1 year'];
  const frequencies = ['Constant', 'Daily', 'Few times/week', 'Weekly', 'Occasional'];
  const causes = ['Sudden movement', 'Lifted wrong', 'Fall/Impact', 'Overuse', 'Gradual/Unknown'];
  const activities = ['Weight Training', 'Running', 'Cycling', 'Swimming', 'CrossFit/HIIT', 'Team Sports', 'Yoga/Pilates', 'Other'];
  const intensities = ['Light', 'Moderate', 'Intense'];

  const Chip = ({ selected, onClick, children }) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
        selected 
          ? 'bg-red-500 text-white border-red-500' 
          : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Pain Characteristics */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-500" />
          Pain Characteristics
        </h3>
        
        <PainSlider value={formData.painLevel} onChange={(v) => setFormData({...formData, painLevel: v})} />

        <div>
          <label className="block text-sm text-gray-600 mb-2">Type of pain (select all that apply)</label>
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
              >
                {type}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">Frequency</label>
          <div className="flex flex-wrap gap-2">
            {frequencies.map(freq => (
              <Chip key={freq} selected={formData.frequency === freq} onClick={() => setFormData({...formData, frequency: freq})}>
                {freq}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline & Cause */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-red-500" />
          History
        </h3>

        <div>
          <label className="block text-sm text-gray-600 mb-2">How long have you had this?</label>
          <div className="flex flex-wrap gap-2">
            {durations.map(dur => (
              <Chip key={dur} selected={formData.duration === dur} onClick={() => setFormData({...formData, duration: dur})}>
                {dur}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">What caused it?</label>
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
              >
                {cause}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">Tell us more about how it happened...</label>
          <textarea
            value={formData.story || ''}
            onChange={(e) => setFormData({...formData, story: e.target.value})}
            placeholder="Share your story - what were you doing, how did it feel, what happened after..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">Is it getting better or worse?</label>
          <div className="flex flex-wrap gap-2">
            {['Getting worse', 'No change', 'Slowly improving'].map(status => (
              <Chip key={status} selected={formData.progress === status} onClick={() => setFormData({...formData, progress: status})}>
                {status}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      {/* Triggers & Relief */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" />
          Triggers & Relief
        </h3>

        <div>
          <label className="block text-sm text-gray-600 mb-2">What makes it worse? What helps?</label>
          <textarea
            value={formData.triggersAndRelief || ''}
            onChange={(e) => setFormData({...formData, triggersAndRelief: e.target.value})}
            placeholder="e.g., Sitting makes it worse, heat helps, stretching helps temporarily..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">What have you tried so far?</label>
          <textarea
            value={formData.triedSoFar || ''}
            onChange={(e) => setFormData({...formData, triedSoFar: e.target.value})}
            placeholder="e.g., Rest, ice, physio, stretching, medication..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            rows={2}
          />
        </div>
      </section>

      {/* Athletic Profile */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Dumbbell className="w-4 h-4 text-red-500" />
          Your Activity Level
        </h3>

        <div>
          <label className="block text-sm text-gray-600 mb-2">What do you do? (select all)</label>
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
              >
                {act}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">Typical intensity</label>
          <div className="flex flex-wrap gap-2">
            {intensities.map(int => (
              <Chip key={int} selected={formData.intensity === int} onClick={() => setFormData({...formData, intensity: int})}>
                {int}
              </Chip>
            ))}
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Brain className="w-4 h-4 text-red-500" />
          Your Goal
        </h3>
        <textarea
          value={formData.goals || ''}
          onChange={(e) => setFormData({...formData, goals: e.target.value})}
          placeholder="What would you like to be able to do again?"
          className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
          rows={2}
        />
      </section>

      {/* Concern Level */}
      <section className="space-y-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          Your Concern Level
        </h3>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm text-gray-600">How concerned are you right now?</label>
            <span className={`px-2 py-0.5 rounded-full text-white text-xs font-semibold ${
              (formData.concernLevel || 5) <= 3 ? 'bg-green-500' : 
              (formData.concernLevel || 5) <= 6 ? 'bg-amber-500' : 'bg-red-500'
            }`}>
              {formData.concernLevel || 5}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={formData.concernLevel || 5}
            onChange={(e) => setFormData({...formData, concernLevel: parseInt(e.target.value)})}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #22c55e, #eab308, #ef4444)` }}
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Not worried</span>
            <span>Very worried</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-2">What makes you concerned?</label>
          <textarea
            value={formData.concernReason || ''}
            onChange={(e) => setFormData({...formData, concernReason: e.target.value})}
            placeholder="e.g., It's affecting my work, worried it won't heal, fear of surgery..."
            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            rows={2}
          />
        </div>
      </section>
    </div>
  );
};

// AI Analysis Component - uses built-in API
const AIAnalysis = ({ formData, selectedMuscles, painPoints, onComplete, cachedAnalysis }) => {
  const [analysis, setAnalysis] = useState(cachedAnalysis || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMuscleLabels = () => {
    const all = { ...MUSCLES_FRONT, ...MUSCLES_BACK };
    return selectedMuscles.map(m => all[m]?.label || m).join(', ');
  };

  const generateAnalysis = async () => {
    setLoading(true);
    setError(null);

    const prompt = `You are an experienced sports medicine specialist. Analyze this injury assessment and provide educational guidance. Be warm, practical, and reassuring.

ASSESSMENT DATA:
- Affected Areas: ${getMuscleLabels() || 'Not specified'}
- Pain Points Marked: ${painPoints.length} locations
- Pain Level: ${formData.painLevel}/10
- Pain Type: ${formData.painTypes?.join(', ') || 'Not specified'}
- Frequency: ${formData.frequency || 'Not specified'}
- Duration: ${formData.duration || 'Not specified'}
- Cause: ${formData.causes?.join(', ') || 'Not specified'}
- Their Story: ${formData.story || 'Not specified'}
- Progress: ${formData.progress || 'Not specified'}
- Triggers/Relief: ${formData.triggersAndRelief || 'Not specified'}
- Tried So Far: ${formData.triedSoFar || 'Not specified'}
- Activities: ${formData.activities?.join(', ') || 'Not specified'}
- Intensity: ${formData.intensity || 'Not specified'}
- Goals: ${formData.goals || 'Not specified'}
- Concern Level: ${formData.concernLevel || 5}/10
- What Concerns Them: ${formData.concernReason || 'Not specified'}

Respond with JSON only (no markdown):
{
  "summary": "2-3 sentence overview of the likely issue",
  "possibleConditions": ["2-4 conditions that match, most likely first"],
  "bodyMechanics": "Educational explanation of what's happening anatomically - help them understand their body",
  "redFlags": ["Warning signs requiring immediate medical attention, if any"],
  "reassurance": "Normalize the injury, reduce anxiety, emphasize that recovery is possible",
  "recoveryPrinciples": ["4-5 evidence-based principles for recovery"],
  "avoid": ["Specific things to avoid or modify"],
  "safeToTry": ["Activities that are generally safe to continue"],
  "timeline": "Realistic recovery timeline",
  "experts": [{"name": "Expert name", "focus": "What they're known for", "why": "Why relevant"}],
  "nextSteps": ["Prioritized actionable steps"]
}`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const content = data.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setAnalysis(parsed);
        onComplete?.(parsed);
      } else {
        throw new Error('Could not parse response');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update local state if cached analysis changes
  useEffect(() => {
    if (cachedAnalysis) setAnalysis(cachedAnalysis);
  }, [cachedAnalysis]);

  // Auto-generate on first load if no cached analysis
  useEffect(() => {
    if (!cachedAnalysis && !analysis && !loading) {
      generateAnalysis();
    }
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mb-3" />
        <p className="text-gray-600 font-medium">Analyzing your assessment...</p>
        <p className="text-sm text-gray-400">This takes a few seconds</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <div>
            <p className="font-medium text-red-800">Analysis Error</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <button onClick={generateAnalysis} className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg text-sm">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mb-3" />
        <p className="text-gray-600 font-medium">Preparing your analysis...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Regenerate button */}
      <div className="flex justify-end">
        <button
          onClick={generateAnalysis}
          disabled={loading}
          className="text-xs text-gray-500 hover:text-red-500 flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Regenerate
        </button>
      </div>
      
      {/* Summary */}
      <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
        <h4 className="font-semibold text-gray-900 mb-2">Summary</h4>
        <p className="text-gray-700 text-sm">{analysis.summary}</p>
      </div>

      {/* Possible Conditions */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Possible Conditions</h4>
        <div className="space-y-2">
          {analysis.possibleConditions?.map((c, i) => (
            <div key={i} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg text-sm">
              <span className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <span className="text-gray-700">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body Mechanics */}
      <div className="bg-amber-50 rounded-xl p-5 border border-amber-100">
        <h4 className="font-semibold text-gray-900 mb-2">Understanding What's Happening</h4>
        <p className="text-gray-700 text-sm">{analysis.bodyMechanics}</p>
      </div>

      {/* Red Flags */}
      {analysis.redFlags?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Watch For
          </h4>
          <ul className="space-y-1 text-sm text-red-700">
            {analysis.redFlags.map((f, i) => <li key={i}>• {f}</li>)}
          </ul>
        </div>
      )}

      {/* Reassurance */}
      <div className="bg-green-50 rounded-xl p-5 border border-green-100">
        <h4 className="font-semibold text-gray-900 mb-2">💚 The Good News</h4>
        <p className="text-gray-700 text-sm">{analysis.reassurance}</p>
      </div>

      {/* Recovery Principles */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Recovery Principles</h4>
        <div className="space-y-2">
          {analysis.recoveryPrinciples?.map((p, i) => (
            <div key={i} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg text-sm">
              <Check className="w-4 h-4 text-green-500 mt-0.5" />
              <span className="text-gray-700">{p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Avoid vs Safe */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <h4 className="font-semibold text-red-800 mb-2 text-sm">Avoid/Modify</h4>
          <ul className="space-y-1 text-sm text-red-700">
            {analysis.avoid?.map((a, i) => <li key={i} className="flex items-start gap-1"><X className="w-3 h-3 mt-1" />{a}</li>)}
          </ul>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <h4 className="font-semibold text-green-800 mb-2 text-sm">Generally Safe</h4>
          <ul className="space-y-1 text-sm text-green-700">
            {analysis.safeToTry?.map((s, i) => <li key={i} className="flex items-start gap-1"><Check className="w-3 h-3 mt-1" />{s}</li>)}
          </ul>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 rounded-xl p-5">
        <h4 className="font-semibold text-gray-900 mb-2">Expected Timeline</h4>
        <p className="text-gray-700 text-sm">{analysis.timeline}</p>
      </div>

      {/* Expert Resources */}
      {analysis.experts?.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Expert Resources</h4>
          <div className="space-y-2">
            {analysis.experts.map((e, i) => (
              <div key={i} className="p-3 bg-purple-50 rounded-xl border border-purple-100">
                <div className="font-medium text-purple-900 text-sm">{e.name}</div>
                <div className="text-xs text-purple-700">{e.focus}</div>
                <div className="text-xs text-purple-600 mt-1">{e.why}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Next Steps</h4>
        <div className="space-y-2">
          {analysis.nextSteps?.map((s, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">{i + 1}</div>
              <span className="text-gray-700 text-sm pt-0.5">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Brush Size Selector
const BrushSelector = ({ size, setSize }) => (
  <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1">
    {[
      { value: 6, label: 'S' },
      { value: 12, label: 'M' },
      { value: 20, label: 'L' }
    ].map(({ value, label }) => (
      <button
        key={value}
        onClick={() => setSize(value)}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          size === value ? 'bg-red-500 text-white' : 'text-gray-600 hover:bg-gray-200'
        }`}
      >
        <Circle className={`${value === 6 ? 'w-2 h-2' : value === 12 ? 'w-3 h-3' : 'w-4 h-4'}`} fill="currentColor" />
      </button>
    ))}
  </div>
);

// Main App
export default function BodyPainAssessment() {
  const [step, setStep] = useState(1);
  const [view, setView] = useState('front');
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [painPoints, setPainPoints] = useState([]);
  const [brushSize, setBrushSize] = useState(12);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [formData, setFormData] = useState({
    painLevel: 5,
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
    concernLevel: 5,
    concernReason: ''
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('painAssessment');
    if (saved) {
      const data = JSON.parse(saved);
      setSelectedMuscles(data.selectedMuscles || []);
      setPainPoints(data.painPoints || []);
      setFormData(prev => ({ ...prev, ...data.formData }));
      if (data.analysis) setAnalysisResult(data.analysis);
    }
  }, []);

  // Auto-save
  useEffect(() => {
    localStorage.setItem('painAssessment', JSON.stringify({ selectedMuscles, painPoints, formData, analysis: analysisResult }));
  }, [selectedMuscles, painPoints, formData, analysisResult]);

  const handleMuscleClick = (muscle) => {
    setSelectedMuscles(prev => 
      prev.includes(muscle) ? prev.filter(m => m !== muscle) : [...prev, muscle]
    );
  };

  const handlePaint = (point) => {
    setPainPoints(prev => [...prev, point]);
  };

  const reset = () => {
    setSelectedMuscles([]);
    setPainPoints([]);
    setFormData({
      painLevel: 5, painTypes: [], frequency: '', duration: '', causes: [],
      story: '', progress: '', triggersAndRelief: '', triedSoFar: '', activities: [], 
      intensity: '', goals: '', concernLevel: 5, concernReason: ''
    });
    setAnalysisResult(null);
    setStep(1);
    localStorage.removeItem('painAssessment');
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ selectedMuscles, painPoints, formData, analysis: analysisResult }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pain-assessment-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importJSON = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = JSON.parse(evt.target?.result);
          setSelectedMuscles(data.selectedMuscles || []);
          setPainPoints(data.painPoints || []);
          setFormData(prev => ({ ...prev, ...data.formData }));
          if (data.analysis) setAnalysisResult(data.analysis);
        } catch { alert('Invalid file'); }
      };
      reader.readAsText(file);
    }
  };

  const getMuscleLabels = () => {
    const all = { ...MUSCLES_FRONT, ...MUSCLES_BACK };
    return selectedMuscles.map(m => all[m]?.label || m);
  };

  const steps = [
    { num: 1, label: 'Select Muscles' },
    { num: 2, label: 'Mark Pain' },
    { num: 3, label: 'Details' },
    { num: 4, label: 'Analysis' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-red-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">Body Pain Assessment</h1>
              <p className="text-[10px] text-gray-500">Understand your injury</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={reset} className="p-2 hover:bg-gray-100 rounded-lg" title="Start over"><RotateCcw className="w-4 h-4 text-gray-500" /></button>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-1 overflow-x-auto">
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <button
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full whitespace-nowrap text-sm transition-all ${
                  step === s.num ? 'bg-red-500 text-white' : step > s.num ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  {step > s.num ? <Check className="w-3 h-3" /> : s.num}
                </span>
                {s.label}
              </button>
              {i < 3 && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Step 1: Select Muscles */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Where does it hurt?</h2>
              <p className="text-sm text-gray-600">Tap the affected muscle groups</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex justify-center gap-2 mb-3">
                {['front', 'back'].map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium ${view === v ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {v.charAt(0).toUpperCase() + v.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-[200px] h-[300px]">
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
                <div className="mt-3 p-3 bg-red-50 rounded-xl">
                  <div className="flex flex-wrap gap-1.5">
                    {getMuscleLabels().map((label, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                        {label}
                        <button onClick={() => handleMuscleClick(selectedMuscles[i])}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={selectedMuscles.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium disabled:opacity-50 shadow-lg"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Paint Pain (auto paint mode) */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Mark the exact spots</h2>
              <p className="text-sm text-gray-600">Paint where it hurts most</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                  {['front', 'back'].map(v => (
                    <button
                      key={v}
                      onClick={() => setView(v)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium ${view === v ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-3">
                  <BrushSelector size={brushSize} setSize={setBrushSize} />
                  {painPoints.length > 0 && (
                    <button onClick={() => setPainPoints([])} className="text-xs text-red-600 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Clear
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mb-3 text-xs text-amber-800 text-center">
                Click and drag to paint pain areas
              </div>

              <div className="flex justify-center">
                <div className="w-full max-w-[200px] h-[300px]">
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
                <div className="mt-3 text-center text-xs text-gray-500">
                  {painPoints.length} point{painPoints.length !== 1 ? 's' : ''} marked
                </div>
              )}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(3)} className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium shadow-lg">
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Form */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Tell us more</h2>
              <p className="text-sm text-gray-600">A few questions to understand your injury</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-5">
              <IntakeForm formData={formData} setFormData={setFormData} />
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
              <button onClick={() => setStep(4)} className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl font-medium shadow-lg">
                Get Analysis <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Analysis */}
        {step === 4 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-900">Your Assessment</h2>
              <p className="text-sm text-gray-600">AI-powered analysis and recommendations</p>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-800">
                <strong>Not medical advice.</strong> Always consult a healthcare professional for proper diagnosis.
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Areas', value: selectedMuscles.length },
                { label: 'Pain', value: `${formData.painLevel}/10` },
                { label: 'Duration', value: formData.duration || '—' },
                { label: 'Points', value: painPoints.length }
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-xl p-3 shadow-sm text-center">
                  <div className="text-[10px] text-gray-500">{label}</div>
                  <div className="font-semibold text-gray-900 text-sm">{value}</div>
                </div>
              ))}
            </div>

            {/* AI Analysis */}
            <div className="bg-white rounded-2xl shadow-lg p-5">
              <AIAnalysis
                formData={formData}
                selectedMuscles={selectedMuscles}
                painPoints={painPoints}
                onComplete={setAnalysisResult}
                cachedAnalysis={analysisResult}
              />
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(3)} className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium">
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-8">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <p className="text-center text-[10px] text-gray-500">
            ⚠️ Educational only. Not medical advice. Consult a professional.
          </p>
        </div>
      </footer>
    </div>
  );
}
