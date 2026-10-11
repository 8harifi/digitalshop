export const locales = ["ar", "fa", "en"];

export const defaultLocale = "ar";

export const getDir = (locale: string): "rtl" | "ltr" =>
  locale === "en" ? "ltr" : "rtl";
