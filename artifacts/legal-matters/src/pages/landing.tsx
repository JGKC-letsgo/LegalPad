import React from "react";
import { Link } from "wouter";
import {
  Landmark,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: FileText,
    title: "Structured matter workspaces",
    description:
      "Every matter gets its own workspace: facts, legal issues, advice, counterparty details, and internal notes — all in one place.",
  },
  {
    icon: Clock,
    title: "Deadline tracking",
    description:
      "Set court dates, response deadlines, and review dates. Get flagged when something is overdue or due soon.",
  },
  {
    icon: AlertTriangle,
    title: "Urgency & status at a glance",
    description:
      "Tag matters as critical, high, medium, or low priority. Track progress from intake through analysis, review, and completion.",
  },
  {
    icon: CheckCircle2,
    title: "Clean summaries on demand",
    description:
      "Generate a formatted output of any matter ready to paste into a memo, email, or management report.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <header className="w-full px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Landmark className="h-4 w-4 text-primary" />
          </div>
          <span className="font-serif font-bold text-lg text-foreground tracking-tight">Legalpad</span>
        </div>
        <Link href="/sign-in">
          <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm">
            Sign In
          </Button>
        </Link>
      </header>

      {/* Hero */}
      <section
        className="w-full"
        style={{ background: "linear-gradient(135deg, #1A1723 0%, #2d2440 60%, #1A1723 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-6"
            style={{ background: "rgba(124,92,191,0.2)", color: "#b89ff0", border: "1px solid rgba(124,92,191,0.3)" }}>
            Built for in-house legal teams
          </div>
          <h1 className="font-serif font-bold text-white tracking-tight mb-6"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.15 }}>
            Every legal matter,<br />
            <span style={{ color: "#b89ff0" }}>organised and tracked.</span>
          </h1>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{ color: "#a89fc0", lineHeight: 1.7 }}>
            Legalpad gives in-house lawyers a structured home for every matter —
            facts, issues, deadlines, and advice — so nothing slips through the cracks.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sign-up">
              <Button size="lg"
                className="px-8 py-6 text-base font-medium gap-2"
                style={{ background: "#7C5CBF", color: "white" }}>
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a
              href="/legalpad-video/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline"
                className="px-8 py-6 text-base font-medium gap-2"
                style={{ borderColor: "rgba(255,255,255,0.2)", color: "white", background: "rgba(255,255,255,0.05)" }}>
                <Play className="h-4 w-4" />
                Watch demo
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20 w-full">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-primary mb-12">
          What you get
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card border border-border rounded-xl p-6 space-y-3"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dark CTA strip */}
      <section
        className="w-full"
        style={{ background: "#1A1723" }}
      >
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="font-serif font-bold text-white text-3xl mb-4">
            Ready to bring order to your matters?
          </h2>
          <p className="mb-8" style={{ color: "#a89fc0" }}>
            Free to use. No credit card required.
          </p>
          <Link href="/sign-up">
            <Button size="lg"
              className="px-10 py-6 text-base font-medium"
              style={{ background: "#7C5CBF", color: "white" }}>
              Create your account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-border px-6 py-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Landmark className="h-3.5 w-3.5 text-primary" />
            <span className="font-serif font-semibold text-foreground">Legalpad</span>
          </div>
          <span>Built for in-house counsel</span>
        </div>
      </footer>
    </div>
  );
}
