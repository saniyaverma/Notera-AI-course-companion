"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import EmptyTab from "@/components/dashboard/EmptyTab";
import type { ShortNote } from "@/types";

export default function ShortNotesPanel({
  notes,
  onGenerate,
  generating,
}: {
  notes: ShortNote[];
  onGenerate: () => void;
  generating: boolean;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">
          {notes.length > 0
            ? `${notes.length} topic${notes.length > 1 ? "s" : ""} of revision notes generated`
            : "Generate concise, exam-ready revision notes for every topic in one click."}
        </p>
        <Button onClick={onGenerate} loading={generating} className="gap-1.5 shrink-0">
          <Sparkles size={15} /> {notes.length > 0 ? "Regenerate Notes" : "Generate Short Notes"}
        </Button>
      </div>

      {notes.length === 0 && !generating ? (
        <EmptyTab message="No revision notes yet. Click 'Generate Short Notes' to create them." />
      ) : (
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="p-5">
              <h3 className="mb-2 text-sm font-semibold text-brand-700">{note.topic_title}</h3>
              <div className="prose-notera text-sm text-zinc-700">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content_markdown}</ReactMarkdown>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
