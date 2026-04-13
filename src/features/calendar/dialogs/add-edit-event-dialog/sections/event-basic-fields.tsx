import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_FORM_TEXTS_PT_BR } from "@/features/calendar/constants/event-form.constants";
import type { EventDialogFormSectionsProps } from "../event-dialog.types";

export function EventBasicFields({ form }: EventDialogFormSectionsProps) {
  return (
    <div className="grid gap-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel htmlFor="title" className="required">
              {EVENT_FORM_TEXTS_PT_BR.titleLabel}
            </FormLabel>
            <FormControl>
              <Input
                id="title"
                placeholder={EVENT_FORM_TEXTS_PT_BR.titlePlaceholder}
                {...field}
                className={fieldState.invalid ? "border-red-500" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="required">
              {EVENT_FORM_TEXTS_PT_BR.descriptionLabel}
            </FormLabel>
            <FormControl>
              <Textarea
                {...field}
                placeholder={EVENT_FORM_TEXTS_PT_BR.descriptionPlaceholder}
                className={fieldState.invalid ? "border-red-500" : ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
