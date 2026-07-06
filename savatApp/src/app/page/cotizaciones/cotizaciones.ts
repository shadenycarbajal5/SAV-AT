import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api/api';
import { apicotizaciongetall } from '../../api/functions';
import { AuthService } from '../../service/auth.service';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';

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
        SelectModule
    ],
    templateUrl: './cotizaciones.html',
    styleUrl: './cotizaciones.css'
})
export class Cotizaciones implements OnInit {

    private api            = inject(Api) as Api;
    private auth           = inject(AuthService) as AuthService;
    private messageService = inject(MessageService) as MessageService;

    // ── Estado ──────────────────────────────────────────────────────────────
    loading       = signal(true);
    cotizaciones  = signal<CotizacionItem[]>([]);
    searchQuery   = signal('');
    filtroEstado  = signal('TODOS');

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
        return 'S/ ' + n.toFixed(2);
    }
}
