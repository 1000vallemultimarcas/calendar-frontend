import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { ReactNode } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/responsive-modal";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { useAuth } from "@/features/calendar/contexts/authContext";
import type { IEvent } from "@/features/calendar/interfaces";
import { EventBullet } from "@/features/calendar/views/month-view/event-bullet";
import { EventDetailsDialog } from "@/features/calendar/dialogs/event-details-dialog";
import { AddEditEventDialog } from "@/features/calendar/dialogs/add-edit-event-dialog";
import { EventItem } from "@/features/calendar/components/event-item";

interface EventListDialogProps {
  date: Date;
  events: IEvent[];
  maxVisibleEvents?: number;
  children?: ReactNode;
}

export function EventListDialog({
  date,
  events,
  maxVisibleEvents = 3,
  children,
}: EventListDialogProps) {
  const cellEvents = events;
  const hiddenEventsCount = Math.max(cellEvents.length - maxVisibleEvents, 0);
  const { use24HourFormat, removeEvent } = useCalendar();
  const { user, canManageCalendar } = useAuth();

  const defaultTrigger = (
    <span className="cursor-pointer text-slate-900">
      <span className="sm:hidden">+{hiddenEventsCount}</span>
      <span className="hidden rounded-xl border border-slate-300 bg-slate-200 px-3 py-1 text-slate-900 shadow-sm sm:inline">
        {hiddenEventsCount}
        <span className="mx-1">mais...</span>
      </span>
    </span>
  );

  return (
    <Modal>
      <ModalTrigger asChild>{children || defaultTrigger}</ModalTrigger>
      <ModalContent className="bg-slate-100 text-foreground dark:bg-background sm:max-w-106.25">
        <ModalHeader>
          <ModalTitle className="my-2">
            <div className="flex items-center gap-2">
              <EventBullet
                color={cellEvents[0]?.color ?? "blue"}
                className="shadow-sm"
              />
              <p className="text-sm font-semibold italic text-foreground">
                Eventos em {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </ModalTitle>
        </ModalHeader>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto px-2 pb-4">
          {cellEvents.length > 0 ? (
            cellEvents.map((event) => {
              return (
                <div
                  key={event.id}
                  className="space-y-2 rounded-2xl border border-slate-300 bg-slate-50 p-3 text-slate-900 shadow-lg dark:border-border dark:bg-card dark:text-card-foreground"
                >
                  <EventDetailsDialog event={event}>
                    <EventItem
                      title={event.title}
                      startDate={event.startDate}
                      endDate={event.endDate}
                      status={event.status}
                      type={event.type}
                      priority={event.priority}
                      secondaryLabel={event.user?.name}
                      description={event.description}
                      use24HourFormat={use24HourFormat}
                    />
                  </EventDetailsDialog>

                  <div className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-800">
                    <p>Agendado por: {event.scheduledBy?.name ?? "Nao informado"}</p>
                    <p>
                      Criado em:{" "}
                      {event.createdAt
                        ? format(parseISO(event.createdAt), "dd/MM/yyyy HH:mm")
                        : "Nao informado"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {canManageCalendar && (
                      <AddEditEventDialog event={event}>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-800"
                        >
                          Editar
                        </Button>
                      </AddEditEventDialog>
                    )}

                    {canManageCalendar && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() => removeEvent(event.id, user?.name)}
                      >
                        Excluir
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum evento nesta data.</p>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
