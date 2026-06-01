import { DEFAULT_RENTAL_PLANS } from '@/data/rental-plans-defaults';
import type { RentalPlanConfig } from '@/types/rental-plan';

const STORAGE_KEY = 'haistore-rental-plans';

function loadJson<T>(fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function loadRentalPlans(): RentalPlanConfig[] {
  return loadJson(DEFAULT_RENTAL_PLANS);
}

export function saveRentalPlans(plans: RentalPlanConfig[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

/** Planes activos para la ficha de producto (solo en cliente con localStorage). */
export function resolveActiveRentalPlansForStorefront(): Array<{
  pagesPerMonth: number;
  monthlyPricePen: number;
}> {
  return loadRentalPlans()
    .filter((plan) => plan.active)
    .map((plan) => ({
      pagesPerMonth: plan.pagesPerMonth,
      monthlyPricePen: plan.monthlyPricePen,
    }));
}

export function updateRentalPlan(
  id: string,
  patch: Partial<Pick<RentalPlanConfig, 'label' | 'pagesPerMonth' | 'monthlyPricePen' | 'active'>>,
): RentalPlanConfig[] {
  const next = loadRentalPlans().map((plan) => (plan.id === id ? { ...plan, ...patch } : plan));
  saveRentalPlans(next);
  return next;
}
