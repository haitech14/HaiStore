import { Rocket, Shield, Users } from 'lucide-react';

const FEATURES = [
  {
    icon: Users,
    title: 'Comunidad activa',
    description: 'Únete a miles de entusiastas de impresión y tecnología Ricoh.',
  },
  {
    icon: Shield,
    title: 'Contenido de calidad',
    description: 'Aprende y comparte buenas prácticas con técnicos certificados.',
  },
  {
    icon: Rocket,
    title: 'Crecimiento constante',
    description: 'Siempre estamos innovando con nuevos recursos y eventos.',
  },
] as const;

export function ForumFeatureBar() {
  return (
    <section
      aria-label="Beneficios del foro"
      className="border-t border-[hsl(var(--forum-border))] bg-[hsl(var(--forum-card))]"
    >
      <div className="container grid gap-6 px-4 py-8 sm:grid-cols-3 sm:px-6">
        {FEATURES.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex gap-3">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--forum-accent)/0.12)] text-[hsl(var(--forum-accent))]"
              aria-hidden="true"
            >
              <Icon className="size-5" />
            </span>
            <div>
              <h2 className="text-sm font-bold">{title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-[hsl(var(--forum-muted))] sm:text-sm">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
