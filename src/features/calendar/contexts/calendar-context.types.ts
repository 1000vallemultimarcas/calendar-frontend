import type { IUser, IEvent } from "../interfaces";
import type {
  TCalendarView,
  TEventColor,
  TEventPriority,
  TEventStatus,
  TEventType,
} from "../types";

export interface ICalendarContext {
  selectedDate: Date;
  view: TCalendarView;
  setView: (view: TCalendarView) => void;
  agendaModeGroupBy: "date" | "color";
  setAgendaModeGroupBy: (groupBy: "date" | "color") => void;
  use24HourFormat: boolean;
  toggleTimeFormat: () => void;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserIds: IUser["id"][];
  setSelectedUserIds: (userIds: IUser["id"][]) => void;
  badgeVariant: "dot" | "colored";
  setBadgeVariant: (variant: "dot" | "colored") => void;
  selectedColors: TEventColor[];
  selectedStatuses: TEventStatus[];
  selectedTypes: TEventType[];
  selectedPriorities: TEventPriority[];
  filterEventsBySelectedColors: (color: TEventColor) => void;
  filterEventsBySelectedStatus: (status: TEventStatus) => void;
  filterEventsBySelectedType: (type: TEventType) => void;
  filterEventsBySelectedPriority: (priority: TEventPriority) => void;
  filterEventsBySelectedUser: (userId: IUser["id"] | "all") => void;
  users: IUser[];
  events: IEvent[];
  deletedEvents: IEvent[];
  isLoadingEvents: boolean;
  addEvent: (event: IEvent) => void;
  updateEvent: (event: IEvent) => void;
  removeEvent: (eventId: number, deletedBy?: string) => void;
  restoreEvent: (eventId: number) => void;
  purgeEvent: (eventId: number) => void;
  clearFilter: () => void;
}

export interface CalendarSettings {
  badgeVariant: "dot" | "colored";
  view: TCalendarView;
  use24HourFormat: boolean;
  agendaModeGroupBy: "date" | "color";
}

export interface CalendarSettings {
  badgeVariant: "dot" | "colored";
  view: TCalendarView;
  use24HourFormat: boolean;
  agendaModeGroupBy: "date" | "color";
}
