"use client";

import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Clock, Text, User } from "lucide-react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { useAuth } from "@/features/calendar/contexts/authContext";
import { AddEditEventDialog } from "@/features/calendar/dialogs/add-edit-event-dialog";
import { toCapitalize } from "@/features/calendar/helpers";
import type { IEvent } from "@/features/calendar/interfaces";

interface IProps {
  event: IEvent;
  children: ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  const scheduledAt = event.createdAt ? parseISO(event.createdAt) : null;
  const { use24HourFormat, removeEvent } = useCalendar();
  const { user, canManageCalendar } = useAuth();
  const schedulerName = event.scheduledBy?.name ?? event.user?.name ?? "Sistema";

  const deleteEvent = (eventId: number) => {
    try {
      removeEvent(eventId, user?.name);
      toast.success("Evento excluido com sucesso.");
    } catch {
      toast.error("Erro ao excluir evento.");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-4 p-4">
            <div className="flex items-start gap-2">
                <User className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Responsavel</p>
                <p className="text-sm text-muted-foreground">{event.user.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Agendado por ({schedulerName})</p>
                <p className="text-sm text-muted-foreground">
                  {schedulerName}
                </p>
                {event.scheduledBy?.mail && (
                  <p className="text-xs text-muted-foreground">
                    {event.scheduledBy.mail}
                  </p>
                )}
                {typeof event.scheduledBy?.permissionLevel === "number" && (
                  <p className="text-xs text-muted-foreground">
                    Nivel de permissao: {event.scheduledBy.permissionLevel}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Agendado em:{" "}
                  {scheduledAt
                    ? format(
                        scheduledAt,
                        use24HourFormat ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy hh:mm a",
                      )
                    : "Nao informado"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data de inicio</p>
                <p className="text-sm text-muted-foreground">
                  {toCapitalize(
                    format(
                      startDate,
                      use24HourFormat
                        ? "EEEE dd 'de' MMMM 'as' HH:mm"
                        : "EEEE dd 'de' MMMM 'as' hh:mm a",
                      { locale: ptBR },
                    ).replace("-feira", ""),
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Data de termino</p>
                <p className="text-sm text-muted-foreground">
                  {toCapitalize(
                    format(
                      endDate,
                      use24HourFormat
                        ? "EEEE dd 'de' MMMM 'as' HH:mm"
                        : "EEEE dd 'de' MMMM 'as' hh:mm a",
                      { locale: ptBR },
                    ).replace("-feira", ""),
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Text className="mt-1 size-4 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Descricao</p>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            </div>

            {(event.customerId || event.customerPhone) && (
              <div className="flex items-start gap-2">
                <Text className="mt-1 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Cliente</p>
                  {event.customerId && (
                    <p className="text-sm text-muted-foreground">
                      ID: {event.customerId}
                    </p>
                  )}
                  {event.customerPhone && (
                    <p className="text-sm text-muted-foreground">
                      Telefone: {event.customerPhone}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2">
          {canManageCalendar ? (
            <>
              <AddEditEventDialog event={event}>
                <Button variant="outline">Editar</Button>
              </AddEditEventDialog>
              <Button
                variant="destructive"
                onClick={() => {
                  deleteEvent(event.id);
                }}
              >
                Excluir
              </Button>
            </>
          ) : (
            <div className="rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              Perfil atendente possui acesso somente leitura.
            </div>
          )}
        </div>
        <DialogClose />
      </DialogContent>
    </Dialog>
  );
}
