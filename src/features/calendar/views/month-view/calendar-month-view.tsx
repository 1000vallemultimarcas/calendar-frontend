"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { staggerContainer, transition } from "@/features/calendar/animations";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { useAuth } from "@/features/calendar/contexts/authContext";
import {
  calculateMonthEventPositions,
  getCalendarCells,
} from "@/features/calendar/helpers";
import type { IEvent } from "@/features/calendar/interfaces";
import { DayCell } from "@/features/calendar/views/month-view/day-cell";

interface IProps {
  singleDayEvents: IEvent[];
  multiDayEvents: IEvent[];
}

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

export function CalendarMonthView({ singleDayEvents, multiDayEvents }: IProps) {
  const { selectedDate } = useCalendar();
  const { isManager, isEmployee, switchRole, user } = useAuth();

  const roleLabel = isManager
    ? "Gerente"
    : isEmployee
      ? "Funcionario"
      : "Sem permissao";

  const allEvents = [...multiDayEvents, ...singleDayEvents];

  const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

  const eventPositions = useMemo(
    () =>
      calculateMonthEventPositions(
        multiDayEvents,
        singleDayEvents,
        selectedDate,
      ),
    [multiDayEvents, singleDayEvents, selectedDate],
  );

  return (
    <motion.div initial="initial" animate="animate" variants={staggerContainer}>
      <div className="grid grid-cols-7">
        {WEEK_DAYS.map((day, index) => (
          <motion.div
            key={day}
            className="flex items-center justify-center py-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, ...transition }}
          >
            <span className="text-xs font-medium text-t-quaternary">{day}</span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-7 overflow-hidden">
        {cells.map((cell) => (
          <DayCell
            key={cell.date.toISOString()}
            cell={cell}
            events={allEvents}
            eventPositions={eventPositions}
          />
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
        <p className="font-medium">Permissao atual</p>
        <p className="mt-1 text-base font-semibold">{roleLabel}</p>

        <div className="mt-2 flex gap-4 text-xs text-slate-600">
          <span>Gerente: {isManager ? "Sim" : "Nao"}</span>
          <span>Funcionario: {isEmployee ? "Sim" : "Nao"}</span>
        </div>
      </div>

      <nav className="mt-4">
        <ul className="space-y-1 text-sm">
          <li>Calendario</li>
          <li>Meus compromissos</li>
          <li>
            <Button onClick={switchRole} size="sm" variant="outline">
              Trocar para {isManager ? "Funcionario" : "Gerente"}
            </Button>
          </li>
          <li>Perfil atual: {user?.name ?? "Nao identificado"}</li>
          {isManager && <li>Gestao da equipe</li>}
          {isManager && <li>Relatorios</li>}
          {isEmployee && <li>Minhas tarefas</li>}
        </ul>
      </nav>
    </motion.div>
  );
}
