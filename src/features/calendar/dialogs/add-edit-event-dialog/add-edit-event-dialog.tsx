import type { AddEditEventDialogProps } from "./event-dialog.types";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from "@/components/ui/responsive-modal";
import { EventBasicFields } from "./sections/event-basic-fields";
import { EventMetaFields } from "./sections/event-meta-fields";
import { EventScheduleFields } from "./sections/event-schedule-fields";
import { EVENT_FORM_TEXTS_PT_BR } from "@/features/calendar/constants/event-form.constants";
import { useEventDialogForm } from "./use-event-dialog-form";

export function AddEditEventDialog({
  children,
  event,
  startDate,
  startTime,
}: AddEditEventDialogProps) {
  const {
    form,
    isOpen,
    setIsOpen,
    onSubmit,
    isEditing,
    users,
    isUserSelectionDisabled,
    currentUserId,
  } = useEventDialogForm({
    event,
    startDate,
    startTime,
  });

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalTrigger asChild>{children}</ModalTrigger>

      <ModalContent className="max-w-[95vw] sm:max-w-175">
        <ModalHeader>
          <ModalTitle>
            {isEditing
              ? EVENT_FORM_TEXTS_PT_BR.editTitle
              : EVENT_FORM_TEXTS_PT_BR.createTitle}
          </ModalTitle>
          <ModalDescription>
            {isEditing
              ? EVENT_FORM_TEXTS_PT_BR.editDescription
              : EVENT_FORM_TEXTS_PT_BR.createDescription}
          </ModalDescription>
        </ModalHeader>

        <Form {...form}>
          <form
            id="event-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-6 py-4"
          >
            <EventBasicFields form={form} />
            <EventScheduleFields form={form} />
            <EventMetaFields
              form={form}
              users={users}
              isUserSelectionDisabled={isUserSelectionDisabled}
              currentUserId={currentUserId}
            />
          </form>
        </Form>

        <ModalFooter className="flex justify-end gap-2">
          <ModalClose asChild>
            <Button type="button" variant="outline">
              {EVENT_FORM_TEXTS_PT_BR.cancelButton}
            </Button>
          </ModalClose>

          <Button
            form="event-form"
            type="submit"
            className="bg-orange-600 text-white hover:bg-orange-700"
          >
            {isEditing
              ? EVENT_FORM_TEXTS_PT_BR.editButton
              : EVENT_FORM_TEXTS_PT_BR.createButton}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
