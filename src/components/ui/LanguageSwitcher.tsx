"use client";

import { useLanguage, Locale } from "@/components/providers/LanguageProvider";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  const options: { value: Locale; label: string }[] = [
    { value: "kz", label: "ҚАЗ" },
    { value: "ru", label: "РУС" },
    { value: "en", label: "ENG" },
  ];

  return (
    <div className="flex bg-gray-100 dark:bg-[#1a241f] rounded-lg p-1 border border-gray-200 dark:border-white/5 overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setLocale(opt.value)}
          className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded-md transition-colors whitespace-nowrap ${
            locale === opt.value
              ? "bg-white dark:bg-[#0f1915] text-emerald-600 dark:text-emerald-500 shadow-sm"
              : "text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
