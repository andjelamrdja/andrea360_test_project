import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        // neutral
        default: "bg-card text-card-foreground",

        // backend errors, validation errors, forbidden etc.
        destructive:
          "border-destructive/30 bg-card text-destructive [&>svg]:text-destructive *:data-[slot=alert-description]:text-destructive/90",

        // booking success / payment success
        success:
          "border-emerald-500/30 bg-emerald-50 text-emerald-900 [&>svg]:text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-100 *:data-[slot=alert-description]:text-emerald-900/80 dark:*:data-[slot=alert-description]:text-emerald-100/80",

        // “no credits”, “almost full”, “attention”
        warning:
          "border-amber-500/30 bg-amber-50 text-amber-900 [&>svg]:text-amber-600 dark:bg-amber-950/30 dark:text-amber-100 *:data-[slot=alert-description]:text-amber-900/80 dark:*:data-[slot=alert-description]:text-amber-100/80",

        // info messages
        info: "border-blue-500/30 bg-blue-50 text-blue-900 [&>svg]:text-blue-600 dark:bg-blue-950/30 dark:text-blue-100 *:data-[slot=alert-description]:text-blue-900/80 dark:*:data-[slot=alert-description]:text-blue-100/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        "text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
