import type { IEvent } from "@/features/calendar/interfaces";

export function appendEvent(events: IEvent[], newEvent: IEvent): IEvent[] {
  return [...events, newEvent];
}

export function replaceEvent(events: IEvent[], updatedEvent: IEvent): IEvent[] {
  const normalizedEvent = {
    ...updatedEvent,
    startDate: new Date(updatedEvent.startDate).toISOString(),
    endDate: new Date(updatedEvent.endDate).toISOString(),
  };

  return events.map((event) =>
    event.id === updatedEvent.id ? normalizedEvent : event,
  );
}

export function softDeleteEventById(
  events: IEvent[],
  eventId: number,
  deletedBy?: string,
): IEvent[] {
  return events.map((event) =>
    event.id === eventId
      ? {
          ...event,
          deletedAt: new Date().toISOString(),
          deletedBy,
        }
      : event,
  );
}

export function restoreEventById(events: IEvent[], eventId: number): IEvent[] {
  return events.map((event) =>
    event.id === eventId
      ? {
          ...event,
          deletedAt: undefined,
          deletedBy: undefined,
        }
      : event,
  );
}

export function purgeEventById(events: IEvent[], eventId: number): IEvent[] {
  return events.filter((event) => event.id !== eventId);
}
