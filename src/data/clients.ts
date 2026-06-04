export interface Client {
  id: string;
  name: string;
  initials: string;
  logo: string;
  logoAlt: string;
  /** Fondo del círculo interior cuando el logo lleva arte oscuro (p. ej. TECBEL). */
  logoSurface?: 'light' | 'dark';
}

export const clients: Client[] = [
  {
    id: 'tecbel',
    name: 'TECBEL',
    initials: 'TB',
    logo: '/clients/client-tecbel.png',
    logoAlt: 'Logo de TECBEL',
    logoSurface: 'dark',
  },
  {
    id: 'copiadoras-import',
    name: 'Copiadoras Import E.I.R.L.',
    initials: 'CI',
    logo: '/clients/client-copiadoras-import.png',
    logoAlt: 'Logo de Copiadoras Import E.I.R.L.',
  },
  {
    id: 'retail-peru-norte',
    name: 'Retail Perú Norte',
    initials: 'RN',
    logo: '/clients/client-retail-peru-norte.png',
    logoAlt: 'Logo de Retail Perú Norte',
  },
  {
    id: 'constructora-sur',
    name: 'Constructora del Sur',
    initials: 'CS',
    logo: '/clients/client-constructora-sur.png',
    logoAlt: 'Logo de Constructora del Sur',
  },
  {
    id: 'colegio-san-martin',
    name: 'Colegio San Martín',
    initials: 'CM',
    logo: '/clients/client-colegio-san-martin.png',
    logoAlt: 'Logo de Colegio San Martín',
  },
  {
    id: 'distribuidora-lima',
    name: 'Distribuidora Lima Centro',
    initials: 'DC',
    logo: '/clients/client-distribuidora-lima.png',
    logoAlt: 'Logo de Distribuidora Lima Centro',
  },
  {
    id: 'clinica-salud-total',
    name: 'Clínica Salud Total',
    initials: 'CT',
    logo: '/clients/client-clinica-salud-total.png',
    logoAlt: 'Logo de Clínica Salud Total',
  },
  {
    id: 'agroindustrial-pacifico',
    name: 'Agroindustrial Pacífico',
    initials: 'AP',
    logo: '/clients/client-agroindustrial-pacifico.png',
    logoAlt: 'Logo de Agroindustrial Pacífico',
  },
];
