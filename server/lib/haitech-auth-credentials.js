import credentials from '../../shared/haitech-auth-credentials.json' with { type: 'json' };

/** @typedef {{ email: string; password: string; name: string; role: string; apps?: string[] }} HaitechAuthUser */

/**
 * @param {{ passwordKey?: string; password?: string }} entry
 */
function resolvePassword(entry) {
  if (entry.password) return entry.password;
  const key = entry.passwordKey ?? 'demo';
  return credentials.passwords[key] ?? credentials.passwords.demo;
}

/** @returns {HaitechAuthUser[]} */
export function getHaitechAuthUsers() {
  return credentials.users.map((entry) => ({
    email: entry.email.trim().toLowerCase(),
    password: resolvePassword(entry),
    name: entry.name,
    role: entry.role,
    apps: entry.apps ?? ['haistore'],
  }));
}

export const HAITECH_ADMIN_PANEL_EMAILS = credentials.adminPanelEmails.map((email) =>
  email.trim().toLowerCase(),
);

export const HAITECH_BOOTSTRAP_ADMIN_EMAILS = credentials.bootstrapAdminEmails.map((email) =>
  email.trim().toLowerCase(),
);

export function getHaitechAuthCredentialsMeta() {
  return {
    version: credentials.version,
    apps: ['haistore', 'haisupport', 'haisales'],
    adminPanelEmails: HAITECH_ADMIN_PANEL_EMAILS,
    users: getHaitechAuthUsers().map(({ email, name, role, apps }) => ({
      email,
      name,
      role,
      apps,
    })),
  };
}
