export type Theme = "dark" | "light";

/**
 * Detect the current theme of the host site (ChatGPT or Claude)
 */
export function detectHostTheme(): Theme {
  const html = document.documentElement;

  // ChatGPT: uses class="dark" or class="light" on <html>
  if (html.classList.contains("light")) {
    return "light";
  }
  if (html.classList.contains("dark")) {
    return "dark";
  }

  // Claude: uses data-theme attribute
  const dataTheme = html.getAttribute("data-theme");
  if (dataTheme === "light") {
    return "light";
  }
  if (dataTheme === "dark") {
    return "dark";
  }

  // Fallback: check system preference
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    return "light";
  }

  return "dark";
}

/**
 * Apply theme to an element by setting data-air-theme attribute
 */
export function applyTheme(element: HTMLElement, theme: Theme): void {
  element.setAttribute("data-air-theme", theme);
}

/**
 * Watch for theme changes on the host site
 */
export function watchThemeChanges(callback: (theme: Theme) => void): void {
  const html = document.documentElement;

  const observer = new MutationObserver(() => {
    callback(detectHostTheme());
  });

  observer.observe(html, {
    attributes: true,
    attributeFilter: ["class", "data-theme"],
  });
}
