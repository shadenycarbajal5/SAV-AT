import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../api/api';
import { apiventagetall } from '../../api/functions';
import { AuthService } from '../../service/auth.service';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';

// ── Datos de la empresa ────────────────────────────────────────────────────────
const EMPRESA = {
    razonSocial:  'CENTRO DE SERVICIOS AIBIL TECHNOLOGY E.I.R.L',
    ruc:          '20610820361',
    direccion:    'Jr. Apurímac Nro. 606 Urb. Pueblo Libre',
    ubigeo:       'Apurímac - Abancay - Abancay',
    telefono:     '',
    correo:       '',
};

export interface VentaItem {
    idVenta:      number;
    fecha:        string;
    subtotal:     number;
    descuento:    number;
    total:        number;
    metodoPago:   string | null;
    idCliente:    number | null;
    clienteNombre: string | null;
    idUsuario:    number | null;
    usuarioNombre: string | null;
}

interface DetalleItem {
    idDetalle:      number;
    nombreProducto: string;
    cantidad:       number;
    precioUnitario: number;
    subtotal:       number;
}

@Component({
    selector: 'app-facturas',
    standalone: true,
    imports: [
        CommonModule, FormsModule,
        TableModule, ButtonModule, InputTextModule,
        ToastModule, IconFieldModule, InputIconModule,
        SelectModule, TagModule, DialogModule
    ],
    templateUrl: './facturas.html',
    styleUrl: './facturas.css'
})
export class Facturas implements OnInit {

    private api            = inject(Api) as Api;
    private auth           = inject(AuthService) as AuthService;
    private messageService = inject(MessageService) as MessageService;

    empresa = EMPRESA;

    // ── Estado ─────────────────────────────────────────────────────────────────
    loading         = signal(true);
    generando       = signal(false);
    ventas          = signal<VentaItem[]>([]);
    searchQuery     = signal('');
    filtroTipo      = signal<'TODOS' | 'BOLETA' | 'FACTURA'>('TODOS');

    // Preview dialog
    previewVisible  = signal(false);
    previewVenta    = signal<VentaItem | null>(null);
    previewDetalle  = signal<DetalleItem[]>([]);
    previewTipo     = signal<'BOLETA' | 'FACTURA'>('BOLETA');
    loadingDetalle  = signal(false);

    // ── Filtros ────────────────────────────────────────────────────────────────
    ventasFiltradas = computed(() => {
        const q = this.searchQuery().toLowerCase().trim();
        return this.ventas().filter(v => {
            const matchQ = !q ||
                String(v.idVenta).includes(q) ||
                (v.clienteNombre ?? '').toLowerCase().includes(q) ||
                (v.usuarioNombre ?? '').toLowerCase().includes(q);
            return matchQ;
        });
    });

    tipoOpciones = [
        { label: 'Todos',   value: 'TODOS'   },
        { label: 'Boleta',  value: 'BOLETA'  },
        { label: 'Factura', value: 'FACTURA' },
    ];

    // ── KPIs ───────────────────────────────────────────────────────────────────
    get totalVentas()   { return this.ventas().length; }
    get totalIngresos() { return this.ventas().reduce((s, v) => s + v.total, 0); }

    // ── Ciclo de vida ──────────────────────────────────────────────────────────
    async ngOnInit(): Promise<void> {
        await this.loadVentas();
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

    // ── Preview ────────────────────────────────────────────────────────────────
    abrirPreview(venta: VentaItem, tipo: 'BOLETA' | 'FACTURA'): void {
        this.previewVenta.set(venta);
        this.previewTipo.set(tipo);
        this.previewVisible.set(true);
        this.loadingDetalle.set(false);

        // Fila resumen basada en los totales de la venta
        // (cuando el backend exponga GET /venta/detalle/{id} se puede conectar aquí)
        this.previewDetalle.set([{
            idDetalle:      venta.idVenta,
            nombreProducto: 'Productos / Servicios vendidos',
            cantidad:       1,
            precioUnitario: venta.subtotal,
            subtotal:       venta.subtotal,
        }]);
    }

    closePreview(): void {
        this.previewVisible.set(false);
    }

    // ── Generación PDF ─────────────────────────────────────────────────────────
    imprimirFactura(): void {
        const venta  = this.previewVenta();
        const tipo   = this.previewTipo();
        const detalle = this.previewDetalle();
        if (!venta) return;

        this.generando.set(true);

        const igv        = +(venta.subtotal * 0.18).toFixed(2);
        const baseImpon  = +(venta.subtotal - igv).toFixed(2);
        const numDoc     = `${tipo === 'BOLETA' ? 'B' : 'F'}001-${String(venta.idVenta).padStart(6, '0')}`;
        const fecha      = this.formatFechaLarga(venta.fecha);
        const fechaEmision = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const filas = detalle.map(d => `
            <tr>
                <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;">${d.nombreProducto}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:center;">${d.cantidad}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:right;">S/ ${(+d.precioUnitario).toFixed(2)}</td>
                <td style="padding:6px 8px;border-bottom:1px solid #f0f0f0;text-align:right;">S/ ${(+d.subtotal).toFixed(2)}</td>
            </tr>`).join('');

        const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<title>${tipo} ${numDoc}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 12px; color: #222; background:#fff; }
  .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 16mm 14mm; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:24px; padding-bottom:16px; border-bottom:3px solid #1a5fd4; }
  .empresa-logo { display:flex; align-items:center; gap:12px; }
  .logo-box { width:54px; height:54px; background:linear-gradient(135deg,#1a5fd4,#0d3a8a); border-radius:10px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:22px; font-weight:900; flex-shrink:0; }
  .empresa-info h2 { font-size:13px; font-weight:700; color:#0a1628; max-width:260px; line-height:1.3; }
  .empresa-info p  { font-size:11px; color:#555; margin-top:2px; }
  .doc-box { text-align:center; border:2px solid #1a5fd4; border-radius:8px; padding:10px 20px; min-width:170px; }
  .doc-tipo { font-size:13px; font-weight:700; color:#1a5fd4; letter-spacing:1px; }
  .doc-num  { font-size:15px; font-weight:900; color:#0a1628; margin-top:4px; }
  .doc-meta { font-size:10px; color:#777; margin-top:6px; }
  .seccion { margin-bottom:16px; }
  .seccion-titulo { font-size:10px; font-weight:700; color:#1a5fd4; text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; border-bottom:1px solid #e0e8ff; padding-bottom:3px; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px 24px; }
  .info-row  { display:flex; gap:6px; font-size:11px; }
  .info-label{ color:#777; min-width:90px; }
  .info-val  { color:#111; font-weight:600; }
  table.detalle { width:100%; border-collapse:collapse; margin-bottom:16px; }
  table.detalle thead tr { background:#1a5fd4; color:#fff; }
  table.detalle thead th { padding:8px; font-size:11px; font-weight:600; }
  table.detalle tbody tr:nth-child(even) { background:#f8faff; }
  .totales { margin-left:auto; width:240px; }
  .totales-row { display:flex; justify-content:space-between; padding:5px 0; font-size:12px; border-bottom:1px solid #f0f0f0; }
  .totales-row.gran-total { font-weight:700; font-size:14px; color:#1a5fd4; border-top:2px solid #1a5fd4; border-bottom:none; padding-top:8px; margin-top:4px; }
  .totales-row.descuento { color:#e63946; }
  .footer { margin-top:32px; padding-top:12px; border-top:1px dashed #ccc; display:flex; justify-content:space-between; align-items:flex-end; }
  .footer-msg { font-size:10px; color:#888; max-width:200px; }
  .footer-firma { text-align:center; font-size:10px; color:#555; }
  .firma-line { width:160px; border-top:1px solid #333; margin:0 auto 4px; }
  .metodo-badge { display:inline-block; background:#dbeafe; color:#1a5fd4; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:700; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { padding: 10mm 10mm; }
    .no-print { display:none; }
  }
</style>
</head>
<body>
<div class="page">

  <!-- CABECERA -->
  <div class="header">
    <div class="empresa-logo">
      <div class="logo-box">AT</div>
      <div class="empresa-info">
        <h2>${EMPRESA.razonSocial}</h2>
        <p>RUC: ${EMPRESA.ruc}</p>
        <p>${EMPRESA.direccion}</p>
        <p>${EMPRESA.ubigeo}</p>
      </div>
    </div>
    <div class="doc-box">
      <div class="doc-tipo">${tipo}</div>
      <div class="doc-tipo" style="font-size:11px;font-weight:500;margin-top:2px;">ELECTRÓNICA</div>
      <div class="doc-num">${numDoc}</div>
      <div class="doc-meta">Emisión: ${fechaEmision}</div>
    </div>
  </div>

  <!-- DATOS DEL CLIENTE -->
  <div class="seccion">
    <div class="seccion-titulo">Datos del cliente</div>
    <div class="info-grid">
      <div class="info-row">
        <span class="info-label">${tipo === 'FACTURA' ? 'Razón Social' : 'Cliente'}:</span>
        <span class="info-val">${venta.clienteNombre ?? 'CONSUMIDOR FINAL'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Fecha Venta:</span>
        <span class="info-val">${fecha}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Vendedor:</span>
        <span class="info-val">${venta.usuarioNombre ?? '—'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Método Pago:</span>
        <span class="info-val"><span class="metodo-badge">${this.metodoLabel(venta.metodoPago)}</span></span>
      </div>
    </div>
  </div>

  <!-- DETALLE DE PRODUCTOS -->
  <div class="seccion">
    <div class="seccion-titulo">Detalle de productos</div>
    <table class="detalle">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px;">Descripción</th>
          <th style="text-align:center;width:60px;">Cant.</th>
          <th style="text-align:right;width:100px;">P. Unitario</th>
          <th style="text-align:right;width:110px;">Importe</th>
        </tr>
      </thead>
      <tbody>
        ${filas}
      </tbody>
    </table>

    <!-- TOTALES -->
    <div class="totales">
      <div class="totales-row">
        <span>OP. GRAVADA (${tipo === 'FACTURA' ? 'Base imponible' : 'Subtotal'})</span>
        <span>S/ ${baseImpon.toFixed(2)}</span>
      </div>
      <div class="totales-row">
        <span>IGV (18%)</span>
        <span>S/ ${igv.toFixed(2)}</span>
      </div>
      ${venta.descuento > 0 ? `
      <div class="totales-row descuento">
        <span>DESCUENTO</span>
        <span>- S/ ${(+venta.descuento).toFixed(2)}</span>
      </div>` : ''}
      <div class="totales-row gran-total">
        <span>TOTAL A PAGAR</span>
        <span>S/ ${(+venta.total).toFixed(2)}</span>
      </div>
    </div>
  </div>

  <!-- SON -->
  <div style="font-size:11px;color:#555;margin-top:8px;font-style:italic;">
    Son: <strong>${this.totalEnLetras(venta.total)}</strong>
  </div>

  <!-- PIE -->
  <div class="footer">
    <div class="footer-msg">
      <strong>Gracias por su preferencia.</strong><br/>
      Este comprobante fue generado por el sistema SAV-AT.<br/>
      ${EMPRESA.razonSocial}
    </div>
    <div class="footer-firma">
      <div class="firma-line"></div>
      <div>${EMPRESA.razonSocial}</div>
      <div style="color:#aaa;font-size:9px;">Firma y Sello</div>
    </div>
  </div>

</div>
<script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

        const win = window.open('', '_blank', 'width=900,height=700');
        if (win) {
            win.document.write(html);
            win.document.close();
        } else {
            this.messageService.add({ severity: 'warn', summary: 'Bloqueado', detail: 'Permite ventanas emergentes para imprimir.' });
        }

        this.generando.set(false);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    formatFecha(fecha: string): string {
        if (!fecha) return '—';
        return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    formatFechaLarga(fecha: string): string {
        if (!fecha) return '—';
        return new Date(fecha).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
    }

    formatMonto(n: number): string { return 'S/ ' + (+n).toFixed(2); }

    metodoLabel(m: string | null): string {
        const map: Record<string, string> = {
            EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta',
            TRANSFERENCIA: 'Transferencia', YAPE: 'Yape', PLIN: 'Plin'
        };
        return m ? (map[m] ?? m) : '—';
    }

    metodoBadge(m: string | null): 'success' | 'info' | 'warn' | 'secondary' {
        switch (m) {
            case 'EFECTIVO': return 'success';
            case 'TARJETA':  return 'info';
            case 'TRANSFERENCIA': return 'warn';
            default: return 'secondary';
        }
    }

    totalEnLetras(total: number): string {
        const entero   = Math.floor(total);
        const centavos = Math.round((total - entero) * 100);
        return `${entero} con ${String(centavos).padStart(2, '0')}/100 SOLES`;
    }

    get canView(): boolean {
        const r = this.auth.getRol();
        return r === 'ADMINISTRADOR' || r === 'VENDEDOR';
    }
}
