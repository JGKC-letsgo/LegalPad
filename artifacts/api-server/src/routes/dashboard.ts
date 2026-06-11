import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, mattersTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const [totalRow, byStatusRows, byUrgencyRows, byCategoryRows, openRow] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(mattersTable),
    db.select({
      status: mattersTable.status,
      count: sql<number>`count(*)::int`,
    }).from(mattersTable).groupBy(mattersTable.status),
    db.select({
      urgency: mattersTable.urgency,
      count: sql<number>`count(*)::int`,
    }).from(mattersTable).groupBy(mattersTable.urgency),
    db.select({
      category: mattersTable.category,
      count: sql<number>`count(*)::int`,
    }).from(mattersTable).groupBy(mattersTable.category),
    db.select({ count: sql<number>`count(*)::int` }).from(mattersTable)
      .where(sql`status != 'complete'`),
  ]);

  res.json({
    totalMatters: totalRow[0]?.count ?? 0,
    byStatus: byStatusRows,
    byUrgency: byUrgencyRows,
    byCategory: byCategoryRows,
    openMatters: openRow[0]?.count ?? 0,
  });
});

export default router;
