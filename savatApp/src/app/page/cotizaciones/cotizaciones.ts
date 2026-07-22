import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api/api';
import { 
    apicotizaciongetall, 
    apicotizacioninsert, 
    apicotizacionestado, 
    apicotizaciondelete, 
    apiclientegetall, 
    apiproductogetall 
} from '../../api/functions';
import { AuthService } from '../../service/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

export type EstadoCotizacion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CONVERTIDA';

export interface CotizacionItem {
    idCotizacion: number;
    fecha: string;
    fechaVencimiento: string | null;
    estado: EstadoCotizacion | null;
    total: number;
    idCliente: number | null;
    clienteNombre: string | null;
}

export interface ClienteItem {
    idCliente: number;
    nombres: string;
}

export interface ProductoItem {
    idProducto: number;
    nombre: string;
    precioVenta: number;
}

export interface DetalleCotizacion {
    producto: ProductoItem | null;
    cantidad: number;
}

@Component({
    selector: 'app-cotizaciones',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        ToastModule,
        IconFieldModule,
        InputIconModule,
        TagModule,
        SelectModule,
        DialogModule,
        ConfirmDialogModule,
        MenuModule
    ],
    providers: [ConfirmationService],
    templateUrl: './cotizaciones.html',
    styleUrl: './cotizaciones.css'
})
export class Cotizaciones implements OnInit {

    private api            = inject(Api) as Api;
    private auth           = inject(AuthService) as AuthService;
    private messageService = inject(MessageService) as MessageService;
    private confirmationService = inject(ConfirmationService);

    // ── Estado ──────────────────────────────────────────────────────────────
    loading       = signal(true);
    cotizaciones  = signal<CotizacionItem[]>([]);
    searchQuery   = signal('');
    filtroEstado  = signal('TODOS');

    // Datos para el formulario
    clientes = signal<ClienteItem[]>([]);
    productos = signal<ProductoItem[]>([]);
    
    // Modal Creación
    showCreateModal = signal(false);
    saving = signal(false);
    nuevaCotizacion = {
        idCliente: null as number | null,
        fechaVencimiento: '' as string,
        detalle: [] as DetalleCotizacion[]
    };

    // ── Opciones de estado ───────────────────────────────────────────────────
    estadoOpciones = [
        { label: 'Todos',      value: 'TODOS'     },
        { label: 'Pendiente',  value: 'PENDIENTE' },
        { label: 'Aprobada',   value: 'APROBADA'  },
        { label: 'Rechazada',  value: 'RECHAZADA' },
        { label: 'Convertida', value: 'CONVERTIDA'}
    ];

    // ── Filtro ───────────────────────────────────────────────────────────────
    cotizacionesFiltradas = computed(() => {
        const q      = this.searchQuery().toLowerCase().trim();
        const estado = this.filtroEstado();
        return this.cotizaciones().filter(c => {
            const matchQ = !q ||
                (c.clienteNombre ?? '').toLowerCase().includes(q) ||
                String(c.idCotizacion).includes(q);
            const matchE = estado === 'TODOS' || c.estado === estado;
            return matchQ && matchE;
        });
    });

    // ── KPIs ─────────────────────────────────────────────────────────────────
    get totalCotizaciones(): number { return this.cotizaciones().length; }
    get pendientes():        number { return this.cotizaciones().filter(c => c.estado === 'PENDIENTE').length; }
    get aprobadas():         number { return this.cotizaciones().filter(c => c.estado === 'APROBADA').length; }
    get convertidas():       number { return this.cotizaciones().filter(c => c.estado === 'CONVERTIDA').length; }

    // Total de la nueva cotización en tiempo real
    get totalNuevaCotizacion(): number {
        return this.nuevaCotizacion.detalle.reduce((sum, item) => {
            const precio = item.producto?.precioVenta || 0;
            return sum + (precio * (item.cantidad || 0));
        }, 0);
    }

    // ── Ciclo de vida ─────────────────────────────────────────────────────────
    async ngOnInit(): Promise<void> {
        await this.loadCotizaciones();
    }

    async loadCotizaciones(): Promise<void> {
        this.loading.set(true);
        try {
            const resp: any = await this.api.invoke(apicotizaciongetall);
            this.cotizaciones.set(resp?.data ?? []);
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las cotizaciones.' });
        } finally {
            this.loading.set(false);
        }
    }

    async loadDatosFormulario(): Promise<void> {
        try {
            const [respClientes, respProductos]: any = await Promise.all([
                this.api.invoke(apiclientegetall),
                this.api.invoke(apiproductogetall)
            ]);
            this.clientes.set(respClientes?.data ?? []);
            this.productos.set(respProductos?.data ?? []);
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar clientes o productos.' });
        }
    }

    // ── Acciones CRUD ────────────────────────────────────────────────────────

    async openCreateModal() {
        this.nuevaCotizacion = {
            idCliente: null,
            fechaVencimiento: '',
            detalle: []
        };
        this.agregarProductoDetalle();
        this.showCreateModal.set(true);
        if (this.clientes().length === 0 || this.productos().length === 0) {
            await this.loadDatosFormulario();
        }
    }

    agregarProductoDetalle() {
        this.nuevaCotizacion.detalle.push({ producto: null, cantidad: 1 });
    }

    removerProductoDetalle(index: number) {
        this.nuevaCotizacion.detalle.splice(index, 1);
    }

    async saveCotizacion() {
        if (!this.nuevaCotizacion.idCliente || this.nuevaCotizacion.detalle.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Seleccione un cliente y al menos un producto.' });
            return;
        }

        const itemsValidos = this.nuevaCotizacion.detalle.filter(d => d.producto && d.cantidad > 0);
        if (itemsValidos.length === 0) {
            this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Detalle de productos inválido.' });
            return;
        }

        this.saving.set(true);
        try {
            const request = {
                // Aquí usamos "as number" para forzar el tipado estricto
                idCliente: this.nuevaCotizacion.idCliente as number,
                fechaVencimiento: this.nuevaCotizacion.fechaVencimiento || null,
                detalle: itemsValidos.map(d => ({
                    idProducto: d.producto!.idProducto,
                    cantidad: d.cantidad
                }))
            };

            const resp: any = await this.api.invoke(apicotizacioninsert, { body: request });
            if (resp.type === 'error') {
                 this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.listMessage && resp.listMessage.length > 0 ? resp.listMessage[0] : 'Error desconocido' });
            } else {
                 this.messageService.add({ severity: 'success', summary: 'Éxito', detail: resp.listMessage && resp.listMessage.length > 0 ? resp.listMessage[0] : 'Cotización creada correctamente.' });
                 this.showCreateModal.set(false);
                 await this.loadCotizaciones();
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la cotización.' });
        } finally {
            this.saving.set(false);
        }
    }

    async cambiarEstado(id: number, nuevoEstado: string) {
        try {
            const resp: any = await this.api.invoke(apicotizacionestado, { id: id, body: { estado: nuevoEstado } });
            if (resp.type === 'error') {
                 this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.listMessage && resp.listMessage.length > 0 ? resp.listMessage[0] : 'Error desconocido' });
            } else {
                 this.messageService.add({ severity: 'success', summary: 'Éxito', detail: resp.listMessage && resp.listMessage.length > 0 ? resp.listMessage[0] : 'Estado actualizado.' });
                 await this.loadCotizaciones();
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado.' });
        }
    }

    confirmarEliminacion(id: number) {
        this.confirmationService.confirm({
            message: '¿Está seguro de que desea eliminar esta cotización?',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    const resp: any = await this.api.invoke(apicotizaciondelete, { id: id });
                    if (resp.type === 'error') {
                        this.messageService.add({ severity: 'error', summary: 'Error', detail: resp.listMessage && resp.listMessage.length > 0 ? resp.listMessage[0] : 'Error desconocido' });
                    } else {
                        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: resp.listMessage && resp.listMessage.length > 0 ? resp.listMessage[0] : 'Cotización eliminada.' });
                        await this.loadCotizaciones();
                    }
                } catch {
                    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar la cotización.' });
                }
            }
        });
    }

    getAcciones(cotizacion: CotizacionItem): MenuItem[] {
        const acciones: MenuItem[] = [];
        
        if (cotizacion.estado === 'PENDIENTE') {
            acciones.push({ label: 'Aprobar', icon: 'pi pi-check', command: () => this.cambiarEstado(cotizacion.idCotizacion, 'APROBADA') });
            acciones.push({ label: 'Rechazar', icon: 'pi pi-times', command: () => this.cambiarEstado(cotizacion.idCotizacion, 'RECHAZADA') });
            acciones.push({ separator: true });
            acciones.push({ label: 'Eliminar', icon: 'pi pi-trash', command: () => this.confirmarEliminacion(cotizacion.idCotizacion) });
        }
        
        return acciones;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    estadoBadge(estado: EstadoCotizacion | null): 'warn' | 'success' | 'danger' | 'info' | 'secondary' {
        switch (estado) {
            case 'PENDIENTE':  return 'warn';
            case 'APROBADA':   return 'success';
            case 'RECHAZADA':  return 'danger';
            case 'CONVERTIDA': return 'info';
            default:           return 'secondary';
        }
    }

    estadoLabel(estado: EstadoCotizacion | null): string {
        switch (estado) {
            case 'PENDIENTE':  return 'Pendiente';
            case 'APROBADA':   return 'Aprobada';
            case 'RECHAZADA':  return 'Rechazada';
            case 'CONVERTIDA': return 'Convertida';
            default:           return '—';
        }
    }

    estaVencida(c: CotizacionItem): boolean {
        if (!c.fechaVencimiento || c.estado !== 'PENDIENTE') return false;
        return new Date(c.fechaVencimiento) < new Date();
    }

    formatFecha(fecha: string | null): string {
        if (!fecha) return '—';
        return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    formatMonto(n: number): string {
        return 'S/ ' + (n || 0).toFixed(2);
    }
}
