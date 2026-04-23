import type { ReactNode } from "react";
import type { ICustomer, IUser, IEvent } from "@/features/calendar/interfaces";
import type { UseFormReturn } from "react-hook-form";
import type { TEventFormData } from "@/features/calendar/schemas";

export interface AddEditEventDialogProps {
  children?: ReactNode;
  startDate?: Date;
  startTime?: { hour: number; minute: number };
  event?: IEvent;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface EventDialogFormSectionsProps {
  form: UseFormReturn<TEventFormData>;
  users?: IUser[];
  customers?: ICustomer[];
  isLoadingCustomers?: boolean;
  isUserSelectionDisabled?: boolean;
  currentUserId?: IUser["id"];
}
