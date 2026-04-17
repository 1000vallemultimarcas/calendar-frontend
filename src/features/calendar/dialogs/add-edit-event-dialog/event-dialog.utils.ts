import { format } from "date-fns";
import { getColorByType } from "@/features/calendar/lib/event-form.utils";
import type { IEvent, IUser } from "@/features/calendar/interfaces";
import type { TEventFormData } from "@/features/calendar/schemas";

interface GetDefaultFormValuesParams {
  event?: IEvent;
  initialDates: {
    startDate: Date;
    endDate: Date;
  };
  defaultUserId: string;
}

interface BuildFormattedEventParams {
  values: TEventFormData;
  event?: IEvent;
  isEditing: boolean;
  users: IUser[];
}

export function getDefaultUserId(users: IUser[], event?: IEvent) {
  return event?.user?.id ?? users[0]?.id ?? "";
}

export function getDefaultFormValues({
  event,
  initialDates,
  defaultUserId,
}: GetDefaultFormValuesParams): TEventFormData {
  return {
    title: event?.title ?? "",
    description: event?.description ?? "",
    startDate: initialDates.startDate,
    endDate: initialDates.endDate,
    status: event?.status ?? "scheduled",
    type: event?.type ?? "visit",
    priority: event?.priority ?? "normal",
    userId: defaultUserId,
    customerId: event?.customerId ? String(event.customerId) : undefined,
    customerPhone: event?.customerPhone ?? "",
    color: event?.color ?? getColorByType(event?.type ?? "visit"),
  };
}

export function buildFormattedEvent({
  values,
  event,
  isEditing,
  users,
}: BuildFormattedEventParams): IEvent {
  const selectedUser = values.userId
    ? users.find((user) => user.id === values.userId)
    : undefined;
  const eventUser = selectedUser ?? event?.user ?? users[0];

  if (!eventUser) {
    throw new Error("No available user was found to associate with the event");
  }

  return {
    id: isEditing ? event?.id ?? 0 : Math.floor(Math.random() * 1000000),
    title: values.title,
    description: values.description,
    startDate: format(values.startDate, "yyyy-MM-dd'T'HH:mm:ss"),
    endDate: format(values.endDate, "yyyy-MM-dd'T'HH:mm:ss"),
    status: values.status,
    type: values.type,
    priority: values.priority,
    user: eventUser,
    attendantId: selectedUser?.id ?? event?.attendantId ?? eventUser.id,
    customerId: values.customerId ? Number(values.customerId) : event?.customerId,
    customerPhone: values.customerPhone ?? event?.customerPhone,
    scheduledBy: event?.scheduledBy,
    color: getColorByType(values.type),
  };
}
