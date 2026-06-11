import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, auditLogsTable } from "@workspace/db";
import { ListAuditLogParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/matters/:id/audit-log", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = ListAuditLogParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const entries = await db
    .select()
    .from(auditLogsTable)
    .where(eq(auditLogsTable.matterId, params.data.id))
    .orderBy(desc(auditLogsTable.createdAt));

  res.json(entries.map(e => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
  })));
});

export default router;
