import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Api } from '../../api/api';
import { apiproductogetall } from '../../api/functions';
import { apiproductoinsert, Apiproductoinsert$Params } from '../../api/fn/operations/apiproductoinsert';
import { apiproductoupdate, Apiproductoupdate$Params } from '../../api/fn/operations/apiproductoupdate';
import { apiproductodelete, Apiproductodelete$Params } from '../../api/fn/operations/apiproductodelete';
import { apicategoriaproductogetall } from '../../api/fn/operations/apicategoriaproductogetall';
import { apiproveedorgetall } from '../../api/fn/operations/apiproveedorgetall';
import { AuthService } from '../../service/auth.service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TextareaModule } from 'primeng/textarea';
import { TagModule } from 'primeng/tag';

export interface ProductoItem {
    idProducto: number;
    nombre: string;
    descripcion: string | null;
    precioVenta: number | null;
    costo: number | null;
    stock: number | null;
    stockMinimo: number | null;
    codigoBarras: string | null;
    tipoProducto: 'VENTA' | 'REPUESTO' | null;
    estado: boolean | null;
    idCategoriaProducto: number | null;
    categoriaProductoNombre: string | null;
    idProveedor: number | null;
    proveedorNombre: string | null;
}

interface CategoriaProducto { idCategoriaProducto: number; nombre: string; }
interface Proveedor        { idProveedor: number; nombre: string; }

@Component({
    selector: 'app-inventario',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        DialogModule,
        SelectModule,
        ToggleSwitchModule,
        ConfirmDialogModule,
        ToastModule,
        IconFieldModule,
        InputIconModule,
        TextareaModule,
        TagModule
    ],
    templateUrl: './inventario.html',
    styleUrl: './inventario.css'
})
export class Inventario implements OnInit {

    private api            = inject(Api) as Api;
    private auth           = inject(AuthService) as AuthService;
    private messageService = inject(MessageService) as MessageService;
    private confirmService = inject(ConfirmationService) as ConfirmationService;
    private fb             = inject(FormBuilder) as FormBuilder;

    // ── Estado ────────────────────────────────────────────────────────────
    loading       = signal(true);
    saving        = signal(false);
    productos     = signal<ProductoItem[]>([]);
    categorias    = signal<CategoriaProducto[]>([]);
    proveedores   = signal<Proveedor[]>([]);
    dialogVisible = signal(false);
    editingId     = signal<number | null>(null);
    searchQuery   = signal('');
    filtroTipo    = signal<string>('TODOS');
    filtroStock   = signal(false);

    // ── Permisos ──────────────────────────────────────────────────────────
    get canInsert(): boolean { return this.auth.getRol() === 'ADMINISTRADOR'; }
    get canEdit():   boolean {
        const rol = this.auth.getRol();
        return rol === 'ADMINISTRADOR' || rol === 'VENDEDOR';
    }
    get canDelete(): boolean { return this.auth.getRol() === 'ADMINISTRADOR'; }

    // ── Filtros combinados ────────────────────────────────────────────────
    productosFiltrados = computed(() => {
        const q     = this.searchQuery().toLowerCase().trim();
        const tipo  = this.filtroTipo();
        const stock = this.filtroStock();

        return this.productos().filter(p => {
            const matchQ    = !q ||
                p.nombre.toLowerCase().includes(q) ||
                (p.codigoBarras ?? '').toLowerCase().includes(q) ||
                (p.categoriaProductoNombre ?? '').toLowerCase().includes(q);
            const matchTipo = tipo === 'TODOS' || p.tipoProducto === tipo;
            const matchStock = !stock || (p.stock ?? 0) <= (p.stockMinimo ?? 0);
            return matchQ && matchTipo && matchStock;
        });
    });

    // ── Opciones de selects ───────────────────────────────────────────────
    tipoOpciones = [
        { label: 'Todos',    value: 'TODOS'   },
        { label: 'Venta',    value: 'VENTA'   },
        { label: 'Repuesto', value: 'REPUESTO' }
    ];

    tipoFormOpciones = [
        { label: 'Venta',    value: 'VENTA'   },
        { label: 'Repuesto', value: 'REPUESTO' }
    ];

    get categoriasOpciones() {
        return this.categorias().map(c => ({ label: c.nombre, value: c.idCategoriaProducto }));
    }
    get proveedoresOpciones() {
        return this.proveedores().map(p => ({ label: p.nombre, value: p.idProveedor }));
    }

    // ── Formulario ────────────────────────────────────────────────────────
    form: FormGroup = this.fb.group({
        nombre:              ['', [Validators.required, Validators.maxLength(150)]],
        descripcion:         [null],
        precioVenta:         [null, Validators.min(0)],
        costo:               [null, Validators.min(0)],
        stock:               [0,    Validators.min(0)],
        stockMinimo:         [0,    Validators.min(0)],
        codigoBarras:        [null, Validators.maxLength(50)],
        tipoProducto:        ['VENTA'],
        estado:              [true],
        idCategoriaProducto: [null],
        idProveedor:         [null]
    });

    get dialogTitle(): string { return this.editingId() ? 'Editar Producto' : 'Nuevo Producto'; }

    // ── Ciclo de vida ─────────────────────────────────────────────────────
    async ngOnInit(): Promise<void> {
        await Promise.all([
            this.loadProductos(),
            this.loadCategorias(),
            this.loadProveedores()
        ]);
    }

    // ── Carga ─────────────────────────────────────────────────────────────
    async loadProductos(): Promise<void> {
        this.loading.set(true);
        try {
            const resp: any = await this.api.invoke(apiproductogetall);
            this.productos.set(resp?.data ?? []);
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el inventario.' });
        } finally {
            this.loading.set(false);
        }
    }

    async loadCategorias(): Promise<void> {
        try {
            const resp: any = await this.api.invoke(apicategoriaproductogetall);
            this.categorias.set(resp?.data ?? []);
        } catch { /* silencioso */ }
    }

    async loadProveedores(): Promise<void> {
        try {
            const resp: any = await this.api.invoke(apiproveedorgetall);
            this.proveedores.set(resp?.data ?? []);
        } catch { /* silencioso */ }
    }

    // ── KPIs ──────────────────────────────────────────────────────────────
    get totalProductos():    number { return this.productos().length; }
    get bajoStock():         number { return this.productos().filter(p => (p.stock ?? 0) <= (p.stockMinimo ?? 0)).length; }
    get soloVenta():         number { return this.productos().filter(p => p.tipoProducto === 'VENTA').length; }
    get soloRepuesto():      number { return this.productos().filter(p => p.tipoProducto === 'REPUESTO').length; }

    // ── Acciones ──────────────────────────────────────────────────────────
    openNew(): void {
        this.editingId.set(null);
        this.form.reset({ stock: 0, stockMinimo: 0, tipoProducto: 'VENTA', estado: true });
        this.dialogVisible.set(true);
    }

    openEdit(p: ProductoItem): void {
        this.editingId.set(p.idProducto);
        this.form.patchValue({
            nombre:              p.nombre,
            descripcion:         p.descripcion,
            precioVenta:         p.precioVenta,
            costo:               p.costo,
            stock:               p.stock ?? 0,
            stockMinimo:         p.stockMinimo ?? 0,
            codigoBarras:        p.codigoBarras,
            tipoProducto:        p.tipoProducto ?? 'VENTA',
            estado:              p.estado ?? true,
            idCategoriaProducto: p.idCategoriaProducto,
            idProveedor:         p.idProveedor
        });
        this.dialogVisible.set(true);
    }

    closeDialog(): void {
        this.dialogVisible.set(false);
        this.form.reset({ stock: 0, stockMinimo: 0, tipoProducto: 'VENTA', estado: true });
    }

    async onSave(): Promise<void> {
        if (this.form.invalid) { this.form.markAllAsTouched(); return; }

        this.saving.set(true);
        const v = this.form.value;
        const body = {
            nombre:              v.nombre?.trim(),
            descripcion:         v.descripcion?.trim() || null,
            precioVenta:         v.precioVenta ?? null,
            costo:               v.costo ?? null,
            stock:               v.stock ?? 0,
            stockMinimo:         v.stockMinimo ?? 0,
            codigoBarras:        v.codigoBarras?.trim() || null,
            tipoProducto:        v.tipoProducto ?? null,
            estado:              v.estado ?? true,
            idCategoriaProducto: v.idCategoriaProducto ?? null,
            idProveedor:         v.idProveedor ?? null
        };

        try {
            let resp: any;
            if (this.editingId()) {
                const params: Apiproductoupdate$Params = { id: this.editingId()!, body };
                resp = await this.api.invoke(apiproductoupdate, params);
            } else {
                const params: Apiproductoinsert$Params = { body };
                resp = await this.api.invoke(apiproductoinsert, params);
            }

            if (resp?.type === 'success') {
                this.messageService.add({ severity: 'success', summary: 'Éxito', detail: resp.listMessage?.[0] ?? 'Operación exitosa.' });
                this.closeDialog();
                await this.loadProductos();
            } else {
                this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: resp?.listMessage?.[0] ?? 'Ocurrió un problema.' });
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo completar la operación.' });
        } finally {
            this.saving.set(false);
        }
    }

    confirmDelete(p: ProductoItem): void {
        this.confirmService.confirm({
            message: `¿Eliminar <strong>${p.nombre}</strong>? Esta acción no se puede deshacer.`,
            header: 'Confirmar eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sí, eliminar',
            rejectLabel: 'Cancelar',
            acceptButtonStyleClass: 'p-button-danger',
            accept: () => this.deleteProducto(p.idProducto)
        });
    }

    private async deleteProducto(id: number): Promise<void> {
        try {
            const params: Apiproductodelete$Params = { id };
            const resp: any = await this.api.invoke(apiproductodelete, params);
            if (resp?.type === 'success') {
                this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: resp.listMessage?.[0] ?? 'Producto eliminado.' });
                await this.loadProductos();
            } else {
                this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: resp?.listMessage?.[0] ?? 'No se pudo eliminar.' });
            }
        } catch {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el producto.' });
        }
    }

    // ── Helpers de UI ─────────────────────────────────────────────────────
    esBajoStock(p: ProductoItem): boolean {
        return (p.stock ?? 0) <= (p.stockMinimo ?? 0);
    }

    tipoLabel(tipo: string | null): string {
        return tipo === 'REPUESTO' ? 'Repuesto' : tipo === 'VENTA' ? 'Venta' : '—';
    }

    fieldError(field: string): boolean {
        const ctrl = this.form.get(field);
        return !!(ctrl?.invalid && ctrl?.touched);
    }

    fieldErrorMsg(field: string): string {
        const ctrl = this.form.get(field);
        if (!ctrl?.errors) return '';
        if (ctrl.errors['required'])  return 'Este campo es obligatorio.';
        if (ctrl.errors['min'])       return 'El valor no puede ser negativo.';
        if (ctrl.errors['maxlength']) return `Máximo ${ctrl.errors['maxlength'].requiredLength} caracteres.`;
        return '';
    }
}
