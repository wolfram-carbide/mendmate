/**
 * Expert Knowledge Base for Body Pain Assessment
 * 
 * This file contains curated research data on:
 * - Leading practitioners/experts by body region
 * - Injury statistics and prevalence data
 * - Evidence-based recovery principles
 * - Pain science insights
 * 
 * Sources: Academic research, peer-reviewed journals, 2024 statistics
 * Last updated: December 2024
 * 
 * To modify: Update the relevant section and the AI prompt will use the new data.
 */

export interface Expert {
  name: string;
  credentials: string;
  institution: string;
  specialty: string;
  keyWork: string;
  whyRecommended: string;
  resources?: string[];
}

export interface BodyRegionData {
  commonConditions: string[];
  prevalence: string;
  typicalCauses: string[];
  recoveryTimeline: string;
  experts: Expert[];
  keyPrinciples: string[];
}

export interface InjuryStatistics {
  annualERVisits: string;
  lowerExtremityPercentage: number;
  upperExtremityPercentage: number;
  jointInjuryPrevalence: number;
  muscleStrainPrevalence: number;
  tendinopathyPrevalence: number;
  overuseInjuryPercentage: number;
}

/**
 * Experts organized by body region
 * Each expert has been vetted for academic credentials, peer-reviewed research,
 * and accessibility to non-professional athletes
 */
export const EXPERTS_BY_REGION: Record<string, BodyRegionData> = {
  back: {
    commonConditions: [
      'Lower back pain/strain',
      'Disc herniation/bulge',
      'SI joint dysfunction',
      'Muscle imbalances',
      'Facet joint irritation'
    ],
    prevalence: 'Lower back pain affects 80% of adults at some point; most common in ages 30-50',
    typicalCauses: [
      'Prolonged sitting/posture',
      'Sudden load increase',
      'Poor lifting mechanics',
      'Core weakness',
      'Hip mobility restrictions'
    ],
    recoveryTimeline: 'Acute: 2-6 weeks. Sub-acute: 6-12 weeks. Chronic: requires 3-6 months of consistent management.',
    experts: [
      {
        name: 'Dr. Stuart McGill',
        credentials: 'PhD, Professor Emeritus',
        institution: 'University of Waterloo',
        specialty: 'Spine biomechanics, injury prevention, rehabilitation',
        keyWork: 'Back Mechanic, Ultimate Back Fitness and Performance',
        whyRecommended: '30+ years researching spine mechanics. His "McGill Big 3" exercises are evidence-based core stabilizers. Treats professional athletes and everyday people alike.',
        resources: ['Back Mechanic (book)', 'backfitpro.com']
      }
    ],
    keyPrinciples: [
      'Spine sparing strategies - avoid repeated flexion under load',
      'Core stiffness over core strength - brace, dont hollow',
      'Hip hinging - use hips, not spine, for bending',
      'Progressive loading after initial rest period',
      'Movement variability - avoid prolonged static positions'
    ]
  },
  
  knee: {
    commonConditions: [
      'Patellofemoral pain syndrome (runners knee)',
      'IT band syndrome',
      'Meniscus irritation',
      'Patellar tendinopathy (jumpers knee)',
      'Ligament strains (MCL, ACL partial)',
      'Chondromalacia patellae'
    ],
    prevalence: 'Knee injuries account for 41% of all sports injuries. Patellofemoral pain affects 25% of runners.',
    typicalCauses: [
      'Training volume spikes',
      'Weak hip abductors/glutes',
      'Poor landing mechanics',
      'Quadriceps dominance',
      'Ankle mobility restrictions'
    ],
    recoveryTimeline: 'Patellofemoral: 6-12 weeks. IT band: 4-8 weeks. Patellar tendinopathy: 3-6 months. ACL (if conservative): 6-12 months.',
    experts: [
      {
        name: 'Dr. Robert LaPrade',
        credentials: 'MD, PhD',
        institution: 'Twin Cities Orthopedics, University of Minnesota',
        specialty: 'Complex knee injuries, ligament reconstruction, biomechanics',
        keyWork: '525+ peer-reviewed papers, Evidence-Based Management of Complex Knee Injuries',
        whyRecommended: 'Considered the "Stuart McGill of knees." His research on posterolateral corner and multi-ligament injuries is foundational. Treats elite athletes but principles apply broadly.',
        resources: ['drrobertlaprademd.com', 'The Knee Injury Bible']
      }
    ],
    keyPrinciples: [
      'Load management - gradual progression of running/jumping',
      'Hip strengthening - glute medius is critical for knee tracking',
      'Eccentric loading - especially for tendinopathies',
      'Dont ignore the ankle - mobility affects knee mechanics',
      'Single-leg stability work before return to sport'
    ]
  },
  
  shoulder: {
    commonConditions: [
      'Rotator cuff strain/tendinopathy',
      'Shoulder impingement',
      'Biceps tendinopathy',
      'Labral irritation (SLAP)',
      'AC joint issues',
      'Frozen shoulder (adhesive capsulitis)'
    ],
    prevalence: 'Rotator cuff issues affect 30% of adults over 60; common in overhead athletes at any age.',
    typicalCauses: [
      'Overhead repetition (swimming, throwing, pressing)',
      'Poor scapular control',
      'Thoracic spine stiffness',
      'Training volume spikes',
      'Sleeping position'
    ],
    recoveryTimeline: 'Rotator cuff strain: 6-12 weeks. Impingement: 3-6 months. Frozen shoulder: 12-24 months.',
    experts: [
      {
        name: 'Dr. Jay Keener',
        credentials: 'MD',
        institution: 'Washington University School of Medicine',
        specialty: 'Rotator cuff disease, shoulder arthroscopy',
        keyWork: '15+ years prospective studies on rotator cuff natural history',
        whyRecommended: 'World-renowned researcher who proved many rotator cuff tears can be managed conservatively. His work helps patients avoid unnecessary surgery.',
        resources: ['ortho.wustl.edu']
      }
    ],
    keyPrinciples: [
      'Scapular control before rotator cuff - the foundation matters',
      'Thoracic mobility - stiff upper back overloads shoulder',
      'Gradual return to overhead - progressive loading',
      'Relative rest, not complete rest - movement helps healing',
      'Address posture - forward head/rounded shoulders contribute'
    ]
  },
  
  hip: {
    commonConditions: [
      'Hip flexor strain/tightness',
      'Femoroacetabular impingement (FAI)',
      'Labral irritation',
      'Piriformis syndrome',
      'Greater trochanteric pain syndrome',
      'Hip bursitis'
    ],
    prevalence: 'Hip pain affects 15-25% of athletes. FAI present in 10-15% of general population (often asymptomatic).',
    typicalCauses: [
      'Prolonged sitting',
      'Deep squatting/lunging volume',
      'Running volume increases',
      'Weak glutes',
      'Poor hip mobility'
    ],
    recoveryTimeline: 'Hip flexor strain: 2-6 weeks. FAI (conservative): 3-6 months. Labral (conservative): 3-12 months.',
    experts: [
      {
        name: 'Dr. Marc Philippon',
        credentials: 'MD',
        institution: 'Steadman Clinic, Steadman Philippon Research Institute',
        specialty: 'Hip arthroscopy, FAI, labral tears, joint preservation',
        keyWork: 'Pioneer of hip arthroscopy, 10+ year outcome studies on FAI treatment',
        whyRecommended: 'Treats NFL, NBA, NHL, Olympic athletes but his research on conservative vs surgical management helps all patients make informed decisions.',
        resources: ['thesteadmanclinic.com', 'sprivail.org']
      }
    ],
    keyPrinciples: [
      'Hip mobility before hip strength - restore range first',
      'Avoid deep end-range loading initially - modify squat depth',
      'Glute activation - posterior chain balance is critical',
      'Address sitting habits - breaks and position changes',
      'Core-hip connection - proximal stability for distal mobility'
    ]
  },
  
  ankle_foot: {
    commonConditions: [
      'Achilles tendinopathy',
      'Plantar fasciitis/fasciosis',
      'Ankle sprains',
      'Posterior tibial tendinopathy',
      'Stress reactions/fractures',
      'Calf strains'
    ],
    prevalence: 'Ankle sprains: most common sports injury (25,000/day in US). Achilles issues affect 6% of general population, higher in runners.',
    typicalCauses: [
      'Training volume spikes',
      'Footwear changes',
      'Running surface changes',
      'Calf weakness/tightness',
      'Previous ankle sprains'
    ],
    recoveryTimeline: 'Ankle sprain: 2-8 weeks. Achilles tendinopathy: 3-6 months. Plantar fasciitis: 6-12 months.',
    experts: [
      {
        name: 'Prof. Jill Cook',
        credentials: 'PhD',
        institution: 'La Trobe University, Australia',
        specialty: 'Tendinopathy, Achilles, patellar tendon, progressive loading',
        keyWork: 'Tendon continuum model, 325+ publications on tendon rehabilitation',
        whyRecommended: 'The worlds leading tendon researcher. Her progressive loading protocols have revolutionized treatment - moving away from rest toward structured loading.',
        resources: ['sportsmap.com.au', 'Research publications via La Trobe']
      }
    ],
    keyPrinciples: [
      'Progressive loading is treatment - tendons need load to heal',
      'Isometrics for pain relief - heavy holds reduce pain',
      'Avoid compression at insertion - modify stretching',
      'Calf strength is key - heel raises with progressive load',
      'Patience required - tendons heal slowly (3-6 months typical)'
    ]
  },
  
  elbow_wrist: {
    commonConditions: [
      'Lateral epicondylitis (tennis elbow)',
      'Medial epicondylitis (golfers elbow)',
      'Wrist extensor strains',
      'Triceps tendinopathy',
      'Forearm muscle tightness'
    ],
    prevalence: 'Tennis elbow affects 1-3% of general population; higher in manual workers and racquet sports.',
    typicalCauses: [
      'Grip-intensive activities',
      'Repetitive wrist extension',
      'Poor ergonomics',
      'Training volume spikes',
      'Equipment issues (grip size, technique)'
    ],
    recoveryTimeline: 'Tennis/golfers elbow: 6-12 months (70-90% resolve with conservative care).',
    experts: [
      {
        name: 'Bisset/Coombes Research Group',
        credentials: 'PhD researchers',
        institution: 'Various (Australia, UK)',
        specialty: 'Tennis elbow, lateral epicondylitis evidence-based treatment',
        keyWork: 'Cochrane reviews, RCTs on exercise therapy for elbow tendinopathy',
        whyRecommended: 'Their research proved eccentric exercise is superior to corticosteroid injections long-term. Changed clinical practice worldwide.',
        resources: ['Cochrane Database reviews', 'BJSM publications']
      }
    ],
    keyPrinciples: [
      'Eccentric loading - Tyler Twist / FlexBar protocols',
      'Avoid repeated steroid injections - worse long-term outcomes',
      'Activity modification - palm-up lifting reduces strain',
      'Gradual return - 70-90% resolve in 12 months with patience',
      'Grip strength maintenance - dont completely rest'
    ]
  }
};

/**
 * Pain Science Principles
 * Based on Prof. Lorimer Moseley's research (University of South Australia)
 * These principles help reduce anxiety and improve outcomes
 */
export const PAIN_SCIENCE_PRINCIPLES = {
  expert: {
    name: 'Prof. Lorimer Moseley',
    credentials: 'AO, PhD',
    institution: 'University of South Australia',
    specialty: 'Pain neuroscience, chronic pain, bioplasticity',
    keyWork: '400+ publications, Explain Pain, Painful Yarns, Pain Revolution',
    whyRecommended: 'Leading pain scientist in the world. His work proves that understanding pain actually reduces pain. Made Officer of the Order of Australia for contributions to pain science.'
  },
  
  coreConcepts: [
    {
      principle: 'Pain is protection, not damage measurement',
      explanation: 'Pain is your brains way of protecting you - it doesnt accurately measure tissue damage. This is why paper cuts hurt so much and major injuries sometimes dont.'
    },
    {
      principle: 'All pain is real',
      explanation: 'No matter the cause, your pain experience is always real and valid. Pain is never "just in your head" - its a real output from your nervous system.'
    },
    {
      principle: 'Pain systems can become sensitized',
      explanation: 'The longer you have pain, the more protective your nervous system becomes. This isnt damage getting worse - its your alarm system becoming more sensitive.'
    },
    {
      principle: 'Understanding reduces pain',
      explanation: 'Simply learning how pain works can reduce your pain experience. Knowledge is genuinely therapeutic.'
    },
    {
      principle: 'Recovery has many pathways',
      explanation: 'Because many factors contribute to pain (stress, sleep, beliefs, tissue state), there are many ways to improve. Small changes compound.'
    }
  ],
  
  fitForPurposeModel: {
    pillar1: 'Structural Integrity - physical capacity and tissue health',
    pillar2: 'Individual Conviction - your beliefs and confidence about recovery',
    pillar3: 'Brain-Body Alignment - accurate sensory representation and motor control'
  },
  
  resources: ['Tame the Beast (free video at tamethebeast.org)', 'Explain Pain (book)', 'Pain Matters Podcast']
};

/**
 * Movement/Mobility Experts
 * Practitioners focused on general movement quality and mobility
 */
export const MOVEMENT_EXPERTS = {
  grayCoook: {
    name: 'Gray Cook',
    credentials: 'MSPT, OCS, CSCS',
    institution: 'Functional Movement Systems',
    specialty: 'Movement assessment, corrective exercise, FMS',
    keyWork: 'Athletic Body in Balance, Movement (book), Functional Movement Screen',
    whyRecommended: 'Board-certified orthopedic specialist with strength & conditioning credentials. His movement screening is used by NFL, NBA, NHL teams. Academic rigor with practical application.',
    resources: ['functionalmovement.com', 'Athletic Body in Balance (book)']
  },
  
  kellyStarrett: {
    name: 'Dr. Kelly Starrett',
    credentials: 'DPT',
    institution: 'The Ready State (founder)',
    specialty: 'Mobility, movement mechanics, pain-free performance',
    keyWork: 'Becoming a Supple Leopard (3x NYT bestseller), Built to Move',
    whyRecommended: 'Physical therapist who translated mobility work for athletes. His 10-minute mobility routines are accessible and effective. Consults with professional sports teams and military.',
    resources: ['thereadystate.com', 'Becoming a Supple Leopard (book)']
  }
};

/**
 * 2024 Injury Statistics
 * Sources: NSC, NCBI, ASPE, BMC Musculoskeletal Disorders
 */
export const INJURY_STATISTICS: InjuryStatistics = {
  annualERVisits: '4.4 million for sports/recreational injuries in 2024',
  lowerExtremityPercentage: 42,
  upperExtremityPercentage: 30,
  jointInjuryPrevalence: 55,
  muscleStrainPrevalence: 48,
  tendinopathyPrevalence: 30,
  overuseInjuryPercentage: 65
};

/**
 * General Recovery Principles
 * Evidence-based approaches that apply across most musculoskeletal conditions
 */
export const GENERAL_RECOVERY_PRINCIPLES = [
  {
    principle: 'Load management over complete rest',
    explanation: 'Tissues need appropriate loading to heal. Complete rest often weakens structures and delays recovery. Find your "Goldilocks zone" of activity.'
  },
  {
    principle: 'Progressive adaptation',
    explanation: 'Gradually increase demands on healing tissue. Your body adapts to what you ask of it - ask for a little more each week.'
  },
  {
    principle: 'Consistency over intensity',
    explanation: 'Daily gentle care beats sporadic aggressive treatment. 10 minutes every day trumps 2 hours once a week.'
  },
  {
    principle: 'Pain is information, not just a stop sign',
    explanation: 'Some discomfort during rehabilitation is normal and even necessary. Learn to distinguish helpful discomfort from harmful pain.'
  },
  {
    principle: 'Sleep and stress matter',
    explanation: 'Recovery happens during sleep. High stress slows healing. Addressing these is as important as exercises.'
  },
  {
    principle: 'The whole chain matters',
    explanation: 'Pain in one area often relates to dysfunction elsewhere. Hip issues affect knees; thoracic spine affects shoulders. Look beyond the painful spot.'
  }
];

/**
 * Helper function to get relevant experts for a list of body areas
 */
export function getExpertsForAreas(muscleLabels: string[]): Expert[] {
  const experts: Expert[] = [];
  const addedNames = new Set<string>();
  
  const labelLower = muscleLabels.map(l => l.toLowerCase()).join(' ');
  
  if (labelLower.includes('back') || labelLower.includes('spine') || labelLower.includes('lumbar') || labelLower.includes('erector')) {
    EXPERTS_BY_REGION.back.experts.forEach(e => {
      if (!addedNames.has(e.name)) {
        experts.push(e);
        addedNames.add(e.name);
      }
    });
  }
  
  if (labelLower.includes('knee') || labelLower.includes('quad') || labelLower.includes('patella') || labelLower.includes('hamstring')) {
    EXPERTS_BY_REGION.knee.experts.forEach(e => {
      if (!addedNames.has(e.name)) {
        experts.push(e);
        addedNames.add(e.name);
      }
    });
  }
  
  if (labelLower.includes('shoulder') || labelLower.includes('rotator') || labelLower.includes('delt') || labelLower.includes('trap')) {
    EXPERTS_BY_REGION.shoulder.experts.forEach(e => {
      if (!addedNames.has(e.name)) {
        experts.push(e);
        addedNames.add(e.name);
      }
    });
  }
  
  if (labelLower.includes('hip') || labelLower.includes('glute') || labelLower.includes('piriformis') || labelLower.includes('flexor')) {
    EXPERTS_BY_REGION.hip.experts.forEach(e => {
      if (!addedNames.has(e.name)) {
        experts.push(e);
        addedNames.add(e.name);
      }
    });
  }
  
  if (labelLower.includes('ankle') || labelLower.includes('achilles') || labelLower.includes('calf') || labelLower.includes('foot') || labelLower.includes('plantar')) {
    EXPERTS_BY_REGION.ankle_foot.experts.forEach(e => {
      if (!addedNames.has(e.name)) {
        experts.push(e);
        addedNames.add(e.name);
      }
    });
  }
  
  if (labelLower.includes('elbow') || labelLower.includes('wrist') || labelLower.includes('forearm')) {
    EXPERTS_BY_REGION.elbow_wrist.experts.forEach(e => {
      if (!addedNames.has(e.name)) {
        experts.push(e);
        addedNames.add(e.name);
      }
    });
  }
  
  return experts;
}

/**
 * Helper function to get recovery principles for body areas
 */
export function getPrinciplesForAreas(muscleLabels: string[]): string[] {
  const principles: string[] = [];
  const labelLower = muscleLabels.map(l => l.toLowerCase()).join(' ');
  
  if (labelLower.includes('back') || labelLower.includes('spine') || labelLower.includes('lumbar')) {
    principles.push(...EXPERTS_BY_REGION.back.keyPrinciples);
  }
  if (labelLower.includes('knee') || labelLower.includes('patella')) {
    principles.push(...EXPERTS_BY_REGION.knee.keyPrinciples);
  }
  if (labelLower.includes('shoulder') || labelLower.includes('rotator')) {
    principles.push(...EXPERTS_BY_REGION.shoulder.keyPrinciples);
  }
  if (labelLower.includes('hip') || labelLower.includes('glute')) {
    principles.push(...EXPERTS_BY_REGION.hip.keyPrinciples);
  }
  if (labelLower.includes('ankle') || labelLower.includes('achilles') || labelLower.includes('calf')) {
    principles.push(...EXPERTS_BY_REGION.ankle_foot.keyPrinciples);
  }
  if (labelLower.includes('elbow') || labelLower.includes('wrist')) {
    principles.push(...EXPERTS_BY_REGION.elbow_wrist.keyPrinciples);
  }
  
  return Array.from(new Set(principles)).slice(0, 5);
}
