import { useState } from "react";
import type { IEvent } from "@/features/calendar/interfaces";
import {
  appendEvent,
  replaceEvent,
  removeEventById,
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

  const removeEvent = (eventId: number) => {
    setAllEvents((prev) => removeEventById(prev, eventId));
  };

  return {
    allEvents,
    addEvent,
    updateEvent,
    removeEvent,
  };
}