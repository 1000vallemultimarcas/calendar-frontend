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
<<<<<<< HEAD
  return event?.user?.id ?? "";
=======
  return event?.user?.id ?? users[0]?.id ?? "";
>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)
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
<<<<<<< HEAD
    type: event?.type ?? "visit",
    priority: event?.priority ?? "normal",
    userId: defaultUserId,
    color: event?.color ?? getColorByType(event?.type ?? "visit"),
=======
    type: event?.type ?? "appointment",
    priority: event?.priority ?? "normal",
    userId: defaultUserId,
    color: event?.color ?? getColorByType(event?.type ?? "appointment"),
>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)
  };
}

export function buildFormattedEvent({
  values,
  event,
  isEditing,
  users,
}: BuildFormattedEventParams): IEvent {
<<<<<<< HEAD
  const selectedUser = values.userId
    ? users.find((user) => user.id === values.userId)
    : undefined;
  const eventUser = selectedUser ?? event?.user ?? users[0];

  if (!eventUser) {
    throw new Error("No available user was found to associate with the event");
=======
  const selectedUser = users.find((user) => user.id === values.userId);
  const eventUser = selectedUser ?? event?.user;

  if (!eventUser) {
    throw new Error("Responsible user not found");
>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)
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
<<<<<<< HEAD
    attendantId: selectedUser?.id ?? event?.attendantId ?? eventUser.id,
    customerId: event?.customerId,
=======
>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)
    color: getColorByType(values.type),
  };
}
