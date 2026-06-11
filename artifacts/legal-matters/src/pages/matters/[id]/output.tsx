import React from "react";
import { useParams } from "wouter";

export default function MatterOutput() {
  const params = useParams();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-serif font-bold text-foreground">Output Memo</h1>
      <p>Memo implementation for ID: {params.id}</p>
    </div>
  );
}
