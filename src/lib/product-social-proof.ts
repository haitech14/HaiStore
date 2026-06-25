const SOCIAL_PROOF_NAMES = [
  'Carlos',
  'María',
  'Luis',
  'Ana',
  'Jorge',
  'Patricia',
  'Roberto',
  'Sofía',
  'Miguel',
  'Lucía',
  'Fernando',
  'Carmen',
  'Diego',
  'Rosa',
  'Andrés',
] as const;

const SOCIAL_PROOF_CITIES = [
  'Lima',
  'Arequipa',
  'Trujillo',
  'Piura',
  'Cusco',
  'Chiclayo',
  'Iquitos',
  'Huancayo',
] as const;

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function randomMinutesAgo(): number {
  return 2 + Math.floor(Math.random() * 12);
}

/** Mensaje simulado de actividad reciente (no refleja pedidos reales). */
export function buildRandomSocialProofMessage(productName: string): string {
  const name = pickRandom(SOCIAL_PROOF_NAMES);
  const city = pickRandom(SOCIAL_PROOF_CITIES);
  const minutes = randomMinutesAgo();
  const shortName =
    productName.length > 42 ? `${productName.slice(0, 39).trimEnd()}…` : productName;

  const templates = [
    `${name} de ${city} acaba de comprar este producto`,
    `${name} compró un producto similar hace ${minutes} min`,
    `${name} añadió «${shortName}» al carrito`,
    `${name} de ${city} acaba de comprar este producto u otros`,
    `Alguien de ${city} compró este producto hace ${minutes} min`,
  ];

  return pickRandom(templates);
}

export function randomSocialProofInitialDelayMs(): number {
  return 6_000 + Math.floor(Math.random() * 6_000);
}

export function randomSocialProofCycleDelayMs(): number {
  return 14_000 + Math.floor(Math.random() * 16_000);
}

export const SOCIAL_PROOF_VISIBLE_MS = 5_500;
