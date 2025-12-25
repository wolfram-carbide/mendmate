import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

interface SavedAssessment {
  id: string;
  createdAt: string;
}

export default function Home() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for assessments
    const saved = localStorage.getItem('assessmentHistory');
    const assessments: SavedAssessment[] = saved ? JSON.parse(saved) : [];
    
    if (assessments && assessments.length > 0) {
      // If user has assessments, redirect to most recent one's diary (Recovery Companion)
      const mostRecent = assessments[0]; // Already sorted by date (newest first)
      setLocation(`/diary/${mostRecent.id}`);
    } else {
      // No assessments, redirect to assessment flow
      setLocation("/assessment");
    }
    
    setIsLoading(false);
  }, [setLocation]);

  // Show loading while we determine where to route
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" data-testid="loader-home" />
      </div>
    );
  }

  return null;
}
