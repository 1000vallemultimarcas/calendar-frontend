import type { IUser,IEvent } from "../interfaces";
import type { TCalendarView,TEventColor } from "../types";

export interface ICalendarContext{
  selectedDate: Date;
  view: TCalendarView;
  setView: (view: TCalendarView) => void;
  agendaModeGroupBy: "date" | "color";
  setAgendaModeGroupBy: (groupBy: "date" | "color") => void;
  use24HourFormat: boolean;
  toggleTimeFormat: () => void;
  setSelectedDate: (date: Date | undefined) => void;
  selectedUserId: IUser["id"] | "all";
  setSelectedUserId: (userId: IUser["id"] | "all") => void;
  badgeVariant: "dot" | "colored";
  setBadgeVariant: (variant: "dot" | "colored") => void;
  selectedColors: TEventColor[];
  filterEventsBySelectedColors: (color: TEventColor) => void;
  filterEventsBySelectedUser: (userId: IUser["id"] | "all") => void;
  users: IUser[];
  events: IEvent[];
  addEvent: (event: IEvent) => void;
  updateEvent: (event: IEvent) => void;
  removeEvent: (eventId: number) => void;
  clearFilter: () => void;
}

export interface CalendarSettings {
  badgeVariant: "dot" | "colored";
  view: TCalendarView;
  use24HourFormat: boolean;
  agendaModeGroupBy: "date" | "color";
}

export interface ICalendarContext {
  selectedDate: Date;
  setSelectedDate: (date: Date | undefined) => void;

  view: TCalendarView;
  setView: (view: TCalendarView) => void;

  agendaModeGroupBy: "date" | "color";
  setAgendaModeGroupBy: (groupBy: "date" | "color") => void;

  use24HourFormat: boolean;
  toggleTimeFormat: () => void;

  selectedUserId: IUser["id"] | "all";
  setSelectedUserId: (userId: IUser["id"] | "all") => void;

  badgeVariant: "dot" | "colored";
  setBadgeVariant: (variant: "dot" | "colored") => void;

  selectedColors: TEventColor[];
  filterEventsBySelectedColors: (color: TEventColor) => void;
  filterEventsBySelectedUser: (userId: IUser["id"] | "all") => void;

  users: IUser[];
  events: IEvent[];

  addEvent: (event: IEvent) => void;
  updateEvent: (event: IEvent) => void;
  removeEvent: (eventId: number) => void;

  clearFilter: () => void;
}

export interface CalendarSettings {
  badgeVariant: "dot" | "colored";
  view: TCalendarView;
  use24HourFormat: boolean;
  agendaModeGroupBy: "date" | "color";
}