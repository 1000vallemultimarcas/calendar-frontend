"use client";

import { cva } from "class-variance-authority";
import { isToday, startOfDay, isSunday, isSameMonth } from "date-fns";
import { motion } from "framer-motion";
import { useMemo, useCallback } from "react";
import { cn } from "@/features/calendar/lib/utils";
import { transition } from "@/features/calendar/animations";
import { EventListDialog } from "@/features/calendar/dialogs/events-list-dialog";
import { DroppableArea } from "@/features/calendar/dnd/droppable-area";
import { getMonthCellEvents } from "@/features/calendar/helpers";
import { useMediaQuery } from "@/features/calendar/hooks";
import type { ICalendarCell, IEvent } from "@/features/calendar/interfaces";
import { EventBullet } from "@/features/calendar/views/month-view/event-bullet";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddEditEventDialog } from "@/features/calendar/dialogs/add-edit-event-dialog";

interface IProps {
  cell: ICalendarCell;
  events: IEvent[];
  eventPositions: Record<string, number>;
}

export const dayCellVariants = cva("text-white", {
  variants: {
    color: {
      blue: "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 ",
      green:
        "bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400",
      red: "bg-red-600 dark:bg-red-500 hover:bg-red-700 dark:hover:bg-red-400",
      yellow:
        "bg-yellow-600 dark:bg-yellow-500 hover:bg-yellow-700 dark:hover:bg-yellow-400",
      purple:
        "bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 dark:hover:bg-purple-400",
      orange:
        "bg-orange-600 dark:bg-orange-500 hover:bg-orange-700 dark:hover:bg-orange-400",
      gray: "bg-gray-600 dark:bg-gray-500 hover:bg-gray-700 dark:hover:bg-gray-400",
    },
  },
  defaultVariants: {
    color: "blue",
  },
});

const MAX_VISIBLE_EVENTS = 3;

export function DayCell({ cell, events, eventPositions }: IProps) {
  const { day, currentMonth, date } = cell;
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Memoize cellEvents and currentCellMonth for performance
  const { cellEvents, currentCellMonth } = useMemo(() => {
    const cellEvents = getMonthCellEvents(date, events, eventPositions);
    const currentCellMonth = startOfDay(
      new Date(date.getFullYear(), date.getMonth(), 1),
    );
    return { cellEvents, currentCellMonth };
  }, [date, events, eventPositions]);

  // Memoize event rendering for each position with animation
  const renderEventAtPosition = useCallback(
    (position: number) => {
      const event = cellEvents.find((e) => e.position === position);
      if (!event) {
        return (
          <motion.div
            key={`empty-${position}`}
            className="lg:flex-1"
            initial={false}
            animate={false}
          />
        );
      }
      const showBullet = isSameMonth(
        new Date(event.startDate),
        currentCellMonth,
      );

      return (
        <motion.div
          key={`event-${event.id}-${position}`}
          className="lg:flex-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: position * 0.1, ...transition }}
        >
          <div className="group flex items-center gap-2 rounded-lg border border-muted-foreground/20 bg-muted/40 px-2 py-2 text-[10px] text-muted-foreground transition hover:bg-muted/60">
            <EventBullet color={event.color} className="size-2!" />
            <span className="truncate font-semibold text-[11px]">
              {event.user?.name ?? "Sem responsável"}
            </span>
          </div>
        </motion.div>
      );
    },
    [cellEvents, currentCellMonth, date],
  );

  const showMoreCount = cellEvents.length - MAX_VISIBLE_EVENTS;

  const showMore = currentMonth && showMoreCount > 0;

  const cellContent = useMemo(
    () => (
      <motion.div
        className={cn(
          "flex h-full lg:min-h-40 flex-col gap-1 border-l border-t transition duration-200",
          isSunday(date) && "border-l-0",
          currentMonth && "cursor-pointer hover:bg-muted/10 hover:shadow-sm",
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <DroppableArea date={date} className="w-full h-full py-2">
          <motion.span
            className={cn(
              "h-6 px-1 text-xs font-semibold lg:px-2 transition-colors duration-200",
              "rounded-full",
              !currentMonth && "opacity-20",
              isToday(date) &&
                "flex w-6 translate-x-1 items-center justify-center rounded-full bg-primary px-0 font-bold text-primary-foreground",
            )}
          >
            {day}
          </motion.span>

          <motion.div
            className={cn(
              "flex h-fit gap-1 px-2 mt-1 lg:h-23.5 lg:flex-col lg:gap-2 lg:px-0",
              !currentMonth && "opacity-50",
            )}
          >
            {cellEvents.length === 0 && !isMobile ? (
              <div className="w-full h-full flex justify-center items-center group">
                <Button
                  variant="ghost"
                  className="border opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Plus className="h-4 w-4" />
                  <span className="max-sm:hidden">Adicionar Evento</span>
                </Button>
              </div>
            ) : (
              [0, 1, 2].map(renderEventAtPosition)
            )}
          </motion.div>

          {showMore && (
            <div className="flex justify-end items-end mx-2">
              <span className="text-[0.6rem] font-semibold text-accent-foreground">
                +{showMoreCount} mais
              </span>
            </div>
          )}
        </DroppableArea>
      </motion.div>
    ),
    [
      date,
      day,
      currentMonth,
      cellEvents,
      showMore,
      showMoreCount,
      renderEventAtPosition,
      isMobile,
    ],
  );

  if (currentMonth && cellEvents.length === 0) {
    return <AddEditEventDialog startDate={date}>{cellContent}</AddEditEventDialog>;
  }

  return <EventListDialog date={date} events={cellEvents}>{cellContent}</EventListDialog>;
}
