import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Api } from '../../api/api';
import { apiproveedorgetall } from '../../api/functions';
import { AuthService } from '../../service/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TextareaModule } from 'primeng/textarea';
import { HttpClient } from '@angular/common/http';
import { ApiConfiguration } from '../../api/api-configuration';
import { firstValueFrom } from 'rxjs';

export interface ProveedorItem {
    idProveedor: number;
    nombre: string;
    ruc: string | null;
    telefono: string | null;
    correo: string | null;
    direccion: string | null;
    contacto: string | null;
}

@Component({
    selector: 'app-proveedores',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        ConfirmDialogModule,
        ToastModule,
        IconFieldModule,
        InputIconModule,
        TextareaModule
    ],
    templateUrl: './proveedores.html',
    styleUrl: './proveedores.css'
})
export class Proveedores implements OnInit {

    private api            = inject(Api) as Api;
    private auth           = inject(AuthService) as AuthService;
    private messageService = inject(MessageService) as MessageService;
    private confirmService = inject(ConfirmationService) as ConfirmationService;
    private fb             = inject(FormBuilder) as FormBuilder;
    private http           = inject(HttpClient) as HttpClient;
    private apiConfig      = inject(ApiConfiguration) as ApiConfiguration;

    // ── Estado ──────────────────────────────────────────────────────────────
    loading       = signal(true);
    saving        = signal(false);
    proveedores   = signal<ProveedorItem[]>([]);
    dialogVisible = signal(false);
    editingId     = signal<number | null>(null);
    searchQuery   = signal('');

    // ── Permisos ─────────────────────────────────────────────────────────────
    get canWrite(): boolean { return this.auth.getRol() === 'ADMINISTRADOR'; }

    // ── Filtro ───────────────────────────────────────────────────────────────
    proveedoresFiltrados = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return this.proveedores();
        return this.proveedores().filter(p =>
            p.nombre.toLowerCase().includes(q) ||
            (p.ruc ?? '').includes(q) ||
            (p.telefono ?? '').includes(q) ||
            (p.correo ?? '').toLowerCase().includes(q) ||
            (p.contacto ?? '').toLowerCase().includes(q)
        );
    });

    // ── Formulario ───────────────────────────────────────────────────────────
    form: FormGroup = this.fb.group({
        nombre:    ['', [Validators.required, Validators.maxLength(150)]],
        ruc:       ['', Validators.maxLength(20)],
        telefono:  ['', Validators.maxLength(20)],
        correo:    ['', [Validators.email, Validators.maxLength(100)]],
        direccion: ['', Validators.maxLength(200)],
        contacto:  ['', Validators.maxLength(100)]
    });

    get dialogTitle(): string { return this.editingId() ? 'Editar Proveedor' : 'Nuevo Proveedor'; }

    // ── Ciclo de vida ─────────────────────────────────────────────────────────
    async ngOnInit(): Promise<void> {
        await this.loadProveedores();
    }

    // ── Carga ─────────────────────────────────────────────────────────────────
    async loadProveedores(): Promise<void> {
        this.loading.set(true);
        try {
            const resp: any = await this.api.invoke(apiproveedorgetall);
            this.proveedores.set(resp?.data ?? []);
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proveedores.' });
        } finally {
            this.loading.set(false);
        }
    }

    // ── Acciones ──────────────────────────────────────────────────────────────
    openNew(): void {
        this.editingId.set(null);
        this.form.reset();
        this.dialogVisible.set(true);
    }

    openEdit(p: ProveedorItem): void {
        this.editingId.set(p.idProveedor);
        this.form.patchValue({
            nombre:    p.nombre,
            ruc:       p.ruc,
            telefono:  p.telefono,
            correo:    p.correo,
            direccion: p.direccion,
            contacto:  p.contacto
        });
        this.dialogVisible.set(true);
    }

    closeDialog(): void {
        this.dialogVisible.set(false);
        this.form.reset();
    }

    async onSave(): Promise<void> {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }

        this.saving.set(true);
        const v = this.form.value;
        const body = {
            nombre:    v.nombre?.trim(),
            ruc:       v.ruc?.trim() || null,
            telefono:  v.telefono?.trim() || null,
            correo:    v.correo?.trim() || null,
            direccion: v.direccion?.trim() || null,
            contacto:  v.contacto?.trim() || null
        };

        try {
            const base = this.apiConfig.rootUrl;
            let resp: any;
            if (this.editingId()) {
                resp = await firstValueFrom(
                    this.http.put<any>(`${base}/proveedor/update/${this.editingId()}`, body)
                );
            } else {
                resp = await firstValueFrom(
                    this.http.post<any>(`${base}/proveedor/insert`, body)
                );
            }

            if (resp?.type === 'success') {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: resp.listMessage?.[0] ?? 'Operación exitosa.' });
                this.closeDialog();
                await this.loadProveedores();
            } else {
                this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: resp?.listMessage?.[0] ?? 'Ocurrió un problema.' });
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo completar la operación.' });
        } finally {
            this.saving.set(false);
        }
    }

    confirmDelete(p: ProveedorItem): void {
        this.confirmService.confirm({
            message: `¿Eliminar proveedor <strong>${p.nombre}</strong>? Esta acción no se puede deshacer.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.deleteProveedor(p.idProveedor)
        });
    }

    private async deleteProveedor(id: number): Promise<void> {
        try {
            const base = this.apiConfig.rootUrl;
            const resp: any = await firstValueFrom(
                this.http.delete<any>(`${base}/proveedor/delete/${id}`)
            );
            if (resp?.type === 'success') {
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: resp.listMessage?.[0] ?? 'Proveedor eliminado.' });
                await this.loadProveedores();
            } else {
                this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: resp?.listMessage?.[0] ?? 'No se pudo eliminar.' });
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el proveedor.' });
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    fieldError(field: string): boolean {
        const ctrl = this.form.get(field);
        return !!(ctrl?.invalid && ctrl?.touched);
    }

    fieldErrorMsg(field: string): string {
        const ctrl = this.form.get(field);
        if (!ctrl?.errors) return '';
        if (ctrl.errors['required'])  return 'Este campo es obligatorio.';
        if (ctrl.errors['email'])     return 'Ingresa un correo válido.';
        if (ctrl.errors['maxlength']) return `Máximo ${ctrl.errors['maxlength'].requiredLength} caracteres.`;
        return '';
    }
}
