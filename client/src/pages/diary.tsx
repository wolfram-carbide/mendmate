import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, MessageSquare, Dumbbell, TrendingUp, ArrowLeft, Trash2, Sparkles, X, Download, Upload, Frown, Meh, Smile, ThumbsUp, BookOpen, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type EntryType = "pain" | "workout" | "progression" | "general";
type SentimentLevel = 1 | 2 | 3 | 4 | 5 | null;

interface FollowUp {
  question: string;
  response: string;
  createdAt: string;
}

interface DiaryEntry {
  id: string;
  assessmentId: string;
  entryType: EntryType;
  painLevel: number | null;
  sentiment: SentimentLevel;
  entryText: string;
  aiResponse: string | null;
  followUp: FollowUp | null;
  createdAt: string;
}

const sentimentConfig = [
  { value: 1, label: "Frustrated", icon: Frown, color: "text-red-500 dark:text-red-400" },
  { value: 2, label: "Struggling", icon: Frown, color: "text-orange-500 dark:text-orange-400" },
  { value: 3, label: "Neutral", icon: Meh, color: "text-yellow-500 dark:text-yellow-400" },
  { value: 4, label: "Hopeful", icon: Smile, color: "text-green-500 dark:text-green-400" },
  { value: 5, label: "Confident", icon: ThumbsUp, color: "text-emerald-500 dark:text-emerald-400" },
] as const;

const expertSources = [
  {
    name: "Prof. Lorimer Moseley",
    expertise: "Pain Science & Neuroscience",
    description: "World-leading pain researcher. His work shows that understanding pain reduces it.",
    link: "https://www.tamethebeast.org/",
  },
  {
    name: "Dr. Stuart McGill",
    expertise: "Spine Biomechanics",
    description: "Professor emeritus, leading expert on spine health and injury prevention.",
    link: "https://www.backfitpro.com/",
  },
  {
    name: "Kelly Starrett",
    expertise: "Movement & Mobility",
    description: "Physical therapist and author of 'Becoming a Supple Leopard'.",
    link: "https://thereadystate.com/",
  },
];

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

interface Insight {
  title: string;
  description: string;
  category: "trend" | "correlation" | "progress" | "suggestion";
}

interface InsightsResponse {
  dateRange: string;
  entryCount: number;
  timeSpanDays: number;
  insights: Insight[];
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
  const [sentiment, setSentiment] = useState<SentimentLevel>(null);
  const [entryText, setEntryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGettingAI, setIsGettingAI] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [insights, setInsights] = useState<InsightsResponse | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [followUpText, setFollowUpText] = useState<Record<string, string>>({});
  const [isGettingFollowUp, setIsGettingFollowUp] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadEntries = () => {
    if (entries.length === 0) {
      toast({ title: "No entries to download", variant: "destructive" });
      return;
    }
    const dataStr = JSON.stringify(entries, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diary-entries-${assessmentId}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Entries downloaded successfully" });
  };

  const validateEntries = (data: unknown): data is DiaryEntry[] => {
    if (!Array.isArray(data)) return false;
    return data.every((item) => {
      return (
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        typeof item.assessmentId === "string" &&
        typeof item.entryType === "string" &&
        ["pain", "workout", "progression", "general"].includes(item.entryType) &&
        (item.painLevel === null || typeof item.painLevel === "number") &&
        typeof item.entryText === "string" &&
        (item.aiResponse === null || typeof item.aiResponse === "string") &&
        typeof item.createdAt === "string"
      );
    });
  };

  const handleUploadEntries = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        if (!validateEntries(parsed)) {
          toast({
            title: "Invalid file format",
            description: "The uploaded file doesn't match the expected diary entry format.",
            variant: "destructive"
          });
          return;
        }

        const saved = localStorage.getItem(DIARY_STORAGE_KEY);
        const existingEntries: DiaryEntry[] = saved ? JSON.parse(saved) : [];
        const existingIds = new Set(existingEntries.map(e => e.id));
        const newEntries = parsed.filter(e => !existingIds.has(e.id));

        if (newEntries.length === 0) {
          toast({ title: "No new entries to import", description: "All entries already exist." });
          return;
        }

        localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify([...existingEntries, ...newEntries]));
        refreshEntries();
        toast({ title: `Imported ${newEntries.length} entries successfully` });
      } catch {
        toast({
          title: "Failed to parse file",
          description: "Please upload a valid JSON file.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

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
              sentiment,
              recentEntries: entries.slice(0, 10),
              assessment: {
                selectedMuscles: assessment.selectedMuscles,
                painLevel: assessment.formData?.painLevel,
                goals: assessment.formData?.goals,
                analysis: assessment.analysis,
                createdAt: assessment.createdAt,
                ...assessment.formData,
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
        sentiment,
        entryText: entryText.trim(),
        aiResponse,
        followUp: null,
        createdAt: new Date().toISOString(),
      };

      saveDiaryEntry(newEntry);
      refreshEntries();
      setEntryText("");
      setPainLevel(null);
      setSentiment(null);
      toast({ title: aiResponse ? "Entry saved with AI feedback!" : "Entry saved successfully" });
    } finally {
      setIsSubmitting(false);
      setIsGettingAI(false);
    }
  };

  const handleDelete = (entryId: string) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      deleteDiaryEntry(entryId);
      // Clear any follow-up text for this entry
      setFollowUpText(prev => {
        const updated = { ...prev };
        delete updated[entryId];
        return updated;
      });
      refreshEntries();
      toast({ title: "Entry deleted" });
    }
  };

  const fetchInsights = async () => {
    if (!assessmentId || !assessment || entries.length === 0) return;

    setIsLoadingInsights(true);
    try {
      const response = await fetch('/api/diary/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: entries.slice(0, 15),
          assessment: {
            selectedMuscles: assessment.selectedMuscles,
            formData: assessment.formData,
            createdAt: assessment.createdAt,
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch insights");
      }

      const data = await response.json();
      setInsights(data);
      setShowInsights(true);
    } catch (error: any) {
      toast({
        title: "Failed to generate insights",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleFollowUp = async (entryId: string, entry: DiaryEntry) => {
    const question = followUpText[entryId]?.trim();
    if (!question || !assessment) return;

    setIsGettingFollowUp(entryId);
    try {
      const response = await fetch('/api/diary/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalEntry: {
            entryType: entry.entryType,
            entryText: entry.entryText,
            painLevel: entry.painLevel,
            sentiment: entry.sentiment,
          },
          followUpQuestion: question,
          recentEntries: entries.slice(0, 10),
          assessment: {
            selectedMuscles: assessment.selectedMuscles,
            painLevel: assessment.formData?.painLevel,
            goals: assessment.formData?.goals,
            analysis: assessment.analysis,
            createdAt: assessment.createdAt,
            ...assessment.formData,
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const followUp: FollowUp = {
          question,
          response: data.feedback,
          createdAt: new Date().toISOString(),
        };
        
        // Update entry in localStorage
        const saved = localStorage.getItem(DIARY_STORAGE_KEY);
        if (saved) {
          const all: DiaryEntry[] = JSON.parse(saved);
          const updated = all.map(e => e.id === entryId ? { ...e, followUp } : e);
          localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(updated));
          refreshEntries();
        }
        
        setFollowUpText(prev => ({ ...prev, [entryId]: '' }));
        toast({ title: "Follow-up answered!" });
      } else {
        throw new Error("Failed to get follow-up response");
      }
    } catch (error) {
      toast({ title: "Couldn't get follow-up response", variant: "destructive" });
    } finally {
      setIsGettingFollowUp(null);
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
        <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
          <Button
            variant="ghost"
            onClick={() => setLocation("/history")}
            data-testid="button-back-to-history"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".json"
              ref={fileInputRef}
              onChange={handleUploadEntries}
              className="hidden"
              data-testid="input-upload-entries"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              data-testid="button-upload-entries"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Entries
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadEntries}
              disabled={entries.length === 0}
              data-testid="button-download-entries"
            >
              <Download className="mr-2 h-4 w-4" />
              Download All
            </Button>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Recovery Diary: {primaryBodyPart}</h1>
        <p className="text-muted-foreground mt-2">
          Track your progress, get guidance, and manage your recovery
        </p>
      </div>

      {/* AI Insights Button */}
      <div className="mb-6">
        <Button
          onClick={fetchInsights}
          disabled={isLoadingInsights || entries.length === 0}
          variant="outline"
          className="w-full sm:w-auto border-primary/30"
          data-testid="button-get-insights"
        >
          {isLoadingInsights ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Insights...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Get AI Insights
            </>
          )}
        </Button>
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground mt-2">
            Add at least one diary entry to generate insights
          </p>
        )}
      </div>

      {/* AI Insights Display */}
      {showInsights && insights && (
        <Card className="mb-8 border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Insights: Your Recovery Journey
                </CardTitle>
                <CardDescription>
                  Analysis of {insights.entryCount} entries from {insights.dateRange} ({insights.timeSpanDays} days)
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowInsights(false)}
                data-testid="button-close-insights"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.insights.map((insight, index) => {
              const categoryColors = {
                trend: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
                correlation: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800",
                progress: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800",
                suggestion: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
              };

              return (
                <div key={index} className={`rounded-md border-l-4 p-4 ${categoryColors[insight.category]}`}>
                  <h3 className="font-semibold mb-2 flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={categoryColors[insight.category]}>
                      {insight.category}
                    </Badge>
                    {insight.title}
                  </h3>
                  <p className="text-sm">{insight.description}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* New Entry Card */}
      <Card className="mb-8 border-2 border-primary/20">
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
              How are you feeling about your recovery today? (Optional)
            </label>
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              {sentimentConfig.map((item) => {
                const SentIcon = item.icon;
                const isSelected = sentiment === item.value;
                return (
                  <Button
                    key={item.value}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSentiment(isSelected ? null : item.value as SentimentLevel)}
                    className={`flex-col h-auto py-2 px-3 ${isSelected ? '' : item.color}`}
                    data-testid={`button-sentiment-${item.value}`}
                  >
                    <SentIcon className={`h-5 w-5 ${isSelected ? '' : item.color}`} />
                    <span className="text-xs mt-1">{item.label}</span>
                  </Button>
                );
              })}
            </div>
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
            const entrySentiment = entry.sentiment ? sentimentConfig.find(s => s.value === entry.sentiment) : null;
            const hasFollowUp = !!entry.followUp;
            const canAskFollowUp = entry.aiResponse && !hasFollowUp;

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
                      {entrySentiment && (
                        <Badge variant="outline" className={entrySentiment.color}>
                          {(() => { const SIcon = entrySentiment.icon; return <SIcon className="mr-1 h-3 w-3" />; })()}
                          {entrySentiment.label}
                        </Badge>
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
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-primary">AI Feedback</p>
                      </div>
                      <p className="text-muted-foreground whitespace-pre-wrap">{entry.aiResponse}</p>
                      
                      {/* Follow-up display or input */}
                      {hasFollowUp && entry.followUp && (
                        <div className="border-t border-primary/20 pt-3 mt-3 space-y-2">
                          <p className="text-sm font-medium text-foreground">Your follow-up: {entry.followUp.question}</p>
                          <p className="text-muted-foreground whitespace-pre-wrap">{entry.followUp.response}</p>
                        </div>
                      )}
                      
                      {canAskFollowUp && (
                        <div className="border-t border-primary/20 pt-3 mt-3 space-y-2">
                          <p className="text-sm text-muted-foreground">Have a follow-up question? (1 per entry)</p>
                          <div className="flex gap-2">
                            <Textarea
                              placeholder="Ask a clarifying question..."
                              value={followUpText[entry.id] || ''}
                              onChange={(e) => setFollowUpText(prev => ({ ...prev, [entry.id]: e.target.value }))}
                              className="min-h-[60px] flex-1"
                              data-testid={`input-followup-${entry.id}`}
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleFollowUp(entry.id, entry)}
                            disabled={!followUpText[entry.id]?.trim() || isGettingFollowUp === entry.id}
                            data-testid={`button-followup-${entry.id}`}
                          >
                            {isGettingFollowUp === entry.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Getting response...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Ask Follow-up
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                      
                      {hasFollowUp && (
                        <p className="text-xs text-muted-foreground italic mt-2">
                          You've used your follow-up for this entry. Start a new entry to ask more questions.
                        </p>
                      )}
                      
                      {/* Expert Sources Accordion */}
                      <Accordion type="single" collapsible className="mt-3">
                        <AccordionItem value="sources" className="border-0">
                          <AccordionTrigger className="text-xs text-muted-foreground py-2 hover:no-underline">
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Sources & Expertise
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="text-xs text-muted-foreground space-y-2 pt-2">
                              <p>This assistant is trained on evidence-based approaches from:</p>
                              <ul className="space-y-2">
                                {expertSources.map((source) => (
                                  <li key={source.name} className="flex flex-col">
                                    <span className="font-medium text-foreground">{source.name}</span>
                                    <span className="text-muted-foreground">{source.expertise} - {source.description}</span>
                                    <a
                                      href={source.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline inline-flex items-center gap-1 mt-0.5"
                                    >
                                      Learn more <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
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
