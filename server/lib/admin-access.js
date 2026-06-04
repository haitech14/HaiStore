import {
  HAITECH_ADMIN_PANEL_EMAILS,
  HAITECH_BOOTSTRAP_ADMIN_EMAILS,
} from './haitech-auth-credentials.js';

/** @typedef {{ email?: string; role?: string }} AuthLikeUser */

export const ADMIN_PANEL_EMAILS = HAITECH_ADMIN_PANEL_EMAILS;

export function normalizeAuthEmail(email) {
  return (email ?? '').trim().toLowerCase();
}

export function isAdminPanelEmail(email) {
  return ADMIN_PANEL_EMAILS.includes(normalizeAuthEmail(email));
}

/** @param {AuthLikeUser | null | undefined} user */
export function canAccessAdminPanel(user) {
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'tecnico') return true;
  return isAdminPanelEmail(user.email);
}

/** @param {AuthLikeUser | null | undefined} user */
export function hasAdminApiAccess(user) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return isAdminPanelEmail(user.email);
}

/**
 * Rol efectivo al iniciar sesión (prioriza cuentas bootstrap del equipo).
 * @param {string} email
 * @param {string | undefined} profileRole
 */
export function resolveBootstrapRole(email, profileRole) {
  const normalized = normalizeAuthEmail(email);
  if (HAITECH_BOOTSTRAP_ADMIN_EMAILS.includes(normalized)) {
    return 'admin';
  }
  return profileRole;
}
