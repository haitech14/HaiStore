import { useEffect, useState } from 'react';

import {
  getSecondsUntilLimaMidnight,
  splitCountdown,
} from '@/lib/flash-deals';

function padTwo(value: number): string {
  return String(value).padStart(2, '0');
}

interface CountdownUnitProps {
  value: string;
  label: string;
}

function CountdownUnit({ value, label }: CountdownUnitProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="flex min-h-11 min-w-[2.75rem] items-center justify-center rounded-lg bg-card px-2 text-xl font-bold tabular-nums text-foreground shadow-sm sm:min-h-12 sm:min-w-[3rem] sm:text-2xl"
        aria-hidden="true"
      >
        {value}
      </span>
      <span className="text-[0.65rem] font-medium uppercase tracking-wide text-neutral-300 sm:text-xs">
        {label}
      </span>
    </div>
  );
}

export function FlashDealsCountdown() {
  const [remaining, setRemaining] = useState(() => getSecondsUntilLimaMidnight());

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const tick = () => setRemaining(getSecondsUntilLimaMidnight());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const { hours, minutes, seconds } = splitCountdown(remaining);

  return (
    <div
      className="flex items-center justify-center gap-1.5 sm:gap-2 lg:justify-start"
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Tiempo restante de ofertas: ${hours} horas, ${minutes} minutos y ${seconds} segundos`}
    >
      <CountdownUnit value={padTwo(hours)} label="Hrs" />
      <span className="pb-5 text-lg font-bold text-neutral-400" aria-hidden="true">
        :
      </span>
      <CountdownUnit value={padTwo(minutes)} label="Min" />
      <span className="pb-5 text-lg font-bold text-neutral-400" aria-hidden="true">
        :
      </span>
      <CountdownUnit value={padTwo(seconds)} label="Seg" />
    </div>
  );
}
