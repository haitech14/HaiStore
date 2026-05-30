const UNITS = [
  '',
  'UN',
  'DOS',
  'TRES',
  'CUATRO',
  'CINCO',
  'SEIS',
  'SIETE',
  'OCHO',
  'NUEVE',
  'DIEZ',
  'ONCE',
  'DOCE',
  'TRECE',
  'CATORCE',
  'QUINCE',
  'DIECISÉIS',
  'DIECISIETE',
  'DIECIOCHO',
  'DIECINUEVE',
];

const TENS = [
  '',
  '',
  'VEINTE',
  'TREINTA',
  'CUARENTA',
  'CINCUENTA',
  'SESENTA',
  'SETENTA',
  'OCHENTA',
  'NOVENTA',
];

const HUNDREDS = [
  '',
  'CIENTO',
  'DOSCIENTOS',
  'TRESCIENTOS',
  'CUATROCIENTOS',
  'QUINIENTOS',
  'SEISCIENTOS',
  'SETECIENTOS',
  'OCHOCIENTOS',
  'NOVECIENTOS',
];

function sectionBelow100(n: number): string {
  if (n === 0) return '';
  if (n < 20) return UNITS[n] ?? '';
  if (n < 30) return n === 20 ? 'VEINTE' : `VEINTI${(UNITS[n - 20] ?? '').toLowerCase()}`.toUpperCase();
  const ten = Math.floor(n / 10);
  const unit = n % 10;
  return unit === 0 ? (TENS[ten] ?? '') : `${TENS[ten] ?? ''} Y ${UNITS[unit] ?? ''}`;
}

function sectionBelow1000(n: number): string {
  if (n === 0) return '';
  if (n === 100) return 'CIEN';
  const hundred = Math.floor(n / 100);
  const rest = n % 100;
  const hundredText = hundred === 1 && rest === 0 ? 'CIEN' : HUNDREDS[hundred] ?? '';
  const restText = sectionBelow100(rest);
  return [hundredText, restText].filter(Boolean).join(' ');
}

function integerToWords(n: number): string {
  if (n === 0) return 'CERO';

  const chunks: string[] = [];

  const millions = Math.floor(n / 1_000_000);
  if (millions > 0) {
    chunks.push(
      millions === 1 ? 'UN MILLÓN' : `${integerToWords(millions)} MILLONES`,
    );
    n %= 1_000_000;
  }

  const thousands = Math.floor(n / 1000);
  if (thousands > 0) {
    chunks.push(thousands === 1 ? 'MIL' : `${sectionBelow1000(thousands)} MIL`);
    n %= 1000;
  }

  if (n > 0) {
    chunks.push(sectionBelow1000(n));
  }

  return chunks.join(' ').replace(/\s+/g, ' ').trim();
}

export function amountToWordsEs(amount: number, currencyLabel = 'SOLES'): string {
  const safe = Math.max(0, amount);
  const integer = Math.floor(safe);
  const cents = Math.round((safe - integer) * 100);
  const words = integerToWords(integer);
  const centsLabel = String(cents).padStart(2, '0');
  return `${words} CON ${centsLabel}/100 ${currencyLabel}`;
}
