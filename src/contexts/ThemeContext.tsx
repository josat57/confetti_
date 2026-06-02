"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Read from localStorage on mount (runs only on client)
  useEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme | null) ?? "system";
    setThemeState(stored);
  }, []);

  // Resolve system preference
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    function apply(t: Theme) {
      const resolved =
        t === "system" ? (media.matches ? "dark" : "light") : t;
      setResolvedTheme(resolved);
      document.documentElement.classList.toggle("dark", resolved === "dark");
    }

    apply(theme);

    // Re-apply when system preference changes (only relevant when theme==="system")
    const handler = () => {
      if (theme === "system") apply("system");
    };
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [theme]);

  function setTheme(t: Theme) {
    setThemeState(t);
    localStorage.setItem("theme", t);
  }

  function toggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
