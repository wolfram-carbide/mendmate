import {
  users,
  assessments,
  diaryEntries,
  type User,
  type UpsertUser,
  type Assessment,
  type DiaryEntry
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getAssessment(id: number): Promise<Assessment | undefined>;
  getAllAssessments(): Promise<Assessment[]>;
  getAssessmentsByUser(userId: string): Promise<Assessment[]>;
  createAssessment(assessment: typeof assessments.$inferInsert): Promise<Assessment>;
  deleteAssessment(id: number): Promise<boolean>;

  // Diary methods
  createDiaryEntry(entry: typeof diaryEntries.$inferInsert): Promise<DiaryEntry>;
  getDiaryEntry(id: number): Promise<DiaryEntry | undefined>;
  getDiaryEntriesByAssessment(assessmentId: number, userId: string): Promise<DiaryEntry[]>;
  getDiaryEntriesByUser(userId: string): Promise<DiaryEntry[]>;
  updateDiaryEntry(id: number, entryText: string): Promise<DiaryEntry>;
  deleteDiaryEntry(id: number): Promise<boolean>;
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

  // Diary methods implementation
  async createDiaryEntry(insertEntry: typeof diaryEntries.$inferInsert): Promise<DiaryEntry> {
    const [entry] = await db.insert(diaryEntries).values(insertEntry).returning();
    return entry;
  }

  async getDiaryEntry(id: number): Promise<DiaryEntry | undefined> {
    const [entry] = await db.select().from(diaryEntries).where(eq(diaryEntries.id, id));
    return entry || undefined;
  }

  async getDiaryEntriesByAssessment(assessmentId: number, userId: string): Promise<DiaryEntry[]> {
    return await db
      .select()
      .from(diaryEntries)
      .where(and(eq(diaryEntries.assessmentId, assessmentId), eq(diaryEntries.userId, userId)))
      .orderBy(desc(diaryEntries.createdAt));
  }

  async getDiaryEntriesByUser(userId: string): Promise<DiaryEntry[]> {
    return await db
      .select()
      .from(diaryEntries)
      .where(eq(diaryEntries.userId, userId))
      .orderBy(desc(diaryEntries.createdAt));
  }

  async updateDiaryEntry(id: number, entryText: string): Promise<DiaryEntry> {
    const [entry] = await db
      .update(diaryEntries)
      .set({ entryText, updatedAt: new Date() })
      .where(eq(diaryEntries.id, id))
      .returning();
    return entry;
  }

  async deleteDiaryEntry(id: number): Promise<boolean> {
    const result = await db.delete(diaryEntries).where(eq(diaryEntries.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
