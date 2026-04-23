import type {
  TEventPriority,
  TEventStatus,
  TEventType,
} from "@/features/calendar/types";

export const STATUS_LABELS_PT_BR: Record<TEventStatus, string> = {
  not_contacted: "não atendido",
  in_negotiation: "em negociação",
  not_read: "não lido",
  scheduled: "agendado",
  finished_sold: "finalizado - vendido",
  finished_not_sold: "finalizado - não vendido",
};

export const TYPE_LABELS_PT_BR: Record<TEventType, string> = {
  initial_contact: "contato inicial",
  proposal_sent: "proposta enviada",
  test_drive: "test-drive",
  waiting_response: "aguardando resposta",
  closing: "fechamento",
  completed: "concluído",
};

export const PRIORITY_LABELS_PT_BR: Record<TEventPriority, string> = {
  cold: "frio",
  warm: "morno",
  hot: "quente",
};

export const EVENT_FORM_TEXTS_PT_BR = {
  createTitle: "Novo agendamento",
  editTitle: "Editar agendamento",
  createDescription: "Crie um novo agendamento para o calendario.",
  editDescription: "Altere as informacoes do agendamento.",
  titleLabel: "Titulo",
  titlePlaceholder: "Digite o titulo",
  statusLabel: "Status",
  statusPlaceholder: "Selecione um status",
  typeLabel: "Etapa da negociação",
  typePlaceholder: "Selecione uma etapa",
  priorityLabel: "Importância do lead",
  priorityPlaceholder: "Selecione a importância",
  responsibleLabel: "Responsavel",
  responsiblePlaceholder: "Selecione um responsavel",
  managerLabel: "Gerente",
  managerPlaceholder: "Selecione um gerente",
  customerLabel: "Cliente (telefone)",
  customerPlaceholder: "Selecione pelo telefone",
  customerPhoneLabel: "Telefone",
  customerPhonePlaceholder: "Digite o telefone do cliente",
  descriptionLabel: "Descrição",
  descriptionPlaceholder: "Digite uma descrição",
  cancelButton: "Cancelar",
  createButton: "Criar agendamento",
  editButton: "Salvar alteracoes",
  createSuccess: "Agendamento criado com sucesso",
  editSuccess: "Agendamento atualizado com sucesso",
  createError: "Falha ao criar agendamento",
  editError: "Falha ao editar agendamento",
};
