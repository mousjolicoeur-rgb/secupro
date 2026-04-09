export type SecuproTheme = "nocturne" | "normal";

export const LS_THEME = "secupro_visual_mode";
const EVT_THEME = "secupro-theme-changed";

export function getTheme(): SecuproTheme {
  if (typeof window === "undefined") return "nocturne";
  const v = localStorage.getItem(LS_THEME);
  return v === "normal" ? "normal" : "nocturne";
}

export function setTheme(theme: SecuproTheme) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_THEME, theme);
  window.dispatchEvent(new Event(EVT_THEME));
}

export function toggleTheme(): SecuproTheme {
  const next: SecuproTheme = getTheme() === "nocturne" ? "normal" : "nocturne";
  setTheme(next);
  return next;
}

export function onThemeChange(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(EVT_THEME, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT_THEME, cb);
    window.removeEventListener("storage", cb);
  };
}

