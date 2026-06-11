import { db, auditLogsTable } from "@workspace/db";

export async function logAudit(
  matterId: number,
  action: string,
  description: string,
  changedBy?: string,
): Promise<void> {
  await db.insert(auditLogsTable).values({
    matterId,
    action,
    description,
    changedBy: changedBy ?? null,
  });
}
