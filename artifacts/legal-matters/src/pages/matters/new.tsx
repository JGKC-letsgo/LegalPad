import React, { useRef, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCreateMatter,
  useCreateIssue,
  getListMattersQueryKey,
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
import { useToast } from "@/hooks/use-toast";
import { Landmark, ChevronDown, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

type Template = {
  label: string;
  category: string;
  urgency: string;
  issues: string[];
};

const TEMPLATES: Template[] = [
  {
    label: "NDA Review",
    category: "contract",
    urgency: "medium",
    issues: ["Scope of Confidentiality", "Duration and Termination", "Permitted Disclosures"],
  },
  {
    label: "Employment Dispute",
    category: "employment",
    urgency: "high",
    issues: ["Grounds for Claim", "Evidence Assessment", "Tribunal Exposure"],
  },
  {
    label: "Regulatory Compliance Check",
    category: "regulatory",
    urgency: "medium",
    issues: ["Applicable Regulatory Framework", "Gap Analysis", "Remediation Steps"],
  },
  {
    label: "Data Breach Response",
    category: "data_privacy",
    urgency: "critical",
    issues: ["Scope of Breach", "Notification Obligations", "Regulatory Exposure"],
  },
];

export default function NewMatter() {
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const templateRef = useRef<Template | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const [form, setForm] = useState({
    title: "",
    stakeholderName: "",
    stakeholderDepartment: "",
    urgency: "medium" as string,
    category: "general" as string,
    summary: "",
    dateReceived: "",
    responseDue: "",
    deadline: "",
  });

  const createMatter = useCreateMatter();
  const createIssue = useCreateIssue();

  function applyTemplate(t: Template) {
    templateRef.current = t;
    setForm((f) => ({ ...f, category: t.category, urgency: t.urgency }));
    setShowTemplates(false);
    toast({ title: `Template applied: ${t.label}` });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      title: form.title,
      stakeholderName: form.stakeholderName,
      stakeholderDepartment: form.stakeholderDepartment,
      urgency: form.urgency as "low" | "medium" | "high" | "critical",
      category: form.category as
        | "contract"
        | "compliance"
        | "employment"
        | "intellectual_property"
        | "dispute"
        | "regulatory"
        | "data_privacy"
        | "corporate"
        | "general",
      ...(form.summary && { summary: form.summary }),
      ...(form.dateReceived && { dateReceived: form.dateReceived }),
      ...(form.responseDue && { responseDue: form.responseDue }),
      ...(form.deadline && { deadline: form.deadline }),
    };

    createMatter.mutate(
      { data },
      {
        onSuccess: async (matter) => {
          qc.invalidateQueries({ queryKey: getListMattersQueryKey() });
          const tmpl = templateRef.current;
          if (tmpl) {
            for (let i = 0; i < tmpl.issues.length; i++) {
              await createIssue.mutateAsync({
                id: matter.id,
                data: { title: tmpl.issues[i], sortOrder: i },
              });
            }
          }
          toast({ title: "Matter created", description: matter.title });
          navigate(`/matters/${matter.id}`);
        },
        onError: () => {
          toast({ title: "Failed to create matter", variant: "destructive" });
        },
      },
    );
  }

  const field = (key: keyof typeof form) => (val: string) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3">
        <Link href="/matters" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">New Intake</h1>
          <p className="text-muted-foreground mt-0.5">Capture a new legal matter request</p>
        </div>
      </div>

      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowTemplates((s) => !s)}
          className="flex items-center gap-2"
        >
          <Landmark className="h-4 w-4" />
          Use Template
          <ChevronDown className="h-3 w-3" />
        </Button>
        {showTemplates && (
          <div className="absolute z-10 mt-1 w-64 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            {TEMPLATES.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => applyTemplate(t)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors border-b border-border last:border-0"
              >
                <span className="font-medium">{t.label}</span>
                <span className="block text-xs text-muted-foreground mt-0.5 capitalize">
                  {t.category.replace(/_/g, " ")} · {t.urgency} urgency
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-5 shadow-sm">
        <div>
          <Label htmlFor="title">Matter Title *</Label>
          <Input
            id="title"
            className="mt-1.5"
            placeholder="e.g. NDA Review — Acme Corp Partnership"
            value={form.title}
            onChange={(e) => field("title")(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="stakeholderName">Stakeholder Name *</Label>
            <Input
              id="stakeholderName"
              className="mt-1.5"
              placeholder="e.g. Jane Smith"
              value={form.stakeholderName}
              onChange={(e) => field("stakeholderName")(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="stakeholderDepartment">Department *</Label>
            <Input
              id="stakeholderDepartment"
              className="mt-1.5"
              placeholder="e.g. Finance"
              value={form.stakeholderDepartment}
              onChange={(e) => field("stakeholderDepartment")(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={field("category")}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[
                  ["contract", "Contract"],
                  ["compliance", "Compliance"],
                  ["employment", "Employment"],
                  ["intellectual_property", "Intellectual Property"],
                  ["dispute", "Dispute"],
                  ["regulatory", "Regulatory"],
                  ["data_privacy", "Data Privacy"],
                  ["corporate", "Corporate"],
                  ["general", "General"],
                ].map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Urgency</Label>
            <Select value={form.urgency} onValueChange={field("urgency")}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="summary">Initial Summary</Label>
          <Textarea
            id="summary"
            className="mt-1.5 resize-none"
            rows={3}
            placeholder="Brief description of the matter..."
            value={form.summary}
            onChange={(e) => field("summary")(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="dateReceived">Date Received</Label>
            <Input
              id="dateReceived"
              type="date"
              className="mt-1.5"
              value={form.dateReceived}
              onChange={(e) => field("dateReceived")(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="responseDue">Response Due</Label>
            <Input
              id="responseDue"
              type="date"
              className="mt-1.5"
              value={form.responseDue}
              onChange={(e) => field("responseDue")(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="deadline">Hard Deadline</Label>
            <Input
              id="deadline"
              type="date"
              className="mt-1.5"
              value={form.deadline}
              onChange={(e) => field("deadline")(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <Button type="submit" disabled={createMatter.isPending || createIssue.isPending}>
            {createMatter.isPending ? "Creating..." : "Create Matter"}
          </Button>
          <Link href="/matters">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
