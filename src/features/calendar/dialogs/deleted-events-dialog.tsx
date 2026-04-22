"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/responsive-modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/features/calendar/contexts/authContext";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import type { IEvent } from "@/features/calendar/interfaces";
import { deleteEvent as deleteEventRequest } from "@/features/calendar/requests";

function canModifyDeletedEvent(
  _event: IEvent,
  _userId: string | undefined,
  isManager: boolean,
) {
  return isManager;
}

export function DeletedEventsDialog() {
  const { deletedEvents, restoreEvent, purgeEvent } = useCalendar();
  const { user, isManager } = useAuth();
  const currentUserId = user?.userId;
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  const restore = (eventId: number) => {
    restoreEvent(eventId);
    toast.success("Evento restaurado com sucesso.");
  };

  const purge = async (eventId: number) => {
    try {
      await deleteEventRequest(eventId);
      purgeEvent(eventId);
      toast.success("Evento removido permanentemente.");
    } catch {
      toast.error("Falha ao remover evento permanentemente.");
    }
  };

  const restoreAll = () => {
    if (!isManager || deletedEvents.length === 0) return;

    setIsBatchLoading(true);

    try {
      for (const event of deletedEvents) {
        restoreEvent(event.id);
      }

      toast.success("Todos os eventos foram restaurados.");
    } finally {
      setIsBatchLoading(false);
    }
  };

  const purgeAll = async () => {
    if (!isManager || deletedEvents.length === 0) return;

    setIsBatchLoading(true);

    try {
      const purgeResults = await Promise.allSettled(
        deletedEvents.map((event) => deleteEventRequest(event.id)),
      );

      let successCount = 0;

      for (let i = 0; i < purgeResults.length; i += 1) {
        if (purgeResults[i].status === "fulfilled") {
          purgeEvent(deletedEvents[i].id);
          successCount += 1;
        }
      }

      if (successCount === deletedEvents.length) {
        toast.success("Todos os eventos foram apagados permanentemente.");
        return;
      }

      if (successCount > 0) {
        toast.error(
          `${successCount} evento(s) removido(s). Alguns nao puderam ser excluidos.`,
        );
        return;
      }

      toast.error("Falha ao remover eventos permanentemente.");
    } finally {
      setIsBatchLoading(false);
    }
  };

  return (
    <Modal modal={false}>
      <ModalTrigger asChild>
        <Button variant="outline">Lixeira</Button>
      </ModalTrigger>
      <ModalContent className="max-w-[95vw] sm:max-w-3xl">
        <ModalHeader>
          <ModalTitle>Eventos excluidos</ModalTitle>
          <ModalDescription>
            Aqui estao os eventos apagados. Voce pode restaurar ou excluir
            permanentemente.
          </ModalDescription>
        </ModalHeader>

        <div className="flex flex-wrap justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={restoreAll}
            disabled={!isManager || deletedEvents.length === 0 || isBatchLoading}
          >
            Restaurar todos
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => void purgeAll()}
            disabled={!isManager || deletedEvents.length === 0 || isBatchLoading}
          >
            Deletar todos
          </Button>
        </div>

        <ScrollArea className="max-h-[70vh] py-2">
          <div className="space-y-4">
            {deletedEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                Nenhum evento na lixeira.
              </div>
            ) : (
              deletedEvents.map((event) => {
                const canModify = canModifyDeletedEvent(
                  event,
                  currentUserId,
                  isManager,
                );

                return (
                  <div
                    key={event.id}
                    className="rounded-2xl border bg-card p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Responsavel: {event.user.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Excluido por: {event.deletedBy ?? "Sistema"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Excluido em:{" "}
                          {event.deletedAt
                            ? format(parseISO(event.deletedAt), "dd/MM/yyyy HH:mm", {
                                locale: ptBR,
                              })
                            : "-"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => restore(event.id)}
                          disabled={!canModify || isBatchLoading}
                        >
                          Restaurar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void purge(event.id)}
                          disabled={!canModify || isBatchLoading}
                        >
                          Apagar permanentemente
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        <ModalFooter className="justify-end">
          <ModalClose asChild>
            <Button variant="outline">Fechar</Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
