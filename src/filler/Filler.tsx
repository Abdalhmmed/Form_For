import { useState } from 'react';
import { useForm } from '../store/formStore';
import { useDialog } from '../store/dialogStore';
import { useI18n } from '../i18n';
import { FieldInput, validate } from './FormRenderer';
import { safeFileName } from '../io/schemaIO';
import TopBar from '../components/TopBar';
import Credits from '../components/Credits';

export default function Filler() {
  const { def, values, setValue, clearValues } = useForm();
  const { confirm } = useDialog();
  const { t } = useI18n();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const errIds = Object.keys(errors);
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const exportPdf = () => {
    const errs = validate(def.fields, values, t);
    setErrors(errs);
    const ids = Object.keys(errs);
    if (ids.length) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const old = document.title;
    document.title = safeFileName(def.meta.title);
    window.print();
    document.title = old;
  };

  const handleClear = async () => {
    const ok = await confirm({
      title: t.dialogs.clearFieldsTitle,
      message: t.dialogs.clearFieldsMessage,
      confirmText: t.dialogs.clearFieldsConfirm,
      cancelText: t.dialogs.cancel,
      variant: 'danger',
    });
    if (ok) {
      clearValues();
      setErrors({});
    }
  };

  return (
    <div className="app">
      <TopBar />
      <div className="fill-toolbar no-print">
        <span className="hint">{t.filler.instruction}</span>
        <div className="spacer" />
        <button className="btn" onClick={handleClear}>{t.filler.clearFields}</button>
        <button className="btn primary" onClick={exportPdf}>{t.filler.savePdf}</button>
      </div>
      <main className="desk">
        <form className="paper print-area" dir={def.meta.direction} noValidate
          onSubmit={(e) => { e.preventDefault(); exportPdf(); }}>
          {errIds.length > 0 && (
            <div className="error-summary no-print" role="alert">
              <strong>{errIds.length === 1 ? `1 ${t.filler.oneError}` : `${errIds.length} ${t.filler.multipleErrors}`}</strong>
              <ul>{errIds.map((id) => (
                <li key={id}><a href={`#${id}`} onClick={(e) => { e.preventDefault(); go(id); }}>
                  {def.fields.find((f) => f.id === id)?.label}: {errors[id]}</a></li>))}</ul>
            </div>
          )}
          <div className="doc-head">
            {def.settings.logo && <img src={def.settings.logo} className="doc-logo" alt="" />}
            <div>
              <h1 className="doc-title">{def.meta.title}</h1>
              {def.meta.description && <p className="doc-desc">{def.meta.description}</p>}
            </div>
          </div>
          <div className="fields-grid">
            {def.fields.map((f) => (
              <div key={f.id} className={`fill-field ${f.width === 'half' ? 'half' : ''}`}>
                <FieldInput field={f} value={values[f.id]} error={errors[f.id]}
                  onChange={(v) => { setValue(f.id, v); if (errors[f.id]) setErrors((e) => { const n = { ...e }; delete n[f.id]; return n; }); }} />
              </div>
            ))}
          </div>
        </form>
      </main>
      <Credits />
    </div>
  );
}
