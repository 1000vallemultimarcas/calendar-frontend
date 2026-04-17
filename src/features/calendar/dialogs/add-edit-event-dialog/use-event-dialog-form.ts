import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { useAuth } from "@/features/calendar/contexts/authContext";
import { useDisclosure } from "@/features/calendar/hooks";
import { createEvent as createEventRequest, getCustomers } from "@/features/calendar/requests";
import { eventSchema, type TEventFormData } from "@/features/calendar/schemas";
import { EVENT_FORM_TEXTS_PT_BR } from "@/features/calendar/constants/event-form.constants";
import {
  getDefaultFormValues,
  getDefaultUserId,
  buildFormattedEvent,
} from "./event-dialog.utils";
import { getInitialDates } from "@/features/calendar/lib/event-form.utils";
import { canManageEvent } from "@/features/calendar/lib/permissions";
import type { AddEditEventDialogProps } from "./event-dialog.types";
import type { ICustomer } from "@/features/calendar/interfaces";

export function useEventDialogForm({
  event,
  startDate,
  startTime,
}: Pick<AddEditEventDialogProps, "event" | "startDate" | "startTime">) {
  const { addEvent, updateEvent, users } = useCalendar();
  const { user, isManager, canManageCalendar } = useAuth();
  const { isOpen, onClose, onOpen, onToggle, setIsOpen } = useDisclosure();
  const isEditing = !!event;
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);

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

  useEffect(() => {
    let isActive = true;

    async function loadCustomers() {
      setIsLoadingCustomers(true);

      try {
        const nextCustomers = await getCustomers();
        if (isActive) {
          setCustomers(nextCustomers);
        }
      } catch (error) {
        if (isActive) {
          setCustomers([]);
        }

        console.warn("Falha ao carregar clientes:", error);
      } finally {
        if (isActive) {
          setIsLoadingCustomers(false);
        }
      }
    }

    void loadCustomers();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const subscription = form.watch((values, info) => {
      if (info.name !== "customerId") {
        return;
      }

      const selectedCustomer = customers.find(
        (customer) => String(customer.id) === values.customerId,
      );

      if (!selectedCustomer) {
        return;
      }

      if (selectedCustomer.phone) {
        form.setValue("customerPhone", selectedCustomer.phone, {
          shouldDirty: true,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [customers, form]);

  const onSubmit = async (values: TEventFormData) => {
    try {
      if (!canManageCalendar) {
        toast.error("Perfil atendente possui acesso somente leitura.");
        return;
      }

      if (isEditing && !canManageEvent(event?.user?.id, currentUserId, isManager)) {
        toast.error("Somente perfis com permissao de gestao podem editar eventos.");
        return;
      }

      const formattedEvent = buildFormattedEvent({
        values,
        event,
        isEditing,
        users,
      });

      if (!isEditing) {
        formattedEvent.scheduledBy = {
          id: user?.userId,
          name: user?.name ?? "Usuario do sistema",
          mail: user?.mail,
          permissionLevel: user?.permissionLevel,
        };
      }

      if (isEditing) {
        updateEvent(formattedEvent);
        toast.success(EVENT_FORM_TEXTS_PT_BR.editSuccess);
      } else {
        if (!canManageEvent(formattedEvent.user?.id, currentUserId, isManager)) {
          toast.error("Somente perfis com permissao de gestao podem criar eventos.");
          return;
        }

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
    customers,
    isLoadingCustomers,
    isUserSelectionDisabled,
    currentUserId,
    currentUserName: user?.name,
  };
}
