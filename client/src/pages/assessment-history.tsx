import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Clock,
  Calendar,
  Trash2,
  FileText,
  Eye,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  BookOpen,
  Download,
  Info,
  TrendingDown,
  TrendingUp,
  Minus
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
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
    urgencyMessage: string;
    possibleConditions: Array<{ name: string; likelihood: string; description: string }>;
    avoid: string[];
    safeToTry: string[];
    timeline: string;
    nextSteps: string[];
    experts: Array<{ name: string; focus: string; why: string }>;
  } | null;
  createdAt: string;
}

interface DiaryEntry {
  id: number;
  painLevel: number | null;
  entryText: string;
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

function getTrendIcon(current: number, previous: number) {
  if (current < previous) {
    return <TrendingDown className="w-4 h-4 text-green-500" />;
  } else if (current > previous) {
    return <TrendingUp className="w-4 h-4 text-red-500" />;
  }
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function getMuscleDisplayName(key: string): string {
  const muscleNames: Record<string, string> = {
    head: 'Head',
    neck: 'Neck',
    leftDeltoid: 'Left Shoulder',
    rightDeltoid: 'Right Shoulder',
    leftPec: 'Left Chest',
    rightPec: 'Right Chest',
    chest: 'Chest',
    leftBicep: 'Left Bicep',
    rightBicep: 'Right Bicep',
    leftForearm: 'Left Forearm',
    rightForearm: 'Right Forearm',
    leftHand: 'Left Hand',
    rightHand: 'Right Hand',
    upperAbs: 'Upper Abs',
    lowerAbs: 'Lower Abs',
    leftObliques: 'Left Obliques',
    rightObliques: 'Right Obliques',
    groin: 'Groin',
    leftAdductor: 'Left Inner Thigh',
    rightAdductor: 'Right Inner Thigh',
    leftQuad: 'Left Quad',
    rightQuad: 'Right Quad',
    leftKnee: 'Left Knee',
    rightKnee: 'Right Knee',
    leftShin: 'Left Shin',
    rightShin: 'Right Shin',
    leftAnkle: 'Left Ankle',
    rightAnkle: 'Right Ankle',
    leftFoot: 'Left Foot',
    rightFoot: 'Right Foot',
    traps: 'Upper Back/Traps',
    leftRearDelt: 'Left Rear Shoulder',
    rightRearDelt: 'Right Rear Shoulder',
    leftTricep: 'Left Tricep',
    rightTricep: 'Right Tricep',
    lats: 'Lats',
    upperBack: 'Upper Back',
    lowerBack: 'Lower Back',
    leftGlute: 'Left Glute',
    rightGlute: 'Right Glute',
    leftHamstring: 'Left Hamstring',
    rightHamstring: 'Right Hamstring',
    leftCalf: 'Left Calf',
    rightCalf: 'Right Calf',
    leftHeel: 'Left Heel',
    rightHeel: 'Right Heel',
  };
  return muscleNames[key] || key;
}

export default function AssessmentHistory() {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<LocalAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState<number | null>(null);
  const [diaryEntries, setDiaryEntries] = useState<Record<number, DiaryEntry[]>>({});

  useEffect(() => {
    const savedHistory = localStorage.getItem('assessmentHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setAssessments(parsed);
        // Fetch diary entries for each assessment
        parsed.forEach((assessment: LocalAssessment) => {
          fetchDiaryEntries(assessment.id);
        });
      } catch (error) {
        console.error('Failed to parse assessment history:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const fetchDiaryEntries = async (assessmentId: number) => {
    try {
      const response = await fetch(`/api/diary/entries?assessmentId=${assessmentId}`);
      if (response.ok) {
        const entries = await response.json();
        setDiaryEntries(prev => ({ ...prev, [assessmentId]: entries }));
      }
    } catch (error) {
      console.error('Failed to fetch diary entries:', error);
    }
  };

  const getAveragePain = (assessment: LocalAssessment): number => {
    const entries = diaryEntries[assessment.id] || [];
    const painLevels = entries
      .map(e => e.painLevel)
      .filter((level): level is number => level !== null);

    if (painLevels.length === 0) {
      return assessment.formData?.painLevel ?? 0;
    }

    const avg = painLevels.reduce((sum, level) => sum + level, 0) / painLevels.length;
    return Math.round(avg * 10) / 10; // Round to 1 decimal
  };

  const deleteAssessment = (id: number) => {
    const updated = assessments.filter(a => a.id !== id);
    setAssessments(updated);
    localStorage.setItem('assessmentHistory', JSON.stringify(updated));
    toast({ title: "Assessment deleted", description: "The assessment has been removed from your history." });
  };

  const downloadPdf = async (assessment: LocalAssessment) => {
    setIsExportingPdf(assessment.id);
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
      
      toast({ title: "PDF downloaded", description: "Your assessment report has been downloaded." });
    } catch {
      toast({ title: "Error", description: "Failed to download PDF", variant: "destructive" });
    } finally {
      setIsExportingPdf(null);
    }
  };

  // Removed diary export/import - diary entries are now managed per assessment via the server API

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const selectedAssessment = selectedId ? assessments.find(a => a.id === selectedId) : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <h1 className="text-base font-bold text-foreground" data-testid="history-title">Assessment History</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Track your pain over time</p>
            </div>
          </div>
          <Link href="/assessment">
            <Button variant="outline" size="sm" data-testid="button-new-assessment">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">New Assessment</span>
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {assessments.length === 0 ? (
          <Card className="text-center p-8">
            <div className="flex flex-col items-center gap-4">
              <Clock className="w-16 h-16 text-muted-foreground/50" />
              <div>
                <h2 className="text-xl font-semibold text-foreground">No assessments yet</h2>
                <p className="text-muted-foreground mt-1">Complete your first pain assessment to see your history here.</p>
              </div>
              <Link href="/assessment">
                <Button data-testid="button-start-first">Start First Assessment</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Logo size={24} />
                  Progress Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground" data-testid="stat-total-assessments">
                      {assessments.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Assessments</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl font-bold text-foreground" data-testid="stat-latest-pain">
                        {assessments[0]?.formData?.painLevel ?? 0}/10
                      </span>
                      {assessments.length > 1 && getTrendIcon(
                        assessments[0]?.formData?.painLevel ?? 0,
                        assessments[1]?.formData?.painLevel ?? 0
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">Latest Pain Level</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-foreground" data-testid="stat-avg-pain">
                      {(assessments.reduce((acc, a) => acc + (a.formData?.painLevel || 0), 0) / assessments.length).toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground">Average Pain</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-center gap-0.5" data-testid="stat-pain-trend">
                      {assessments.slice(0, 7).reverse().map((a, i) => {
                        const level = a.formData?.painLevel || 1;
                        return (
                          <div 
                            key={i} 
                            className={`w-3 ${getPainLevelColor(level)} rounded-sm`}
                            style={{ height: `${level * 3 + 6}px` }}
                            title={`Pain: ${level}/10`}
                          />
                        );
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Pain Trend</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recovery Journey
              </h2>
              
              {assessments.map((assessment, index) => {
                const avgPain = getAveragePain(assessment);
                const muscleDisplay = assessment.selectedMuscles
                  .slice(0, 3)
                  .map(m => getMuscleDisplayName(m))
                  .join(', ');

                return (
                  <Card
                    key={assessment.id}
                    className={`overflow-hidden ${selectedId === assessment.id ? 'ring-2 ring-primary' : ''}`}
                    data-testid={`assessment-card-${assessment.id}`}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        {/* Left side - Pain badge and location */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className={`w-12 h-12 rounded-lg ${getPainLevelColor(avgPain)} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}
                            data-testid={`pain-level-indicator-${assessment.id}`}
                          >
                            {avgPain}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-foreground truncate">
                              {muscleDisplay}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(assessment.createdAt), 'MMM d')}
                            </div>
                          </div>
                        </div>

                        {/* Right side - Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Link href={`/diary/${assessment.id}`}>
                            <Button
                              size="sm"
                              className="gap-2"
                              data-testid={`button-diary-${assessment.id}`}
                            >
                              <BookOpen className="w-4 h-4" />
                              Recovery Diary
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedId(selectedId === assessment.id ? null : assessment.id)}
                            title="View assessment details"
                            data-testid={`button-view-${assessment.id}`}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => downloadPdf(assessment)}
                            disabled={isExportingPdf === assessment.id}
                            title="Export as PDF"
                            data-testid={`button-pdf-${assessment.id}`}
                          >
                            {isExportingPdf === assessment.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <FileText className="w-4 h-4" />
                            )}
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Delete assessment"
                                data-testid={`button-delete-${assessment.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete this assessment from your history. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteAssessment(assessment.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>

                    {selectedId === assessment.id && assessment.analysis && (
                      <div className="border-t bg-muted/30 p-4 space-y-4">
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Analysis Summary</h4>
                          <p className="text-sm text-muted-foreground">{assessment.analysis.summary}</p>
                        </div>
                        
                        {assessment.analysis.possibleConditions && assessment.analysis.possibleConditions.length > 0 && (
                          <div>
                            <h4 className="font-medium text-foreground mb-2">Possible Conditions</h4>
                            <div className="flex flex-wrap gap-2">
                              {assessment.analysis.possibleConditions.map((condition, i) => (
                                <Badge key={i} variant="outline">{condition.name}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {assessment.analysis.nextSteps && assessment.analysis.nextSteps.length > 0 && (
                          <div>
                            <h4 className="font-medium text-foreground mb-2">Recommended Next Steps</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {assessment.analysis.nextSteps.slice(0, 3).map((step, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="text-sm text-muted-foreground">
                          <strong>Recovery Timeline:</strong> {assessment.analysis.timeline}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>

      <footer className="bg-card border-t mt-8">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Your assessment history is stored locally in your browser.
          </p>
        </div>
      </footer>
    </div>
  );
}
