"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

export function FeedHeader() {
  const { t } = useLanguage();

  return (
    <header className="mb-10">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t("feed.title")}</h1>
      <p className="text-slate-600 dark:text-white/50">{t("feed.subtitle")}</p>
    </header>
  );
}
