"use client";

import { useCallback, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  BarChart3,
  CalendarCheck2,
  FileDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/responsive-modal";
import {
  PRIORITY_LABELS_PT_BR,
  STATUS_LABELS_PT_BR,
  TYPE_LABELS_PT_BR,
} from "@/features/calendar/constants/event-form.constants";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import type { TEventColor } from "@/features/calendar/types";

const COLOR_LABELS_PT_BR: Record<TEventColor, string> = {
  blue: "Azul",
  green: "Verde",
  red: "Vermelho",
  yellow: "Amarelo",
  purple: "Roxo",
  orange: "Laranja",
};

export function HeroReportsButton() {
  const {
    events,
    users,
    selectedUserIds,
    selectedStatuses,
    selectedTypes,
    selectedPriorities,
    selectedColors,
  } = useCalendar();

  const totalEvents = events.length;
  const attendedEvents = events.filter(
    (event) => event.status === "finished_sold",
  ).length;
  const notAttendedEvents = events.filter(
    (event) => event.status === "finished_not_sold",
  ).length;
  const attendanceBase = attendedEvents + notAttendedEvents;
  const attendanceRate =
    attendanceBase === 0 ? 0 : Math.round((attendedEvents / attendanceBase) * 100);

  const activeFiltersCount =
    selectedUserIds.length +
    selectedStatuses.length +
    selectedTypes.length +
    selectedPriorities.length +
    selectedColors.length;

  const selectedUserNames = useMemo(
    () =>
      users
        .filter((user) => selectedUserIds.includes(user.id))
        .map((user) => user.name),
    [selectedUserIds, users],
  );

  const pieData = useMemo(() => {
    if (totalEvents === 0) {
      return [{ label: "Sem dados", value: 100, color: "#cbd5e1" }];
    }

    const categories = [
      {
        label: "Finalizado - vendido",
        count: events.filter(
          (event) => event.status === "finished_sold",
        ).length,
        color: "#2563eb",
      },
      {
        label: "Em negociação",
        count: events.filter((event) => event.status === "in_negotiation").length,
        color: "#06b6d4",
      },
      {
        label: "Finalizado - não vendido",
        count: events.filter(
          (event) => event.status === "finished_not_sold",
        ).length,
        color: "#f97316",
      },
      {
        label: "Agendado",
        count: events.filter((event) => event.status === "scheduled").length,
        color: "#64748b",
      },
    ];

    const withRawPercent = categories.map((category) => {
      const raw = (category.count / totalEvents) * 100;
      return {
        ...category,
        raw,
        floor: Math.floor(raw),
        remainder: raw - Math.floor(raw),
      };
    });

    let missing = 100 - withRawPercent.reduce((sum, item) => sum + item.floor, 0);

    const sortedByRemainder = [...withRawPercent].sort(
      (a, b) => b.remainder - a.remainder,
    );

    const incrementMap = new Map<string, number>();
    for (const item of sortedByRemainder) {
      incrementMap.set(item.label, 0);
    }

    let index = 0;
    while (missing > 0 && sortedByRemainder.length > 0) {
      const item = sortedByRemainder[index % sortedByRemainder.length];
      incrementMap.set(item.label, (incrementMap.get(item.label) ?? 0) + 1);
      missing -= 1;
      index += 1;
    }

    return withRawPercent.map((item) => ({
      label: item.label,
      color: item.color,
      value: item.floor + (incrementMap.get(item.label) ?? 0),
    }));
  }, [events, totalEvents]);

  const meetingsPerDay = useMemo(() => {
    const base = [
      { day: "Seg", weekIndex: 1, meetings: 0 },
      { day: "Ter", weekIndex: 2, meetings: 0 },
      { day: "Qua", weekIndex: 3, meetings: 0 },
      { day: "Qui", weekIndex: 4, meetings: 0 },
      { day: "Sex", weekIndex: 5, meetings: 0 },
      { day: "Sab", weekIndex: 6, meetings: 0 },
      { day: "Dom", weekIndex: 0, meetings: 0 },
    ];

    for (const event of events) {
      const eventDate = parseISO(event.startDate);
      const weekDay = eventDate.getDay();
      const dayBucket = base.find((item) => item.weekIndex === weekDay);
      if (dayBucket) {
        dayBucket.meetings += 1;
      }
    }

    return base.map(({ day, meetings }) => ({ day, meetings }));
  }, [events]);

  const maxMeetings = Math.max(
    1,
    ...meetingsPerDay.map((item) => item.meetings),
  );

  const pieChartBackground = useMemo(
    () =>
      `conic-gradient(${pieData
        .map((item, index) => {
          const start = pieData
            .slice(0, index)
            .reduce((sum, current) => sum + current.value, 0);
          const end = start + item.value;
          return `${item.color} ${start}% ${end}%`;
        })
        .join(", ")})`,
    [pieData],
  );

  const reportSummary = [
    {
      label: "Agendamentos exibidos",
      value: totalEvents,
      icon: CalendarCheck2,
    },
    {
      label: "Taxa de comparecimento",
      value: `${attendanceRate}%`,
      icon: Users,
    },
    {
      label: "Produtividade da agenda",
      value: `${Math.max(0, 100 - Math.round((notAttendedEvents / Math.max(totalEvents, 1)) * 100))}%`,
      icon: TrendingUp,
    },
    {
      label: "Filtros ativos",
      value: activeFiltersCount,
      icon: BarChart3,
    },
  ];

  const filterGroups = [
    {
      title: "Responsaveis",
      values: selectedUserNames,
      emptyLabel: "Todos",
    },
    {
      title: "Status",
      values: selectedStatuses.map((status) => STATUS_LABELS_PT_BR[status]),
      emptyLabel: "Todos",
    },
    {
      title: "Tipo",
      values: selectedTypes.map((type) => TYPE_LABELS_PT_BR[type]),
      emptyLabel: "Todos",
    },
    {
      title: "Prioridade",
      values: selectedPriorities.map(
        (priority) => PRIORITY_LABELS_PT_BR[priority],
      ),
      emptyLabel: "Todas",
    },
    {
      title: "Cor",
      values: selectedColors.map((color) => COLOR_LABELS_PT_BR[color]),
      emptyLabel: "Todas",
    },
  ];

  const generatedAt = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR });

  const handleExportPdf = useCallback(() => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 40;
    const marginYTitle = 225;
    const marginYGenerated = 250;


    doc.setFont("Times New Roman", "bold");
    doc.setFontSize(18);
    doc.text("Relatorios do Calendario", marginYTitle, 44);
    doc.setFont("Times New Roman", "normal");
    doc.setFontSize(11);
    doc.text(`Gerado em: ${generatedAt}`, marginYGenerated, 62);

    autoTable(doc, {
      startY: 80,
      margin: { left: marginX, right: marginX },
      head: [["Resumo", "Valor"]],
      body: reportSummary.map((item) => [item.label, String(item.value)]),
      theme: "grid",
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: "right" } },
    });

    autoTable(doc, {
      startY: (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16,
      margin: { left: marginX, right: marginX },
      head: [["Filtros aplicados", "Selecao"]],
      body: filterGroups.map((group) => [
        group.title,
        group.values.length > 0 ? group.values.join(", ") : group.emptyLabel,
      ]),
      theme: "grid",
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 10 },
    });

    autoTable(doc, {
      startY: (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16,
      margin: { left: marginX, right: marginX },
      head: [["Agendamentos por dia", "Total"]],
      body: meetingsPerDay.map((item) => [item.day, String(item.meetings)]),
      theme: "grid",
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: "right" } },
    });

    autoTable(doc, {
      startY: (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 16,
      margin: { left: marginX, right: marginX },
      head: [["Distribuicao de status", "Percentual"]],
      body: pieData.map((item) => [item.label, `${item.value}%`]),
      theme: "grid",
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 10 },
      columnStyles: { 1: { halign: "right" } },
    });

    const generatedAtFile = format(new Date(), "yyyyMMdd-HHmm");
    doc.save(`relatorio-calendario-${generatedAtFile}.pdf`);
  }, [filterGroups, generatedAt, meetingsPerDay, pieData, reportSummary]);

  return (
    <Modal>
      <ModalTrigger asChild>
        <Button
          className="mt-4 h-10 rounded-lg bg-blue-500 px-4 font-semibold text-white shadow-md shadow-blue-900/30 hover:bg-blue-600 active:scale-[0.98]"
          size="sm"
        >
          <BarChart3 className="size-4" />
          Ver Relatorios
        </Button>
      </ModalTrigger>

      <ModalContent
        side="right"
        className="h-dvh w-full border-l border-slate-200 bg-slate-50 p-0 sm:max-w-xl lg:h-dvh lg:max-w-2xl"
      >
        <div className="flex h-full min-h-0 flex-col">
          <ModalHeader className="shrink-0 border-b border-slate-200 px-6 py-5">
            <div className="flex items-start justify-between gap-3">
              <ModalTitle>Relatorios do Calendario</ModalTitle>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="mr-10 border-blue-600 bg-white text-blue-800 hover:border-orange-400 hover:bg-orange-100 hover:text-orange-800"
                onClick={handleExportPdf}
              >
                <FileDown className="size-4" />
                Exportar PDF
              </Button>
            </div>
            <ModalDescription id="responsive-modal-description">
              Dados simulados para acompanhamento de reunioes, comparecimento e
              produtividade da equipe. Visao expandida para leitura gerencial.
            </ModalDescription>
          </ModalHeader>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <div className="grid gap-3 md:grid-cols-2">
              {reportSummary.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase">
                        {item.label}
                      </p>
                      <p className="mt-1 text-2xl font-semibold text-slate-900">
                        {item.value}
                      </p>
                    </div>
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                      <item.icon className="size-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Filtros de agendamento aplicados
                </h3>
                <p className="text-xs text-slate-500">
                  Resumo dos filtros atualmente selecionados na agenda.
                </p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {filterGroups.map((group) => (
                  <div
                    key={group.title}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <p className="mb-2 text-xs font-semibold text-slate-600 uppercase">
                      {group.title}
                    </p>
                    {group.values.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {group.values.map((value) => (
                          <span
                            key={`${group.title}-${value}`}
                            className="rounded-full bg-blue-100 px-2 py-1 text-[11px] font-medium text-blue-800"
                          >
                            {value}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">{group.emptyLabel}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Agendamentos por dia da semana
                  </h3>
                  <p className="text-xs text-slate-500">
                    Distribuicao real com base na agenda filtrada atual.
                  </p>
                </div>

                <div className="space-y-3">
                  {meetingsPerDay.map((item) => (
                    <div key={item.day} className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span>{item.day}</span>
                        <span>{item.meetings} reunioes</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${(item.meetings / maxMeetings) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Distribuicao de status
                  </h3>
                  <p className="text-xs text-slate-500">
                    Grafico em pizza com base na agenda filtrada atual.
                  </p>
                </div>

                <div className="flex items-center justify-center py-2">
                  <div
                    className="relative h-40 w-40 rounded-full"
                    style={{ background: pieChartBackground }}
                  >
                    <div className="absolute inset-6 flex items-center justify-center rounded-full bg-white text-center">
                      <div>
                        <p className="text-xs text-slate-500">Total</p>
                        <p className="text-lg font-bold text-slate-900">100%</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {pieData.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center gap-2 text-slate-700">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.label}</span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
