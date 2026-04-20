"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  slideFromLeft,
  slideFromRight,
  transition,
} from "@/features/calendar/animations";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { AddEditEventDialog } from "@/features/calendar/dialogs/add-edit-event-dialog";
import { DeletedEventsDialog } from "@/features/calendar/dialogs/deleted-events-dialog";
import { DateNavigator } from "@/features/calendar/header/date-navigator";
import FilterEvents from "@/features/calendar/header/filter";
import { TodayButton } from "@/features/calendar/header/today-button";
import { UserSelect } from "@/features/calendar/header/user-select";
import { useAuth } from "@/features/calendar/contexts/authContext";
import { useHasMounted } from "@/hooks/use-has-mounted";
import Views from "./view-tabs";

export function CalendarHeader() {
  const { view, events } = useCalendar();
  const { canManageCalendar } = useAuth();
  const hasMounted = useHasMounted();

  return (
    <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
      <motion.div
        className="flex items-center gap-3"
        variants={slideFromLeft}
        initial="initial"
        animate="animate"
        transition={transition}
      >
        <TodayButton />
        <DateNavigator view={view} events={events} />
      </motion.div>

      <motion.div
        className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-1"
        variants={slideFromRight}
        initial="initial"
        animate="animate"
        transition={transition}
      >
        <div className="options flex-wrap flex items-center gap-4 md:gap-2">
          <FilterEvents />
          <Views />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center lg:gap-1">
          <UserSelect />
          {hasMounted && canManageCalendar && <DeletedEventsDialog />}

          {hasMounted && canManageCalendar && (
            <AddEditEventDialog>
              <Button className="bg-orange-600 text-white hover:bg-orange-700">
                <Plus className="h-4 w-4" />
                Adicionar evento
              </Button>
            </AddEditEventDialog>
          )}
        </div>
      </motion.div>
    </div>
  );
}
