import type { TEventStatus } from "@/features/calendar/types";

type EventStatusBadgeProps = {
  status: TEventStatus;
};

const STATUS_LABELS: Record<TEventStatus, string> = {
  not_contacted: "Nao atendido",
  in_negotiation: "Em negociacao",
  not_read: "Nao lido",
  scheduled: "Agendado",
  finished_sold: "Finalizado - vendido",
  finished_not_sold: "Finalizado - nao vendido",
};

const STATUS_STYLES: Record<TEventStatus, string> = {
  not_contacted:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
  in_negotiation:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  not_read:
    "border-zinc-200 bg-zinc-50 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  scheduled:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300",
  finished_sold:
    "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950/40 dark:text-green-300",
  finished_not_sold:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300",
};

export function EventStatusBadge({ status }: EventStatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
      ].join(" ")}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
