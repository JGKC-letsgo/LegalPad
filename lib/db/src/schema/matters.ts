import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mattersTable = pgTable("matters", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  stakeholderName: text("stakeholder_name").notNull(),
  stakeholderDepartment: text("stakeholder_department").notNull(),
  urgency: text("urgency").notNull().default("medium"),
  category: text("category").notNull().default("general"),
  status: text("status").notNull().default("intake"),
  summary: text("summary"),
  dateReceived: text("date_received"),
  responseDue: text("response_due"),
  deadline: text("deadline"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMatterSchema = createInsertSchema(mattersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMatter = z.infer<typeof insertMatterSchema>;
export type Matter = typeof mattersTable.$inferSelect;

export const issuesTable = pgTable("issues", {
  id: serial("id").primaryKey(),
  matterId: integer("matter_id").notNull().references(() => mattersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  legalBasis: text("legal_basis"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertIssueSchema = createInsertSchema(issuesTable).omit({ id: true, createdAt: true });
export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Issue = typeof issuesTable.$inferSelect;

export const analysisTable = pgTable("analysis", {
  id: serial("id").primaryKey(),
  matterId: integer("matter_id").notNull().references(() => mattersTable.id, { onDelete: "cascade" }).unique(),
  background: text("background"),
  legalFramework: text("legal_framework"),
  criticalAnalysis: text("critical_analysis"),
  riskLevel: text("risk_level"),
  riskNotes: text("risk_notes"),
  selfAssessment: text("self_assessment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analysisTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type Analysis = typeof analysisTable.$inferSelect;

export const recommendationsTable = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  matterId: integer("matter_id").notNull().references(() => mattersTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  type: text("type").notNull().default("primary"),
  priority: integer("priority"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertRecommendationSchema = createInsertSchema(recommendationsTable).omit({ id: true, createdAt: true });
export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendationsTable.$inferSelect;

export const caveatsTable = pgTable("caveats", {
  id: serial("id").primaryKey(),
  matterId: integer("matter_id").notNull().references(() => mattersTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCaveatSchema = createInsertSchema(caveatsTable).omit({ id: true, createdAt: true });
export type InsertCaveat = z.infer<typeof insertCaveatSchema>;
export type Caveat = typeof caveatsTable.$inferSelect;

export const auditLogsTable = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  matterId: integer("matter_id").notNull().references(() => mattersTable.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  description: text("description").notNull(),
  changedBy: text("changed_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AuditLog = typeof auditLogsTable.$inferSelect;
