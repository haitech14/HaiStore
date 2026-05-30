import { BarChart3, DollarSign, Headphones, Star } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: Star,
    title: 'Calidad garantizada',
    subtitle: 'Productos compatibles premium',
  },
  {
    icon: BarChart3,
    title: 'Rendimiento óptimo',
    subtitle: 'Impresiones nítidas y consistentes',
  },
  {
    icon: DollarSign,
    title: 'Ahorra más',
    subtitle: 'Mejor precio, mayor rendimiento',
  },
  {
    icon: Headphones,
    title: 'Soporte especializado',
    subtitle: 'Te ayudamos en tu compra',
  },
] as const;

export function ProductDetailTrustBanner() {
  return (
    <section
      className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-5 sm:px-6"
      aria-label="Beneficios de compra"
    >
      <ul className="grid grid-cols-1 divide-y divide-neutral-200 sm:grid-cols-4 sm:divide-x sm:divide-y-0">
        {TRUST_ITEMS.map((item) => (
          <li key={item.title} className="flex items-start gap-3 px-0 py-4 first:pt-0 last:pb-0 sm:flex-col sm:items-center sm:px-4 sm:py-0 sm:text-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <item.icon className="size-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-bold text-red-700">{item.title}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{item.subtitle}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
