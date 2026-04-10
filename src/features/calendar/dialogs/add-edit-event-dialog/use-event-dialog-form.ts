import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
<<<<<<< HEAD
import { useAuth } from "@/features/calendar/contexts/authContext";
import { useDisclosure } from "@/features/calendar/hooks";
import { createEvent as createEventRequest } from "@/features/calendar/requests";
=======
import { useDisclosure } from "@/features/calendar/hooks";
>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)
import { eventSchema, type TEventFormData } from "@/features/calendar/schemas";
import { EVENT_FORM_TEXTS_PT_BR } from "@/features/calendar/constants/event-form.constants";
import { getDefaultFormValues, getDefaultUserId, buildFormattedEvent } from "./event-dialog.utils";
import { getInitialDates } from "@/features/calendar/lib/event-form.utils";
import type { AddEditEventDialogProps } from "./event-dialog.types";

export function useEventDialogForm({
  event,
  startDate,
  startTime,
}: Pick<AddEditEventDialogProps, "event" | "startDate" | "startTime">) {
  const { addEvent, updateEvent, users } = useCalendar();
<<<<<<< HEAD
  const { user, isManager, isEmployee } = useAuth();
  const { isOpen, onClose, onOpen, onToggle, setIsOpen } = useDisclosure();
  const isEditing = !!event;

  const currentUserId = user?.userId;
  const isUserSelectionDisabled = !isManager && !!currentUserId;

=======
  const { isOpen, onClose, onToggle } = useDisclosure();
  const isEditing = !!event;

>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)
  const initialDates = useMemo(
    () =>
      getInitialDates({
        startDate,
        startTime,
        event,
        isEditing,
      }),
    [event, isEditing, startDate, startTime],
  );

<<<<<<< HEAD
  const defaultUserId = isUserSelectionDisabled
    ? currentUserId ?? getDefaultUserId(users, event)
    : getDefaultUserId(users, event);
=======
  const defaultUserId = getDefaultUserId(users, event);
>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: getDefaultFormValues({
      event,
      initialDates,
      defaultUserId,
    }),
  });

  useEffect(() => {
    form.reset(
      getDefaultFormValues({
        event,
        initialDates,
        defaultUserId,
      }),
    );
  }, [event, form, initialDates, defaultUserId]);

<<<<<<< HEAD
  const onSubmit = async (values: TEventFormData) => {
    try {
      const formattedEvent = buildFormattedEvent({
        values: {
          ...values,
          userId:
            !isManager && isEmployee && currentUserId
              ? currentUserId
              : values.userId,
        },
=======
  const onSubmit = (values: TEventFormData) => {
    try {
      const formattedEvent = buildFormattedEvent({
        values,
>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)
        event,
        isEditing,
        users,
      });

      if (isEditing) {
        updateEvent(formattedEvent);
        toast.success(EVENT_FORM_TEXTS_PT_BR.editSuccess);
      } else {
<<<<<<< HEAD
        const createdEvent = await createEventRequest(formattedEvent);
        addEvent(createdEvent);
=======
        addEvent(formattedEvent);
>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)
        toast.success(EVENT_FORM_TEXTS_PT_BR.createSuccess);
      }

      onClose();
      form.reset();
    } catch (error) {
      console.error(
        `Erro ao ${isEditing ? "editar" : "criar"} agendamento:`,
        error,
      );
      toast.error(
        isEditing
          ? EVENT_FORM_TEXTS_PT_BR.editError
          : EVENT_FORM_TEXTS_PT_BR.createError,
      );
    }
  };

  return {
    form,
    isOpen,
<<<<<<< HEAD
    setIsOpen,
    onClose,
    onOpen,
=======
    onClose,
>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)
    onToggle,
    isEditing,
    onSubmit,
    users,
<<<<<<< HEAD
    isUserSelectionDisabled,
    currentUserId,
    currentUserName: user?.name,
=======
>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)
  };
}
