import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { type ReactNode, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  EVENT_PRIORITIES,
  EVENT_STATUSES,
  EVENT_TYPES,
} from "@/features/calendar/constants";
import {
  EVENT_FORM_TEXTS_PT_BR,
  PRIORITY_LABELS_PT_BR,
  STATUS_LABELS_PT_BR,
  TYPE_LABELS_PT_BR,
} from "@/features/calendar/constants/event-form.constants";
import { useCalendar } from "@/features/calendar/contexts/calendar-context";
import { useDisclosure } from "@/features/calendar/hooks";
import type { IEvent } from "@/features/calendar/interfaces";
import { getColorByType, getInitialDates } from "@/features/calendar/lib/event-form.utils";
import { eventSchema, type TEventFormData } from "@/features/calendar/schemas";

interface IProps {
  children: ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
  event?: IEvent;
}

export function AddEditEventDialog({
  children,
  startDate,
  startTime,
  event,
}: IProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { addEvent, updateEvent, users } = useCalendar();
  const isEditing = !!event;

  const initialDates = useMemo(
    () =>
      getInitialDates({
        startDate,
        startTime,
        event,
        isEditing,
      }),
    [startDate, startTime, event, isEditing],
  );

  const defaultUserId = event?.user?.id ?? users[0]?.id ?? "";

  const form = useForm<TEventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title ?? "",
      description: event?.description ?? "",
      startDate: initialDates.startDate,
      endDate: initialDates.endDate,
      status: event?.status ?? "scheduled",
      type: event?.type ?? "appointment",
      priority: event?.priority ?? "normal",
      userId: defaultUserId,
      color: event?.color ?? getColorByType(event?.type ?? "appointment"),
    },
  });

  useEffect(() => {
    form.reset({
      title: event?.title ?? "",
      description: event?.description ?? "",
      startDate: initialDates.startDate,
      endDate: initialDates.endDate,
      status: event?.status ?? "scheduled",
      type: event?.type ?? "appointment",
      priority: event?.priority ?? "normal",
      userId: event?.user?.id ?? users[0]?.id ?? "",
      color: event?.color ?? getColorByType(event?.type ?? "appointment"),
    });
  }, [event, initialDates, users, form]);

  const onSubmit = (values: TEventFormData) => {
    try {
      const selectedUser = users.find((user) => user.id === values.userId);

      const eventUser =
        selectedUser ?? event?.user ?? users[0] ?? {
          id: values.userId,
          name: "Responsável não identificado",
          picturePath: null,
        };

      const formattedEvent: IEvent = {
        id: isEditing ? event.id : Math.floor(Math.random() * 1000000),
        title: values.title,
        description: values.description,
        startDate: format(values.startDate, "yyyy-MM-dd'T'HH:mm:ss"),
        endDate: format(values.endDate, "yyyy-MM-dd'T'HH:mm:ss"),
        status: values.status,
        type: values.type,
        priority: values.priority,
        user: eventUser,
        color: getColorByType(values.type),
      };

      if (isEditing) {
        updateEvent(formattedEvent);
        toast.success(EVENT_FORM_TEXTS_PT_BR.editSuccess);
      } else {
        addEvent(formattedEvent);
        toast.success(EVENT_FORM_TEXTS_PT_BR.createSuccess);
      }

      onClose();
      form.reset();
    } catch (error) {
      console.error(
        `Erro ao ${isEditing ? "editar" : "criar"} agendamento:`,
        error,
      );
      toast.error(
        isEditing
          ? EVENT_FORM_TEXTS_PT_BR.editError
          : EVENT_FORM_TEXTS_PT_BR.createError,
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? onOpen() : onClose())}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="z-60 w-[min(95vw,630px)] max-h-[90dvh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? EVENT_FORM_TEXTS_PT_BR.editTitle
              : EVENT_FORM_TEXTS_PT_BR.createTitle}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? EVENT_FORM_TEXTS_PT_BR.editDescription
              : EVENT_FORM_TEXTS_PT_BR.createDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[70vh] pr-2">
          <Form {...form}>
            <form
              id="event-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-4 py-4"
            >
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
              name="startDate"
              render={({ field }) => (
                <DateTimePicker form={form} field={field} />
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <DateTimePicker form={form} field={field} />
              )}
            />

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
                          className={`w-full ${
                            fieldState.invalid ? "border-red-500" : ""
                          }`}
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
                          className={`w-full ${
                            fieldState.invalid ? "border-red-500" : ""
                          }`}
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
                          className={`w-full ${
                            fieldState.invalid ? "border-red-500" : ""
                          }`}
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
                    <FormLabel className="required">
                      {EVENT_FORM_TEXTS_PT_BR.responsibleLabel}
                    </FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger
                          className={`w-full ${
                            fieldState.invalid ? "border-red-500" : ""
                          }`}
                        >
                          <SelectValue
                            placeholder={EVENT_FORM_TEXTS_PT_BR.responsiblePlaceholder}
                          />
                        </SelectTrigger>
                        <SelectContent align="end">
                          {users.map((user) => (
                            <SelectItem value={user.id} key={user.id}>
                              <div className="flex items-center gap-2">
                                <Avatar className="size-6">
                                  <AvatarImage
                                    src={user.picturePath ?? undefined}
                                    alt={user.name}
                                  />
                                  <AvatarFallback className="text-xxs">
                                    {user.name[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{user.name}</span>
                              </div>
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
          </form>
        </Form>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">
              {EVENT_FORM_TEXTS_PT_BR.cancelButton}
            </Button>
          </DialogClose>

          <Button form="event-form" type="submit">
            {isEditing
              ? EVENT_FORM_TEXTS_PT_BR.editButton
              : EVENT_FORM_TEXTS_PT_BR.createButton}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}