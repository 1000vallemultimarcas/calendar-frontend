import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { useAuth } from "@/features/calendar/contexts/authContext";
import { useDisclosure } from "@/features/calendar/hooks";
import { createEvent as createEventRequest } from "@/features/calendar/requests";
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
  const { user, isManager, isEmployee } = useAuth();
  const { isOpen, onClose, onOpen, onToggle, setIsOpen } = useDisclosure();
  const isEditing = !!event;

  const currentUserId = user?.userId;
  const isUserSelectionDisabled = !isManager && !!currentUserId;

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

  const defaultUserId = isUserSelectionDisabled
    ? currentUserId ?? getDefaultUserId(users, event)
    : getDefaultUserId(users, event);

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
        event,
        isEditing,
        users,
      });

      if (isEditing) {
        updateEvent(formattedEvent);
        toast.success(EVENT_FORM_TEXTS_PT_BR.editSuccess);
      } else {
        const createdEvent = await createEventRequest(formattedEvent);
        addEvent(createdEvent);
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
    setIsOpen,
    onClose,
    onOpen,
    onToggle,
    isEditing,
    onSubmit,
    users,
    isUserSelectionDisabled,
    currentUserId,
    currentUserName: user?.name,
  };
}
