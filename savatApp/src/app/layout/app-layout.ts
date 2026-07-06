import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { AuthService } from '../service/auth.service';
import { getNavSectionsForRole, NavSection } from './nav-config';
import { Api } from '../api/api';
import { apirolgetall } from '../api/fn/operations/apirolgetall';
import { apiusuarioregister, Apiusuarioregister$Params } from '../api/fn/operations/apiusuarioregister';
import { ApiListResponse } from '../model/savat.models';

export type Rol = 'ADMINISTRADOR' | 'VENDEDOR' | 'TECNICO';

interface RolOption {
    label: string;
    value: string;
}

interface NuevoUsuario {
    nombres: string;
    username: string;
    password: string;
    confirmPassword: string;
    rol: string | null;
}

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        RouterOutlet,
        FormsModule,
        MenuModule,
        ButtonModule,
        DialogModule,
        InputTextModule,
        PasswordModule,
        SelectModule,
        ToastModule,
        ConfirmDialogModule
    ],
    templateUrl: './app-layout.html',
    styleUrl: './app-layout.css'
})
export class AppLayout {

    private auth           = inject(AuthService);
    private router         = inject(Router);
    private messageService = inject(MessageService);
    private api            = inject(Api);

    sidebarOpen        = signal(false);
    currentUrl         = signal(this.router.url);

    // ── Dialogs ───────────────────────────────────────────────────────────────
    perfilVisible      = signal(false);
    showRegisterDialog = signal(false);
    registerLoading    = signal(false);
    rolesLoading       = signal(false);

    navSections: NavSection[] = getNavSectionsForRole(this.auth.getSession()?.rol ?? null);

    nuevoUsuario: NuevoUsuario = {
        nombres: '', username: '', password: '', confirmPassword: '', rol: null
    };

    roleOptions: RolOption[] = [];

    profileItems: MenuItem[] = this.buildProfileItems();

    constructor() {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.currentUrl.set(event.urlAfterRedirects);
                this.sidebarOpen.set(false);
            }
        });
    }

    private buildProfileItems(): MenuItem[] {
        const items: MenuItem[] = [
            { label: 'Mi Perfil', icon: 'pi pi-user', command: () => this.perfilVisible.set(true) }
        ];

        if (this.isAdmin) {
            items.push({
                label: 'Registrar Usuario',
                icon: 'pi pi-user-plus',
                command: () => this.openRegisterDialog()
            });
        }

        items.push(
            { separator: true },
            { label: 'Cerrar Sesión', icon: 'pi pi-sign-out', command: () => this.logout() }
        );

        return items;
    }

    // ── Getters sesión ────────────────────────────────────────────────────────
    get isAdmin(): boolean {
        return this.auth.getSession()?.rol === 'ADMINISTRADOR';
    }

    get userName(): string {
        return this.auth.getSession()?.nombres ?? 'Usuario';
    }

    get userUsername(): string {
        return this.auth.getSession()?.username ?? '—';
    }

    get userRoleLabel(): string {
        const rol = this.auth.getSession()?.rol;
        switch (rol) {
            case 'ADMINISTRADOR': return 'Administrador';
            case 'VENDEDOR':      return 'Vendedor';
            case 'TECNICO':       return 'Técnico';
            default:              return '';
        }
    }

    get userRoleColor(): string {
        const rol = this.auth.getSession()?.rol;
        switch (rol) {
            case 'ADMINISTRADOR': return 'badge-admin';
            case 'VENDEDOR':      return 'badge-vendedor';
            case 'TECNICO':       return 'badge-tecnico';
            default:              return '';
        }
    }

    get userInitials(): string {
        const nombres = this.auth.getSession()?.nombres ?? '';
        const parts = nombres.trim().split(' ').filter(Boolean);
        if (parts.length === 0) return 'U';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }

    // ── Navegación ────────────────────────────────────────────────────────────
    isActive(route: string): boolean {
        return this.currentUrl().startsWith(route);
    }

    toggleSidebar(): void {
        this.sidebarOpen.update(v => !v);
    }

    // ── Registro ──────────────────────────────────────────────────────────────
    async openRegisterDialog(): Promise<void> {
        this.nuevoUsuario = { nombres: '', username: '', password: '', confirmPassword: '', rol: null };
        this.roleOptions  = [];
        this.showRegisterDialog.set(true);
        await this.cargarRoles();
    }

    closeRegisterDialog(): void {
        this.showRegisterDialog.set(false);
    }

    private async cargarRoles(): Promise<void> {
        this.rolesLoading.set(true);
        try {
            const resp = await this.api.invoke<any, any>(apirolgetall);
            console.log('[cargarRoles] respuesta completa:', JSON.stringify(resp));

            const data = resp?.data ?? resp ?? [];
            console.log('[cargarRoles] data extraída:', JSON.stringify(data));

            this.roleOptions = (Array.isArray(data) ? data : []).map((r: any) => {
                if (typeof r === 'string') return { label: this.labelParaRol(r), value: r };
                const value = r.nombre ?? r.name ?? r.rol ?? r.value ?? String(r);
                return { label: this.labelParaRol(value), value };
            });

            console.log('[cargarRoles] roleOptions:', JSON.stringify(this.roleOptions));

            if (this.roleOptions.length === 0) {
                this.messageService.add({ severity: 'warn', summary: 'Roles', detail: 'No se encontraron roles en el servidor.', life: 3000 });
            }
        } catch (err) {
            console.error('[cargarRoles] ERROR:', err);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los roles.', life: 3500 });
        } finally {
            this.rolesLoading.set(false);
        }
    }

    private labelParaRol(valor: string): string {
        switch (valor?.toUpperCase()) {
            case 'ADMINISTRADOR': return 'Administrador';
            case 'VENDEDOR':      return 'Vendedor';
            case 'TECNICO':       return 'Técnico';
            default:              return valor;
        }
    }

    registrarUsuario(): void {
        const { nombres, username, password, confirmPassword, rol } = this.nuevoUsuario;

        if (!nombres.trim() || !username.trim() || !password || !rol) {
            this.messageService.add({ severity: 'warn', summary: 'Campos requeridos', detail: 'Completa todos los campos.', life: 3000 });
            return;
        }
        if (password !== confirmPassword) {
            this.messageService.add({ severity: 'warn', summary: 'Contraseñas', detail: 'Las contraseñas no coinciden.', life: 3000 });
            return;
        }
        if (password.length < 6) {
            this.messageService.add({ severity: 'warn', summary: 'Contraseña débil', detail: 'La contraseña debe tener al menos 6 caracteres.', life: 3000 });
            return;
        }

        this.registerLoading.set(true);

        const params: Apiusuarioregister$Params = {
            body: { nombres: nombres.trim(), username: username.trim(), password, rol }
        };

        this.api.invoke(apiusuarioregister, params)
            .then((resp: any) => {
                this.registerLoading.set(false);
                if (resp?.type === 'success') {
                    this.showRegisterDialog.set(false);
                    this.messageService.add({ severity: 'success', summary: 'Listo', detail: `Usuario "${username}" registrado correctamente.`, life: 3500 });
                } else {
                    const msg = resp?.listMessage?.[0] ?? 'No se pudo registrar el usuario.';
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
                }
            })
            .catch((err: any) => {
                this.registerLoading.set(false);
                const msg = err?.error?.listMessage?.[0] ?? err?.error?.message ?? 'No se pudo registrar el usuario.';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: msg, life: 4000 });
            });
    }

    // ── Sesión ────────────────────────────────────────────────────────────────
    logout(): void {
        this.auth.logout();
        this.messageService.add({ severity: 'info', summary: 'Correcto', detail: 'Sesión cerrada correctamente.', life: 3000 });
        setTimeout(() => this.router.navigate(['/auth/login']), 800);
    }
}
