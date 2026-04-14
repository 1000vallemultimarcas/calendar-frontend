import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/features/calendar/lib/utils";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import type { TEventFormData } from "@/features/calendar/schemas";

interface DatePickerProps {
  form: UseFormReturn<TEventFormData>;
  field: ControllerRenderProps<TEventFormData, "endDate" | "startDate">;
}

export function DateTimePicker({ form, field }: DatePickerProps) {
  const { use24HourFormat } = useCalendar();

  const selectedDate = field.value ?? new Date();

  function handleDateSelect(date: Date | undefined) {
    if (!date) return;

    const currentDate = form.getValues(field.name) || new Date();
    const nextDate = new Date(date);

    nextDate.setHours(currentDate.getHours());
    nextDate.setMinutes(currentDate.getMinutes());
    nextDate.setSeconds(0);
    nextDate.setMilliseconds(0);

    form.setValue(field.name, nextDate, { shouldValidate: true });
  }

  function handleTimeChange(type: "hour" | "minute" | "ampm", value: string) {
    const currentDate = form.getValues(field.name) || new Date();
    const newDate = new Date(currentDate);

    if (type === "hour") {
      const numericHour = parseInt(value, 10);

      if (use24HourFormat) {
        newDate.setHours(numericHour);
      } else {
        const currentHours = newDate.getHours();
        const isPM = currentHours >= 12;
        const normalizedHour = numericHour % 12;

        newDate.setHours(isPM ? normalizedHour + 12 : normalizedHour);
      }
    }

    if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    }

    if (type === "ampm") {
      const hours = newDate.getHours();

      if (value === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      }

      if (value === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    newDate.setSeconds(0);
    newDate.setMilliseconds(0);

    form.setValue(field.name, newDate, { shouldValidate: true });
  }

  const hourOptions = use24HourFormat
    ? Array.from({ length: 24 }, (_, i) => i)
    : Array.from({ length: 12 }, (_, i) => i + 1);

  const selectedHour = use24HourFormat
    ? selectedDate.getHours()
    : ((selectedDate.getHours() + 11) % 12) + 1;

  const selectedMinute = selectedDate.getMinutes();
  const isPM = selectedDate.getHours() >= 12;

  return (
    <FormItem className="flex flex-col">
      <FormLabel>
        {field.name === "startDate" ? "Data inicial" : "Data final"}
      </FormLabel>

      <Popover modal={false}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-between pl-3 text-left font-normal",
                !field.value && "text-muted-foreground",
              )}
            >
              {field.value ? (
                format(
                  field.value,
                  use24HourFormat ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy hh:mm aa",
                )
              ) : (
                <span>Selecione data e hora</span>
              )}

              <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="z-[80] w-[340px] max-w-[95vw] overflow-hidden rounded-xl p-0 shadow-xl"
        >
          <div className="flex flex-col">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={handleDateSelect}
              initialFocus
            />

            <div className="grid grid-cols-2 border-t sm:grid-cols-3">
              <ScrollArea className="h-44 border-r">
                <div className="grid gap-1 p-2">
                  {hourOptions.map((hour) => (
                    <Button
                      key={hour}
                      type="button"
                      size="sm"
                      variant={selectedHour === hour ? "default" : "ghost"}
                      className="w-full justify-center"
                      onClick={() => handleTimeChange("hour", hour.toString())}
                    >
                      {hour.toString().padStart(2, "0")}
                    </Button>
                  ))}
                </div>
              </ScrollArea>

              <ScrollArea className="h-44 border-r">
                <div className="grid gap-1 p-2">
                  {Array.from({ length: 12 }, (_, i) => i * 5).map((minute) => (
                    <Button
                      key={minute}
                      type="button"
                      size="sm"
                      variant={selectedMinute === minute ? "default" : "ghost"}
                      className="w-full justify-center"
                      onClick={() =>
                        handleTimeChange("minute", minute.toString())
                      }
                    >
                      {minute.toString().padStart(2, "0")}
                    </Button>
                  ))}
                </div>
              </ScrollArea>

              {!use24HourFormat && (
                <div className="grid gap-1 p-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={!isPM ? "default" : "ghost"}
                    className="w-full"
                    onClick={() => handleTimeChange("ampm", "AM")}
                  >
                    AM
                  </Button>

                    <Button
                    type="button"
                    size="sm"
                    variant={isPM ? "default" : "ghost"}
                    className="w-full"
                    onClick={() => handleTimeChange("ampm", "PM")}
                  >
                    PM
                  </Button>
                </div>
              )}
            </div>
          </div>

        </PopoverContent>
      </Popover>

      <FormMessage />
    </FormItem>
  );
}
