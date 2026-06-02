"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export function ExploreHeader() {
  const { t } = useLanguage();

  return (
    <header className="mb-10 pl-[72px] md:pl-0">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t("explore.title")}</h1>
      <p className="text-slate-600 dark:text-white/50">{t("explore.subtitle")}</p>
    </header>
  );
}
