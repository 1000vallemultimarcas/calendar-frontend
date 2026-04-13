import { useMemo, useState } from "react";
import type { IEvent, IUser } from "@/features/calendar/interfaces";
import type { TEventColor } from "@/features/calendar/types";
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
  const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">(
    "all",
  );
  const [selectedColors, setSelectedColors] = useState<TEventColor[]>([]);

  const filterEventsBySelectedColors = (color: TEventColor) => {
    setSelectedColors((prev) => toggleColorSelection(prev, color));
  };

  const filterEventsBySelectedUser = (userId: IUser["id"] | "all") => {
    setSelectedUserId(userId);
  };

  const clearFilter = () => {
    setSelectedColors([]);
    setSelectedUserId("all");
  };

  const filteredEvents = useMemo(() => {
    return applyEventFilters({
      events,
      selectedUserId,
      selectedColors,
    });
  }, [events, selectedUserId, selectedColors]);

  return {
    selectedUserId,
    setSelectedUserId,
    selectedColors,
    filterEventsBySelectedColors,
    filterEventsBySelectedUser,
    filteredEvents,
    clearFilter,
  };
}