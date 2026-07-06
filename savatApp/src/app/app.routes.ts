import { Routes } from '@angular/router';
import { Login } from './page/auth/login/login';
import { AppLayout } from './layout/app-layout';
import { authGuard } from './guard/auth.guard';
import { roleGuard } from './guard/role.guard';

export const routes: Routes = [

    // Login — sin layout, sin guard
    { path: 'auth/login', component: Login },

    // Rutas protegidas — todas dentro del shell (sidebar + topbar)
    {
        path: '',
        component: AppLayout,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard/admin',
                canActivate: [roleGuard(['ADMINISTRADOR'])],
                loadComponent: () =>
                    import('./page/dashboard/dashboard-admin/dashboard-admin').then(m => m.DashboardAdmin)
            },
            {
                path: 'dashboard/vendedor',
                canActivate: [roleGuard(['VENDEDOR'])],
                loadComponent: () =>
                    import('./page/dashboard/dashboard-vendedor/dashboard-vendedor').then(m => m.DashboardVendedor)
            },
            {
                path: 'dashboard/tecnico',
                canActivate: [roleGuard(['TECNICO'])],
                loadComponent: () =>
                    import('./page/dashboard/dashboard-tecnico/dashboard-tecnico').then(m => m.DashboardTecnico)
            },

            // ── Módulo Clientes ──────────────────────────────────────────
            {
                path: 'clientes',
                canActivate: [roleGuard(['ADMINISTRADOR', 'VENDEDOR', 'TECNICO'])],
                loadComponent: () =>
                    import('./page/clientes/clientes').then(m => m.Clientes)
            },

            // ── Módulo Inventario ────────────────────────────────────────
            {
                path: 'inventario',
                canActivate: [roleGuard(['ADMINISTRADOR', 'VENDEDOR', 'TECNICO'])],
                loadComponent: () =>
                    import('./page/inventario/inventario').then(m => m.Inventario)
            },

            // ── Módulo Ventas ────────────────────────────────────────────
            {
                path: 'ventas',
                canActivate: [roleGuard(['ADMINISTRADOR', 'VENDEDOR'])],
                loadComponent: () =>
                    import('./page/ventas/ventas').then(m => m.Ventas)
            },

            // ── Módulo Cotizaciones ──────────────────────────────────────
            {
                path: 'cotizaciones',
                canActivate: [roleGuard(['ADMINISTRADOR', 'VENDEDOR'])],
                loadComponent: () =>
                    import('./page/cotizaciones/cotizaciones').then(m => m.Cotizaciones)
            },

            // ── Módulo Reparaciones (Órdenes de Servicio) ────────────────
            {
                path: 'reparaciones',
                canActivate: [roleGuard(['ADMINISTRADOR', 'TECNICO'])],
                loadComponent: () =>
                    import('./page/reparaciones/reparaciones').then(m => m.Reparaciones)
            },

            // ── Módulo Equipos ───────────────────────────────────────────
            {
                path: 'equipos',
                canActivate: [roleGuard(['ADMINISTRADOR', 'TECNICO'])],
                loadComponent: () =>
                    import('./page/equipos/equipos').then(m => m.Equipos)
            },

            // ── Módulo Proveedores ───────────────────────────────────────
            {
                path: 'proveedores',
                canActivate: [roleGuard(['ADMINISTRADOR'])],
                loadComponent: () =>
                    import('./page/proveedores/proveedores').then(m => m.Proveedores)
            },
             {
                path: 'reportes',
                canActivate: [roleGuard(['ADMINISTRADOR'])],
                loadComponent: () =>
                    import('./page/reportes/reportes').then(m => m.Reportes)
            },

            // ── Módulo Comprobantes / Facturas ───────────────────────────
            {
                path: 'facturas',
                canActivate: [roleGuard(['ADMINISTRADOR', 'VENDEDOR'])],
                loadComponent: () =>
                    import('./page/facturas/facturas').then(m => m.Facturas)
            },

            // Red de seguridad
            { path: '', pathMatch: 'full', redirectTo: 'auth/login' }
        ]
    },

    { path: '**', redirectTo: 'auth/login' }
];
