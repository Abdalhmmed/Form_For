import { useState, useRef, useEffect } from 'react';
import { Globe, Search, Check } from 'lucide-react';
import { useI18n } from '../i18n';
import { SUPPORTED_LANGUAGES, LangCode } from '../i18n/types';

export default function LanguageSelector({ onDark = true }: { onDark?: boolean }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [open]);

  const filtered = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="lang-selector-wrap" ref={containerRef}>
      <button
        type="button"
        className={`btn ${onDark ? 'on-dark' : ''} lang-btn`}
        aria-label="تغيير اللغة"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Globe size={15} strokeWidth={1.5} />
        <span>{currentLang.name}</span>
      </button>

      {open && (
        <div className="lang-dropdown" role="listbox">
          <div className="lang-search-row">
            <Search size={14} strokeWidth={1.5} className="lang-search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              className="lang-search-input"
              placeholder="ابحث عن لغة... / Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="lang-list">
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const isSelected = item.code === lang;
                return (
                  <button
                    key={item.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={`lang-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setLang(item.code as LangCode);
                      setOpen(false);
                    }}
                  >
                    <span className="lang-name">{item.name}</span>
                    <span className="lang-native">{item.nativeName}</span>
                    {isSelected && <Check size={14} strokeWidth={2} className="lang-check" />}
                  </button>
                );
              })
            ) : (
              <div className="lang-empty">لا توجد نتائج مطابقة</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
