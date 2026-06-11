import React from "react";
import { useParams } from "wouter";

export default function MatterWorkspace() {
  const params = useParams();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-foreground">Workspace</h1>
      <p>Matter workspace implementation for ID: {params.id}</p>
    </div>
  );
}
