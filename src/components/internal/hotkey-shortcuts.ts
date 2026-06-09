"use client";

export type HotkeyModifier = "alt" | "ctrl" | "meta" | "mod" | "shift";

export type HotkeyCombination =
  | string
  | {
      key: string;
      modifiers?: readonly HotkeyModifier[];
    };

export type NormalizedHotkeyModifier = Exclude<HotkeyModifier, "mod">;

export type NormalizedHotkeyCombination = {
  key: string;
  modifiers: readonly NormalizedHotkeyModifier[];
};

type HotkeyPlatform = "linux" | "mac" | "windows";

export const modifierOrder: readonly NormalizedHotkeyModifier[] = ["ctrl", "alt", "shift", "meta"];

const displayModifierPatterns: Array<[NormalizedHotkeyModifier, RegExp]> = [
  ["meta", /(?:⌘|\b(?:cmd|command|meta)\b)/i],
  ["ctrl", /(?:⌃|\b(?:ctrl|control)\b)/i],
  ["alt", /(?:⌥|\b(?:alt|option)\b)/i],
  ["shift", /(?:⇧|\bshift\b)/i],
];

const keyAliases = new Map([
  [" ", "space"],
  ["arrowdown", "down"],
  ["arrowleft", "left"],
  ["arrowright", "right"],
  ["arrowup", "up"],
  ["esc", "escape"],
  ["return", "enter"],
]);

export function normalizeHotkeyCombination(
  shortcut: HotkeyCombination | undefined,
): NormalizedHotkeyCombination | null {
  if (!shortcut) {
    return null;
  }

  if (typeof shortcut === "string") {
    return parseHotkeyString(shortcut);
  }

  return {
    key: normalizeHotkeyKey(shortcut.key),
    modifiers: normalizeModifierList(shortcut.modifiers ?? []),
  };
}

export function normalizeModifierKey(key: string): NormalizedHotkeyModifier | null {
  if (key === "Alt") {
    return "alt";
  }

  if (key === "Control") {
    return "ctrl";
  }

  if (key === "Meta") {
    return "meta";
  }

  if (key === "Shift") {
    return "shift";
  }

  return null;
}

export function formatHotkeyCombination(shortcut: HotkeyCombination | undefined) {
  const normalizedShortcut = normalizeHotkeyCombination(shortcut);

  return normalizedShortcut ? formatNormalizedHotkeyCombination(normalizedShortcut) : undefined;
}

export function formatNormalizedHotkeyCombination(shortcut: NormalizedHotkeyCombination) {
  const platform = resolveHotkeyPlatform();
  const labels = shortcut.modifiers.map((modifier) => formatModifierLabel(modifier, platform));

  labels.push(formatKeyLabel(shortcut.key));

  return platform === "mac" ? labels.join("") : labels.join("+");
}

function parseHotkeyString(value: string): NormalizedHotkeyCombination {
  const trimmedValue = value.trim();
  const explicitParts = trimmedValue
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean);

  if (explicitParts.length > 1) {
    const key = explicitParts.at(-1) ?? "";

    return {
      key: normalizeHotkeyKey(key),
      modifiers: normalizeModifierList(explicitParts.slice(0, -1)),
    };
  }

  return {
    key: normalizeHotkeyKey(stripDisplayModifiers(trimmedValue)),
    modifiers: inferDisplayModifiers(trimmedValue),
  };
}

function normalizeModifierList(modifiers: readonly string[]) {
  const normalizedModifiers = new Set<NormalizedHotkeyModifier>();
  const platform = resolveHotkeyPlatform();

  for (const modifier of modifiers) {
    const normalizedModifier = normalizeHotkeyModifier(modifier);

    if (!normalizedModifier) {
      continue;
    }

    normalizedModifiers.add(
      normalizedModifier === "mod" ? (platform === "mac" ? "meta" : "ctrl") : normalizedModifier,
    );
  }

  return modifierOrder.filter((modifier) => normalizedModifiers.has(modifier));
}

function inferDisplayModifiers(value: string) {
  const modifiers = new Set<NormalizedHotkeyModifier>();

  for (const [modifier, pattern] of displayModifierPatterns) {
    if (pattern.test(value)) {
      modifiers.add(modifier);
    }
  }

  return modifierOrder.filter((modifier) => modifiers.has(modifier));
}

function stripDisplayModifiers(value: string) {
  return value
    .replace(/[⌘⌃⌥⇧]/g, "")
    .replace(/\b(?:alt|cmd|command|control|ctrl|meta|option|shift)\b/gi, "")
    .trim();
}

function normalizeHotkeyModifier(value: string): HotkeyModifier | null {
  const normalizedValue = value.toLocaleLowerCase();

  if (normalizedValue === "control") {
    return "ctrl";
  }

  if (normalizedValue === "cmd" || normalizedValue === "command") {
    return "meta";
  }

  if (normalizedValue === "option") {
    return "alt";
  }

  if (
    normalizedValue === "alt" ||
    normalizedValue === "ctrl" ||
    normalizedValue === "meta" ||
    normalizedValue === "mod" ||
    normalizedValue === "shift"
  ) {
    return normalizedValue;
  }

  return null;
}

function normalizeHotkeyKey(key: string) {
  const normalizedKey = key.toLocaleLowerCase();

  return keyAliases.get(normalizedKey) ?? normalizedKey;
}

function formatModifierLabel(modifier: NormalizedHotkeyModifier, platform: HotkeyPlatform) {
  if (platform === "mac") {
    switch (modifier) {
      case "alt":
        return "⌥";
      case "ctrl":
        return "⌃";
      case "meta":
        return "⌘";
      case "shift":
        return "⇧";
    }
  }

  return modifier === "meta" ? "Meta" : modifier.charAt(0).toLocaleUpperCase() + modifier.slice(1);
}

function formatKeyLabel(key: string) {
  return key.length === 1
    ? key.toLocaleUpperCase()
    : key.charAt(0).toLocaleUpperCase() + key.slice(1);
}

function resolveHotkeyPlatform(): HotkeyPlatform {
  const navigatorPlatform = globalThis.navigator?.platform.toLocaleLowerCase() ?? "";

  if (navigatorPlatform.includes("mac") || navigatorPlatform.includes("iphone")) {
    return "mac";
  }

  if (navigatorPlatform.includes("win")) {
    return "windows";
  }

  return "linux";
}
