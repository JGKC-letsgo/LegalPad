import { Router, type IRouter } from "express";
import { ilike, or, desc } from "drizzle-orm";
import { db, mattersTable } from "@workspace/db";
import { SearchMattersQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/matters/search", async (req, res): Promise<void> => {
  const parsed = SearchMattersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const q = `%${parsed.data.q}%`;

  const matters = await db
    .select()
    .from(mattersTable)
    .where(
      or(
        ilike(mattersTable.title, q),
        ilike(mattersTable.stakeholderName, q),
        ilike(mattersTable.stakeholderDepartment, q),
        ilike(mattersTable.summary, q),
      ),
    )
    .orderBy(desc(mattersTable.updatedAt))
    .limit(20);

  res.json(matters.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  })));
});

export default router;
