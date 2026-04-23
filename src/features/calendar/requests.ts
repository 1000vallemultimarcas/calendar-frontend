import { format } from "date-fns";
import type { ICustomer, IEvent, IUser } from "@/features/calendar/interfaces";
import { getColorByType } from "@/features/calendar/lib/event-form.utils";
import {
	withUniqueUserColors,
	withUserColor,
} from "@/features/calendar/lib/user-color.utils";
import type {
	TCalendarView,
	TEventStatus,
	TEventType,
} from "@/features/calendar/types";
import { ApiError, fetcher } from "@/lib/api";

export type SchedulePeriod = "day" | "week" | "month" | "year";

type ScheduleApiItem = {
	id: number | string;
	title: string;
	startDate: string;
	endDate: string;
	createdAt?: string;
	updatedAt?: string;
	description: string;
	customerId: number;
	customerPhone?: string | null;
	attendantId: string;
	attendantName?: string;
	status: string;
	type: string;
	createdById?: string;
	createdByName?: string;
	createdByMail?: string;
	createdByPermissionLevel?: number;
};

type UserApiItem = {
	id: string;
	name: string;
	picturePath?: string | null;
	userColor?: string;
};

type UsersApiResponse = UserApiItem[] | { users: UserApiItem[] };

type CustomerApiItem = {
	id: number;
	name: string;
	phone?: string | null;
};

type CustomersApiResponse =
	| CustomerApiItem[]
	| { customers: CustomerApiItem[] };

type GetEventsParams = {
	period?: SchedulePeriod;
	referenceDate?: Date;
	users?: IUser[];
};

const USERS_ENDPOINT = process.env.NEXT_PUBLIC_USERS_ENDPOINT ?? "/users";
const CUSTOMERS_ENDPOINT =
	process.env.NEXT_PUBLIC_CUSTOMERS_ENDPOINT ?? "/customers";
const SCHEDULES_ENDPOINT =
	process.env.NEXT_PUBLIC_SCHEDULES_ENDPOINT ?? "/schedules";

function normalizeUsersResponse(payload: UsersApiResponse): IUser[] {
	const items = Array.isArray(payload) ? payload : payload.users;

	return withUniqueUserColors(
		items.map((user) => ({
			id: user.id,
			name: user.name,
			picturePath: user.picturePath ?? null,
			userColor: user.userColor,
		})),
	);
}

function normalizeCustomersResponse(
	payload: CustomersApiResponse,
): ICustomer[] {
	const items = Array.isArray(payload) ? payload : payload.customers;

	return items.map((customer) => ({
		id: customer.id,
		name: customer.name,
		phone: customer.phone ?? null,
	}));
}

function normalizeStatus(status: string): TEventStatus {
	switch (status.toUpperCase()) {
		case "CONFIRMED":
		case "RESCHEDULED":
			return "in_negotiation";
		case "CANCELLED":
		case "NOT_ATTENDED":
			return "finished_not_sold";
		case "ATTENDED":
			return "finished_sold";
		case "NOT_CONTACTED":
			return "not_contacted";
		case "IN_NEGOTIATION":
			return "in_negotiation";
		case "NOT_READ":
			return "not_read";
		case "FINISHED_SOLD":
			return "finished_sold";
		case "FINISHED_NOT_SOLD":
			return "finished_not_sold";
		default:
			return "scheduled";
	}
}

function normalizeType(type: string): TEventType {
	switch (type.toUpperCase()) {
		case "INITIAL_CONTACT":
			return "initial_contact";
		case "PROPOSAL_SENT":
			return "proposal_sent";
		case "TEST_DRIVE":
			return "test_drive";
		case "WAITING_RESPONSE":
			return "waiting_response";
		case "CLOSING":
			return "closing";
		case "COMPLETED":
			return "completed";
		case "VISIT":
		case "MEETING":
		case "FOLLOW_UP":
		case "DELIVERY":
		case "PERSONAL":
		case "WORK":
		case "APPOINTMENT":
			return "initial_contact";
		default:
			return "initial_contact";
	}
}

export function mapViewToSchedulePeriod(view: TCalendarView): SchedulePeriod {
	switch (view) {
		case "day":
		case "week":
			return "month";
		case "year":
			return "year";
		case "agenda":
		default:
			return "month";
	}
}

function mapScheduleToEvent(schedule: ScheduleApiItem, users: IUser[]): IEvent {
	const type = normalizeType(schedule.type);
	const fallbackUserName =
		schedule.attendantName?.trim() ||
		(schedule.attendantId
			? `Responsavel ${schedule.attendantId.slice(0, 8)}`
			: "Responsavel");
	const numericId =
		typeof schedule.id === "number"
			? schedule.id
			: Number.parseInt(String(schedule.id), 10);

	return {
		id: Number.isNaN(numericId) ? 0 : numericId,
		title: schedule.title,
		description: schedule.description,
		startDate: schedule.startDate,
		endDate: schedule.endDate,
		createdAt: schedule.createdAt,
		updatedAt: schedule.updatedAt,
		status: normalizeStatus(schedule.status),
		type,
		priority: "warm",
		color: getColorByType(type),
		customerId: schedule.customerId,
		customerPhone: schedule.customerPhone ?? undefined,
		attendantId: schedule.attendantId,
		scheduledBy: schedule.createdByName
			? {
					id: schedule.createdById,
					name: schedule.createdByName,
					mail: schedule.createdByMail,
					permissionLevel: schedule.createdByPermissionLevel,
				}
			: undefined,
		user:
			users.find((user) => user.id === schedule.attendantId) ??
			withUserColor({
				id: schedule.attendantId,
				name: fallbackUserName,
				picturePath: null,
			}),
	};
}

function mapEventTypeToApi(type: TEventType): string {
	switch (type) {
		case "test_drive":
			return "TEST_DRIVE";
		case "initial_contact":
		case "proposal_sent":
		case "waiting_response":
		case "closing":
		case "completed":
			return "VISIT";
		default:
			return "VISIT";
	}
}

function mapEventStatusToApi(status: TEventStatus): string {
	switch (status) {
		case "not_contacted":
		case "in_negotiation":
		case "not_read":
			return "SCHEDULED";
		case "finished_sold":
			return "ATTENDED";
		case "finished_not_sold":
			return "CANCELLED";
		default:
			return "SCHEDULED";
	}
}

export async function getUsers(): Promise<IUser[]> {
	try {
		const payload = await fetcher<UsersApiResponse>(USERS_ENDPOINT);
		return normalizeUsersResponse(payload);
	} catch (error) {
		if (error instanceof ApiError && error.status === 403) {
			const fallbackManagerToken = process.env.NEXT_PUBLIC_TEST_MANAGER_TOKEN;
			if (fallbackManagerToken) {
				try {
					const payload = await fetcher<UsersApiResponse>(USERS_ENDPOINT, {
						headers: {
							Authorization: `Bearer ${fallbackManagerToken}`,
						},
					});
					return normalizeUsersResponse(payload);
				} catch (retryError) {
					console.warn(
						"Falha ao listar usuarios com token fallback. Seguindo com fallback local.",
						retryError,
					);
				}
			}

			console.warn("Sem permissao para listar usuarios em /users.");
			return [];
		}

		throw error;
	}
}

export async function getEvents({
	period = "month",
	referenceDate = new Date(),
	users = [],
}: GetEventsParams = {}): Promise<IEvent[]> {
	const params = new URLSearchParams({
		period,
		referenceDate: format(referenceDate, "yyyy-MM-dd"),
	});

	const schedules = await fetcher<ScheduleApiItem[]>(
		`${SCHEDULES_ENDPOINT}?${params.toString()}`,
	);

	return schedules.map((schedule) => mapScheduleToEvent(schedule, users));
}

export async function getCustomers(): Promise<ICustomer[]> {
	const payload = await fetcher<CustomersApiResponse>(CUSTOMERS_ENDPOINT);
	return normalizeCustomersResponse(payload);
}

export async function createEvent(event: Omit<IEvent, "id">): Promise<IEvent> {
	const customerPhone = (event.customerPhone ?? "").replace(/\D/g, "");

	if (!customerPhone) {
		throw new Error("Informe o telefone do cliente.");
	}

	const payload = {
		title: event.title,
		startDate: new Date(event.startDate).toISOString(),
		endDate: new Date(event.endDate).toISOString(),
		description: event.description,
		customerPhone,
		attendantId: event.attendantId ?? event.user.id,
		status: mapEventStatusToApi(event.status),
		type: mapEventTypeToApi(event.type),
		createdById: event.scheduledBy?.id,
	};

	const createdSchedule = await fetcher<ScheduleApiItem>(SCHEDULES_ENDPOINT, {
		method: "POST",
		body: JSON.stringify(payload),
	});

	const mappedEvent = mapScheduleToEvent(createdSchedule, [event.user]);
	return {
		...mappedEvent,
		scheduledBy: mappedEvent.scheduledBy ?? event.scheduledBy,
		customerPhone: mappedEvent.customerPhone ?? event.customerPhone,
	};
}

export async function deleteEvent(eventId: number): Promise<void> {
	await fetcher(`${SCHEDULES_ENDPOINT}/${eventId}`, {
		method: "DELETE",
	});
}
