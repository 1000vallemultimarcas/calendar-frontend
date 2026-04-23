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
	if (value === "not_contacted" || value === "nao_atendido") {
		return "not_contacted";
	}
	if (value === "in_negotiation" || value === "em_negociacao") {
		return "in_negotiation";
	}
	if (value === "not_read" || value === "nao_lido") return "not_read";
	if (value === "finished_sold" || value === "finalizado_vendido") {
		return "finished_sold";
	}
	if (
		value === "finished_not_sold" ||
		value === "finalizado_nao_vendido"
	) {
		return "finished_not_sold";
	}

	return undefined;
}

function normalizeType(input?: string): TEventType | undefined {
	const value = compact(input ?? null);
	if (!value) return undefined;

	if (value === "initial_contact" || value === "contato_inicial") {
		return "initial_contact";
	}
	if (value === "proposal_sent" || value === "proposta_enviada") {
		return "proposal_sent";
	}
	if (value === "test_drive" || value === "testdrive") {
		return "test_drive";
	}
	if (value === "waiting_response" || value === "aguardando_resposta") {
		return "waiting_response";
	}
	if (value === "closing" || value === "fechamento") return "closing";
	if (value === "completed" || value === "concluido") return "completed";

	return undefined;
}

function normalizePriority(input?: string): TEventPriority | undefined {
	const value = compact(input ?? null);
	if (!value) return undefined;

	if (value === "cold" || value === "frio") return "cold";
	if (value === "warm" || value === "morno") return "warm";
	if (value === "hot" || value === "quente") return "hot";

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
