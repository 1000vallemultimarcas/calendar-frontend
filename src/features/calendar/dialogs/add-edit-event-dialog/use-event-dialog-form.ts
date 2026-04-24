import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { EVENT_FORM_TEXTS_PT_BR } from "@/features/calendar/constants/event-form.constants";
import { useAuth } from "@/features/calendar/contexts/authContext";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { useDisclosure } from "@/features/calendar/hooks";
import { getInitialDates } from "@/features/calendar/lib/event-form.utils";
import type { ExternalCalendarPrefill } from "@/features/calendar/lib/external-calendar-query";
import { canManageEvent } from "@/features/calendar/lib/permissions";
import { withUserColor } from "@/features/calendar/lib/user-color.utils";
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
	const submitLockRef = useRef(false);

	const currentUserId = user?.userId;
	const isUserSelectionDisabled = !isManager && !!currentUserId;
	const effectiveUsers = useMemo(() => {
		if (!user?.userId) {
			return users;
		}

		if (users.some((current) => current.id === user.userId)) {
			return users;
		}

		const fallbackUser = withUserColor({
			id: user.userId,
			name: user.name ?? "Usuario do sistema",
			picturePath: null,
		});

		return [fallbackUser, ...users];
	}, [user?.name, user?.userId, users]);

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
		? effectiveUsers.some((current) => current.id === currentUserId)
			? (currentUserId ?? getDefaultUserId(effectiveUsers, event))
			: getDefaultUserId(effectiveUsers, event)
		: getDefaultUserId(effectiveUsers, event);

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
		let shouldReloadAfterCreate = false;

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
				return false;
			}

			if (values.endDate.getTime() <= values.startDate.getTime()) {
				form.setError("endDate", {
					type: "manual",
					message: "Data final deve ser maior que a data inicial",
				});
				toast.error("Data final deve ser maior que a data inicial");
				return false;
			}

			if (!canManageCalendar) {
				toast.error("Perfil atendente possui acesso somente leitura.");
				return false;
			}

			if (
				isEditing &&
				!canManageEvent(event?.user?.id, currentUserId, isManager)
			) {
				toast.error(
					"Somente perfis com permissao de gestao podem editar eventos.",
				);
				return false;
			}

			const formattedEvent = buildFormattedEvent({
				values,
				event,
				isEditing,
				users: effectiveUsers,
			});

			if (!isEditing) {
				const selectedManager = values.managerId
					? effectiveUsers.find((current) => current.id === values.managerId)
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
					return false;
				}

				if (submitLockRef.current) {
					return false;
				}

				submitLockRef.current = true;
				try {
					const createdEvent = await createEventRequest(formattedEvent);
					addEvent(createdEvent);
					toast.success(EVENT_FORM_TEXTS_PT_BR.createSuccess, {
						description: "A pagina sera atualizada em 5 segundos.",
						duration: 5000,
					});
					shouldReloadAfterCreate = true;
				} finally {
					submitLockRef.current = false;
				}
			}

			onClose();
			form.reset();

			if (shouldReloadAfterCreate && typeof window !== "undefined") {
				window.setTimeout(() => {
					window.location.reload();
				}, 5000);
			}
			return true;
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
			return false;
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
		users: effectiveUsers,
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
