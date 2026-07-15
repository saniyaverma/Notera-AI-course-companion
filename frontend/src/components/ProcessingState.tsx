"use client";

import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function ProcessingState({
  status,
  error,
  onRetry,
}: {
  status: "pending" | "processing" | "failed";
  error?: string | null;
  onRetry: () => void;
}) {
  if (status === "failed") {
    return (
      <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <div className="rounded-full bg-red-50 p-4 text-red-500">
          <AlertTriangle size={28} />
        </div>
        <p className="font-medium text-zinc-900">Processing failed</p>
        <p className="max-w-md text-sm text-zinc-500">
          {error || "Something went wrong while analyzing your course material."}
        </p>
        <Button onClick={onRetry} className="mt-2 gap-1.5">
          <RefreshCw size={15} /> Retry processing
        </Button>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-20 text-center">
      <Loader2 size={32} className="animate-spin text-brand-500" />
      <p className="font-medium text-zinc-900">Notera is analyzing your course material…</p>
      <p className="max-w-md text-sm text-zinc-500">
        Extracting topics, matching them against your notes, analyzing past papers, and ranking
        priorities. This usually takes a minute or two.
      </p>
    </Card>
  );
}
