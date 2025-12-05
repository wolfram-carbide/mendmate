import { type Assessment, type InsertAssessment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAssessment(id: string): Promise<Assessment | undefined>;
  getAllAssessments(): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  deleteAssessment(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private assessments: Map<string, Assessment>;

  constructor() {
    this.assessments = new Map();
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async getAllAssessments(): Promise<Assessment[]> {
    return Array.from(this.assessments.values()).sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const assessment: Assessment = { 
      ...insertAssessment, 
      id,
      createdAt: new Date().toISOString()
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async deleteAssessment(id: string): Promise<boolean> {
    return this.assessments.delete(id);
  }
}

export const storage = new MemStorage();
