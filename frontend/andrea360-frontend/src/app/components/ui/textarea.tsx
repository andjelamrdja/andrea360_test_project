"use client";

import * as React from "react";
import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        [
          // layout & sizing
          "flex w-full min-h-16 resize-none rounded-md px-3 py-2 text-sm",

          // colors (SAFE defaults – no theme tokens required)
          "bg-white border border-slate-200 text-slate-900",
          "placeholder:text-slate-400",

          // focus
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:border-slate-400",

          // disabled
          "disabled:cursor-not-allowed disabled:opacity-50",

          // error state
          "aria-invalid:border-red-500 aria-invalid:ring-red-200",

          // dark mode
          "dark:bg-slate-950 dark:border-slate-800 dark:text-slate-50 dark:placeholder:text-slate-500",
          "dark:focus-visible:ring-slate-600 dark:focus-visible:border-slate-600",
          "dark:aria-invalid:border-red-500 dark:aria-invalid:ring-red-500/30",
        ],
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
