import { create } from 'zustand';
import { Field, FieldType, FormDef, Values, createField, emptyForm } from '../schema/types';

// الحالة في الذاكرة فقط — لا persist عمداً
type View = 'home' | 'builder' | 'filler' | 'about';

const MAX_HISTORY = 40;

interface State {
  view: View;
  def: FormDef;
  past: FormDef[];
  future: FormDef[];
  values: Values;
  selectedId: string | null;
  dirty: boolean;
  toast: { msg: string; kind: 'ok' | 'err' } | null;
  setView: (v: View) => void;
  loadDef: (d: FormDef) => void;
  newForm: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  updateMeta: (m: Partial<FormDef['meta']>) => void;
  setLogo: (logo: string | null) => void;
  addField: (t: FieldType, index?: number) => void;
  updateField: (id: string, patch: Partial<Field>) => void;
  removeField: (id: string) => void;
  duplicateField: (id: string) => void;
  moveField: (from: number, to: number) => void;
  select: (id: string | null) => void;
  setValue: (id: string, v: Values[string]) => void;
  clearValues: () => void;
  markClean: () => void;
  showToast: (msg: string, kind?: 'ok' | 'err') => void;
}

// دالة مساعدة لدفع الحالة السابقة لسجل التاريخ
function pushHistory(past: FormDef[], current: FormDef): FormDef[] {
  const next = [...past, current];
  if (next.length > MAX_HISTORY) next.shift();
  return next;
}

export const useForm = create<State>((set, get) => ({
  view: 'home', def: emptyForm(), past: [], future: [], values: {}, selectedId: null, dirty: false, toast: null,
  setView: (view) => set({ view }),
  loadDef: (def) => set({ def, past: [], future: [], values: {}, selectedId: null, dirty: false, view: 'builder' }),
  newForm: () => set({ def: emptyForm(), past: [], future: [], values: {}, selectedId: null, dirty: false, view: 'builder' }),
  
  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  undo: () => {
    const { past, def, future } = get();
    if (!past.length) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    set({
      def: previous,
      past: newPast,
      future: [def, ...future],
      dirty: true,
      selectedId: previous.fields.some((f) => f.id === get().selectedId) ? get().selectedId : null,
    });
  },

  redo: () => {
    const { past, def, future } = get();
    if (!future.length) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      def: next,
      past: [...past, def],
      future: newFuture,
      dirty: true,
      selectedId: next.fields.some((f) => f.id === get().selectedId) ? get().selectedId : null,
    });
  },

  updateMeta: (m) => set((s) => ({
    past: pushHistory(s.past, s.def),
    future: [],
    def: { ...s.def, meta: { ...s.def.meta, ...m } },
    dirty: true,
  })),

  setLogo: (logo) => set((s) => ({
    past: pushHistory(s.past, s.def),
    future: [],
    def: { ...s.def, settings: { ...s.def.settings, logo } },
    dirty: true,
  })),

  addField: (t, index) => set((s) => {
    const f = createField(t);
    const fields = [...s.def.fields];
    fields.splice(index ?? fields.length, 0, f);
    return {
      past: pushHistory(s.past, s.def),
      future: [],
      def: { ...s.def, fields },
      selectedId: f.id,
      dirty: true,
    };
  }),

  updateField: (id, patch) => set((s) => ({
    past: pushHistory(s.past, s.def),
    future: [],
    def: { ...s.def, fields: s.def.fields.map((f) => (f.id === id ? { ...f, ...patch } : f)) },
    dirty: true,
  })),

  removeField: (id) => set((s) => ({
    past: pushHistory(s.past, s.def),
    future: [],
    def: { ...s.def, fields: s.def.fields.filter((f) => f.id !== id) },
    selectedId: s.selectedId === id ? null : s.selectedId,
    dirty: true,
  })),

  duplicateField: (id) => set((s) => {
    const i = s.def.fields.findIndex((f) => f.id === id);
    if (i < 0) return {};
    const copy = { ...structuredClone(s.def.fields[i]), id: createField('text').id };
    const fields = [...s.def.fields];
    fields.splice(i + 1, 0, copy);
    return {
      past: pushHistory(s.past, s.def),
      future: [],
      def: { ...s.def, fields },
      selectedId: copy.id,
      dirty: true,
    };
  }),

  moveField: (from, to) => set((s) => {
    if (to < 0 || to >= s.def.fields.length) return {};
    const fields = [...s.def.fields];
    const [x] = fields.splice(from, 1);
    fields.splice(to, 0, x);
    return {
      past: pushHistory(s.past, s.def),
      future: [],
      def: { ...s.def, fields },
      dirty: true,
    };
  }),

  select: (selectedId) => set({ selectedId }),
  setValue: (id, v) => set((s) => ({ values: { ...s.values, [id]: v } })),
  clearValues: () => set({ values: {} }),
  markClean: () => set({ dirty: false }),
  showToast: (msg, kind = 'ok') => {
    set({ toast: { msg, kind } });
    setTimeout(() => get().toast?.msg === msg && set({ toast: null }), 4000);
  },
}));
