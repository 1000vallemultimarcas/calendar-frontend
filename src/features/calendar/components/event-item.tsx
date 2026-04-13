import { EventStatusBadge } from "./event-status-badge";
import { EventTypeBadge } from "./event-type-badge";
import { EventPriorityBadge } from "./event-priority-badge";
import { formatTime } from "@/features/calendar/helpers";
import type {
  TEventStatus,
  TEventType,
  TEventPriority,
} from "@/features/calendar/types";

type EventItemProps = {
  title: string;
  startDate: string | Date;
  endDate: string | Date;
  status: TEventStatus;
  type: TEventType;
  priority: TEventPriority;
  secondaryLabel?: string;
  description?: string;
  use24HourFormat?: boolean;
};

export function EventItem({
  title,
  startDate,
  endDate,
  status,
  type,
  priority,
  secondaryLabel,
  description,
  use24HourFormat = true,
}: EventItemProps) {
  const startTime = formatTime(startDate, use24HourFormat);
  const endTime = formatTime(endDate, use24HourFormat);

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-muted-foreground/20 bg-muted/40 p-3 text-xs shadow-sm transition hover:bg-muted/60 hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <span className="flex-1 truncate font-semibold leading-tight">
          {title}
        </span>

        <span className="whitespace-nowrap text-[10px] text-muted-foreground">
          {startTime} - {endTime}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <EventTypeBadge type={type} />
        <EventStatusBadge status={status} />
        <EventPriorityBadge priority={priority} />
      </div>

      {secondaryLabel && (
        <span className="text-[11px] text-muted-foreground">
          {secondaryLabel}
        </span>
      )}

      {description && (
        <p className="text-[11px] leading-5 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}
