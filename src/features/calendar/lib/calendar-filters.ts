import type { IEvent,IUser } from "@/features/calendar/interfaces";
import type { TEventColor } from "@/features/calendar/types";

type filterParams = {
  events: IEvent[];
  selectedUserId: IUser["id"] | "all";
  selectedColors: TEventColor[];
};

export function applyEventFilters({
  events,
  selectedUserId,
  selectedColors,
}: filterParams): IEvent[] {
  return events.filter((event) => {
    const matchesUser =
      selectedUserId === "all" || event.user.id === selectedUserId;

    const eventColor = event.color || "blue";
    const matchesColor =
      selectedColors.length === 0 || selectedColors.includes(eventColor);

    return matchesUser && matchesColor;
  });
}

export function toggleColorSelection(
  selectedColors: TEventColor[],
  color: TEventColor,
): TEventColor[] {
  return selectedColors.includes(color)
    ? selectedColors.filter((item) => item !== color)
    : [...selectedColors, color];
}