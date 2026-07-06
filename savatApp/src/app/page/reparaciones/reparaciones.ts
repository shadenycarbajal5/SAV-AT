import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Api } from '../../api/api';
import { apiordenserviciogetall, apiclientegetall, apiequipogetall, apiproductogetall,
         apiequipoinsert, Apiequipoinsert$Params } from '../../api/functions';
import { apiordenservicioinsert, Apiordenservicioinsert$Params } from '../../api/fn/operations/apiordenservicioinsert';
import { apiordenservicioupdate, Apiordenservicioupdate$Params } from '../../api/fn/operations/apiordenservicioupdate';
import { apirepuestoos_getbyos, Apirepuestoos_getbyos$Params } from '../../api/fn/operations/apirepuestoos-getbyos';
import { apirepuestoosinsert, Apirepuestoosinsert$Params } from '../../api/fn/operations/apirepuestoos-insert';
import { apirepuestoos_delete, Apirepuestoos_delete$Params } from '../../api/fn/operations/apirepuestoos-delete';
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
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';

export type EstadoOs = 'RECIBIDO' | 'DIAGNOSTICO' | 'REPARACION' | 'LISTO' | 'ENTREGADO' | 'CANCELADO';

export interface OrdenServicioItem {
    idOs: number;
    fechaIngreso: string;
    fechaEntrega: string | null;
    descripcionProblema: string | null;
    estado: EstadoOs | null;
    idCliente: number | null;
    clienteNombre: string | null;
    idUsuario: number | null;
    usuarioNombre: string | null;
    idEquipo: number | null;
    equipoDescripcion: string | null;
}

export interface RepuestoItem {
    idRepuestoOs: number;
    idOs: number;
    idProducto: number;
    productoNombre: string;
    cantidad: number;
}

export interface ClienteOpt  { idCliente:  number; nombres: string; }
export interface EquipoOpt   { idEquipo: number; marca: string | null; modelo: string | null; numeroSerie: string | null; label: string; }
export interface ProductoOpt { idProducto: number; nombre: string; stock: number | null; tipoProducto: string | null; }

@Component({
    selector: 'app-reparaciones',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        TableModule, ButtonModule, InputTextModule,
        DialogModule, SelectModule, ConfirmDialogModule,
        ToastModule, IconFieldModule, InputIconModule,
        TagModule, InputNumberModule, DatePickerModule, TextareaModule
    ],
    templateUrl: './reparaciones.html',
    styleUrl: './reparaciones.css'
})
export class Reparaciones implements OnInit {

    private api            = inject(Api) as Api;
    private auth           = inject(AuthService) as AuthService;
    private messageService = inject(MessageService) as MessageService;
    private confirmService = inject(ConfirmationService) as ConfirmationService;
    private fb             = inject(FormBuilder) as FormBuilder;

    // ── Estado general ───────────────────────────────────────────────────────
    loading      = signal(true);
    saving       = signal(false);
    ordenes      = signal<OrdenServicioItem[]>([]);
    searchQuery  = signal('');
    filtroEstado = signal('TODOS');

    // ── Diálogo OS ───────────────────────────────────────────────────────────
    dialogVisible = signal(false);
    editingId     = signal<number | null>(null);

    // ── Diálogo detalle / repuestos ──────────────────────────────────────────
    detalleVisible  = signal(false);
    ordenSelec      = signal<OrdenServicioItem | null>(null);
    repuestos       = signal<RepuestoItem[]>([]);
    loadingRepuest  = signal(false);
    savingRepuest   = signal(false);

    // ── Catálogos ────────────────────────────────────────────────────────────
    clientes  = signal<ClienteOpt[]>([]);
    equipos   = signal<EquipoOpt[]>([]);
    productos = signal<ProductoOpt[]>([]);

    estadoOpciones = [
        { label: 'Todos',       value: 'TODOS'       },
        { label: 'Recibido',    value: 'RECIBIDO'    },
        { label: 'Diagnóstico', value: 'DIAGNOSTICO' },
        { label: 'Reparación',  value: 'REPARACION'  },
        { label: 'Listo',       value: 'LISTO'       },
        { label: 'Entregado',   value: 'ENTREGADO'   },
        { label: 'Cancelado',   value: 'CANCELADO'   },
    ];

    estadoFormOpciones = this.estadoOpciones.slice(1); // sin "Todos"

    // ── Formulario OS ─────────────────────────────────────────────────────────
    // Incluye campos para datos del equipo (solo aplican en modo "nueva orden")
    // e idEquipo (solo aplica en modo "editar")
    form: FormGroup = this.fb.group({
        idCliente:           [null, Validators.required],
        // Campos escritos (nueva orden)
        equipoMarca:         ['', Validators.required],
        equipoModelo:        [''],
        equipoSerie:         [''],
        // Selector (editar orden)
        idEquipo:            [null],
        // Resto
        fechaEntrega:        [null],
        descripcionProblema: [''],
        estado:              ['RECIBIDO'],
    });

    // ── Formulario repuesto ───────────────────────────────────────────────────
    repuestoForm: FormGroup = this.fb.group({
        idProducto: [null, Validators.required],
        cantidad:   [1,   [Validators.required, Validators.min(1)]],
    });

    // ── Computed ──────────────────────────────────────────────────────────────
    ordenesFiltradas = computed(() => {
        const q      = this.searchQuery().toLowerCase().trim();
        const estado = this.filtroEstado();
        return this.ordenes().filter(o => {
            const matchQ = !q ||
                (o.clienteNombre ?? '').toLowerCase().includes(q) ||
                (o.equipoDescripcion ?? '').toLowerCase().includes(q) ||
                String(o.idOs).includes(q);
            const matchE = estado === 'TODOS' || o.estado === estado;
            return matchQ && matchE;
        });
    });

    get totalOrdenes(): number { return this.ordenes().length; }
    get enProceso():    number { return this.ordenes().filter(o => ['RECIBIDO','DIAGNOSTICO','REPARACION'].includes(o.estado ?? '')).length; }
    get listas():       number { return this.ordenes().filter(o => o.estado === 'LISTO').length; }
    get entregadas():   number { return this.ordenes().filter(o => o.estado === 'ENTREGADO').length; }

    // ── Permisos ──────────────────────────────────────────────────────────────
    get isTecnico():      boolean { return this.auth.getRol() === 'TECNICO'; }
    get isAdmin():        boolean { return this.auth.getRol() === 'ADMINISTRADOR'; }
    get canInsert():      boolean { return this.isTecnico || this.isAdmin || this.auth.getRol() === 'VENDEDOR'; }
    get canUpdate():      boolean { return this.isTecnico || this.isAdmin; }
    get canDelete():      boolean { return this.isAdmin; }
    get canRepuestos():   boolean { return this.isTecnico || this.isAdmin; }

    // ── Ciclo de vida ──────────────────────────────────────────────────────────
    async ngOnInit(): Promise<void> {
        await Promise.all([
            this.loadOrdenes(),
            this.loadCatalogos(),
        ]);
    }

    async loadOrdenes(): Promise<void> {
        this.loading.set(true);
        try {
            const resp: any = await this.api.invoke(apiordenserviciogetall);
            this.ordenes.set(resp?.data ?? []);
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las órdenes de servicio.' });
        } finally {
            this.loading.set(false);
        }
    }

    async loadCatalogos(): Promise<void> {
        try {
            const [rClientes, rEquipos, rProductos]: any[] = await Promise.all([
                this.api.invoke(apiclientegetall),
                this.api.invoke(apiequipogetall),
                this.api.invoke(apiproductogetall),
            ]);
            this.clientes.set(rClientes?.data ?? []);
            this.equipos.set((rEquipos?.data ?? []).map((e: any) => ({
                ...e,
                label: [e.marca, e.modelo, e.numeroSerie ? `(${e.numeroSerie})` : null]
                    .filter(Boolean).join(' ') || `Equipo #${e.idEquipo}`
            })));
            this.productos.set((rProductos?.data ?? []).filter((p: any) => p.tipoProducto === 'REPUESTO'));
        } catch {
            // no-op
        }
    }

    // ── Diálogo OS ─────────────────────────────────────────────────────────────
    openNew(): void {
        this.editingId.set(null);
        // En nueva orden: activar validación de marca y quitar validación de idEquipo
        this.form.reset({ estado: 'RECIBIDO' });
        this.form.get('equipoMarca')!.setValidators([Validators.required]);
        this.form.get('idEquipo')!.clearValidators();
        this.form.get('equipoMarca')!.updateValueAndValidity();
        this.form.get('idEquipo')!.updateValueAndValidity();
        this.dialogVisible.set(true);
    }

    openEdit(o: OrdenServicioItem): void {
        this.editingId.set(o.idOs);
        // En editar: activar validación de idEquipo y quitar validación de marca
        this.form.get('equipoMarca')!.clearValidators();
        this.form.get('idEquipo')!.setValidators([Validators.required]);
        this.form.get('equipoMarca')!.updateValueAndValidity();
        this.form.get('idEquipo')!.updateValueAndValidity();
        this.form.reset({
            idCliente:           o.idCliente,
            idEquipo:            o.idEquipo,
            equipoMarca:         '',
            equipoModelo:        '',
            equipoSerie:         '',
            fechaEntrega:        o.fechaEntrega ? new Date(o.fechaEntrega) : null,
            descripcionProblema: o.descripcionProblema ?? '',
            estado:              o.estado ?? 'RECIBIDO',
        });
        this.dialogVisible.set(true);
    }

    async saveOS(): Promise<void> {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }
        this.saving.set(true);
        const v    = this.form.value;
        const sess = this.auth.getSession()!;
        const fechaStr: string | null = v.fechaEntrega
            ? (v.fechaEntrega as Date).toISOString().split('T')[0]
            : null;

        try {
            const id = this.editingId();

            if (id === null) {
                // ── NUEVA ORDEN: primero crear el equipo ──────────────────────
                const equipoParams: Apiequipoinsert$Params = {
                    body: {
                        marca:       v.equipoMarca?.trim() || null,
                        modelo:      v.equipoModelo?.trim() || null,
                        numeroSerie: v.equipoSerie?.trim()  || null,
                    }
                };
                const respEquipo: any = await this.api.invoke(apiequipoinsert, equipoParams);
                if (respEquipo?.type !== 'success') {
                    const msg = respEquipo?.listMessage?.[0] ?? 'No se pudo registrar el equipo.';
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: msg });
                    return;
                }
                const nuevoIdEquipo: number = respEquipo.idEquipo;

                // ── Luego crear la orden con el idEquipo recién obtenido ──────
                const params: Apiordenservicioinsert$Params = {
                    body: {
                        idCliente:           v.idCliente,
                        idEquipo:            nuevoIdEquipo,
                        idUsuario:           sess.idUsuario,
                        fechaEntrega:        fechaStr,
                        descripcionProblema: v.descripcionProblema || null,
                        estado:              v.estado ?? 'RECIBIDO',
                    }
                };
                const resp: any = await this.api.invoke(apiordenservicioinsert, params);
                if (resp?.type !== 'success') {
                    this.messageService.add({ severity: 'warn', summary: 'Atención', detail: resp?.listMessage?.[0] ?? 'No se pudo registrar la orden.' });
                    return;
                }
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: resp.listMessage?.[0] ?? 'Orden de servicio registrada.' });

            } else {
                // ── EDITAR ORDEN ──────────────────────────────────────────────
                const params: Apiordenservicioupdate$Params = {
                    id,
                    body: {
                        idCliente:           v.idCliente,
                        idEquipo:            v.idEquipo,
                        idUsuario:           sess.idUsuario,
                        fechaEntrega:        fechaStr,
                        descripcionProblema: v.descripcionProblema || null,
                        estado:              v.estado ?? 'RECIBIDO',
                    }
                };
                const resp: any = await this.api.invoke(apiordenservicioupdate, params);
                if (resp?.type !== 'success') {
                    this.messageService.add({ severity: 'warn', summary: 'Atención', detail: resp?.listMessage?.[0] ?? 'No se pudo actualizar la orden.' });
                    return;
                }
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: resp.listMessage?.[0] ?? 'Orden actualizada.' });
            }

            this.dialogVisible.set(false);
            await Promise.all([this.loadOrdenes(), this.loadCatalogos()]);

        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar la orden.' });
        } finally {
            this.saving.set(false);
        }
    }

    // ── Diálogo detalle / repuestos ────────────────────────────────────────────
    async openDetalle(o: OrdenServicioItem): Promise<void> {
        this.ordenSelec.set(o);
        this.repuestoForm.reset({ cantidad: 1 });
        this.detalleVisible.set(true);
        await this.loadRepuestos(o.idOs);
    }

    async loadRepuestos(idOs: number): Promise<void> {
        this.loadingRepuest.set(true);
        try {
            const params: Apirepuestoos_getbyos$Params = { idOs };
            const resp: any = await this.api.invoke(apirepuestoos_getbyos, params);
            this.repuestos.set(resp?.data ?? []);
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los repuestos.' });
        } finally {
            this.loadingRepuest.set(false);
        }
    }

    async addRepuesto(): Promise<void> {
        if (this.repuestoForm.invalid) { this.repuestoForm.markAllAsTouched(); return; }
        this.savingRepuest.set(true);
        try {
            const params: Apirepuestoosinsert$Params = {
                body: {
                    idOs:       this.ordenSelec()!.idOs,
                    idProducto: this.repuestoForm.value.idProducto,
                    cantidad:   this.repuestoForm.value.cantidad,
                }
            };
            const resp: any = await this.api.invoke(apirepuestoosinsert, params);
            if (resp?.listMessage?.length && !resp.success) {
                this.messageService.add({ severity: 'warn', summary: 'Atención', detail: resp.listMessage[0] });
                return;
            }
            this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Repuesto agregado.' });
            this.repuestoForm.reset({ cantidad: 1 });
            await this.loadRepuestos(this.ordenSelec()!.idOs);
            await this.loadCatalogos();
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar el repuesto.' });
        } finally {
            this.savingRepuest.set(false);
        }
    }

    confirmDeleteRepuesto(r: RepuestoItem): void {
        this.confirmService.confirm({
            message: `¿Eliminar "${r.productoNombre}" (x${r.cantidad}) de la orden? El stock será restituido.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.deleteRepuesto(r.idRepuestoOs),
        });
    }

    async deleteRepuesto(id: number): Promise<void> {
        try {
            const params: Apirepuestoos_delete$Params = { id };
            await this.api.invoke(apirepuestoos_delete, params);
            this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Repuesto eliminado y stock restituido.' });
            await this.loadRepuestos(this.ordenSelec()!.idOs);
            await this.loadCatalogos();
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el repuesto.' });
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    estadoBadge(estado: EstadoOs | null): 'secondary' | 'info' | 'warn' | 'success' | 'danger' {
        switch (estado) {
            case 'RECIBIDO':    return 'secondary';
            case 'DIAGNOSTICO': return 'info';
            case 'REPARACION':  return 'warn';
            case 'LISTO':       return 'success';
            case 'ENTREGADO':   return 'success';
            case 'CANCELADO':   return 'danger';
            default:            return 'secondary';
        }
    }

    estadoLabel(estado: EstadoOs | null): string {
        const m: Record<string, string> = {
            RECIBIDO: 'Recibido', DIAGNOSTICO: 'Diagnóstico',
            REPARACION: 'Reparación', LISTO: 'Listo',
            ENTREGADO: 'Entregado', CANCELADO: 'Cancelado'
        };
        return estado ? (m[estado] ?? estado) : '—';
    }

    estadoIcon(estado: EstadoOs | null): string {
        const m: Record<string, string> = {
            RECIBIDO: '📥', DIAGNOSTICO: '🔍',
            REPARACION: '🔧', LISTO: '✅',
            ENTREGADO: '📦', CANCELADO: '❌'
        };
        return estado ? (m[estado] ?? '•') : '•';
    }

    formatFecha(fecha: string | null): string {
        if (!fecha) return '—';
        return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
}
