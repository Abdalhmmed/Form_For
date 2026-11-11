import { useEffect, useRef } from 'react';
import { AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { useDialog } from '../store/dialogStore';
import { useI18n } from '../i18n';

export default function ConfirmModal() {
  const { confirmState, closeConfirm } = useDialog();
  const t = useI18n((s) => s.t);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirmState?.isOpen) {
      // تركيز تلقائي على زر الإلغاء لمنع الحذف بالخطأ عند ضغط Enter
      setTimeout(() => cancelBtnRef.current?.focus(), 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeConfirm(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [confirmState?.isOpen, closeConfirm]);

  if (!confirmState || !confirmState.isOpen) return null;

  const variant = confirmState.variant || 'primary';
  const confirmText = confirmState.confirmText || t.dialogs.confirm;
  const cancelText = confirmState.cancelText || t.dialogs.cancel;

  return (
    <div className="modal-backdrop" onClick={() => closeConfirm(false)} role="presentation">
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className={`modal-icon-badge ${variant}`}>
            {variant === 'danger' ? (
              <AlertTriangle size={20} strokeWidth={2} />
            ) : variant === 'warning' ? (
              <AlertCircle size={20} strokeWidth={2} />
            ) : (
              <HelpCircle size={20} strokeWidth={2} />
            )}
          </div>
          <h3 id="modal-title" className="modal-title">{confirmState.title}</h3>
        </div>

        <p id="modal-desc" className="modal-message">{confirmState.message}</p>

        <div className="modal-actions">
          <button
            ref={cancelBtnRef}
            type="button"
            className="btn"
            onClick={() => closeConfirm(false)}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn ${variant === 'danger' ? 'danger' : 'primary'}`}
            onClick={() => closeConfirm(true)}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
