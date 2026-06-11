import React from "react";
import { useGetDashboardSummary, useGetRecentMatters } from "@workspace/api-client-react";
import { Link } from "wouter";
import { FileText, Clock, AlertTriangle, CheckCircle2, ChevronRight, Briefcase } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: recent, isLoading: loadingRecent } = useGetRecentMatters();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of active legal matters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-t-4 border-t-primary shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-xs uppercase tracking-wider">Total Active</CardDescription>
            <CardTitle className="text-4xl font-serif">{loadingSummary ? <Skeleton className="h-10 w-16" /> : summary?.openMatters || 0}</CardTitle>
          </CardHeader>
        </Card>
        
        <Card className="border-t-4 border-t-accent shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium text-xs uppercase tracking-wider">Critical Urgency</CardDescription>
            <CardTitle className="text-4xl font-serif">
              {loadingSummary ? <Skeleton className="h-10 w-16" /> : summary?.byUrgency?.find(u => u.urgency === 'critical')?.count || 0}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="border-t-4 border-t-blue-600 shadow-sm md:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardDescription className="font-medium text-xs uppercase tracking-wider">Matters by Status</CardDescription>
            </div>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-12 w-full mt-2" />
            ) : (
              <div className="flex gap-4 mt-2">
                {summary?.byStatus?.map(s => (
                  <div key={s.status} className="flex flex-col">
                    <span className="text-2xl font-serif font-medium">{s.count}</span>
                    <span className="text-xs text-muted-foreground capitalize">{s.status}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-semibold">Recently Updated</h2>
            <Link href="/matters" className="text-sm font-medium text-primary hover:text-accent flex items-center transition-colors">
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
                <p>No recent matters found.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recent?.map(matter => (
                  <Link key={matter.id} href={`/matters/${matter.id}`} className="flex items-start p-5 hover:bg-muted/30 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-serif font-medium text-lg text-foreground truncate group-hover:text-primary transition-colors">{matter.title}</h3>
                        {matter.urgency === 'critical' && <Badge variant="destructive" className="uppercase text-[10px] tracking-wider">Critical</Badge>}
                        {matter.urgency === 'high' && <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 uppercase text-[10px] tracking-wider dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800">High</Badge>}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground gap-4">
                        <span className="flex items-center"><FileText className="h-3 w-3 mr-1.5" /> {matter.category.replace('_', ' ')}</span>
                        <span className="flex items-center"><Clock className="h-3 w-3 mr-1.5" /> {new Date(matter.updatedAt).toLocaleDateString()}</span>
                        <span className="capitalize">{matter.status}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-serif font-semibold">Categories</h2>
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {loadingSummary ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {summary?.byCategory?.map(c => (
                    <div key={c.category} className="flex items-center justify-between p-4">
                      <span className="text-sm font-medium capitalize">{c.category.replace('_', ' ')}</span>
                      <Badge variant="secondary" className="font-mono">{c.count}</Badge>
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
