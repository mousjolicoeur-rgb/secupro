"use client";

import { useEffect } from "react";
import { getTheme, onThemeChange } from "@/lib/theme";

function applyThemeToDom() {
  const theme = getTheme();
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("theme-normal", theme === "normal");
  root.classList.toggle("theme-nocturne", theme === "nocturne");
}

export default function ThemeClient() {
  useEffect(() => {
    applyThemeToDom();
    return onThemeChange(() => applyThemeToDom());
  }, []);

  return null;
}

