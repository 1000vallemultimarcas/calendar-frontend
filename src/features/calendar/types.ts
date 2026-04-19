export type TCalendarView = "day" | "week" | "month" | "year" | "agenda";
export type TEventColor =
	| "blue"
	| "green"
	| "red"
	| "yellow"
	| "purple"
	| "orange";
export type TEventStatus =
	| "scheduled"
	| "confirmed"
	| "cancelled"
	| "attended"
	| "rescheduled"
	| "not_attended";
export type TEventType =
	| "meeting"
	| "follow_up"
	| "delivery"
	| "personal"
	| "visit"
	| "test_drive";
export type TEventPriority = "low" | "normal" | "high" | "urgent";
