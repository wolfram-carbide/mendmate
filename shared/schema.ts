import { z } from "zod";

export const painPointSchema = z.object({
  x: z.number(),
  y: z.number(),
  view: z.string(),
  size: z.number().optional(),
});

export const formDataSchema = z.object({
  painLevel: z.number().min(1).max(10),
  painTypes: z.array(z.string()),
  frequency: z.string(),
  duration: z.string(),
  causes: z.array(z.string()),
  story: z.string(),
  progress: z.string(),
  triggersAndRelief: z.string(),
  triedSoFar: z.string(),
  activities: z.array(z.string()),
  intensity: z.string(),
  goals: z.string(),
  concernLevel: z.number().min(1).max(10),
  concernReason: z.string(),
});

export const assessmentSchema = z.object({
  id: z.string().optional(),
  selectedMuscles: z.array(z.string()),
  painPoints: z.array(painPointSchema),
  formData: formDataSchema,
  analysis: z.any().optional(),
  createdAt: z.string().optional(),
});

export const insertAssessmentSchema = assessmentSchema.omit({ id: true, createdAt: true });

export type PainPoint = z.infer<typeof painPointSchema>;
export type FormData = z.infer<typeof formDataSchema>;
export type Assessment = z.infer<typeof assessmentSchema>;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
