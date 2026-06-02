"use client";

import { useLanguage, Locale } from "@/components/providers/LanguageProvider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const cycleLanguage = () => {
    if (locale === "en") setLocale("ru");
    else if (locale === "ru") setLocale("kz");
    else setLocale("en");
  };

  return (
    <button
      onClick={cycleLanguage}
      className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full md:rounded-[24px] bg-gray-100 dark:bg-white/5 text-slate-500 dark:text-gray-400 transition-all hover:rounded-xl md:hover:rounded-2xl hover:bg-emerald-500 hover:text-white group relative"
    >
      <span className="text-xs font-bold uppercase tracking-wider">{locale}</span>

      {/* Tooltip */}
      <div className="hidden md:block absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 rounded-md bg-slate-900 dark:bg-[#1e1f22] px-3 py-1.5 text-sm font-semibold text-white shadow-xl opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap">
        Change Language
        {/* Arrow */}
        <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-slate-900 dark:border-r-[#1e1f22]"></div>
      </div>
    </button>
  );
}
