import { AlertCircle } from "lucide-react";
import Card from "@/components/ui/Card";

export default function MissingTopicsCard({ missingTopics }: { missingTopics: string[] }) {
  if (missingTopics.length === 0) return null;

  return (
    <Card className="border-amber-200 bg-amber-50/50 p-5">
      <div className="mb-2 flex items-center gap-2 text-amber-700">
        <AlertCircle size={16} />
        <h3 className="text-sm font-semibold">Missing from your notes</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {missingTopics.map((t) => (
          <span key={t} className="rounded-full border border-amber-200 bg-white px-3 py-1 text-xs text-amber-800">
            {t}
          </span>
        ))}
      </div>
    </Card>
  );
}
