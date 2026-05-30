import { useId, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ProductDetailPurchaseAccordionProps {
  title: string;
  subtitle: string;
  expanded: boolean;
  onToggle: () => void;
  panelId: string;
  children: ReactNode;
}

export function ProductDetailPurchaseAccordion({
  title,
  subtitle,
  expanded,
  onToggle,
  panelId,
  children,
}: ProductDetailPurchaseAccordionProps) {
  const triggerId = useId();

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
      <button
        type="button"
        id={triggerId}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-neutral-900">{title}</span>
          <span className="mt-0.5 block text-xs text-neutral-500">{subtitle}</span>
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-neutral-400 transition-transform duration-200',
            expanded && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={triggerId}
          className="border-t border-neutral-100 px-4 py-3"
        >
          {children}
        </div>
      )}
    </div>
  );
}
