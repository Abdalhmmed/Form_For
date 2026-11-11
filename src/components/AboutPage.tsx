import { ShieldCheck, FileCode, Printer, Smartphone, User, Phone, Mail, Home } from 'lucide-react';
import { useForm } from '../store/formStore';
import { useI18n } from '../i18n';
import LanguageSelector from './LanguageSelector';
import Credits, { AUTHOR } from './Credits';

export default function AboutPage() {
  const { setView } = useForm();
  const { t } = useI18n();

  const authorName = t.credits.authorName || AUTHOR.nameAr;
  const authorDesc = (t.aboutPage.authorDesc || '').replace('{author}', authorName);
  const authorLegalNote = (t.aboutPage.authorLegalNote || '').replace('{author}', authorName);

  return (
    <div className="app">
      <header className="topbar about-topbar no-print">
        <button className="brand-btn" onClick={() => setView('home')}>
          <img src="/logo.svg" alt="FF" className="brand-logo" />
          <span className="brand-title-text">{t.brand}</span>
        </button>

        <div className="home-topbar-actions">
          <button
            type="button"
            className="btn on-dark nav-action-btn"
            title={t.topbar.homeBtn}
            onClick={() => setView('home')}
          >
            <Home size={15} strokeWidth={1.75} />
            <span>{t.topbar.homeBtn}</span>
          </button>
          <LanguageSelector onDark={true} />
        </div>
      </header>

      <main className="about-page">
        {/* المقدمة والهدف */}
        <div className="about-hero">
          <div className="hero-logo-badge">
            <img src="/logo.svg" alt="FF Logo" className="hero-logo-large" />
          </div>
          <h1>{t.aboutPage.title}</h1>
          <p className="about-lead">{t.aboutPage.lead}</p>
        </div>

        {/* المبادئ والهدف الأساسي */}
        <section className="about-grid-3">
          <div className="about-card">
            <div className="about-card-icon danger">
              <ShieldCheck size={24} strokeWidth={1.75} />
            </div>
            <h3>{t.aboutPage.feature1Title}</h3>
            <p>{t.aboutPage.feature1Desc}</p>
          </div>

          <div className="about-card">
            <div className="about-card-icon primary">
              <FileCode size={24} strokeWidth={1.75} />
            </div>
            <h3>{t.aboutPage.feature2Title}</h3>
            <p>{t.aboutPage.feature2Desc}</p>
          </div>

          <div className="about-card">
            <div className="about-card-icon success">
              <Printer size={24} strokeWidth={1.75} />
            </div>
            <h3>{t.aboutPage.feature3Title}</h3>
            <p>{t.aboutPage.feature3Desc}</p>
          </div>
        </section>

        {/* آلية العمل التوضيحية */}
        <section className="about-workflow-section">
          <h2>{t.aboutPage.workflowTitle}</h2>
          <div className="workflow-steps">
            <div className="workflow-step-card">
              <span className="step-num">01</span>
              <h4>{t.aboutPage.step1Title}</h4>
              <p>{t.aboutPage.step1Desc}</p>
            </div>

            <div className="workflow-step-card">
              <span className="step-num">02</span>
              <h4>{t.aboutPage.step2Title}</h4>
              <p>{t.aboutPage.step2Desc}</p>
            </div>

            <div className="workflow-step-card">
              <span className="step-num">03</span>
              <h4>{t.aboutPage.step3Title}</h4>
              <p>{t.aboutPage.step3Desc}</p>
            </div>
          </div>
        </section>

        {/* التوافق والتجاوب */}
        <section className="about-features-row">
          <div className="feature-item">
            <Smartphone size={22} strokeWidth={1.5} />
            <div>
              <h4>{t.aboutPage.responsiveTitle}</h4>
              <p>{t.aboutPage.responsiveDesc}</p>
            </div>
          </div>
          <div className="feature-item">
            <ShieldCheck size={22} strokeWidth={1.5} />
            <div>
              <h4>{t.aboutPage.undoRedoTitle}</h4>
              <p>{t.aboutPage.undoRedoDesc}</p>
            </div>
          </div>
        </section>

        {/* بطاقة الحقوق الرسمية والمطور */}
        <section className="author-official-card">
          <div className="author-header">
            <div className="author-avatar">
              <User size={30} strokeWidth={1.5} />
            </div>
            <div>
              <span className="author-subtitle">{t.aboutPage.authorSubtitle}</span>
              <h3 className="author-name">{authorName}</h3>
            </div>
          </div>

          <p className="author-desc">{authorDesc}</p>

          <div className="author-contact-grid">
            <a href={`tel:${AUTHOR.phone.replace(/\s/g, '')}`} className="contact-item" dir="ltr">
              <Phone size={16} strokeWidth={1.5} />
              <span>{AUTHOR.phone}</span>
            </a>
            <a href={`mailto:${AUTHOR.email}`} className="contact-item" dir="ltr">
              <Mail size={16} strokeWidth={1.5} />
              <span>{AUTHOR.email}</span>
            </a>
          </div>

          <div className="author-legal-note">
            {authorLegalNote}
          </div>
        </section>

        <div className="about-actions-bottom">
          <button className="btn primary lg" onClick={() => setView('builder')}>
            {t.aboutPage.startDesigningBtn}
          </button>
        </div>
      </main>

      <Credits />
    </div>
  );
}
