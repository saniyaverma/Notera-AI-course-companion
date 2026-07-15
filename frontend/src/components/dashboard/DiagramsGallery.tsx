"use client";

import { useState } from "react";
import { X, ImageIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import { EmptyTab } from "@/components/dashboard/TopicPriorityList";
import { API_URL } from "@/lib/api";
import type { Diagram } from "@/types";

function toUrl(path: string): string {
  const normalized = path.replace(/\\/g, "/");
  const idx = normalized.indexOf("/uploads/");
  const relative = idx >= 0 ? normalized.slice(idx + "/uploads/".length) : normalized;
  return `${API_URL}/static/uploads/${relative}`;
}

export default function DiagramsGallery({ diagrams }: { diagrams: Diagram[] }) {
  const [selected, setSelected] = useState<Diagram | null>(null);

  if (diagrams.length === 0) {
    return <EmptyTab message="No diagrams were found in your uploaded notes." />;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {diagrams.map((d) => (
          <Card
            key={d.id}
            className="group cursor-pointer overflow-hidden p-2 transition-shadow hover:shadow-lg"
            onClick={() => setSelected(d)}
          >
            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-zinc-50">
              <img
                src={toUrl(d.image_path)}
                alt={d.title}
                className="h-full w-full object-contain transition-transform group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <p className="mt-2 truncate px-1 text-xs text-zinc-500">{d.title}</p>
          </Card>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6"
          onClick={() => setSelected(null)}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute right-6 top-6 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X size={22} />
          </button>
          <div className="max-h-[85vh] max-w-4xl overflow-hidden rounded-xl bg-white" onClick={(e) => e.stopPropagation()}>
            <img src={toUrl(selected.image_path)} alt={selected.title} className="max-h-[75vh] w-full object-contain" />
            <div className="flex items-center gap-2 border-t border-zinc-100 p-4">
              <ImageIcon size={15} className="text-zinc-400" />
              <p className="text-sm text-zinc-600">{selected.title}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
