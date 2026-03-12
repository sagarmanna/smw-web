"use client";

import * as React from "react";

type AccessibilityMode = "default" | "monochrome" | "deuteranopia" | "tritanopia";

interface AccessibilityPreferences {
  mode: AccessibilityMode;
}

interface AccessibilityContextValue extends AccessibilityPreferences {
  setMode: (value: AccessibilityMode) => void;
  resetAccessibility: () => void;
}

const STORAGE_KEY = "smw_a11y_v1";

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  mode: "default",
};

const MODES: AccessibilityMode[] = ["default", "monochrome", "deuteranopia", "tritanopia"];

const AccessibilityContext = React.createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = React.useState<AccessibilityPreferences>(DEFAULT_PREFERENCES);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<AccessibilityPreferences>;
      if (!parsed || typeof parsed !== "object") return;

      setPreferences({
        mode: parsed.mode && MODES.includes(parsed.mode as AccessibilityMode) ? (parsed.mode as AccessibilityMode) : DEFAULT_PREFERENCES.mode,
      });
    } catch (error) {
      console.error("Failed to load accessibility preferences:", error);
    }
  }, []);

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-a11y-mode", preferences.mode);

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error("Failed to save accessibility preferences:", error);
    }
  }, [preferences]);

  const setMode = React.useCallback((value: AccessibilityMode) => {
    setPreferences({ mode: value });
  }, []);

  const resetAccessibility = React.useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
  }, []);

  const value = React.useMemo<AccessibilityContextValue>(
    () => ({
      ...preferences,
      setMode,
      resetAccessibility,
    }),
    [preferences, setMode, resetAccessibility]
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = React.useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}
