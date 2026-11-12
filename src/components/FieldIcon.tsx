import {
  Type, AlignRight, Hash, AtSign, Phone, Calendar, ChevronsUpDown, CircleDot, SquareCheck,
  Heading, Pilcrow, PenLine, FileText, LucideProps,
} from 'lucide-react';
import { FieldType } from '../schema/types';

const MAP: Record<FieldType, React.ComponentType<LucideProps>> = {
  text: Type, textarea: AlignRight, number: Hash, email: AtSign, phone: Phone, date: Calendar,
  select: ChevronsUpDown, radio: CircleDot, checkbox: SquareCheck, template: FileText, section: Heading, paragraph: Pilcrow,
  signature: PenLine,
};

export function FieldIcon({ type, size = 16 }: { type: FieldType; size?: number }) {
  const I = MAP[type];
  return <I size={size} strokeWidth={1.5} aria-hidden />;
}
