import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, caveatsTable } from "@workspace/db";
import {
  ListCaveatsParams,
  CreateCaveatParams,
  CreateCaveatBody,
  UpdateCaveatParams,
  UpdateCaveatBody,
  DeleteCaveatParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/matters/:id/caveats", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ListCaveatsParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const caveats = await db
    .select()
    .from(caveatsTable)
    .where(eq(caveatsTable.matterId, params.data.id))
    .orderBy(caveatsTable.sortOrder);

  res.json(caveats.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  })));
});

router.post("/matters/:id/caveats", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CreateCaveatParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateCaveatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [caveat] = await db.insert(caveatsTable).values({
    matterId: params.data.id,
    content: parsed.data.content,
    sortOrder: parsed.data.sortOrder ?? 0,
  }).returning();

  res.status(201).json({
    ...caveat,
    createdAt: caveat.createdAt.toISOString(),
  });
});

router.patch("/matters/:matterId/caveats/:caveatId", async (req, res): Promise<void> => {
  const rawMatterId = Array.isArray(req.params.matterId) ? req.params.matterId[0] : req.params.matterId;
  const rawCaveatId = Array.isArray(req.params.caveatId) ? req.params.caveatId[0] : req.params.caveatId;
  const params = UpdateCaveatParams.safeParse({ matterId: rawMatterId, caveatId: rawCaveatId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCaveatBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [caveat] = await db
    .update(caveatsTable)
    .set(parsed.data)
    .where(and(eq(caveatsTable.id, params.data.caveatId), eq(caveatsTable.matterId, params.data.matterId)))
    .returning();

  if (!caveat) {
    res.status(404).json({ error: "Caveat not found" });
    return;
  }

  res.json({
    ...caveat,
    createdAt: caveat.createdAt.toISOString(),
  });
});

router.delete("/matters/:matterId/caveats/:caveatId", async (req, res): Promise<void> => {
  const rawMatterId = Array.isArray(req.params.matterId) ? req.params.matterId[0] : req.params.matterId;
  const rawCaveatId = Array.isArray(req.params.caveatId) ? req.params.caveatId[0] : req.params.caveatId;
  const params = DeleteCaveatParams.safeParse({ matterId: rawMatterId, caveatId: rawCaveatId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [caveat] = await db
    .delete(caveatsTable)
    .where(and(eq(caveatsTable.id, params.data.caveatId), eq(caveatsTable.matterId, params.data.matterId)))
    .returning();

  if (!caveat) {
    res.status(404).json({ error: "Caveat not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
