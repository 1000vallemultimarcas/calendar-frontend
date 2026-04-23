"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
	slideFromLeft,
	slideFromRight,
	transition,
} from "@/features/calendar/animations";
import { useAuth } from "@/features/calendar/contexts/authContext";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { AddEditEventDialog } from "@/features/calendar/dialogs/add-edit-event-dialog";
import { DeletedEventsDialog } from "@/features/calendar/dialogs/deleted-events-dialog";
import { DateNavigator } from "@/features/calendar/header/date-navigator";
import FilterEvents from "@/features/calendar/header/filter";
import { TodayButton } from "@/features/calendar/header/today-button";
import { parseExternalCalendarQuery } from "@/features/calendar/lib/external-calendar-query";
import Views from "./view-tabs";

const EXTERNAL_SCHEDULE_QUERY_KEYS = [
	"agendar",
	"status",
	"negotiationStatus",
	"negotiation_status",
	"statusNegociacao",
	"tipo",
	"type",
	"stage",
	"etapa",
	"negotiationStage",
	"negotiation_stage",
	"etapaNegociacao",
	"prioridade",
	"priority",
	"importance",
	"importancia",
	"leadImportance",
	"lead_importance",
	"telefone",
	"customerPhone",
	"phone",
	"customerId",
	"idCliente",
	"titulo",
	"title",
	"descricao",
	"description",
	"dataInicial",
	"startDate",
	"start_date",
] as const;

function normalizeQueryKey(value: string) {
	return value
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[\s_-]+/g, "");
}

function removeExternalScheduleParams(searchParams: URLSearchParams) {
	const allowedKeys = new Set(
		EXTERNAL_SCHEDULE_QUERY_KEYS.map((key) => normalizeQueryKey(key)),
	);

	for (const key of Array.from(searchParams.keys())) {
		if (allowedKeys.has(normalizeQueryKey(key))) {
			searchParams.delete(key);
		}
	}
}

export function CalendarHeader() {
	const {
		view,
		events,
		selectedStatuses,
		selectedTypes,
		selectedPriorities,
		filterEventsBySelectedStatus,
		filterEventsBySelectedType,
		filterEventsBySelectedPriority,
	} = useCalendar();
	const { canManageCalendar, isAuthReady } = useAuth();
	const [isHydrated, setIsHydrated] = useState(false);
	const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const router = useRouter();
	const normalizedPathname =
		pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
	const isManagerRoute =
		normalizedPathname === "/calendar/gerente" ||
		normalizedPathname === "/calendar";
	const externalQuery = useMemo(
		() => parseExternalCalendarQuery(searchParams),
		[searchParams],
	);

	useEffect(() => {
		setIsHydrated(true);
	}, []);

	useEffect(() => {
		if (!isHydrated || !isAuthReady) return;

		const shouldOpenByUrl = externalQuery.shouldOpenScheduleDialog;
		const canOpenFromUrl = canManageCalendar && isManagerRoute;

		setIsScheduleDialogOpen(shouldOpenByUrl && canOpenFromUrl);

		if (shouldOpenByUrl && !canOpenFromUrl) {
			const nextParams = new URLSearchParams(searchParams.toString());
			removeExternalScheduleParams(nextParams);
			const nextQuery = nextParams.toString();
			const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
			router.replace(nextUrl, { scroll: false });
		}
	}, [
		canManageCalendar,
		externalQuery.shouldOpenScheduleDialog,
		isAuthReady,
		isHydrated,
		isManagerRoute,
		pathname,
		router,
		searchParams,
	]);

	useEffect(() => {
		if (!isHydrated || !isManagerRoute) return;

		if (
			externalQuery.filterStatus &&
			selectedStatuses[0] !== externalQuery.filterStatus
		) {
			filterEventsBySelectedStatus(externalQuery.filterStatus);
		}

		if (
			externalQuery.filterType &&
			selectedTypes[0] !== externalQuery.filterType
		) {
			filterEventsBySelectedType(externalQuery.filterType);
		}

		if (
			externalQuery.filterPriority &&
			selectedPriorities[0] !== externalQuery.filterPriority
		) {
			filterEventsBySelectedPriority(externalQuery.filterPriority);
		}
	}, [
		externalQuery.filterPriority,
		externalQuery.filterStatus,
		externalQuery.filterType,
		filterEventsBySelectedPriority,
		filterEventsBySelectedStatus,
		filterEventsBySelectedType,
		isHydrated,
		isManagerRoute,
		selectedPriorities,
		selectedStatuses,
		selectedTypes,
	]);

	const handleScheduleDialogOpenChange = (nextOpen: boolean) => {
		setIsScheduleDialogOpen(nextOpen);

		const nextParams = new URLSearchParams(searchParams.toString());
		if (nextOpen) {
			nextParams.set("agendar", "1");
		} else {
			removeExternalScheduleParams(nextParams);
		}

		const nextQuery = nextParams.toString();
		const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
		router.replace(nextUrl, { scroll: false });
	};

	return (
		<div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
			<motion.div
				className="flex items-center gap-3"
				variants={slideFromLeft}
				initial="initial"
				animate="animate"
				transition={transition}
			>
				<TodayButton />
				<DateNavigator view={view} events={events} />
			</motion.div>

			<motion.div
				className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-1"
				variants={slideFromRight}
				initial="initial"
				animate="animate"
				transition={transition}
			>
				<div className="options flex-wrap flex items-center gap-4 md:gap-2">
					<FilterEvents />
					<Views />
				</div>

				<div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-1">
					{isHydrated && canManageCalendar && <DeletedEventsDialog />}
					{isHydrated && canManageCalendar && isManagerRoute && (
						<AddEditEventDialog
							open={isScheduleDialogOpen}
							onOpenChange={handleScheduleDialogOpenChange}
							prefill={externalQuery.prefill}
						/>
					)}
				</div>
			</motion.div>
		</div>
	);
}
