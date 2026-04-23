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
	"initial_contact",
	"proposal_sent",
	"test_drive",
	"waiting_response",
	"closing",
	"completed",
];

export const EVENT_PRIORITIES: TEventPriority[] = ["cold", "warm", "hot"];
