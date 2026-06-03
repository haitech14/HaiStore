import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, Gift, Mail, Phone, Shield, User, X } from 'lucide-react';
import { toast } from 'sonner';

import {
  SPIN_DURATION_MS,
  SubscriptionRuletaWheel,
} from '@/components/subscription-ruleta-wheel';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  computeRuletaSpinDeltaDeg,
  formatPremioLabel,
  getPremioByIndex,
  pickRandomPremioIndex,
} from '@/config/subscription-ruleta-premios';
import { submitSupportTicket, SupportTicketError } from '@/lib/support-ticket';
import { cn } from '@/lib/utils';

const SESSION_KEY = 'subscription_popup_shown';
const OPEN_DELAY_MS = 2000;
const CLOSE_AFTER_TOAST_MS = 2200;
const IDLE_STEP_DEG = 0.38;
const IDLE_INTERVAL_MS = 32;

const STORE_PATHS = ['/', '/tienda'] as const;

const countryOptions = [
  { code: 'PE', flag: '🇵🇪', dial: '+51', label: 'Perú' },
  { code: 'CL', flag: '🇨🇱', dial: '+56', label: 'Chile' },
  { code: 'CO', flag: '🇨🇴', dial: '+57', label: 'Colombia' },
  { code: 'MX', flag: '🇲🇽', dial: '+52', label: 'México' },
  { code: 'US', flag: '🇺🇸', dial: '+1', label: 'Estados Unidos' },
] as const;

const subscriptionSchema = z.object({
  name: z.string().min(2, 'Introduce al menos 2 caracteres.'),
  email: z.string().email('Introduce un correo válido.'),
  country: z.enum(['PE', 'CL', 'CO', 'MX', 'US']),
  phone: z.string().optional(),
  terms: z.boolean().refine((value) => value, {
    message: 'Debes aceptar los términos y condiciones.',
  }),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

type FormPhase = 'idle' | 'submitting' | 'spinning';

function isStoreRoute(pathname: string): boolean {
  if (STORE_PATHS.includes(pathname as (typeof STORE_PATHS)[number])) return true;
  return pathname.startsWith('/tienda/');
}

function markPopupShown(): void {
  try {
    sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* storage no disponible */
  }
}

function wasPopupShown(): boolean {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function SubscriptionPopup() {
  const { pathname } = useLocation();
  const titleId = useId();
  const closeTimerRef = useRef<number | null>(null);
  const spinTimerRef = useRef<number | null>(null);
  const idleDiskRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<FormPhase>('idle');
  const [idleDiskRotation, setIdleDiskRotation] = useState(0);
  const [spinRotation, setSpinRotation] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      name: '',
      email: '',
      country: 'PE',
      phone: '',
      terms: false,
    },
  });

  const isBusy = phase === 'submitting' || phase === 'spinning';
  const onStorePage = isStoreRoute(pathname);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!onStorePage || wasPopupShown()) return;

    const timer = window.setTimeout(() => {
      setOpen(true);
      markPopupShown();
    }, OPEN_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [onStorePage, pathname]);

  useEffect(() => {
    if (!open || isBusy || prefersReducedMotion) return;

    const interval = window.setInterval(() => {
      setIdleDiskRotation((current) => {
        const next = current + IDLE_STEP_DEG;
        idleDiskRef.current = next;
        return next;
      });
    }, IDLE_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [open, isBusy, prefersReducedMotion]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
      if (spinTimerRef.current) window.clearTimeout(spinTimerRef.current);
    },
    [],
  );

  const handleClose = useCallback(() => {
    if (phase === 'spinning') return;
    setOpen(false);
  }, [phase]);

  const runSpin = useCallback((prizeIndex: number, premioLabel: string) => {
    const delta = computeRuletaSpinDeltaDeg(prizeIndex);
    const idleSnapshot = idleDiskRef.current;

    setPhase('spinning');
    setSpinRotation((current) => current + idleSnapshot + delta);
    setIdleDiskRotation(0);
    idleDiskRef.current = 0;

    spinTimerRef.current = window.setTimeout(() => {
      toast.success('¡Felicidades!', {
        description: `Ganaste: ${premioLabel}. Revisa tu correo en 48–72 h.`,
        duration: CLOSE_AFTER_TOAST_MS,
      });

      closeTimerRef.current = window.setTimeout(() => {
        setOpen(false);
        setPhase('idle');
      }, CLOSE_AFTER_TOAST_MS);
    }, SPIN_DURATION_MS);
  }, []);

  const onSubmit = async (values: SubscriptionFormValues) => {
    setPhase('submitting');
    const dial =
      countryOptions.find((country) => country.code === values.country)?.dial ?? '+51';
    const prizeIndex = pickRandomPremioIndex();
    const premio = getPremioByIndex(prizeIndex);
    const premioLabel = formatPremioLabel(premio);

    try {
      const ticket = await submitSupportTicket({
        name: values.name,
        email: values.email,
        message: `Suscripción Ruleta del Color — premio asignado: ${premioLabel}`,
        ...(values.phone?.trim() ? { phone: `${dial} ${values.phone.trim()}` } : {}),
        country: values.country,
        type: 'subscription_ruleta',
        metadata: {
          campaign: 'ruleta-del-color',
          countryCode: values.country,
          phoneDial: dial,
          prizeLabel: premioLabel,
        },
      });

      if (ticket.demo) {
        toast.warning('Modo demo HaiSupport', {
          description: 'El registro no llegó a soporte real. Configura HAISUPPORT_API_URL en el servidor.',
        });
      }

      window.requestAnimationFrame(() => {
        runSpin(prizeIndex, premioLabel);
      });
    } catch (error) {
      setPhase('idle');
      toast.error('No se pudo registrar tu participación', {
        description:
          error instanceof SupportTicketError
            ? error.message
            : 'Comprueba tu conexión e intenta de nuevo.',
      });
    }
  };

  if (!onStorePage) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
        else setOpen(true);
      }}
    >
      <DialogContent
        overlayClassName="z-[100] bg-black/60 backdrop-blur-sm"
        className={cn(
          'z-[101] max-h-[95dvh] w-[calc(100%-1rem)] max-w-[960px] overflow-y-auto border-0 bg-[#F5F5F5] p-0',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0',
          'data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
          'sm:rounded-2xl [&>button]:hidden',
        )}
        aria-labelledby={titleId}
        aria-describedby={undefined}
        aria-busy={isBusy}
        onInteractOutside={(event) => {
          if (phase === 'spinning') event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (phase === 'spinning') event.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">Suscripción — Ruleta del Color</DialogTitle>

        <div className="flex flex-col md:flex-row">
          {/* Columna izquierda — ruleta (~46%) */}
          <div
            className={cn(
              'relative flex min-h-[380px] flex-col items-center justify-center overflow-hidden px-4 py-8 md:min-h-[520px] md:w-[46%] md:shrink-0 md:py-10',
              'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900',
            )}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(220,38,38,0.22),transparent_42%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_78%,rgba(37,99,235,0.18),transparent_45%)]"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.12),transparent_50%)]"
            />

            <SubscriptionRuletaWheel
              idleDiskRotation={idleDiskRotation}
              spinRotation={spinRotation}
              isSpinning={phase === 'spinning'}
              className="relative z-10"
            />
          </div>

          {/* Columna derecha — formulario */}
          <div className="relative flex-1 bg-[#F5F5F5] px-5 py-7 sm:px-8 sm:py-8">
            <button
              type="button"
              onClick={handleClose}
              disabled={phase === 'spinning'}
              aria-label="Cerrar ventana de suscripción"
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            >
              <X className="size-4" aria-hidden="true" />
            </button>

            <div className="mb-6 flex items-start gap-3 pr-10">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-600/10 text-red-600">
                <Gift className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h2
                  id={titleId}
                  className="text-lg font-bold leading-tight text-foreground sm:text-xl"
                >
                  ¡Suscríbete y obtén un giro en la{' '}
                  <span className="text-red-600">Ruleta del Color</span>!
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Al registrarte participas por un giro en la{' '}
                  <span className="font-medium text-red-600">Ruleta del Color</span>.
                </p>
              </div>
            </div>

            <form
              onSubmit={(event) => void handleSubmit(onSubmit)(event)}
              className="flex flex-col gap-4"
              noValidate
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sub-name">Nombre</Label>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="sub-name"
                    placeholder="Nombre"
                    className="h-11 pl-10"
                    disabled={isBusy}
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? 'sub-name-error' : undefined}
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p id="sub-name-error" role="alert" className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sub-email">E-mail</Label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="sub-email"
                    type="email"
                    autoComplete="email"
                    placeholder="E-mail"
                    className="h-11 pl-10"
                    disabled={isBusy}
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'sub-email-error' : undefined}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p id="sub-email-error" role="alert" className="text-xs text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="sub-phone">Celular</Label>
                <div className="flex overflow-hidden rounded-lg border border-input shadow-sm focus-within:ring-2 focus-within:ring-ring">
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isBusy}
                      >
                        <SelectTrigger
                          className="h-11 w-[7.5rem] shrink-0 rounded-none border-0 border-r shadow-none focus:ring-0"
                          aria-label="País del celular"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {countryOptions.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.flag} {country.dial}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <div className="relative min-w-0 flex-1">
                    <Phone
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="sub-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="Celular"
                      className="h-11 rounded-none border-0 pl-10 shadow-none focus-visible:ring-0"
                      disabled={isBusy}
                      {...register('phone')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="sub-terms"
                      checked={field.value}
                      onCheckedChange={(checked) => field.onChange(checked === true)}
                      disabled={isBusy}
                      aria-invalid={!!errors.terms}
                      aria-describedby={errors.terms ? 'sub-terms-error' : undefined}
                    />
                  )}
                />
                <Label htmlFor="sub-terms" className="text-xs leading-snug text-muted-foreground">
                  Acepto los{' '}
                  <Link to="/terminos" className="font-semibold text-red-600 hover:underline">
                    términos y condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link to="/privacidad" className="font-semibold text-red-600 hover:underline">
                    política de privacidad
                  </Link>
                  .
                </Label>
              </div>
              {errors.terms && (
                <p id="sub-terms-error" role="alert" className="text-xs text-destructive">
                  {errors.terms.message}
                </p>
              )}

              <Button
                type="submit"
                disabled={isBusy}
                className="h-12 w-full gap-2 bg-red-600 text-base font-semibold text-white hover:bg-red-500 focus-visible:ring-red-600"
              >
                {phase === 'submitting'
                  ? 'Registrando…'
                  : phase === 'spinning'
                    ? 'Girando la ruleta…'
                    : 'Regístrate y gira la ruleta'}
                <span className="flex size-6 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="size-4" aria-hidden="true" />
                </span>
              </Button>

              <div className="flex gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-[0.7rem] leading-snug text-red-800">
                <Shield className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p>
                  *Premios sujetos a condiciones de la promoción. No acumulable con otras ofertas
                  salvo indicación.
                </p>
              </div>

              <p className="flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                <Mail className="size-3.5 shrink-0 text-blue-500" aria-hidden="true" />
                Cupón será enviado por correo y será válido por 48 a 72 horas.
              </p>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
