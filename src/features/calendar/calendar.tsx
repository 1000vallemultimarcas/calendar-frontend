"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CalendarBody } from "@/features/calendar/calendar-body";
import { useAuth } from "@/features/calendar/contexts/authContext";
import { isSeniorManager } from "@/features/calendar/lib/permissions";
import { CalendarProvider } from "@/features/calendar/contexts/calendar-context";
import { DndProvider } from "@/features/calendar/contexts/dnd-context";
import { CalendarHeader } from "@/features/calendar/header/calendar-header";

export function Calendar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isEmployee, isManager } = useAuth();

  useEffect(() => {
    if (!user) return;

    const isSeniorManagerUser = isSeniorManager(user.permissionLevel);

    if (isEmployee && pathname !== "/calendar/atendente") {
      router.replace("/calendar/atendente");
      return;
    }

    if (isSeniorManagerUser && pathname !== "/calendar/gerente") {
      router.replace("/calendar/gerente");
      return;
    }

    if (isManager && pathname === "/calendar/atendente") {
      router.replace("/calendar");
      return;
    }

    if (isManager && pathname === "/calendar/gerente" && !isSeniorManagerUser) {
      router.replace("/calendar");
    }
  }, [isEmployee, isManager, pathname, router, user]);

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
