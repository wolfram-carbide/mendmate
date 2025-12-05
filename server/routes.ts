import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssessmentSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

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

  return httpServer;
}
