"use client";

import { useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import clsx from "clsx";

interface FileDropzoneProps {
  label: string;
  helpText: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  required?: boolean;
}

export default function FileDropzone({ label, helpText, file, onChange, accept = ".pdf,.docx,.doc,.txt", required }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onChange(dropped);
  };

  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-zinc-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <p className="mb-2 text-xs text-zinc-400">{helpText}</p>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
          dragging ? "border-brand-400 bg-brand-50" : "border-zinc-200 hover:border-brand-300 hover:bg-zinc-50",
          file && "border-emerald-300 bg-emerald-50/50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
        {file ? (
          <div className="flex w-full items-center justify-between gap-2 px-2">
            <div className="flex min-w-0 items-center gap-2">
              <FileText size={18} className="shrink-0 text-emerald-600" />
              <span className="truncate text-sm font-medium text-zinc-800">{file.name}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="shrink-0 rounded-full p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <>
            <UploadCloud size={22} className="mb-1.5 text-zinc-400" />
            <p className="text-sm text-zinc-500">
              <span className="font-medium text-brand-600">Click to upload</span> or drag and drop
            </p>
            <p className="mt-0.5 text-xs text-zinc-400">PDF, DOCX, or TXT</p>
          </>
        )}
      </div>
    </div>
  );
}
