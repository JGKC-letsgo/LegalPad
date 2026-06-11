import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, mattersTable, issuesTable, analysisTable, recommendationsTable, caveatsTable } from "@workspace/db";
import {
  CreateMatterBody,
  UpdateMatterBody,
  UpdateMatterParams,
  GetMatterParams,
  DeleteMatterParams,
  ListMattersQueryParams,
} from "@workspace/api-zod";
import { logAudit } from "../lib/audit";

const router: IRouter = Router();

router.get("/matters/recent", async (req, res): Promise<void> => {
  const matters = await db
    .select()
    .from(mattersTable)
    .orderBy(desc(mattersTable.updatedAt))
    .limit(5);

  res.json(matters.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  })));
});

router.get("/matters", async (req, res): Promise<void> => {
  const query = ListMattersQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let dbQuery = db.select().from(mattersTable).$dynamic();

  if (query.data.status) {
    dbQuery = dbQuery.where(eq(mattersTable.status, query.data.status));
  }
  if (query.data.urgency) {
    dbQuery = dbQuery.where(eq(mattersTable.urgency, query.data.urgency));
  }
  if (query.data.category) {
    dbQuery = dbQuery.where(eq(mattersTable.category, query.data.category));
  }

  const matters = await dbQuery.orderBy(desc(mattersTable.updatedAt));

  res.json(matters.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  })));
});

router.post("/matters", async (req, res): Promise<void> => {
  const parsed = CreateMatterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [matter] = await db.insert(mattersTable).values({
    title: parsed.data.title,
    stakeholderName: parsed.data.stakeholderName,
    stakeholderDepartment: parsed.data.stakeholderDepartment,
    urgency: parsed.data.urgency,
    category: parsed.data.category,
    summary: parsed.data.summary ?? null,
    dateReceived: parsed.data.dateReceived ?? null,
    status: "intake",
  }).returning();

  await logAudit(matter.id, "matter_created", `Matter created: ${matter.title}`);

  res.status(201).json({
    ...matter,
    createdAt: matter.createdAt.toISOString(),
    updatedAt: matter.updatedAt.toISOString(),
  });
});

router.get("/matters/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetMatterParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [matter] = await db.select().from(mattersTable).where(eq(mattersTable.id, params.data.id));
  if (!matter) {
    res.status(404).json({ error: "Matter not found" });
    return;
  }

  const [issues, analysisRows, recommendations, caveats] = await Promise.all([
    db.select().from(issuesTable).where(eq(issuesTable.matterId, matter.id)).orderBy(issuesTable.sortOrder),
    db.select().from(analysisTable).where(eq(analysisTable.matterId, matter.id)),
    db.select().from(recommendationsTable).where(eq(recommendationsTable.matterId, matter.id)).orderBy(recommendationsTable.sortOrder),
    db.select().from(caveatsTable).where(eq(caveatsTable.matterId, matter.id)).orderBy(caveatsTable.sortOrder),
  ]);

  const analysis = analysisRows[0] ?? null;

  res.json({
    matter: {
      ...matter,
      createdAt: matter.createdAt.toISOString(),
      updatedAt: matter.updatedAt.toISOString(),
    },
    issues: issues.map(i => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
    })),
    analysis: analysis ? {
      ...analysis,
      createdAt: analysis.createdAt.toISOString(),
      updatedAt: analysis.updatedAt.toISOString(),
    } : null,
    recommendations: recommendations.map(r => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
    caveats: caveats.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  });
});

router.patch("/matters/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateMatterParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMatterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [matter] = await db
    .update(mattersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(mattersTable.id, params.data.id))
    .returning();

  if (!matter) {
    res.status(404).json({ error: "Matter not found" });
    return;
  }

  const changes = Object.keys(parsed.data).join(", ");
  await logAudit(matter.id, "matter_updated", `Updated: ${changes}`);

  res.json({
    ...matter,
    createdAt: matter.createdAt.toISOString(),
    updatedAt: matter.updatedAt.toISOString(),
  });
});

router.delete("/matters/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteMatterParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [matter] = await db
    .delete(mattersTable)
    .where(eq(mattersTable.id, params.data.id))
    .returning();

  if (!matter) {
    res.status(404).json({ error: "Matter not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
