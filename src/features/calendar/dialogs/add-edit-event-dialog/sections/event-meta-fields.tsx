import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EVENT_FORM_TEXTS_PT_BR } from "@/features/calendar/constants/event-form.constants";
import { EVENT_PRIORITIES } from "@/features/calendar/constants";
import { PRIORITY_LABELS_PT_BR } from "@/features/calendar/constants/event-form.constants";
import type { EventDialogFormSectionsProps } from "../event-dialog.types";

export function EventMetaFields({
  form,
  users,
  isUserSelectionDisabled,
  currentUserId,
}: EventDialogFormSectionsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <FormField
        control={form.control}
        name="priority"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel className="required">
              {EVENT_FORM_TEXTS_PT_BR.priorityLabel}
            </FormLabel>
            <FormControl>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={`w-full ${fieldState.invalid ? "border-red-500" : ""}`}
                >
                  <SelectValue
                    placeholder={EVENT_FORM_TEXTS_PT_BR.priorityPlaceholder}
                  />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_PRIORITIES.map((priority) => (
                    <SelectItem value={priority} key={priority}>
                      {PRIORITY_LABELS_PT_BR[priority]}
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
        name="userId"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>{EVENT_FORM_TEXTS_PT_BR.responsibleLabel}</FormLabel>
            <FormControl>
              {isUserSelectionDisabled ? (
                <div className="space-y-2">
                  <div className="rounded-lg border px-3 py-2 text-sm text-muted-foreground">
                    {users?.find((current) => current.id === currentUserId)?.name ??
                      "Meu perfil"}
                  </div>
                  <Input type="hidden" {...field} />
                </div>
              ) : (
                <Select value={field.value || undefined} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={`w-full ${fieldState.invalid ? "border-red-500" : ""}`}
                  >
                    <SelectValue
                      placeholder={EVENT_FORM_TEXTS_PT_BR.responsiblePlaceholder}
                    />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {users?.map((user) => (
                      <SelectItem value={user.id} key={user.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarImage
                              src={user.picturePath ?? undefined}
                              alt={user.name}
                            />
                            <AvatarFallback
                              className="text-xxs text-white"
                              style={{ backgroundColor: user.userColor }}
                            >
                              {user.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
