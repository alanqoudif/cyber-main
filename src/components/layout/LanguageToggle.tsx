"use client";

import { usePreferences } from "@/context/preferences-context";
import { Locale } from "@/lib/i18n/config";

const languageLabels: Record<Locale, { short: string; full: string }> = {
  en: { short: "EN", full: "English" },
  ar: { short: "ع", full: "العربية" },
};

const ariaCopy = {
  en: "Switch interface language",
  ar: "تبديل لغة الواجهة",
};

interface LanguageToggleProps {
  size?: "default" | "compact";
  className?: string;
}

export function LanguageToggle({ size = "default", className = "" }: LanguageToggleProps) {
  const { locale, setLocale } = usePreferences();
  const containerPadding = size === "compact" ? "p-0.5" : "p-1";
  const optionPadding = size === "compact" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm";

  return (
    <div
      role="group"
      aria-label={ariaCopy[locale]}
      className={`inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface/70 ${containerPadding} ${className}`}
    >
      {(["en", "ar"] as Locale[]).map((option) => {
        const isActive = option === locale;
        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            className={`rounded-full font-medium transition ${optionPadding} ${
              isActive ? "bg-foreground text-background shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            <span className="hidden sm:inline">{languageLabels[option].full}</span>
            <span className="sm:hidden">{languageLabels[option].short}</span>
          </button>
        );
      })}
    </div>
  );
}
