export type Locale = "en" | "ar";

export const DEFAULT_LOCALE: Locale = "en";

export const localeDirections: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
};

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
};
