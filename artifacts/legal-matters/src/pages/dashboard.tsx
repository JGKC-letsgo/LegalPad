import React from "react";
import { useGetDashboardSummary, useGetRecentMatters } from "@workspace/api-client-react";
import { Link } from "wouter";
import { FileText, Clock, ChevronRight, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { getDeadlineStatus, formatDeadlineDate } from "@/lib/deadline";

const STATUS_COLORS: Record<string, string> = {
  intake: "#7C5CBF",
  analysis: "#9b7dd4",
  review: "#c4b5f4",
  complete: "#4ade80",
};

const URGENCY_COLORS: Record<string, string> = {
  low: "#94a3b8",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#dc2626",
};

function DeadlineBadge({ deadline, responseDue }: { deadline?: string | null; responseDue?: string | null }) {
  const status = getDeadlineStatus(deadline, responseDue);
  if (status === "none" || status === "upcoming") return null;
  const cls = status === "overdue" ? "bg-red-100 text-red-700 border-red-200" : "bg-amber-100 text-amber-700 border-amber-200";
  const label =
    status === "overdue" ? "Overdue" :
    status === "due-soon" ? `Due ${formatDeadlineDate(deadline!)}` :
    "Response Due Soon";
  return <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${cls}`}>{label}</span>;
}

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: recent, isLoading: loadingRecent } = useGetRecentMatters();

  const pieData = summary?.byStatus?.map((s) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
    color: STATUS_COLORS[s.status] ?? "#94a3b8",
  })) ?? [];

  const barData = summary?.byUrgency?.map((u) => ({
    urgency: u.urgency.charAt(0).toUpperCase() + u.urgency.slice(1),
    count: u.count,
    fill: URGENCY_COLORS[u.urgency] ?? "#94a3b8",
  })) ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of active legal matters</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-xs uppercase tracking-wider">Total Matters</CardDescription>
            <CardTitle className="text-4xl font-serif">
              {loadingSummary ? <Skeleton className="h-10 w-16" /> : summary?.totalMatters ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-t-4 border-t-green-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-xs uppercase tracking-wider">Open</CardDescription>
            <CardTitle className="text-4xl font-serif">
              {loadingSummary ? <Skeleton className="h-10 w-16" /> : summary?.openMatters ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-t-4 border-t-orange-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-xs uppercase tracking-wider">High Urgency</CardDescription>
            <CardTitle className="text-4xl font-serif">
              {loadingSummary ? <Skeleton className="h-10 w-16" /> :
                (summary?.byUrgency?.find((u) => u.urgency === "high")?.count ?? 0) +
                (summary?.byUrgency?.find((u) => u.urgency === "critical")?.count ?? 0)}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-t-4 border-t-red-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-xs uppercase tracking-wider">Critical</CardDescription>
            <CardTitle className="text-4xl font-serif">
              {loadingSummary ? <Skeleton className="h-10 w-16" /> :
                summary?.byUrgency?.find((u) => u.urgency === "critical")?.count ?? 0}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-xs uppercase tracking-wider">Matters by Status</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-40 w-full" />
            ) : pieData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v, "Matters"]} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-xs uppercase tracking-wider">Matters by Urgency</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-40 w-full" />
            ) : barData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={barData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="urgency" tick={{ fontSize: 11 }} width={60} />
                  <Tooltip formatter={(v: number) => [v, "Matters"]} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recently updated + categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold">Recently Updated</h2>
            <Link
              href="/matters"
              className="text-sm font-medium text-primary hover:text-accent flex items-center transition-colors"
            >
              View all <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            {loadingRecent ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : recent?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No matters yet.</p>
                <Link href="/matters/new">
                  <span className="text-primary hover:underline text-sm cursor-pointer">Create your first matter</span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recent?.map((matter) => (
                  <Link
                    key={matter.id}
                    href={`/matters/${matter.id}`}
                    className="flex items-start p-5 hover:bg-muted/30 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-serif font-medium text-lg text-foreground truncate group-hover:text-primary transition-colors">
                          {matter.title}
                        </h3>
                        <DeadlineBadge deadline={matter.deadline} responseDue={matter.responseDue} />
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-4">
                        <span className="flex items-center">
                          <FileText className="h-3 w-3 mr-1.5" />
                          {matter.category.replace(/_/g, " ")}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1.5" />
                          {new Date(matter.updatedAt).toLocaleDateString()}
                        </span>
                        <span className="capitalize">{matter.status}</span>
                      </div>
                    </div>
                    {(matter.urgency === "critical" || matter.urgency === "high") && (
                      <Badge
                        variant="outline"
                        className={`ml-4 flex-shrink-0 text-[10px] uppercase tracking-wider ${
                          matter.urgency === "critical"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : "bg-orange-100 text-orange-700 border-orange-200"
                        }`}
                      >
                        {matter.urgency}
                      </Badge>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-serif font-semibold">By Category</h2>
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {loadingSummary ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : !summary?.byCategory?.length ? (
                <div className="p-6 text-center text-sm text-muted-foreground">No data yet</div>
              ) : (
                <div className="divide-y divide-border">
                  {summary.byCategory.map((c) => (
                    <div key={c.category} className="flex items-center justify-between px-4 py-3">
                      <span className="text-sm font-medium capitalize">{c.category.replace(/_/g, " ")}</span>
                      <Badge variant="secondary" className="font-mono">
                        {c.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
