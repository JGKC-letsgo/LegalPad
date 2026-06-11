import React, { useState, useEffect } from "react";
import { Link } from "wouter";
import {
  useListMatters,
  useSearchMatters,
  getSearchMattersQueryKey,
} from "@workspace/api-client-react";
import { Briefcase, Clock, Plus, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getDeadlineStatus, formatDeadlineDate } from "@/lib/deadline";

const URGENCY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_COLORS: Record<string, string> = {
  intake: "bg-purple-100 text-purple-700 border-purple-200",
  analysis: "bg-blue-100 text-blue-700 border-blue-200",
  review: "bg-amber-100 text-amber-700 border-amber-200",
  complete: "bg-green-100 text-green-700 border-green-200",
};

function DeadlineBadge({
  deadline,
  responseDue,
}: {
  deadline?: string | null;
  responseDue?: string | null;
}) {
  const status = getDeadlineStatus(deadline, responseDue);
  if (status === "none") return null;

  if (status === "overdue")
    return (
      <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-red-100 text-red-700 border-red-200">
        Overdue
      </span>
    );
  if (status === "due-soon")
    return (
      <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-amber-100 text-amber-700 border-amber-200">
        Due {formatDeadlineDate(deadline!)}
      </span>
    );
  if (status === "response-due-soon")
    return (
      <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border bg-amber-100 text-amber-700 border-amber-200">
        Response Due Soon
      </span>
    );
  return null;
}

export default function MattersList() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [urgencyFilter, setUrgencyFilter] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const isSearching = debouncedQuery.trim().length > 0;

  const listParams = { status: statusFilter || undefined, urgency: urgencyFilter || undefined };
  const { data: matters, isLoading: loadingList } = useListMatters(listParams);

  const searchQuery = debouncedQuery || "_";
  const { data: searchResults, isLoading: loadingSearch } = useSearchMatters(
    { q: searchQuery },
    { query: { enabled: isSearching, queryKey: getSearchMattersQueryKey({ q: searchQuery }) } },
  );

  const displayMatters = isSearching ? searchResults : matters;
  const isLoading = isSearching ? loadingSearch : loadingList;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">All Matters</h1>
          <p className="text-muted-foreground mt-1">Your active legal matters</p>
        </div>
        <Link href="/matters/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Intake
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 pr-9"
            placeholder="Search matters by title, stakeholder, or keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setQuery("")}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!isSearching && (
          <div className="flex gap-2 flex-wrap">
            {["", "intake", "analysis", "review", "complete"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {s === "" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <div className="w-px bg-border mx-1 self-stretch" />
            {["", "low", "medium", "high", "critical"].map((u) => (
              <button
                key={u}
                onClick={() => setUrgencyFilter(u)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                  urgencyFilter === u
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
              >
                {u === "" ? "All urgency" : u.charAt(0).toUpperCase() + u.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {isSearching && !isLoading && (
        <p className="text-sm text-muted-foreground">
          {searchResults?.length ?? 0} result{searchResults?.length !== 1 ? "s" : ""} for &ldquo;
          {debouncedQuery}&rdquo;
        </p>
      )}

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : displayMatters?.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>{isSearching ? "No matters match your search." : "No matters yet."}</p>
            {!isSearching && (
              <Link href="/matters/new">
                <Button variant="outline" className="mt-4">
                  Create your first matter
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayMatters?.map((matter) => (
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
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <span>{matter.stakeholderName}</span>
                    <span className="text-border">·</span>
                    <span className="capitalize">{matter.category.replace(/_/g, " ")}</span>
                    <span className="text-border">·</span>
                    <span className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(matter.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5 ml-4 flex-shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase tracking-wider ${STATUS_COLORS[matter.status] ?? ""}`}
                  >
                    {matter.status}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] uppercase tracking-wider ${URGENCY_COLORS[matter.urgency] ?? ""}`}
                  >
                    {matter.urgency}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
