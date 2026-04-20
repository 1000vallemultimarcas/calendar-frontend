import { useState } from "react";
import { useLocalStorage } from "@/features/calendar/hooks";
import type { TCalendarView } from "@/features/calendar/types";
import type { CalendarSettings } from "@/features/calendar/contexts/calendar-context.types";
import {
  DEFAULT_CALENDAR_SETTINGS,
  mergeCalendarSettings,
} from "@/features/calendar/lib/calendar-settings";

type UseCalendarSettingsStateParams = {
  initialBadge?: "dot" | "colored";
  initialView?: TCalendarView;
};

export function useCalendarSettingsState({
  initialBadge = "colored",
  initialView = "day",
}: UseCalendarSettingsStateParams) {
  const [settings, setSettings] = useLocalStorage<CalendarSettings>(
    "turboflow-calendar-settings",
    {
      ...DEFAULT_CALENDAR_SETTINGS,
      badgeVariant: initialBadge,
      view: initialView,
    },
  );

  const [badgeVariant, setBadgeVariantState] = useState(settings.badgeVariant);
  const [view, setViewState] = useState(settings.view);
  const [use24HourFormat, setUse24HourFormatState] = useState(
    settings.use24HourFormat,
  );
  const [agendaModeGroupBy, setAgendaModeGroupByState] = useState(
    settings.agendaModeGroupBy,
  );

  const updateSettings = (newPartialSettings: Partial<CalendarSettings>) => {
    setSettings(mergeCalendarSettings(settings, newPartialSettings));
  };

  const setBadgeVariant = (variant: "dot" | "colored") => {
    setBadgeVariantState(variant);
    updateSettings({ badgeVariant: variant });
  };

  const setView = (newView: TCalendarView) => {
    setViewState(newView);
    updateSettings({ view: newView });
  };

  const toggleTimeFormat = () => {
    const nextValue = !use24HourFormat;
    setUse24HourFormatState(nextValue);
    updateSettings({ use24HourFormat: nextValue });
  };

  const setAgendaModeGroupBy = (groupBy: "date" | "color") => {
    setAgendaModeGroupByState(groupBy);
    updateSettings({ agendaModeGroupBy: groupBy });
  };

  return {
    badgeVariant,
    setBadgeVariant,
    view,
    setView,
    use24HourFormat,
    toggleTimeFormat,
    agendaModeGroupBy,
    setAgendaModeGroupBy,
  };
}
