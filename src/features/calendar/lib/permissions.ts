export const PERMISSION_LEVELS = {
  EMPLOYEE: 1,
  MANAGER: 2,
} as const;

export function isManager(permissionLevel?: number | null) {
  return permissionLevel === PERMISSION_LEVELS.MANAGER;
}

export function isEmployee(permissionLevel?: number | null) {
  return permissionLevel === PERMISSION_LEVELS.EMPLOYEE;
}

export function canManageEvent(
  eventOwnerId: string | undefined,
  currentUserId: string | undefined,
  isManagerUser: boolean,
) {
  if (isManagerUser) return true;
  if (!currentUserId || !eventOwnerId) return false;
  return currentUserId === eventOwnerId;
}
