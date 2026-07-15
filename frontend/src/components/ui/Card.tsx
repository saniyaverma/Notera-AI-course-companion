import { HTMLAttributes } from "react";
import clsx from "clsx";

export default function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-zinc-100 bg-white shadow-sm shadow-zinc-200/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
