"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { AddEditEventDialog } from "@/features/calendar/dialogs/add-edit-event-dialog";
import { EVENT_PRIORITIES, EVENT_STATUSES, EVENT_TYPES } from "@/features/calendar/constants";
import type { TEventFormData } from "@/features/calendar/schemas";
import type { TEventPriority, TEventStatus } from "@/features/calendar/types";

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s-]+/g, "_");
}

function parseStatus(rawValue: string | null): TEventStatus | undefined {
  if (!rawValue) {
    return undefined;
  }

  const normalized = normalizeText(rawValue);
  const map: Record<string, TEventStatus> = {
    not_contacted: "not_contacted",
    nao_atendido: "not_contacted",
    not_attended: "not_contacted",
    in_negotiation: "in_negotiation",
    em_negociacao: "in_negotiation",
    not_read: "not_read",
    nao_lido: "not_read",
    scheduled: "scheduled",
    agendado: "scheduled",
    finished_sold: "finished_sold",
    finalizado_vendido: "finished_sold",
    finished_not_sold: "finished_not_sold",
    finalizado_nao_vendido: "finished_not_sold",
  };

  const status = map[normalized];
  if (!status) {
    return undefined;
  }

  return EVENT_STATUSES.includes(status) ? status : undefined;
}

function parseLeadImportance(rawValue: string | null): TEventPriority | undefined {
  if (!rawValue) {
    return undefined;
  }

  const normalized = normalizeText(rawValue);
  const map: Record<string, TEventPriority> = {
    frio: "frio",
    low: "frio",
    morno: "morno",
    normal: "morno",
    quente: "quente",
    high: "quente",
    urgent: "quente",
  };

  const priority = map[normalized];
  if (!priority) {
    return undefined;
  }

  return EVENT_PRIORITIES.includes(priority) ? priority : undefined;
}

function parseDate(rawValue: string | null): Date | undefined {
  if (!rawValue) {
    return undefined;
  }

  const parsed = new Date(rawValue);
  if (Number.isNaN(parsed.getTime())) {
    return undefined;
  }

  return parsed;
}

export function ExternalEventLinkDialog() {
  const searchParams = useSearchParams();

  const shouldOpen = useMemo(() => {
    const rawOpen = searchParams.get("createEvent");
    return rawOpen === "1" || rawOpen === "true";
  }, [searchParams]);

  const prefillValues = useMemo<Partial<TEventFormData>>(() => {
    const startDate = parseDate(searchParams.get("startDate"));
    const endDate = parseDate(searchParams.get("endDate"));
    const status = parseStatus(
      searchParams.get("negotiationStatus") ?? searchParams.get("status"),
    );
    const priority = parseLeadImportance(
      searchParams.get("leadImportance") ?? searchParams.get("priority"),
    );
    const type = searchParams.get("type");
    const userId = searchParams.get("attendantId") ?? searchParams.get("userId");
    const managerId = searchParams.get("managerId");
    const title = searchParams.get("title");
    const description = searchParams.get("description");
    const customerPhone = searchParams.get("customerPhone");
    const customerId = searchParams.get("customerId");

    return {
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(startDate ? { startDate } : {}),
      ...(endDate ? { endDate } : {}),
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(type && EVENT_TYPES.includes(type as (typeof EVENT_TYPES)[number])
        ? { type: type as (typeof EVENT_TYPES)[number] }
        : {}),
      ...(userId ? { userId } : {}),
      ...(managerId ? { managerId } : {}),
      ...(customerPhone ? { customerPhone } : {}),
      ...(customerId ? { customerId } : {}),
    };
  }, [searchParams]);

  if (!shouldOpen) {
    return null;
  }

  return (
    <AddEditEventDialog
      autoOpen
      autoOpenKey={searchParams.toString()}
      startDate={prefillValues.startDate}
      prefillValues={prefillValues}
    >
      <span className="hidden" aria-hidden />
    </AddEditEventDialog>
  );
}

