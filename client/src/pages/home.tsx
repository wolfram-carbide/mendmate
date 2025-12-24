import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface Assessment {
  id: number;
  createdAt: string;
}

export default function Home() {
  const [, setLocation] = useLocation();

  // Fetch user's assessments from server
  const { data: assessments, isLoading } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
    retry: false,
  });

  useEffect(() => {
    if (isLoading) return;

    // If user has assessments, redirect to most recent one's diary (Recovery Companion)
    if (assessments && assessments.length > 0) {
      const mostRecent = assessments[0]; // Assuming they're sorted by date (newest first)
      setLocation(`/diary/${mostRecent.id}`);
    } else {
      // No assessments, redirect to assessment flow
      setLocation("/assessment");
    }
  }, [assessments, isLoading, setLocation]);

  // Show loading while we determine where to route
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
