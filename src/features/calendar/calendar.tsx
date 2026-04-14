"use client";

import { CalendarBody } from "@/features/calendar/calendar-body";
import { CalendarProvider } from "@/features/calendar/contexts/calendar-context";
import { DndProvider } from "@/features/calendar/contexts/dnd-context";
import { CalendarHeader } from "@/features/calendar/header/calendar-header";
import { Image } from "@radix-ui/react-avatar";

export function Calendar() {
  return (
    <CalendarProvider events={[]} users={[]} view="month">
      <DndProvider>
        <section className="relative w-full overflow-hidden rounded-3xl bg-background">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
<div className="pointer-events-none absolute inset-0 flex items-center justify-center">

  {/* Light mode */}
  <img
    src="/images/logo-light.png"
    className="opacity-[0.75] dark:hidden h-48 w-48 object-contain"
  />

  {/* Dark mode */}
  <img
    src="/images/logo-dark.png"
    className="hidden dark:block opacity-[0.7] h-48 w-48 object-contain"
  />

</div>
</div>

          <div className="relative z-10 p-4 sm:p-6">
            <CalendarHeader />
            <CalendarBody />
          </div>
        </section>
      </DndProvider>
    </CalendarProvider>
  );
}
