import { motion } from "framer-motion";
import type React from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/features/calendar/contexts/authContext";
import { useDragDrop } from "@/features/calendar/contexts/dnd-context";
import type { IEvent } from "@/features/calendar/interfaces";
import { canManageEvent } from "@/features/calendar/lib/permissions";

interface DraggableEventProps {
  event: IEvent;
  children: ReactNode;
  className?: string;
}

export function DraggableEvent({
  event,
  children,
  className,
}: DraggableEventProps) {
  const { startDrag, endDrag, isDragging, draggedEvent } = useDragDrop();
  const { user, isManager } = useAuth();
  const canModify = canManageEvent(event.user?.id, user?.userId, isManager);

  const isCurrentlyDragged = isDragging && draggedEvent?.id === event.id;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <motion.div
      className={`${className || ""} ${isCurrentlyDragged ? "opacity-50 cursor-grabbing" : canModify ? "cursor-grab" : "cursor-default"}`}
      draggable={canModify}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => handleClick(e)}
      onDragStart={(e) => {
        if (!canModify) return;
        (e as DragEvent).dataTransfer!.setData(
          "text/plain",
          event.id.toString(),
        );
        startDrag(event);
      }}
      onDragEnd={() => {
        if (canModify) {
          endDrag();
        }
      }}
    >
      {children}
    </motion.div>
  );
}
