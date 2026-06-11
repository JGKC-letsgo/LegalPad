import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, issuesTable } from "@workspace/db";
import {
  CreateIssueParams,
  CreateIssueBody,
  UpdateIssueParams,
  UpdateIssueBody,
  DeleteIssueParams,
  ListIssuesParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/matters/:id/issues", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ListIssuesParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const issues = await db
    .select()
    .from(issuesTable)
    .where(eq(issuesTable.matterId, params.data.id))
    .orderBy(issuesTable.sortOrder);

  res.json(issues.map(i => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
  })));
});

router.post("/matters/:id/issues", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = CreateIssueParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateIssueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [issue] = await db.insert(issuesTable).values({
    matterId: params.data.id,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    legalBasis: parsed.data.legalBasis ?? null,
    sortOrder: parsed.data.sortOrder ?? 0,
  }).returning();

  res.status(201).json({
    ...issue,
    createdAt: issue.createdAt.toISOString(),
  });
});

router.patch("/matters/:matterId/issues/:issueId", async (req, res): Promise<void> => {
  const rawMatterId = Array.isArray(req.params.matterId) ? req.params.matterId[0] : req.params.matterId;
  const rawIssueId = Array.isArray(req.params.issueId) ? req.params.issueId[0] : req.params.issueId;
  const params = UpdateIssueParams.safeParse({ matterId: rawMatterId, issueId: rawIssueId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateIssueBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [issue] = await db
    .update(issuesTable)
    .set(parsed.data)
    .where(and(eq(issuesTable.id, params.data.issueId), eq(issuesTable.matterId, params.data.matterId)))
    .returning();

  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }

  res.json({
    ...issue,
    createdAt: issue.createdAt.toISOString(),
  });
});

router.delete("/matters/:matterId/issues/:issueId", async (req, res): Promise<void> => {
  const rawMatterId = Array.isArray(req.params.matterId) ? req.params.matterId[0] : req.params.matterId;
  const rawIssueId = Array.isArray(req.params.issueId) ? req.params.issueId[0] : req.params.issueId;
  const params = DeleteIssueParams.safeParse({ matterId: rawMatterId, issueId: rawIssueId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [issue] = await db
    .delete(issuesTable)
    .where(and(eq(issuesTable.id, params.data.issueId), eq(issuesTable.matterId, params.data.matterId)))
    .returning();

  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
