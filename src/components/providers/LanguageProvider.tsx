"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { en } from "@/dictionaries/en";
import { ru } from "@/dictionaries/ru";
import { kz } from "@/dictionaries/kz";

export type Locale = "en" | "ru" | "kz";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof typeof en) => string;
}

const dictionaries = {
  en,
  ru,
  kz,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("app_locale") as Locale;
    if (saved && ["en", "ru", "kz"].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("app_locale", newLocale);
  };

  const t = (key: keyof typeof en) => {
    const dict = dictionaries[locale] || dictionaries.en;
    return dict[key] || en[key] || key;
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
