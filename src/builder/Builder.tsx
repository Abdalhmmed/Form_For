import { useState } from 'react';
import {
  DndContext, PointerSensor, TouchSensor, KeyboardSensor, useSensor, useSensors, closestCenter,
  DragEndEvent, DragStartEvent, DragOverlay, useDraggable, useDroppable,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, SlidersHorizontal, X } from 'lucide-react';
import { useForm } from '../store/formStore';
import { useI18n } from '../i18n';
import { FIELD_GROUPS, FIELD_META, FIELD_TYPES, Field, FieldType } from '../schema/types';
import { FieldInput } from '../filler/FormRenderer';
import { FieldIcon } from '../components/FieldIcon';
import TopBar from '../components/TopBar';
import Credits from '../components/Credits';
import PropertiesPanel from './PropertiesPanel';

const PAL = 'palette:';

function PaletteItem({ type, onAdded }: { type: FieldType; onAdded?: () => void }) {
  const addField = useForm((s) => s.addField);
  const { t } = useI18n();
  const { attributes, listeners, setNodeRef } = useDraggable({ id: PAL + type });
  const typeKey = type as keyof typeof t.fieldTypes;

  const handleClick = () => {
    addField(type);
    if (onAdded) onAdded();
  };

  return (
    <button ref={setNodeRef} className="palette-item" onClick={handleClick} {...listeners} {...attributes}>
      <FieldIcon type={type} />
      <span>{t.fieldTypes[typeKey] || FIELD_META[type].label}</span>
    </button>
  );
}

function SortableField({ field }: { field: Field }) {
  const { selectedId, select } = useForm();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style}
      className={`canvas-field ${field.width === 'half' ? 'half' : ''} ${selectedId === field.id ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={() => select(field.id)}>
      <button className="handle" aria-label="Reorder" {...attributes} {...listeners}><GripVertical size={16} strokeWidth={1.5} /></button>
      <div className="preview-inert"><FieldInput field={field} value={undefined} onChange={() => {}} preview /></div>
    </div>
  );
}

function Paper({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'paper' });
  return <div ref={setNodeRef} className={`paper ${isOver ? 'drop-target' : ''}`} onClick={(e) => e.stopPropagation()}>{children}</div>;
}

export default function Builder() {
  const s = useForm();
  const { t } = useI18n();
  const [dragType, setDragType] = useState<FieldType | null>(null);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragStart = (e: DragStartEvent) => {
    const id = String(e.active.id);
    setDragType(id.startsWith(PAL) ? (id.slice(PAL.length) as FieldType) : null);
  };

  const onDragEnd = (e: DragEndEvent) => {
    setDragType(null);
    const active = String(e.active.id);
    const ids = s.def.fields.map((f) => f.id);
    if (active.startsWith(PAL)) {
      if (!e.over) return;
      const at = ids.indexOf(String(e.over.id));
      s.addField(active.slice(PAL.length) as FieldType, at >= 0 ? at : undefined);
      return;
    }
    if (!e.over || active === e.over.id || e.over.id === 'paper') return;
    s.moveField(ids.indexOf(active), ids.indexOf(String(e.over.id)));
  };

  const count = s.def.fields.filter((f) => FIELD_META[f.type].input).length;

  const getGroupTitle = (g: string) => {
    if (g === 'نصوص') return t.groups.texts;
    if (g === 'اختيارات') return t.groups.choices;
    if (g === 'تخطيط') return t.groups.layout;
    return t.groups.others;
  };

  return (
    <div className="app">
      <TopBar />
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd}
        onDragCancel={() => setDragType(null)}>
        <div className="builder">
          {/* لوحة الحقول للشاشات الكبيرة */}
          <aside className="palette desktop-palette" aria-label={t.builder.fieldTypesHeading}>
            {FIELD_GROUPS.map((g) => (
              <div key={g} className="palette-group">
                <h4>{getGroupTitle(g)}</h4>
                {FIELD_TYPES.filter((tType) => FIELD_META[tType].group === g).map((tType) => (
                  <PaletteItem key={tType} type={tType} />
                ))}
              </div>
            ))}
          </aside>

          {/* مساحة العمل والورقة */}
          <main className="desk" onClick={() => s.select(null)}>
            <Paper>
              <textarea className="desc-input" placeholder={t.builder.descriptionPlaceholder} rows={2}
                value={s.def.meta.description || ''} onChange={(e) => s.updateMeta({ description: e.target.value })} />
              {!s.def.fields.length && <div className="empty">{t.builder.deskEmptyHint}</div>}
              <SortableContext items={s.def.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                <div className="fields-grid">
                  {s.def.fields.map((f) => <SortableField key={f.id} field={f} />)}
                </div>
              </SortableContext>
            </Paper>
          </main>

          {/* لوحة الخصائص للشاشات الكبيرة */}
          <aside className="props desktop-props" aria-label="Properties">
            <PropertiesPanel />
          </aside>

          {/* شريحة الخصائص المنزلقة للهواتف عند تحديد حقل */}
          {s.selectedId && (
            <div className="mobile-drawer-backdrop" onClick={() => s.select(null)}>
              <div className="mobile-drawer-sheet" onClick={(e) => e.stopPropagation()}>
                <PropertiesPanel onClose={() => s.select(null)} />
              </div>
            </div>
          )}

          {/* درج إضافة الحقول للهواتف */}
          {mobilePaletteOpen && (
            <div className="mobile-drawer-backdrop" onClick={() => setMobilePaletteOpen(false)}>
              <div className="mobile-drawer-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="panel-header-row">
                  <h3 className="panel-title">{t.builder.fieldTypesHeading}</h3>
                  <button className="icon-btn mobile-close-btn" aria-label={t.builder.closePanel} onClick={() => setMobilePaletteOpen(false)}>
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>
                <div className="mobile-palette-content">
                  {FIELD_GROUPS.map((g) => (
                    <div key={g} className="palette-group">
                      <h4>{getGroupTitle(g)}</h4>
                      <div className="mobile-palette-grid">
                        {FIELD_TYPES.filter((tType) => FIELD_META[tType].group === g).map((tType) => (
                          <PaletteItem key={tType} type={tType} onAdded={() => setMobilePaletteOpen(false)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DragOverlay dropAnimation={null}>
          {dragType && (
            <div className="palette-item overlay">
              <FieldIcon type={dragType} />
              <span>{t.fieldTypes[dragType as keyof typeof t.fieldTypes] || FIELD_META[dragType].label}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* أزرار عائمة سريعة للهاتف في أسفل الشاشة */}
      <div className="mobile-floating-bar no-print">
        <button
          type="button"
          className="btn primary mobile-float-btn"
          onClick={() => setMobilePaletteOpen(true)}
        >
          <Plus size={16} strokeWidth={2} />
          <span>{t.builder.addFieldMobile}</span>
        </button>
        <button
          type="button"
          className="btn mobile-float-btn"
          onClick={() => s.select(s.selectedId ? null : s.def.fields[0]?.id || null)}
          title={t.properties.formSettings}
        >
          <SlidersHorizontal size={16} strokeWidth={1.5} />
          <span>{t.properties.formSettings}</span>
        </button>
      </div>

      <footer className="statusbar no-print">
        <span>{s.def.fields.length} {t.builder.itemsCount} · {count} {t.builder.inputsCount}</span>
        <Credits compact />
        <span className={s.dirty ? 'unsaved' : ''}>{s.dirty ? t.builder.unsavedChanges : t.builder.noNewChanges}</span>
      </footer>
    </div>
  );
}
