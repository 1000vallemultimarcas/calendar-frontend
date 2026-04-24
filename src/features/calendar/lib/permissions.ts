export const PERMISSION_LEVELS = {
	EMPLOYEE: 1,
	MANAGER: 2,
	GENERAL_MANAGER: 3,
	ADMINISTRATOR: 4,
} as const;

export function canManageCalendar(permissionLevel?: number | null) {
	return (permissionLevel ?? 0) >= PERMISSION_LEVELS.MANAGER;
}

export function isManager(permissionLevel?: number | null) {
	return (permissionLevel ?? 0) >= PERMISSION_LEVELS.MANAGER;
}

export function isEmployee(permissionLevel?: number | null) {
	return permissionLevel === PERMISSION_LEVELS.EMPLOYEE;
}

export function isGeneralManager(permissionLevel?: number | null) {
	return permissionLevel === PERMISSION_LEVELS.GENERAL_MANAGER;
}

export function isAdministrator(permissionLevel?: number | null) {
	return permissionLevel === PERMISSION_LEVELS.ADMINISTRATOR;
}

export function isSeniorManager(permissionLevel?: number | null) {
	return (permissionLevel ?? 0) >= PERMISSION_LEVELS.GENERAL_MANAGER;
}

export function canManageEvent(
	_eventOwnerId: string | undefined,
	_currentUserId: string | undefined,
	isManagerUser: boolean,
) {
	return isManagerUser;
}
