import type { IUser } from "@/features/calendar/interfaces";

function hashStringToInt(value: string): number {
  let hash = 2166136261;

  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mulberry32(seed: number) {
  let state = seed;

  return function random() {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hslToHex(h: number, s: number, l: number): string {
  const saturation = s / 100;
  const lightness = l / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const huePrime = h / 60;
  const x = chroma * (1 - Math.abs((huePrime % 2) - 1));

  let r = 0;
  let g = 0;
  let b = 0;

  if (huePrime >= 0 && huePrime < 1) {
    r = chroma;
    g = x;
  } else if (huePrime < 2) {
    r = x;
    g = chroma;
  } else if (huePrime < 3) {
    g = chroma;
    b = x;
  } else if (huePrime < 4) {
    g = x;
    b = chroma;
  } else if (huePrime < 5) {
    r = x;
    b = chroma;
  } else {
    r = chroma;
    b = x;
  }

  const m = lightness - chroma / 2;
  const toHex = (channel: number) =>
    Math.round((channel + m) * 255)
      .toString(16)
      .padStart(2, "0");

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function generateStableUserColor(userId: string, attempt = 0): string {
  const seed = hashStringToInt(`${userId}:${attempt}`);
  const random = mulberry32(seed);

  const hue = Math.floor(random() * 360);
  const saturation = 62 + Math.floor(random() * 18); // 62-79
  const lightness = 42 + Math.floor(random() * 16); // 42-57

  return hslToHex(hue, saturation, lightness);
}

export function withUserColor(user: Omit<IUser, "userColor"> & { userColor?: string }): IUser {
  return {
    ...user,
    userColor: user.userColor ?? generateStableUserColor(user.id),
  };
}

export function withUniqueUserColors(
  users: Array<Omit<IUser, "userColor"> & { userColor?: string }>,
): IUser[] {
  const usedColors = new Set<string>();
  const colorByUserId = new Map<string, string>();

  const sortedUsers = [...users].sort((a, b) => a.id.localeCompare(b.id));

  for (const user of sortedUsers) {
    let attempt = 0;
    let candidate =
      user.userColor && !usedColors.has(user.userColor)
        ? user.userColor
        : generateStableUserColor(user.id, attempt);

    while (usedColors.has(candidate)) {
      attempt += 1;
      candidate = generateStableUserColor(user.id, attempt);
    }

    usedColors.add(candidate);
    colorByUserId.set(user.id, candidate);
  }

  return users.map((user) => ({
    ...user,
    userColor: colorByUserId.get(user.id) ?? generateStableUserColor(user.id),
  }));
}
