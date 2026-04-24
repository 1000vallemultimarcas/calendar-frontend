import type { TEventColor, TEventStatus, TEventType, TEventPriority } from "@/features/calendar/types";

export interface IUser {
	id: string;
	name: string;
	picturePath: string | null;
	userColor: string;
}

export interface ICustomer {
	id: number;
	name: string;
	phone: string | null;
}

export interface IEventSchedulerProfile {
	id?: string;
	name: string;
	mail?: string;
	permissionLevel?: number;
}

export interface IEvent {
	id: number;
	backendId?: string;
	startDate: string;
	endDate: string;
	createdAt?: string;
	updatedAt?: string;
	title: string;
	color: TEventColor;
	description: string;
	user: IUser;
	status: TEventStatus;
	type: TEventType;
	priority: TEventPriority;
	customerId?: number;
	customerPhone?: string;
	attendantId?: string;
	scheduledBy?: IEventSchedulerProfile;
	deletedAt?: string;
	deletedBy?: string;
}

export interface ICalendarCell {
	day: number;
	currentMonth: boolean;
	date: Date;
}
