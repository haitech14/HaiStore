import credentials from '../../shared/haitech-auth-credentials.json';

export type HaitechAuthApp = 'haistore' | 'haisupport' | 'haisales';

export interface HaitechAuthUserPublic {
  email: string;
  name: string;
  role: string;
  apps: HaitechAuthApp[];
}

function resolvePasswordKey(key: 'admin' | 'demo'): string {
  return key === 'admin' ? credentials.passwords.admin : credentials.passwords.demo;
}

export const HAITECH_ADMIN_PANEL_EMAILS = credentials.adminPanelEmails.map((email) =>
  email.trim().toLowerCase(),
) as readonly string[];

export const HAITECH_BOOTSTRAP_ADMIN_EMAILS = credentials.bootstrapAdminEmails.map((email) =>
  email.trim().toLowerCase(),
);

export function getHaitechAuthUsersPublic(): HaitechAuthUserPublic[] {
  return credentials.users.map((entry) => ({
    email: entry.email.trim().toLowerCase(),
    name: entry.name,
    role: entry.role,
    apps: (entry.apps ?? ['haistore']) as HaitechAuthApp[],
  }));
}

/** Texto para ayuda en login (sin exponer contraseñas en producción remota). */
export function formatHaitechAuthLoginHint(): string {
  const admin = credentials.users.find((u) => u.passwordKey === 'admin');
  const soporte = credentials.users.find((u) => u.email === 'soporte@haitech.pe');
  const demo = credentials.passwords.demo;
  if (!admin) return '';
  const soportePass =
    soporte?.passwordKey && soporte.passwordKey in credentials.passwords
      ? credentials.passwords[soporte.passwordKey as keyof typeof credentials.passwords]
      : demo;
  return `${admin.email} / ${credentials.passwords.admin} · soporte@haitech.pe / ${soportePass} · otros / ${demo}`;
}

export { resolvePasswordKey, credentials };
