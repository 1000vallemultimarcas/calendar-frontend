"use client";

import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { IEvent, IUser } from "@/features/calendar/interfaces";
import type { TCalendarView } from "@/features/calendar/types";
import type { ICalendarContext } from "./calendar-context.types";
import { useCalendarFilterState } from "@/features/calendar/hooks/use-calendar-filter-state";
import { useCalendarSettingsState } from "@/features/calendar/hooks/use-calendar-settings-state";
import { useCalendarEventState } from "../hooks/use-calendar-event-state";
import { useAuth } from "./authContext";
import { getEvents, getUsers, mapViewToSchedulePeriod } from "../requests";
const CalendarContext = createContext({} as ICalendarContext);

type CalendarProviderProps = {
  children: React.ReactNode;
  users: IUser[];
  events: IEvent[];
  view?: TCalendarView;
  badge?: "dot" | "colored";
};

export function CalendarProvider({
  children,
  users,
  events,
  badge = "colored",
  view = "day",
}: CalendarProviderProps) {
  const { token } = useAuth();
  const [selectedDate, setSelectedDateState] = useState(new Date());
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [calendarUsers, setCalendarUsers] = useState<IUser[]>(users);

  const {
    allEvents,
    setEvents,
    addEvent,
    updateEvent,
    removeEvent,
    restoreEvent,
    purgeEvent,
  } = useCalendarEventState({
    initialEvents: events,
  });

  const {
    badgeVariant,
    setBadgeVariant,
    view: currentView,
    setView,
    use24HourFormat,
    toggleTimeFormat,
    agendaModeGroupBy,
    setAgendaModeGroupBy,
  } = useCalendarSettingsState({
    initialBadge: badge,
    initialView: view,
  });

  const activeEvents = useMemo(
    () => allEvents.filter((event) => !event.deletedAt),
    [allEvents],
  );

  const deletedEvents = useMemo(
    () => allEvents.filter((event) => event.deletedAt),
    [allEvents],
  );

  const {
    selectedUserId,
    setSelectedUserId,
    selectedColors,
    filterEventsBySelectedColors,
    filterEventsBySelectedUser,
    filteredEvents,
    clearFilter,
  } = useCalendarFilterState({
    events: activeEvents,
  });

  const setSelectedDate = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDateState(date);
  };

  useEffect(() => {
    let isActive = true;

    async function syncEvents() {
      if (!token) {
        setCalendarUsers([]);
        setEvents([]);
        setIsLoadingEvents(false);
        return;
      }

      setIsLoadingEvents(true);

      try {
        const nextUsers = await getUsers();
        const nextEvents = await getEvents({
          period: mapViewToSchedulePeriod(currentView),
          referenceDate: selectedDate,
          users: nextUsers,
        });

        if (isActive) {
          setCalendarUsers(nextUsers);
          setEvents(nextEvents);
        }
      } catch (error) {
        console.error("Erro ao carregar agendamentos:", error);
      } finally {
        if (isActive) {
          setIsLoadingEvents(false);
        }
      }
    }

    void syncEvents();

    return () => {
      isActive = false;
    };
  }, [currentView, selectedDate, setEvents, token]);

  const value: ICalendarContext = {
    selectedDate,
    setSelectedDate,
    selectedUserId,
    setSelectedUserId,
    badgeVariant,
    setBadgeVariant,
    users: calendarUsers,
    selectedColors,
    filterEventsBySelectedColors,
    filterEventsBySelectedUser,
    events: filteredEvents,
    deletedEvents,
    isLoadingEvents,
    view: currentView,
    use24HourFormat,
    toggleTimeFormat,
    setView,
    agendaModeGroupBy,
    setAgendaModeGroupBy,
    addEvent,
    updateEvent,
    removeEvent,
    restoreEvent,
    purgeEvent,
    clearFilter,
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar(): ICalendarContext {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error("useCalendar must be used within a CalendarProvider.");
  }

  return context;
}
