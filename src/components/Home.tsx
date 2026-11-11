import { useRef, useState } from 'react';
import { FileUp, Info } from 'lucide-react';
import { useForm } from '../store/formStore';
import { useDialog } from '../store/dialogStore';
import { useI18n } from '../i18n';
import { importSchema } from '../io/schemaIO';
import Credits from './Credits';
import LanguageSelector from './LanguageSelector';

export function useImport() {
  const { loadDef, showToast, dirty } = useForm();
  const { confirm } = useDialog();
  const { t } = useI18n();

  return async (file?: File | null) => {
    if (!file) return;
    if (dirty) {
      const ok = await confirm({
        title: t.dialogs.unsavedTitle,
        message: t.dialogs.unsavedMessage,
        confirmText: t.dialogs.confirm,
        cancelText: t.dialogs.cancel,
        variant: 'danger',
      });
      if (!ok) return;
    }
    try {
      const { def, warnings } = await importSchema(file);
      loadDef(def);
      showToast(warnings.length ? warnings.join(' ') : `تم فتح «${def.meta.title}»`);
    } catch (e: any) {
      showToast(e.message || 'تعذر قراءة الملف.', 'err');
    }
  };
}

export default function Home() {
  const newForm = useForm((s) => s.newForm);
  const doImport = useImport();
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  return (
    <div className="app">
      <header className="topbar home-topbar">
        <div className="brand">
          <img src="/logo.svg" alt="FF" className="brand-logo" />
          <span className="brand-title-text">{t.brand}</span>
        </div>

        <div className="home-topbar-actions">
          <button
            type="button"
            className="btn on-dark nav-action-btn"
            title={t.topbar.aboutTab}
            onClick={() => useForm.getState().setView('about')}
          >
            <Info size={15} strokeWidth={1.75} />
            <span>{t.topbar.aboutTab}</span>
          </button>
          <LanguageSelector onDark={true} />
        </div>
      </header>

      <main className="home">
        <section className="home-intro">
          <div className="home-hero-badge">
            <img src="/logo.svg" alt="FF Logo" className="hero-logo" />
          </div>
          <h1>{t.home.heroTitle}</h1>
          <p className="lead">{t.home.heroLead}</p>
          <button className="btn primary lg" onClick={newForm}>{t.home.newFormBtn}</button>
          <ol className="steps">
            <li><b>{t.home.step1.split(' ')[0]}</b> {t.home.step1.substring(t.home.step1.indexOf(' ') + 1)}</li>
            <li><b>{t.home.step2.split(' ')[0]}</b> {t.home.step2.substring(t.home.step2.indexOf(' ') + 1)}</li>
            <li><b>{t.home.step3.split(' ')[0]}</b> {t.home.step3.substring(t.home.step3.indexOf(' ') + 1)}</li>
          </ol>
        </section>

        <section
          className={`dropzone ${over ? 'over' : ''}`}
          role="button" tabIndex={0}
          onClick={() => input.current?.click()}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true); }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); doImport(e.dataTransfer.files[0]); }}
        >
          <FileUp size={28} strokeWidth={1.25} aria-hidden />
          <strong>{t.home.openDropzoneTitle}</strong>
          <span>{t.home.openDropzoneHint}</span>
        </section>
        <input ref={input} type="file" accept=".json,application/json" hidden
          onChange={(e) => { doImport(e.target.files?.[0]); e.target.value = ''; }} />
      </main>
      <Credits />
    </div>
  );
}
