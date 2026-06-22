import type { RentalPlanConfig } from '@/types/rental-plan';

export const DEFAULT_RENTAL_PLANS: RentalPlanConfig[] = [
  { id: 'plan-3k', label: 'Plan 3,000 páginas', pagesPerMonth: 3000, monthlyPricePen: 349, active: true },
  { id: 'plan-5k', label: 'Plan 5,000 páginas', pagesPerMonth: 5000, monthlyPricePen: 150, active: true },
  { id: 'plan-8k', label: 'Plan 8,000 páginas', pagesPerMonth: 8000, monthlyPricePen: 449, active: true },
  { id: 'plan-10k', label: 'Plan 10,000 páginas', pagesPerMonth: 10000, monthlyPricePen: 499, active: true },
];
