import { Loader2, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import type { ProcessingStatus } from "@/types";

const CONFIG: Record<ProcessingStatus, { label: string; icon: any; className: string }> = {
  pending: { label: "Queued", icon: Clock, className: "bg-zinc-100 text-zinc-600" },
  processing: { label: "Analyzing…", icon: Loader2, className: "bg-blue-50 text-blue-700" },
  completed: { label: "Ready", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Failed", icon: AlertCircle, className: "bg-red-50 text-red-700" },
};

export default function CourseStatusBadge({ status }: { status: ProcessingStatus }) {
  const cfg = CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.className}`}>
      <Icon size={12} className={status === "processing" ? "animate-spin" : ""} />
      {cfg.label}
    </span>
  );
}
