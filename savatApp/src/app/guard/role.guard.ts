import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Rol } from '../service/auth.service';

/**
 * Factory de guard: recibe la lista de roles permitidos para una ruta
 * y bloquea el acceso si el rol de la sesión activa no está en la lista.
 *
 * Uso en rutas: canActivate: [roleGuard(['ADMINISTRADOR'])]
 */
export function roleGuard(allowedRoles: Rol[]): CanActivateFn {
    return () => {
        const auth   = inject(AuthService);
        const router = inject(Router);

        const session = auth.getSession();

        if (!session) {
            router.navigate(['/auth/login']);
            return false;
        }

        if (!allowedRoles.includes(session.rol)) {
            // El usuario está autenticado pero intenta entrar al dashboard de otro rol:
            // se le redirige a SU propio dashboard, no al login.
            router.navigate([auth.getHomeRouteForRole(session.rol)]);
            return false;
        }

        return true;
    };
}
