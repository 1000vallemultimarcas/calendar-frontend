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
  not_attended: "Não atendido",
};

export const TYPE_LABELS_PT_BR: Record<TEventType, string> = {
  meeting: "Reunião",
  appointment: "Compromisso",
  personal: "Pessoal",
  work: "Trabalho",
<<<<<<< HEAD
  visit: "Visita",
=======
>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)
  test_drive: "Test drive",
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
  createDescription: "Crie um novo agendamento para o calendário.",
  editDescription: "Altere as informações do agendamento.",
  titleLabel: "Título",
  titlePlaceholder: "Digite o título",
  statusLabel: "Status",
  statusPlaceholder: "Selecione um status",
  typeLabel: "Tipo",
  typePlaceholder: "Selecione um tipo",
  priorityLabel: "Prioridade",
  priorityPlaceholder: "Selecione uma prioridade",
  responsibleLabel: "Responsável",
  responsiblePlaceholder: "Selecione um responsável",
  descriptionLabel: "Descrição",
  descriptionPlaceholder: "Digite uma descrição",
  cancelButton: "Cancelar",
  createButton: "Criar agendamento",
  editButton: "Salvar alterações",
  createSuccess: "Agendamento criado com sucesso",
  editSuccess: "Agendamento atualizado com sucesso",
  createError: "Falha ao criar agendamento",
  editError: "Falha ao editar agendamento",
<<<<<<< HEAD
};
=======
};
>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)
