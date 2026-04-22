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
  switch (status.toUpperCase()) {
    case "CONFIRMED":
      return "confirmed";
    case "CANCELLED":
      return "cancelled";
    case "ATTENDED":
      return "attended";
    case "RESCHEDULED":
      return "rescheduled";
    case "NOT_ATTENDED":
      return "not_attended";
    case "SCHEDULED":
    default:
      return "scheduled";
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
    priority: "normal",
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
    case "confirmed":
      return "CONFIRMED";
    case "cancelled":
      return "CANCELLED";
    case "attended":
      return "ATTENDED";
    case "rescheduled":
      return "RESCHEDULED";
    case "not_attended":
      return "NOT_ATTENDED";
    case "scheduled":
    default:
      return "SCHEDULED";
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
