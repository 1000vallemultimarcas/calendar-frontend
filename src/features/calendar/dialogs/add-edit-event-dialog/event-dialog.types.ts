import type { ReactNode } from "react";
import type { IUser, IEvent } from "@/features/calendar/interfaces";
import type { UseFormReturn } from "react-hook-form";
import type { TEventFormData } from "@/features/calendar/schemas";

export interface AddEditEventDialogProps {
  children: ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
  event?: IEvent;
}

export interface EventDialogFormSectionsProps {
  form: UseFormReturn<TEventFormData>;
<<<<<<< HEAD
  users?: IUser[];
  isUserSelectionDisabled?: boolean;
  currentUserId?: IUser["id"];
=======
  users: IUser[];
>>>>>>> 71cc2b3 (feat(calendar): create reusable components and refactor add-event dialog structure)
}
