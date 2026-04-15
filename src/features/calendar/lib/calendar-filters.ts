import type { IEvent, IUser } from "@/features/calendar/interfaces";
import type {
  TEventColor,
  TEventPriority,
  TEventStatus,
  TEventType,
} from "@/features/calendar/types";

type filterParams = {
  events: IEvent[];
  selectedUserIds: IUser["id"][];
  selectedColors: TEventColor[];
  selectedStatuses: TEventStatus[];
  selectedTypes: TEventType[];
  selectedPriorities: TEventPriority[];
};

export function applyEventFilters({
  events,
  selectedUserIds,
  selectedColors,
  selectedStatuses,
  selectedTypes,
  selectedPriorities,
}: filterParams): IEvent[] {
  return events.filter((event) => {
    const matchesUser =
      selectedUserIds.length === 0 || selectedUserIds.includes(event.user.id);

    const eventColor = event.color || "blue";
    const matchesColor =
      selectedColors.length === 0 || selectedColors.includes(eventColor);

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(event.status);

    const matchesType =
      selectedTypes.length === 0 || selectedTypes.includes(event.type);

    const matchesPriority =
      selectedPriorities.length === 0 ||
      selectedPriorities.includes(event.priority);

    return (
      matchesUser &&
      matchesColor &&
      matchesStatus &&
      matchesType &&
      matchesPriority
    );
  });
}

export function toggleColorSelection(
  selectedColors: TEventColor[],
  color: TEventColor,
): TEventColor[] {
  return toggleSelection(selectedColors, color);
}

export function toggleSelection<T extends string>(
  selectedItems: T[],
  item: T,
): T[] {
  return selectedItems.includes(item)
    ? selectedItems.filter((currentItem) => currentItem !== item)
    : [...selectedItems, item];
}
