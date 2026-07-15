import clsx from "clsx";

const variants: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-zinc-100 text-zinc-600 border-zinc-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  default: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

export default function Badge({ label, variant = "default" }: { label: string; variant?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        variants[variant] || variants.default
      )}
    >
      {label}
    </span>
  );
}
