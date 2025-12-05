import { useQuery, useMutation } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Trash2, 
  FileText, 
  Eye, 
  ArrowLeft,
  Activity,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Info,
  Loader2
} from "lucide-react";
import { Link } from "wouter";
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
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Assessment, FormData, PainPoint } from "@shared/schema";

interface AssessmentWithParsed extends Omit<Assessment, 'formData' | 'painPoints' | 'analysis'> {
  formData: FormData;
  painPoints: PainPoint[];
  analysis: {
    summary: string;
    urgency: string;
    urgencyMessage: string;
    possibleConditions: string[];
    avoid: string[];
    safeToTry: string[];
    timeline: string;
    nextSteps: string[];
    experts: string[];
  } | null;
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
    case 'medium':
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
    leftTrap: 'Left Trapezius',
    rightTrap: 'Right Trapezius',
    upperBack: 'Upper Back',
    leftLat: 'Left Lat',
    rightLat: 'Right Lat',
    midBack: 'Mid Back',
    lowerBack: 'Lower Back',
    leftGlute: 'Left Glute',
    rightGlute: 'Right Glute',
    leftHamstring: 'Left Hamstring',
    rightHamstring: 'Right Hamstring',
    leftCalf: 'Left Calf',
    rightCalf: 'Right Calf',
    leftAchilles: 'Left Achilles',
    rightAchilles: 'Right Achilles',
    leftHeel: 'Left Heel',
    rightHeel: 'Right Heel',
  };
  return muscleNames[key] || key;
}

export default function AssessmentHistory() {
  const { toast } = useToast();
  
  const { data: assessments, isLoading, error } = useQuery<Assessment[]>({
    queryKey: ['/api/assessments'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/assessments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/assessments'] });
      toast({ title: "Assessment deleted", description: "The assessment has been removed from your history." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete assessment", variant: "destructive" });
    },
  });

  const downloadPdf = async (id: number) => {
    try {
      const response = await fetch(`/api/assessments/${id}/pdf`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to generate PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pain-assessment-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "PDF downloaded", description: "Your assessment report has been downloaded." });
    } catch {
      toast({ title: "Error", description: "Failed to download PDF", variant: "destructive" });
    }
  };

  const parsedAssessments: AssessmentWithParsed[] = (assessments || []).map(a => ({
    ...a,
    formData: a.formData as FormData,
    painPoints: a.painPoints as PainPoint[],
    analysis: a.analysis as AssessmentWithParsed['analysis'],
  })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <p className="text-muted-foreground">Failed to load assessment history</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Assessment
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-destructive to-orange-500 rounded-lg flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground" data-testid="history-title">Assessment History</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">Track your pain over time</p>
            </div>
          </div>
          <Link href="/">
            <Button variant="outline" data-testid="button-new-assessment">
              <ArrowLeft className="w-4 h-4 mr-2" />
              New Assessment
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {parsedAssessments.length === 0 ? (
          <Card className="text-center p-8">
            <div className="flex flex-col items-center gap-4">
              <Clock className="w-16 h-16 text-muted-foreground/50" />
              <div>
                <h3 className="text-lg font-semibold">No assessments yet</h3>
                <p className="text-muted-foreground">Complete your first pain assessment to start tracking your progress.</p>
              </div>
              <Link href="/">
                <Button data-testid="button-start-first">Start Your First Assessment</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            {parsedAssessments.length >= 2 && (
              <Card className="p-4">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Progress Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground" data-testid="stat-total">
                        {parsedAssessments.length}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Assessments</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-2xl font-bold text-foreground" data-testid="stat-latest-pain">
                          {parsedAssessments[0]?.formData?.painLevel ?? 0}/10
                        </span>
                        {parsedAssessments.length > 1 && getTrendIcon(
                          parsedAssessments[0]?.formData?.painLevel ?? 0,
                          parsedAssessments[1]?.formData?.painLevel ?? 0
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">Latest Pain Level</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground" data-testid="stat-avg-pain">
                        {(parsedAssessments.reduce((acc, a) => acc + (a.formData?.painLevel || 0), 0) / parsedAssessments.length).toFixed(1)}
                      </div>
                      <div className="text-xs text-muted-foreground">Average Pain Level</div>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground" data-testid="stat-areas">
                        {new Set(parsedAssessments.flatMap(a => a.selectedMuscles)).size}
                      </div>
                      <div className="text-xs text-muted-foreground">Unique Areas Affected</div>
                    </div>
                  </div>

                  {parsedAssessments.length >= 2 && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Pain Level Trend
                      </h4>
                      <div className="flex items-end gap-1 h-24">
                        {parsedAssessments.slice(0, 10).reverse().map((a, i) => {
                          const level = a.formData?.painLevel || 1;
                          const height = (level / 10) * 100;
                          return (
                            <div key={a.id} className="flex-1 flex flex-col items-center gap-1">
                              <div 
                                className={`w-full rounded-t ${getPainLevelColor(level)}`}
                                style={{ height: `${height}%` }}
                                title={`${format(new Date(a.createdAt), 'MMM d')}: ${level}/10`}
                                data-testid={`trend-bar-${i}`}
                              />
                              <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                                {format(new Date(a.createdAt), 'M/d')}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Assessment Timeline
              </h2>
              
              {parsedAssessments.map((assessment, index) => {
                const prevAssessment = parsedAssessments[index + 1];
                const painChange = prevAssessment 
                  ? assessment.formData.painLevel - prevAssessment.formData.painLevel 
                  : 0;

                return (
                  <Card key={assessment.id} className="overflow-hidden" data-testid={`assessment-card-${assessment.id}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div 
                            className={`w-12 h-12 rounded-lg ${getPainLevelColor(assessment.formData.painLevel)} flex items-center justify-center text-white font-bold text-lg`}
                            data-testid={`pain-indicator-${assessment.id}`}
                          >
                            {assessment.formData.painLevel}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-foreground">
                                {getPainLevelLabel(assessment.formData.painLevel)} Pain
                              </span>
                              {painChange !== 0 && (
                                <Badge 
                                  variant={painChange < 0 ? "secondary" : "destructive"} 
                                  className="gap-1 text-xs"
                                  data-testid={`pain-change-${assessment.id}`}
                                >
                                  {painChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                  {Math.abs(painChange)} point{Math.abs(painChange) > 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(assessment.createdAt), 'MMMM d, yyyy • h:mm a')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => downloadPdf(assessment.id)}
                            title="Download PDF"
                            data-testid={`button-pdf-${assessment.id}`}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Delete"
                                data-testid={`button-delete-${assessment.id}`}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Assessment?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove this assessment from your history. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteMutation.mutate(assessment.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  data-testid={`button-confirm-delete-${assessment.id}`}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid sm:grid-cols-2 gap-4 mt-3">
                        <div>
                          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            Affected Areas ({assessment.selectedMuscles.length})
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {assessment.selectedMuscles.slice(0, 6).map(muscle => (
                              <Badge 
                                key={muscle} 
                                variant="outline" 
                                className="text-xs"
                                data-testid={`muscle-badge-${assessment.id}-${muscle}`}
                              >
                                {getMuscleDisplayName(muscle)}
                              </Badge>
                            ))}
                            {assessment.selectedMuscles.length > 6 && (
                              <Badge variant="outline" className="text-xs">
                                +{assessment.selectedMuscles.length - 6} more
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {assessment.analysis && (
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Assessment Result
                            </h4>
                            {getUrgencyBadge(assessment.analysis.urgency)}
                            {assessment.formData.painTypes.length > 0 && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                Pain type: {assessment.formData.painTypes.slice(0, 3).join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {assessment.painPoints.length > 0 && (
                        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                          {assessment.painPoints.filter(p => p.view === 'Front' || p.view === 'front').length} pain points marked on front, {' '}
                          {assessment.painPoints.filter(p => p.view === 'Back' || p.view === 'back').length} on back
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
