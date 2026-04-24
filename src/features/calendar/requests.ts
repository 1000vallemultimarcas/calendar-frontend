import { format } from "date-fns";
import type { ICustomer, IEvent, IUser } from "@/features/calendar/interfaces";
import { getColorByType } from "@/features/calendar/lib/event-form.utils";
import { withUniqueUserColors, withUserColor } from "@/features/calendar/lib/user-color.utils";
import type {
  TCalendarView,
  TEventStatus,
  TEventType,
} from "@/features/calendar/types";
import { fetcher } from "@/lib/api";

export type SchedulePeriod = "day" | "week" | "month" | "year";

type ScheduleApiItem = {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  createdAt?: string;
  updatedAt?: string;
  description: string;
  customerId: number;
  customerPhone?: string | null;
  attendantId: string;
  status: string;
  type: string;
  leadImportance?: string;
  priority?: string;
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

type CustomersApiResponse = CustomerApiItem[] | { customers: CustomerApiItem[] };

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
const RETROACTIVE_GRACE_WINDOW_MS = 60 * 1000;
const MIN_START_OFFSET_MS = 30 * 1000;

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

function normalizeCustomersResponse(payload: CustomersApiResponse): ICustomer[] {
  const items = Array.isArray(payload) ? payload : payload.customers;

  return items.map((customer) => ({
    id: customer.id,
    name: customer.name,
    phone: customer.phone ?? null,
  }));
}

function normalizeStatus(status: string): TEventStatus {
  const normalized = status
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "NOT_CONTACTED":
    case "NAO_ATENDIDO":
    case "NOT_ATTENDED":
      return "not_contacted";
    case "IN_NEGOTIATION":
    case "EM_NEGOCIACAO":
      return "in_negotiation";
    case "NOT_READ":
    case "NAO_LIDO":
      return "not_read";
    case "FINISHED_SOLD":
    case "FINALIZADO_VENDIDO":
    case "CONFIRMED":
    case "ATTENDED":
      return "finished_sold";
    case "FINISHED_NOT_SOLD":
    case "FINALIZADO_NAO_VENDIDO":
    case "CANCELLED":
      return "finished_not_sold";
    case "RESCHEDULED":
    case "SCHEDULED":
    default:
      return "scheduled";
  }
}

function normalizePriority(priority?: string): "frio" | "morno" | "quente" {
  if (!priority) {
    return "morno";
  }

  const normalized = priority
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");

  switch (normalized) {
    case "FRIO":
    case "LOW":
    case "BAIXA":
      return "frio";
    case "QUENTE":
    case "HIGH":
    case "URGENT":
    case "ALTA":
    case "URGENTE":
      return "quente";
    case "MORNO":
    case "NORMAL":
    default:
      return "morno";
  }
}

function normalizeType(type: string): TEventType {
  switch (type.toUpperCase()) {
    case "TEST_DRIVE":
      return "test_drive";
    case "VISIT":
      return "visit";
    case "MEETING":
      return "meeting";
    case "FOLLOW_UP":
      return "follow_up";
    case "DELIVERY":
      return "delivery";
    case "PERSONAL":
      return "personal";
    case "WORK":
      return "follow_up";
    case "APPOINTMENT":
      return "follow_up";
    default:
      return "visit";
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
    case "month":
    default:
      return "month";
  }
}

function mapScheduleToEvent(schedule: ScheduleApiItem, users: IUser[]): IEvent {
  const type = normalizeType(schedule.type);
  const fallbackUserName = schedule.attendantId
    ? `Responsável ${schedule.attendantId.slice(0, 8)}`
    : "Responsável";

  return {
    id: schedule.id,
    title: schedule.title,
    description: schedule.description,
    startDate: schedule.startDate,
    endDate: schedule.endDate,
    createdAt: schedule.createdAt,
    updatedAt: schedule.updatedAt,
    status: normalizeStatus(schedule.status),
    type,
    priority: normalizePriority(schedule.leadImportance ?? schedule.priority),
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
    case "follow_up":
    case "delivery":
      return "VISIT";
    case "visit":
      return "VISIT";
    case "meeting":
      return "MEETING";
    case "personal":
      // Backend enum does not accept PERSONAL; fallback to VISIT.
      return "VISIT";
    default:
      return "VISIT";
  }
}

function mapEventStatusToApi(status: TEventStatus): string {
  switch (status) {
    case "not_contacted":
      return "NOT_CONTACTED";
    case "in_negotiation":
      return "IN_NEGOTIATION";
    case "not_read":
      return "NOT_READ";
    case "finished_sold":
      return "FINISHED_SOLD";
    case "finished_not_sold":
      return "FINISHED_NOT_SOLD";
    case "scheduled":
    default:
      return "SCHEDULED";
  }
}

function mapEventPriorityToApi(priority: IEvent["priority"]): string {
  switch (priority) {
    case "frio":
      return "FRIO";
    case "quente":
      return "QUENTE";
    case "morno":
    default:
      return "MORNO";
  }
}

export async function getUsers(): Promise<IUser[]> {
  const payload = await fetcher<UsersApiResponse>(USERS_ENDPOINT);
  return normalizeUsersResponse(payload);
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

  const parsedStartDate = new Date(event.startDate);
  const parsedEndDate = new Date(event.endDate);

  if (
    Number.isNaN(parsedStartDate.getTime()) ||
    Number.isNaN(parsedEndDate.getTime())
  ) {
    throw new Error("Data/hora invalida para o agendamento.");
  }

  const durationMs = Math.max(
    parsedEndDate.getTime() - parsedStartDate.getTime(),
    30 * 60 * 1000,
  );
  const now = new Date();
  const isBarelyRetroactive =
    parsedStartDate.getTime() <= now.getTime() &&
    now.getTime() - parsedStartDate.getTime() <= RETROACTIVE_GRACE_WINDOW_MS;

  const normalizedStartDate = isBarelyRetroactive
    ? new Date(now.getTime() + MIN_START_OFFSET_MS)
    : parsedStartDate;
  const normalizedEndDate = isBarelyRetroactive
    ? new Date(normalizedStartDate.getTime() + durationMs)
    : parsedEndDate;

  const payload = {
    title: event.title,
    startDate: normalizedStartDate.toISOString(),
    endDate: normalizedEndDate.toISOString(),
    description: event.description,
    customerPhone,
    attendantId: event.attendantId ?? event.user.id,
    status: mapEventStatusToApi(event.status),
    leadImportance: mapEventPriorityToApi(event.priority),
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
