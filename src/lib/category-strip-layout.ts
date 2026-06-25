/** Altura visual de una tarjeta del carrusel de categorías (círculo + etiqueta). */
export const CATEGORY_STRIP_CARD_HEIGHT_CLASS =
  'h-[8.25rem] sm:h-[11.375rem] md:h-[12.625rem] lg:h-[13.75rem]';

/**
 * Altura del banner hero compacto.
 * Desktop alto; el zoom en imagen recorta márgenes superior/inferior del PNG.
 */
export const CATEGORY_STRIP_HERO_HEIGHT_CLASS =
  'h-[20rem] sm:h-[21rem] md:h-[26rem] lg:h-[30rem] xl:h-[32rem] 2xl:h-[34rem]';

/** Zoom sobre la imagen para recortar márgenes blancas arriba/abajo (object-cover). */
export const CATEGORY_STRIP_HERO_IMAGE_ZOOM_CLASS =
  'origin-center scale-[1.02] sm:scale-[1.04] md:scale-[1.08] lg:scale-[1.1] xl:scale-[1.12]';

/**
 * Altura de la imagen dentro del contenedor del banner (el contenedor mantiene CATEGORY_STRIP_HERO_HEIGHT_CLASS).
 */
export const CATEGORY_STRIP_HERO_IMAGE_FRAME_CLASS = 'h-[96%] w-full';

/** Padding vertical del hero compacto (pegado al nav y a categorías). */
export const CATEGORY_STRIP_HERO_PADDING_CLASS = 'p-0';

/** Recorte vertical simétrico para reducir márgenes blancos del PNG del banner. */
export const CATEGORY_STRIP_HERO_VERTICAL_CROP = 0.84;

/** Contenedor del carrusel; el hero compacto usa el mismo ancho hasta las flechas. */
export const CATEGORY_STRIP_TRACK_WRAPPER_CLASS = 'relative sm:px-1';

/** Expande el hero compacto hasta el borde exterior de las flechas (sm+). */
export const CATEGORY_STRIP_HERO_GUTTER_CLASS =
  'w-full sm:-mx-1 sm:w-[calc(100%+0.5rem)] md:-mx-3 md:w-[calc(100%+1.5rem)] lg:-mx-6 lg:w-[calc(100%+3rem)] xl:-mx-8 xl:w-[calc(100%+4rem)] 2xl:-mx-10 2xl:w-[calc(100%+5rem)]';
