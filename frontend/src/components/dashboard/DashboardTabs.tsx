import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

export interface TabDef {
  key: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

export default function DashboardTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabDef[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-zinc-200 pb-px">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={clsx(
              "flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
            )}
          >
            <Icon size={15} />
            {tab.label}
            {typeof tab.count === "number" && (
              <span
                className={clsx(
                  "ml-0.5 rounded-full px-1.5 py-0.5 text-[11px]",
                  isActive ? "bg-brand-100 text-brand-700" : "bg-zinc-100 text-zinc-500"
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
