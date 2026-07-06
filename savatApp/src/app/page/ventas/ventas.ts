import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Api } from '../../api/api';
import { apiventagetall, apiclientegetall, apiproductogetall } from '../../api/functions';
import { apiventainsert, Apiventainsert$Params } from '../../api/fn/operations/apiventainsert';
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
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';

export interface VentaItem {
    idVenta: number;
    fecha: string;
    subtotal: number;
    descuento: number;
    total: number;
    metodoPago: string | null;
    idCliente: number | null;
    clienteNombre: string | null;
    idUsuario: number | null;
    usuarioNombre: string | null;
}

export interface ProductoOpt {
    idProducto: number;
    nombre: string;
    precioVenta: number | null;
    stock: number | null;
    tipoProducto: string | null;
}

export interface ClienteOpt {
    idCliente: number;
    nombres: string;
}

export interface CarritoItem {
    idProducto: number;
    nombre: string;
    precioUnitario: number;
    cantidad: number;
    stockDisponible: number;
}

@Component({
    selector: 'app-ventas',
    standalone: true,
    imports: [
        CommonModule, FormsModule, ReactiveFormsModule,
        TableModule, ButtonModule, InputTextModule,
        ToastModule, IconFieldModule, InputIconModule,
        TagModule, SelectModule, DialogModule,
        InputNumberModule, DividerModule
    ],
    templateUrl: './ventas.html',
    styleUrl: './ventas.css'
})
export class Ventas implements OnInit {

    private api            = inject(Api) as Api;
    private auth           = inject(AuthService) as AuthService;
    private messageService = inject(MessageService) as MessageService;
    private fb             = inject(FormBuilder) as FormBuilder;

    // ── Estado ───────────────────────────────────────────────────────────────
    loading      = signal(true);
    saving       = signal(false);
    ventas       = signal<VentaItem[]>([]);
    searchQuery  = signal('');
    filtroMetodo = signal('TODOS');

    // ── Catálogos ─────────────────────────────────────────────────────────────
    productos = signal<ProductoOpt[]>([]);
    clientes  = signal<ClienteOpt[]>([]);

    // ── Diálogo nueva venta ───────────────────────────────────────────────────
    dialogVisible    = signal(false);
    carrito          = signal<CarritoItem[]>([]);
    productoSelec    = signal<ProductoOpt | null>(null);
    cantidadSelec    = signal<number>(1);

    // ── Formulario checkout ───────────────────────────────────────────────────
    form: FormGroup = this.fb.group({
        idCliente:  [null],
        metodoPago: ['EFECTIVO', Validators.required],
        descuento:  [0, [Validators.min(0)]],
    });

    // ── Opciones ──────────────────────────────────────────────────────────────
    metodoOpciones = [
        { label: 'Todos',         value: 'TODOS'         },
        { label: 'Efectivo',      value: 'EFECTIVO'      },
        { label: 'Tarjeta',       value: 'TARJETA'       },
        { label: 'Transferencia', value: 'TRANSFERENCIA' },
        { label: 'Yape/Plin',     value: 'YAPE'          },
    ];

    metodoFormOpciones = [
        { label: 'Efectivo',      value: 'EFECTIVO'      },
        { label: 'Tarjeta',       value: 'TARJETA'       },
        { label: 'Transferencia', value: 'TRANSFERENCIA' },
        { label: 'Yape',          value: 'YAPE'          },
        { label: 'Plin',          value: 'PLIN'          },
    ];

    // ── Solo productos tipo VENTA con stock ───────────────────────────────────
    productosVenta = computed(() =>
        this.productos().filter(p => p.tipoProducto === 'VENTA' && (p.stock ?? 0) > 0)
    );

    // ── Filtro historial ──────────────────────────────────────────────────────
    ventasFiltradas = computed(() => {
        const q      = this.searchQuery().toLowerCase().trim();
        const metodo = this.filtroMetodo();
        return this.ventas().filter(v => {
            const matchQ = !q ||
                (v.clienteNombre ?? '').toLowerCase().includes(q) ||
                String(v.idVenta).includes(q) ||
                (v.usuarioNombre ?? '').toLowerCase().includes(q);
            const matchM = metodo === 'TODOS' || (v.metodoPago ?? '') === metodo;
            return matchQ && matchM;
        });
    });

    // ── KPIs ──────────────────────────────────────────────────────────────────
    get totalVentas():    number { return this.ventas().length; }
    get ingresoTotal():   number { return this.ventas().reduce((s, v) => s + v.total, 0); }
    get descuentoTotal(): number { return this.ventas().reduce((s, v) => s + v.descuento, 0); }
    get ticketPromedio(): number {
        return this.ventas().length ? this.ingresoTotal / this.ventas().length : 0;
    }

    // ── Totales carrito ───────────────────────────────────────────────────────
    get subtotalCarrito(): number {
        return this.carrito().reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
    }
    get descuentoForm(): number { return Number(this.form.value.descuento ?? 0); }
    get totalCarrito():  number { return Math.max(0, this.subtotalCarrito - this.descuentoForm); }
    get carritoVacio():  boolean { return this.carrito().length === 0; }

    // ── Ciclo de vida ─────────────────────────────────────────────────────────
    async ngOnInit(): Promise<void> {
        await Promise.all([this.loadVentas(), this.loadCatalogos()]);
    }

    async loadVentas(): Promise<void> {
        this.loading.set(true);
        try {
            const resp: any = await this.api.invoke(apiventagetall);
            this.ventas.set(resp?.data ?? []);
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar las ventas.' });
        } finally {
            this.loading.set(false);
        }
    }

    async loadCatalogos(): Promise<void> {
        try {
            const [rProd, rCli]: any[] = await Promise.all([
                this.api.invoke(apiproductogetall),
                this.api.invoke(apiclientegetall),
            ]);
            this.productos.set(rProd?.data ?? []);
            this.clientes.set(rCli?.data ?? []);
        } catch { /* no-op */ }
    }

    // ── Diálogo ───────────────────────────────────────────────────────────────
    openNuevaVenta(): void {
        this.carrito.set([]);
        this.productoSelec.set(null);
        this.cantidadSelec.set(1);
        this.form.reset({ metodoPago: 'EFECTIVO', descuento: 0, idCliente: null });
        this.loadCatalogos(); // refresca stock
        this.dialogVisible.set(true);
    }

    // ── Carrito ───────────────────────────────────────────────────────────────
    agregarAlCarrito(): void {
        const prod = this.productoSelec();
        const cant = this.cantidadSelec();
        if (!prod || cant < 1) return;

        const existente = this.carrito().find(i => i.idProducto === prod.idProducto);
        const yaEnCarrito = existente?.cantidad ?? 0;

        if (yaEnCarrito + cant > (prod.stock ?? 0)) {
            this.messageService.add({
                severity: 'warn', summary: 'Stock insuficiente',
                detail: `Solo hay ${prod.stock ?? 0} unidades disponibles de "${prod.nombre}".`
            });
            return;
        }

        if (existente) {
            this.carrito.update(c => c.map(i =>
                i.idProducto === prod.idProducto
                    ? { ...i, cantidad: i.cantidad + cant }
                    : i
            ));
        } else {
            this.carrito.update(c => [...c, {
                idProducto:      prod.idProducto,
                nombre:          prod.nombre,
                precioUnitario:  prod.precioVenta ?? 0,
                cantidad:        cant,
                stockDisponible: prod.stock ?? 0,
            }]);
        }

        this.productoSelec.set(null);
        this.cantidadSelec.set(1);
    }

    quitarDelCarrito(idProducto: number): void {
        this.carrito.update(c => c.filter(i => i.idProducto !== idProducto));
    }

    setCantidad(idProducto: number, nuevaCantidad: number): void {
        const item = this.carrito().find(i => i.idProducto === idProducto);
        if (!item) return;
        if (nuevaCantidad < 1) { this.quitarDelCarrito(idProducto); return; }
        if (nuevaCantidad > item.stockDisponible) {
            this.messageService.add({
                severity: 'warn', summary: 'Stock insuficiente',
                detail: `Máximo disponible: ${item.stockDisponible}`
            });
            return;
        }
        this.carrito.update(c => c.map(i =>
            i.idProducto === idProducto ? { ...i, cantidad: nuevaCantidad } : i
        ));
    }

    // ── Confirmar venta ───────────────────────────────────────────────────────
    async confirmarVenta(): Promise<void> {
        if (this.carritoVacio) {
            this.messageService.add({ severity: 'warn', summary: 'Carrito vacío', detail: 'Agrega al menos un producto.' });
            return;
        }
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }

        this.saving.set(true);
        const v    = this.form.value;
        const sess = this.auth.getSession()!;

        try {
            const params: Apiventainsert$Params = {
                body: {
                    idUsuario:  sess.idUsuario,
                    idCliente:  v.idCliente ?? null,
                    metodoPago: v.metodoPago,
                    descuento:  this.descuentoForm > 0 ? this.descuentoForm : null,
                    detalle:    this.carrito().map(i => ({ idProducto: i.idProducto, cantidad: i.cantidad })),
                }
            };
            const resp: any = await this.api.invoke(apiventainsert, params);
            if (resp?.type !== 'success') {
                this.messageService.add({ severity: 'warn', summary: 'Atención', detail: resp?.listMessage?.[0] ?? 'No se pudo registrar la venta.' });
                return;
            }
            this.messageService.add({
                severity: 'success', summary: '¡Venta registrada!',
                detail: `Total: ${this.formatMonto(this.totalCarrito)} — #${resp.idVenta}`
            });
            this.dialogVisible.set(false);
            await this.loadVentas();
            await this.loadCatalogos();
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo registrar la venta.' });
        } finally {
            this.saving.set(false);
        }
    }

    // ── Permisos ──────────────────────────────────────────────────────────────
    get canSell(): boolean {
        const r = this.auth.getRol();
        return r === 'VENDEDOR' || r === 'ADMINISTRADOR';
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    metodoBadge(metodo: string | null): 'success' | 'info' | 'warn' | 'secondary' {
        switch (metodo) {
            case 'EFECTIVO':      return 'success';
            case 'TARJETA':       return 'info';
            case 'TRANSFERENCIA': return 'warn';
            default:              return 'secondary';
        }
    }

    metodoLabel(metodo: string | null): string {
        const m: Record<string, string> = {
            EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta',
            TRANSFERENCIA: 'Transferencia', YAPE: 'Yape', PLIN: 'Plin'
        };
        return metodo ? (m[metodo] ?? metodo) : '—';
    }

    formatFecha(fecha: string): string {
        if (!fecha) return '—';
        return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    formatMonto(n: number): string { return 'S/ ' + n.toFixed(2); }
}
