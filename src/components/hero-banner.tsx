import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiWhatsapp } from '@mdi/js';

import { Button } from '@/components/ui/button';
import {
  HOME_HERO_WHATSAPP_LINK,
  HOME_HERO_WHATSAPP_NUMBER,
  TRUST_ICON_MAP,
  homeHeroSlides,
  type HomeHeroSlide,
} from '@/data/home-hero-slides';
import { cn } from '@/lib/utils';

function heroResponsiveSources(imagePath: string, baseWidth: number) {
  const base = imagePath.replace(/\.(png|jpe?g|webp)$/i, '');
  const w = (scale: number) => Math.round(baseWidth * scale);

  return {
    webpSrcSet: `${base}.webp ${w(1)}w, ${base}@2x.webp ${w(2)}w, ${base}@3x.webp ${w(3)}w, ${base}@4x.webp ${w(4)}w, ${base}@5x.webp ${w(5)}w, ${base}@6x.webp ${w(6)}w`,
    fallbackSrcSet: `${base}.png ${w(1)}w, ${base}@2x.png ${w(2)}w, ${base}@3x.png ${w(3)}w, ${base}@4x.png ${w(4)}w`,
    fallbackSrc: `${base}@4x.png`,
  };
}

function HeroSlideContent({ slide, index }: { slide: HomeHeroSlide; index: number }) {
  if (slide.imageOnly) {
    const headingId = index === 0 ? 'hero-titulo' : `hero-titulo-${slide.id}`;
    const imageWidth = slide.imageWidth ?? 1024;
    const imageHeight = slide.imageHeight ?? 364;
    const { webpSrcSet, fallbackSrcSet, fallbackSrc } = heroResponsiveSources(
      slide.backgroundImage,
      imageWidth,
    );

    return (
      <div className="relative w-full overflow-hidden bg-white">
        <h1 id={headingId} className="sr-only">
          {slide.imageAlt}
        </h1>
        <Link
          to={slide.linkHref ?? '/tienda'}
          className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <picture className="block w-full">
            <source type="image/webp" srcSet={webpSrcSet} sizes="100vw" />
            <img
              src={fallbackSrc}
              srcSet={fallbackSrcSet}
              sizes="100vw"
              width={imageWidth}
              height={imageHeight}
              alt=""
              decoding="async"
              fetchPriority={index === 0 ? 'high' : 'low'}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="block h-auto w-full"
            />
          </picture>
        </Link>
      </div>
    );
  }

  const HeadingTag = index === 0 ? 'h1' : 'h2';
  const headingId = index === 0 ? 'hero-titulo' : `hero-titulo-${slide.id}`;

  return (
    <div className="relative min-h-[min(40vh,18rem)] sm:min-h-[min(44vh,20rem)] lg:min-h-[min(46vh,22rem)] xl:min-h-[min(48vh,24rem)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden bg-black"
      >
        <img
          src={slide.backgroundImage}
          alt=""
          sizes="100vw"
          decoding="async"
          fetchPriority={index === 0 ? 'high' : 'low'}
          loading={index === 0 ? 'eager' : 'lazy'}
          className="absolute inset-0 size-full origin-[65%_center] scale-[1.05] object-contain object-[65%_center] lg:scale-[1.12]"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/15"
      />

      <div className="container relative flex min-h-[inherit] flex-col justify-center py-4 sm:py-5 lg:py-6">
        <div className="relative flex max-w-2xl flex-col items-start gap-2 sm:gap-2.5">
        <span className="-mb-0.5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 pb-0.5 pt-1 text-[0.6875rem] font-bold uppercase leading-none tracking-[0.16em] text-white sm:text-xs">
          <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
          {slide.eyebrow}
        </span>

        <HeadingTag
          id={headingId}
          className="font-hero text-3xl font-bold uppercase leading-[0.92] tracking-normal sm:text-4xl lg:text-5xl xl:text-6xl"
        >
          {slide.titleLines?.map((line) => (
            <span
              key={line.text}
              className={cn('block', line.variant === 'white' ? 'text-white' : 'text-[#FF3333]')}
            >
              {line.text}
            </span>
          ))}
        </HeadingTag>

        <p className="max-w-xl text-xs leading-snug text-white sm:text-sm lg:text-base">
          {slide.subtitle}
        </p>

        <ul className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-2">
          {slide.trustBadges?.map((badge) => {
            const BadgeIcon = TRUST_ICON_MAP[badge.icon];
            return (
              <li key={badge.title} className="flex items-start gap-2">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-md sm:size-9',
                    'border border-white/25 bg-white/10 text-white',
                  )}
                  aria-hidden="true"
                >
                  <BadgeIcon className="size-3.5 sm:size-4" />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-xs font-bold text-white sm:text-sm">{badge.title}</p>
                  <p className="text-[0.65rem] leading-snug text-white/60 sm:text-xs">{badge.text}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
          {slide.primaryCta?.kind === 'whatsapp' ? (
            <Button
              asChild
              className="h-10 rounded-md bg-[#25D366] px-4 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,211,102,0.35)] transition-all hover:bg-[#20bd5a] focus-visible:ring-[#25D366] focus-visible:ring-offset-black"
            >
              <a href={HOME_HERO_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Icon path={mdiWhatsapp} size={1} aria-hidden="true" />
                Cotizar por WhatsApp · {HOME_HERO_WHATSAPP_NUMBER}
              </a>
            </Button>
          ) : slide.primaryCta?.kind === 'link' ? (
            <Button
              asChild
              className={cn(
                'h-10 rounded-md px-4 text-sm font-semibold text-white focus-visible:ring-offset-black',
                slide.primaryCta.style === 'green'
                  ? 'bg-[#25D366] shadow-[0_0_24px_rgba(37,211,102,0.35)] hover:bg-[#20bd5a] focus-visible:ring-[#25D366]'
                  : 'bg-[#FF3333] shadow-[0_0_24px_rgba(255,51,51,0.35)] hover:bg-red-500 focus-visible:ring-red-600',
              )}
            >
              {slide.primaryCta.href.startsWith('http') ? (
                <a href={slide.primaryCta.href} target="_blank" rel="noopener noreferrer">
                  {slide.primaryCta.label}
                </a>
              ) : (
                <Link to={slide.primaryCta.href}>{slide.primaryCta.label}</Link>
              )}
            </Button>
          ) : null}

          {slide.secondaryCta ? (
          <Button
            asChild
            variant="outline"
            className="h-10 rounded-md border-white/25 bg-black/40 px-4 text-sm font-semibold text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-black"
          >
            {slide.secondaryCta.external || slide.secondaryCta.href.startsWith('http') ? (
              <a href={slide.secondaryCta.href} target="_blank" rel="noopener noreferrer">
                {slide.secondaryCta.label.includes('WhatsApp') ? (
                  <Icon path={mdiWhatsapp} size={1} aria-hidden="true" />
                ) : (
                  <ShoppingCart aria-hidden="true" />
                )}
                {slide.secondaryCta.label}
              </a>
            ) : (
              <Link to={slide.secondaryCta.href}>
                <ShoppingCart aria-hidden="true" />
                {slide.secondaryCta.label}
              </Link>
            )}
          </Button>
          ) : null}
        </div>

        {slide.footerNote ? (
        <p className="flex items-center gap-1.5 text-[0.65rem] text-white/55 sm:text-xs">
          <ShieldCheck className="size-3.5 text-red-600 sm:size-4" aria-hidden="true" />
          {slide.footerNote}
        </p>
        ) : null}
        </div>
      </div>
    </div>
  );
}

export function HeroBanner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: homeHeroSlides.length > 1, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const showCarouselControls = homeHeroSlides.length > 1;

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || autoplayPaused || !showCarouselControls) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 7000);

    return () => window.clearInterval(timer);
  }, [emblaApi, autoplayPaused, showCarouselControls]);

  const pauseAutoplay = () => setAutoplayPaused(true);

  return (
    <section
      aria-labelledby="hero-titulo"
      aria-roledescription="carrusel"
      className="relative w-full overflow-hidden bg-white"
      onMouseEnter={pauseAutoplay}
      onFocus={pauseAutoplay}
    >
      <div className="relative">
        <div ref={emblaRef} className="overflow-hidden">
          <ul className="flex">
            {homeHeroSlides.map((slide, index) => (
              <li
                key={slide.id}
                className="relative min-w-0 flex-[0_0_100%]"
                aria-hidden={selectedIndex !== index}
              >
                <HeroSlideContent slide={slide} index={index} />
              </li>
            ))}
          </ul>
        </div>

        {showCarouselControls ? (
          <>
            <button
              type="button"
              onClick={() => {
                pauseAutoplay();
                scrollPrev();
              }}
              aria-label="Slide anterior"
              className="absolute left-2 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex lg:left-4"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => {
                pauseAutoplay();
                scrollNext();
              }}
              aria-label="Siguiente slide"
              className="absolute right-2 top-1/2 z-20 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 sm:flex lg:right-4"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </>
        ) : null}
      </div>
    </section>
  );
}
