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

function parseTemplateSlots(text: string): Array<{ type: 'text'; value: string } | { type: 'slot'; name: string; key: string }> {
  // Supports {{slot_name}} and (slot_name) and [slot_name] and (...)
  const regex = /\{\{([^}]+)\}\}|\(([^\)]+)\)|\[([^\]]+)\]/g;
  const parts: Array<{ type: 'text'; value: string } | { type: 'slot'; name: string; key: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let slotCount = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.substring(lastIndex, match.index) });
    }
    slotCount++;
    const slotName = (match[1] || match[2] || match[3] || `خانة ${slotCount}`).trim();
    parts.push({
      type: 'slot',
      name: slotName || `...`,
      key: `slot_${slotCount}`,
    });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.substring(lastIndex) });
  }
  return parts;
}

interface TemplatedData {
  templateId: string;
  slots: Record<string, string>;
}

function parseTemplatedValue(value: V, defaultTemplateId?: string): TemplatedData {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return {
      templateId: (value as any).templateId || defaultTemplateId || '',
      slots: (value as any).slots || {},
    };
  }
  if (typeof value === 'string' && value.startsWith('{')) {
    try {
      const parsed = JSON.parse(value);
      return {
        templateId: parsed.templateId || defaultTemplateId || '',
        slots: parsed.slots || {},
      };
    } catch {
      // not json
    }
  }
  return {
    templateId: defaultTemplateId || '',
    slots: {},
  };
}

function TemplatedFieldInput({ field: f, value, onChange, preview }:
  { field: Field; value: V; onChange: (v: any) => void; preview?: boolean }) {
  const { t } = useI18n();
  const templates = f.templates && f.templates.length > 0 ? f.templates : [
    { id: 'tpl_1', label: 'مرحبا', text: 'مرحبا {{الاسم}}، نود إبلاغكم بأن {{الموضوع}}.' },
    { id: 'tpl_2', label: 'أهلاً', text: 'أهلاً {{الاسم}}، يسعدنا تواصلك بخصوص {{الموضوع}}.' },
  ];

  const currentData = parseTemplatedValue(value, f.defaultTemplateId || templates[0]?.id);
  const activeTemplate = templates.find((t) => t.id === currentData.templateId) || templates[0];
  const parts = parseTemplateSlots(activeTemplate ? activeTemplate.text : '');

  const setTemplate = (id: string) => {
    onChange({
      templateId: id,
      slots: currentData.slots,
    });
  };

  const updateSlot = (key: string, val: string) => {
    onChange({
      templateId: activeTemplate.id,
      slots: { ...currentData.slots, [key]: val },
    });
  };

  return (
    <div className="templated-field-wrapper">
      {templates.length > 1 && (
        <div className="templated-selector no-print" style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink-2)', marginInlineEnd: '8px' }}>
            {t.filler.chooseTemplate}
          </span>
          <div className="segmented" style={{ display: 'inline-flex', verticalAlign: 'middle' }}>
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                className={activeTemplate.id === tpl.id ? 'active' : ''}
                aria-pressed={activeTemplate.id === tpl.id}
                disabled={preview}
                onClick={() => setTemplate(tpl.id)}
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Screen Interactive view */}
      <div className="templated-content no-print" style={{
        lineHeight: '2.2',
        background: 'var(--panel)',
        padding: '12px 14px',
        borderRadius: 'var(--r)',
        border: '1px solid var(--line)',
        fontSize: 'var(--fs-sm)',
        color: 'var(--ink)'
      }}>
        {parts.map((p, idx) => {
          if (p.type === 'text') {
            return <span key={idx}>{p.value}</span>;
          }
          const val = currentData.slots[p.key] || '';
          return (
            <input
              key={idx}
              type="text"
              placeholder={p.name}
              value={val}
              disabled={preview}
              onChange={(e) => updateSlot(p.key, e.target.value)}
              style={{
                display: 'inline-block',
                margin: '0 4px',
                padding: '2px 8px',
                minWidth: '90px',
                width: Math.max(90, (val.length || p.name.length) * 12 + 20) + 'px',
                maxWidth: '260px',
                height: '30px',
                background: 'var(--paper)',
                border: '1px solid var(--line-strong)',
                borderRadius: 'var(--r-sm)',
                fontSize: 'inherit',
                fontWeight: 600,
                color: 'var(--plum-900)',
                verticalAlign: 'baseline',
              }}
            />
          );
        })}
      </div>

      {/* Print view: seamless immutable document line */}
      <div className="templated-print-content show-print-only" style={{
        lineHeight: '2',
        fontSize: '13pt',
        color: '#000',
        display: 'none',
      }}>
        {parts.map((p, idx) => {
          if (p.type === 'text') {
            return <span key={idx}>{p.value}</span>;
          }
          const val = currentData.slots[p.key] || '';
          return (
            <span key={idx} style={{
              display: 'inline-block',
              padding: '0 6px',
              margin: '0 3px',
              borderBottom: '1.5px solid #000',
              fontWeight: 'bold',
              minWidth: '50px',
              textAlign: 'center'
            }}>
              {val || '...........'}
            </span>
          );
        })}
      </div>
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
    case 'template':
      input = <TemplatedFieldInput field={f} value={value} onChange={onChange} preview={preview} />;
      break;
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
    if (f.type === 'template') {
      const tData = parseTemplatedValue(v, f.defaultTemplateId || f.templates?.[0]?.id);
      const activeTpl = (f.templates || []).find((tpl) => tpl.id === tData.templateId) || f.templates?.[0];
      if (activeTpl) {
        const parts = parseTemplateSlots(activeTpl.text);
        const slotKeys = parts.filter((p) => p.type === 'slot').map((p) => (p as any).key);
        const filledSlotsCount = slotKeys.filter((k) => !!tData.slots[k]?.trim()).length;
        if (f.required && filledSlotsCount < slotKeys.length) {
          errs[f.id] = t ? t.validation.required : 'يرجى إكمال تعبئة خانات القالب';
        }
      }
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
