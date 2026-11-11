import { useEffect } from 'react';
import { useForm } from './store/formStore';
import Home from './components/Home';
import Builder from './builder/Builder';
import Filler from './filler/Filler';
import AboutPage from './components/AboutPage';

import ConfirmModal from './components/ConfirmModal';

export default function App() {
  const { view, dirty, toast } = useForm();

  // تحذير قبل إغلاق الصفحة عند وجود تعديلات غير مُصدَّرة (لا يوجد حفظ تلقائي)
  useEffect(() => {
    const h = (e: BeforeUnloadEvent) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [dirty]);

  return (
    <>
      {view === 'home' && <Home />}
      {view === 'builder' && <Builder />}
      {view === 'filler' && <Filler />}
      {view === 'about' && <AboutPage />}
      <ConfirmModal />
      {toast && <div className={`toast ${toast.kind} no-print`}>{toast.msg}</div>}
    </>
  );
}
