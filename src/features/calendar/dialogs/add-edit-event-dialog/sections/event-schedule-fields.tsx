import { DateTimePicker } from "@/components/ui/date-time-picker";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EVENT_FORM_TEXTS_PT_BR } from "@/features/calendar/constants/event-form.constants";
import { EVENT_STATUSES, EVENT_TYPES } from "@/features/calendar/constants";
import { STATUS_LABELS_PT_BR, TYPE_LABELS_PT_BR } from "@/features/calendar/constants/event-form.constants";
import type { EventDialogFormSectionsProps } from "../event-dialog.types";

export function EventScheduleFields({ form }: EventDialogFormSectionsProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => <DateTimePicker form={form} field={field} />}
        />

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => <DateTimePicker form={form} field={field} />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FormField
          control={form.control}
          name="status"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="required">
                {EVENT_FORM_TEXTS_PT_BR.statusLabel}
              </FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={`w-full ${fieldState.invalid ? "border-red-500" : ""}`}
                  >
                    <SelectValue
                      placeholder={EVENT_FORM_TEXTS_PT_BR.statusPlaceholder}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_STATUSES.map((status) => (
                      <SelectItem value={status} key={status}>
                        {STATUS_LABELS_PT_BR[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel className="required">
                {EVENT_FORM_TEXTS_PT_BR.typeLabel}
              </FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={`w-full ${fieldState.invalid ? "border-red-500" : ""}`}
                  >
                    <SelectValue
                      placeholder={EVENT_FORM_TEXTS_PT_BR.typePlaceholder}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem value={type} key={type}>
                        {TYPE_LABELS_PT_BR[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
