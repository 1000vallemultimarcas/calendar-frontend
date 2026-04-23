import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EVENT_FORM_TEXTS_PT_BR } from "@/features/calendar/constants/event-form.constants";
import { useAuth } from "@/features/calendar/contexts/authContext";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { useDisclosure } from "@/features/calendar/hooks";
import { getInitialDates } from "@/features/calendar/lib/event-form.utils";
import type { ExternalCalendarPrefill } from "@/features/calendar/lib/external-calendar-query";
import { canManageEvent } from "@/features/calendar/lib/permissions";
import { createEvent as createEventRequest } from "@/features/calendar/requests";
import { eventSchema, type TEventFormData } from "@/features/calendar/schemas";
import type { AddEditEventDialogProps } from "./event-dialog.types";
import {
	buildFormattedEvent,
	getDefaultFormValues,
	getDefaultUserId,
} from "./event-dialog.utils";

export function useEventDialogForm({
	event,
	startDate,
	startTime,
	prefill,
}: Pick<
	AddEditEventDialogProps,
	"event" | "startDate" | "startTime" | "prefill"
>) {
	const { addEvent, updateEvent, users } = useCalendar();
	const { user, isManager, canManageCalendar } = useAuth();
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
		? users.some((current) => current.id === currentUserId)
			? (currentUserId ?? getDefaultUserId(users, event))
			: getDefaultUserId(users, event)
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
		const baseValues = getDefaultFormValues({
			event,
			initialDates,
			defaultUserId,
		});

		form.reset(
			applyExternalPrefill(baseValues, prefill, {
				isEditing,
			}),
		);
	}, [defaultUserId, event, form, initialDates, isEditing, prefill]);

	const onSubmit = async (values: TEventFormData) => {
		try {
			const now = new Date();
			now.setSeconds(0, 0);

			if (values.startDate.getTime() < now.getTime()) {
				form.setError("startDate", {
					type: "manual",
					message:
						"Data e hora inicial nao podem ser retroativas ao momento atual",
				});
				toast.error(
					"Data e hora inicial nao podem ser retroativas ao momento atual",
				);
				return;
			}

			if (values.endDate.getTime() <= values.startDate.getTime()) {
				form.setError("endDate", {
					type: "manual",
					message: "Data final deve ser maior que a data inicial",
				});
				toast.error("Data final deve ser maior que a data inicial");
				return;
			}

			if (!canManageCalendar) {
				toast.error("Perfil atendente possui acesso somente leitura.");
				return;
			}

			if (
				isEditing &&
				!canManageEvent(event?.user?.id, currentUserId, isManager)
			) {
				toast.error(
					"Somente perfis com permissao de gestao podem editar eventos.",
				);
				return;
			}

			const formattedEvent = buildFormattedEvent({
				values,
				event,
				isEditing,
				users,
			});

			if (!isEditing) {
				const selectedManager = values.managerId
					? users.find((current) => current.id === values.managerId)
					: undefined;

				formattedEvent.scheduledBy = selectedManager
					? {
							id: selectedManager.id,
							name: selectedManager.name,
						}
					: {
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
				if (
					!canManageEvent(formattedEvent.user?.id, currentUserId, isManager)
				) {
					toast.error(
						"Somente perfis com permissao de gestao podem criar eventos.",
					);
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
			const fallbackMessage = isEditing
				? EVENT_FORM_TEXTS_PT_BR.editError
				: EVENT_FORM_TEXTS_PT_BR.createError;
			const errorMessage =
				error instanceof Error && error.message
					? `${fallbackMessage}: ${error.message}`
					: fallbackMessage;
			toast.error(errorMessage);
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
	};
}

function applyExternalPrefill(
	baseValues: TEventFormData,
	prefill: ExternalCalendarPrefill | undefined,
	options: { isEditing: boolean },
): TEventFormData {
	if (!prefill || options.isEditing) {
		return baseValues;
	}

	const nextValues: TEventFormData = {
		...baseValues,
	};

	if (prefill.status) {
		nextValues.status = prefill.status;
	}

	if (prefill.type) {
		nextValues.type = prefill.type;
	}

	if (prefill.priority) {
		nextValues.priority = prefill.priority;
	}

	if (prefill.customerPhone) {
		nextValues.customerPhone = prefill.customerPhone;
	}

	if (prefill.customerId) {
		nextValues.customerId = prefill.customerId;
	}

	if (prefill.title) {
		nextValues.title = prefill.title;
	}

	if (prefill.description) {
		nextValues.description = prefill.description;
	}

	if (prefill.startDate) {
		const nextStartDate = prefill.startDate;
		const oneHourInMs = 60 * 60 * 1000;
		const defaultEndDate = new Date(nextStartDate.getTime() + oneHourInMs);

		nextValues.startDate = nextStartDate;
		nextValues.endDate =
			baseValues.endDate.getTime() > nextStartDate.getTime()
				? baseValues.endDate
				: defaultEndDate;
	}

	return nextValues;
}
