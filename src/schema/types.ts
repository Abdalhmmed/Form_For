export const FIELD_TYPES = [
  'text', 'textarea', 'number', 'email', 'phone', 'date',
  'select', 'radio', 'checkbox', 'template', 'section', 'paragraph', 'signature',
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export interface Option { value: string; label: string }

export interface TemplateVariant {
  id: string;
  label: string;
  text: string;
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  width?: 'full' | 'half';
  options?: Option[];
  templates?: TemplateVariant[];
  defaultTemplateId?: string;
  validation?: { minLength?: number; maxLength?: number; min?: number; max?: number };
}

export interface FormDef {
  format: 'formdef';
  version: 1;
  meta: { title: string; description?: string; createdAt: string; direction: 'rtl' | 'ltr' };
  settings: { pageSize: 'A4'; orientation: 'portrait' | 'landscape'; logo: string | null };
  fields: Field[];
}

export type Values = Record<string, string | string[] | boolean>;

export type FieldGroup = 'نصوص' | 'اختيارات' | 'تخطيط' | 'أخرى';
export const FIELD_GROUPS: FieldGroup[] = ['نصوص', 'اختيارات', 'تخطيط', 'أخرى'];

export const FIELD_META: Record<FieldType, { label: string; input: boolean; group: FieldGroup }> = {
  text: { label: 'نص قصير', input: true, group: 'نصوص' },
  textarea: { label: 'نص طويل', input: true, group: 'نصوص' },
  template: { label: 'نص بقالب', input: true, group: 'نصوص' },
  number: { label: 'رقم', input: true, group: 'نصوص' },
  email: { label: 'بريد إلكتروني', input: true, group: 'نصوص' },
  phone: { label: 'هاتف', input: true, group: 'نصوص' },
  date: { label: 'تاريخ', input: true, group: 'أخرى' },
  select: { label: 'قائمة منسدلة', input: true, group: 'اختيارات' },
  radio: { label: 'اختيار واحد', input: true, group: 'اختيارات' },
  checkbox: { label: 'خيارات متعددة', input: true, group: 'اختيارات' },
  section: { label: 'عنوان قسم', input: false, group: 'تخطيط' },
  paragraph: { label: 'نص ثابت', input: false, group: 'تخطيط' },
  signature: { label: 'توقيع', input: true, group: 'أخرى' },
};

export const newId = () => 'f_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);

export function emptyForm(): FormDef {
  return {
    format: 'formdef', version: 1,
    meta: { title: 'نموذج جديد', description: '', createdAt: new Date().toISOString(), direction: 'rtl' },
    settings: { pageSize: 'A4', orientation: 'portrait', logo: null },
    fields: [],
  };
}

export function createField(type: FieldType): Field {
  const f: Field = { id: newId(), type, label: FIELD_META[type].label, required: false, width: 'full' };
  if (type === 'select' || type === 'radio' || type === 'checkbox')
    f.options = [{ value: 'opt1', label: 'خيار 1' }, { value: 'opt2', label: 'خيار 2' }];
  if (type === 'paragraph') f.label = 'اكتب هنا نصاً توضيحياً للنموذج.';
  if (type === 'template') {
    f.templates = [
      { id: 'tpl_1', label: 'مرحبا', text: 'مرحبا {{الاسم}}، نود إبلاغكم بأن {{الموضوع}}.' },
      { id: 'tpl_2', label: 'أهلاً', text: 'أهلاً {{الاسم}}، يسعدنا تواصلك بخصوص {{الموضوع}}.' },
    ];
    f.defaultTemplateId = 'tpl_1';
  }
  return f;
}
