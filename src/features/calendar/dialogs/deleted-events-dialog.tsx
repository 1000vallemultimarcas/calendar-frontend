"use client";

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

function canModifyDeletedEvent(event: IEvent, userId: string | undefined, isManager: boolean) {
  return isManager || event.user.id === userId;
}

export function DeletedEventsDialog() {
  const { deletedEvents, restoreEvent, purgeEvent } = useCalendar();
  const { user, isManager } = useAuth();
  const currentUserId = user?.userId;

  const restore = (eventId: number) => {
    restoreEvent(eventId);
    toast.success("Evento restaurado com sucesso.");
  };

  const purge = (eventId: number) => {
    purgeEvent(eventId);
    toast.success("Evento removido permanentemente.");
  };

  return (
    <Modal modal={false}>
      <ModalTrigger asChild>
        <Button variant="outline">Lixeira</Button>
      </ModalTrigger>
      <ModalContent className="max-w-[95vw] sm:max-w-3xl">
        <ModalHeader>
          <ModalTitle>Eventos excluídos</ModalTitle>
          <ModalDescription>
            Aqui estão os eventos apagados. Você pode restaurar ou excluir permanentemente.
          </ModalDescription>
        </ModalHeader>

        <ScrollArea className="max-h-[70vh] py-2">
          <div className="space-y-4">
            {deletedEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                Nenhum evento na lixeira.
              </div>
            ) : (
              deletedEvents.map((event) => {
                const canModify = canModifyDeletedEvent(event, currentUserId, isManager);

                return (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold">{event.title}</p>
                        <p className="text-xs text-slate-500">
                          Responsável: {event.user.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Excluído por: {event.deletedBy ?? "Sistema"}
                        </p>
                        <p className="text-xs text-slate-500">
                          Excluído em: {event.deletedAt ? format(parseISO(event.deletedAt), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => restore(event.id)}
                          disabled={!canModify}
                        >
                          Restaurar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => purge(event.id)}
                          disabled={!canModify}
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
            <Button className="bg-orange-600 text-white hover:bg-orange-700">
              Fechar
            </Button>
          </ModalClose>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
