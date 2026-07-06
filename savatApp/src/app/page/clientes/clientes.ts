import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Api } from '../../api/api';
import { apiclientegetall } from '../../api/functions';
import { apiclienteinsert, Apiclienteinsert$Params } from '../../api/fn/operations/apiclienteinsert';
import { apiclienteupdate, Apiclienteupdate$Params } from '../../api/fn/operations/apiclienteupdate';
import { apiclientedelete, Apiclientedelete$Params } from '../../api/fn/operations/apiclientedelete';
import { apicategoriaclientegetall } from '../../api/fn/operations/apicategoriaclientegetall';
import { AuthService } from '../../service/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

export interface CategoriaCliente {
    idCategoriaCliente: number;
    nombre: string;
}

export interface ClienteItem {
    idCliente: number;
    nombres: string;
    dniRuc: string | null;
    telefono: string | null;
    correo: string | null;
    direccion: string | null;
    idCategoriaCliente: number | null;
    categoriaClienteNombre: string | null;
}

@Component({
    selector: 'app-clientes',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        SelectModule,
        ConfirmDialogModule,
        ToastModule,
        IconFieldModule,
        InputIconModule
    ],
    templateUrl: './clientes.html',
    styleUrl: './clientes.css'
})
export class Clientes implements OnInit {

    private api              = inject(Api) as Api;
    private auth             = inject(AuthService) as AuthService;
    private messageService   = inject(MessageService) as MessageService;
    private confirmService   = inject(ConfirmationService) as ConfirmationService;
    private fb               = inject(FormBuilder) as FormBuilder;

    // ── Estado ──────────────────────────────────────────────────────────────
    loading       = signal(true);
    saving        = signal(false);
    clientes      = signal<ClienteItem[]>([]);
    categorias    = signal<CategoriaCliente[]>([]);
    dialogVisible = signal(false);
    editingId     = signal<number | null>(null);
    searchQuery   = signal('');

    // ── Permisos ─────────────────────────────────────────────────────────────
    get canWrite(): boolean {
        const rol = this.auth.getRol();
        return rol === 'ADMINISTRADOR' || rol === 'VENDEDOR';
    }

    // ── Filtro ───────────────────────────────────────────────────────────────
    clientesFiltrados = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        if (!q) return this.clientes();
        return this.clientes().filter(c =>
            c.nombres.toLowerCase().includes(q) ||
            (c.dniRuc ?? '').toLowerCase().includes(q) ||
            (c.telefono ?? '').includes(q) ||
            (c.correo ?? '').toLowerCase().includes(q)
        );
    });

    // ── Formulario ───────────────────────────────────────────────────────────
    form: FormGroup = this.fb.group({
        nombres:             ['', [Validators.required, Validators.maxLength(150)]],
        dniRuc:              ['', Validators.maxLength(20)],
        telefono:            ['', Validators.maxLength(20)],
        correo:              ['', [Validators.email, Validators.maxLength(100)]],
        direccion:           ['', Validators.maxLength(200)],
        idCategoriaCliente:  [null]
    });

    get dialogTitle(): string {
        return this.editingId() ? 'Editar Cliente' : 'Nuevo Cliente';
    }

    // ── Ciclo de vida ─────────────────────────────────────────────────────────
    async ngOnInit(): Promise<void> {
        await Promise.all([this.loadClientes(), this.loadCategorias()]);
    }

    // ── Carga de datos ────────────────────────────────────────────────────────
    async loadClientes(): Promise<void> {
        this.loading.set(true);
        try {
            const resp: any = await this.api.invoke(apiclientegetall);
            this.clientes.set(resp?.data ?? []);
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los clientes.' });
        } finally {
            this.loading.set(false);
        }
    }

    async loadCategorias(): Promise<void> {
        try {
            const resp: any = await this.api.invoke(apicategoriaclientegetall);
            this.categorias.set(resp?.data ?? []);
        } catch {
            // No critico si las categorías no cargan
        }
    }

    // ── Acciones ──────────────────────────────────────────────────────────────
    openNew(): void {
        this.editingId.set(null);
        this.form.reset();
        this.dialogVisible.set(true);
    }

    openEdit(cliente: ClienteItem): void {
        this.editingId.set(cliente.idCliente);
        this.form.patchValue({
            nombres:            cliente.nombres,
            dniRuc:             cliente.dniRuc,
            telefono:           cliente.telefono,
            correo:             cliente.correo,
            direccion:          cliente.direccion,
            idCategoriaCliente: cliente.idCategoriaCliente
        });
        this.dialogVisible.set(true);
    }

    closeDialog(): void {
        this.dialogVisible.set(false);
        this.form.reset();
    }

    async onSave(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.saving.set(true);
        const v = this.form.value;
        const body = {
            nombres:            v.nombres?.trim(),
            dniRuc:             v.dniRuc?.trim() || null,
            telefono:           v.telefono?.trim() || null,
            correo:             v.correo?.trim() || null,
            direccion:          v.direccion?.trim() || null,
            idCategoriaCliente: v.idCategoriaCliente ?? null
        };

        try {
            let resp: any;
            if (this.editingId()) {
                const params: Apiclienteupdate$Params = { id: this.editingId()!, body };
                resp = await this.api.invoke(apiclienteupdate, params);
            } else {
                const params: Apiclienteinsert$Params = { body };
                resp = await this.api.invoke(apiclienteinsert, params);
            }

            if (resp?.type === 'success') {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: resp.listMessage?.[0] ?? 'Operación exitosa.' });
                this.closeDialog();
                await this.loadClientes();
            } else {
                this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: resp?.listMessage?.[0] ?? 'Ocurrió un problema.' });
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo completar la operación.' });
        } finally {
            this.saving.set(false);
        }
    }

    confirmDelete(cliente: ClienteItem): void {
        this.confirmService.confirm({
            message: `¿Eliminar a <strong>${cliente.nombres}</strong>? Esta acción no se puede deshacer.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.deleteCliente(cliente.idCliente)
        });
    }

    private async deleteCliente(id: number): Promise<void> {
        try {
            const params: Apiclientedelete$Params = { id };
            const resp: any = await this.api.invoke(apiclientedelete, params);
            if (resp?.type === 'success') {
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: resp.listMessage?.[0] ?? 'Cliente eliminado.' });
                await this.loadClientes();
            } else {
                this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: resp?.listMessage?.[0] ?? 'No se pudo eliminar.' });
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el cliente.' });
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    get categoriasOpciones() {
        return this.categorias().map(c => ({ label: c.nombre, value: c.idCategoriaCliente }));
    }

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
