import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssessmentSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { generatePdfBuffer } from "./pdfGenerator";
import Anthropic from "@anthropic-ai/sdk";
import { buildAnalysisPrompt } from "./promptTemplates";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);

  app.get('/api/auth/user', async (req: any, res) => {
    if (!req.isAuthenticated() || !req.user?.claims?.sub) {
      return res.json(null);
    }
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  app.get("/api/assessments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const assessments = await storage.getAssessmentsByUser(userId);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assessments" });
    }
  });

  app.get("/api/assessments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid assessment ID" });
      }
      const assessment = await storage.getAssessment(id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      const userId = req.user.claims.sub;
      if (assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assessment" });
    }
  });

  app.post("/api/assessments", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment({
        ...validatedData,
        userId,
      });
      res.status(201).json(assessment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid assessment data", details: error.errors });
      }
      console.error("Failed to create assessment:", error);
      res.status(500).json({ error: "Failed to create assessment" });
    }
  });

  app.delete("/api/assessments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid assessment ID" });
      }
      const assessment = await storage.getAssessment(id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      const userId = req.user.claims.sub;
      if (assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const success = await storage.deleteAssessment(id);
      if (!success) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete assessment" });
    }
  });

  app.post("/api/assessments/:id/pdf", isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid assessment ID" });
      }
      const assessment = await storage.getAssessment(id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      const userId = req.user.claims.sub;
      if (assessment.userId !== userId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const pdfBuffer = await generatePdfBuffer({
        selectedMuscles: assessment.selectedMuscles as string[],
        painPoints: assessment.painPoints as any[],
        formData: assessment.formData as any,
        analysis: assessment.analysis as any,
        createdAt: assessment.createdAt,
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="pain-assessment-${id}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  app.post("/api/assessments/export-pdf", async (req: any, res) => {
    try {
      const { selectedMuscles, painPoints, formData, analysis } = req.body;
      
      if (!formData) {
        return res.status(400).json({ error: "Assessment data is required" });
      }

      const pdfBuffer = await generatePdfBuffer({
        selectedMuscles: selectedMuscles || [],
        painPoints: painPoints || [],
        formData,
        analysis,
        createdAt: new Date(),
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="pain-assessment.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  });

  // Validation schema for AI analysis request
  const analyzeRequestSchema = z.object({
    selectedMuscles: z.array(z.string()).min(1, "At least one muscle must be selected"),
    painPoints: z.array(z.object({
      x: z.number(),
      y: z.number(),
      size: z.number().optional(),
      view: z.string(),
    })).optional().default([]),
    formData: z.object({
      painLevel: z.number().min(1).max(10),
      painTypes: z.array(z.string()).optional().default([]),
      frequency: z.string().optional(),
      duration: z.string().optional(),
      timing: z.string().optional(),
      worsenFactors: z.array(z.string()).optional().default([]),
      improveFactors: z.array(z.string()).optional().default([]),
      injuryHistory: z.string().optional(),
      medicalHistory: z.string().optional(),
      medications: z.string().optional(),
      activitiesAffected: z.array(z.string()).optional().default([]),
      goals: z.string().optional(),
      concernLevel: z.number().min(1).max(10).optional().default(5),
      concernReason: z.string().optional(),
      story: z.string().optional(),
      triggersAndRelief: z.string().optional(),
      progress: z.string().optional(),
      triedSoFar: z.string().optional(),
    }),
    muscleLabels: z.array(z.string()).optional().default([]),
  });

  // Validation schema for AI analysis response - New 10-section structure
  const analysisResultSchema = z.object({
    summary: z.string(),
    urgency: z.enum(["low", "moderate", "high"]),
    understandingWhatsHappening: z.string(),
    reassurance: z.object({
      title: z.string(),
      message: z.string(),
    }),
    possibleConditions: z.array(z.object({
      name: z.string(),
      likelihood: z.string(),
      description: z.string(),
    })),
    watchFor: z.array(z.string()),
    recoveryPrinciples: z.array(z.string()),
    avoid: z.array(z.string()),
    safeToTry: z.array(z.string()),
    timeline: z.string(),
    resources: z.array(z.object({
      name: z.string(),
      type: z.string(),
      why: z.string(),
    })).optional().default([]),
  });

  // AI Analysis endpoint using Anthropic Claude
  app.post("/api/analyze", async (req, res) => {
    try {
      // Validate request body
      const validationResult = analyzeRequestSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid assessment data", 
          details: validationResult.error.errors 
        });
      }
      
      const { selectedMuscles, painPoints, formData, muscleLabels } = validationResult.data;

      // Initialize Anthropic client with Replit AI Integrations
      const anthropic = new Anthropic({
        apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
        baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
      });

      // Build the analysis prompt using the modular template system
      // Prompts and expert knowledge are documented in:
      // - server/promptTemplates.ts (prompt structure, empathy guidelines)
      // - server/expertKnowledge.ts (experts by body region, recovery principles)
      const prompt = buildAnalysisPrompt(
        muscleLabels || [],
        painPoints?.length || 0,
        formData
      );

      const message = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type !== "text") {
        throw new Error("Unexpected response type from AI");
      }

      // Parse the JSON response with robust extraction
      let analysis;
      try {
        const responseText = content.text.trim();
        
        // Try to extract JSON using regex to find the first complete JSON object
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON object found in response");
        }
        
        const rawAnalysis = JSON.parse(jsonMatch[0]);
        
        // Validate against schema
        const validatedAnalysis = analysisResultSchema.safeParse(rawAnalysis);
        if (!validatedAnalysis.success) {
          console.error("AI response validation failed:", validatedAnalysis.error.errors);
          // Try to salvage what we can with defaults
          analysis = {
            summary: rawAnalysis.summary || "Unable to generate complete analysis",
            urgency: ["low", "moderate", "high"].includes(rawAnalysis.urgency) ? rawAnalysis.urgency : "moderate",
            understandingWhatsHappening: rawAnalysis.understandingWhatsHappening || "Your body is responding to stress or strain in the affected area.",
            reassurance: rawAnalysis.reassurance || {
              title: "The Good News",
              message: "Most pain conditions respond well to proper care and attention."
            },
            possibleConditions: Array.isArray(rawAnalysis.possibleConditions) ? rawAnalysis.possibleConditions : [],
            watchFor: Array.isArray(rawAnalysis.watchFor) ? rawAnalysis.watchFor : [],
            recoveryPrinciples: Array.isArray(rawAnalysis.recoveryPrinciples) ? rawAnalysis.recoveryPrinciples : [],
            avoid: Array.isArray(rawAnalysis.avoid) ? rawAnalysis.avoid : [],
            safeToTry: Array.isArray(rawAnalysis.safeToTry) ? rawAnalysis.safeToTry : [],
            timeline: rawAnalysis.timeline || "Recovery timelines vary. Consult a healthcare professional for guidance.",
            resources: Array.isArray(rawAnalysis.resources) ? rawAnalysis.resources : [],
          };
        } else {
          analysis = validatedAnalysis.data;
        }
      } catch (parseError) {
        console.error("Failed to parse AI response:", content.text);
        throw new Error("Failed to parse AI analysis response");
      }

      res.json(analysis);
    } catch (error: any) {
      console.error("AI Analysis error:", error);
      
      // Differentiate between client and server errors
      if (error.status === 429) {
        return res.status(429).json({ 
          error: "Rate limit exceeded. Please try again in a moment.",
          retryable: true
        });
      }
      
      res.status(500).json({ 
        error: "Failed to generate AI analysis",
        message: error.message 
      });
    }
  });

  return httpServer;
}
