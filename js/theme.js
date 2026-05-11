/**
 * theme.js — Mintlify clone theme switcher
 *
 * Priority:
 *   1. localStorage key "isDarkMode"  ('dark' | 'light' | 'system')
 *   2. If missing → 'system' (auto-detect via prefers-color-scheme)
 *
 * Persists choice across page refreshes.
 * Listens for OS-level preference changes when mode is 'system'.
 */

(function () {
  /* ─── Constants ─────────────────────────────────────────────────────────── */

  const STORAGE_KEY = "isDarkMode"; // matches original Next.js site
  const VALID_MODES = ["system", "light", "dark"];

  // Tailwind translate-x-{0, 6, 12} → 0 / 1.5rem / 3rem
  // Each button is size-6 (1.5rem = 24px), indicator slides across them
  const INDICATOR_OFFSET = { system: "0rem", light: "1.5rem", dark: "3rem" };

  const html = document.documentElement;
  const sysMQ = window.matchMedia("(prefers-color-scheme: dark)");

  /* ─── Helpers ────────────────────────────────────────────────────────────── */

  /**
   * Returns the actual 'dark' or 'light' value for a given mode.
   * For 'system' it reads the OS preference.
   */
  function resolveTheme(mode) {
    if (mode === "system") {
      return sysMQ.matches ? "dark" : "light";
    }
    return mode; // 'dark' or 'light'
  }

  /**
   * Read saved mode from localStorage.
   * Returns null if nothing is saved or storage is unavailable.
   */
  function getSavedMode() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return VALID_MODES.includes(v) ? v : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Persist mode to localStorage.
   */
  function saveMode(mode) {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      /* storage unavailable — silently ignore */
    }
  }

  /* ─── Apply theme to <html> ─────────────────────────────────────────────── */

  /**
   * Flip the class + color-scheme on <html>.
   * This is the only thing that needs to happen before paint to avoid FOUC
   * (the inline script in <head> already does this on first load).
   */
  function applyTheme(mode) {
    const theme = resolveTheme(mode); // guaranteed 'dark' or 'light'
    html.classList.remove("dark", "light");
    html.classList.add(theme);
    html.style.colorScheme = theme;
  }

  /* ─── Update toggle widget UI ───────────────────────────────────────────── */

  /**
   * Moves the sliding indicator and toggles aria-checked + icon colours
   * on the three radio buttons in the footer theme switcher.
   */
  function updateToggleUI(mode) {
    const switcher = document.querySelector(
      '[aria-label="Theme switcher"][role="radiogroup"]',
    );
    if (!switcher) return;

    // ── Sliding indicator ──────────────────────────────────────────────────
    const indicator = switcher.querySelector('[aria-hidden="true"]');
    if (indicator) {
      indicator.style.transform = `translateX(${INDICATOR_OFFSET[mode]})`;
    }

    // ── Radio buttons ──────────────────────────────────────────────────────
    const buttons = switcher.querySelectorAll('button[role="radio"]');
    buttons.forEach(function (btn) {
      const btnMode = btn.getAttribute("aria-label"); // 'system' | 'light' | 'dark'
      const isActive = btnMode === mode;

      btn.setAttribute("aria-checked", isActive ? "true" : "false");

      // Icon tint: active = text-text-main, inactive = text-muted
      const svg = btn.querySelector("svg");
      if (svg) {
        if (isActive) {
          svg.classList.add("text-text-main");
          svg.classList.remove("text-muted");
        } else {
          svg.classList.remove("text-text-main");
          svg.classList.add("text-muted");
        }
      }
    });
  }

  /* ─── Public switch function ─────────────────────────────────────────────── */

  /**
   * Switch to a given mode, persist it, and update the UI.
   * @param {'system'|'light'|'dark'} mode
   */
  function switchTheme(mode) {
    if (!VALID_MODES.includes(mode)) return;
    saveMode(mode);
    applyTheme(mode);
    updateToggleUI(mode);
  }

  /* ─── Wire up the toggle buttons ────────────────────────────────────────── */

  function wireToggle() {
    const switcher = document.querySelector(
      '[aria-label="Theme switcher"][role="radiogroup"]',
    );
    if (!switcher) return;

    switcher.querySelectorAll('button[role="radio"]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        const newMode = btn.getAttribute("aria-label");
        if (VALID_MODES.includes(newMode)) {
          switchTheme(newMode);
        }
      });
    });
  }

  /* ─── Init ───────────────────────────────────────────────────────────────── */

  function init() {
    // 1. Determine which mode to use
    const savedMode = getSavedMode();
    const mode = savedMode || "system";

    // 2. If nothing was saved, persist 'system' so future loads know the intent
    if (!savedMode) {
      saveMode("system");
    }

    // 3. Apply theme immediately (guards against FOUC if inline script was
    //    not present, or if storage was updated by another tab)
    applyTheme(mode);

    // 4. Wire buttons + sync UI after DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        updateToggleUI(mode);
        wireToggle();
      });
    } else {
      // DOM already ready (script loaded at end of <body>)
      updateToggleUI(mode);
      wireToggle();
    }

    // 5. React to OS-level preference changes in real time
    //    Only has visual effect when the stored mode is 'system'
    sysMQ.addEventListener("change", function () {
      const currentMode = getSavedMode() || "system";
      if (currentMode === "system") {
        applyTheme("system");
        updateToggleUI("system");
      }
    });
  }

  /* ─── Run ────────────────────────────────────────────────────────────────── */

  init();

  // Expose a minimal public API for console debugging / future use
  window.__mintTheme = {
    set: switchTheme,
    get: getSavedMode,
  };
})();
