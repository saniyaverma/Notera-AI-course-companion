"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import clsx from "clsx";
import Card from "@/components/ui/Card";
import { EmptyTab } from "@/components/dashboard/TopicPriorityList";
import type { ImportantQuestion } from "@/types";

export default function ImportantQuestionsList({ questions }: { questions: ImportantQuestion[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (questions.length === 0) {
    return <EmptyTab message="No important questions were extracted from the PYQs yet." />;
  }

  return (
    <div className="space-y-2.5">
      {questions.map((q) => {
        const isOpen = openId === q.id;
        return (
          <Card key={q.id} className="overflow-hidden">
            <button
              onClick={() => setOpenId(isOpen ? null : q.id)}
              className="flex w-full items-start justify-between gap-3 p-4 text-left"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <HelpCircle size={17} className="mt-0.5 shrink-0 text-brand-500" />
                <div className="min-w-0">
                  <p className="font-medium text-zinc-900">{q.question}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    {q.topic_title && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-600">{q.topic_title}</span>
                    )}
                    <span>Asked {q.frequency}x</span>
                  </div>
                </div>
              </div>
              <ChevronDown size={16} className={clsx("mt-0.5 shrink-0 text-zinc-400 transition-transform", isOpen && "rotate-180")} />
            </button>
            {isOpen && (
              <div className="border-t border-zinc-100 bg-zinc-50/60 px-4 py-3.5 pl-11">
                <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">{q.answer}</p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
