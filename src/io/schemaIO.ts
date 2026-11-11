import { formDefSchema } from '../schema/zodSchema';
import { FormDef, newId } from '../schema/types';

export const CURRENT_VERSION = 1;
const MAX_SIZE = 15 * 1024 * 1024;

export function safeFileName(name: string) {
  return (name.replace(/[\\/:*?"<>|]+/g, '').trim() || 'form').slice(0, 80);
}

export function exportSchema(def: FormDef) {
  const blob = new Blob([JSON.stringify(def, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = safeFileName(def.meta.title) + '.formdef.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** ترقية الإصدارات القديمة إلى الإصدار الحالي */
function migrate(raw: any): any {
  if (typeof raw !== 'object' || raw === null) throw new Error('محتوى الملف ليس كائناً صالحاً.');
  if (raw.format !== 'formdef') throw new Error('هذا الملف ليس ملف هيكل نموذج (formdef).');
  if (typeof raw.version !== 'number') throw new Error('رقم إصدار الملف مفقود.');
  if (raw.version > CURRENT_VERSION)
    throw new Error(`الملف من إصدار أحدث (${raw.version}). حدّث الموقع لفتحه.`);
  // مستقبلاً: if (raw.version === 1) raw = v1ToV2(raw);
  return raw;
}

export async function importSchema(file: File): Promise<{ def: FormDef; warnings: string[] }> {
  if (file.size > MAX_SIZE) throw new Error('حجم الملف كبير جداً (الحد الأقصى 15MB).');
  const text = await file.text();
  let raw: unknown;
  try { raw = JSON.parse(text); } catch { throw new Error('الملف تالف أو ليس بصيغة JSON.'); }
  const migrated = migrate(raw);
  const res = formDefSchema.safeParse(migrated);
  if (!res.success) {
    const i = res.error.issues[0];
    throw new Error(`هيكل الملف غير صالح عند "${i.path.join('.')}": ${i.message}`);
  }
  const def = res.data as FormDef;
  const warnings: string[] = [];
  const seen = new Set<string>();
  for (const f of def.fields) {
    if (seen.has(f.id)) { f.id = newId(); warnings.push('تم إصلاح معرّفات حقول مكررة.'); }
    seen.add(f.id);
  }
  return { def, warnings: [...new Set(warnings)] };
}

export function validateBeforeExport(def: FormDef): string[] {
  const errs: string[] = [];
  def.fields.forEach((f, i) => {
    if (['select', 'radio', 'checkbox'].includes(f.type) && !(f.options && f.options.length))
      errs.push(`الحقل ${i + 1} "${f.label}" بلا خيارات.`);
    if (!f.label.trim()) errs.push(`الحقل ${i + 1} بلا عنوان.`);
  });
  return errs;
}
