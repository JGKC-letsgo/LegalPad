import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, analysisTable } from "@workspace/db";
import {
  GetAnalysisParams,
  UpsertAnalysisParams,
  UpsertAnalysisBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/matters/:id/analysis", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetAnalysisParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [analysis] = await db
    .select()
    .from(analysisTable)
    .where(eq(analysisTable.matterId, params.data.id));

  if (!analysis) {
    res.status(404).json({ error: "Analysis not found" });
    return;
  }

  res.json({
    ...analysis,
    createdAt: analysis.createdAt.toISOString(),
    updatedAt: analysis.updatedAt.toISOString(),
  });
});

router.put("/matters/:id/analysis", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpsertAnalysisParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpsertAnalysisBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const existing = await db
    .select()
    .from(analysisTable)
    .where(eq(analysisTable.matterId, params.data.id));

  let analysis;
  if (existing.length > 0) {
    const [updated] = await db
      .update(analysisTable)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(analysisTable.matterId, params.data.id))
      .returning();
    analysis = updated;
  } else {
    const [created] = await db.insert(analysisTable).values({
      matterId: params.data.id,
      ...parsed.data,
    }).returning();
    analysis = created;
  }

  res.json({
    ...analysis,
    createdAt: analysis.createdAt.toISOString(),
    updatedAt: analysis.updatedAt.toISOString(),
  });
});

export default router;
