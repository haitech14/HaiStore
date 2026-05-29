import type { FormEvent } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  Clock,
  Eye,
  EyeOff,
  Headphones,
  Lock,
  Mail,
  Printer,
  Shield,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiWhatsapp } from '@mdi/js';

import { PrintcoreHexLogo } from '@/components/auth/printcore-hex-logo';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { cn } from '@/lib/utils';

const WHATSAPP_LINK = 'https://wa.me/51915149290';
const SUPPORT_PHONE = '+51 915 149 290';

const headerFeatures = [
  {
    icon: Printer,
    title: 'IMPRESORAS',
    subtitle: 'Alto rendimiento',
  },
  {
    icon: Wrench,
    title: 'TÓNER Y REPUESTOS',
    subtitle: 'Originales y compatibles',
  },
  {
    icon: Headphones,
    title: 'SOPORTE TÉCNICO',
    subtitle: 'Especialistas certificados',
  },
] as const;

const heroFeatures = [
  { icon: Shield, text: 'Tecnología de alto rendimiento' },
  { icon: Award, text: 'Calidad garantizada y certificada' },
  { icon: Clock, text: 'Soporte 24/7 a tu disposición' },
] as const;

const footerFeatures: Array<{
  icon: typeof ShieldCheck;
  title: string;
  text: string;
  highlight?: boolean;
}> = [
  {
    icon: ShieldCheck,
    title: 'Compra segura',
    text: 'Transacciones protegidas y confiables.',
  },
  {
    icon: Headphones,
    title: 'Soporte especializado',
    text: 'Técnicos certificados listos para ayudarte.',
  },
  {
    icon: Clock,
    title: 'Respuesta rápida',
    text: 'Atención ágil para que tu negocio no se detenga.',
  },
  {
    icon: Lock,
    title: 'Datos protegidos',
    text: 'Cumplimos con los más altos estándares de seguridad.',
    highlight: true,
  },
];

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/tienda';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      const destination =
        email.trim().toLowerCase() === 'admin@haitech.pe' ? '/panel/inventario' : from;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-printcore relative flex min-h-dvh flex-col overflow-x-hidden bg-black text-white">
      {/* Fondo con destellos rojos */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="login-glow-orb login-glow-orb--left" />
        <div className="login-glow-orb login-glow-orb--right" />
        <div className="login-glow-line login-glow-line--1" />
        <div className="login-glow-line login-glow-line--2" />
      </div>

      {/* Cabecera */}
      <header className="relative z-10 border-b border-white/5 px-4 py-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link to="/" className="flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
            <PrintcoreHexLogo className="size-10 shrink-0 text-red-600" />
            <div className="leading-tight">
              <span className="block text-xl font-bold tracking-wide text-white">PRINTCORE</span>
              <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-red-600">
                Soluciones de impresión
              </span>
            </div>
          </Link>

          <ul className="hidden flex-wrap items-center justify-center gap-6 md:flex lg:gap-10">
            {headerFeatures.map((item) => (
              <li key={item.title} className="flex items-center gap-2.5">
                <item.icon className="size-5 shrink-0 text-red-600" strokeWidth={1.75} aria-hidden="true" />
                <div className="leading-tight">
                  <p className="text-[0.65rem] font-bold uppercase tracking-wide text-white">
                    {item.title}
                  </p>
                  <p className="text-[0.6rem] text-white/45">{item.subtitle}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2.5 lg:justify-end">
            <Headphones className="size-5 text-red-600" aria-hidden="true" />
            <div className="leading-tight">
              <p className="text-xs text-white/50">¿Necesitas ayuda?</p>
              <a
                href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}
                className="text-sm font-semibold text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                {SUPPORT_PHONE}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="relative z-10 mx-auto grid w-full max-w-[1400px] flex-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-10 lg:py-12">
        {/* Tarjeta de login */}
        <section
          aria-labelledby="login-titulo"
          className="login-card-glow mx-auto w-full max-w-md rounded-2xl border border-red-600/40 p-6 sm:p-8 lg:mx-0"
        >
          <div className="mb-6 flex justify-center">
            <span className="flex size-12 items-center justify-center rounded-xl border border-red-600/30 bg-red-600/10">
              <Shield className="size-6 text-red-600" aria-hidden="true" />
            </span>
          </div>

          <h1 id="login-titulo" className="text-center text-3xl font-bold sm:text-4xl">
            <span className="text-white">Bien</span>
            <span className="text-red-600">venido</span>
          </h1>
          <p className="mt-2 text-center text-sm text-white/50">
            Accede a tu cuenta para gestionar tus pedidos, soporte y más.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35"
                aria-hidden="true"
              />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="login-input w-full"
              />
            </div>

            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-white/35"
                aria-hidden="true"
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Contraseña"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="login-input w-full pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/40 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden="true" />
                ) : (
                  <Eye className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={remember}
                  onCheckedChange={(checked) => setRemember(checked === true)}
                  className="border-red-600 data-[state=checked]:bg-red-600 data-[state=checked]:text-white"
                />
                <Label htmlFor="remember" className="cursor-pointer text-xs text-white/70">
                  Mantener sesión iniciada
                </Label>
              </div>
              <Link
                to="/contacto"
                className="text-xs font-medium text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            {error && (
              <p role="alert" className="text-center text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-red-600 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:opacity-60"
            >
              {isSubmitting ? 'Ingresando…' : 'Ingresar'}
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>

            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-white/25 bg-transparent text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            >
              <Icon path={mdiWhatsapp} size={0.85} className="text-[#25D366]" aria-hidden="true" />
              Continuar por WhatsApp
            </a>
          </form>

          <p className="mt-6 text-center text-sm text-white/50">
            ¿No tienes cuenta?{' '}
            <Link
              to="/login/registro"
              className="font-semibold text-red-600 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            >
              Crear cuenta
            </Link>
          </p>
        </section>

        {/* Hero visual */}
        <section
          aria-label="Equipos de impresión de alto rendimiento"
          className="relative hidden min-h-[420px] lg:block"
        >
          <div className="relative flex h-full items-center justify-center">
            <div className="login-hero-ring absolute aspect-square w-[min(100%,520px)]" aria-hidden="true" />

            <div className="relative z-10 flex w-full max-w-lg items-end justify-center px-4 pb-8 pt-16">
              <img
                src="/hero-products.png"
                alt=""
                className="max-h-[340px] w-auto max-w-full object-contain drop-shadow-2xl"
                loading="eager"
              />
            </div>

            <ul className="absolute right-0 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-5">
              {heroFeatures.map((item) => (
                <li key={item.text} className="flex max-w-[200px] items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-red-600/30 bg-black/60 text-red-600">
                    <item.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-medium leading-snug text-white/80">{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* Pie de página */}
      <footer className="relative z-10 border-t border-white/5 px-4 py-8 sm:px-6 lg:px-10">
        <ul className="mx-auto grid max-w-[1400px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {footerFeatures.map((item) => (
            <li
              key={item.title}
              className={cn(
                'flex gap-3 rounded-xl p-4',
                item.highlight && 'border border-white/10 bg-white/[0.03]',
              )}
            >
              <span className="flex size-10 shrink-0 items-center justify-center">
                <PrintcoreHexLogo className="size-8 text-red-600" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">{item.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-white/45">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}
