import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';

import { useMobileBottomInset } from '@/context/mobile-bottom-inset-context';
import {
  buildRandomSocialProofMessage,
  randomSocialProofCycleDelayMs,
  randomSocialProofInitialDelayMs,
  SOCIAL_PROOF_VISIBLE_MS,
} from '@/lib/product-social-proof';
import { cn } from '@/lib/utils';

interface ProductDetailSocialProofToastProps {
  productName: string;
}

export function ProductDetailSocialProofToast({ productName }: ProductDetailSocialProofToastProps) {
  const bottomInset = useMobileBottomInset();
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let showTimeout = 0;
    let hideTimeout = 0;

    const scheduleShow = (delayMs: number) => {
      showTimeout = window.setTimeout(() => {
        setMessage(buildRandomSocialProofMessage(productName));
        setVisible(true);

        hideTimeout = window.setTimeout(() => {
          setVisible(false);
          scheduleShow(randomSocialProofCycleDelayMs());
        }, SOCIAL_PROOF_VISIBLE_MS);
      }, delayMs);
    };

    scheduleShow(randomSocialProofInitialDelayMs());

    return () => {
      window.clearTimeout(showTimeout);
      window.clearTimeout(hideTimeout);
    };
  }, [productName]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'fixed left-3 z-30 max-w-[min(20rem,calc(100vw-1.5rem))] rounded-lg border border-border/80 bg-background/95 p-3 shadow-lg backdrop-blur-sm sm:left-4 lg:max-w-xs',
        'motion-safe:transition-all motion-safe:duration-300',
        visible
          ? 'motion-safe:translate-y-0 opacity-100'
          : 'pointer-events-none motion-safe:translate-y-2 opacity-0',
      )}
      style={{
        bottom: `calc(0.75rem + ${bottomInset}px + env(safe-area-inset-bottom, 0px))`,
      }}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-600/10 text-red-600"
          aria-hidden="true"
        >
          <ShoppingBag className="size-4" strokeWidth={1.75} />
        </span>
        <p className="text-sm leading-snug text-foreground">
          <span className="font-medium">{message}</span>
        </p>
      </div>
    </div>
  );
}
