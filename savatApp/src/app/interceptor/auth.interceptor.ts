import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../service/auth.service';

/**
 * Interceptor que agrega automáticamente el header
 * "Authorization: Bearer <token>" a toda petición saliente,
 * excepto al propio endpoint de login (que no necesita token).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);

    if (req.url.includes('/usuario/login')) {
        return next(req);
    }

    const session = authService.getSession();

    if (session?.token) {
        const cloned = req.clone({
            setHeaders: { Authorization: `Bearer ${session.token}` }
        });
        return next(cloned);
    }

    return next(req);
};
