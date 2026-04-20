import type { TEventType } from "@/features/calendar/types";

type EventTypeBadgeProps = {
  type: TEventType;
};

const TYPE_LABELS: Record<TEventType, string> = {
  visit: "Visita à loja",
  test_drive: "Test drive",
  meeting: "Reunião",
  follow_up: "Retorno / Follow-up",
  delivery: "Entrega de veículo",
  personal: "Pessoal",
};

const TYPE_STYLES: Record<TEventType, string> = {
  visit:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  test_drive:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  meeting:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300",
  follow_up:
    "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300",
  delivery:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  personal:
    "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950/40 dark:text-pink-300",
};

export function EventTypeBadge({ type }: EventTypeBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        TYPE_STYLES[type],
      ].join(" ")}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}
