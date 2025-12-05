import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssessmentSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { generatePdfBuffer } from "./pdfGenerator";
import Anthropic from "@anthropic-ai/sdk";

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
      intensity: z.number(),
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
    }),
    muscleLabels: z.array(z.string()).optional().default([]),
  });

  // Validation schema for AI analysis response
  const analysisResultSchema = z.object({
    summary: z.string(),
    urgency: z.enum(["low", "moderate", "high"]),
    urgencyMessage: z.string(),
    possibleConditions: z.array(z.object({
      name: z.string(),
      likelihood: z.string(),
      description: z.string(),
    })),
    avoid: z.array(z.string()),
    safeToTry: z.array(z.string()),
    timeline: z.string(),
    nextSteps: z.array(z.string()),
    experts: z.array(z.object({
      name: z.string(),
      focus: z.string(),
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

      const prompt = `You are a medical assessment AI assistant. Analyze this body pain assessment and provide structured recommendations.

PATIENT ASSESSMENT DATA:
- Affected Areas: ${muscleLabels?.join(', ') || 'Not specified'}
- Pain Level: ${formData.painLevel}/10
- Pain Types: ${formData.painTypes?.join(', ') || 'Not specified'}
- Frequency: ${formData.frequency || 'Not specified'}
- Duration: ${formData.duration || 'Not specified'}
- Pain Timing: ${formData.timing || 'Not specified'}
- Pain worsens with: ${formData.worsenFactors?.join(', ') || 'Not specified'}
- Pain improves with: ${formData.improveFactors?.join(', ') || 'Not specified'}
- Injury History: ${formData.injuryHistory || 'None reported'}
- Medical History: ${formData.medicalHistory || 'None reported'}
- Current Medications: ${formData.medications || 'None reported'}
- Activities Affected: ${formData.activitiesAffected?.join(', ') || 'Not specified'}
- Patient Goals: ${formData.goals || 'Not specified'}
- Concern Level: ${formData.concernLevel}/10
- Concern Reason: ${formData.concernReason || 'Not specified'}
- Number of pain points marked: ${painPoints?.length || 0}

Based on this assessment, provide a comprehensive analysis in the following JSON format. Be thorough, empathetic, and clinically accurate:

{
  "summary": "A 2-3 sentence personalized summary of the patient's condition, acknowledging their specific pain areas and patterns",
  "urgency": "low" | "moderate" | "high",
  "urgencyMessage": "A clear, reassuring message about the urgency level and recommended action",
  "possibleConditions": [
    {
      "name": "Condition name",
      "likelihood": "Likely" | "Possible" | "Consider",
      "description": "Brief clinical description of this condition and why it matches the symptoms"
    }
  ],
  "avoid": ["Activity or behavior to avoid", "..."],
  "safeToTry": ["Safe self-care activity", "..."],
  "timeline": "Expected recovery timeline based on the condition duration and severity",
  "nextSteps": ["Specific actionable step 1", "Step 2", "..."],
  "experts": [
    {
      "name": "Type of specialist",
      "focus": "What they specialize in",
      "why": "Why this specialist would help"
    }
  ]
}

Provide 2-4 possible conditions, 3-4 things to avoid, 4-5 safe activities, and 3-5 next steps. Only include experts array if pain level is 6 or higher. Respond ONLY with the JSON object, no additional text.`;

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
            urgencyMessage: rawAnalysis.urgencyMessage || "Please consult with a healthcare professional for guidance",
            possibleConditions: Array.isArray(rawAnalysis.possibleConditions) ? rawAnalysis.possibleConditions : [],
            avoid: Array.isArray(rawAnalysis.avoid) ? rawAnalysis.avoid : [],
            safeToTry: Array.isArray(rawAnalysis.safeToTry) ? rawAnalysis.safeToTry : [],
            timeline: rawAnalysis.timeline || "Consult a healthcare professional for timeline guidance",
            nextSteps: Array.isArray(rawAnalysis.nextSteps) ? rawAnalysis.nextSteps : [],
            experts: Array.isArray(rawAnalysis.experts) ? rawAnalysis.experts : [],
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
