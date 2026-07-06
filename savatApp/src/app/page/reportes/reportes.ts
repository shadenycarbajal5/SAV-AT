import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api/api';
import {
    apiventagetall, apiordenserviciogetall,
    apicotizaciongetall, apiproductogetall
} from '../../api/functions';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

// ── Tipos de datos ────────────────────────────────────────────────────────────
export interface VentaItem {
    idVenta: number; fecha: string; subtotal: number;
    descuento: number; total: number; metodoPago: string | null;
    clienteNombre: string | null; usuarioNombre: string | null;
}
export interface OrdenItem {
    idOs: number; fechaIngreso: string; estado: string | null;
    clienteNombre: string | null; usuarioNombre: string | null;
    equipoDescripcion: string | null;
}
export interface CotizacionItem {
    idCotizacion: number; fecha: string; estado: string | null;
    total: number; clienteNombre: string | null;
}
export interface ProductoItem {
    idProducto: number; nombre: string; stock: number | null;
    stockMinimo: number | null; precioVenta: number | null;
    costo: number | null; tipoProducto: string | null;
    categoriaProductoNombre: string | null;
}

// ── Helpers de gráficos SVG ───────────────────────────────────────────────────
export interface BarData { label: string; value: number; color: string; }

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule, FormsModule, ToastModule, SelectModule, ButtonModule],
    templateUrl: './reportes.html',
    styleUrl: './reportes.css'
})
export class Reportes implements OnInit {

    private api            = inject(Api) as Api;
    private messageService = inject(MessageService) as MessageService;

    // ── Estado de carga ───────────────────────────────────────────────────────
    loading = signal(true);

    // ── Datos crudos ──────────────────────────────────────────────────────────
    ventas      = signal<VentaItem[]>([]);
    ordenes     = signal<OrdenItem[]>([]);
    cotizaciones = signal<CotizacionItem[]>([]);
    productos   = signal<ProductoItem[]>([]);

    // ── Filtro período ventas ─────────────────────────────────────────────────
    periodoVentas = signal('MES');
    periodoOpciones = [
        { label: 'Esta semana', value: 'SEMANA' },
        { label: 'Este mes',    value: 'MES'    },
        { label: 'Este año',    value: 'ANIO'   },
        { label: 'Todo',        value: 'TODO'   },
    ];

    // ── Tab activo ────────────────────────────────────────────────────────────
    tabActivo = signal<'ventas' | 'reparaciones' | 'inventario' | 'cotizaciones'>('ventas');

    // ═══════════════════════════════════════════════════════════════════════════
    // ── COMPUTED: VENTAS ──────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    ventasFiltradas = computed(() => {
        const hoy   = new Date();
        const vents = this.ventas();
        const p     = this.periodoVentas();
        return vents.filter(v => {
            const f = new Date(v.fecha);
            if (p === 'SEMANA') {
                const lunes = new Date(hoy);
                lunes.setDate(hoy.getDate() - hoy.getDay() + 1);
                lunes.setHours(0,0,0,0);
                return f >= lunes;
            }
            if (p === 'MES')  return f.getMonth() === hoy.getMonth() && f.getFullYear() === hoy.getFullYear();
            if (p === 'ANIO') return f.getFullYear() === hoy.getFullYear();
            return true;
        });
    });

    get ingresoFiltrado(): number { return this.ventasFiltradas().reduce((s,v) => s + v.total, 0); }
    get descuentoFiltrado(): number { return this.ventasFiltradas().reduce((s,v) => s + v.descuento, 0); }
    get ticketPromedio(): number {
        const vf = this.ventasFiltradas();
        return vf.length ? this.ingresoFiltrado / vf.length : 0;
    }

    // Ventas por método de pago
    ventasPorMetodo = computed((): BarData[] => {
        const map: Record<string, number> = {};
        for (const v of this.ventasFiltradas()) {
            const m = v.metodoPago ?? 'OTRO';
            map[m] = (map[m] ?? 0) + v.total;
        }
        const colores: Record<string, string> = {
            EFECTIVO: '#2dc653', TARJETA: '#1a5fd4',
            TRANSFERENCIA: '#f59e0b', YAPE: '#7c3aed', PLIN: '#0ea5e9', OTRO: '#8099c4'
        };
        return Object.entries(map).map(([k, v]) => ({
            label: this.metodoLabel(k), value: v, color: colores[k] ?? '#8099c4'
        })).sort((a,b) => b.value - a.value);
    });

    // Ventas por día (últimos 7 días)
    ventasPorDia = computed((): BarData[] => {
        const dias: BarData[] = [];
        const hoy = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(hoy);
            d.setDate(hoy.getDate() - i);
            d.setHours(0,0,0,0);
            const next = new Date(d); next.setDate(d.getDate() + 1);
            const total = this.ventas()
                .filter(v => { const f = new Date(v.fecha); return f >= d && f < next; })
                .reduce((s,v) => s + v.total, 0);
            dias.push({
                label: d.toLocaleDateString('es-PE', { weekday: 'short', day: '2-digit' }),
                value: total,
                color: '#1a5fd4'
            });
        }
        return dias;
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ── COMPUTED: REPARACIONES ────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    get totalOrdenes(): number  { return this.ordenes().length; }
    get ordenesActivas(): number {
        return this.ordenes().filter(o => ['RECIBIDO','DIAGNOSTICO','REPARACION','LISTO'].includes(o.estado ?? '')).length;
    }
    get ordenesEntregadas(): number { return this.ordenes().filter(o => o.estado === 'ENTREGADO').length; }
    get ordenesCanceladas(): number { return this.ordenes().filter(o => o.estado === 'CANCELADO').length; }

    ordenesPorEstado = computed((): BarData[] => {
        const estados = ['RECIBIDO','DIAGNOSTICO','REPARACION','LISTO','ENTREGADO','CANCELADO'];
        const labels: Record<string,string> = {
            RECIBIDO:'Recibido', DIAGNOSTICO:'Diagnóstico', REPARACION:'Reparación',
            LISTO:'Listo', ENTREGADO:'Entregado', CANCELADO:'Cancelado'
        };
        const colores: Record<string,string> = {
            RECIBIDO:'#8099c4', DIAGNOSTICO:'#0ea5e9', REPARACION:'#f59e0b',
            LISTO:'#2dc653', ENTREGADO:'#1a5fd4', CANCELADO:'#e63946'
        };
        return estados.map(e => ({
            label: labels[e],
            value: this.ordenes().filter(o => o.estado === e).length,
            color: colores[e]
        })).filter(d => d.value > 0);
    });

    // Técnicos con más órdenes
    tecnicosMasActivos = computed((): { nombre: string; total: number }[] => {
        const map: Record<string, number> = {};
        for (const o of this.ordenes()) {
            const n = o.usuarioNombre ?? 'Sin asignar';
            map[n] = (map[n] ?? 0) + 1;
        }
        return Object.entries(map)
            .map(([nombre, total]) => ({ nombre, total }))
            .sort((a,b) => b.total - a.total)
            .slice(0, 5);
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ── COMPUTED: INVENTARIO ──────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    get totalProductos(): number { return this.productos().length; }
    get productosStockBajo(): ProductoItem[] {
        return this.productos().filter(p =>
            p.stock !== null && p.stockMinimo !== null && p.stock <= p.stockMinimo
        );
    }
    get productosAgotados(): ProductoItem[] {
        return this.productos().filter(p => (p.stock ?? 0) === 0);
    }
    get valorInventario(): number {
        return this.productos().reduce((s,p) => s + ((p.stock ?? 0) * (p.costo ?? 0)), 0);
    }

    productosPorCategoria = computed((): BarData[] => {
        const map: Record<string, number> = {};
        for (const p of this.productos()) {
            const c = p.categoriaProductoNombre ?? 'Sin categoría';
            map[c] = (map[c] ?? 0) + 1;
        }
        const palette = ['#1a5fd4','#2dc653','#f59e0b','#7c3aed','#0ea5e9','#e63946','#8099c4'];
        return Object.entries(map)
            .map(([label, value], i) => ({ label, value, color: palette[i % palette.length] }))
            .sort((a,b) => b.value - a.value);
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ── COMPUTED: COTIZACIONES ────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    get totalCotizaciones(): number { return this.cotizaciones().length; }
    get cotizacionesAprobadas(): number { return this.cotizaciones().filter(c => c.estado === 'APROBADA').length; }
    get cotizacionesPendientes(): number { return this.cotizaciones().filter(c => c.estado === 'PENDIENTE').length; }
    get tasaConversion(): number {
        const t = this.totalCotizaciones;
        return t ? Math.round((this.cotizacionesAprobadas / t) * 100) : 0;
    }
    get totalCotizado(): number { return this.cotizaciones().reduce((s,c) => s + c.total, 0); }

    cotizacionesPorEstado = computed((): BarData[] => {
        const estados = ['PENDIENTE','APROBADA','RECHAZADA','CONVERTIDA'];
        const colores: Record<string,string> = {
            PENDIENTE:'#f59e0b', APROBADA:'#2dc653', RECHAZADA:'#e63946', CONVERTIDA:'#0ea5e9'
        };
        return estados.map(e => ({
            label: e.charAt(0) + e.slice(1).toLowerCase(),
            value: this.cotizaciones().filter(c => c.estado === e).length,
            color: colores[e]
        })).filter(d => d.value > 0);
    });

    // ═══════════════════════════════════════════════════════════════════════════
    // ── Ciclo de vida ─────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    async ngOnInit(): Promise<void> {
        await this.loadAll();
    }

    async loadAll(): Promise<void> {
        this.loading.set(true);
        try {
            const [rv, ro, rc, rp]: any[] = await Promise.all([
                this.api.invoke(apiventagetall),
                this.api.invoke(apiordenserviciogetall),
                this.api.invoke(apicotizaciongetall),
                this.api.invoke(apiproductogetall),
            ]);
            this.ventas.set(rv?.data ?? []);
            this.ordenes.set(ro?.data ?? []);
            this.cotizaciones.set(rc?.data ?? []);
            this.productos.set(rp?.data ?? []);
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los datos de reportes.' });
        } finally {
            this.loading.set(false);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ── SVG gráficos ──────────────────────────────────────────────────────────
    // ═══════════════════════════════════════════════════════════════════════════

    // Barras horizontales SVG
    barMaxValue(data: BarData[]): number {
        return Math.max(...data.map(d => d.value), 1);
    }

    barWidth(value: number, max: number, totalWidth = 260): number {
        return Math.max(4, (value / max) * totalWidth);
    }

    // Dona SVG (para estados)
    donutSegments(data: BarData[]): { d: string; color: string; label: string; value: number }[] {
        const total = data.reduce((s,d) => s + d.value, 0);
        if (total === 0) return [];
        const cx = 80, cy = 80, r = 60, innerR = 38;
        let startAngle = -Math.PI / 2;
        return data.map(item => {
            const slice = (item.value / total) * 2 * Math.PI;
            const endAngle = startAngle + slice;
            const x1 = cx + r * Math.cos(startAngle);
            const y1 = cy + r * Math.sin(startAngle);
            const x2 = cx + r * Math.cos(endAngle);
            const y2 = cy + r * Math.sin(endAngle);
            const ix1 = cx + innerR * Math.cos(endAngle);
            const iy1 = cy + innerR * Math.sin(endAngle);
            const ix2 = cx + innerR * Math.cos(startAngle);
            const iy2 = cy + innerR * Math.sin(startAngle);
            const large = slice > Math.PI ? 1 : 0;
            const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z`;
            const result = { d, color: item.color, label: item.label, value: item.value };
            startAngle = endAngle;
            return result;
        });
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    formatMonto(n: number): string { return 'S/ ' + n.toFixed(2); }
    metodoLabel(m: string): string {
        const map: Record<string,string> = {
            EFECTIVO:'Efectivo', TARJETA:'Tarjeta',
            TRANSFERENCIA:'Transferencia', YAPE:'Yape', PLIN:'Plin'
        };
        return map[m] ?? m;
    }
}
