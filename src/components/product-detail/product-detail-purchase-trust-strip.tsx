import { Headphones, Lock, ShieldCheck, Truck, type LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProductDetailPurchaseTrustStripProps {
  brandLabel?: string;
  className?: string;
}

function buildTrustItems(brandLabel: string) {
  return [
    {
      id: 'envio',
      icon: Truck,
      title: 'Envío rápido',
      description: 'Entrega segura a todo el país',
    },
    {
      id: 'garantia',
      icon: ShieldCheck,
      title: 'Garantía oficial',
      description: `12 meses de garantía ${brandLabel || 'Ricoh'}`,
    },
    {
      id: 'soporte',
      icon: Headphones,
      title: 'Soporte técnico',
      description: 'Asesoría pre y postventa especializada',
    },
    {
      id: 'pago',
      icon: Lock,
      title: 'Pago seguro',
      description: 'Transacciones 100% seguras',
    },
  ] satisfies Array<{
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
  }>;
}

export function ProductDetailPurchaseTrustStrip({
  brandLabel = 'Ricoh',
  className,
}: ProductDetailPurchaseTrustStripProps) {
  const items = buildTrustItems(brandLabel);

  return (
    <section
      aria-label="Beneficios de compra"
      className={cn(
        'rounded-xl border border-border/60 bg-muted/25 px-4 py-4 sm:px-5 sm:py-5',
        className,
      )}
    >
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex items-start gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center text-muted-foreground sm:size-10"
                aria-hidden="true"
              >
                <Icon className="size-5 sm:size-[1.35rem]" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 pt-0.5">
                <p className="text-pretty text-sm font-bold leading-snug text-[#0f1f3d] sm:text-[0.9375rem]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-pretty text-xs leading-snug text-muted-foreground sm:text-sm">
                  {item.description}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
