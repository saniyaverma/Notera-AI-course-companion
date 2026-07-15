import { BookOpenText } from "lucide-react";
import clsx from "clsx";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: 18, text: "text-lg" },
    md: { icon: 24, text: "text-2xl" },
    lg: { icon: 34, text: "text-4xl" },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2 select-none">
      <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-1.5 shadow-sm">
        <BookOpenText size={s.icon} className="text-white" strokeWidth={2.2} />
      </div>
      <span className={clsx("font-bold tracking-tight text-zinc-900", s.text)}>
        Notera
      </span>
    </div>
  );
}
