import React from "react";
import { useParams, Link } from "wouter";
import {
  useGetMatter,
  useGetAnalysis,
  useListRecommendations,
  useListCaveats,
  useListIssues,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, Printer, FileText } from "lucide-react";

export default function MatterOutput() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { toast } = useToast();

  const { data: detail, isLoading: loadingMatter } = useGetMatter(id);
  const { data: analysis, isLoading: loadingAnalysis } = useGetAnalysis(id);
  const { data: recommendations, isLoading: loadingRecs } = useListRecommendations(id);
  const { data: caveats, isLoading: loadingCaveats } = useListCaveats(id);
  const { data: issues, isLoading: loadingIssues } = useListIssues(id);

  const isLoading = loadingMatter || loadingAnalysis || loadingRecs || loadingCaveats || loadingIssues;
  const matter = detail?.matter;

  function buildEmailText(): string {
    if (!matter) return "";
    const primaryRecs = recommendations?.filter((r) => r.type === "primary") ?? [];
    const altRecs = recommendations?.filter((r) => r.type === "alternative") ?? [];

    const lines: string[] = [
      `Subject: Legal Assessment — ${matter.title}`,
      "",
      `Dear ${matter.stakeholderName},`,
      "",
      "Please find below my legal assessment of the matter raised by your team.",
      "",
      `MATTER: ${matter.title}`,
      `CATEGORY: ${matter.category.replace(/_/g, " ")}`,
      `URGENCY: ${matter.urgency}`,
      `DATE RECEIVED: ${matter.dateReceived ?? "N/A"}`,
      `RESPONSE DUE: ${matter.responseDue ?? "N/A"}`,
      `HARD DEADLINE: ${matter.deadline ?? "N/A"}`,
      "",
    ];

    if (issues?.length) {
      lines.push("ISSUES IDENTIFIED:");
      issues.forEach((issue, i) => {
        lines.push(`${i + 1}. ${issue.title}`);
        if (issue.description) lines.push(`   ${issue.description}`);
        if (issue.legalBasis) lines.push(`   Legal basis: ${issue.legalBasis}`);
      });
      lines.push("");
    }

    lines.push(
      "LEGAL ANALYSIS BACKGROUND:",
      analysis?.background ?? "Not provided",
      "",
      "CRITICAL ANALYSIS:",
      analysis?.criticalAnalysis ?? "Not provided",
      "",
      `RISK ASSESSMENT: ${analysis?.riskLevel?.toUpperCase() ?? "Not assessed"}`,
    );
    if (analysis?.riskNotes) lines.push(analysis.riskNotes);
    lines.push("");

    if (primaryRecs.length) {
      lines.push("RECOMMENDATIONS:");
      lines.push("Primary:");
      primaryRecs.forEach((r, i) => lines.push(`${i + 1}. ${r.content}`));
      lines.push("");
    }

    if (altRecs.length) {
      lines.push("Alternative (if any):");
      altRecs.forEach((r, i) => lines.push(`${i + 1}. ${r.content}`));
      lines.push("");
    }

    if (caveats?.length) {
      lines.push("CAVEATS:");
      caveats.forEach((c, i) => lines.push(`${i + 1}. ${c.content}`));
      lines.push("");
    }

    lines.push(
      "This advice is provided in my capacity as in-house counsel and is subject to legal professional privilege.",
      "",
      "Regards,",
      "Legal Team",
    );

    return lines.join("\n");
  }

  async function copyAsEmail() {
    const text = buildEmailText();
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", variant: "destructive" });
    }
  }

  const RISK_COLORS: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };

  const primaryRecs = recommendations?.filter((r) => r.type === "primary") ?? [];
  const altRecs = recommendations?.filter((r) => r.type === "alternative") ?? [];
  const conditionalRecs = recommendations?.filter((r) => r.type === "conditional") ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* print-only header */}
      <div className="hidden print:block mb-8 pb-4 border-b border-gray-300">
        <h1 className="text-2xl font-serif font-bold">Legalpad — Legal Matter Assessment</h1>
        <p className="text-sm text-gray-500 mt-1">Confidential — Legal Professional Privilege</p>
      </div>

      {/* screen header */}
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-3">
          <Link href={`/matters/${id}`} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Output Memo</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Formatted legal assessment</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyAsEmail} disabled={isLoading}>
            <Copy className="h-4 w-4 mr-2" />
            Copy as Email
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" />
            Print / PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : !matter ? (
        <div className="p-12 text-center text-muted-foreground">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>Matter not found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Cover */}
          <div className="bg-sidebar text-sidebar-foreground rounded-xl p-8 print:bg-white print:text-black print:border print:border-gray-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-sidebar-foreground/60 mb-2 print:text-gray-500">
                  Legal Matter Assessment
                </p>
                <h2 className="text-3xl font-serif font-bold">{matter.title}</h2>
                <p className="text-sidebar-foreground/70 mt-2 print:text-gray-600">
                  {matter.stakeholderName} · {matter.stakeholderDepartment}
                </p>
              </div>
              <div className="flex flex-col gap-2 items-end">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-sidebar-foreground/30 text-sidebar-foreground print:border-gray-400 print:text-black">
                  {matter.urgency}
                </Badge>
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-sidebar-foreground/30 text-sidebar-foreground print:border-gray-400 print:text-black">
                  {matter.status}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 text-sm border-t border-sidebar-foreground/10 pt-6 print:border-gray-300">
              <div>
                <p className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-1 print:text-gray-500">Category</p>
                <p className="capitalize">{matter.category.replace(/_/g, " ")}</p>
              </div>
              {matter.dateReceived && (
                <div>
                  <p className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-1 print:text-gray-500">Date Received</p>
                  <p>{matter.dateReceived}</p>
                </div>
              )}
              {matter.responseDue && (
                <div>
                  <p className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-1 print:text-gray-500">Response Due</p>
                  <p>{matter.responseDue}</p>
                </div>
              )}
              {matter.deadline && (
                <div>
                  <p className="text-sidebar-foreground/50 text-xs uppercase tracking-wider mb-1 print:text-gray-500">Hard Deadline</p>
                  <p>{matter.deadline}</p>
                </div>
              )}
            </div>
          </div>

          {/* Issues */}
          {issues && issues.length > 0 && (
            <Section title="Issues Identified">
              <ol className="space-y-3">
                {issues.map((issue, i) => (
                  <li key={issue.id} className="flex gap-3">
                    <span className="text-sm font-mono text-muted-foreground w-5 text-right flex-shrink-0 mt-0.5">{i + 1}.</span>
                    <div>
                      <p className="font-medium text-sm">{issue.title}</p>
                      {issue.description && <p className="text-sm text-muted-foreground mt-0.5">{issue.description}</p>}
                      {issue.legalBasis && <p className="text-xs text-primary/80 font-mono mt-0.5">{issue.legalBasis}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* Analysis */}
          {analysis && (
            <Section title="Legal Analysis">
              {analysis.background && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Background</p>
                  <p className="text-sm whitespace-pre-wrap">{analysis.background}</p>
                </div>
              )}
              {analysis.legalFramework && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Legal Framework</p>
                  <p className="text-sm whitespace-pre-wrap">{analysis.legalFramework}</p>
                </div>
              )}
              {analysis.criticalAnalysis && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Critical Analysis</p>
                  <p className="text-sm whitespace-pre-wrap">{analysis.criticalAnalysis}</p>
                </div>
              )}
              {analysis.riskLevel && (
                <div className="flex items-center gap-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Risk Assessment</p>
                  <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${RISK_COLORS[analysis.riskLevel] ?? ""}`}>
                    {analysis.riskLevel}
                  </Badge>
                  {analysis.riskNotes && <p className="text-sm text-muted-foreground">{analysis.riskNotes}</p>}
                </div>
              )}
            </Section>
          )}

          {/* Recommendations */}
          {recommendations && recommendations.length > 0 && (
            <Section title="Recommendations">
              {primaryRecs.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Primary</p>
                  <ol className="space-y-2">
                    {primaryRecs.map((r, i) => (
                      <li key={r.id} className="flex gap-3 text-sm">
                        <span className="font-mono text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}.</span>
                        <p>{r.content}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {altRecs.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Alternative</p>
                  <ol className="space-y-2">
                    {altRecs.map((r, i) => (
                      <li key={r.id} className="flex gap-3 text-sm">
                        <span className="font-mono text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}.</span>
                        <p>{r.content}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {conditionalRecs.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Conditional</p>
                  <ol className="space-y-2">
                    {conditionalRecs.map((r, i) => (
                      <li key={r.id} className="flex gap-3 text-sm">
                        <span className="font-mono text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}.</span>
                        <p>{r.content}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </Section>
          )}

          {/* Caveats */}
          {caveats && caveats.length > 0 && (
            <Section title="Caveats">
              <ol className="space-y-2">
                {caveats.map((c, i) => (
                  <li key={c.id} className="flex gap-3 text-sm">
                    <span className="font-mono text-muted-foreground w-5 text-right flex-shrink-0">{i + 1}.</span>
                    <p>{c.content}</p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* Footer */}
          <div className="border-t border-border pt-6 text-xs text-muted-foreground text-center">
            This advice is provided in the capacity of in-house counsel and is subject to legal professional privilege.
            Not for external distribution without prior approval.
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <h3 className="font-serif font-semibold text-lg mb-4 text-foreground border-b border-border pb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
