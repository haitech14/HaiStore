import { Shield, Users, Workflow, type LucideIcon } from 'lucide-react';

export interface BusinessSolution {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  icon: LucideIcon;
  href: string;
}

export const businessSolutions: BusinessSolution[] = [
  {
    id: 'smart-flow',
    title: 'Ricoh Smart Flow',
    description:
      'Capacita a tu fuerza laboral con flujos de trabajo optimizados desde nuestra plataforma todo en uno. Organiza datos, procesos y comunicaciones.',
    image: '/solutions/smart-flow.png',
    imageAlt: 'Equipo revisando flujos de trabajo en tablet',
    icon: Workflow,
    href: '/tienda?categoria=soluciones-negocio',
  },
  {
    id: 'colaboracion',
    title: 'Soluciones de Colaboración',
    description:
      'Conecte ideas, personas y oportunidades. Impulsa la productividad y la creatividad con clientes, equipos y socios, desde cualquier lugar del mundo.',
    image: '/solutions/colaboracion.png',
    imageAlt: 'Profesional trabajando en laptop en oficina',
    icon: Users,
    href: '/tienda?categoria=soluciones-colaboracion',
  },
  {
    id: 'microsoft-365',
    title: 'Licencia Microsoft 365',
    description:
      'Optimiza la productividad de tu empresa con Microsoft 365. Aumenta la colaboración y la seguridad de tu negocio con soluciones en la nube.',
    image: '/solutions/microsoft-365.png',
    imageAlt: 'Paquetes de Microsoft Office 365 y Windows 11',
    icon: Shield,
    href: '/tienda?categoria=soluciones-negocio',
  },
];
