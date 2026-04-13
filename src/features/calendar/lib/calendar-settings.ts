import type { CalendarSettings } from "@/features/calendar/contexts/calendar-context.types";

export const DEFAULT_CALENDAR_SETTINGS: CalendarSettings = {
    badgeVariant: 'colored',
    view: 'day',
    use24HourFormat: true,
    agendaModeGroupBy: 'date'
}

export function mergeCalendarSettings(
    current: CalendarSettings,
    updates: Partial<CalendarSettings>,): CalendarSettings {
    return {
        ...current,
        ...updates
    };
}
