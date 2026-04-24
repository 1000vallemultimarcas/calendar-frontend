"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarBody } from "@/features/calendar/calendar-body";
import { useAuth } from "@/features/calendar/contexts/authContext";
import { isSeniorManager } from "@/features/calendar/lib/permissions";
import { CalendarHeader } from "@/features/calendar/header/calendar-header";

export function Calendar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isEmployee, isManager } = useAuth();

  useEffect(() => {
    if (!user) return;

    const isSeniorManagerUser = isSeniorManager(user.permissionLevel);
    const query = searchParams.toString();
    const withQuery = (path: string) => (query ? `${path}?${query}` : path);

    if (isEmployee && pathname !== "/calendar/atendente") {
      router.replace(withQuery("/calendar/atendente"));
      return;
    }

    if (isSeniorManagerUser && pathname !== "/calendar/gerente") {
      router.replace(withQuery("/calendar/gerente"));
      return;
    }

    if (isManager && pathname === "/calendar/atendente") {
      router.replace(withQuery("/calendar"));
      return;
    }

    if (isManager && pathname === "/calendar/gerente" && !isSeniorManagerUser) {
      router.replace(withQuery("/calendar"));
    }
  }, [isEmployee, isManager, pathname, router, searchParams, user]);

  return (
    <section className="relative w-full overflow-hidden rounded-3xl bg-[#ececec] dark:bg-background">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {/* Light mode */}
        <img
          src="/images/logo-light.png"
          className="h-48 w-48 object-contain opacity-[0.75] dark:hidden"
        />

        {/* Dark mode */}
        <img
          src="/images/logo-dark.png"
          className="hidden h-48 w-48 object-contain opacity-[0.7] dark:block"
        />
      </div>

      <div className="relative z-10 p-4 sm:p-6">
        <CalendarHeader />
        <CalendarBody />
      </div>
    </section>
  );
}
