import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { BadgeCheck, ChevronLeft, ChevronRight, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Icon } from '@mdi/react';
import { mdiWhatsapp } from '@mdi/js';

import { Button } from '@/components/ui/button';
import { BrandStrip } from '@/components/brand-strip';
import { printerBrands } from '@/data/brands';
import {
  HOME_HERO_WHATSAPP_LINK,
  HOME_HERO_WHATSAPP_NUMBER,
  TRUST_ICON_MAP,
  homeHeroSlides,
  type HomeHeroSlide,
} from '@/data/home-hero-slides';
import { cn } from '@/lib/utils';

function HeroSlideContent({ slide, index }: { slide: HomeHeroSlide; index: number }) {
  const HeadingTag = index === 0 ? 'h1' : 'h2';
  const headingId = index === 0 ? 'hero-titulo' : `hero-titulo-${slide.id}`;

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 bg-no-repeat',
          slide.backgroundClass ??
            'bg-cover bg-[center_65%] lg:bg-[length:58%_auto] lg:[background-position:62%_65%]',
        )}
        style={{ backgroundImage: `url('${slide.backgroundImage}')` }}
      />

      <div className="container relative py-8 sm:py-10 lg:min-h-[380px] lg:py-12">
        <div className="absolute right-3 top-3 z-10 hidden items-center gap-1.5 rounded-lg border border-red-600/40 bg-black/60 px-2.5 py-1.5 backdrop-blur-sm sm:flex">
          <BadgeCheck className="size-5 shrink-0 text-red-500" aria-hidden="true" />
          <div className="leading-tight">
            <p className="whitespace-pre-line text-[0.65rem] font-bold uppercase tracking-wide text-white">
              {slide.sealTitle}
            </p>
            <p className="text-[0.6rem] text-white/60">{slide.sealSubtitle}</p>
          </div>
        </div>

        <div className="relative flex max-w-2xl flex-col items-start gap-4">
        <span className="-mb-1 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 pb-0.5 pt-1 text-[0.65rem] font-bold uppercase leading-none tracking-[0.18em] text-white">
          <span className="size-1.5 rounded-full bg-white" aria-hidden="true" />
          {slide.eyebrow}
        </span>

        <HeadingTag
          id={headingId}
          className="font-hero text-5xl font-bold uppercase leading-[0.88] tracking-normal sm:text-6xl lg:text-7xl lg:leading-[0.9]"
        >
          {slide.titleLines.map((line) => (
            <span
              key={line.text}
              className={cn('block', line.variant === 'white' ? 'text-white' : 'text-[#FF3333]')}
            >
              {line.text}
            </span>
          ))}
        </HeadingTag>

        <p className="max-w-xl text-sm leading-snug text-white sm:text-base lg:text-lg">
          {slide.subtitle}
        </p>

        <ul className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3">
          {slide.trustBadges.map((badge) => {
            const BadgeIcon = TRUST_ICON_MAP[badge.icon];
            return (
              <li key={badge.title} className="flex items-start gap-2.5">
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-md',
                    'border border-white/25 bg-white/10 text-white',
                  )}
                  aria-hidden="true"
                >
                  <BadgeIcon className="size-4" />
                </span>
                <div className="min-w-0 leading-tight">
                  <p className="text-sm font-bold text-white">{badge.title}</p>
                  <p className="text-xs leading-snug text-white/55">{badge.text}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          {slide.primaryCta.kind === 'whatsapp' ? (
            <Button
              asChild
              className="h-11 rounded-md bg-[#25D366] px-5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(37,211,102,0.35)] transition-all hover:bg-[#20bd5a] focus-visible:ring-[#25D366] focus-visible:ring-offset-black"
            >
              <a href={HOME_HERO_WHATSAPP_LINK} target="_blank" rel="noopener noreferrer">
                <Icon path={mdiWhatsapp} size={0.9} aria-hidden="true" />
                Cotizar por WhatsApp · {HOME_HERO_WHATSAPP_NUMBER}
              </a>
            </Button>
          ) : (
            <Button
              asChild
              className={cn(
                'h-11 rounded-md px-5 text-sm font-semibold text-white focus-visible:ring-offset-black',
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
          )}

          <Button
            asChild
            variant="outline"
            className="h-11 rounded-md border-white/25 bg-black/40 px-5 text-sm font-semibold text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-black"
          >
            {slide.secondaryCta.external || slide.secondaryCta.href.startsWith('http') ? (
              <a href={slide.secondaryCta.href} target="_blank" rel="noopener noreferrer">
                {slide.secondaryCta.label.includes('WhatsApp') ? (
                  <Icon path={mdiWhatsapp} size={0.9} aria-hidden="true" />
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
        </div>

        <p className="flex items-center gap-2 text-xs text-white/45">
          <ShieldCheck className="size-4 text-red-600" aria-hidden="true" />
          {slide.footerNote}
        </p>
        </div>
      </div>
    </div>
  );
}

export function HeroBanner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

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
    if (!emblaApi || autoplayPaused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = window.setInterval(() => {
      emblaApi.scrollNext();
    }, 7000);

    return () => window.clearInterval(timer);
  }, [emblaApi, autoplayPaused]);

  const pauseAutoplay = () => setAutoplayPaused(true);

  return (
    <section
      aria-labelledby="hero-titulo"
      aria-roledescription="carrusel"
      className="relative w-full overflow-hidden bg-black text-white"
      onMouseEnter={pauseAutoplay}
      onFocus={pauseAutoplay}
    >
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

      <div
        className="absolute bottom-[4.5rem] left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-[5rem]"
        role="tablist"
        aria-label="Seleccionar slide del banner"
      >
        {homeHeroSlides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={selectedIndex === index}
            aria-label={slide.titleLines.map((l) => l.text).join(' ')}
            onClick={() => {
              pauseAutoplay();
              scrollTo(index);
            }}
            className={cn(
              'size-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
              selectedIndex === index ? 'bg-red-600' : 'bg-white/50 hover:bg-white/80',
            )}
          />
        ))}
      </div>

      <BrandStrip brands={printerBrands} variant="dark" showHeading={false} />
    </section>
  );
}
