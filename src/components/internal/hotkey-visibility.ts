"use client";

import * as React from "react";

import {
  formatHotkeyCombination,
  formatNormalizedHotkeyCombination,
  modifierOrder,
  normalizeHotkeyCombination,
  normalizeModifierKey,
  type HotkeyCombination,
  type HotkeyModifier,
  type NormalizedHotkeyCombination,
  type NormalizedHotkeyModifier,
} from "./hotkey-shortcuts";

export type { HotkeyCombination, HotkeyModifier };

export type HotkeyHintProps = {
  /**
   * Hotkey used for visibility matching. If children are omitted, this value is
   * also formatted as the visible label.
   */
  shortcut?: HotkeyCombination;
  /**
   * Keep the shortcut visible regardless of pressed modifiers.
   */
  alwaysShowShortcut?: boolean;
};

type ModifierState = Record<NormalizedHotkeyModifier, boolean>;

const emptyModifierState: ModifierState = {
  alt: false,
  ctrl: false,
  meta: false,
  shift: false,
};

let modifierState = emptyModifierState;
let isListening = false;
const modifierListeners = new Set<() => void>();

export function useHotkeyShortcut(
  shortcut: HotkeyCombination | undefined,
  children: React.ReactNode,
  alwaysShowShortcut = false,
) {
  const inferredShortcut = React.useMemo(
    () => normalizeHotkeyCombination(shortcut) ?? inferHotkeyCombination(children),
    [children, shortcut],
  );
  const pressedModifiers = React.useSyncExternalStore(
    subscribeModifierState,
    getModifierState,
    getServerModifierState,
  );

  if (alwaysShowShortcut || !inferredShortcut) {
    return {
      children: children ?? formatHotkeyCombination(shortcut),
      visible: true,
    };
  }

  const hasPressedModifier = modifierOrder.some((modifier) => pressedModifiers[modifier]);
  const hasShortcutModifier = inferredShortcut.modifiers.length > 0;
  const visible = hasShortcutModifier
    ? inferredShortcut.modifiers.every((modifier) => pressedModifiers[modifier])
    : !hasPressedModifier;

  return {
    children: children ?? formatNormalizedHotkeyCombination(inferredShortcut),
    visible,
  };
}

function subscribeModifierState(listener: () => void) {
  modifierListeners.add(listener);
  startModifierListeners();

  return () => {
    modifierListeners.delete(listener);
    stopModifierListeners();
  };
}

function getModifierState() {
  return modifierState;
}

function getServerModifierState() {
  return emptyModifierState;
}

function startModifierListeners() {
  if (isListening || typeof window === "undefined") {
    return;
  }

  window.addEventListener("keydown", handleModifierKeyEvent, true);
  window.addEventListener("keyup", handleModifierKeyEvent, true);
  window.addEventListener("blur", resetModifierState);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  isListening = true;
}

function stopModifierListeners() {
  if (modifierListeners.size > 0 || !isListening || typeof window === "undefined") {
    return;
  }

  window.removeEventListener("keydown", handleModifierKeyEvent, true);
  window.removeEventListener("keyup", handleModifierKeyEvent, true);
  window.removeEventListener("blur", resetModifierState);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  isListening = false;
  modifierState = emptyModifierState;
}

function handleModifierKeyEvent(event: KeyboardEvent) {
  updateModifierState(getModifierStateFromEvent(event));
}

function handleVisibilityChange() {
  if (document.visibilityState === "hidden") {
    resetModifierState();
  }
}

function resetModifierState() {
  updateModifierState(emptyModifierState);
}

function updateModifierState(nextModifierState: ModifierState) {
  if (
    modifierState.alt === nextModifierState.alt &&
    modifierState.ctrl === nextModifierState.ctrl &&
    modifierState.meta === nextModifierState.meta &&
    modifierState.shift === nextModifierState.shift
  ) {
    return;
  }

  modifierState = nextModifierState;
  modifierListeners.forEach((listener) => listener());
}

function getModifierStateFromEvent(event: KeyboardEvent): ModifierState {
  const nextModifierState = {
    alt: event.altKey,
    ctrl: event.ctrlKey,
    meta: event.metaKey,
    shift: event.shiftKey,
  };

  if (event.type === "keydown") {
    const modifier = normalizeModifierKey(event.key);

    if (modifier) {
      nextModifierState[modifier] = true;
    }
  }

  return nextModifierState;
}

function inferHotkeyCombination(children: React.ReactNode): NormalizedHotkeyCombination | null {
  const text = getTextChildren(children);

  if (!text) {
    return null;
  }

  return normalizeHotkeyCombination(text);
}

function getTextChildren(children: React.ReactNode): string | null {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  const childArray = React.Children.toArray(children);

  if (
    childArray.length === 0 ||
    childArray.some((child) => typeof child !== "string" && typeof child !== "number")
  ) {
    return null;
  }

  return childArray.join("");
}
