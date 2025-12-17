import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Dumbbell, TrendingUp, ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type EntryType = "pain" | "workout" | "progression" | "general";

interface DiaryEntry {
  id: number;
  userId: string;
  assessmentId: number;
  entryType: EntryType;
  painLevel: number | null;
  entryText: string;
  aiResponse: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface Assessment {
  id: number;
  selectedMuscles: string[];
  formData: {
    painLevel: number;
    goals: string;
  };
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

export default function DiaryPage() {
  const [, params] = useRoute("/diary/:assessmentId");
  const [, setLocation] = useLocation();
  const assessmentId = params?.assessmentId ? parseInt(params.assessmentId) : null;
  const queryClient = useQueryClient();

  const [selectedType, setSelectedType] = useState<EntryType>("pain");
  const [painLevel, setPainLevel] = useState<number | null>(null);
  const [entryText, setEntryText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch assessment details
  const { data: assessment, isLoading: assessmentLoading } = useQuery<Assessment>({
    queryKey: [`/api/assessments/${assessmentId}`],
    enabled: !!assessmentId,
  });

  // Fetch diary entries
  const { data: entries = [], isLoading: entriesLoading } = useQuery<DiaryEntry[]>({
    queryKey: [`/api/diary/entries?assessmentId=${assessmentId}`],
    enabled: !!assessmentId,
  });

  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (data: {
      assessmentId: number;
      entryType: EntryType;
      painLevel: number | null;
      entryText: string;
      requestAiFeedback: boolean;
    }) => {
      const response = await fetch("/api/diary/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create diary entry");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/diary/entries?assessmentId=${assessmentId}`] });
      setEntryText("");
      setPainLevel(null);
      toast({ title: "Entry saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save entry", variant: "destructive" });
    },
  });

  // Delete entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: number) => {
      const response = await fetch(`/api/diary/entries/${entryId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete entry");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/diary/entries?assessmentId=${assessmentId}`] });
      toast({ title: "Entry deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete entry", variant: "destructive" });
    },
  });

  const handleSubmit = async (requestAiFeedback: boolean) => {
    if (!assessmentId || !entryText.trim()) {
      toast({ title: "Please write something first", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await createEntryMutation.mutateAsync({
        assessmentId,
        entryType: selectedType,
        painLevel,
        entryText: entryText.trim(),
        requestAiFeedback,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entryId: number) => {
    if (confirm("Are you sure you want to delete this entry?")) {
      await deleteEntryMutation.mutateAsync(entryId);
    }
  };

  if (!assessmentId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Invalid assessment ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (assessmentLoading || entriesLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Assessment not found</p>
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
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/assessment-history")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Assessments
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Pain Diary: {primaryBodyPart}</h1>
        <p className="text-gray-600 mt-2">
          Track your progress, get guidance, and manage your recovery
        </p>
      </div>

      {/* New Entry Card */}
      <Card className="mb-8 border-2 border-primary/20">
        <CardHeader>
          <CardTitle>New Entry</CardTitle>
          <CardDescription>
            Journal about your pain, check if a workout is safe, or track your progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Entry Type Selector */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(entryTypeConfig) as EntryType[]).map((type) => {
              const TypeIcon = entryTypeConfig[type].icon;
              return (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                >
                  <TypeIcon className="mr-2 h-4 w-4" />
                  {entryTypeConfig[type].label}
                </Button>
              );
            })}
          </div>

          {/* Pain Level Slider (Optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
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
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPainLevel(null)}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Entry Text */}
          <div className="space-y-2">
            <Textarea
              placeholder={config.placeholder}
              value={entryText}
              onChange={(e) => setEntryText(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || !entryText.trim()}
              variant="outline"
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
              disabled={isSubmitting || !entryText.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting AI Feedback...
                </>
              ) : (
                "Save + Get AI Feedback"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Timeline</h2>
        {entries.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              No entries yet. Start by creating your first entry above!
            </CardContent>
          </Card>
        ) : (
          entries.map((entry) => {
            const entryConfig = entryTypeConfig[entry.entryType];
            const EntryIcon = entryConfig.icon;
            const date = new Date(entry.createdAt);

            return (
              <Card key={entry.id} className="border-l-4 border-primary">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={entryConfig.color}>
                        <EntryIcon className="mr-1 h-3 w-3" />
                        {entryConfig.label}
                      </Badge>
                      {entry.painLevel && (
                        <Badge variant="outline">Pain: {entry.painLevel}/10</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">
                        {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-gray-800 whitespace-pre-wrap">
                    {entry.entryText}
                  </div>
                  {entry.aiResponse && (
                    <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                      <p className="text-sm font-medium text-accent-foreground mb-2">AI Feedback:</p>
                      <p className="text-gray-700 whitespace-pre-wrap">{entry.aiResponse}</p>
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
