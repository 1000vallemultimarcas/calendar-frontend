"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  slideFromLeft,
  slideFromRight,
  transition,
} from "@/features/calendar/animations";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { DeletedEventsDialog } from "@/features/calendar/dialogs/deleted-events-dialog";
import { DateNavigator } from "@/features/calendar/header/date-navigator";
import FilterEvents from "@/features/calendar/header/filter";
import { TodayButton } from "@/features/calendar/header/today-button";
import { useAuth } from "@/features/calendar/contexts/authContext";
import Views from "./view-tabs";

export function CalendarHeader() {
  const { view, events } = useCalendar();
  const { canManageCalendar } = useAuth();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
          {isHydrated && canManageCalendar && <DeletedEventsDialog />}
        </div>
      </motion.div>
    </div>
  );
}
