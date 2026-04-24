import { CheckIcon, Filter, RefreshCcw } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toggle } from "@/components/ui/toggle";
import {
	EVENT_PRIORITIES,
	EVENT_STATUSES,
	EVENT_TYPES,
} from "@/features/calendar/constants";
import {
	PRIORITY_LABELS_PT_BR,
	STATUS_LABELS_PT_BR,
	TYPE_LABELS_PT_BR,
} from "@/features/calendar/constants/event-form.constants";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import type {
	TEventPriority,
	TEventStatus,
	TEventType,
} from "@/features/calendar/types";

export default function FilterEvents() {
	const {
		selectedStatuses,
		selectedTypes,
		selectedPriorities,
		filterEventsBySelectedStatus,
		filterEventsBySelectedType,
		filterEventsBySelectedPriority,
		clearFilter,
	} = useCalendar();

	const hasActiveFilters =
		selectedStatuses.length > 0 ||
		selectedTypes.length > 0 ||
		selectedPriorities.length > 0;

	const renderSelectedCheck = (isSelected: boolean) =>
		isSelected ? (
			<span className="text-blue-500">
				<CheckIcon className="size-4" />
			</span>
		) : null;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Toggle variant="outline" className="cursor-pointer w-fit">
					<Filter className="h-4 w-4" />
				</Toggle>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-[240px]">
				<DropdownMenuLabel>Status da negociacao</DropdownMenuLabel>
				{EVENT_STATUSES.map((status: TEventStatus) => (
					<DropdownMenuItem
						key={status}
						className="flex items-center justify-between gap-2 cursor-pointer"
						onClick={(e) => {
							e.preventDefault();
							filterEventsBySelectedStatus(status);
						}}
					>
						<span>{STATUS_LABELS_PT_BR[status]}</span>
						{renderSelectedCheck(selectedStatuses.includes(status))}
					</DropdownMenuItem>
				))}

				<DropdownMenuSeparator />
				<DropdownMenuLabel>Tipo</DropdownMenuLabel>
				{EVENT_TYPES.map((type: TEventType) => (
					<DropdownMenuItem
						key={type}
						className="flex items-center justify-between gap-2 cursor-pointer"
						onClick={(e) => {
							e.preventDefault();
							filterEventsBySelectedType(type);
						}}
					>
						<span>{TYPE_LABELS_PT_BR[type]}</span>
						{renderSelectedCheck(selectedTypes.includes(type))}
					</DropdownMenuItem>
				))}

				<DropdownMenuSeparator />
				<DropdownMenuLabel>Importancia do lead</DropdownMenuLabel>
				{EVENT_PRIORITIES.map((priority: TEventPriority) => (
					<DropdownMenuItem
						key={priority}
						className="flex items-center justify-between gap-2 cursor-pointer"
						onClick={(e) => {
							e.preventDefault();
							filterEventsBySelectedPriority(priority);
						}}
					>
						<span>{PRIORITY_LABELS_PT_BR[priority]}</span>
						{renderSelectedCheck(selectedPriorities.includes(priority))}
					</DropdownMenuItem>
				))}

				<DropdownMenuSeparator />
				<DropdownMenuItem
					disabled={!hasActiveFilters}
					className="flex gap-2 cursor-pointer"
					onClick={(e) => {
						e.preventDefault();
						clearFilter();
					}}
				>
					<RefreshCcw className="size-3.5" />
					Limpar filtros
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
