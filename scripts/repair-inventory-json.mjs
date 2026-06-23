import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const inventoryPath = path.join(__dirname, '../server/data/inventory.json');
const backupPath = `${inventoryPath}.corrupt-${Date.now()}.bak`;

const raw = fs.readFileSync(inventoryPath, 'utf8');

try {
  JSON.parse(raw);
  console.log('inventory.json already valid');
  process.exit(0);
} catch (error) {
  console.warn('Invalid JSON:', error.message);
}

fs.copyFileSync(inventoryPath, backupPath);
console.log('Backup:', backupPath);

const footerVariants = [
  '\n  ],\n  "deletedProductIds": [],\n  "warehouses": []\n}\n',
  '\n  ],\n  "deletedProductIds": []\n}\n',
];

function parseWithFooter(prefix) {
  for (const footer of footerVariants) {
    try {
      const data = JSON.parse(`${prefix}${footer}`);
      if (Array.isArray(data.products)) return data;
    } catch {
      // try next
    }
  }
  return null;
}

// Product entries in inventory.json use 4-space indent for objects in the array.
const productStartRegex = /\n    \{\n      "id":/g;
const starts = [];
let match;
while ((match = productStartRegex.exec(raw)) !== null) {
  starts.push(match.index);
}

let repaired = null;
let usedStart = -1;

for (let i = starts.length - 1; i >= 0; i -= 1) {
  const prefix = `${raw.slice(0, starts[i]).replace(/,\s*$/, '')}`;
  const data = parseWithFooter(prefix);
  if (data) {
    repaired = data;
    usedStart = starts[i];
    break;
  }
}

if (!repaired) {
  console.error('Could not auto-repair inventory.json');
  process.exit(1);
}

const removedProducts = starts.length - starts.indexOf(usedStart);
const prefix = raw.slice(0, usedStart).replace(/,\s*$/, '');
const footer = footerVariants[0];
fs.writeFileSync(inventoryPath, `${prefix}${footer}`, 'utf8');

console.log(`Repaired: ${repaired.products.length} products kept`);
console.log(`Dropped ${removedProducts} trailing product object(s) from corrupt tail`);
console.log('Wrote:', inventoryPath);
