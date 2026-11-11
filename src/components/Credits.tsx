import { useI18n } from '../i18n';

export const AUTHOR = {
  nameAr: 'عبدالحميد هلال احمد دعبان',
  nameEn: 'Abdelhamid Helal Ahmed Daban',
  phone: '+967 778123807',
  email: 'abdalhmmeddaban@gmail.com',
};

export default function Credits({ compact }: { compact?: boolean }) {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  const authorName = t.credits.authorName || AUTHOR.nameAr;

  if (compact) return <span className="credit-inline">© {year} {authorName}</span>;
  return (
    <footer className="credits no-print">
      <span>© {year} {t.credits.allRightsReserved} — <b>{authorName}</b></span>
      <a href={`tel:${AUTHOR.phone.replace(/\s/g, '')}`} dir="ltr">{AUTHOR.phone}</a>
      <a href={`mailto:${AUTHOR.email}`} dir="ltr">{AUTHOR.email}</a>
    </footer>
  );
}
