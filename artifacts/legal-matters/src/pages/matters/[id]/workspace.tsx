import React, { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMatter,
  useUpdateMatter,
  useListIssues,
  useCreateIssue,
  useUpdateIssue,
  useDeleteIssue,
  useGetAnalysis,
  useUpsertAnalysis,
  useListRecommendations,
  useCreateRecommendation,
  useUpdateRecommendation,
  useDeleteRecommendation,
  useListCaveats,
  useCreateCaveat,
  useUpdateCaveat,
  useDeleteCaveat,
  useListAuditLog,
  getGetMatterQueryKey,
  getListIssuesQueryKey,
  getGetAnalysisQueryKey,
  getListRecommendationsQueryKey,
  getListCaveatsQueryKey,
  type Matter,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ExternalLink,
  Trash2,
  Plus,
  Pencil,
  Save,
  X,
  CheckCircle2,
  Clock,
  Activity,
} from "lucide-react";
import { getDeadlineStatus, formatDeadlineDate } from "@/lib/deadline";

const TABS = ["Intake", "Issues", "Analysis", "Recommendations", "Caveats", "Activity"] as const;
type Tab = (typeof TABS)[number];

const STATUS_OPTIONS = ["intake", "analysis", "review", "complete"] as const;
const URGENCY_OPTIONS = ["low", "medium", "high", "critical"] as const;
const CATEGORY_OPTIONS = [
  ["contract", "Contract"],
  ["compliance", "Compliance"],
  ["employment", "Employment"],
  ["intellectual_property", "Intellectual Property"],
  ["dispute", "Dispute"],
  ["regulatory", "Regulatory"],
  ["data_privacy", "Data Privacy"],
  ["corporate", "Corporate"],
  ["general", "General"],
] as const;
const RISK_OPTIONS = ["low", "medium", "high", "critical"] as const;

function DeadlineBadge({ deadline, responseDue }: { deadline?: string | null; responseDue?: string | null }) {
  const status = getDeadlineStatus(deadline, responseDue);
  if (status === "none" || status === "upcoming") return null;
  const cls = status === "overdue"
    ? "bg-red-100 text-red-700 border-red-200"
    : "bg-amber-100 text-amber-700 border-amber-200";
  const label =
    status === "overdue"
      ? `Overdue${deadline ? " · " + formatDeadlineDate(deadline) : ""}`
      : status === "due-soon"
      ? `Due ${formatDeadlineDate(deadline!)}`
      : "Response Due Soon";
  return (
    <span className={`inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${cls}`}>
      {label}
    </span>
  );
}

export default function MatterWorkspace() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("Intake");

  const { data: detail, isLoading } = useGetMatter(id);
  const matter = detail?.matter;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!matter) {
    return (
      <div className="p-12 text-center">
        <p className="text-muted-foreground">Matter not found.</p>
        <Link href="/matters"><Button variant="outline" className="mt-4">Back to matters</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Link href="/matters" className="text-muted-foreground hover:text-foreground mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-serif font-bold text-foreground">{matter.title}</h1>
              <DeadlineBadge deadline={matter.deadline} responseDue={matter.responseDue} />
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {matter.stakeholderName} · {matter.stakeholderDepartment}
            </p>
          </div>
        </div>
        <Link href={`/matters/${id}/output`}>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Output
          </Button>
        </Link>
      </div>

      <nav className="flex gap-1 border-b border-border overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <div>
        {tab === "Intake" && <IntakeTab matter={matter} id={id} qc={qc} toast={toast} />}
        {tab === "Issues" && <IssuesTab id={id} qc={qc} toast={toast} />}
        {tab === "Analysis" && <AnalysisTab id={id} qc={qc} toast={toast} />}
        {tab === "Recommendations" && <RecommendationsTab id={id} qc={qc} toast={toast} />}
        {tab === "Caveats" && <CaveatsTab id={id} qc={qc} toast={toast} />}
        {tab === "Activity" && <ActivityTab id={id} />}
      </div>
    </div>
  );
}

function IntakeTab({ matter, id, qc, toast }: { matter: Matter; id: number; qc: ReturnType<typeof useQueryClient>; toast: ReturnType<typeof useToast>["toast"] }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: matter.title,
    stakeholderName: matter.stakeholderName,
    stakeholderDepartment: matter.stakeholderDepartment,
    urgency: matter.urgency,
    category: matter.category,
    status: matter.status,
    summary: matter.summary ?? "",
    dateReceived: matter.dateReceived ?? "",
    responseDue: matter.responseDue ?? "",
    deadline: matter.deadline ?? "",
  });

  const update = useUpdateMatter();

  function save() {
    update.mutate(
      {
        id,
        data: {
          title: form.title,
          stakeholderName: form.stakeholderName,
          stakeholderDepartment: form.stakeholderDepartment,
          urgency: form.urgency as "low" | "medium" | "high" | "critical",
          category: form.category as "contract" | "compliance" | "employment" | "intellectual_property" | "dispute" | "regulatory" | "data_privacy" | "corporate" | "general",
          status: form.status as "intake" | "analysis" | "review" | "complete",
          ...(form.summary ? { summary: form.summary } : {}),
          ...(form.dateReceived ? { dateReceived: form.dateReceived } : {}),
          ...(form.responseDue ? { responseDue: form.responseDue } : {}),
          ...(form.deadline ? { deadline: form.deadline } : {}),
        },
      },
      {
        onSuccess: () => {
          qc.invalidateQueries({ queryKey: getGetMatterQueryKey(id) });
          toast({ title: "Saved" });
          setEditing(false);
        },
        onError: () => toast({ title: "Save failed", variant: "destructive" }),
      },
    );
  }

  const field = (key: keyof typeof form) => (val: string) => setForm((f) => ({ ...f, [key]: val }));

  const URGENCY_BADGE: Record<string, string> = { critical: "bg-red-100 text-red-700 border-red-200", high: "bg-orange-100 text-orange-700 border-orange-200", medium: "bg-yellow-100 text-yellow-700 border-yellow-200", low: "bg-slate-100 text-slate-600 border-slate-200" };

  if (!editing) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${URGENCY_BADGE[matter.urgency] ?? ""}`}>{matter.urgency}</Badge>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider capitalize">{matter.status}</Badge>
            <Badge variant="outline" className="text-[10px] capitalize">{matter.category.replace(/_/g, " ")}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-3.5 w-3.5 mr-2" />Edit
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
          <div><p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Stakeholder</p><p className="font-medium">{matter.stakeholderName}</p></div>
          <div><p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Department</p><p className="font-medium">{matter.stakeholderDepartment}</p></div>
          {matter.dateReceived && <div><p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Date Received</p><p>{matter.dateReceived}</p></div>}
          {matter.responseDue && <div><p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Response Due</p><p>{matter.responseDue}</p></div>}
          {matter.deadline && <div><p className="text-muted-foreground text-xs uppercase tracking-wider mb-0.5">Hard Deadline</p><p>{matter.deadline}</p></div>}
        </div>
        {matter.summary && (
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Summary</p>
            <p className="text-sm whitespace-pre-wrap">{matter.summary}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-5 shadow-sm">
      <div>
        <Label>Title</Label>
        <Input className="mt-1.5" value={form.title} onChange={(e) => field("title")(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Stakeholder Name</Label><Input className="mt-1.5" value={form.stakeholderName} onChange={(e) => field("stakeholderName")(e.target.value)} /></div>
        <div><Label>Department</Label><Input className="mt-1.5" value={form.stakeholderDepartment} onChange={(e) => field("stakeholderDepartment")(e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Status</Label>
          <Select value={form.status} onValueChange={field("status")}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Urgency</Label>
          <Select value={form.urgency} onValueChange={field("urgency")}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>{URGENCY_OPTIONS.map(u => <SelectItem key={u} value={u} className="capitalize">{u}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Category</Label>
          <Select value={form.category} onValueChange={field("category")}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORY_OPTIONS.map(([val, label]) => <SelectItem key={val} value={val}>{label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Summary</Label>
        <Textarea className="mt-1.5 resize-none" rows={3} value={form.summary} onChange={(e) => field("summary")(e.target.value)} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Date Received</Label><Input type="date" className="mt-1.5" value={form.dateReceived} onChange={(e) => field("dateReceived")(e.target.value)} /></div>
        <div><Label>Response Due</Label><Input type="date" className="mt-1.5" value={form.responseDue} onChange={(e) => field("responseDue")(e.target.value)} /></div>
        <div><Label>Hard Deadline</Label><Input type="date" className="mt-1.5" value={form.deadline} onChange={(e) => field("deadline")(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 pt-2">
        <Button onClick={save} disabled={update.isPending}><Save className="h-4 w-4 mr-2" />{update.isPending ? "Saving..." : "Save"}</Button>
        <Button variant="ghost" onClick={() => setEditing(false)}><X className="h-4 w-4 mr-2" />Cancel</Button>
      </div>
    </div>
  );
}

function IssuesTab({ id, qc, toast }: { id: number; qc: ReturnType<typeof useQueryClient>; toast: ReturnType<typeof useToast>["toast"] }) {
  const { data: issues, isLoading } = useListIssues(id);
  const create = useCreateIssue();
  const update = useUpdateIssue();
  const del = useDeleteIssue();
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", legalBasis: "" });

  function invalidate() { qc.invalidateQueries({ queryKey: getListIssuesQueryKey(id) }); }

  function addIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    create.mutate(
      { id, data: { title: newTitle.trim(), sortOrder: (issues?.length ?? 0) } },
      { onSuccess: () => { invalidate(); setNewTitle(""); toast({ title: "Issue added" }); }, onError: () => toast({ title: "Failed", variant: "destructive" }) },
    );
  }

  function startEdit(issue: { id: number; title: string; description?: string | null; legalBasis?: string | null }) {
    setEditingId(issue.id);
    setEditForm({ title: issue.title, description: issue.description ?? "", legalBasis: issue.legalBasis ?? "" });
  }

  function saveEdit(issueId: number) {
    update.mutate(
      { matterId: id, issueId, data: { title: editForm.title, description: editForm.description || undefined, legalBasis: editForm.legalBasis || undefined } },
      { onSuccess: () => { invalidate(); setEditingId(null); toast({ title: "Saved" }); }, onError: () => toast({ title: "Failed", variant: "destructive" }) },
    );
  }

  function deleteIssue(issueId: number) {
    del.mutate({ matterId: id, issueId }, { onSuccess: () => { invalidate(); toast({ title: "Deleted" }); } });
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : issues?.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">No issues identified yet.</div>
      ) : (
        <div className="space-y-3">
          {issues?.map((issue, idx) => (
            <div key={issue.id} className="bg-card border border-border rounded-lg p-4 shadow-sm">
              {editingId === issue.id ? (
                <div className="space-y-3">
                  <Input value={editForm.title} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} placeholder="Issue title" />
                  <Textarea className="resize-none" rows={2} value={editForm.description} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} placeholder="Description (optional)" />
                  <Input value={editForm.legalBasis} onChange={(e) => setEditForm(f => ({ ...f, legalBasis: e.target.value }))} placeholder="Legal basis (optional)" />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveEdit(issue.id)} disabled={update.isPending}><Save className="h-3.5 w-3.5 mr-1" />Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-3.5 w-3.5 mr-1" />Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono text-muted-foreground mt-0.5 w-5 text-right flex-shrink-0">{idx + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{issue.title}</p>
                    {issue.description && <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>}
                    {issue.legalBasis && <p className="text-xs text-primary/80 mt-1 font-mono">{issue.legalBasis}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => startEdit(issue)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteIssue(issue.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addIssue} className="flex gap-2">
        <Input
          placeholder="Add an issue..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={create.isPending || !newTitle.trim()}>
          <Plus className="h-4 w-4 mr-2" />Add
        </Button>
      </form>
    </div>
  );
}

function AnalysisTab({ id, qc, toast }: { id: number; qc: ReturnType<typeof useQueryClient>; toast: ReturnType<typeof useToast>["toast"] }) {
  const { data: analysis, isLoading } = useGetAnalysis(id);
  const upsert = useUpsertAnalysis();
  const [form, setForm] = useState({ background: "", legalFramework: "", criticalAnalysis: "", riskLevel: "", riskNotes: "", selfAssessment: "" });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (analysis) {
      setForm({
        background: analysis.background ?? "",
        legalFramework: analysis.legalFramework ?? "",
        criticalAnalysis: analysis.criticalAnalysis ?? "",
        riskLevel: analysis.riskLevel ?? "",
        riskNotes: analysis.riskNotes ?? "",
        selfAssessment: analysis.selfAssessment ?? "",
      });
    }
  }, [analysis]);

  const field = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setDirty(true);
  };

  function save() {
    upsert.mutate(
      {
        id,
        data: {
          background: form.background || undefined,
          legalFramework: form.legalFramework || undefined,
          criticalAnalysis: form.criticalAnalysis || undefined,
          riskLevel: form.riskLevel as "low" | "medium" | "high" | "critical" || undefined,
          riskNotes: form.riskNotes || undefined,
          selfAssessment: form.selfAssessment || undefined,
        },
      },
      {
        onSuccess: () => { qc.invalidateQueries({ queryKey: getGetAnalysisQueryKey(id) }); toast({ title: "Analysis saved" }); setDirty(false); },
        onError: () => toast({ title: "Save failed", variant: "destructive" }),
      },
    );
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  const RISK_COLORS: Record<string, string> = { critical: "text-red-600", high: "text-orange-600", medium: "text-yellow-600", low: "text-green-600" };

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-5 shadow-sm">
      <div>
        <Label>Background</Label>
        <Textarea className="mt-1.5 resize-none" rows={3} placeholder="Factual background of the matter..." value={form.background} onChange={field("background")} />
      </div>
      <div>
        <Label>Legal Framework</Label>
        <Textarea className="mt-1.5 resize-none" rows={3} placeholder="Relevant legislation, case law, regulations..." value={form.legalFramework} onChange={field("legalFramework")} />
      </div>
      <div>
        <Label>Critical Analysis</Label>
        <Textarea className="mt-1.5 resize-none" rows={5} placeholder="Your legal analysis of the issues..." value={form.criticalAnalysis} onChange={field("criticalAnalysis")} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Risk Level</Label>
          <Select value={form.riskLevel} onValueChange={(v) => { setForm(f => ({ ...f, riskLevel: v })); setDirty(true); }}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select risk level" />
            </SelectTrigger>
            <SelectContent>
              {RISK_OPTIONS.map(r => <SelectItem key={r} value={r}><span className={RISK_COLORS[r]}>{r.charAt(0).toUpperCase() + r.slice(1)}</span></SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Risk Notes</Label>
          <Input className="mt-1.5" placeholder="Brief risk commentary..." value={form.riskNotes} onChange={field("riskNotes")} />
        </div>
      </div>
      <div>
        <Label>Self-Assessment</Label>
        <Textarea className="mt-1.5 resize-none" rows={2} placeholder="Confidence, limitations, caveats on this analysis..." value={form.selfAssessment} onChange={field("selfAssessment")} />
      </div>
      <Button onClick={save} disabled={upsert.isPending || !dirty}>
        <Save className="h-4 w-4 mr-2" />{upsert.isPending ? "Saving..." : "Save Analysis"}
      </Button>
    </div>
  );
}

function RecommendationsTab({ id, qc, toast }: { id: number; qc: ReturnType<typeof useQueryClient>; toast: ReturnType<typeof useToast>["toast"] }) {
  const { data: recs, isLoading } = useListRecommendations(id);
  const create = useCreateRecommendation();
  const update = useUpdateRecommendation();
  const del = useDeleteRecommendation();
  const [form, setForm] = useState({ content: "", type: "primary" as string });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  function invalidate() { qc.invalidateQueries({ queryKey: getListRecommendationsQueryKey(id) }); }

  function addRec(e: React.FormEvent) {
    e.preventDefault();
    if (!form.content.trim()) return;
    create.mutate(
      { id, data: { content: form.content.trim(), type: form.type as "primary" | "alternative" | "conditional", sortOrder: recs?.length ?? 0 } },
      { onSuccess: () => { invalidate(); setForm({ content: "", type: "primary" }); toast({ title: "Recommendation added" }); }, onError: () => toast({ title: "Failed", variant: "destructive" }) },
    );
  }

  const TYPE_COLORS: Record<string, string> = { primary: "bg-purple-100 text-purple-700 border-purple-200", alternative: "bg-blue-100 text-blue-700 border-blue-200", conditional: "bg-amber-100 text-amber-700 border-amber-200" };

  return (
    <div className="space-y-4">
      {isLoading ? <Skeleton className="h-32 w-full" /> : recs?.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">No recommendations yet.</div>
      ) : (
        <div className="space-y-3">
          {recs?.map((rec, idx) => (
            <div key={rec.id} className="bg-card border border-border rounded-lg p-4 shadow-sm">
              {editingId === rec.id ? (
                <div className="space-y-2">
                  <Textarea className="resize-none" rows={2} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { update.mutate({ matterId: id, recId: rec.id, data: { content: editContent } }, { onSuccess: () => { invalidate(); setEditingId(null); } }); }}><Save className="h-3.5 w-3.5 mr-1" />Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-3.5 w-3.5 mr-1" />Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono text-muted-foreground mt-0.5 w-5 text-right flex-shrink-0">{idx + 1}.</span>
                  <div className="flex-1">
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider mb-2 ${TYPE_COLORS[rec.type] ?? ""}`}>{rec.type}</Badge>
                    <p className="text-sm">{rec.content}</p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(rec.id); setEditContent(rec.content); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => del.mutate({ matterId: id, recId: rec.id }, { onSuccess: invalidate })}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addRec} className="bg-card border border-border rounded-lg p-4 shadow-sm space-y-3">
        <Textarea className="resize-none" rows={2} placeholder="Recommendation..." value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} />
        <div className="flex gap-2 items-center">
          <Select value={form.type} onValueChange={(v) => setForm(f => ({ ...f, type: v }))}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary</SelectItem>
              <SelectItem value="alternative">Alternative</SelectItem>
              <SelectItem value="conditional">Conditional</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" size="sm" disabled={create.isPending || !form.content.trim()}><Plus className="h-4 w-4 mr-1" />Add</Button>
        </div>
      </form>
    </div>
  );
}

function CaveatsTab({ id, qc, toast }: { id: number; qc: ReturnType<typeof useQueryClient>; toast: ReturnType<typeof useToast>["toast"] }) {
  const { data: caveats, isLoading } = useListCaveats(id);
  const create = useCreateCaveat();
  const update = useUpdateCaveat();
  const del = useDeleteCaveat();
  const [newContent, setNewContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  function invalidate() { qc.invalidateQueries({ queryKey: getListCaveatsQueryKey(id) }); }

  function addCaveat(e: React.FormEvent) {
    e.preventDefault();
    if (!newContent.trim()) return;
    create.mutate(
      { id, data: { content: newContent.trim(), sortOrder: caveats?.length ?? 0 } },
      { onSuccess: () => { invalidate(); setNewContent(""); toast({ title: "Caveat added" }); }, onError: () => toast({ title: "Failed", variant: "destructive" }) },
    );
  }

  return (
    <div className="space-y-4">
      {isLoading ? <Skeleton className="h-32 w-full" /> : caveats?.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">No caveats yet.</div>
      ) : (
        <div className="space-y-3">
          {caveats?.map((caveat, idx) => (
            <div key={caveat.id} className="bg-card border border-border rounded-lg p-4 shadow-sm">
              {editingId === caveat.id ? (
                <div className="space-y-2">
                  <Textarea className="resize-none" rows={2} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { update.mutate({ matterId: id, caveatId: caveat.id, data: { content: editContent } }, { onSuccess: () => { invalidate(); setEditingId(null); } }); }}><Save className="h-3.5 w-3.5 mr-1" />Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}><X className="h-3.5 w-3.5 mr-1" />Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono text-muted-foreground mt-0.5 w-5 text-right flex-shrink-0">{idx + 1}.</span>
                  <p className="flex-1 text-sm">{caveat.content}</p>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingId(caveat.id); setEditContent(caveat.content); }}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => del.mutate({ matterId: id, caveatId: caveat.id }, { onSuccess: invalidate })}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <form onSubmit={addCaveat} className="flex gap-2">
        <Input className="flex-1" placeholder="Add a caveat..." value={newContent} onChange={(e) => setNewContent(e.target.value)} />
        <Button type="submit" disabled={create.isPending || !newContent.trim()}><Plus className="h-4 w-4 mr-2" />Add</Button>
      </form>
    </div>
  );
}

function ActivityTab({ id }: { id: number }) {
  const { data: entries, isLoading } = useListAuditLog(id);

  const ACTION_COLORS: Record<string, string> = {
    matter_created: "bg-purple-100 text-purple-700 border-purple-200",
    matter_updated: "bg-blue-100 text-blue-700 border-blue-200",
    analysis_updated: "bg-green-100 text-green-700 border-green-200",
  };

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-2">
      {!entries?.length ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground text-sm">No activity recorded yet.</div>
      ) : (
        <div className="relative pl-6 border-l border-border space-y-4 ml-3">
          {entries.map((entry) => (
            <div key={entry.id} className="relative">
              <div className="absolute -left-[25px] top-1.5 w-3 h-3 rounded-full border-2 border-background bg-primary/30" />
              <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <Badge variant="outline" className={`text-[10px] uppercase tracking-wider ${ACTION_COLORS[entry.action] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
                      {entry.action.replace(/_/g, " ")}
                    </Badge>
                    <p className="text-sm">{entry.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">{formatDate(entry.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
