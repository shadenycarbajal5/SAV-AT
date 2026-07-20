import { Rol } from '../service/auth.service';

export interface NavItem {
    label: string;
    icon: string;
    route: string;
    badge?: number;
    badgeType?: 'danger' | 'default';
}

export interface NavSection {
    label: string;
    items: NavItem[];
}

const NAV_ADMIN: NavSection[] = [
    {
        label: 'Principal',
        items: [
            { label: 'Dashboard',     icon: '🏠', route: '/dashboard/admin' },
            { label: 'Inventario',    icon: '📦', route: '/inventario' },
            { label: 'Reparaciones',  icon: '🔧', route: '/reparaciones' },
            { label: 'Ventas',        icon: '🛒', route: '/ventas' },
            { label: 'Facturas',      icon: '🧾', route: '/facturas' }
        ]
    },
    {
        label: 'Gestión',
        items: [
            { label: 'Clientes',      icon: '👥', route: '/clientes' },
            { label: 'Proveedores',   icon: '🏭', route: '/proveedores' },
            { label: 'Reportes',      icon: '📊', route: '/reportes' }
        ]
    }
];

const NAV_VENDEDOR: NavSection[] = [
    {
        label: 'Principal',
        items: [
            { label: 'Dashboard',      icon: '🏠', route: '/dashboard/vendedor' },
            { label: 'Ventas',         icon: '🛒', route: '/ventas' },
            { label: 'Cotizaciones',   icon: '📝', route: '/cotizaciones' },
            { label: 'Clientes',       icon: '👥', route: '/clientes' },
            { label: 'Inventario',     icon: '📦', route: '/inventario' }
        ]
    }
];

const NAV_TECNICO: NavSection[] = [
    {
        label: 'Principal',
        items: [
            { label: 'Dashboard',      icon: '🏠', route: '/dashboard/tecnico' },
            { label: 'Reparaciones',   icon: '🔧', route: '/reparaciones' },
            { label: 'Equipos',        icon: '💻', route: '/equipos' },
        ]
    }
];

export function getNavSectionsForRole(rol: Rol | null): NavSection[] {
    switch (rol) {
        case 'ADMINISTRADOR': return NAV_ADMIN;
        case 'VENDEDOR':      return NAV_VENDEDOR;
        case 'TECNICO':       return NAV_TECNICO;
        default:              return [];
    }
}
