import type { TEventColor, TEventStatus, TEventType, TEventPriority } from "@/features/calendar/types";

export interface IUser {
	id: string;
	name: string;
	picturePath: string | null;
}

export interface IEvent {
	id: number;
	startDate: string;
	endDate: string;
	title: string;
	color: TEventColor;
	description: string;
	user: IUser;
	status: TEventStatus;
	type: TEventType;
	priority: TEventPriority;
	customerId?: number;
	attendantId?: string;
	deletedAt?: string;
	deletedBy?: string;
}

export interface ICalendarCell {
	day: number;
	currentMonth: boolean;
	date: Date;
}
