"use client";

import type React from "react";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { toast } from "sonner";
import { useCalendarFilterState } from "@/features/calendar/hooks/use-calendar-filter-state";
import { useCalendarSettingsState } from "@/features/calendar/hooks/use-calendar-settings-state";
import type { IEvent, IUser } from "@/features/calendar/interfaces";
import { canManageEvent } from "@/features/calendar/lib/permissions";
import type { TCalendarView } from "@/features/calendar/types";
import { ApiError } from "@/lib/api";
import { useCalendarEventState } from "../hooks/use-calendar-event-state";
import { getEvents, getUsers, mapViewToSchedulePeriod } from "../requests";
import { useAuth } from "./authContext";
import type { ICalendarContext } from "./calendar-context.types";

const CalendarContext = createContext({} as ICalendarContext);

type CalendarProviderProps = {
	children: React.ReactNode;
	users: IUser[];
	events: IEvent[];
	view?: TCalendarView;
	badge?: "dot" | "colored";
};

function deriveUsersFromEvents(eventsList: IEvent[]): IUser[] {
	const byId = new Map<string, IUser>();

	for (const event of eventsList) {
		if (!event.user?.id) {
			continue;
		}

		if (!byId.has(event.user.id)) {
			byId.set(event.user.id, event.user);
		}
	}

	return Array.from(byId.values());
}

export function CalendarProvider({
	children,
	users,
	events,
	badge = "colored",
	view = "day",
}: CalendarProviderProps) {
	const { token, user, isManager, canManageCalendar } = useAuth();
	const currentUserId = user?.userId;
	const [selectedDate, setSelectedDateState] = useState(new Date());
	const [isLoadingEvents, setIsLoadingEvents] = useState(false);
	const [calendarUsers, setCalendarUsers] = useState<IUser[]>(users);

	const {
		allEvents,
		setEvents,
		addEvent: addEventRaw,
		updateEvent: updateEventRaw,
		removeEvent: removeEventRaw,
		restoreEvent: restoreEventRaw,
		purgeEvent: purgeEventRaw,
	} = useCalendarEventState({
		initialEvents: events,
	});

	const {
		badgeVariant,
		setBadgeVariant,
		view: currentView,
		setView,
		use24HourFormat,
		toggleTimeFormat,
		agendaModeGroupBy,
		setAgendaModeGroupBy,
	} = useCalendarSettingsState({
		initialBadge: badge,
		initialView: view,
	});

	const activeEvents = useMemo(
		() => allEvents.filter((event) => !event.deletedAt),
		[allEvents],
	);

	const deletedEvents = useMemo(
		() => allEvents.filter((event) => !!event.deletedAt),
		[allEvents],
	);

	const addEvent = useCallback(
		(event: IEvent) => {
			const now = Date.now();
			const start = new Date(event.startDate).getTime();
			const end = new Date(event.endDate).getTime();

			if (Number.isNaN(start) || Number.isNaN(end)) {
				toast.error("Data invalida para o agendamento.");
				return;
			}

			if (start < now) {
				toast.error(
					"Data e hora inicial nao podem ser retroativas ao momento atual.",
				);
				return;
			}

			if (end <= start) {
				toast.error("Data final deve ser maior que a data inicial.");
				return;
			}

			if (!canManageCalendar) {
				toast.error("Perfil atendente possui acesso somente leitura.");
				return;
			}

			if (!canManageEvent(event.user?.id, currentUserId, isManager)) {
				toast.error(
					"Somente perfis com permissao de gestao podem criar eventos.",
				);
				return;
			}

			addEventRaw(event);
		},
		[addEventRaw, canManageCalendar, currentUserId, isManager],
	);

	const updateEvent = useCallback(
		(event: IEvent) => {
			const now = Date.now();
			const start = new Date(event.startDate).getTime();
			const end = new Date(event.endDate).getTime();

			if (Number.isNaN(start) || Number.isNaN(end)) {
				toast.error("Data invalida para o agendamento.");
				return;
			}

			if (start < now) {
				toast.error(
					"Data e hora inicial nao podem ser retroativas ao momento atual.",
				);
				return;
			}

			if (end <= start) {
				toast.error("Data final deve ser maior que a data inicial.");
				return;
			}

			if (!canManageCalendar) {
				toast.error("Perfil atendente possui acesso somente leitura.");
				return;
			}

			const existingEvent = allEvents.find(
				(current) => current.id === event.id,
			);
			const ownerId = existingEvent?.user?.id ?? event.user?.id;

			if (!canManageEvent(ownerId, currentUserId, isManager)) {
				toast.error(
					"Somente perfis com permissao de gestao podem editar eventos.",
				);
				return;
			}

			updateEventRaw(event);
		},
		[allEvents, canManageCalendar, currentUserId, isManager, updateEventRaw],
	);

	const removeEvent = useCallback(
		(eventId: number, deletedBy?: string) => {
			if (!canManageCalendar) {
				toast.error("Perfil atendente possui acesso somente leitura.");
				return;
			}

			const event = allEvents.find((current) => current.id === eventId);
			const ownerId = event?.user?.id;

			if (!canManageEvent(ownerId, currentUserId, isManager)) {
				toast.error(
					"Somente perfis com permissao de gestao podem excluir eventos.",
				);
				return;
			}

			removeEventRaw(eventId, deletedBy);
		},
		[allEvents, canManageCalendar, currentUserId, isManager, removeEventRaw],
	);

	const restoreEvent = useCallback(
		(eventId: number) => {
			if (!canManageCalendar) {
				toast.error("Perfil atendente possui acesso somente leitura.");
				return;
			}

			const event = allEvents.find((current) => current.id === eventId);
			const ownerId = event?.user?.id;

			if (!canManageEvent(ownerId, currentUserId, isManager)) {
				toast.error(
					"Somente perfis com permissao de gestao podem restaurar eventos.",
				);
				return;
			}

			restoreEventRaw(eventId);
		},
		[allEvents, canManageCalendar, currentUserId, isManager, restoreEventRaw],
	);

	const purgeEvent = useCallback(
		(eventId: number) => {
			if (!canManageCalendar) {
				toast.error("Perfil atendente possui acesso somente leitura.");
				return;
			}

			const event = allEvents.find((current) => current.id === eventId);
			const ownerId = event?.user?.id;

			if (!canManageEvent(ownerId, currentUserId, isManager)) {
				toast.error(
					"Somente perfis com permissao de gestao podem remover eventos.",
				);
				return;
			}

			purgeEventRaw(eventId);
		},
		[allEvents, canManageCalendar, currentUserId, isManager, purgeEventRaw],
	);

	const {
		selectedUserIds,
		setSelectedUserIds,
		selectedColors,
		selectedStatuses,
		selectedTypes,
		selectedPriorities,
		filterEventsBySelectedColors,
		filterEventsBySelectedStatus,
		filterEventsBySelectedType,
		filterEventsBySelectedPriority,
		filterEventsBySelectedUser,
		filteredEvents,
		clearFilter,
	} = useCalendarFilterState({
		events: activeEvents,
	});

	const setSelectedDate = (date: Date | undefined) => {
		if (!date) return;
		setSelectedDateState(date);
	};

	useEffect(() => {
		let isActive = true;

		async function syncEvents() {
			if (!token) {
				setCalendarUsers([]);
				setEvents([]);
				setIsLoadingEvents(false);
				return;
			}

			setIsLoadingEvents(true);

			try {
				const nextUsers = await getUsers();
				const nextEvents = await getEvents({
					period: mapViewToSchedulePeriod(currentView),
					referenceDate: selectedDate,
					users: nextUsers,
				});
				const fallbackUsers =
					nextUsers.length > 0 ? nextUsers : deriveUsersFromEvents(nextEvents);

				if (isActive) {
					setCalendarUsers(fallbackUsers);
					setEvents(nextEvents);
				}
			} catch (error) {
				console.error("Erro ao carregar agendamentos:", error);
				if (error instanceof ApiError && error.status === 403) {
					toast.error(
						"Sem permissao para acessar a agenda com o token atual.",
					);
				} else {
					toast.error(
						"Sem conexao com o backend. Verifique se a API esta online.",
					);
				}
			} finally {
				if (isActive) {
					setIsLoadingEvents(false);
				}
			}
		}

		void syncEvents();

		return () => {
			isActive = false;
		};
	}, [currentView, selectedDate, setEvents, token]);

	const value: ICalendarContext = {
		selectedDate,
		setSelectedDate,
		selectedUserIds,
		setSelectedUserIds,
		badgeVariant,
		setBadgeVariant,
		users: calendarUsers,
		selectedColors,
		selectedStatuses,
		selectedTypes,
		selectedPriorities,
		filterEventsBySelectedColors,
		filterEventsBySelectedStatus,
		filterEventsBySelectedType,
		filterEventsBySelectedPriority,
		filterEventsBySelectedUser,
		events: filteredEvents,
		deletedEvents,
		isLoadingEvents,
		view: currentView,
		use24HourFormat,
		toggleTimeFormat,
		setView,
		agendaModeGroupBy,
		setAgendaModeGroupBy,
		addEvent,
		updateEvent,
		removeEvent,
		restoreEvent,
		purgeEvent,
		clearFilter,
	};

	return (
		<CalendarContext.Provider value={value}>
			{children}
		</CalendarContext.Provider>
	);
}

export function useCalendar(): ICalendarContext {
	const context = useContext(CalendarContext);

	if (!context) {
		throw new Error("useCalendar must be used within a CalendarProvider.");
	}

	return context;
}
