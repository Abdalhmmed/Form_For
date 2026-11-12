import { z } from 'zod';
import { FIELD_TYPES } from './types';

const optionSchema = z.object({ value: z.string().max(200), label: z.string().max(500) });

const templateVariantSchema = z.object({
  id: z.string().max(100),
  label: z.string().max(200),
  text: z.string().max(5000),
});

export const fieldSchema = z.object({
  id: z.string().min(1).max(64),
  type: z.enum(FIELD_TYPES),
  label: z.string().max(2000),
  required: z.boolean().optional(),
  placeholder: z.string().max(500).optional(),
  width: z.enum(['full', 'half']).optional(),
  options: z.array(optionSchema).max(200).optional(),
  templates: z.array(templateVariantSchema).max(50).optional(),
  defaultTemplateId: z.string().max(100).optional(),
  validation: z.object({
    minLength: z.number().optional(), maxLength: z.number().optional(),
    min: z.number().optional(), max: z.number().optional(),
  }).optional(),
});

export const formDefSchema = z.object({
  format: z.literal('formdef'),
  version: z.literal(1),
  meta: z.object({
    title: z.string().max(300),
    description: z.string().max(5000).optional(),
    createdAt: z.string(),
    direction: z.enum(['rtl', 'ltr']),
  }),
  settings: z.object({
    pageSize: z.literal('A4'),
    orientation: z.enum(['portrait', 'landscape']),
    logo: z.string().regex(/^data:image\/(png|jpeg|webp);base64,/).nullable(),
  }),
  fields: z.array(fieldSchema).max(500),
});
