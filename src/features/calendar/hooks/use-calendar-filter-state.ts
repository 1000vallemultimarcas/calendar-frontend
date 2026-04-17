import { useMemo, useState } from "react";
import type { IEvent, IUser } from "@/features/calendar/interfaces";
import type {
  TEventColor,
  TEventPriority,
  TEventStatus,
  TEventType,
} from "@/features/calendar/types";
import {
  applyEventFilters,
  toggleColorSelection,
} from "@/features/calendar/lib/calendar-filters";

type UseCalendarFilterStateParams = {
  events: IEvent[];
};

export function useCalendarFilterState({
  events,
}: UseCalendarFilterStateParams) {
  const [selectedUserIds, setSelectedUserIds] = useState<IUser["id"][]>([]);
  const [selectedColors, setSelectedColors] = useState<TEventColor[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<TEventStatus[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<TEventType[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<
    TEventPriority[]
  >([]);

  const filterEventsBySelectedColors = (color: TEventColor) => {
    setSelectedColors((prev) => toggleColorSelection(prev, color));
  };

  const filterEventsBySelectedUser = (userId: IUser["id"] | "all") => {
    if (userId === "all") {
      setSelectedUserIds([]);
      return;
    }

    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((selectedId) => selectedId !== userId)
        : [...prev, userId],
    );
  };

  const filterEventsBySelectedStatus = (status: TEventStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? [] : [status],
    );
  };

  const filterEventsBySelectedType = (type: TEventType) => {
    setSelectedTypes((prev) => (prev.includes(type) ? [] : [type]));
  };

  const filterEventsBySelectedPriority = (priority: TEventPriority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority) ? [] : [priority],
    );
  };

  const clearFilter = () => {
    setSelectedColors([]);
    setSelectedStatuses([]);
    setSelectedTypes([]);
    setSelectedPriorities([]);
    setSelectedUserIds([]);
  };

  const filteredEvents = useMemo(() => {
    return applyEventFilters({
      events,
      selectedUserIds,
      selectedColors,
      selectedStatuses,
      selectedTypes,
      selectedPriorities,
    });
  }, [
    events,
    selectedUserIds,
    selectedColors,
    selectedStatuses,
    selectedTypes,
    selectedPriorities,
  ]);

  return {
    selectedUserIds,
    setSelectedUserIds,
    selectedColors,
    selectedStatuses,
    selectedTypes,
    selectedPriorities,
    filterEventsBySelectedColors,
    filterEventsBySelectedUser,
    filterEventsBySelectedStatus,
    filterEventsBySelectedType,
    filterEventsBySelectedPriority,
    filteredEvents,
    clearFilter,
  };
}
