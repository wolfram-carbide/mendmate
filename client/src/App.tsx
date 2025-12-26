import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import BodyPainAssessment from "@/pages/body-pain-assessment";
import AssessmentHistory from "@/pages/assessment-history";
import ViewAssessment from "@/pages/view-assessment";
import DiaryPage from "@/pages/diary";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/assessment" component={BodyPainAssessment} />
      <Route path="/history" component={AssessmentHistory} />
      <Route path="/assessment-history">{() => <Redirect to="/history" />}</Route>
      <Route path="/view/:id" component={ViewAssessment} />
      <Route path="/diary/:assessmentId" component={DiaryPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
