import { useCallback, useState } from "react";
import type { IEvent } from "@/features/calendar/interfaces";
import {
  appendEvent,
  replaceEvent,
  softDeleteEventById,
  restoreEventById,
  purgeEventById,
} from "@/features/calendar/lib/calendar-events";

type UseCalendarEventStateParams = {
  initialEvents: IEvent[];
};

export function useCalendarEventState({
  initialEvents,
}: UseCalendarEventStateParams) {
  const [allEvents, setAllEvents] = useState<IEvent[]>(initialEvents || []);

  const setEvents = useCallback((events: IEvent[]) => {
    setAllEvents(events);
  }, []);

  const addEvent = useCallback((event: IEvent) => {
    setAllEvents((prev) => appendEvent(prev, event));
  }, []);

  const updateEvent = useCallback((event: IEvent) => {
    setAllEvents((prev) => replaceEvent(prev, event));
  }, []);

  const removeEvent = useCallback((eventId: number, deletedBy?: string) => {
    setAllEvents((prev) => softDeleteEventById(prev, eventId, deletedBy));
  }, []);

  const restoreEvent = useCallback((eventId: number) => {
    setAllEvents((prev) => restoreEventById(prev, eventId));
  }, []);

  const purgeEvent = useCallback((eventId: number) => {
    setAllEvents((prev) => purgeEventById(prev, eventId));
  }, []);

  return {
    allEvents,
    setEvents,
    addEvent,
    updateEvent,
    removeEvent,
    restoreEvent,
    purgeEvent,
  };
}
