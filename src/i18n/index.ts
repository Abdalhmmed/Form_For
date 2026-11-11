import { create } from 'zustand';
import { LangCode, SUPPORTED_LANGUAGES, TranslationDictionary } from './types';
import { ar } from './locales/ar';
import { en } from './locales/en';
import { fr } from './locales/fr';
import { es } from './locales/es';
import { tr } from './locales/tr';
import { ur } from './locales/ur';

const DICTIONARIES: Record<string, TranslationDictionary> = {
  ar,
  en,
  fr,
  es,
  tr,
  ur,
};

interface I18nState {
  lang: LangCode;
  t: TranslationDictionary;
  dir: 'rtl' | 'ltr';
  setLang: (lang: LangCode) => void;
}

function getDictionary(lang: LangCode): TranslationDictionary {
  return DICTIONARIES[lang] || DICTIONARIES['en'] || ar;
}

function getDirection(lang: LangCode): 'rtl' | 'ltr' {
  const info = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
  return info ? info.dir : 'ltr';
}

// قراءة لغة المتصفح المفضلة كبداية
const initialLang: LangCode = 'ar';

export const useI18n = create<I18nState>((set) => ({
  lang: initialLang,
  t: getDictionary(initialLang),
  dir: getDirection(initialLang),
  setLang: (lang) => {
    const dir = getDirection(lang);
    const t = getDictionary(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    set({ lang, t, dir });
  },
}));
