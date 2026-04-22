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
    case "follow_up":
      return "green";
    case "delivery":
      return "orange";
    case "personal":
      return "purple";
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
    const now = new Date();

    if (!startDate) {
      return { startDate: now, endDate: addMinutes(now, 30) };
    }

    const suggestedStart = startTime
      ? set(new Date(startDate), {
          hours: startTime.hour,
          minutes: startTime.minute,
          seconds: 0,
        })
      : new Date(startDate);
    const start =
      suggestedStart.getTime() < now.getTime() ? now : suggestedStart;

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
