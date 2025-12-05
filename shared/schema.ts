import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  serial,
  integer,
} from "drizzle-orm/pg-core";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

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

export type PainPoint = z.infer<typeof painPointSchema>;
export type FormData = z.infer<typeof formDataSchema>;

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id),
  selectedMuscles: jsonb("selected_muscles").$type<string[]>().notNull(),
  painPoints: jsonb("pain_points").$type<PainPoint[]>().notNull(),
  formData: jsonb("form_data").$type<FormData>().notNull(),
  analysis: jsonb("analysis"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  assessments: many(assessments),
}));

export const assessmentsRelations = relations(assessments, ({ one }) => ({
  user: one(users, {
    fields: [assessments.userId],
    references: [users.id],
  }),
}));

export const insertAssessmentSchema = z.object({
  userId: z.string().nullable().optional(),
  selectedMuscles: z.array(z.string()),
  painPoints: z.array(painPointSchema),
  formData: formDataSchema,
  analysis: z.any().optional(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Assessment = typeof assessments.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
