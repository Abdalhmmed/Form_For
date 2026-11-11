import { useEffect, useRef } from 'react';
import { Field, FIELD_META, Values } from '../schema/types';
import { TranslationDictionary } from '../i18n/types';
import { useI18n } from '../i18n';

type V = Values[string] | undefined;

function Signature({ value, onChange, disabled }: { value: V; onChange: (v: string) => void; disabled?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const { t } = useI18n();

  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    if (typeof value === 'string' && value) {
      const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0); img.src = value;
    }
  }, [value === '' || value === undefined]);

  const pos = (e: React.PointerEvent) => {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    const scaleX = c.width / r.width;
    const scaleY = c.height / r.height;
    return [(e.clientX - r.left) * scaleX, (e.clientY - r.top) * scaleY];
  };
  return (
    <div className="sig">
      <canvas ref={ref} width={600} height={180}
        onPointerDown={(e) => {
          if (disabled) return; drawing.current = true; ref.current!.setPointerCapture(e.pointerId);
          const ctx = ref.current!.getContext('2d')!; const [x, y] = pos(e);
          ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.strokeStyle = '#111'; ctx.beginPath(); ctx.moveTo(x, y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return; const ctx = ref.current!.getContext('2d')!; const [x, y] = pos(e);
          ctx.lineTo(x, y); ctx.stroke();
        }}
        onPointerUp={() => { if (!drawing.current) return; drawing.current = false; onChange(ref.current!.toDataURL('image/png')); }}
      />
      {!disabled && <button type="button" className="btn link no-print" onClick={() => onChange('')}>{t.filler.clearSignature}</button>}
    </div>
  );
}

export function FieldInput({ field: f, value, onChange, preview, error }:
  { field: Field; value: V; onChange: (v: Values[string]) => void; preview?: boolean; error?: string }) {
  const { t } = useI18n();
  if (f.type === 'section') return <h2 className="section-title">{f.label}</h2>;
  if (f.type === 'paragraph') return <p className="paragraph">{f.label}</p>;

  const str = typeof value === 'string' ? value : '';
  const common = { id: f.id, placeholder: f.placeholder, required: f.required, disabled: preview,
    onChange: (e: any) => onChange(e.target.value) };
  let input: React.ReactNode;
  switch (f.type) {
    case 'textarea': input = <textarea {...common} value={str} rows={3} />; break;
    case 'select':
      input = <select {...common} value={str}><option value="">{t.filler.selectPlaceholder}</option>
        {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>; break;
    case 'radio':
      input = <div className="opts">{f.options?.map((o) => (
        <label key={o.value} className="check"><input type="radio" name={f.id} disabled={preview}
          checked={str === o.value} onChange={() => onChange(o.value)} /> {o.label}</label>))}</div>; break;
    case 'checkbox': {
      const arr = Array.isArray(value) ? value : [];
      input = <div className="opts">{f.options?.map((o) => (
        <label key={o.value} className="check"><input type="checkbox" disabled={preview} checked={arr.includes(o.value)}
          onChange={(e) => onChange(e.target.checked ? [...arr, o.value] : arr.filter((x) => x !== o.value))} /> {o.label}</label>))}</div>;
      break;
    }
    case 'signature': input = <Signature value={value} onChange={onChange} disabled={preview} />; break;
    default: {
      const tKind = { text: 'text', number: 'number', email: 'email', phone: 'tel', date: 'date' }[f.type as string] || 'text';
      input = <input {...common} type={tKind} value={str} dir={['email', 'phone', 'number'].includes(f.type) ? 'ltr' : undefined} />;
    }
  }
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label className="field-label" htmlFor={f.id}>{f.label}{f.required && <span className="req"> *</span>}</label>
      {input}
      {error && <div className="err no-print">{error}</div>}
    </div>
  );
}

export function validate(fields: Field[], values: Values, t?: TranslationDictionary): Record<string, string> {
  const errs: Record<string, string> = {};
  for (const f of fields) {
    if (!FIELD_META[f.type].input) continue;
    const v = values[f.id];
    const empty = v === undefined || v === '' || (Array.isArray(v) && !v.length);
    if (empty) {
      if (f.required) errs[f.id] = t ? t.validation.required : 'هذا الحقل إلزامي';
      continue;
    }
    const s = String(v); const val = f.validation || {};
    if (typeof v === 'string' && f.type !== 'signature') {
      if (val.minLength && s.length < val.minLength) {
        errs[f.id] = t ? t.validation.minLength.replace('{min}', String(val.minLength)) : `الحد الأدنى ${val.minLength} أحرف`;
      }
      if (val.maxLength && s.length > val.maxLength) {
        errs[f.id] = t ? t.validation.maxLength.replace('{max}', String(val.maxLength)) : `الحد الأقصى ${val.maxLength} أحرف`;
      }
    }
    if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) {
      errs[f.id] = t ? t.validation.invalidEmail : 'بريد إلكتروني غير صالح';
    }
    if (f.type === 'phone' && !/^[+\d\s()-]{6,20}$/.test(s)) {
      errs[f.id] = t ? t.validation.invalidPhone : 'رقم هاتف غير صالح';
    }
    if (f.type === 'number') {
      const n = Number(s);
      if (isNaN(n)) {
        errs[f.id] = t ? t.validation.invalidNumber : 'رقم غير صالح';
      } else if (val.min !== undefined && n < val.min) {
        errs[f.id] = t ? t.validation.minValue.replace('{min}', String(val.min)) : `أقل قيمة ${val.min}`;
      } else if (val.max !== undefined && n > val.max) {
        errs[f.id] = t ? t.validation.maxValue.replace('{max}', String(val.max)) : `أعلى قيمة ${val.max}`;
      }
    }
  }
  return errs;
}
