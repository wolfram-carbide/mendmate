import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions, Content, StyleDictionary } from 'pdfmake/interfaces';

interface PainPoint {
  x: number;
  y: number;
  view: string;
  size?: number;
}

interface FormData {
  painLevel: number;
  painTypes: string[];
  frequency: string;
  duration: string;
  causes: string[];
  story: string;
  progress: string;
  triggersAndRelief: string;
  triedSoFar: string;
  activities: string[];
  intensity: string;
  goals: string;
  concernLevel: number;
  concernReason: string;
}

interface AnalysisResult {
  summary: string;
  urgency: 'low' | 'moderate' | 'high';
  urgencyMessage: string;
  possibleConditions: Array<{
    name: string;
    likelihood: string;
    description: string;
  }>;
  avoid: string[];
  safeToTry: string[];
  timeline: string;
  nextSteps: string[];
  experts: Array<{
    type: string;
    focus: string;
    why: string;
  }>;
}

interface AssessmentData {
  selectedMuscles: string[];
  painPoints: PainPoint[];
  formData: FormData;
  analysis?: AnalysisResult;
  createdAt?: Date;
}

const fonts = {
  Helvetica: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

const printer = new PdfPrinter(fonts);

const styles: StyleDictionary = {
  header: {
    fontSize: 22,
    bold: true,
    color: '#1a1a1a',
    margin: [0, 0, 0, 10]
  },
  subheader: {
    fontSize: 14,
    bold: true,
    color: '#333333',
    margin: [0, 15, 0, 8]
  },
  sectionTitle: {
    fontSize: 12,
    bold: true,
    color: '#2563eb',
    margin: [0, 12, 0, 6]
  },
  label: {
    fontSize: 10,
    bold: true,
    color: '#666666',
    margin: [0, 4, 0, 2]
  },
  value: {
    fontSize: 10,
    color: '#1a1a1a',
    margin: [0, 0, 0, 8]
  },
  disclaimer: {
    fontSize: 8,
    italics: true,
    color: '#888888',
    margin: [0, 20, 0, 0]
  },
  urgencyHigh: {
    fontSize: 11,
    bold: true,
    color: '#dc2626',
    fillColor: '#fef2f2'
  },
  urgencyModerate: {
    fontSize: 11,
    bold: true,
    color: '#d97706',
    fillColor: '#fffbeb'
  },
  urgencyLow: {
    fontSize: 11,
    bold: true,
    color: '#16a34a',
    fillColor: '#f0fdf4'
  },
  conditionName: {
    fontSize: 10,
    bold: true,
    color: '#1a1a1a'
  },
  conditionDescription: {
    fontSize: 9,
    color: '#666666',
    italics: true
  },
  listItem: {
    fontSize: 10,
    color: '#1a1a1a',
    margin: [0, 2, 0, 2]
  },
  expertType: {
    fontSize: 10,
    bold: true,
    color: '#1a1a1a'
  },
  expertFocus: {
    fontSize: 9,
    color: '#666666'
  }
};

function formatDate(date?: Date): string {
  const d = date ? new Date(date) : new Date();
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getPainLevelColor(level: number): string {
  if (level <= 3) return '#22c55e';
  if (level <= 6) return '#eab308';
  return '#ef4444';
}

function getUrgencyStyle(urgency: string): string {
  switch (urgency) {
    case 'high': return 'urgencyHigh';
    case 'moderate': return 'urgencyModerate';
    default: return 'urgencyLow';
  }
}

function getMuscleDisplayName(key: string): string {
  const muscleNames: Record<string, string> = {
    head: 'Head',
    neck: 'Neck',
    leftDeltoid: 'Left Deltoid (Shoulder)',
    rightDeltoid: 'Right Deltoid (Shoulder)',
    leftPec: 'Left Pectoral (Chest)',
    rightPec: 'Right Pectoral (Chest)',
    chest: 'Chest',
    leftBicep: 'Left Bicep',
    rightBicep: 'Right Bicep',
    leftForearm: 'Left Forearm',
    rightForearm: 'Right Forearm',
    leftHand: 'Left Hand',
    rightHand: 'Right Hand',
    upperAbs: 'Upper Abdominals',
    lowerAbs: 'Lower Abdominals',
    leftObliques: 'Left Obliques',
    rightObliques: 'Right Obliques',
    groin: 'Groin',
    leftAdductor: 'Left Adductor (Inner Thigh)',
    rightAdductor: 'Right Adductor (Inner Thigh)',
    leftQuad: 'Left Quadriceps',
    rightQuad: 'Right Quadriceps',
    leftKnee: 'Left Knee',
    rightKnee: 'Right Knee',
    leftShin: 'Left Shin',
    rightShin: 'Right Shin',
    leftAnkle: 'Left Ankle',
    rightAnkle: 'Right Ankle',
    leftFoot: 'Left Foot',
    rightFoot: 'Right Foot',
    leftTrap: 'Left Trapezius',
    rightTrap: 'Right Trapezius',
    upperBack: 'Upper Back',
    leftLat: 'Left Latissimus',
    rightLat: 'Right Latissimus',
    midBack: 'Mid Back',
    lowerBack: 'Lower Back',
    leftGlute: 'Left Gluteus',
    rightGlute: 'Right Gluteus',
    leftHamstring: 'Left Hamstring',
    rightHamstring: 'Right Hamstring',
    leftCalf: 'Left Calf',
    rightCalf: 'Right Calf',
    leftAchilles: 'Left Achilles',
    rightAchilles: 'Right Achilles',
    leftHeel: 'Left Heel',
    rightHeel: 'Right Heel',
  };
  return muscleNames[key] || key.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function getBodyRegion(y: number): string {
  if (y < 120) return 'Head/Neck';
  if (y < 200) return 'Upper Body';
  if (y < 350) return 'Torso';
  if (y < 500) return 'Upper Legs';
  if (y < 630) return 'Lower Legs';
  return 'Feet';
}

function createPainLocationSection(painPoints: PainPoint[], selectedMuscles: string[]): Content[] {
  const frontPoints = painPoints.filter(p => p.view === 'front' || p.view === 'Front');
  const backPoints = painPoints.filter(p => p.view === 'back' || p.view === 'Back');
  
  const content: Content[] = [
    { text: 'Pain Locations', style: 'subheader' }
  ];

  if (selectedMuscles.length === 0 && painPoints.length === 0) {
    content.push({ text: 'No specific pain locations were marked.', style: 'value' });
    return content;
  }

  if (selectedMuscles.length > 0) {
    content.push(
      { text: `Affected Muscle Groups (${selectedMuscles.length} area${selectedMuscles.length > 1 ? 's' : ''})`, style: 'label' },
    );
    
    const musclesByGroup: Record<string, string[]> = {};
    selectedMuscles.forEach(muscle => {
      const displayName = getMuscleDisplayName(muscle);
      let group = 'Other';
      if (muscle.includes('Deltoid') || muscle.includes('Trap')) group = 'Shoulders';
      else if (muscle.includes('Pec') || muscle.includes('chest')) group = 'Chest';
      else if (muscle.includes('Bicep') || muscle.includes('Forearm')) group = 'Arms';
      else if (muscle.includes('Abs') || muscle.includes('Oblique')) group = 'Core';
      else if (muscle.includes('Back') || muscle.includes('Lat')) group = 'Back';
      else if (muscle.includes('Glute') || muscle.includes('Hamstring') || muscle.includes('Quad') || muscle.includes('Adductor')) group = 'Hips/Thighs';
      else if (muscle.includes('Knee') || muscle.includes('Shin') || muscle.includes('Calf')) group = 'Lower Legs';
      else if (muscle.includes('Ankle') || muscle.includes('Foot') || muscle.includes('Heel') || muscle.includes('Achilles')) group = 'Feet/Ankles';
      else if (muscle.includes('head') || muscle.includes('neck')) group = 'Head/Neck';
      
      if (!musclesByGroup[group]) musclesByGroup[group] = [];
      musclesByGroup[group].push(displayName);
    });

    const muscleList = selectedMuscles.map(m => getMuscleDisplayName(m)).join(', ');
    content.push({ text: muscleList, style: 'value' });
  }

  if (painPoints.length > 0) {
    content.push({ text: `Marked Pain Points (${painPoints.length} total)`, style: 'label' });
    
    const pointsSummary: string[] = [];
    if (frontPoints.length > 0) {
      const regions = new Set(frontPoints.map(p => getBodyRegion(p.y)));
      pointsSummary.push(`Front View: ${frontPoints.length} point(s) - ${Array.from(regions).join(', ')}`);
    }
    if (backPoints.length > 0) {
      const regions = new Set(backPoints.map(p => getBodyRegion(p.y)));
      pointsSummary.push(`Back View: ${backPoints.length} point(s) - ${Array.from(regions).join(', ')}`);
    }
    content.push({ ul: pointsSummary, style: 'value' });
  }

  return content;
}

function createPainDetailsSection(formData: FormData): Content[] {
  const content: Content[] = [
    { text: 'Pain Assessment Details', style: 'subheader' }
  ];

  const painLevelBar = {
    table: {
      widths: ['*'],
      body: [[{
        text: `Pain Level: ${formData.painLevel}/10`,
        fontSize: 11,
        bold: true,
        color: getPainLevelColor(formData.painLevel),
        margin: [8, 6, 8, 6] as [number, number, number, number]
      }]]
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#e5e7eb',
      vLineColor: () => '#e5e7eb'
    }
  };
  
  content.push(painLevelBar as Content);

  if (formData.painTypes.length > 0) {
    content.push(
      { text: 'Pain Characteristics', style: 'label' },
      { text: formData.painTypes.join(', '), style: 'value' }
    );
  }

  if (formData.frequency) {
    content.push(
      { text: 'Frequency', style: 'label' },
      { text: formData.frequency, style: 'value' }
    );
  }

  if (formData.duration) {
    content.push(
      { text: 'Duration', style: 'label' },
      { text: formData.duration, style: 'value' }
    );
  }

  if (formData.causes.length > 0) {
    content.push(
      { text: 'Potential Causes', style: 'label' },
      { text: formData.causes.join(', '), style: 'value' }
    );
  }

  if (formData.story) {
    content.push(
      { text: 'Pain Story', style: 'label' },
      { text: formData.story, style: 'value' }
    );
  }

  if (formData.progress) {
    content.push(
      { text: 'Progress Over Time', style: 'label' },
      { text: formData.progress, style: 'value' }
    );
  }

  if (formData.triggersAndRelief) {
    content.push(
      { text: 'Triggers & Relief', style: 'label' },
      { text: formData.triggersAndRelief, style: 'value' }
    );
  }

  if (formData.triedSoFar) {
    content.push(
      { text: 'Treatments Tried', style: 'label' },
      { text: formData.triedSoFar, style: 'value' }
    );
  }

  return content;
}

function createActivitySection(formData: FormData): Content[] {
  if (!formData.activities.length && !formData.intensity && !formData.goals) {
    return [];
  }

  const content: Content[] = [
    { text: 'Activity & Goals', style: 'subheader' }
  ];

  if (formData.activities.length > 0) {
    content.push(
      { text: 'Activities', style: 'label' },
      { text: formData.activities.join(', '), style: 'value' }
    );
  }

  if (formData.intensity) {
    content.push(
      { text: 'Activity Intensity', style: 'label' },
      { text: formData.intensity, style: 'value' }
    );
  }

  if (formData.goals) {
    content.push(
      { text: 'Goals', style: 'label' },
      { text: formData.goals, style: 'value' }
    );
  }

  return content;
}

function createConcernSection(formData: FormData): Content[] {
  if (!formData.concernLevel && !formData.concernReason) {
    return [];
  }

  const content: Content[] = [
    { text: 'Level of Concern', style: 'subheader' }
  ];

  content.push(
    { text: 'Concern Level', style: 'label' },
    { text: `${formData.concernLevel}/10`, style: 'value' }
  );

  if (formData.concernReason) {
    content.push(
      { text: 'Reason for Concern', style: 'label' },
      { text: formData.concernReason, style: 'value' }
    );
  }

  return content;
}

function createAnalysisSection(analysis: AnalysisResult): Content[] {
  const content: Content[] = [
    { text: 'Analysis & Recommendations', style: 'subheader' },
    { text: '', margin: [0, 0, 0, 4] }
  ];

  const urgencyBox = {
    table: {
      widths: ['*'],
      body: [[{
        stack: [
          { 
            text: analysis.urgency === 'high' ? 'Priority Attention Required' : 
                  analysis.urgency === 'moderate' ? 'Moderate Attention Needed' : 
                  'Low Concern Level',
            style: getUrgencyStyle(analysis.urgency)
          },
          { text: analysis.urgencyMessage, fontSize: 9, color: '#4b5563', margin: [0, 4, 0, 0] as [number, number, number, number] }
        ],
        margin: [10, 8, 10, 8] as [number, number, number, number]
      }]]
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => analysis.urgency === 'high' ? '#fecaca' : 
                        analysis.urgency === 'moderate' ? '#fde68a' : '#bbf7d0',
      vLineColor: () => analysis.urgency === 'high' ? '#fecaca' : 
                        analysis.urgency === 'moderate' ? '#fde68a' : '#bbf7d0',
      fillColor: () => analysis.urgency === 'high' ? '#fef2f2' : 
                        analysis.urgency === 'moderate' ? '#fffbeb' : '#f0fdf4'
    }
  };

  content.push(urgencyBox as Content);
  content.push({ text: '', margin: [0, 8, 0, 0] });

  content.push(
    { text: 'Summary', style: 'sectionTitle' },
    { text: analysis.summary, style: 'value' }
  );

  if (analysis.possibleConditions.length > 0) {
    content.push({ text: 'Possible Conditions', style: 'sectionTitle' });
    
    analysis.possibleConditions.forEach(condition => {
      content.push({
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              { 
                columns: [
                  { text: condition.name, style: 'conditionName', width: 'auto' },
                  { text: ` (${condition.likelihood})`, fontSize: 9, color: '#6b7280', width: 'auto' }
                ]
              },
              { text: condition.description, style: 'conditionDescription', margin: [0, 2, 0, 0] }
            ],
            margin: [8, 6, 8, 6]
          }]]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#e5e7eb',
          vLineColor: () => '#e5e7eb'
        },
        margin: [0, 4, 0, 4]
      } as Content);
    });
  }

  if (analysis.avoid.length > 0) {
    content.push(
      { text: 'Things to Avoid', style: 'sectionTitle' },
      { ul: analysis.avoid, style: 'listItem', margin: [0, 0, 0, 8] }
    );
  }

  if (analysis.safeToTry.length > 0) {
    content.push(
      { text: 'Safe to Try', style: 'sectionTitle' },
      { ul: analysis.safeToTry, style: 'listItem', margin: [0, 0, 0, 8] }
    );
  }

  if (analysis.timeline) {
    content.push(
      { text: 'Expected Timeline', style: 'sectionTitle' },
      { text: analysis.timeline, style: 'value' }
    );
  }

  if (analysis.nextSteps.length > 0) {
    content.push(
      { text: 'Recommended Next Steps', style: 'sectionTitle' },
      { ol: analysis.nextSteps, style: 'listItem', margin: [0, 0, 0, 8] }
    );
  }

  if (analysis.experts.length > 0) {
    content.push({ text: 'Recommended Specialists', style: 'sectionTitle' });
    
    analysis.experts.forEach(expert => {
      content.push({
        table: {
          widths: ['*'],
          body: [[{
            stack: [
              { text: expert.type, style: 'expertType' },
              { text: `Focus: ${expert.focus}`, style: 'expertFocus' },
              { text: `Why: ${expert.why}`, style: 'expertFocus', margin: [0, 2, 0, 0] }
            ],
            margin: [8, 6, 8, 6]
          }]]
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#dbeafe',
          vLineColor: () => '#dbeafe',
          fillColor: () => '#eff6ff'
        },
        margin: [0, 4, 0, 4]
      } as Content);
    });
  }

  return content;
}

export function generatePdfBuffer(data: AssessmentData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const docContent: Content[] = [
        { text: 'Body Pain Assessment Report', style: 'header' },
        { 
          text: `Generated on ${formatDate(data.createdAt)}`,
          fontSize: 10,
          color: '#6b7280',
          margin: [0, 0, 0, 20]
        },
        { 
          canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e5e7eb' }],
          margin: [0, 0, 0, 15]
        }
      ];

      docContent.push(...createPainLocationSection(data.painPoints, data.selectedMuscles));
      docContent.push(...createPainDetailsSection(data.formData));
      docContent.push(...createActivitySection(data.formData));
      docContent.push(...createConcernSection(data.formData));

      if (data.analysis) {
        docContent.push(...createAnalysisSection(data.analysis));
      }

      docContent.push({
        text: 'DISCLAIMER: This report is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.',
        style: 'disclaimer'
      });

      const docDefinition: TDocumentDefinitions = {
        content: docContent,
        styles,
        defaultStyle: {
          font: 'Helvetica'
        },
        pageSize: 'A4',
        pageMargins: [40, 40, 40, 40],
        info: {
          title: 'Body Pain Assessment Report',
          author: 'Body Pain Assessment App',
          subject: 'Pain Assessment Report'
        }
      };

      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];

      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    } catch (error) {
      reject(error);
    }
  });
}
