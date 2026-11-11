import { useRef, useEffect } from 'react';
import { Undo2, Redo2, FolderOpen, Download } from 'lucide-react';
import { useForm } from '../store/formStore';
import { useDialog } from '../store/dialogStore';
import { useI18n } from '../i18n';
import { exportSchema, validateBeforeExport } from '../io/schemaIO';
import { useImport } from './Home';
import LanguageSelector from './LanguageSelector';

export default function TopBar() {
  const s = useForm();
  const { confirm } = useDialog();
  const { t } = useI18n();
  const doImport = useImport();
  const input = useRef<HTMLInputElement>(null);

  const canUndo = s.canUndo();
  const canRedo = s.canRedo();

  // اختصارات لوحة المفاتيح: Ctrl+Z للتراجع، و Ctrl+Y أو Ctrl+Shift+Z للتقدم
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (e.key.toLowerCase() === 'z') {
          if (e.shiftKey) {
            if (s.canRedo()) {
              e.preventDefault();
              s.redo();
            }
          } else {
            if (!isInput && s.canUndo()) {
              e.preventDefault();
              s.undo();
            }
          }
        } else if (e.key.toLowerCase() === 'y') {
          if (!isInput && s.canRedo()) {
            e.preventDefault();
            s.redo();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [s]);

  const handleHomeClick = async () => {
    if (s.dirty) {
      const ok = await confirm({
        title: t.dialogs.unsavedTitle,
        message: t.dialogs.unsavedMessage,
        confirmText: t.dialogs.confirm,
        cancelText: t.dialogs.cancel,
        variant: 'danger',
      });
      if (!ok) return;
    }
    s.setView('home');
  };

  const doExport = () => {
    const errs = validateBeforeExport(s.def);
    if (errs.length) return s.showToast(errs[0], 'err');
    exportSchema(s.def);
    s.markClean();
    s.showToast(t.topbar.schemaExported);
  };

  return (
    <header className="topbar no-print">
      <div className="topbar-row-main">
        <div className="topbar-left-zone">
          <button className="brand-btn" onClick={handleHomeClick} title={t.brand}>
            <img src="./logo.svg" alt="FF" className="brand-logo" />
            <span className="brand-text">{t.brand}</span>
          </button>
          <span className="sep hide-mobile" />
          <input className="title-input" aria-label="اسم النموذج" value={s.def.meta.title}
            onChange={(e) => s.updateMeta({ title: e.target.value })} />

          {s.view === 'builder' && (
            <div className="history-actions" aria-label="التراجع والتقدم">
              <button
                className="icon-btn on-dark-icon"
                title={t.topbar.undoTooltip}
                aria-label="تراجع"
                disabled={!canUndo}
                onClick={s.undo}
              >
                <Undo2 size={15} strokeWidth={1.5} />
              </button>
              <button
                className="icon-btn on-dark-icon"
                title={t.topbar.redoTooltip}
                aria-label="تقدم"
                disabled={!canRedo}
                onClick={s.redo}
              >
                <Redo2 size={15} strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

        <div className="topbar-actions">
          <LanguageSelector onDark={true} />
          <button className="btn on-dark topbar-action-btn" title={t.topbar.openBtn} onClick={() => input.current?.click()}>
            <FolderOpen size={15} strokeWidth={1.5} className="show-mobile-icon" />
            <span className="hide-mobile">{t.topbar.openBtn}</span>
          </button>
          <button className="btn on-dark strong topbar-action-btn" title={t.topbar.exportBtn} onClick={doExport}>
            <Download size={15} strokeWidth={1.5} className="show-mobile-icon" />
            <span className="hide-mobile">{t.topbar.exportBtn}</span>
          </button>
        </div>
      </div>

      <nav className="tabs" role="tablist">
        <button role="tab" aria-selected={s.view === 'builder'} onClick={() => s.setView('builder')}>
          {t.topbar.designTab}
        </button>
        <button role="tab" aria-selected={s.view === 'filler'} disabled={!s.def.fields.length}
          onClick={() => s.setView('filler')}>
          {t.topbar.fillTab}
        </button>
      </nav>

      <input ref={input} type="file" accept=".json,application/json" hidden
        onChange={(e) => { doImport(e.target.files?.[0]); e.target.value = ''; }} />
    </header>
  );
}
