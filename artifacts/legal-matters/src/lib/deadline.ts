export type DeadlineStatus = "overdue" | "due-soon" | "response-due-soon" | "upcoming" | "none";

export function getDeadlineStatus(
  deadline?: string | null,
  responseDue?: string | null,
): DeadlineStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (deadline) {
    const d = new Date(deadline);
    d.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 0) return "overdue";
    if (daysUntil <= 7) return "due-soon";
  }

  if (responseDue) {
    const r = new Date(responseDue);
    r.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((r.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntil <= 3) return "response-due-soon";
  }

  if (deadline) return "upcoming";
  return "none";
}

export function formatDeadlineDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
