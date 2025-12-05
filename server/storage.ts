import { 
  users, 
  assessments,
  type User, 
  type UpsertUser,
  type Assessment
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  getAllAssessments(): Promise<Assessment[]>;
  getAssessmentsByUser(userId: string): Promise<Assessment[]>;
  createAssessment(assessment: typeof assessments.$inferInsert): Promise<Assessment>;
  deleteAssessment(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getAssessment(id: number): Promise<Assessment | undefined> {
    const [assessment] = await db.select().from(assessments).where(eq(assessments.id, id));
    return assessment || undefined;
  }

  async getAllAssessments(): Promise<Assessment[]> {
    return await db.select().from(assessments).orderBy(desc(assessments.createdAt));
  }

  async getAssessmentsByUser(userId: string): Promise<Assessment[]> {
    return await db
      .select()
      .from(assessments)
      .where(eq(assessments.userId, userId))
      .orderBy(desc(assessments.createdAt));
  }

  async createAssessment(insertAssessment: typeof assessments.$inferInsert): Promise<Assessment> {
    const [assessment] = await db.insert(assessments).values(insertAssessment).returning();
    return assessment;
  }

  async deleteAssessment(id: number): Promise<boolean> {
    const result = await db.delete(assessments).where(eq(assessments.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
