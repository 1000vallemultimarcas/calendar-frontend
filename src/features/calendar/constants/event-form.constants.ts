import type {
  TEventPriority,
  TEventStatus,
  TEventType,
} from "@/features/calendar/types";

export const STATUS_LABELS_PT_BR: Record<TEventStatus, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  attended: "Atendido",
  rescheduled: "Reagendado",
  not_attended: "Nao atendido",
};

export const TYPE_LABELS_PT_BR: Record<TEventType, string> = {
  visit: "Visita à loja",
  test_drive: "Test drive",
  meeting: "Reunião",
  follow_up: "Retorno / Follow-up",
  delivery: "Entrega de veículo",
  personal: "Pessoal",
};

export const PRIORITY_LABELS_PT_BR: Record<TEventPriority, string> = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
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
  typeLabel: "Tipo",
  typePlaceholder: "Selecione um tipo",
  priorityLabel: "Prioridade",
  priorityPlaceholder: "Selecione uma prioridade",
  responsibleLabel: "Responsavel",
  responsiblePlaceholder: "Selecione um responsavel",
  managerLabel: "Gerente",
  managerPlaceholder: "Selecione um gerente",
  customerLabel: "Cliente (telefone)",
  customerPlaceholder: "Selecione pelo telefone",
  customerPhoneLabel: "Telefone",
  customerPhonePlaceholder: "Digite o telefone do cliente",
  descriptionLabel: "Descricao",
  descriptionPlaceholder: "Digite uma descricao",
  cancelButton: "Cancelar",
  createButton: "Criar agendamento",
  editButton: "Salvar alteracoes",
  createSuccess: "Agendamento criado com sucesso",
  editSuccess: "Agendamento atualizado com sucesso",
  createError: "Falha ao criar agendamento",
  editError: "Falha ao editar agendamento",
};
