import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, recommendationsTable } from "@workspace/db";
import {
  ListRecommendationsParams,
  CreateRecommendationParams,
  CreateRecommendationBody,
  UpdateRecommendationParams,
  UpdateRecommendationBody,
  DeleteRecommendationParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/matters/:id/recommendations", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ListRecommendationsParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const recs = await db
    .select()
    .from(recommendationsTable)
    .where(eq(recommendationsTable.matterId, params.data.id))
    .orderBy(recommendationsTable.sortOrder);

  res.json(recs.map(r => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/matters/:id/recommendations", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CreateRecommendationParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateRecommendationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [rec] = await db.insert(recommendationsTable).values({
    matterId: params.data.id,
    content: parsed.data.content,
    type: parsed.data.type,
    priority: parsed.data.priority ?? null,
    sortOrder: parsed.data.sortOrder ?? 0,
  }).returning();

  res.status(201).json({
    ...rec,
    createdAt: rec.createdAt.toISOString(),
  });
});

router.patch("/matters/:matterId/recommendations/:recId", async (req, res): Promise<void> => {
  const rawMatterId = Array.isArray(req.params.matterId) ? req.params.matterId[0] : req.params.matterId;
  const rawRecId = Array.isArray(req.params.recId) ? req.params.recId[0] : req.params.recId;
  const params = UpdateRecommendationParams.safeParse({ matterId: rawMatterId, recId: rawRecId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateRecommendationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [rec] = await db
    .update(recommendationsTable)
    .set(parsed.data)
    .where(and(eq(recommendationsTable.id, params.data.recId), eq(recommendationsTable.matterId, params.data.matterId)))
    .returning();

  if (!rec) {
    res.status(404).json({ error: "Recommendation not found" });
    return;
  }

  res.json({
    ...rec,
    createdAt: rec.createdAt.toISOString(),
  });
});

router.delete("/matters/:matterId/recommendations/:recId", async (req, res): Promise<void> => {
  const rawMatterId = Array.isArray(req.params.matterId) ? req.params.matterId[0] : req.params.matterId;
  const rawRecId = Array.isArray(req.params.recId) ? req.params.recId[0] : req.params.recId;
  const params = DeleteRecommendationParams.safeParse({ matterId: rawMatterId, recId: rawRecId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [rec] = await db
    .delete(recommendationsTable)
    .where(and(eq(recommendationsTable.id, params.data.recId), eq(recommendationsTable.matterId, params.data.matterId)))
    .returning();

  if (!rec) {
    res.status(404).json({ error: "Recommendation not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
