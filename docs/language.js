(() => {
  const storageKey = "focusgate.siteLanguage";
  const routePaths = {
    zh: {
      home: "",
      privacy: "privacy/",
      support: "support/",
    },
    en: {
      home: "en/",
      privacy: "en/privacy/",
      support: "en/support/",
    },
    fr: {
      home: "fr/",
      privacy: "fr/privacy/",
      support: "fr/support/",
    },
  };

  const script = document.currentScript;
  const route = script?.dataset.route || "home";
  const shouldAutodetect = script?.dataset.autodetect === "true";
  const siteRoot = new URL(script?.dataset.root || "./", window.location.href);

  function normalizeLanguage(value) {
    const language = String(value || "").toLowerCase();

    if (language.startsWith("fr")) {
      return "fr";
    }

    if (language.startsWith("en")) {
      return "en";
    }

    if (language.startsWith("zh")) {
      return "zh";
    }

    return "";
  }

  function getStoredLanguage() {
    try {
      return normalizeLanguage(window.localStorage.getItem(storageKey));
    } catch {
      return "";
    }
  }

  function storeLanguage(language) {
    const normalized = normalizeLanguage(language);

    if (!normalized) {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, normalized);
    } catch {
      // Local storage may be disabled. Manual language links still work.
    }
  }

  function detectLanguage() {
    const stored = getStoredLanguage();

    if (stored) {
      return stored;
    }

    const languages = Array.isArray(navigator.languages) ? navigator.languages : [];

    for (const language of languages) {
      const normalized = normalizeLanguage(language);

      if (normalized) {
        return normalized;
      }
    }

    return normalizeLanguage(navigator.language) || "zh";
  }

  function getRouteUrl(language) {
    const localizedRoute = routePaths[language]?.[route] ?? routePaths.zh.home;
    return new URL(localizedRoute, siteRoot);
  }

  if (shouldAutodetect) {
    const preferredLanguage = detectLanguage();

    if (preferredLanguage !== "zh") {
      window.location.replace(getRouteUrl(preferredLanguage));
      return;
    }
  }

  if (!shouldAutodetect) {
    storeLanguage(script?.dataset.locale || document.documentElement.lang);
  }

  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-lang]").forEach((link) => {
      link.addEventListener("click", () => {
        storeLanguage(link.getAttribute("data-lang"));
      });
    });
  });
})();
