"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 cursor-pointer items-center rounded-full border border-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-slate-900 data-[state=unchecked]:bg-slate-200",
        "dark:border-slate-800 dark:data-[state=checked]:bg-slate-50 dark:data-[state=unchecked]:bg-slate-800",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform",
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
          "dark:bg-slate-950"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
