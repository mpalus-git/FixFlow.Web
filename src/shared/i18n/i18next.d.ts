import type pl from "@/shared/i18n/pl.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: {
      translation: typeof pl;
    };
  }
}
