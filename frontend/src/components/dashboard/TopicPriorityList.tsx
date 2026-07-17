import { Info } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import type { Topic } from "@/types";

interface Props {
  topics: Topic[];
}

export default function TopicPriorityList({ topics }: Props) {
  if (topics.length === 0) {
    return (
      <EmptyTab message="No topics were extracted from the syllabus yet." />
    );
  }

  const grouped = {
    high: topics
      .filter((t) => t.priority === "high")
      .sort((a, b) => b.pyq_frequency - a.pyq_frequency),

    medium: topics
      .filter((t) => t.priority === "medium")
      .sort((a, b) => b.pyq_frequency - a.pyq_frequency),

    low: topics
      .filter((t) => t.priority === "low")
      .sort((a, b) => b.pyq_frequency - a.pyq_frequency),
  };

  return (
    <div className="space-y-6">

      {/* Guide */}
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-brand-50 p-2">
            <Info size={18} className="text-brand-600" />
          </div>

          <div>
            <h3 className="font-semibold text-zinc-900">
              How is priority determined?
            </h3>

            <p className="mt-1 text-sm leading-6 text-zinc-600">
              Priority is estimated by mapping syllabus topics with
              previous year questions (PYQs). Topics that appear more
              frequently across exams are ranked higher to help you
              focus your preparation.
            </p>
          </div>
        </div>
      </Card>

      {(["high", "medium", "low"] as const).map((level) => {
        if (grouped[level].length === 0) return null;

        return (
          <div key={level}>
            <div className="mb-3 flex items-center gap-2">
              <Badge
                label={`${level} priority`}
                variant={level}
              />

              <span className="text-xs text-zinc-400">
                {grouped[level].length} topics
              </span>
            </div>

            <Card className="p-4">
              <div className="flex flex-wrap gap-3">
                {grouped[level].map((topic) => (
                  <div
                    key={topic.id}
                    className="
                      rounded-lg
                      border
                      border-zinc-200
                      bg-zinc-50
                      px-3
                      py-2
                      text-sm
                      font-medium
                      text-zinc-700
                      transition
                      hover:border-brand-300
                      hover:bg-brand-50
                    "
                  >
                    {topic.title}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

export function EmptyTab({
  message,
}: {
  message: string;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <p className="text-sm text-zinc-500">{message}</p>
    </Card>
  );
}