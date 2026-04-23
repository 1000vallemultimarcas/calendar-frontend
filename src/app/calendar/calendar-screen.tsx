"use client";

import { Suspense, useEffect, useState } from "react";
import { Calendar } from "@/features/calendar/calendar";
import { CalendarProvider } from "@/features/calendar/contexts/calendar-context";
import { DndProvider } from "@/features/calendar/contexts/dnd-context";
import { CalendarSkeleton } from "@/features/calendar/skeletons/calendar-skeleton";
import { HeroBannerActions } from "./hero-banner-actions";
import { HeroReportsButton } from "./hero-reports-button";

interface CalendarScreenProps {
  badgeLabel: string;
}

export function CalendarScreen({ badgeLabel }: CalendarScreenProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <CalendarProvider events={[]} users={[]} view="agenda">
      <DndProvider>
        <main className="my-10 flex max-h-screen flex-col">
          <div className="container p-4 md:mx-auto">
            <div className="flex items-center justify-between">
              <div className="relative h-[210px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <img
                  src="/images/turboflow.png"
                  alt="TurboFlow"
                  className="h-full w-full object-contain opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/55 to-transparent" />

                <div className="absolute inset-x-0 top-0 z-10 p-6 md:p-8">
                  <div className="inline-flex items-center rounded-full border border-orange-300/40 bg-orange-500 px-3 py-1 text-[11px] font-bold tracking-wide text-white">
                    {badgeLabel}
                  </div>
                  <p className="mt-2 max-w-2xl text-lg font-extrabold leading-tight text-white md:text-2xl">
                    Organize e planeje suas vendas
                    <br />
                    com nosso calendario
                  </p>
                  <p className="mt-1.5 max-w-xl text-xs text-slate-100 md:text-sm">
                    Controle sua operacao com mais previsibilidade, foco e
                    produtividade.
                  </p>
                </div>

                {mounted && <HeroBannerActions />}
                {mounted && (
                  <div className="absolute right-4 top-[5.75rem] z-20">
                    <HeroReportsButton />
                  </div>
                )}
              </div>
            </div>
            <Suspense fallback={<CalendarSkeleton />}>
              {mounted ? <Calendar /> : <CalendarSkeleton />}
            </Suspense>
          </div>
        </main>
      </DndProvider>
    </CalendarProvider>
  );
}
