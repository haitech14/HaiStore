import type { ProductFeatureIcon } from '@/types/product-detail';

interface ProductDetailFeaturesProps {
  features: ProductFeatureIcon[];
}

export function ProductDetailFeatures({ features }: ProductDetailFeaturesProps) {
  if (features.length === 0) return null;

  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
      {features.slice(0, 4).map((feature) => (
        <li
          key={feature.label}
          className="flex flex-col items-center gap-2 rounded-lg border border-neutral-100 bg-neutral-50/80 px-2 py-2.5 text-center"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-red-600/30 text-red-600">
            <feature.icon className="size-4" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="text-[0.65rem] font-medium leading-snug text-neutral-600 sm:text-xs">
            {feature.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
