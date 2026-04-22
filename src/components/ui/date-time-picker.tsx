import { addMinutes, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { DayPicker } from "@/components/ui/day-picker";
import {
	FormControl,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { cn } from "@/features/calendar/lib/utils";
import type { TEventFormData } from "@/features/calendar/schemas";

interface DatePickerProps {
	form: UseFormReturn<TEventFormData>;
	field: ControllerRenderProps<TEventFormData, "endDate" | "startDate">;
	minDate?: Date;
}

export function DateTimePicker({ form, field, minDate }: DatePickerProps) {
	const { use24HourFormat } = useCalendar();

	const displayFormat = useMemo(
		() => (use24HourFormat ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy hh:mm aa"),
		[use24HourFormat],
	);

	const selectedDate = field.value ?? new Date();
	const [manualValue, setManualValue] = useState(
		field.value ? format(field.value, displayFormat) : "",
	);

	useEffect(() => {
		setManualValue(field.value ? format(field.value, displayFormat) : "");
	}, [field.value, displayFormat]);

	function syncDateValue(nextDate: Date) {
		if (minDate && nextDate.getTime() < minDate.getTime()) {
			form.setError(field.name, {
				type: "manual",
				message:
					field.name === "startDate"
						? "Data e hora inicial nao podem ser retroativas ao momento atual"
						: "Data final nao pode ser anterior a data inicial",
			});
			return;
		}

		form.setValue(field.name, nextDate, {
			shouldValidate: true,
			shouldDirty: true,
		});
		form.clearErrors(field.name);

		if (field.name === "startDate") {
			form.setValue("endDate", addMinutes(nextDate, 30), {
				shouldValidate: true,
				shouldDirty: true,
			});
			form.clearErrors("endDate");
		}
	}

	function parseTypedDateTime(value: string) {
		const match = value
			.trim()
			.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/);

		if (!match) return null;

		const [, dayText, monthText, yearText, hourText, minuteText] = match;
		const day = Number(dayText);
		const month = Number(monthText);
		const year = Number(yearText);
		const hour = Number(hourText);
		const minute = Number(minuteText);

		if (
			Number.isNaN(day) ||
			Number.isNaN(month) ||
			Number.isNaN(year) ||
			Number.isNaN(hour) ||
			Number.isNaN(minute)
		) {
			return null;
		}

		if (
			month < 1 ||
			month > 12 ||
			day < 1 ||
			day > 31 ||
			hour > 23 ||
			minute > 59
		) {
			return null;
		}

		const parsedDate = new Date(year, month - 1, day, hour, minute, 0, 0);

		if (
			parsedDate.getFullYear() !== year ||
			parsedDate.getMonth() !== month - 1 ||
			parsedDate.getDate() !== day
		) {
			return null;
		}

		return parsedDate;
	}

	function handleManualBlur() {
		if (!manualValue.trim()) {
			return;
		}

		const parsedDate = parseTypedDateTime(manualValue);

		if (!parsedDate) {
			form.setError(field.name, {
				type: "manual",
				message: "Use o formato dd/MM/aaaa HH:mm",
			});
			return;
		}

		syncDateValue(parsedDate);
	}

	function handleDateSelect(date: Date | undefined) {
		if (!date) return;

		const currentDate = form.getValues(field.name) || new Date();
		const nextDate = new Date(date);

		nextDate.setHours(currentDate.getHours());
		nextDate.setMinutes(currentDate.getMinutes());
		nextDate.setSeconds(0);
		nextDate.setMilliseconds(0);

		syncDateValue(nextDate);
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

		syncDateValue(newDate);
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

			<Popover modal>
				<div className="flex items-center gap-2">
					<FormControl>
						<Input
							value={manualValue}
							onChange={(event) => setManualValue(event.target.value)}
							onBlur={handleManualBlur}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									event.preventDefault();
									handleManualBlur();
								}
							}}
							placeholder="dd/MM/aaaa HH:mm"
							inputMode="numeric"
						/>
					</FormControl>

					<PopoverTrigger asChild>
						<Button
							type="button"
							variant="outline"
							className={cn(
								"shrink-0 px-3",
								!field.value && "text-muted-foreground",
							)}
							aria-label="Abrir calendario"
						>
							<CalendarIcon className="h-4 w-4 opacity-50" />
						</Button>
					</PopoverTrigger>
				</div>

				<PopoverContent
					side="right"
					align="center"
					sideOffset={10}
					collisionPadding={12}
					className="z-[80] h-[420px] w-[340px] max-h-[calc(100dvh-2rem)] max-w-[95vw] overflow-hidden rounded-xl p-0 shadow-xl"
				>
					<div className="flex h-full flex-col">
						<div className="flex-1 overflow-y-auto p-2">
							<DayPicker
								mode="single"
								selected={field.value}
								onSelect={handleDateSelect}
								disabled={
									minDate
										? {
												before: new Date(
													minDate.getFullYear(),
													minDate.getMonth(),
													minDate.getDate(),
												),
											}
										: undefined
								}
								locale={ptBR}
								initialFocus
								className="mx-auto w-fit p-0"
							/>
						</div>

						<div className="grid shrink-0 grid-cols-2 border-t sm:grid-cols-3">
							<ScrollArea className="h-36 border-r">
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

							<ScrollArea className="h-36 border-r">
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
