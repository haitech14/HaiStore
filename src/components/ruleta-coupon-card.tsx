import type { RuletaPremio } from '@/config/subscription-ruleta-premios';
import { formatPremioLabel } from '@/config/subscription-ruleta-premios';
import { cn } from '@/lib/utils';

interface RuletaCouponCardProps {
  premio: RuletaPremio;
  className?: string;
}

export function RuletaCouponCard({ premio, className }: RuletaCouponCardProps) {
  const label = formatPremioLabel(premio);
  const Icon = premio.icon;

  return (
    <div
      className={cn(
        'relative mx-auto w-full max-w-[280px] overflow-hidden rounded-xl',
        'border-2 border-dashed border-red-300 bg-gradient-to-br from-white via-red-50/80 to-amber-50',
        'shadow-[0_8px_32px_rgba(220,38,38,0.18)]',
        className,
      )}
      role="img"
      aria-label={`Cupón ganado: ${label}`}
    >
      {/* Muescas laterales tipo ticket */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5F5F5]"
      />
      <span
        aria-hidden="true"
        className="absolute right-0 top-1/2 size-5 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F5F5F5]"
      />

      <div className="border-b border-dashed border-red-200 px-5 py-4 text-center">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-red-600">
          Ruleta del Color
        </p>
        <p className="mt-0.5 text-[0.6rem] font-medium uppercase tracking-wider text-muted-foreground">
          Cupón de premio
        </p>
      </div>

      <div className="flex flex-col items-center gap-3 px-5 py-6">
        <span
          className="flex size-14 items-center justify-center rounded-full shadow-md"
          style={{ backgroundColor: premio.sectorColor }}
          aria-hidden="true"
        >
          <Icon className="size-7 text-white" strokeWidth={1.5} />
        </span>
        <p className="text-center text-xl font-extrabold leading-tight text-foreground sm:text-2xl">
          {label}
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Válido por 48 a 72 horas · Te lo enviamos por correo
        </p>
      </div>

      <div
        aria-hidden="true"
        className="border-t border-dashed border-red-200 bg-red-600/5 px-5 py-2.5 text-center"
      >
        <p className="font-mono text-[0.6rem] font-semibold uppercase tracking-widest text-red-700/70">
          HAISTORE · PROMO 2026
        </p>
      </div>
    </div>
  );
}
