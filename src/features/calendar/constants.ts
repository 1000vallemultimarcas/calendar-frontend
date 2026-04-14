import type { TEventColor, TEventStatus, TEventType, TEventPriority } from "@/features/calendar/types";

export const COLORS: TEventColor[] = [
	"blue",
	"green",
	"red",
	"yellow",
	"purple",
	"orange",
];

export const EVENT_STATUSES: TEventStatus[] = [
	"scheduled",
	"confirmed",
	"cancelled",
	"attended",
	"rescheduled",
	"not_attended",
];

export const EVENT_TYPES: TEventType[] = [
	"meeting",
	"appointment",
	"personal",
	"work",
	"visit",
	"test_drive",
];

export const EVENT_PRIORITIES: TEventPriority[] = [
	"low",
	"normal",
	"high",
	"urgent",
];
