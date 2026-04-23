import type { TEventPriority } from "@/features/calendar/types";

type EventPriorityBadgeProps = {
  priority: TEventPriority;
};

const PRIORITY_LABELS: Record<TEventPriority, string> = {
  cold: "frio",
  warm: "morno",
  hot: "quente",
};

const PRIORITY_STYLES: Record<TEventPriority, string> = {
  cold:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  warm:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  hot: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
};

export function EventPriorityBadge({ priority }: EventPriorityBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        PRIORITY_STYLES[priority],
      ].join(" ")}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
