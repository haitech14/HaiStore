# Semillas HaiSales (ERP)

Coloca aquí los Excel exportados desde **HaiSales**:

- `Reporte_Persona_*.xlsx` (raíz de `seeds/`)
- `ventas/Reporte_de_Ventas_*.xlsx`

Luego ejecuta:

```bash
npm run haisales:sync
# o por separado:
node scripts/import-persona-customers.mjs
node scripts/import-ventas-reports.mjs
```

Desde el admin: **Configuración → Integraciones → Sincronizar semillas** o **Ventas → Sincronizar HaiSales**.

Los archivos `.xlsx` no se suben al repositorio.

## Tóner compatibles

Coloca `Toner-Compatibles.xlsx` en esta carpeta o pasa la ruta al script:

```bash
npm run import:toner-compatibles
# o:
node scripts/import-compatible-toner-products.mjs "ruta/al/Toner Compatibles.xlsx"
```

Importa cartuchos y recargas a la subcategoría **Toner Compatibles** con proveedor MICAMERB.
