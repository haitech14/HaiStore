/**
 * Emojis con escapes Unicode (estables en build/Windows) y URLs de WhatsApp en UTF-8.
 */
export const WA_EMOJI = {
  wave: '\u{1F44B}',
  pray: '\u{1F64F}',
  smile: '\u{1F60A}',
  package: '\u{1F4E6}',
  label: '\u{1F3F7}\u{FE0F}',
  dollar: '\u{1F4B5}',
  money: '\u{1F4B0}',
  link: '\u{1F517}',
  clipboard: '\u{1F4CB}',
  mobile: '\u{1F4F1}',
  pin: '\u{1F4CD}',
  phone: '\u{1F4DE}',
  email: '\u{1F4E7}',
  idCard: '\u{1FAAA}',
  calendar: '\u{1F4C5}',
  cart: '\u{1F6D2}',
  bags: '\u{1F6CD}\u{FE0F}',
  printer: '\u{1F5A8}\u{FE0F}',
  building: '\u{1F3E2}',
  creditCard: '\u{1F4B3}',
} as const;

/** Codifica texto para parámetro `text` de WhatsApp (UTF-8 / NFC). */
export function encodeWhatsAppText(text: string): string {
  return encodeURIComponent(text.normalize('NFC'));
}

/**
 * Enlace oficial de click-to-chat. `URLSearchParams` preserva emojis en UTF-8.
 * @see https://developers.facebook.com/docs/whatsapp/
 */
export function buildWhatsAppShareUrl(phone: string, text: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 9) return null;
  const normalized = digits.startsWith('51') ? digits : `51${digits}`;
  const params = new URLSearchParams();
  params.set('phone', normalized);
  params.set('text', text.normalize('NFC'));
  return `https://api.whatsapp.com/send?${params.toString()}`;
}

/** Alias corto compatible con enlaces guardados (`wa.me` redirige igual). */
export function buildWhatsAppMeUrl(phone: string, text: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 9) return null;
  const normalized = digits.startsWith('51') ? digits : `51${digits}`;
  return `https://wa.me/${normalized}?text=${encodeWhatsAppText(text)}`;
}
