import { ArrowUp, ArrowDown, Copy, Trash2, X, Plus } from 'lucide-react';
import { useForm } from '../store/formStore';
import { useI18n } from '../i18n';
import { FIELD_META } from '../schema/types';
import { FieldIcon } from '../components/FieldIcon';

const ic = { size: 16, strokeWidth: 1.5 } as const;

export default function PropertiesPanel({ onClose }: { onClose?: () => void }) {
  const { def, selectedId, updateField, setLogo, showToast, moveField, duplicateField, removeField } = useForm();
  const { t } = useI18n();
  const index = def.fields.findIndex((x) => x.id === selectedId);
  const f = def.fields[index];

  if (!f) {
    return (
      <div>
        <div className="panel-header-row">
          <h3 className="panel-title">{t.properties.formSettings}</h3>
          {onClose && <button className="icon-btn mobile-close-btn" aria-label={t.builder.closePanel} onClick={onClose}><X {...ic} /></button>}
        </div>
        <fieldset className="group">
          <legend>{t.properties.logoLegend}</legend>
          {def.settings.logo
            ? <div className="logo-row"><img src={def.settings.logo} className="logo-prev" alt="الشعار" />
                <button className="btn" onClick={() => setLogo(null)}>{t.properties.removeLogo}</button></div>
            : <label className="btn file-btn">{t.properties.chooseImage}
                <input type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={(e) => {
                  const file = e.target.files?.[0]; e.target.value = '';
                  if (!file) return;
                  if (file.size > 10 * 1024 * 1024) return showToast(t.properties.logoTooLarge, 'err');
                  const r = new FileReader(); r.onload = () => setLogo(String(r.result)); r.readAsDataURL(file);
                }} /></label>}
          <p className="hint">{t.properties.logoHint}</p>
        </fieldset>
        <p className="hint">{t.properties.selectFieldHint}</p>
      </div>
    );
  }

  const up = (p: Partial<typeof f>) => updateField(f.id, p);
  const hasOptions = ['select', 'radio', 'checkbox'].includes(f.type);
  const isInput = FIELD_META[f.type].input;
  const textLike = ['text', 'textarea', 'email', 'phone'].includes(f.type);
  const num = (v: string) => (v ? +v : undefined);
  const fieldLabelKey = f.type as keyof typeof t.fieldTypes;

  return (
    <div>
      <div className="panel-header-row">
        <h3 className="panel-title"><FieldIcon type={f.type} /> {t.fieldTypes[fieldLabelKey] || f.label}</h3>
        {onClose && <button className="icon-btn mobile-close-btn" aria-label={t.builder.closePanel} onClick={onClose}><X {...ic} /></button>}
      </div>

      <div className="toolrow">
        <button className="icon-btn" title={t.properties.moveUp} aria-label={t.properties.moveUp} disabled={index === 0}
          onClick={() => moveField(index, index - 1)}><ArrowUp {...ic} /></button>
        <button className="icon-btn" title={t.properties.moveDown} aria-label={t.properties.moveDown} disabled={index === def.fields.length - 1}
          onClick={() => moveField(index, index + 1)}><ArrowDown {...ic} /></button>
        <button className="icon-btn" title={t.properties.duplicate} aria-label={t.properties.duplicate} onClick={() => duplicateField(f.id)}><Copy {...ic} /></button>
      </div>

      <fieldset className="group">
        <legend>{t.properties.basicLegend}</legend>
        <label className="prop">{f.type === 'paragraph' ? t.fieldTypes.paragraph : t.properties.labelOrText}
          {f.type === 'paragraph'
            ? <textarea rows={4} value={f.label} onChange={(e) => up({ label: e.target.value })} />
            : <input value={f.label} onChange={(e) => up({ label: e.target.value })} />}
        </label>
        {isInput && f.type !== 'signature' && !hasOptions && f.type !== 'date' && (
          <label className="prop">{t.properties.placeholder}
            <input value={f.placeholder || ''} onChange={(e) => up({ placeholder: e.target.value })} />
          </label>
        )}
        {isInput && (
          <label className="check"><input type="checkbox" checked={!!f.required}
            onChange={(e) => up({ required: e.target.checked })} /> {t.properties.required}</label>
        )}
      </fieldset>

      {hasOptions && (
        <fieldset className="group">
          <legend>{t.properties.optionsLegend}</legend>
          {(f.options || []).map((o, i) => (
            <div key={i} className="opt-row">
              <input aria-label={`Option ${i + 1}`} value={o.label} onChange={(e) => {
                const options = [...(f.options || [])]; options[i] = { ...o, label: e.target.value }; up({ options });
              }} />
              <button className="icon-btn" aria-label="Delete" onClick={() => up({ options: f.options!.filter((_, j) => j !== i) })}><X {...ic} /></button>
            </div>
          ))}
          <button className="btn link" onClick={() => {
            const n = (f.options?.length || 0) + 1;
            up({ options: [...(f.options || []), { value: 'opt' + Date.now().toString(36), label: `Option ${n}` }] });
          }}><Plus {...ic} /> {t.properties.addOption}</button>
        </fieldset>
      )}

      {(textLike || f.type === 'number') && (
        <fieldset className="group">
          <legend>{t.properties.validationLegend}</legend>
          {textLike ? (
            <div className="row2">
              <label className="prop">{t.properties.minLength}<input type="number" min={0} value={f.validation?.minLength ?? ''}
                onChange={(e) => up({ validation: { ...f.validation, minLength: num(e.target.value) } })} /></label>
              <label className="prop">{t.properties.maxLength}<input type="number" min={0} value={f.validation?.maxLength ?? ''}
                onChange={(e) => up({ validation: { ...f.validation, maxLength: num(e.target.value) } })} /></label>
            </div>
          ) : (
            <div className="row2">
              <label className="prop">{t.properties.minValue}<input type="number" value={f.validation?.min ?? ''}
                onChange={(e) => up({ validation: { ...f.validation, min: num(e.target.value) } })} /></label>
              <label className="prop">{t.properties.maxValue}<input type="number" value={f.validation?.max ?? ''}
                onChange={(e) => up({ validation: { ...f.validation, max: num(e.target.value) } })} /></label>
            </div>
          )}
        </fieldset>
      )}

      {f.type !== 'section' && f.type !== 'paragraph' && (
        <fieldset className="group">
          <legend>{t.properties.layoutLegend}</legend>
          <div className="segmented" role="radiogroup" aria-label="Layout Width">
            <button role="radio" aria-checked={(f.width || 'full') === 'full'} onClick={() => up({ width: 'full' })}>{t.properties.fullWidth}</button>
            <button role="radio" aria-checked={f.width === 'half'} onClick={() => up({ width: 'half' })}>{t.properties.halfWidth}</button>
          </div>
        </fieldset>
      )}

      <button className="btn danger block" onClick={() => removeField(f.id)}><Trash2 {...ic} /> {t.properties.deleteField}</button>
    </div>
  );
}
