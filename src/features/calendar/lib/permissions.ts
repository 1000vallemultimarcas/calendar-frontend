export const PERMISSION_LEVELS = {
  EMPLOYEE: 1,
  MANAGER: 2,
} as const;

export function canManageCalendar(permissionLevel?: number | null) {
  return isManager(permissionLevel);
}

export function isManager(permissionLevel?: number | null) {
  // Backend can return manager-like roles above 2 (e.g. manager geral/admin).
  return (permissionLevel ?? 0) >= PERMISSION_LEVELS.MANAGER;
}

export function isEmployee(permissionLevel?: number | null) {
  return permissionLevel === PERMISSION_LEVELS.EMPLOYEE;
}

export function isSeniorManager(permissionLevel?: number | null) {
  return (permissionLevel ?? 0) > PERMISSION_LEVELS.MANAGER;
}

export function canManageEvent(
  _eventOwnerId: string | undefined,
  _currentUserId: string | undefined,
  isManagerUser: boolean,
) {
  return isManagerUser;
}
