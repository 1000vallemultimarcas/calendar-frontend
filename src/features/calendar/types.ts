export type TCalendarView = "day" | "week" | "month" | "year" | "agenda";
export type TEventColor =
	| "blue"
	| "green"
	| "red"
	| "yellow"
	| "purple"
	| "orange";

export enum NegotiationStatus {
	NOT_CONTACTED = "não atendido",
	IN_NEGOTIATION = "em negociação",
	NOT_READ = "não lido",
	SCHEDULED = "agendado",
	FINISHED_SOLD = "finalizado - vendido",
	FINISHED_NOT_SOLD = "finalizado - não vendido",
}

export enum NegotiationStage {
	INITIAL_CONTACT = "contato inicial",
	PROPOSAL_SENT = "proposta enviada",
	TEST_DRIVE = "test-drive",
	WAITING_RESPONSE = "aguardando resposta",
	CLOSING = "fechamento",
	COMPLETED = "concluído",
}

export enum LeadImportance {
	COLD = "frio",
	WARM = "morno",
	HOT = "quente",
}

export type TEventStatus =
	| "not_contacted"
	| "in_negotiation"
	| "not_read"
	| "scheduled"
	| "finished_sold"
	| "finished_not_sold";
export type TEventType =
	| "initial_contact"
	| "proposal_sent"
	| "test_drive"
	| "waiting_response"
	| "closing"
	| "completed";
export type TEventPriority = "cold" | "warm" | "hot";
