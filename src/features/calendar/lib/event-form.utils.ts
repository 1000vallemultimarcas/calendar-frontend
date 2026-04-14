import { addMinutes, set } from "date-fns";
import type { IEvent } from "@/features/calendar/interfaces";
import type { TEventColor, TEventType } from "@/features/calendar/types";

type GetInitialDatesParams = {
  startDate?: Date;
  startTime?: { hour: number; minute: number };
  event?: IEvent;
  isEditing: boolean;
};

export function getColorByType(type: TEventType): TEventColor {
  switch (type) {
    case "meeting":
      return "blue";
    case "appointment":
      return "green";
    case "personal":
      return "purple";
    case "work":
      return "orange";
    case "visit":
      return "yellow";
    case "test_drive":
      return "red";
    default:
      return "blue";
  }
}

export function getInitialDates({
  startDate,
  startTime,
  event,
  isEditing,
}: GetInitialDatesParams) {
  if (!isEditing && !event) {
    if (!startDate) {
      const now = new Date();
      return { startDate: now, endDate: addMinutes(now, 30) };
    }

    const start = startTime
      ? set(new Date(startDate), {
          hours: startTime.hour,
          minutes: startTime.minute,
          seconds: 0,
        })
      : new Date(startDate);

    return {
      startDate: start,
      endDate: addMinutes(start, 30),
    };
  }

  return {
    startDate: new Date(event!.startDate),
    endDate: new Date(event!.endDate),
  };
}
