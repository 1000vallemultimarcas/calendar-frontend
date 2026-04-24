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
	"not_contacted",
	"in_negotiation",
	"not_read",
	"scheduled",
	"finished_sold",
	"finished_not_sold",
];

export const EVENT_TYPES: TEventType[] = [
	"visit",
	"test_drive",
	"meeting",
	"follow_up",
	"delivery",
	"personal",
];

export const EVENT_PRIORITIES: TEventPriority[] = [
	"frio",
	"morno",
	"quente",
];
