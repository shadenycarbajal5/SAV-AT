# Módulo Comprobantes (Facturas) — Instrucciones

## Archivos a copiar

```
src/app/page/facturas/facturas.ts
src/app/page/facturas/facturas.html
src/app/page/facturas/facturas.css
```

## app.routes.ts — ya incluido en el ZIP

Reemplaza tu `app.routes.ts` completo con el del ZIP.

## nav-config.ts — agregar manualmente

En el array de ítems del ADMINISTRADOR y VENDEDOR, agrega esta entrada:

```ts
{ label: 'Comprobantes', icon: 'pi pi-file-pdf', route: '/facturas' }
```

## functions.ts — NO requiere cambios

El módulo solo usa `apiventagetall` que ya existe en tu `functions.ts`.

## Funcionalidades

| Función           | Roles                   |
|-------------------|-------------------------|
| Ver comprobantes  | ADMINISTRADOR, VENDEDOR |
| Generar Boleta    | ADMINISTRADOR, VENDEDOR |
| Generar Factura   | ADMINISTRADOR, VENDEDOR |

El PDF se genera en el navegador con window.print().
Incluye: RUC 20610820361, IGV 18%, número de documento, datos del cliente y totales.
