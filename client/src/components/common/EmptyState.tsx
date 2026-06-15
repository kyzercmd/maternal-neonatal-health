import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  body,
  icon,
  action,
  className,
}: {
  title: string;
  body?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-center px-6 py-10 rounded-2xl bg-secondary/40 border border-border", className)}>
      <div className="mx-auto size-12 rounded-2xl bg-white border border-border grid place-items-center mb-3 text-primary">
        {icon ?? <Sparkles className="size-5" />}
      </div>
      <h3 className="font-display text-lg">{title}</h3>
      {body && <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
