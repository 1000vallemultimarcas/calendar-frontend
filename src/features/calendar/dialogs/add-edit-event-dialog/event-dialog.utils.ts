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
    type: event?.type ?? "appointment",
    priority: event?.priority ?? "normal",
    userId: defaultUserId,
    color: event?.color ?? getColorByType(event?.type ?? "appointment"),
  };
}

export function buildFormattedEvent({
  values,
  event,
  isEditing,
  users,
}: BuildFormattedEventParams): IEvent {
  const selectedUser = users.find((user) => user.id === values.userId);
  const eventUser = selectedUser ?? event?.user;

  if (!eventUser) {
    throw new Error("Responsible user not found");
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
    color: getColorByType(values.type),
  };
}
