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

function normalizeKey(value: string) {
	return compact(value).replace(/_/g, "");
}

function pickParam(searchParams: QuerySource, keys: string[]) {
	const normalizedKeyMap = new Map<string, string>();
	for (const key of keys) {
		normalizedKeyMap.set(normalizeKey(key), key);
	}

	for (const [queryKey, rawValue] of searchParams.entries()) {
		const normalizedQueryKey = normalizeKey(queryKey);
		if (!normalizedKeyMap.has(normalizedQueryKey)) {
			continue;
		}

		const value = rawValue.trim();
		if (value !== "") {
			return value;
		}
	}

	return undefined;
}

function matches(value: string, aliases: string[]) {
	return aliases.includes(value);
}

function normalizeStatus(input?: string): TEventStatus | undefined {
	const value = compact(input ?? null);
	if (!value) return undefined;

	if (
		matches(value, [
			"not_contacted",
			"nao_atendido",
			"not_attended",
		])
	) {
		return "not_contacted";
	}

	if (matches(value, ["in_negotiation", "em_negociacao"])) {
		return "in_negotiation";
	}

	if (matches(value, ["not_read", "nao_lido"])) {
		return "not_read";
	}

	if (matches(value, ["scheduled", "agendado"])) {
		return "scheduled";
	}

	if (matches(value, ["finished_sold", "finalizado_vendido"])) {
		return "finished_sold";
	}

	if (
		matches(value, [
			"finished_not_sold",
			"finalizado_nao_vendido",
			"cancelled",
		])
	) {
		return "finished_not_sold";
	}

	return undefined;
}

function normalizeType(input?: string): TEventType | undefined {
	const value = compact(input ?? null);
	if (!value) return undefined;

	if (matches(value, ["initial_contact", "contato_inicial"])) {
		return "initial_contact";
	}

	if (matches(value, ["proposal_sent", "proposta_enviada", "follow_up"])) {
		return "proposal_sent";
	}

	if (matches(value, ["test_drive", "testdrive"])) {
		return "test_drive";
	}

	if (matches(value, ["waiting_response", "aguardando_resposta"])) {
		return "waiting_response";
	}

	if (matches(value, ["closing", "fechamento"])) {
		return "closing";
	}

	if (matches(value, ["completed", "concluido", "attended"])) {
		return "completed";
	}

	return undefined;
}

function normalizePriority(input?: string): TEventPriority | undefined {
	const value = compact(input ?? null);
	if (!value) return undefined;

	if (matches(value, ["cold", "frio", "low"])) {
		return "cold";
	}

	if (matches(value, ["warm", "morno", "normal", "medium", "medio"])) {
		return "warm";
	}

	if (matches(value, ["hot", "quente", "high", "urgent"])) {
		return "hot";
	}

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
	const status = normalizeStatus(
		pickParam(searchParams, [
			"status",
			"negotiationStatus",
			"negotiation_status",
			"statusNegociacao",
		]),
	);

	const type = normalizeType(
		pickParam(searchParams, [
			"tipo",
			"type",
			"stage",
			"etapa",
			"negotiationStage",
			"negotiation_stage",
			"etapaNegociacao",
		]),
	);

	const priority = normalizePriority(
		pickParam(searchParams, [
			"prioridade",
			"priority",
			"importance",
			"importancia",
			"leadImportance",
			"lead_importance",
		]),
	);

	const phone = formatPhone(
		pickParam(searchParams, ["telefone", "customerPhone", "phone"]),
	);
	const customerId = pickParam(searchParams, ["customerId", "idCliente"]);
	const title = pickParam(searchParams, ["titulo", "title"]);
	const description = pickParam(searchParams, ["descricao", "description"]);
	const startDate = parseStartDate(
		pickParam(searchParams, ["dataInicial", "startDate", "start_date"]),
	);
	const shouldOpenScheduleDialog = ["1", "true", "yes", "sim"].includes(
		normalize(searchParams.get("agendar")),
	);

	const hasLeadPayload = Boolean(
		status ||
			type ||
			priority ||
			phone ||
			customerId ||
			title ||
			description ||
			startDate,
	);

	return {
		shouldOpenScheduleDialog: shouldOpenScheduleDialog || hasLeadPayload,
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
