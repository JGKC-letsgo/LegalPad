import React from "react";
import { Link } from "wouter";
import { Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Landmark className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground tracking-tight">Legalpad</h1>
        <p className="text-xl text-muted-foreground">Structured legal matter management for in-house counsel.</p>
        <div className="pt-8">
          <Link href="/sign-in" className="inline-block">
            <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg font-medium">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
