import { useState } from "react";
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

  const addEvent = (event: IEvent) => {
    setAllEvents((prev) => appendEvent(prev, event));
  };

  const updateEvent = (event: IEvent) => {
    setAllEvents((prev) => replaceEvent(prev, event));
  };

  const removeEvent = (eventId: number, deletedBy?: string) => {
    setAllEvents((prev) => softDeleteEventById(prev, eventId, deletedBy));
  };

  const restoreEvent = (eventId: number) => {
    setAllEvents((prev) => restoreEventById(prev, eventId));
  };

  const purgeEvent = (eventId: number) => {
    setAllEvents((prev) => purgeEventById(prev, eventId));
  };

  return {
    allEvents,
    addEvent,
    updateEvent,
    removeEvent,
    restoreEvent,
    purgeEvent,
  };
}