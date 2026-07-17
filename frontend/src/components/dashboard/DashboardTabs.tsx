import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

export interface TabDef {
  key: string;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface DashboardTabsProps {
  tabs: TabDef[];
  active: string;
  onChange: (key: string) => void;
}

export default function DashboardTabs({
  tabs,
  active,
  onChange,
}: DashboardTabsProps) {
  return (
    <div className="overflow-x-auto no-scrollbar">
      <div className="inline-flex min-w-full gap-2 rounded-xl border border-zinc-200 bg-white p-2 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={clsx(
                "flex shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-brand-600 text-white shadow-sm"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <Icon size={16} />

              <span>{tab.label}</span>

              {typeof tab.count === "number" && (
                <span
                  className={clsx(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-zinc-200 text-zinc-700"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}