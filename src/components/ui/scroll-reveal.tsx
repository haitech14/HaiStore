import { useEffect, useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  /** Retraso escalonado al entrar en viewport (ms). */
  delayMs?: number;
}

export function ScrollReveal({ children, className, delayMs = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }

    let delayTimer: number | undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        if (delayMs > 0) {
          delayTimer = window.setTimeout(() => setVisible(true), delayMs);
          return;
        }
        setVisible(true);
      },
      { threshold: 0.08, rootMargin: '0px 0px -2% 0px' },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (delayTimer) window.clearTimeout(delayTimer);
    };
  }, [delayMs]);

  return (
    <div
      ref={ref}
      className={cn(
        'motion-reduce:translate-y-0 motion-reduce:opacity-100',
        'transition-[opacity,transform] duration-700 ease-out',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}
