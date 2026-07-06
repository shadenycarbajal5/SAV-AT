import { Injectable } from '@angular/core';

const SESSION_KEY = 'savat_session';

export type Rol = 'ADMINISTRADOR' | 'VENDEDOR' | 'TECNICO';

export interface AuthSession {
    idUsuario: number;
    nombres:   string;
    username:  string;
    rol:       Rol;
    token:     string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

    saveSession(data: AuthSession): void {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
    }

    getSession(): AuthSession | null {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        try { return JSON.parse(raw) as AuthSession; } catch { return null; }
    }

    isLoggedIn(): boolean {
        return this.getSession() !== null;
    }

    getRol(): Rol | null {
        return this.getSession()?.rol ?? null;
    }

    /** Ruta del dashboard correspondiente al rol de la sesión activa. */
    getHomeRouteForRole(rol: Rol | null): string {
        switch (rol) {
            case 'ADMINISTRADOR': return '/dashboard/admin';
            case 'VENDEDOR':      return '/dashboard/vendedor';
            case 'TECNICO':       return '/dashboard/tecnico';
            default:              return '/auth/login';
        }
    }

    logout(): void {
        sessionStorage.removeItem(SESSION_KEY);
    }
}
