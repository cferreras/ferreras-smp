(() => {
  let saved = null;

  try {
    saved = localStorage.getItem("ferreras-theme");
  } catch {
    // The CSS fallback still follows the system preference if storage is unavailable.
  }

  const preference = saved === "light" || saved === "dark" || saved === "system"
    ? saved
    : "system";
  const theme = preference === "system"
    ? window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
    : preference;

  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#000000" : "#FAFAFA");
})();
