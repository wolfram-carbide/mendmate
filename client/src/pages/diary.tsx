import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Dumbbell, TrendingUp, ArrowLeft, Trash2, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type EntryType = "pain" | "workout" | "progression" | "general";

interface DiaryEntry {
  id: string;
  assessmentId: string;
  entryType: EntryType;
  painLevel: number | null;
  entryText: string;
  aiResponse: string | null;
  createdAt: string;
}

interface StoredAssessment {
  id: string | number;
  selectedMuscles: string[];
  painPoints: any[];
  formData: {
    painLevel: number | null;
    goals: string;
    [key: string]: any;
  };
  analysis?: any;
  createdAt: string;
}

const entryTypeConfig = {
  pain: {
    icon: MessageSquare,
    label: "How I'm feeling",
    color: "bg-primary/10 text-primary border-primary/30",
    placeholder: "How are you feeling today? Any changes in your pain level or new symptoms?",
  },
  workout: {
    icon: Dumbbell,
    label: "Workout check",
    color: "bg-accent/10 text-accent border-accent/30",
    placeholder: "What activity or workout are you thinking about? Any concerns about whether it's safe?",
  },
  progression: {
    icon: TrendingUp,
    label: "Progress update",
    color: "bg-chart-5/10 text-chart-5 border-chart-5/30",
    placeholder: "What progress have you noticed? Any activities that are easier now?",
  },
  general: {
    icon: MessageSquare,
    label: "General note",
    color: "bg-secondary/30 text-secondary-foreground border-secondary",
    placeholder: "What's on your mind about your recovery?",
  },
};

const DIARY_STORAGE_KEY = 'diaryEntries';

function getDiaryEntries(assessmentId: string): DiaryEntry[] {
  try {
    const saved = localStorage.getItem(DIARY_STORAGE_KEY);
    if (!saved) return [];
    const all: DiaryEntry[] = JSON.parse(saved);
    return all.filter(e => e.assessmentId === assessmentId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

function saveDiaryEntry(entry: DiaryEntry): void {
  try {
    const saved = localStorage.getItem(DIARY_STORAGE_KEY);
    const all: DiaryEntry[] = saved ? JSON.parse(saved) : [];
    all.push(entry);
    localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save diary entry:', e);
  }
}

function deleteDiaryEntry(entryId: string): void {
  try {
    const saved = localStorage.getItem(DIARY_STORAGE_KEY);
    if (!saved) return;
    const all: DiaryEntry[] = JSON.parse(saved);
    const filtered = all.filter(e => e.id !== entryId);
    localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete diary entry:', e);
  }
}

function getAssessmentFromLocalStorage(id: string): StoredAssessment | null {
  try {
    const saved = localStorage.getItem('assessmentHistory');
    if (!saved) return null;
    const history: StoredAssessment[] = JSON.parse(saved);
    return history.find(a => String(a.id) === id) || null;
  } catch {
    return null;
  }
}

export default function DiaryPage() {
  const [, params] = useRoute("/diary/:assessmentId");
  const [, setLocation] = useLocation();
  const assessmentId = params?.assessmentId || null;

  const [assessment, setAssessment] = useState<StoredAssessment | null>(null);
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedType, setSelectedType] = useState<EntryType>("pain");
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [entryText, setEntryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingAI, setIsGettingAI] = useState(false);

  useEffect(() => {
    if (!assessmentId) {
      setIsLoading(false);
      return;
    }
    
    const foundAssessment = getAssessmentFromLocalStorage(assessmentId);
    setAssessment(foundAssessment);
    setEntries(getDiaryEntries(assessmentId));
    setIsLoading(false);
  }, [assessmentId]);

  const refreshEntries = () => {
    if (assessmentId) {
      setEntries(getDiaryEntries(assessmentId));
    }
  };

  const handleSubmit = async (requestAiFeedback: boolean) => {
    if (!assessmentId || !entryText.trim()) {
      toast({ title: "Please write something first", variant: "destructive" });
      return;
    }

    if (requestAiFeedback) {
      setIsGettingAI(true);
    } else {
      setIsSubmitting(true);
    }

    try {
      let aiResponse: string | null = null;

      if (requestAiFeedback && assessment) {
        try {
          const response = await fetch('/api/diary/ai-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entryType: selectedType,
              entryText: entryText.trim(),
              painLevel,
              assessment: {
                selectedMuscles: assessment.selectedMuscles,
                painLevel: assessment.formData?.painLevel,
                goals: assessment.formData?.goals,
                analysis: assessment.analysis,
              }
            }),
          });

          if (response.ok) {
            const data = await response.json();
            aiResponse = data.feedback;
          }
        } catch (e) {
          console.error('AI feedback failed:', e);
          toast({ title: "Couldn't get AI feedback, but entry will be saved", variant: "default" });
        }
      }

      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        assessmentId,
        entryType: selectedType,
        painLevel,
        entryText: entryText.trim(),
        aiResponse,
        createdAt: new Date().toISOString(),
      };

      saveDiaryEntry(newEntry);
      refreshEntries();
      setEntryText("");
      setPainLevel(null);
      toast({ title: aiResponse ? "Entry saved with AI feedback!" : "Entry saved successfully" });
    } finally {
      setIsSubmitting(false);
      setIsGettingAI(false);
    }
  };

  const handleDelete = (entryId: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteDiaryEntry(entryId);
      refreshEntries();
      toast({ title: "Entry deleted" });
    }
  };

  if (!assessmentId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Invalid assessment ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-diary" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-muted-foreground">Assessment not found in your browser storage.</p>
            <Button variant="outline" onClick={() => setLocation("/history")} data-testid="button-back-not-found">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const primaryBodyPart = assessment.selectedMuscles[0] || "Pain";
  const config = entryTypeConfig[selectedType];
  const Icon = config.icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/history")}
          className="mb-4"
          data-testid="button-back-to-history"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to History
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Recovery Diary: {primaryBodyPart}</h1>
        <p className="text-muted-foreground mt-2">
          Track your progress, get guidance, and manage your recovery
        </p>
      </div>

      <Card className="mb-8 border-2 border-primary/30">
        <CardHeader>
          <CardTitle>New Entry</CardTitle>
          <CardDescription>
            Journal about your pain, check if a workout is safe, or track your progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(entryTypeConfig) as EntryType[]).map((type) => {
              const TypeIcon = entryTypeConfig[type].icon;
              return (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                  data-testid={`button-entry-type-${type}`}
                >
                  <TypeIcon className="mr-2 h-4 w-4" />
                  {entryTypeConfig[type].label}
                </Button>
              );
            })}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Pain Level (Optional): {painLevel !== null ? `${painLevel}/10` : "Not set"}
            </label>
            <div className="flex items-center gap-4">
              <Slider
                value={painLevel !== null ? [painLevel] : [5]}
                onValueChange={(value) => setPainLevel(value[0])}
                max={10}
                min={1}
                step={1}
                className="flex-1"
                data-testid="slider-pain-level"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPainLevel(null)}
                data-testid="button-clear-pain"
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Textarea
              placeholder={config.placeholder}
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              className="min-h-[120px]"
              data-testid="input-entry-text"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || isGettingAI || !entryText.trim()}
              variant="outline"
              data-testid="button-save-entry"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Entry"
              )}
            </Button>
            <Button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting || isGettingAI || !entryText.trim()}
              data-testid="button-save-with-ai"
            >
              {isGettingAI ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting AI Feedback...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Save + Get AI Feedback
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Timeline</h2>
        {entries.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No entries yet. Start by creating your first entry above!
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => {
            const entryConfig = entryTypeConfig[entry.entryType];
            const EntryIcon = entryConfig.icon;
            const date = new Date(entry.createdAt);

            return (
              <Card key={entry.id} className="border-l-4 border-l-primary" data-testid={`card-entry-${entry.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={entryConfig.color}>
                        <EntryIcon className="mr-1 h-3 w-3" />
                        {entryConfig.label}
                      </Badge>
                      {entry.painLevel && (
                        <Badge variant="outline">Pain: {entry.painLevel}/10</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry.id)}
                        data-testid={`button-delete-entry-${entry.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-foreground whitespace-pre-wrap">
                    {entry.entryText}
                  </div>
                  {entry.aiResponse && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-primary">AI Feedback</p>
                      </div>
                      <p className="text-muted-foreground whitespace-pre-wrap">{entry.aiResponse}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
