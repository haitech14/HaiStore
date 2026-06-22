import {
  Cloud,
  Copy,
  FileText,
  Gauge,
  Gift,
  Layers,
  Network,
  Printer,
  ScanLine,
  Smartphone,
  Wifi,
} from 'lucide-react';

const STOREFRONT_ICON_KEYS = [
  'Printer',
  'Gauge',
  'Smartphone',
  'FileText',
  'ScanLine',
  'Cloud',
  'Copy',
  'Wifi',
  'Gift',
  'Layers',
  'Network',
];

function isStorefrontIconKey(value) {
  return STOREFRONT_ICON_KEYS.includes(value);
}

function normalizeFeatureBarItem(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const title = raw.title?.trim();
  const subtitle = raw.subtitle?.trim();
  if (!title || !subtitle) return null;
  const icon = raw.icon?.trim();
  return {
    icon: icon && isStorefrontIconKey(icon) ? icon : 'Printer',
    title,
    subtitle,
  };
}

function normalizeHeroBullet(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const text = raw.text?.trim();
  if (!text) return null;
  const icon = raw.icon?.trim();
  return {
    icon: icon && isStorefrontIconKey(icon) ? icon : 'Printer',
    text,
  };
}

export function normalizeStorefrontFeatureBar(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeFeatureBarItem)
    .filter(Boolean)
    .slice(0, 6);
}

export function normalizeStorefrontHeroBullets(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeHeroBullet)
    .filter(Boolean)
    .slice(0, 12);
}

export { STOREFRONT_ICON_KEYS };
