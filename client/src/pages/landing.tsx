import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Logo } from '@/components/Logo';
import { Activity, Shield, Clock, FileText, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Logo size={28} />
            <span className="font-semibold text-lg" data-testid="text-app-title">MendMate</span>
          </div>
          <a href="/api/login">
            <Button data-testid="button-login">
              Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </header>

      <main>
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6" data-testid="text-hero-title">
              Track and Understand Your Pain
            </h1>
            <p className="text-xl text-muted-foreground mb-8" data-testid="text-hero-description">
              Document pain locations on interactive body diagrams, track changes over time, 
              and gain insights to better communicate with healthcare providers.
            </p>
            <a href="/api/login">
              <Button size="lg" data-testid="button-get-started">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </a>
          </div>
        </section>

        <section className="py-16 px-4 bg-muted/50">
          <div className="container mx-auto">
            <h2 className="text-2xl font-semibold text-center mb-12" data-testid="text-features-title">
              Why Use MendMate?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6" data-testid="card-feature-diagrams">
                <Activity className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Interactive Diagrams</h3>
                <p className="text-sm text-muted-foreground">
                  Click and paint directly on anatomical body diagrams to precisely mark where you feel pain.
                </p>
              </Card>
              
              <Card className="p-6" data-testid="card-feature-tracking">
                <Clock className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Track Over Time</h3>
                <p className="text-sm text-muted-foreground">
                  Save assessments and compare them over time to see how your pain patterns change.
                </p>
              </Card>
              
              <Card className="p-6" data-testid="card-feature-reports">
                <FileText className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold mb-2">PDF Reports</h3>
                <p className="text-sm text-muted-foreground">
                  Generate professional reports to share with doctors and healthcare providers.
                </p>
              </Card>
              
              <Card className="p-6" data-testid="card-feature-security">
                <Shield className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold mb-2">Private & Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Your health data is encrypted and stored securely. Only you can access your assessments.
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="container mx-auto text-center max-w-2xl">
            <h2 className="text-2xl font-semibold mb-4" data-testid="text-cta-title">
              Ready to Start Tracking?
            </h2>
            <p className="text-muted-foreground mb-6">
              Create a free account to save your pain assessments, track changes over time, 
              and generate reports for your healthcare providers.
            </p>
            <a href="/api/login">
              <Button size="lg" data-testid="button-cta-signup">
                Create Free Account
              </Button>
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p data-testid="text-disclaimer">
            This tool is for informational purposes only and does not constitute medical advice.
            Always consult with qualified healthcare providers for diagnosis and treatment.
          </p>
        </div>
      </footer>
    </div>
  );
}
