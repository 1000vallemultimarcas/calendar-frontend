import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { FC } from "react";
import { BarChart3, CalendarCheck2, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/responsive-modal";
import { EventItem } from "@/features/calendar/components/event-item";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { EventDetailsDialog } from "@/features/calendar/dialogs/event-details-dialog";
import {
  formatTime,
  getEventsForMonth,
  toCapitalize,
} from "@/features/calendar/helpers";

const reportSummary = [
  {
    label: "Reunioes na semana",
    value: 14,
    icon: CalendarCheck2,
  },
  {
    label: "Taxa de comparecimento",
    value: "91%",
    icon: Users,
  },
  {
    label: "Produtividade da agenda",
    value: "84%",
    icon: TrendingUp,
  },
];

const meetingsPerDay = [
  { day: "Seg", meetings: 2 },
  { day: "Ter", meetings: 4 },
  { day: "Qua", meetings: 3 },
  { day: "Qui", meetings: 5 },
  { day: "Sex", meetings: 4 },
];

const maxMeetings = Math.max(...meetingsPerDay.map((item) => item.meetings));

export const AgendaEvents: FC = () => {
  const {
    events,
    use24HourFormat,
    badgeVariant,
    agendaModeGroupBy,
    selectedDate,
  } = useCalendar();

  const monthEvents = getEventsForMonth(events, selectedDate);

  const agendaEvents = monthEvents.reduce<Record<string, typeof monthEvents>>(
    (acc, event) => {
      const key =
        agendaModeGroupBy === "date"
          ? format(parseISO(event.startDate), "yyyy-MM-dd")
          : event.color;
      if (!acc[key]) acc[key] = [];
      acc[key].push(event);
      return acc;
    },
    {},
  );

  const groupedAndSortedEvents = Object.entries(agendaEvents).sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
  );

  return (
    <Command className="h-[80vh] bg-transparent py-4">
      <div className="mx-4 mb-4 space-y-4">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 p-6 text-slate-50 shadow-sm">
          <div className="pointer-events-none absolute -right-10 -top-8 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 left-10 h-32 w-32 rounded-full bg-indigo-300/25 blur-2xl" />
          <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.15em] text-cyan-200 uppercase">
                Painel Gerencial
              </p>
              <h2 className="text-2xl font-semibold tracking-tight">
                Visao Geral do Calendario
              </h2>
              <p className="max-w-xl text-sm text-slate-200/90">
                Acompanhe eventos e desempenho da equipe com indicadores
                semanais simulados para apoiar decisoes estrategicas.
              </p>
            </div>

            <Modal>
              <ModalTrigger asChild>
                <Button
                  className="h-11 gap-2 rounded-xl bg-cyan-400 px-5 text-slate-950 shadow-lg shadow-cyan-500/30 hover:bg-cyan-300 active:scale-[0.98]"
                  size="lg"
                >
                  <BarChart3 className="size-4" />
                  Ver Relatorios
                </Button>
              </ModalTrigger>

              <ModalContent
                side="right"
                className="w-full border-l border-slate-200 bg-slate-50 p-0 sm:max-w-md"
              >
                <div className="flex h-full flex-col">
                  <ModalHeader className="border-b border-slate-200 px-6 py-5">
                    <ModalTitle>Relatorios do Calendario</ModalTitle>
                    <ModalDescription id="responsive-modal-description">
                      Dados simulados para acompanhamento de reunioes,
                      comparecimento e produtividade da equipe.
                    </ModalDescription>
                  </ModalHeader>

                  <div className="space-y-6 overflow-y-auto px-6 py-5">
                    <div className="grid gap-3">
                      {reportSummary.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-medium text-slate-500 uppercase">
                                {item.label}
                              </p>
                              <p className="mt-1 text-2xl font-semibold text-slate-900">
                                {item.value}
                              </p>
                            </div>
                            <div className="rounded-lg bg-cyan-100 p-2 text-cyan-700">
                              <item.icon className="size-4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="mb-4">
                        <h3 className="text-sm font-semibold text-slate-900">
                          Reunioes por dia (semana atual)
                        </h3>
                        <p className="text-xs text-slate-500">
                          Grafico simplificado com dados mockados.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {meetingsPerDay.map((item) => (
                          <div key={item.day} className="space-y-1">
                            <div className="flex items-center justify-between text-xs text-slate-600">
                              <span>{item.day}</span>
                              <span>{item.meetings} reunioes</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                                style={{
                                  width: `${(item.meetings / maxMeetings) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </div>
              </ModalContent>
            </Modal>
          </div>
        </section>

        <CommandInput placeholder="Buscar eventos..." />
      </div>
      <CommandList className="max-h-max px-3 border-t">
        {groupedAndSortedEvents.map(([date, groupedEvents]) => (
          <CommandGroup
            key={date}
            heading={
              agendaModeGroupBy === "date"
                ? toCapitalize(
                    format(parseISO(date), "EEEE, d 'de' MMMM 'de' yyyy", {
                      locale: ptBR,
                    }).replace("-feira", ""),
                  )
                : toCapitalize(groupedEvents![0].color)
            }
          >
            {groupedEvents!.map((event) => (
              <CommandItem
                key={event.id}
                className="mb-2 p-0 border-0 data-[selected=true]:bg-transparent hover:cursor-pointer"
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
                    use24HourFormat={use24HourFormat}
                  />
                </EventDetailsDialog>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
        <CommandEmpty>Sem eventos para exibir.</CommandEmpty>
      </CommandList>
    </Command>
  );
};
