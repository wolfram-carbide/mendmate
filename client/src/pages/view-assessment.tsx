import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { format } from "date-fns";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Download,
  FileText,
  Loader2,
  Activity,
  Clock,
  Target,
  Info,
  BookOpen,
  Lightbulb,
  Shield,
  TrendingUp,
  Heart
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { FormData, PainPoint } from "@shared/schema";

interface LocalAssessment {
  id: number;
  selectedMuscles: string[];
  painPoints: PainPoint[];
  formData: FormData;
  analysis: {
    summary: string;
    urgency: string;
    understandingWhatsHappening?: string;
    reassurance?: { title: string; message: string };
    possibleConditions: Array<{ name: string; likelihood: string; description: string }>;
    watchFor?: string[];
    recoveryPrinciples?: string[];
    avoid: string[];
    safeToTry: string[];
    timeline: string;
    resources?: Array<{ name: string; type: string; why: string }>;
  } | null;
  createdAt: string;
}

function getPainLevelColor(level: number): string {
  if (level <= 2) return "bg-green-500";
  if (level <= 4) return "bg-yellow-500";
  if (level <= 6) return "bg-orange-500";
  if (level <= 8) return "bg-red-500";
  return "bg-red-700";
}

function getPainLevelLabel(level: number): string {
  if (level <= 2) return "Minimal";
  if (level <= 4) return "Mild";
  if (level <= 6) return "Moderate";
  if (level <= 8) return "Severe";
  return "Extreme";
}

function getMuscleDisplayName(key: string): string {
  const muscleNames: Record<string, string> = {
    head: 'Head', neck: 'Neck', leftDeltoid: 'Left Shoulder', rightDeltoid: 'Right Shoulder',
    leftPec: 'Left Chest', rightPec: 'Right Chest', chest: 'Chest', leftBicep: 'Left Bicep',
    rightBicep: 'Right Bicep', leftForearm: 'Left Forearm', rightForearm: 'Right Forearm',
    leftHand: 'Left Hand', rightHand: 'Right Hand', upperAbs: 'Upper Abs', lowerAbs: 'Lower Abs',
    leftOblique: 'Left Side', rightOblique: 'Right Side', leftQuad: 'Left Thigh',
    rightQuad: 'Right Thigh', leftShin: 'Left Shin', rightShin: 'Right Shin',
    leftFoot: 'Left Foot', rightFoot: 'Right Foot', upperBack: 'Upper Back',
    midBack: 'Mid Back', lowerBack: 'Lower Back', leftTrap: 'Left Trap', rightTrap: 'Right Trap',
    leftRearDelt: 'Left Rear Shoulder', rightRearDelt: 'Right Rear Shoulder',
    leftLat: 'Left Lat', rightLat: 'Right Lat', leftTricep: 'Left Tricep',
    rightTricep: 'Right Tricep', leftGlute: 'Left Glute', rightGlute: 'Right Glute',
    leftHamstring: 'Left Hamstring', rightHamstring: 'Right Hamstring',
    leftCalf: 'Left Calf', rightCalf: 'Right Calf'
  };
  return muscleNames[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

function getUrgencyBadge(urgency: string | null | undefined) {
  if (!urgency) {
    return <Badge variant="outline" className="gap-1 text-muted-foreground"><Info className="w-3 h-3" />Pending Analysis</Badge>;
  }
  switch (urgency) {
    case 'high':
      return <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" />High Priority</Badge>;
    case 'moderate':
      return <Badge className="gap-1 bg-orange-500"><Info className="w-3 h-3" />Medium Priority</Badge>;
    default:
      return <Badge variant="secondary" className="gap-1"><CheckCircle2 className="w-3 h-3" />Low Priority</Badge>;
  }
}

export default function ViewAssessment() {
  const { id } = useParams<{ id: string }>();
  const [assessment, setAssessment] = useState<LocalAssessment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('assessmentHistory');
    if (stored) {
      const assessments: LocalAssessment[] = JSON.parse(stored);
      const found = assessments.find(a => a.id === parseInt(id || '0'));
      setAssessment(found || null);
    }
    setIsLoading(false);
  }, [id]);

  const exportJSON = () => {
    if (!assessment) return;
    const data = JSON.stringify(assessment, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-${format(new Date(assessment.createdAt), 'yyyy-MM-dd')}.json`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast({ title: "Backup saved", description: "Your assessment has been saved to your device." });
  };

  const exportPDF = async () => {
    if (!assessment) return;
    setIsExportingPdf(true);
    try {
      const response = await fetch('/api/assessments/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedMuscles: assessment.selectedMuscles,
          painPoints: assessment.painPoints,
          formData: assessment.formData,
          analysis: assessment.analysis,
        }),
      });
      if (!response.ok) throw new Error('Failed to generate PDF');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pain-assessment-${format(new Date(assessment.createdAt), 'yyyy-MM-dd')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({ title: "Report downloaded", description: "Your assessment report has been downloaded." });
    } catch {
      toast({ title: "Error", description: "Failed to download report", variant: "destructive" });
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h1 className="text-base font-bold text-foreground">Assessment Not Found</h1>
            </div>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6">
          <Card className="text-center p-8">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="w-16 h-16 text-muted-foreground/50" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">Assessment not found</h2>
                <p className="text-muted-foreground mt-1">
                  This assessment may have been deleted, or your browser data was cleared.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  If you have a backup file, you can restore it from your Recovery Journey.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link href="/history">
                  <Button data-testid="button-back-to-journey">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Recovery Journey
                  </Button>
                </Link>
                <Link href="/assessment">
                  <Button variant="outline" data-testid="button-new-assessment">
                    Start New Assessment
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const painLevel = assessment.formData?.painLevel ?? 0;
  const muscleDisplay = assessment.selectedMuscles.map(m => getMuscleDisplayName(m)).join(', ');
  const analysis = assessment.analysis;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h1 className="text-base font-bold text-foreground" data-testid="view-title">Assessment Details</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                {format(new Date(assessment.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <Link href="/history">
            <Button variant="outline" size="sm" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Back to Journey</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-lg ${getPainLevelColor(painLevel)} flex flex-col items-center justify-center text-white`}
                  data-testid="pain-level-badge"
                >
                  <span className="font-bold text-xl leading-none">{painLevel}</span>
                  <span className="text-[10px] opacity-80">/10</span>
                </div>
                <div>
                  <CardTitle className="text-lg">{muscleDisplay}</CardTitle>
                  <p className="text-sm text-muted-foreground">{getPainLevelLabel(painLevel)} pain</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getUrgencyBadge(analysis?.urgency)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Link href={`/diary/${assessment.id}`}>
                <Button size="sm" data-testid="button-open-diary">
                  <BookOpen className="w-4 h-4 mr-1" />
                  Recovery Diary
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={exportJSON} data-testid="button-save-backup">
                <Download className="w-4 h-4 mr-1" />
                Save Backup
              </Button>
              <Button variant="outline" size="sm" onClick={exportPDF} disabled={isExportingPdf} data-testid="button-download-report">
                {isExportingPdf ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileText className="w-4 h-4 mr-1" />}
                {isExportingPdf ? 'Generating...' : 'Download Report'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {analysis && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{analysis.summary}</p>
              </CardContent>
            </Card>

            {analysis.understandingWhatsHappening && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    What's Happening
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground leading-relaxed">{analysis.understandingWhatsHappening}</p>
                </CardContent>
              </Card>
            )}

            {analysis.reassurance && (
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle2 className="w-5 h-5" />
                    {analysis.reassurance.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-green-900 dark:text-green-100 leading-relaxed">{analysis.reassurance.message}</p>
                </CardContent>
              </Card>
            )}

            {analysis.possibleConditions && analysis.possibleConditions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Possible Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.possibleConditions.map((condition, i) => (
                    <div key={i} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{condition.name}</span>
                        <Badge variant="outline" className="text-xs">{condition.likelihood}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{condition.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {analysis.watchFor && analysis.watchFor.length > 0 && (
              <Card className="border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertCircle className="w-5 h-5" />
                    Watch For These Signs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.watchFor.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-red-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {analysis.avoid && analysis.avoid.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="w-5 h-5 text-orange-500" />
                      Temporarily Avoid
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.avoid.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="text-orange-500 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {analysis.safeToTry && analysis.safeToTry.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Safe to Try
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {analysis.safeToTry.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="text-green-500 mt-1">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>

            {analysis.recoveryPrinciples && analysis.recoveryPrinciples.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Recovery Principles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.recoveryPrinciples.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-primary mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Expected Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{analysis.timeline}</p>
              </CardContent>
            </Card>

            {analysis.resources && analysis.resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Recommended Resources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysis.resources.map((resource, i) => (
                    <div key={i} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{resource.name}</span>
                        <Badge variant="outline" className="text-xs">{resource.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{resource.why}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {assessment.formData?.story && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Story</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm whitespace-pre-wrap">{assessment.formData.story}</p>
            </CardContent>
          </Card>
        )}

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 dark:text-amber-200">
            <strong>Not medical advice.</strong> This assessment is for educational purposes only. 
            Always consult a healthcare professional for proper diagnosis and treatment.
          </p>
        </div>
      </main>
    </div>
  );
}
