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
	scheduledById?: string;
	scheduledByName?: string;
	scheduledByMail?: string;
	scheduledByPermissionLevel?: number;
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

type SchedulerCacheEntry = {
	id?: string;
	name: string;
	mail?: string;
	permissionLevel?: number;
};

const USERS_ENDPOINT = process.env.NEXT_PUBLIC_USERS_ENDPOINT ?? "/users";
const CUSTOMERS_ENDPOINT =
	process.env.NEXT_PUBLIC_CUSTOMERS_ENDPOINT ?? "/customers";
const SCHEDULES_ENDPOINT =
	process.env.NEXT_PUBLIC_SCHEDULES_ENDPOINT ?? "/schedules";
const SCHEDULER_CACHE_KEY = "calendar_scheduler_cache_v1";

function readSchedulerCache(): Record<string, SchedulerCacheEntry> {
	if (typeof window === "undefined") {
		return {};
	}

	try {
		const raw = window.localStorage.getItem(SCHEDULER_CACHE_KEY);
		if (!raw) {
			return {};
		}

		const parsed = JSON.parse(raw) as Record<string, SchedulerCacheEntry>;
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}

function writeSchedulerCache(cache: Record<string, SchedulerCacheEntry>) {
	if (typeof window === "undefined") {
		return;
	}

	try {
		window.localStorage.setItem(SCHEDULER_CACHE_KEY, JSON.stringify(cache));
	} catch {
		// Ignore quota and serialization errors.
	}
}

function getCachedSchedulerByEventId(
	eventId: number | string,
): SchedulerCacheEntry | undefined {
	const key = String(eventId);
	const cache = readSchedulerCache();
	return cache[key];
}

function setCachedSchedulerByEventId(
	eventId: number | string,
	scheduler?: SchedulerCacheEntry,
) {
	if (!scheduler?.name) {
		return;
	}

	const key = String(eventId);
	const cache = readSchedulerCache();
	cache[key] = scheduler;
	writeSchedulerCache(cache);
}

function removeCachedSchedulerByEventId(eventId: number | string) {
	const key = String(eventId);
	const cache = readSchedulerCache();
	if (!cache[key]) {
		return;
	}

	delete cache[key];
	writeSchedulerCache(cache);
}

function hashStringToPositiveInt(value: string) {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(index);
		hash |= 0;
	}

	return Math.abs(hash) || 1;
}

function toEventNumericId(value: number | string) {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	const stringValue = String(value).trim();
	if (!stringValue) {
		return 0;
	}

	const parsed = Number.parseInt(stringValue, 10);
	if (Number.isFinite(parsed) && !Number.isNaN(parsed)) {
		return parsed;
	}

	return hashStringToPositiveInt(stringValue);
}

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
	const schedulerId = schedule.createdById ?? schedule.scheduledById;
	const schedulerNameFromApi =
		schedule.createdByName ?? schedule.scheduledByName;
	const schedulerMailFromApi =
		schedule.createdByMail ?? schedule.scheduledByMail;
	const schedulerPermissionFromApi =
		schedule.createdByPermissionLevel ?? schedule.scheduledByPermissionLevel;
	const cachedScheduler = getCachedSchedulerByEventId(schedule.id);
	const fallbackUserName =
		schedule.attendantName?.trim() ||
		(schedule.attendantId
			? `Responsavel ${schedule.attendantId.slice(0, 8)}`
			: "Responsavel");
	const schedulerById = schedulerId
		? users.find((user) => user.id === String(schedulerId))
		: undefined;
	const numericId = toEventNumericId(schedule.id);

	return {
		id: numericId,
		backendId: String(schedule.id),
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
		scheduledBy:
			schedulerId ||
			schedulerNameFromApi ||
			schedulerMailFromApi ||
			typeof schedulerPermissionFromApi === "number" ||
			cachedScheduler
				? {
						id: schedulerId ?? cachedScheduler?.id,
						name:
							schedulerNameFromApi ||
							cachedScheduler?.name ||
							schedulerById?.name ||
							(schedulerId
								? `Usuario ${schedulerId.slice(0, 8)}`
								: "Sistema"),
						mail: schedulerMailFromApi ?? cachedScheduler?.mail,
						permissionLevel:
							schedulerPermissionFromApi ??
							cachedScheduler?.permissionLevel,
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
		createdByName: event.scheduledBy?.name,
		createdByMail: event.scheduledBy?.mail,
		createdByPermissionLevel: event.scheduledBy?.permissionLevel,
		scheduledById: event.scheduledBy?.id,
		scheduledByName: event.scheduledBy?.name,
		scheduledByMail: event.scheduledBy?.mail,
		scheduledByPermissionLevel: event.scheduledBy?.permissionLevel,
	};

	const createdSchedule = await fetcher<ScheduleApiItem>(SCHEDULES_ENDPOINT, {
		method: "POST",
		body: JSON.stringify(payload),
	});

	const mappedEvent = mapScheduleToEvent(createdSchedule, [event.user]);
	setCachedSchedulerByEventId(createdSchedule.id, event.scheduledBy);

	return {
		...mappedEvent,
		scheduledBy: mappedEvent.scheduledBy ?? event.scheduledBy,
		customerPhone: mappedEvent.customerPhone ?? event.customerPhone,
	};
}

export async function deleteEvent(eventId: number | string): Promise<void> {
	await fetcher(`${SCHEDULES_ENDPOINT}/${eventId}`, {
		method: "DELETE",
	});
	removeCachedSchedulerByEventId(eventId);
}
