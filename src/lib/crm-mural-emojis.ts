import { WA_EMOJI } from '@/lib/whatsapp-encoding';

/** Emoticones frecuentes en mensajes de ventas / WhatsApp del mural. */
export const CRM_MURAL_QUICK_EMOJIS = [
  WA_EMOJI.wave,
  '\u{1F64B}',
  '\u{1F64B}\u{200D}\u{2642}\u{FE0F}',
  '\u{1F64B}\u{200D}\u{2640}\u{FE0F}',
  WA_EMOJI.smile,
  '\u{1F642}',
  '\u{1F44D}',
  '\u{2705}',
  '\u{2714}\u{FE0F}',
  '\u{1F381}',
  WA_EMOJI.package,
  '\u{1F69A}',
  '\u{1F4F2}',
  '\u{1F4AC}',
  WA_EMOJI.clipboard,
  WA_EMOJI.money,
  WA_EMOJI.dollar,
  WA_EMOJI.creditCard,
  WA_EMOJI.printer,
  '\u{1F4BB}',
  '\u{1F4C4}',
  '\u{26A1}',
  '\u{1F525}',
  '\u{2B50}',
  '\u{1F389}',
  '\u{2764}\u{FE0F}',
  WA_EMOJI.pray,
  WA_EMOJI.phone,
  WA_EMOJI.pin,
  '\u{1F550}',
] as const;

export function insertEmojiInField(
  current: string,
  emoji: string,
  selectionStart: number,
  selectionEnd: number,
): { next: string; cursor: number } {
  const start = Math.min(selectionStart, current.length);
  const end = Math.min(selectionEnd, current.length);
  const next = current.slice(0, start) + emoji + current.slice(end);
  return { next, cursor: start + emoji.length };
}
