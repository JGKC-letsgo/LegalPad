import { Resend } from "resend";
import cron from "node-cron";
import { db, mattersTable } from "@workspace/db";
import { and, isNotNull, lte, or, isNull, lt, sql } from "drizzle-orm";
import { logger } from "./logger";

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not set");
  return new Resend(apiKey);
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function buildEmailHtml(matter: {
  title: string;
  stakeholderName: string;
  stakeholderDepartment: string;
  urgency: string;
  category: string;
  responseDue: string | null;
  deadline: string | null;
}): string {
  const urgencyColor: Record<string, string> = {
    critical: "#dc2626",
    high: "#f97316",
    medium: "#f59e0b",
    low: "#94a3b8",
  };

  const deadlineRows: string[] = [];

  if (matter.deadline) {
    const days = daysUntil(matter.deadline);
    const color = days <= 0 ? "#dc2626" : days <= 3 ? "#f97316" : "#f59e0b";
    deadlineRows.push(`
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Hard Deadline</td>
        <td style="padding:8px 0;font-size:13px;font-weight:600;color:${color};">
          ${formatDate(matter.deadline)}
          ${days <= 0 ? " — OVERDUE" : ` — ${days} day${days === 1 ? "" : "s"} remaining`}
        </td>
      </tr>`);
  }

  if (matter.responseDue) {
    const days = daysUntil(matter.responseDue);
    const color = days <= 0 ? "#dc2626" : days <= 3 ? "#f97316" : "#6b7280";
    deadlineRows.push(`
      <tr>
        <td style="padding:8px 0;color:#6b7280;font-size:13px;">Response Due</td>
        <td style="padding:8px 0;font-size:13px;color:${color};">
          ${formatDate(matter.responseDue)}
          ${days <= 0 ? " — OVERDUE" : days <= 3 ? ` — ${days} day${days === 1 ? "" : "s"} remaining` : ""}
        </td>
      </tr>`);
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f5f3ff;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.07);">

          <!-- Header -->
          <tr>
            <td style="background:#1A1723;padding:24px 32px;text-align:left;">
              <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">Legalpad</span>
              <span style="font-size:12px;color:#9b7dd4;margin-left:12px;text-transform:uppercase;letter-spacing:1px;">Deadline Reminder</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 4px;font-size:20px;color:#1A1723;">${matter.title}</h2>
              <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">${matter.stakeholderName} · ${matter.stakeholderDepartment}</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e1f0;margin-bottom:24px;">
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:13px;">Category</td>
                  <td style="padding:8px 0;font-size:13px;text-transform:capitalize;">${matter.category.replace(/_/g, " ")}</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#6b7280;font-size:13px;">Urgency</td>
                  <td style="padding:8px 0;font-size:13px;font-weight:600;color:${urgencyColor[matter.urgency] ?? "#6b7280"};text-transform:capitalize;">${matter.urgency}</td>
                </tr>
                ${deadlineRows.join("\n")}
              </table>

              <a href="${process.env.APP_URL ?? "https://your-app.replit.app"}/matters"
                 style="display:inline-block;background:#7C5CBF;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:14px;font-weight:600;">
                Open in Legalpad
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;background:#f9f8ff;border-top:1px solid #e5e1f0;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                This is an automated reminder from Legalpad. The matter above has a deadline approaching.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendDeadlineReminders(): Promise<void> {
  const toEmail = process.env.REMINDER_EMAIL;
  if (!toEmail) {
    logger.warn("REMINDER_EMAIL not set — skipping deadline reminders");
    return;
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    logger.warn("RESEND_API_KEY not set — skipping deadline reminders");
    return;
  }

  const resend = getResendClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Remind 3 days out and 1 day out. Don't re-remind within 20 hours.
  const threeDaysOut = addDays(today, 3).toISOString().slice(0, 10);
  const oneDayOut = addDays(today, 1).toISOString().slice(0, 10);
  const reminderCutoff = new Date(Date.now() - 20 * 60 * 60 * 1000);

  const matters = await db
    .select()
    .from(mattersTable)
    .where(
      and(
        // Not already completed
        sql`${mattersTable.status} != 'complete'`,
        // Has at least one deadline
        or(isNotNull(mattersTable.deadline), isNotNull(mattersTable.responseDue)),
        // Not reminded recently
        or(
          isNull(mattersTable.lastRemindedAt),
          lt(mattersTable.lastRemindedAt, reminderCutoff),
        ),
        // Has a deadline that is today, tomorrow, or within 3 days (or overdue)
        or(
          and(isNotNull(mattersTable.deadline), lte(mattersTable.deadline, threeDaysOut)),
          and(isNotNull(mattersTable.responseDue), lte(mattersTable.responseDue, oneDayOut)),
        ),
      ),
    );

  if (!matters.length) {
    logger.info("Deadline reminders: no matters need reminding");
    return;
  }

  logger.info({ count: matters.length }, "Sending deadline reminders");

  for (const matter of matters) {
    try {
      await resend.emails.send({
        from: "Legalpad <reminders@legalpad.app>",
        to: toEmail,
        subject: `Deadline reminder: ${matter.title}`,
        html: buildEmailHtml(matter),
      });

      await db
        .update(mattersTable)
        .set({ lastRemindedAt: new Date() })
        .where(sql`${mattersTable.id} = ${matter.id}`);

      logger.info({ matterId: matter.id, title: matter.title }, "Reminder sent");
    } catch (err) {
      logger.error({ err, matterId: matter.id }, "Failed to send reminder");
    }
  }
}

export function startDeadlineReminderCron(): void {
  // Run every day at 8:00 AM server time
  cron.schedule("0 8 * * *", () => {
    logger.info("Running scheduled deadline reminder check");
    sendDeadlineReminders().catch((err) => {
      logger.error({ err }, "Deadline reminder job failed");
    });
  });

  logger.info("Deadline reminder cron job scheduled (daily at 08:00)");
}
