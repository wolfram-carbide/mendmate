import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Brain, Heart, Sparkles, Zap } from 'lucide-react';

const healthFacts = [
  {
    icon: Brain,
    fact: "Your brain can rewire pain signals through consistent, gentle movement.",
  },
  {
    icon: Heart,
    fact: "Blood flow increases 50% to healing tissues during light activity.",
  },
  {
    icon: Activity,
    fact: "Most soft tissue injuries show significant improvement within 6-8 weeks.",
  },
  {
    icon: Zap,
    fact: "Pain doesn't always equal damage - it's your body's early warning system.",
  },
  {
    icon: Sparkles,
    fact: "Quality sleep can reduce pain sensitivity by up to 25%.",
  },
  {
    icon: Brain,
    fact: "Stress reduction techniques can lower pain perception significantly.",
  },
  {
    icon: Heart,
    fact: "Regular movement helps your body produce natural pain-relieving endorphins.",
  },
  {
    icon: Activity,
    fact: "Gradual loading helps tissues adapt and become stronger over time.",
  },
];

export function AnalysisLoader() {
  const [currentFactIndex, setCurrentFactIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const factInterval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % healthFacts.length);
    }, 4000);

    return () => clearInterval(factInterval);
  }, []);

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;
        return prev + Math.random() * 8;
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, []);

  const currentFact = healthFacts[currentFactIndex];
  const IconComponent = currentFact.icon;

  return (
    <div className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
      <div className="relative mb-8">
        <motion.div
          className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </motion.div>
          </motion.div>
        </motion.div>
        
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-primary/60"
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1,
          }}
        />
      </div>

      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          Analyzing Your Assessment
        </h3>
        <p className="text-sm text-muted-foreground">
          Our AI is reviewing your pain patterns and history
        </p>
      </div>

      <div className="w-full max-w-xs mb-8">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 95)}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          {progress < 30 && "Reviewing pain locations..."}
          {progress >= 30 && progress < 60 && "Analyzing symptoms..."}
          {progress >= 60 && progress < 85 && "Generating recommendations..."}
          {progress >= 85 && "Almost there..."}
        </p>
      </div>

      <div className="w-full max-w-sm">
        <div className="bg-muted/50 rounded-xl p-4 sm:p-5 border border-border/50">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3 text-center">
            Did You Know?
          </p>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentFactIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <IconComponent className="w-5 h-5 text-primary" />
              </div>
              <p className="text-sm text-foreground leading-relaxed">
                {currentFact.fact}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>
        
        <div className="flex justify-center gap-1.5 mt-4">
          {healthFacts.slice(0, 5).map((_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                i === currentFactIndex % 5 ? 'bg-primary' : 'bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
