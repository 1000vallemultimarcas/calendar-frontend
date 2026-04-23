import type { ReadonlyURLSearchParams } from "next/navigation";
import type {
	TEventPriority,
	TEventStatus,
	TEventType,
} from "@/features/calendar/types";

type QuerySource = URLSearchParams | ReadonlyURLSearchParams;

export interface ExternalCalendarPrefill {
	status?: TEventStatus;
	type?: TEventType;
	priority?: TEventPriority;
	customerPhone?: string;
	customerId?: string;
	title?: string;
	description?: string;
	startDate?: Date;
}

export interface ExternalCalendarQueryData {
	shouldOpenScheduleDialog: boolean;
	filterStatus?: TEventStatus;
	filterType?: TEventType;
	filterPriority?: TEventPriority;
	prefill: ExternalCalendarPrefill;
}

function normalize(value: string | null) {
	return (value ?? "").trim().toLowerCase();
}

function compact(value: string | null) {
	return normalize(value)
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[\s-]+/g, "_");
}

function pickParam(searchParams: QuerySource, keys: string[]) {
	for (const key of keys) {
		const value = searchParams.get(key);
		if (value !== null && value.trim() !== "") {
			return value.trim();
		}
	}

	return undefined;
}

function normalizeStatus(input?: string): TEventStatus | undefined {
	const value = compact(input ?? null);
	if (!value) return undefined;

	if (value === "scheduled" || value === "agendado") return "scheduled";
	if (value === "confirmed" || value === "confirmado") return "confirmed";
	if (value === "cancelled" || value === "cancelado" || value === "canceled") {
		return "cancelled";
	}
	if (value === "attended" || value === "atendido") return "attended";
	if (value === "rescheduled" || value === "reagendado") return "rescheduled";
	if (
		value === "not_attended" ||
		value === "nao_atendido" ||
		value === "naoatendido"
	) {
		return "not_attended";
	}

	return undefined;
}

function normalizeType(input?: string): TEventType | undefined {
	const value = compact(input ?? null);
	if (!value) return undefined;

	if (value === "visit" || value === "visita" || value === "visita_a_loja") {
		return "visit";
	}

	if (value === "test_drive" || value === "testdrive") {
		return "test_drive";
	}

	if (value === "meeting" || value === "reuniao") return "meeting";

	if (
		value === "follow_up" ||
		value === "followup" ||
		value === "retorno" ||
		value === "work" ||
		value === "appointment"
	) {
		return "follow_up";
	}

	if (value === "delivery" || value === "entrega") return "delivery";
	if (value === "personal" || value === "pessoal") return "personal";

	return undefined;
}

function normalizePriority(input?: string): TEventPriority | undefined {
	const value = compact(input ?? null);
	if (!value) return undefined;

	if (value === "low" || value === "baixa") return "low";
	if (value === "normal") return "normal";
	if (value === "high" || value === "alta") return "high";
	if (value === "urgent" || value === "urgente") return "urgent";

	return undefined;
}

function formatPhone(value?: string) {
	if (!value) return undefined;

	const digits = value.replace(/\D/g, "").slice(0, 11);
	if (!digits) return undefined;

	if (digits.length <= 2) {
		return `(${digits}`;
	}

	if (digits.length <= 7) {
		return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
	}

	return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function parseStartDate(value?: string) {
	const currentMinute = new Date();
	currentMinute.setSeconds(0, 0);

	if (!value) return undefined;

	const parsedDate = new Date(value);
	if (Number.isNaN(parsedDate.getTime())) return undefined;

	if (parsedDate.getTime() < currentMinute.getTime()) return currentMinute;

	return parsedDate;
}

export function parseExternalCalendarQuery(
	searchParams: QuerySource,
): ExternalCalendarQueryData {
	const status = normalizeStatus(pickParam(searchParams, ["status"]));
	const type = normalizeType(pickParam(searchParams, ["tipo", "type"]));
	const priority = normalizePriority(
		pickParam(searchParams, ["prioridade", "priority"]),
	);
	const phone = formatPhone(
		pickParam(searchParams, ["telefone", "customerPhone", "phone"]),
	);
	const customerId = pickParam(searchParams, ["customerId", "idCliente"]);
	const title = pickParam(searchParams, ["titulo", "title"]);
	const description = pickParam(searchParams, ["descricao", "description"]);
	const startDate = parseStartDate(
		pickParam(searchParams, ["dataInicial", "startDate"]),
	);
	const shouldOpenScheduleDialog =
		normalize(searchParams.get("agendar")) === "1";

	const hasLeadPayload = Boolean(
		status || type || priority || phone || customerId,
	);

	return {
		shouldOpenScheduleDialog,
		filterStatus: status,
		filterType: type,
		filterPriority: priority,
		prefill: {
			status,
			type,
			priority,
			customerPhone: phone,
			customerId,
			startDate,
			title: title ?? (hasLeadPayload ? "Agendamento de lead" : undefined),
			description:
				description ??
				(hasLeadPayload
					? "Agendamento criado automaticamente via integração de lead."
					: undefined),
		},
	};
}
