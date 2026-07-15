import { CheckCircle2, XCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Topic } from "@/types";

export default function TopicPriorityList({ topics, coveragePercent }: { topics: Topic[]; coveragePercent: number }) {
  if (topics.length === 0) {
    return <EmptyTab message="No topics were extracted from the syllabus yet." />;
  }

  const grouped = {
    high: topics.filter((t) => t.priority === "high"),
    medium: topics.filter((t) => t.priority === "medium"),
    low: topics.filter((t) => t.priority === "low"),
  };

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Notes Syllabus Coverage</h3>
          <span className="text-sm font-semibold text-brand-600">{coveragePercent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
            style={{ width: `${coveragePercent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-zinc-500">
          {topics.filter((t) => t.is_covered_in_notes).length} of {topics.length} topics found in your notes
        </p>
      </Card>

      {(["high", "medium", "low"] as const).map((level) =>
        grouped[level].length > 0 ? (
          <div key={level}>
            <div className="mb-2.5 flex items-center gap-2">
              <Badge label={`${level} priority`} variant={level} />
              <span className="text-xs text-zinc-400">{grouped[level].length} topics</span>
            </div>
            <div className="grid gap-2.5">
              {grouped[level].map((topic) => (
                <Card key={topic.id} className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-zinc-900">{topic.title}</p>
                    {topic.reasoning && <p className="mt-1 text-xs text-zinc-500">{topic.reasoning}</p>}
                    <div className="mt-2 flex items-center gap-3 text-xs text-zinc-400">
                      <span>Asked {topic.pyq_frequency}x in PYQs</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {topic.is_covered_in_notes ? (
                      <span title="Covered in your notes">
                        <CheckCircle2 size={18} className="text-emerald-500" />
                      </span>
                    ) : (
                      <span title="Missing from your notes">
                        <XCircle size={18} className="text-red-400" />
                      </span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : null
      )}
    </div>
  );
}

export function EmptyTab({ message }: { message: string }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <p className="text-sm text-zinc-500">{message}</p>
    </Card>
  );
}
