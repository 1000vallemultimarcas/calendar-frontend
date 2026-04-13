import { format } from "date-fns";
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
import { cn } from "@/features/calendar/lib/utils";
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
  const { badgeVariant, use24HourFormat, removeEvent } = useCalendar();
  const { user, isManager } = useAuth();

  const currentUserId = user?.userId;

  const defaultTrigger = (
    <span className="cursor-pointer text-slate-900">
      <span className="sm:hidden">+{hiddenEventsCount}</span>
      <span className="hidden sm:inline bg-slate-200 text-slate-900 py-1 px-3 my-1 rounded-xl border border-slate-300 shadow-sm">
        {hiddenEventsCount}
        <span className="mx-1">mais...</span>
      </span>
    </span>
  );

  return (
    <Modal>
      <ModalTrigger asChild>{children || defaultTrigger}</ModalTrigger>
      <ModalContent className="sm:max-w-106.25 bg-slate-750 text-slate-800">
        <ModalHeader>
          <ModalTitle className="my-2">
            <div className="flex items-center gap-2">
              <EventBullet
                color={cellEvents[0]?.color ?? "blue"}
                className="shadow-sm"
              />
              <p className="text-sm font-semibold italic text-slate-50">
                Eventos em{" "}
                {format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </ModalTitle>
        </ModalHeader>
        <div className="max-h-[60vh] overflow-y-auto space-y-3 px-2 pb-4">
          {cellEvents.length > 0 ? (
            cellEvents.map((event) => {
              const canModify = isManager || currentUserId === event.user.id;

              return (
                <div
                  key={event.id}
                  className="space-y-2 rounded-2xl border border-slate-900 bg-slate-00 p-3 shadow-lg text-amber-50"
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

                  <div className="flex flex-wrap gap-2">
                    {canModify && (
                      <AddEditEventDialog event={event}>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="border-slate-700 bg-slate-700 text-white hover:bg-slate-800"
                        >
                          Editar
                        </Button>
                      </AddEditEventDialog>
                    )}

                    {canModify && (
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
            <p className="text-sm text-muted-foreground">
              Nenhum evento nesta data.
            </p>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
