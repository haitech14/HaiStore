import { Link } from 'react-router-dom';
import { Clock, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiFacebook, mdiInstagram, mdiWhatsapp, mdiYoutube } from '@mdi/js';

import { DEFAULT_COMPANY_SETTINGS } from '@/types/company-settings';
import { FooterBrandsSection } from '@/components/layout/footer-brands-section';

const WHATSAPP_LINK = 'https://wa.me/51915149290';
const { companyName, legalName, ruc, phone, email } = DEFAULT_COMPANY_SETTINGS;

type FooterContactItem =
  | { kind: 'mdi'; icon: string; label: string; href: string }
  | { kind: 'lucide'; icon: typeof Phone; label: string; href: string }
  | { kind: 'lucide'; icon: typeof Clock; label: string; href: null };

const contactItems: FooterContactItem[] = [
  {
    kind: 'mdi',
    icon: mdiWhatsapp,
    label: 'Atención por WhatsApp',
    href: WHATSAPP_LINK,
  },
  { kind: 'lucide', icon: Phone, label: phone, href: 'tel:+51915149290' },
  { kind: 'lucide', icon: Clock, label: 'Lun - Sáb 9:00 am a 6:00 pm', href: null },
  { kind: 'lucide', icon: Mail, label: email, href: `mailto:${email}` },
  {
    kind: 'lucide',
    icon: Mail,
    label: 'servicioalcliente@haitech.pe',
    href: 'mailto:servicioalcliente@haitech.pe',
  },
];

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com/', path: mdiFacebook },
  { label: 'Instagram', href: 'https://instagram.com/', path: mdiInstagram },
  { label: 'YouTube', href: 'https://youtube.com/', path: mdiYoutube },
  { label: 'TikTok', href: 'https://tiktok.com/', path: null as string | null },
] as const;

function ContactIcon({ item }: { item: FooterContactItem }) {
  if (item.kind === 'mdi') {
    return (
      <Icon path={item.icon} size={0.7} className="size-4 shrink-0 text-white/80" aria-hidden="true" />
    );
  }
  const LucideIcon = item.icon;
  return <LucideIcon className="size-4 shrink-0 text-white/80" aria-hidden="true" />;
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.4 2.48-6.4 5.83 0 3.45 2.76 5.7 6.2 5.7 3.45 0 6.2-2.76 6.2-6.2V8.43a7.35 7.35 0 0 0 4.3 1.38V6.56a4.28 4.28 0 0 1-1-.74z" />
    </svg>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-auto">
      <FooterBrandsSection />

      <div className="bg-neutral-950 text-white/70">
      <div className="container py-6 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <Link
              to="/"
              className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              aria-label={`${companyName}, inicio`}
            >
              <img src="/logo.png" alt={companyName} className="h-8 w-auto" />
            </Link>

            <h2 className="mb-2.5 mt-4 text-sm font-bold text-white">Contáctanos</h2>
            <ul className="flex flex-col gap-2">
              {contactItems.map((item) => {
                const row = (
                  <span className="flex items-start gap-2.5 text-sm text-white/65">
                    <ContactIcon item={item} />
                    <span>{item.label}</span>
                  </span>
                );

                if (item.href === null) {
                  return <li key={item.label}>{row}</li>;
                }

                return (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="transition-colors hover:text-white focus-visible:outline-none focus-visible:text-white"
                    >
                      {row}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-col items-start gap-4 sm:items-end">
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 rounded border border-white/15 bg-white px-2.5 py-1.5 transition-colors hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
              aria-label="Libro de reclamaciones"
            >
              <span className="flex size-8 items-center justify-center rounded bg-neutral-100 text-[0.5rem] font-bold leading-none text-neutral-800">
                LR
              </span>
              <span className="text-[0.65rem] font-semibold uppercase leading-tight text-neutral-800">
                Libro de
                <br />
                reclamaciones
              </span>
            </Link>

            <ul className="flex items-center gap-2">
              {socialLinks.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    {social.path ? (
                      <Icon path={social.path} size={0.85} aria-hidden="true" />
                    ) : (
                      <TikTokIcon />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-neutral-900/80">
        <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <span className="shrink-0 text-sm font-semibold text-white">Métodos de pago</span>
            <img
              src="/mediosdepago2.png"
              alt="Visa, Mastercard, American Express y otros medios de pago"
              className="h-6 w-auto max-w-full object-contain object-left opacity-90"
              loading="lazy"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-white/75 sm:text-sm">
            <span>Compra segura</span>
            <ShieldCheck className="size-4 shrink-0 text-green-500" aria-hidden="true" />
            <span className="rounded border border-white/20 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-white/90">
              SSL
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <p className="container text-center text-xs leading-relaxed text-white/50">
          © {year} {companyName}. Todos los derechos reservados. / RUC: {ruc} / Razón Social:{' '}
          {legalName}
        </p>
      </div>
      </div>
    </footer>
  );
}
