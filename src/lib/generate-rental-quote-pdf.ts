import type { CompanySettings } from '@/types/company-settings';

import {
  RENTAL_EXCESS_COPY_COST_PEN,
  RENTAL_OPERATOR_MONTHLY_PEN,
  RENTAL_PAPER_SURCHARGE_PEN,
  type RentalCalculatorBreakdown,
} from '@/lib/rental-calculator';
import {
  buildProductQuotePdf,
  type GeneratedQuotePdf,
  type QuoteClientData,
  type QuoteProductData,
} from '@/lib/generate-product-quote-pdf';

export interface RentalQuoteProduct {
  name: string;
  sku: string;
  brand: string;
  imageUrl?: string | null;
}

export function buildRentalQuoteLines(
  breakdown: RentalCalculatorBreakdown,
  product: RentalQuoteProduct,
): QuoteProductData[] {
  const lines: QuoteProductData[] = [];
  const term = breakdown.termMonths;

  lines.push({
    name: `Alquiler — ${product.name} · cuota fija mensual (${term} meses · renovación automática del equipo nuevo)`,
    sku: product.sku,
    brand: product.brand,
    pricePen: breakdown.baseMonthlyPen,
    quantity: 1,
    ...(product.imageUrl != null ? { imageUrl: product.imageUrl } : {}),
  });

  if (breakdown.excessChargesPen > 0) {
    lines.push({
      name: `Excedente copia negro (${breakdown.extraPages.toLocaleString('es-PE')} × S/ ${RENTAL_EXCESS_COPY_COST_PEN.toFixed(2)})`,
      sku: 'EXC-NEG',
      brand: 'Alquiler',
      pricePen: breakdown.excessChargesPen,
      quantity: 1,
    });
  }

  if (breakdown.includesPaper && breakdown.paperChargesPen > 0) {
    lines.push({
      name: `Papel (${breakdown.monthlyPages.toLocaleString('es-PE')} × S/ ${RENTAL_PAPER_SURCHARGE_PEN.toFixed(2)})`,
      sku: 'PAPEL',
      brand: 'Alquiler',
      pricePen: breakdown.paperChargesPen,
      quantity: 1,
    });
  }

  if (breakdown.includesOperator) {
    lines.push({
      name: `Operador — cuota fija mensual (S/ ${RENTAL_OPERATOR_MONTHLY_PEN.toLocaleString('es-PE')})`,
      sku: 'OPER',
      brand: 'Alquiler',
      pricePen: breakdown.operatorChargesPen,
      quantity: 1,
    });
  }

  return lines;
}

export async function buildRentalQuotePdf(
  client: QuoteClientData,
  breakdown: RentalCalculatorBreakdown,
  product: RentalQuoteProduct,
  company: CompanySettings,
): Promise<GeneratedQuotePdf> {
  const lines = buildRentalQuoteLines(breakdown, product);
  return buildProductQuotePdf(client, lines, company, {});
}
