import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { FC } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { EventDetailsDialog } from "@/features/calendar/dialogs/event-details-dialog";
import {
  formatTime,
  getEventsForMonth,
  toCapitalize,
} from "@/features/calendar/helpers";
import { EventItem } from "@/features/calendar/components/event-item";

export const AgendaEvents: FC = () => {
  const {
    events,
    use24HourFormat,
    badgeVariant,
    agendaModeGroupBy,
    selectedDate,
  } = useCalendar();

  const monthEvents = getEventsForMonth(events, selectedDate);

  const agendaEvents = Object.groupBy(monthEvents, (event) => {
    return agendaModeGroupBy === "date"
      ? format(parseISO(event.startDate), "yyyy-MM-dd")
      : event.color;
  });

  const groupedAndSortedEvents = Object.entries(agendaEvents).sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
  );

  return (
    <Command className="py-4 h-[80vh] bg-transparent">
      <div className="mb-4 mx-4">
        <CommandInput placeholder="Type a command or search..." />
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
        <CommandEmpty>No results found.</CommandEmpty>
      </CommandList>
    </Command>
  );
};
